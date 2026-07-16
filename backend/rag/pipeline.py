import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

VECTORSTORE_PATH = "vectorstore/faiss_index"
KNOWLEDGE_BASE_PATH = "../knowledge_base"

vectorstore = None
embeddings_model = None

def get_embeddings():
    global embeddings_model
    if embeddings_model is None:
        print("Loading embedding model (first time may take a minute)...")
        embeddings_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
    return embeddings_model

def load_documents():
    documents = []
    kb_path = Path(KNOWLEDGE_BASE_PATH)
    if not kb_path.exists():
        kb_path = Path("knowledge_base")
    for pdf_file in kb_path.glob("*.pdf"):
        print(f"Loading: {pdf_file.name}")
        loader = PyPDFLoader(str(pdf_file))
        docs = loader.load()
        for doc in docs:
            doc.metadata["source"] = pdf_file.name
        documents.extend(docs)
    print(f"Total documents loaded: {len(documents)}")
    return documents

def create_vectorstore():
    documents = load_documents()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " "]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Total chunks: {len(chunks)}")
    embeddings = get_embeddings()
    vs = FAISS.from_documents(chunks, embeddings)
    os.makedirs(VECTORSTORE_PATH, exist_ok=True)
    vs.save_local(VECTORSTORE_PATH)
    print(f"Vectorstore saved to {VECTORSTORE_PATH}")
    return vs

def initialize_rag():
    global vectorstore
    if os.path.exists(f"{VECTORSTORE_PATH}/index.faiss"):
        print("Loading existing vectorstore...")
        embeddings = get_embeddings()
        vectorstore = FAISS.load_local(
            VECTORSTORE_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )
        print("Vectorstore loaded!")
    else:
        print("Creating new vectorstore...")
        vectorstore = create_vectorstore()

def retrieve_context(query: str, k: int = 4) -> str:
    global vectorstore
    if vectorstore is None:
        initialize_rag()
    docs = vectorstore.similarity_search(query, k=k)
    context_parts = []
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        context_parts.append(f"[From {source}]\n{doc.page_content}")
    return "\n\n---\n\n".join(context_parts)
