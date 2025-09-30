const apiUrl = import.meta.env.VITE_API_URL || "${apiUrl}";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Index() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    axios.get("${apiUrl}/").then((res) => {
      setStatus(res.data.message);
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Splitwise Clone</h1>
        <p className="text-gray-700">Backend status: {status}</p>
      </div>
    </div>
  );
}