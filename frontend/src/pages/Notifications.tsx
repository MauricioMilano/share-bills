const apiUrl = import.meta.env.VITE_API_URL || "${apiUrl}";
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

  const fetchNotifications = async () => {
    if (!token) return;
    const res = await axios.get("${apiUrl}/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(res.data);
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    await axios.post(
      `${apiUrl}/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchNotifications();
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
            className={`p-4 rounded shadow ${n.read ? "bg-gray-200" : "bg-white"}`}
          >
            <p>{n.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(n.createdAt).toLocaleString()}
            </p>
            {!n.read && (
              <button
                onClick={() => markAsRead(n.id)}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
              >
                Mark as read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}