import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddExpense from "../components/group/AddExpense";
import GroupMembers from "../components/group/GroupMembers";
import ExpensesList from "../components/group/ExpensesList";
import ExpenseReport from "../components/group/ExpenseReport";
import InviteMemberModal from "../components/group/InviteMemberModal";

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
  // Expense form state moved to AddExpense component
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [inviteUserId, setInviteUserId] = useState("");
  const [memberMsg, setMemberMsg] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const token = localStorage.getItem("token");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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



  // Form state moved to AddExpense

  // Expense logic moved to AddExpense

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
      <AddExpense
        members={members.filter(m => m.status !== "PENDING")}
        groupId={id as string}
        onExpenseAdded={fetchExpenses}
      />
      <ExpensesList expenses={expenses} members={members} />
      <ExpenseReport settlements={settlements} />
      <button
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        onClick={async () => {
          if (!token) return;
          await axios.post(`/api/expenses/${id}/settle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchExpenses();
        }}
      >
        Quitar dívidas
      </button>
      <GroupMembers members={members} onRemove={removeMember} />
      <button
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setInviteModalOpen(true)}
      >
        Convidar membro
      </button>
      <InviteMemberModal
        users={users}
        inviteUserId={inviteUserId}
        setInviteUserId={setInviteUserId}
        onInvite={e => {
          inviteMember(e);
          setInviteModalOpen(false);
        }}
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        memberMsg={memberMsg}
      />
    </div>
  );
}