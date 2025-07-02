from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import pandas as pd
import requests
import wikipedia
from transformers import pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Spec(BaseModel):
    query: str
    fields: List[str]

# Load BART summarizer
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@app.post("/collect")
async def collect_data(spec: Spec):
    sources = []

    try:
        wiki = wikipedia.summary(spec.query, sentences=2)
        sources.append(f"Wikipedia: {wiki}")
    except:
        pass

    try:
        ddg = requests.get(f"https://api.duckduckgo.com/?q={spec.query}&format=json").json()
        if ddg.get("AbstractText"):
            sources.append(f"DuckDuckGo: {ddg['AbstractText']}")
    except:
        pass

    try:
        news = requests.get(f"https://newsapi.org/v2/everything?q={spec.query}&apiKey=demo").json()
        if news.get("articles"):
            sources.append(f"NewsAPI: {news['articles'][0]['description']}")
    except:
        pass

    combined = "\n".join(sources) or "No data found."

    summary = summarizer(combined, max_length=200, min_length=50, do_sample=False)[0]["summary_text"]

    return {
        "sources": sources,
        "summary": summary
    }

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

summary = summarizer(combined, max_length=200, min_length=50, do_sample=False)[0]["summary_text"]
