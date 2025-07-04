from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import pandas as pd
import requests
import wikipedia
import nltk
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

nltk.download("punkt")

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

def summarize_text(text):
    if not text.strip():
        return "No content available to summarize."
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, 3)
    return " ".join(str(sentence) for sentence in summary)

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

    combined = "\n".join(sources)
    summary = summarize_text(combined)

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

@app.get("/")
def root():
    return {"message": "Backend is alive"}
