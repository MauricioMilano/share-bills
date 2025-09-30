const apiUrl = import.meta.env.VITE_API_URL || "";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: { name: string };
  splits: { userId: string; amount: number }[];
}

interface GroupMember {
  id: string;
  userId: string;
  role: string;
  status: string;
  user: { name: string; email: string };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function GroupDetails() {
  const { id } = useParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [inviteUserId, setInviteUserId] = useState("");
  const [memberMsg, setMemberMsg] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const token = localStorage.getItem("token");

  const fetchExpenses = async () => {
    if (!token) return;
    const res = await axios.get(`/api/expenses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data);

    const bal = await axios.get(`/api/groups/${id}/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBalances(bal.data);
  };

  const fetchMembers = async () => {
    if (!token || !id) return;
    const res = await axios.get(`/api/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const group = res.data.find((g: any) => g.id === id);
    setMembers(group?.members || []);
  };

  useEffect(() => {
    fetchExpenses();
    fetchMembers();
    // Buscar todos os usuários para o dropdown
    if (token) {
      axios
        .get("/api/users", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUsers(res.data));
    }
  }, []);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await axios.post(
      "/api/expenses",
      {
        groupId: id,
        description,
        amount: parseFloat(amount),
        splits: [], // simplificação: dividir manual depois
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDescription("");
    setAmount("");
    fetchExpenses();
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !inviteUserId) return;
    try {
      await axios.post(
        `/api/groups/${id}/members`,
        { userId: inviteUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemberMsg("Membro convidado!");
      setInviteUserId("");
      fetchMembers();
    } catch (err: any) {
      setMemberMsg(err.response?.data?.error || "Erro ao convidar membro");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!token || !id) return;
    try {
      await axios.delete(`/api/groups/${id}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemberMsg("Membro removido!");
      fetchMembers();
    } catch (err: any) {
      setMemberMsg(err.response?.data?.error || "Erro ao remover membro");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Group Details</h1>

      <form onSubmit={addExpense} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Expense
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Expenses</h2>
      <ul className="space-y-2 mb-6">
        {expenses.map((exp) => (
          <li key={exp.id} className="p-4 bg-white shadow rounded">
            <p className="font-semibold">{exp.description}</p>
            <p className="text-gray-600 text-sm">Amount: ${exp.amount}</p>
            <p className="text-gray-600 text-sm">Paid by: {exp.paidBy?.name}</p>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Balances</h2>
      <ul className="space-y-2">
        {Object.entries(balances).map(([userId, balance]) => (
          <li key={userId} className="p-2 bg-gray-100 rounded">
            {userId}: {typeof balance === "object" ? JSON.stringify(balance) : balance}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2 mt-8">Membros do grupo</h2>
      <form onSubmit={inviteMember} className="mb-4 flex gap-2">
        <select
          value={inviteUserId}
          onChange={e => setInviteUserId(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Selecione um usuário para convidar</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Convidar
        </button>
      </form>
      {memberMsg && <p className="mb-2 text-blue-600">{memberMsg}</p>}
      <ul className="space-y-2 mb-6">
        {members.map((m) => (
          <li
            key={m.id}
            className="p-4 bg-white shadow rounded flex justify-between items-center"
          >
            <div>
              <span className="font-semibold">{m.user ? m.user.name : "Usuário desconhecido"}</span> ({m.user ? m.user.email : "sem email"})
              <span className="ml-2 text-xs text-gray-500">
                [{m.role}] [{m.status}]
              </span>
            </div>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => removeMember(m.id)}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}