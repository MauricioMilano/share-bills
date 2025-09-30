const apiUrl = import.meta.env.VITE_API_URL || "";
import { useEffect, useState } from "react";
import axios from "axios";

interface Group {
  id: string;
  name: string;
  description?: string;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  const fetchGroups = async () => {
    if (!token) return;
    const res = await axios.get("/groups", {
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
      "/groups",
      { name, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setName("");
    setDescription("");
    fetchGroups();
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
        {groups.map((g) => (
          <li
            key={g.id}
            className="p-4 bg-white shadow rounded flex justify-between"
          >
            <div>
              <h2 className="font-semibold">{g.name}</h2>
              <p className="text-gray-600 text-sm">{g.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}