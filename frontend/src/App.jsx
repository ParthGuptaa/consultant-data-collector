import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [fields, setFields] = useState("");
  const [summary, setSummary] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const runCollect = async () => {
    setLoading(true);
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_API_URL}/collect`,
        {
          query,
          fields: fields.split(",").map((f) => f.trim()),
        }
      );
      setSummary(resp.data.summary || "No summary received.");
      setSources(resp.data.sources || []);
    } catch (error) {
      console.error("Error collecting data:", error);
      setSummary("⚠️ Failed to fetch summary.");
      setSources([]);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          fields: fields.split(",").map((f) => f.trim()),
        }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.xlsx";
      a.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>🧠 Consultant AI Assistant</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter your research query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            marginRight: "1rem",
            padding: "0.5rem",
            width: "320px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="text"
          placeholder="Fields (comma-separated)"
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "320px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={runCollect}
          style={{
            marginRight: "1rem",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Collecting..." : "Collect Data"}
        </button>
        <button
          onClick={handleExport}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download Excel
        </button>
      </div>

      {summary && (
        <div style={{ marginBottom: "2rem", background: "#f0f8ff", padding: "1rem", borderRadius: "4px" }}>
          <h3>📝 Summary</h3>
          <p>{summary}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "4px" }}>
          <h3>📚 Source Snippets</h3>
          <ul>
            {sources.map((src, idx) => (
              <li key={idx}>{src}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
