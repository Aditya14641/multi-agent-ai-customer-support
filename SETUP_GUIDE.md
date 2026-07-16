# COMPLETE SETUP GUIDE
# Multi-Agent AI Customer Support Assistant
# Read this fully before starting!

============================================================
PREREQUISITES - Install these before starting
============================================================

1. Python 3.11+       -> https://python.org/downloads
2. Node.js 20+        -> https://nodejs.org
3. MongoDB Community  -> https://mongodb.com/try/download/community
4. Git                -> https://git-scm.com
5. VS Code            -> https://code.visualstudio.com

FREE API KEY (REQUIRED):
Get Groq API key at https://console.groq.com (free, no credit card)

============================================================
STEP 1: OPEN TERMINAL AND NAVIGATE TO PROJECT
============================================================

Unzip the project folder, then:

  cd customer-support-ai

============================================================
STEP 2: CREATE PYTHON VIRTUAL ENVIRONMENT
============================================================

  python -m venv venv

Activate it:
  Windows:  venv\Scripts\activate
  Mac/Linux: source venv/bin/activate

You should see (venv) in your terminal prompt.
KEEP THIS TERMINAL OPEN - this is your BACKEND terminal.

============================================================
STEP 3: INSTALL BACKEND DEPENDENCIES
============================================================

  cd backend
  pip install -r requirements.txt

This takes 3-5 minutes (downloads AI models).

============================================================
STEP 4: CONFIGURE YOUR API KEY
============================================================

In the backend folder, copy .env.example to .env:
  Windows: copy .env.example .env
  Mac/Linux: cp .env.example .env

Open .env in VS Code and set:
  GROQ_API_KEY=your_actual_groq_api_key_here
  LLM_PROVIDER=groq

Save the file.

============================================================
STEP 5: START MONGODB
============================================================

Windows: Open Services -> Start MongoDB
Mac:     brew services start mongodb-community
Linux:   sudo systemctl start mongod

Or use MongoDB Atlas (cloud) - paste the connection string in .env as MONGO_URI.

============================================================
STEP 6: GENERATE KNOWLEDGE BASE PDFs
============================================================

Go back to the project root:
  cd ..

Run:
  python generate_knowledge_base.py

This creates 6 PDF files in the knowledge_base/ folder.

============================================================
STEP 7: START THE BACKEND SERVER
============================================================

  cd backend
  python main.py

First startup downloads the sentence-transformer embedding model (~90MB).
Wait until you see: "RAG pipeline ready!" and "Uvicorn running on http://0.0.0.0:8000"

Test it: Open http://localhost:8000 in browser. You should see JSON response.

LEAVE THIS TERMINAL RUNNING.

============================================================
STEP 8: SETUP AND START FRONTEND (NEW TERMINAL)
============================================================

Open a NEW terminal window/tab.
Navigate to the project:
  cd customer-support-ai/frontend
  npm install
  npm run dev

Wait until you see: "Ready - started server on 0.0.0.0:3000"

============================================================
STEP 9: OPEN THE APP
============================================================

Open your browser and go to: http://localhost:3000

1. Click Register -> Create an account
2. Login with your account
3. Start chatting!

============================================================
TEST QUERIES TO VERIFY EVERYTHING WORKS
============================================================

Type these in the chat to test each agent:

Billing Agent:    "My payment failed but money was deducted"
Technical Agent:  "I cannot login to my account, password reset not working"
Product Agent:    "What is the price of TechMart UltraBook 15?"
Complaint Agent:  "This is the worst service, I am very angry"
Multi-Agent:      "I paid for Premium but my account is still showing free tier"
FAQ Agent:        "What is your refund policy for laptops?"
RAG Test:         "What are the steps to claim warranty for my device?"

============================================================
OPTIONAL: RUN BANKING77 EVALUATION
============================================================

In your backend terminal (with venv activated):
  cd backend
  python evaluation/banking77_eval.py

This downloads Banking77 dataset and evaluates intent detection accuracy.
Results saved in backend/evaluation/results/

============================================================
TROUBLESHOOTING
============================================================

ERROR: "No module named X"
-> Make sure venv is activated: source venv/bin/activate (Mac/Linux) or venv\Scripts\activate (Windows)
-> Run: pip install -r requirements.txt

ERROR: "Connection refused" on frontend
-> Make sure backend is running on port 8000
-> Check backend terminal for errors

ERROR: "MongoDB connection failed"
-> Make sure MongoDB is running
-> Check MONGO_URI in backend/.env

ERROR: "Invalid API key"
-> Check your GROQ_API_KEY in backend/.env
-> Make sure there are no spaces around the = sign

ERROR: "knowledge_base empty / no PDFs found"
-> Run from project root: python generate_knowledge_base.py
-> Make sure knowledge_base/ folder has 6 PDF files

Vectorstore rebuilds automatically if PDFs are found.
Delete backend/vectorstore/ folder to force rebuild.

============================================================
DEPLOYMENT (Optional - for extra marks)
============================================================

Frontend -> Vercel:
  cd frontend
  npx vercel --prod

Backend -> Render.com:
  Push backend/ to GitHub
  New Web Service on render.com
  Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
  Add all .env variables in Render dashboard

Database -> MongoDB Atlas:
  Create free cluster at cloud.mongodb.com
  Copy connection string to MONGO_URI in Render environment variables
