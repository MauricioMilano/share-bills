const apiUrl = import.meta.env.VITE_API_URL || "";
import { useEffect, useState } from "react";
import axios from "axios";

interface Group {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

export default function Dashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch groups
    axios
      .get(`${apiUrl}/api/groups`, { headers })
      .then((res) => setGroups(res.data.slice(0, 3)));

    // Fetch notifications
    axios
      .get(`${apiUrl}/api/notifications`, { headers })
      .then((res) => setNotifications(res.data.slice(0, 3)));

    // Fetch balances summary (sum of all balances across groups)
    (async () => {
      let totalBalances: Record<string, number> = {};
      for (const g of groups) {
        const res = await axios.get(`${apiUrl}/api/groups/${g.id}/balance`, {
          headers,
        });
        for (const [uid, bal] of Object.entries(res.data)) {
          totalBalances[uid] = (totalBalances[uid] || 0) + (bal as number);
        }
      }
      setBalances(totalBalances);
    })();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Groups</h2>
        <ul className="space-y-2">
          {groups.map((g) => (
            <li key={g.id} className="p-3 bg-white shadow rounded">
              {g.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Notifications</h2>
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="p-3 bg-gray-100 rounded">
              {n.message} – {new Date(n.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Balances Overview</h2>
        <ul className="space-y-2">
          {Object.entries(balances).map(([uid, bal]) => (
            <li key={uid} className="p-2 bg-white shadow rounded">
              {uid}: {bal}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}