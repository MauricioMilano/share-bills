import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch(() => setError("Erro ao buscar usuários"));
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="p-4 bg-white shadow rounded">
            <span className="font-semibold">{u.name}</span> ({u.email})
            {u.role && <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{u.role}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
