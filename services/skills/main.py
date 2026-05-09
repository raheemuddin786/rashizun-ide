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
@app.get("/healthz")
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

@app.post("/execute")
async def execute_skill(payload: dict):
    skill_name = payload.get("skill")
    args = payload.get("arguments", {})
    
    skills_dir = "/app/skills"
    skill_path = os.path.join(skills_dir, f"{skill_name}.py")
    
    if not os.path.exists(skill_path):
        return {"error": f"Skill {skill_name} not found"}
    
    try:
        # Dynamic loading logic
        spec = importlib.util.spec_from_file_location(skill_name, skill_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Assume each skill has a 'run' function
        if hasattr(module, "run"):
            result = await module.run(args) if os.path.iscoroutinefunction(module.run) else module.run(args)
            return {"status": "success", "output": result}
        else:
            return {"error": "Skill missing 'run' function"}
    except Exception as e:
        return {"error": str(e)}
