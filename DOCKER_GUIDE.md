# Docker Setup Guide
# TechMart AI Support System

============================================================
WHAT DOCKER DOES FOR THIS PROJECT
============================================================

Without Docker:                    With Docker:
- Install Python manually          - One command starts everything
- Install Node.js manually         - No version conflicts
- Start MongoDB manually           - Works same on any computer
- Manage 3 terminals               - All containers auto-connected
- Fix PATH issues                  - No venv needed

Docker creates 3 containers:
  techmart_mongodb   -> MongoDB database (port 27017)
  techmart_backend   -> Python FastAPI   (port 8000)
  techmart_frontend  -> Next.js UI       (port 3000)

============================================================
PREREQUISITES
============================================================

Install Docker Desktop:
  Download: https://www.docker.com/products/docker-desktop/
  Windows: Enable WSL2 when prompted during install
  After install: Make sure Docker Desktop is RUNNING (whale icon in taskbar)

Verify Docker is working:
  docker --version
  docker-compose --version

============================================================
STEP 1 - ADD YOUR API KEY
============================================================

Open .env file in the project root (not inside backend/)
Change this line:
  GROQ_API_KEY=your_groq_api_key_here

To your actual key from https://console.groq.com:
  GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

Save the file.

============================================================
STEP 2 - GENERATE KNOWLEDGE BASE
============================================================

Run once before Docker (needs Python installed locally):
  python generate_knowledge_base.py

This creates 6 PDF files in knowledge_base/ folder.
Docker will mount this folder into the backend container.

If you don't have Python locally, skip this step.
The backend will start but RAG answers will be limited.

============================================================
STEP 3 - BUILD AND START ALL CONTAINERS
============================================================

Windows (double-click or run in terminal):
  docker-start.bat

Mac/Linux:
  ./docker-start.sh

OR manually:
  docker-compose up --build -d

First run takes 5-10 minutes:
  - Downloads Python 3.11 image (~200MB)
  - Downloads Node.js 20 image (~150MB)
  - Downloads MongoDB 7 image (~250MB)
  - Installs all Python packages
  - Installs all Node packages
  - Downloads AI embedding model (~90MB)
  - Builds Next.js app

Subsequent runs take ~30 seconds (images cached).

============================================================
STEP 4 - CHECK EVERYTHING IS RUNNING
============================================================

  docker-compose ps

You should see all 3 containers with status "Up":
  techmart_mongodb    Up    0.0.0.0:27017->27017/tcp
  techmart_backend    Up    0.0.0.0:8000->8000/tcp
  techmart_frontend   Up    0.0.0.0:3000->3000/tcp

Open in browser:
  App:      http://localhost:3000
  API:      http://localhost:8000
  API Docs: http://localhost:8000/docs  (Swagger UI - great for demo!)

============================================================
USEFUL DOCKER COMMANDS
============================================================

# See all running containers
docker-compose ps

# See live logs from all containers
docker-compose logs -f

# See logs from one container only
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop all containers
docker-compose down

# Stop and delete all data (fresh start)
docker-compose down -v

# Restart one container
docker-compose restart backend

# Rebuild after code changes
docker-compose up --build -d

# Open shell inside backend container
docker exec -it techmart_backend bash

# Open MongoDB shell
docker exec -it techmart_mongodb mongosh

============================================================
VIEWING YOUR DATA IN DOCKER MONGODB
============================================================

Option 1 - MongoDB Shell:
  docker exec -it techmart_mongodb mongosh
  use techmart_support
  db.users.find()
  db.messages.find()
  db.conversations.find()

Option 2 - MongoDB Compass (GUI):
  Connection string: mongodb://localhost:27017
  Connect and browse techmart_support database

============================================================
TROUBLESHOOTING
============================================================

Problem: "Cannot connect to Docker daemon"
Fix: Make sure Docker Desktop is running (whale icon in taskbar)

Problem: Port 3000 or 8000 already in use
Fix: Stop other services using that port, or change ports in docker-compose.yml

Problem: Backend keeps restarting
Fix: Check logs: docker-compose logs backend
     Usually means wrong API key or MongoDB not ready yet

Problem: "knowledge_base is empty"
Fix: Run python generate_knowledge_base.py first, then restart:
     docker-compose restart backend

Problem: Changes to code not reflected
Fix: Rebuild: docker-compose up --build -d

============================================================
RUNNING BANKING77 EVALUATION IN DOCKER
============================================================

  docker exec -it techmart_backend python evaluation/banking77_eval.py

Results saved inside the container at evaluation/results/

To copy results to your computer:
  docker cp techmart_backend:/app/evaluation/results/banking77_report.json .
  docker cp techmart_backend:/app/evaluation/results/banking77_results.csv .
