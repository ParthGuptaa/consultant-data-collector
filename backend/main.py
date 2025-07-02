from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd

app = FastAPI(title="Data Collector Agent")

class Spec(BaseModel):
    query: str
    fields: List[str]

@app.post("/collect")
async def collect_data(spec: Spec):
    # Stub: replace with real gather/parse/normalize logic
    df = pd.DataFrame([
        {f: f"sample_{i}_{f}" for f in spec.fields}
        for i in range(3)
    ])
    # Return JSON table
    return {"data": df.to_dict(orient="records")}
