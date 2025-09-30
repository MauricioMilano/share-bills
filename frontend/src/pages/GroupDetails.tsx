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

export default function GroupDetails() {
  const { id } = useParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const token = localStorage.getItem("token");

  const fetchExpenses = async () => {
    if (!token) return;
    const res = await axios.get(`/api/expenses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data);

    const bal = await axios.get(`/api/api/groups/${id}/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBalances(bal.data);
  };

  useEffect(() => {
    fetchExpenses();
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
            {userId}: {balance}
          </li>
        ))}
      </ul>
    </div>
  );
}