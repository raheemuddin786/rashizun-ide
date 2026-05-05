from fastapi import FastAPI
import os
import importlib.util
import sys

app = FastAPI(title="Rashizun Skill Registry")

@app.get("/")
async def root():
    return {
        "status": "Rashizun Skill Registry Active",
        "version": "1.0.0",
        "skills_path": "/app/skills"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Logic to discover and list skills from the mounted repo
@app.get("/skills")
async def list_skills():
    skills_dir = "/app/skills"
    if not os.path.exists(skills_dir):
        return {"skills": [], "error": "Skills directory not found"}
    
    skills = [f for f in os.listdir(skills_dir) if f.endswith(".py") or os.path.isdir(os.path.join(skills_dir, f))]
    return {"skills": skills}
