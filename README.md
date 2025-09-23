# ShodoBot

This bot is a little application for Shodo. It serves as a bot to help searching for information at Shodo. Next features will depend on the futur contributions.

This bot is a starter and a proof of concept that demonstrate the building of a AI Agent.

## Used technologies
- NodeJS : As a main server technology
- LangChain : As AI framework
- ReactJS : As a frontend technology
- NotionMCP : As MCP server for data source
- LEANN : As vector database for RAG

## Architecture
- Folder `front`: contains de frontend
- Folder `back`: contains the NodeJS backend and the agent
- Folder `infra`: contains Terraform scripts to deploy on Scaleway

## How to deploy

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
