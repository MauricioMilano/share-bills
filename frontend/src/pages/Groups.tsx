const apiUrl = import.meta.env.VITE_API_URL || "";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Group {
  id: string;
  name: string;
  description?: string;
  members?: { userId: string; status: string }[];
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [acceptMsg, setAcceptMsg] = useState("");
  const token = localStorage.getItem("token");

  const fetchGroups = async () => {
    if (!token) return;
    const res = await axios.get("/api/groups", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGroups(res.data);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await axios.post(
      "/api/groups",
      { name, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setName("");
    setDescription("");
    fetchGroups();
  };

  const acceptInvite = async (groupId: string) => {
    if (!token) return;
    try {
      await axios.post(
        `/api/groups/${groupId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAcceptMsg("Convite aceito!");
      fetchGroups();
      fetchNotifications && fetchNotifications();
    } catch (err: any) {
      setAcceptMsg(err.response?.data?.error || "Erro ao aceitar convite");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Groups</h1>

      <form onSubmit={createGroup} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </form>

      <ul className="space-y-2">
        {groups.map((g) => {
          // Verifica se o grupo está pendente para o usuário logado
          const isPending = g.members?.some(
            (m) => m.userId === JSON.parse(atob(token!.split(".")[1])).userId && m.status === "PENDING"
          );
          return (
            <li
              key={g.id}
              className="p-4 bg-white shadow rounded flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{g.name}</h2>
                <p className="text-gray-600 text-sm">{g.description}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Link
                  to={`/groups/${g.id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Detalhes
                </Link>
                {isPending && (
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                    onClick={() => acceptInvite(g.id)}
                  >
                    Aceitar convite
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {acceptMsg && <p className="mt-4 text-blue-600">{acceptMsg}</p>}
    </div>
  );
}