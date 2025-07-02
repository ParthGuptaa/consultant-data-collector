import { useState } from "react";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [fields, setFields] = useState("");
  const [data, setData] = useState([]);
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
      setData(resp.data.data || []);
    } catch (error) {
      alert("❌ Failed to collect data.");
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
      alert("❌ Failed to download Excel file.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "720px", margin: "0 auto" }}>
      <h1>📊 Consultant Data Collector</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="🔍 Research query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            marginRight: "0.5rem",
            padding: "0.5rem",
            width: "320px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
        <input
          placeholder=" Fields (comma-separated)"
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "320px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div>
        <button
          onClick={runCollect}
          style={{
            marginRight: "1rem",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
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
            cursor: "pointer"
          }}
        >
          Download Excel
        </button>
      </div>

      <pre style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "4px" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
