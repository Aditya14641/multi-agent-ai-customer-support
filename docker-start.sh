#!/bin/bash
echo "============================================================"
echo " TechMart AI Support - Docker Startup"
echo "============================================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please edit .env and add your GROQ_API_KEY"
    exit 1
fi

# Generate knowledge base if not exists
if [ ! -f knowledge_base/FAQ.pdf ]; then
    echo "Generating knowledge base PDFs..."
    python generate_knowledge_base.py
fi

echo ""
echo "Starting all containers..."
echo "This may take 5-10 minutes on first run (downloading images)"
echo ""

docker-compose up --build -d

echo ""
echo "Waiting for services to start..."
sleep 15

docker-compose ps

echo ""
echo "============================================================"
echo " Frontend:  http://localhost:3000"
echo " Backend:   http://localhost:8000"
echo " API Docs:  http://localhost:8000/docs"
echo "============================================================"
