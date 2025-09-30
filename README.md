# ShodoBot

This bot is a little application for Shodo. It serves as a bot to help searching for information at Shodo. Next features will depend on the futur contributions.

This bot is a starter and a proof of concept that demonstrate the building of a AI Agent.

![Shodobot](/shodobot.png)

## Used technologies
- NodeJS : As a main server technology
- LangChain : As AI framework
- ReactJS : As a frontend technology
- NotionMCP : As MCP server for data source
- LEANN : As vector database for RAG

## Dossiers
- Folder `front`: contains de frontend
- Folder `back`: contains the NodeJS backend and the agent
- Folder `infra`: contains Terraform scripts to deploy on Scaleway

## Architecture
- Frontend uses ReactJS and can be deployed on Nginx
- Backend uses NodeJS and Fastify
- Infra folder contains necessary to deploy everything on Scaleway, including LEANN

## How to deploy
This application can be deployed anywhere. There is a deployment example to deploy it on Scaleway Kapsule which is a managed Kubernetes. However, I did not test it but it should work as it is inspired from a working personal project :)

## What's missing for prod ready application
- Observability : 
* standard KPIs, see OpenTelemetry as starter
* LLM usage KPIs
- Security :
* Intrusion detection
* Supply chain attack checks (MD5, etc)
* AI security like Guardrails
- Finops

## How to contribute
Do what you want :-)

## Improvement
I did not have enough time to make LEANN work properly. What is missing is that you can search in LEANN using its vector database but it is not used as a RAG for the LangChain agent. Results of search should be put in the agent context.

## Configuration

### Notion

#### 1. Create a Notion Integration

1. **Go to [Notion Integrations](https://www.notion.so/my-integrations)**
2. **Click “New integration”**
3. **Set up the integration:**
   - **Name**: `ShodoBot` (or any name you like)
   - **Workspace**: Select your workspace
   - **Type**: Internal
4. **Click “Submit”**
5. **Copy the API key** (starts with `secret_`)

#### 2. Share your pages with the integration

**Option A: Share all pages**  
1. In your integration, click “...” → “Manage”  
2. Under “Connected pages,” click “Add pages”  
3. Select “All pages” or manually add your pages  

**Option B: Share page by page**  
1. Open each page in your workspace  
2. Click “Share” (top right)  
3. Add the integration “ShodoBot”  

#### 3. Configure ShodoBot

1. **Create the `.env` file in the `back/` folder:**  
   ```bash
   cd back
   cp .env.example .env
   ```

2. **Add your Notion API key:**  
   ```bash
   # In back/.env
   GROQ_API_KEY=your_groq_api_key_here
   NOTION_API_KEY=secret_your_notion_api_key_here
   NOTION_DATABASE_ID=your_database_id_here  # Optional
   ```

3. **Restart the server:**  
   ```bash
   cd back && npm run dev
   ```

### LEANN

ShodoBot can search your local documents (PDF, Markdown, code, etc.) through LEANN. Here’s how to set it up:

#### 1. Start LEANN

```bash
cd local/leann
./start-leann.sh up
```

#### 2. Add your documents

Place your documents in the `rag/` folder:

```bash
# Example structure
rag/
├── documents/
│   ├── my_document.pdf
│   ├── notes.md
│   └── code/
│       └── my_project.py
```

#### 3. Index the documents

```bash
./start-leann.sh build my_docs_index
```

#### 4. Test the search

```bash
# Interactive search
./start-leann.sh interactive my_docs_index

# Simple search
./start-leann.sh search my_docs_index "machine learning"

# Ask a question
./start-leann.sh ask my_docs_index "What does this document explain?"
```

#### 5. Use in the chat

Once LEANN is started and indexed, try in the chat:

- “search local document”  
- “find files about python”  
- “search in my documents”