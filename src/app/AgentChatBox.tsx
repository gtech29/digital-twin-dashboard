"use client";

import { useState } from "react";

export default function AgentChatBox() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://llm-agent:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      setResponse(data.response || "No response received.");
    } catch (error) {
      setResponse("⚠️ Error connecting to the agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg max-w-xl mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-2">🤖 Ask the AI Agent</h2>
      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-2"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. What was the temperature over the last 6 hours?"
      />
      <button
        onClick={sendPrompt}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {response && (
        <div className="mt-4 p-3 bg-gray-50 border rounded text-sm whitespace-pre-wrap">
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
