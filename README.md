# 🛒 Multi-Agent AI Customer Support System

> A production-grade AI-powered customer support assistant for **TechMart Electronics**, built with Multi-Agent Architecture, Retrieval-Augmented Generation (RAG), and Large Language Models.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![LLM](https://img.shields.io/badge/LLM-Groq%20Llama3-orange)

---

## 📌 Project Overview

This project is a **Multi-Agent AI Customer Support System** that intelligently routes customer queries to specialized AI agents. Unlike a basic chatbot, this system understands customer intent, retrieves relevant company documents, and generates accurate responses using RAG.

---

## 🏗️ System Architecture

```
Customer
    │
    ▼
Frontend (Next.js) ──── http://localhost:3000
    │
    ▼ REST API
Backend (FastAPI) ──── http://localhost:8000
    │
    ├── Intent Detection Agent
    │         │
    │         ▼
    │    Agent Router
    │         │
    │   ┌─────┼──────┬──────────┬─────────┐
    │   ▼     ▼      ▼          ▼         ▼
    │ Billing Tech  Product  Complaint  FAQ
    │         │
    │         ▼
    │    RAG Pipeline
    │         │
    │    FAISS Vector DB ◄── TechMart PDFs
    │         │
    │         ▼
    │    LLM (Groq/Llama 3)
    │         │
    ▼         ▼
MongoDB    Response to User
```

---

## ✨ Features

- 🤖 **Multi-Agent System** — 5 specialized AI agents for different domains
- 🔍 **RAG Pipeline** — Answers grounded in real company documents
- 💬 **Conversation Memory** — Full chat history per session
- 🔐 **JWT Authentication** — Secure login and registration
- 📊 **Analytics Dashboard** — Agent usage, response time tracking
- 🐳 **Docker Support** — One command to run everything
- 📈 **Banking77 Evaluation** — Intent detection accuracy testing
- 🎨 **Rich Chat UI** — Tables, bold headings, emoji formatting

---

## 🤖 AI Agents

| Agent | Handles | Emoji |
|---|---|---|
| Billing Agent | Payments, invoices, subscriptions | 💳 |
| Technical Agent | Login issues, bugs, troubleshooting | 🔧 |
| Product Agent | Pricing, features, comparisons | 📦 |
| Complaint Agent | Escalations, dissatisfied customers | 📢 |
| FAQ Agent | Policies, shipping, general questions | 📋 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Python FastAPI, Uvicorn |
| AI / LLM | Groq (Llama 3), OpenAI, Google Gemini |
| RAG | LangChain, FAISS, sentence-transformers |
| Embeddings | all-MiniLM-L6-v2 |
| Database | MongoDB |
| Containers | Docker, Docker Compose |
| Evaluation | Banking77 Dataset (HuggingFace) |

---

## 📁 Project Structure

```
customer-support-ai/
│
├── backend/
│   ├── agents/
│   │   ├── billing.py
│   │   ├── technical.py
│   │   ├── product.py
│   │   ├── complaint.py
│   │   ├── faq.py
│   │   ├── intent_detector.py
│   │   └── router.py
│   ├── api/
│   │   ├── auth.py
│   │   ├── chat.py
│   │   └── analytics.py
│   ├── database/
│   │   ├── mongodb.py
│   │   └── auth_db.py
│   ├── models/
│   │   └── llm.py
│   ├── rag/
│   │   └── pipeline.py
│   ├── evaluation/
│   │   └── banking77_eval.py
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/app/
│   │   ├── login/page.tsx
│   │   ├── chat/page.tsx
│   │   └── analytics/page.tsx
│   ├── src/services/
│   │   └── api.ts
│   ├── package.json
│   └── Dockerfile
│
├── knowledge_base/
│   ├── FAQ.pdf
│   ├── RefundPolicy.pdf
│   ├── ShippingPolicy.pdf
│   ├── Warranty.pdf
│   ├── Pricing.pdf
│   └── UserManual.pdf
│
├── docker-compose.yml
├── generate_knowledge_base.py
└── README.md
```

---

## 🚀 Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Free Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/multi-agent-ai-customer-support.git
cd multi-agent-ai-customer-support
```

### 2. Add your API key
Create a `.env` file in the project root:
```env
GROQ_API_KEY=your_groq_api_key_here
LLM_PROVIDER=groq
SECRET_KEY=supersecretkey_change_this_in_production
```

### 3. Generate knowledge base PDFs
```bash
python generate_knowledge_base.py
```

### 4. Start everything with one command
```bash
docker-compose up --build -d
```

### 5. Open the app
| Service | URL |
|---|---|
| Frontend App | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## 🏃 Running Without Docker

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # Add your API keys
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Test the System

Try these queries to test each agent:

```
💳 "My payment failed but money was deducted"         → Billing Agent
🔧 "I cannot login to my account"                     → Technical Agent
📦 "What is the price of TechMart UltraBook 15?"      → Product Agent
📢 "This is the worst service I have ever received"   → Complaint Agent
📋 "What is your refund policy?"                      → FAQ Agent + RAG
🔀 "I paid for Premium but account shows free tier"   → Multi-Agent
```

---

## 📊 Banking77 Dataset Evaluation

Run intent detection evaluation against the Banking77 dataset:

```bash
docker exec -it techmart_backend python evaluation/banking77_eval.py
```

Results saved to `backend/evaluation/results/`:
- `banking77_report.json` — accuracy per intent category
- `banking77_results.csv` — full prediction results

---

## 🐳 Docker Commands

```bash
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# Rebuild after code changes
docker-compose up --build -d

# View logs
docker-compose logs -f backend

# View live logs of all containers
docker-compose logs -f
```


## 👨‍💻 Author

**Aditya Mehta**
B.Tech — LNM Institute of Information Technology (LNMIIT)
Data Science Project — 2026

---

## 📄 License

This project is for academic purposes at LNMIIT.
