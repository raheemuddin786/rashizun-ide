from fastapi import FastAPI
import chromadb
from chromadb.config import Settings
import os
import hashlib

app = FastAPI(title="Rashizun RAG Engine (Hardware Resilient)")

# Robust path handling
base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.getenv("CHROMA_DB_PATH", os.path.join(base_dir, "data"))

if not os.path.exists(db_path):
    os.makedirs(db_path, exist_ok=True)

# Protocol 3.5: ChromaDB Persistent Client (AVX Compatible)
client = chromadb.PersistentClient(path=db_path)

# Protocol 3.3: Real Embedding Engine (Non-Mocked)
# Already patched for CPU compatibility in Dockerfile
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')

class ProjectMerkleTree:
    def __init__(self):
        self.nodes = []
    
    def add_leaf(self, hash_val):
        self.nodes.append(hash_val)
        return self.get_root()
        
    def get_root(self):
        if not self.nodes: return "0"
        import hashlib
        current_layer = self.nodes
        while len(current_layer) > 1:
            next_layer = []
            for i in range(0, len(current_layer), 2):
                if i + 1 < len(current_layer):
                    combined = current_layer[i] + current_layer[i+1]
                else:
                    combined = current_layer[i]
                next_layer.append(hashlib.blake2b(combined.encode()).hexdigest())
            current_layer = next_layer
        return current_layer[0]

merkle_tree = ProjectMerkleTree()

@app.get("/")
def read_root():
    return {
        "status": "Rashizun RAG Engine Active (ChromaDB)", 
        "db": db_path, 
        "merkle_root": merkle_tree.get_root()
    }

@app.get("/healthz")
def healthz():
    return {"status": "healthy", "engine": "chromadb"}

@app.post("/index")
def index_document(content: str, metadata: dict = None):
    doc_id = hashlib.blake2b(content.encode()).hexdigest()
    
    try:
        # Generate real embedding
        vector = model.encode(content).tolist()
        
        # ChromaDB logic
        collection = client.get_or_create_collection(name="knowledge_base")
        collection.add(
            embeddings=[vector],
            documents=[content],
            metadatas=[metadata or {}],
            ids=[doc_id]
        )
        
        # Update Protocol 3.2 Merkle Tree
        merkle_root = merkle_tree.add_leaf(doc_id)
        
        return {"message": "Document indexed", "id": doc_id, "status": "success", "merkle_root": merkle_root}
    except Exception as e:
        return {"message": f"Error: {str(e)}", "status": "failed"}

@app.get("/search")
def search(query: str):
    try:
        collection = client.get_or_create_collection(name="knowledge_base")
        
        # Generate real query embedding
        query_vector = model.encode(query).tolist()
        
        results = collection.query(
            query_embeddings=[query_vector],
            n_results=5
        )
        
        # Format results to match previous API
        formatted_results = []
        if results['documents']:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    "content": results['documents'][0][i],
                    "id": results['ids'][0][i]
                })
        
        return {
            "results": formatted_results,
            "query": query
        }
    except Exception as e:
        return {"results": [], "error": str(e)}

@app.get("/merkle")
def get_merkle():
    return {"merkle_root": merkle_tree.get_root(), "leaf_count": len(merkle_tree.nodes)}
