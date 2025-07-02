import wikipedia
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.responses import FileResponse
import pandas as pd

app = FastAPI()

class Spec(BaseModel):
    query: str
    fields: List[str]

@app.post("/collect")
async def collect_data(spec: Spec):
    try:
        summary = wikipedia.summary(spec.query, sentences=3)
        return {"data": [{"field": f, "value": summary} for f in spec.fields]}
    except Exception as e:
        return {"error": str(e)}
@app.post("/export")
async def export_data(spec: Spec):
    df = pd.DataFrame([
        {f: f"sample_{i}_{f}" for f in spec.fields}
        for i in range(3)
    ])
    filename = "output.xlsx"
    df.to_excel(filename, index=False)
    return FileResponse(path=filename, filename=filename, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")