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
  const [settlements, setSettlements] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'times'>('equal');
  const [splitValues, setSplitValues] = useState<Record<string, number>>({});
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

    const bal = await axios.get(`/api/expenses/${id}/balances`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBalances(bal.data);

    // Fetch settlements
    const settlementsRes = await axios.get(`/api/expenses/${id}/settlements`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSettlements(settlementsRes.data);
  };

  const fetchMembers = async () => {
    if (!token || !id) return;
    const res = await axios.get(`/api/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const group = res.data.find((g: any) => g.id === id);
    console.log("Group members:", group?.members);
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

  useEffect(() => {
    console.log("Users:", users);
  },[users])



  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    // Prepare splits array
    let splits: any[] = [];
    if (splitMethod === 'equal') {
      splits = selectedMembers.map(userId => ({ userId }));
    } else {
      splits = selectedMembers.map(userId => ({ userId, value: splitValues[userId] || 0 }));
    }
    await axios.post(
      "/api/expenses",
      {
        groupId: id,
        description,
        amount: parseFloat(amount),
        splits,
        splitMethod,
        paidById: paidById || undefined,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDescription("");
    setAmount("");
    setSelectedMembers([]);
    setSplitValues({});
    setPaidById("");
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

      <form onSubmit={addExpense} className="mb-6 flex flex-col gap-2 max-w-xl">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded w-32"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="font-semibold">Quem pagou?</label>
          <select value={paidById} onChange={e => setPaidById(e.target.value)} className="border p-2 rounded">
            <option value="">Selecione</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>
                {m.user?.name || m.userId}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="font-semibold">Split method:</label>
          <select value={splitMethod} onChange={e => setSplitMethod(e.target.value as any)} className="border p-2 rounded">
            <option value="equal">Equally</option>
            <option value="percentage">By %</option>
            <option value="times">By times</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Select members:</label>
          <div className="flex flex-wrap gap-2">
            {members.map(m => (
              <label key={m.userId} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(m.userId)}
                  onChange={e => {
                    if (e.target.checked) setSelectedMembers([...selectedMembers, m.userId]);
                    else setSelectedMembers(selectedMembers.filter(id => id !== m.userId));
                  }}
                />
                {m.user?.name || m.userId}
              </label>
            ))}
          </div>
        </div>
        {(splitMethod === 'percentage' || splitMethod === 'times') && (
          <div className="flex flex-col gap-1">
            <label className="font-semibold">{splitMethod === 'percentage' ? 'Percentages (%)' : 'Times'} for each member:</label>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map(userId => (
                <div key={userId} className="flex items-center gap-1">
                  <span>{members.find(m => m.userId === userId)?.user?.name || userId}:</span>
                  <input
                    type="number"
                    min="0"
                    max={splitMethod === 'percentage' ? 100 : undefined}
                    value={splitValues[userId] || ''}
                    onChange={e => setSplitValues({ ...splitValues, [userId]: Number(e.target.value) })}
                    className="border p-1 rounded w-16"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded self-start"
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
            <div className="mt-2">
              <span className="font-semibold text-sm">Splits:</span>
              <ul className="ml-4 list-disc">
                {exp.splits.map((s, idx) => (
                  <li key={idx} className="text-xs">
                    {members.find(m => m.userId === s.userId)?.user?.name || s.userId}: ${s.amount}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Quem deve para quem</h2>
      <ul className="space-y-2">
        {settlements.length === 0 && <li className="text-gray-500">Ninguém deve nada!</li>}
        {settlements.map((s, idx) => (
          <li key={idx} className="p-2 bg-gray-100 rounded">
            {s.from.name} deve R$ {s.amount.toFixed(2)} para {s.to.name}
          </li>
        ))}
      </ul>
      <button
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        onClick={() => alert('Funcionalidade de quitar dívidas em breve!')}
      >
        Quitar dívidas
      </button>

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
        {members.map((m) =>
         (
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