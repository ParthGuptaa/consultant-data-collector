import { useState } from "react";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [fields, setFields] = useState("");
  const [data, setData] = useState([]);

  const runCollect = async () => {
    const resp = await axios.post(
      `${import.meta.env.VITE_API_URL}/collect`,
      { query, fields: fields.split(",").map(f=>f.trim()) }
    );
    setData(resp.data.data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Consultant Data Collector</h1>
      <input
        placeholder="Research query"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <input
        placeholder="Fields (comma separated)"
        value={fields}
        onChange={e => setFields(e.target.value)}
      />
      <button onClick={runCollect}>Collect Data</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
