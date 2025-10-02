import React from "react";

interface GroupMembersProps {
  members: any[];
  onRemove: (memberId: string) => void;
}

const GroupMembers: React.FC<GroupMembersProps> = ({ members, onRemove }) => (
  <div>
    <h2 className="text-xl font-semibold mb-2 mt-8">Membros do grupo</h2>
    <ul className="space-y-2 mb-6">
      {members.map((m) => (
        <li
          key={m.id}
          className="p-4 bg-white shadow rounded flex justify-between items-center"
        >
          <div>
            <span className="font-semibold">{m.user ? m.user.name : "Usuário desconhecido"}</span> ({m.user ? m.user.email : "sem email"})
            <span className="ml-2 text-xs text-gray-500">
              [{m.role}] {m.status === "PENDING" ? <span className="text-yellow-600">[PENDING]</span> : null}
            </span>
          </div>
          <button
            className="bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => onRemove(m.id)}
          >
            Remover
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default GroupMembers;
