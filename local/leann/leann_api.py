#!/usr/bin/env python3
"""
API LEANN simple pour ShodoBot
Utilise Qdrant comme base de données vectorielle
"""

import os
import json
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import hashlib
import PyPDF2
import docx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Configuration
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
LEANN_DATA_DIR = os.getenv("LEANN_DATA_DIR", "/app/data")
DOCUMENTS_DIR = "/app/documents"

# Initialiser Qdrant
client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# Créer la collection si elle n'existe pas
COLLECTION_NAME = "shodobot-docs"
try:
    client.get_collection(COLLECTION_NAME)
    print(f"Collection {COLLECTION_NAME} already exists")
except:
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )
    print(f"Created collection {COLLECTION_NAME}")

# Fonction pour extraire le texte des documents
def extract_text(file_path):
    """Extrait le texte d'un document PDF, DOCX ou TXT"""
    try:
        if file_path.suffix.lower() == ".pdf":
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                text = "".join([page.extract_text() for page in reader.pages])
                return text
        elif file_path.suffix.lower() == ".docx":
            doc = docx.Document(file_path)
            return "".join([paragraph.text for paragraph in doc.paragraphs])
        elif file_path.suffix.lower() in [".txt", ".md"]:
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read()
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
    return ""

# Fonction pour créer des chunks de texte
def create_chunks(text, chunk_size=1000, overlap=200):
    """Divise le texte en chunks avec overlap"""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks

# Fonction pour créer un embedding simple
def create_simple_embedding(text, size=384):
    """Crée un embedding simple basé sur le hash du texte"""
    # Utilise le hash du texte pour créer un embedding pseudo-aléatoire
    text_hash = hash(text)
    embedding = []
    for i in range(size):
        # Utilise différentes parties du hash pour chaque dimension
        val = (text_hash + i * 31) % 1000 / 1000.0
        embedding.append(val)
    return embedding

# Indexer les documents
def index_documents():
    """Indexe tous les documents du dossier documents"""
    documents_path = Path(DOCUMENTS_DIR)
    if not documents_path.exists():
        print(f"Documents directory {DOCUMENTS_DIR} not found")
        return
    
    points = []
    for file_path in documents_path.rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() in [".pdf", ".docx", ".txt", ".md"]:
            print(f"Processing {file_path.name}...")
            text = extract_text(file_path)
            if text:
                chunks = create_chunks(text)
                for i, chunk in enumerate(chunks):
                    # Créer un ID unique pour le chunk
                    chunk_id = hashlib.md5(f"{file_path.name}_{i}".encode()).hexdigest()
                    
                    # Créer un embedding simple
                    embedding = create_simple_embedding(chunk)
                    
                    points.append(PointStruct(
                        id=chunk_id,
                        vector=embedding,
                        payload={
                            "file_name": file_path.name,
                            "file_path": str(file_path),
                            "chunk_text": chunk,
                            "chunk_index": i
                        }
                    ))
    
    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)
        print(f"Indexed {len(points)} chunks from documents")
    else:
        print("No documents found to index")

# API FastAPI
app = FastAPI(title="LEANN API", version="1.0.0")

class SearchRequest(BaseModel):
    query: str
    limit: int = 10

class SearchResult(BaseModel):
    id: str
    title: str
    content: str
    score: float
    metadata: dict

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "leann-api"}

@app.post("/search")
async def search(request: SearchRequest):
    """Recherche dans les documents indexés"""
    try:
        # Créer un embedding simple pour la requête
        query_embedding = create_simple_embedding(request.query)
        
        # Rechercher dans Qdrant
        search_results = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=request.limit
        )
        
        results = []
        for result in search_results:
            results.append(SearchResult(
                id=result.id,
                title=result.payload.get("file_name", "Document"),
                content=result.payload.get("chunk_text", ""),
                score=result.score,
                metadata=result.payload
            ))
        
        return {"success": True, "data": results}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/ask")
async def ask(request: SearchRequest):
    """Pose une question aux documents"""
    try:
        # Rechercher des documents pertinents
        search_results = await search(request)
        if not search_results["success"]:
            return search_results
        
        # Simuler une réponse basée sur les résultats
        if search_results["data"]:
            content = " ".join([r.content for r in search_results["data"]])
            answer = f"Basé sur les documents trouvés: {content[:500]}..."
        else:
            answer = "Aucun document pertinent trouvé."
        
        return {"success": True, "data": {"answer": answer}}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    print("Indexing documents...")
    index_documents()
    print("Starting LEANN API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
