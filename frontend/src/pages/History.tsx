const apiUrl = import.meta.env.VITE_API_URL || "${apiUrl}";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  paidBy: { name: string };
}

export default function History() {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${apiUrl}/history/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExpenses(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      <ul className="space-y-2">
        {expenses.map((exp) => (
          <li key={exp.id} className="p-4 bg-white shadow rounded">
            <p className="font-semibold">{exp.description}</p>
            <p className="text-gray-600 text-sm">
              {exp.paidBy?.name} paid ${exp.amount}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(exp.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}