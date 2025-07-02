import { useState } from "react";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [fields, setFields] = useState("");
  const [sources, setSources] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const runCollect = async () => {
    setLoading(true);
    try {
      const resp = await axios.post(`${import.meta.env.VITE_API_URL}/collect`, {
        query,
        fields: fields.split(",").map((f) => f.trim()),
      });
      setSources(resp.data.sources || []);
      setSummary(resp.data.summary || "");
    } catch (error) {
      console.error("Collection failed:", error);
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
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "800px", margin: "0 auto" }}>
      <h1> Consultant AI Research Assistant</h1>

      <input
        placeholder="Research query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ margin: "0.5rem", padding: "0.5rem", width: "300px" }}
      />
      <input
        placeholder="Fields (comma separated)"
        value={fields}
        onChange={(e) => setFields(e.target.value)}
        style={{ margin: "0.5rem", padding: "0.5rem", width: "300px" }}
      />

      <div style={{ marginTop: "1rem" }}>
        <button onClick={runCollect} style={{ marginRight: "1rem" }}>
          {loading ? "Collecting..." : "Collect Data"}
        </button>
        <button onClick={handleExport}>Download Excel</button>
      </div>

      {summary && (
        <div style={{ marginTop: "2rem", background: "#f0f8ff", padding: "1rem", borderRadius: "6px" }}>
          <h3> BART Summary</h3>
          <p>{summary}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "6px" }}>
          <h3> Raw Sources</h3>
          <ul>
            {sources.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
