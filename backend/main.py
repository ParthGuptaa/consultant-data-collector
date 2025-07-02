import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="wikipedia")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import pandas as pd
import requests
import wikipedia
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Spec(BaseModel):
    query: str
    fields: List[str]

@app.post("/collect")
async def collect_data(spec: Spec):
    results = []

    # Wikipedia agent
    try:
        summary = wikipedia.summary(spec.query, sentences=2)
        results.append({"source": "Wikipedia", "summary": summary})
    except:
        pass

    # News API agent (replace with your key)
    try:
        news = requests.get(
            f"https://newsapi.org/v2/everything?q={spec.query}&apiKey=1006582b26d84b558d345672f0938701"
        ).json()
        if news.get("articles"):
            results.append({
                "source": "NewsAPI",
                "summary": news["articles"][0]["description"]
            })
    except:
        pass

    # DuckDuckGo agent
    try:
        ddg = requests.get(f"https://api.duckduckgo.com/?q={spec.query}&format=json").json()
        if ddg.get("AbstractText"):
            results.append({"source": "DuckDuckGo", "summary": ddg["AbstractText"]})
    except:
        pass

    # Format into field-based rows
    data = []
    for i, r in enumerate(results):
        row = {f: f"{r['summary'][:100]}..." for f in spec.fields}
        row["source"] = r["source"]
        data.append(row)

    return {"data": data}

@app.post("/export")
async def export_data(spec: Spec):
    df = pd.DataFrame([
        {f: f"sample_{i}_{f}" for f in spec.fields}
        for i in range(3)
    ])
    filename = "output.xlsx"
    df.to_excel(filename, index=False, engine="openpyxl")
    return FileResponse(
        path=filename,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
