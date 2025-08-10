import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sayHello() {
    setLoading(true);
    try {      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ping`);
      const data = await response.json();
      
      setMessage(data.message);
      // console.log(data.message);
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setMessage("Fetch failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Extension Popup</h1>
      <button onClick={sayHello} disabled={loading}>
        {loading ? "Loading..." : "Say Hello"}
      </button>
      <p>Backend says: {message}</p>
    </div>
  );
}