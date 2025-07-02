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
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>📊 Consultant Data Collector</h1>
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
      <pre style={{ marginTop: "2rem", background: "#f4f4f4", padding: "1rem" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
