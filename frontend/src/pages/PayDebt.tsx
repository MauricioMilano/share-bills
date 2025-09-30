import * as React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PayDebt() {
  const { groupId } = useParams<{ groupId: string }>();
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !fromUserId || !toUserId || !amount) {
      setMessage("Preencha todos os campos.");
      return;
    }
    try {
      await axios.post(
        `/api/groups/${groupId}/payments`,
        { fromUserId, toUserId, amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Pagamento registrado com sucesso!");
      setAmount("");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Erro ao registrar pagamento");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quitar dívida</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Seu ID (fromUserId)"
          value={fromUserId}
          onChange={e => setFromUserId(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="ID do destinatário (toUserId)"
          value={toUserId}
          onChange={e => setToUserId(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Valor"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Quitar
        </button>
        {message && <p className="mt-2 text-blue-600">{message}</p>}
      </form>
    </div>
  );
}
