const apiUrl = import.meta.env.VITE_API_URL || "";
import { useEffect, useState } from "react";
import axios from "axios";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = localStorage.getItem("token");
  const [acceptMsg, setAcceptMsg] = useState("");

  const fetchNotifications = async () => {
    if (!token) return;
    const res = await axios.get("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(res.data);
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    await axios.post(
      `${apiUrl}/api/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchNotifications();
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
      fetchNotifications();
    } catch (err: any) {
      setAcceptMsg(err.response?.data?.error || "Erro ao aceitar convite");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`p-4 rounded shadow ${
              n.read ? "bg-gray-200" : "bg-white"
            }`}
          >
            <p>{n.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(n.createdAt).toLocaleString()}
            </p>
            {/* Se for convite de grupo, mostrar botão de aceitar */}
            {n.message.startsWith("Você foi convidado para o grupo: ") && !n.read && (
              <button
                onClick={() => {
                  // Extrair o nome e o ID do grupo da mensagem
                  const match = n.message.match(
                    /^Você foi convidado para o grupo: (.*)\|\|(.*)$/
                  );
                  const groupId = match ? match[2] : null;
                  if (groupId) acceptInvite(groupId);
                }}
                className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
              >
                Aceitar convite
              </button>
            )}
            {!n.read && (
              <button
                onClick={() => markAsRead(n.id)}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded ml-2"
              >
                Marcar como lida
              </button>
            )}
            {acceptMsg && <p className="text-green-600 mt-2">{acceptMsg}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}