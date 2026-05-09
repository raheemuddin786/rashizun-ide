from fastapi import FastAPI
import lancedb
import os

app = FastAPI()

# Robust path handling
base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.getenv("LANCEDB_PATH", os.path.join(base_dir, "data"))

if not os.path.exists(db_path):
    os.makedirs(db_path, exist_ok=True)

db = lancedb.connect(db_path)

@app.get("/")
def read_root():
    return {"status": "Rashizun RAG Engine Active", "db": db_path}

@app.get("/healthz")
def healthz():
    return {"status": "healthy"}

@app.post("/index")
def index_document(content: str, metadata: dict = None):
    # Logic to embed and store in LanceDB
    return {"message": "Document indexed", "content_preview": content[:50]}

@app.get("/search")
def search(query: str):
    # Logic to retrieve from LanceDB
    return {"results": [], "query": query}
