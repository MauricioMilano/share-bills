const apiUrl = import.meta.env.VITE_API_URL || "";
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export default function Settlements() {
  const { groupId } = useParams<{ groupId: string }>();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !groupId) return;
    axios
      .get(`/api/groups/${groupId}/settlements`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSettlements(res.data));
  }, [groupId, token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quem deve para quem</h1>
      {settlements.length === 0 ? (
        <p className="text-gray-600">Nenhuma dívida pendente neste grupo.</p>
      ) : (
        <ul className="space-y-2">
          {settlements.map((s: Settlement, i: number) => (
            <li key={i} className="p-4 bg-white shadow rounded">
              <span className="font-semibold">{s.from}</span> deve <span className="font-semibold">{s.to}</span> <span className="text-blue-600 font-bold">R$ {s.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
