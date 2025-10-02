import React, { useState } from "react";

interface InviteMemberModalProps {
  users: any[];
  inviteUserId: string;
  setInviteUserId: (id: string) => void;
  onInvite: (e: React.FormEvent) => void;
  open: boolean;
  onClose: () => void;
  memberMsg: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  users,
  inviteUserId,
  setInviteUserId,
  onInvite,
  open,
  onClose,
  memberMsg,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
        <form onSubmit={onInvite} className="mb-4 flex gap-2 flex-col">
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
      </div>
    </div>
  );
};

export default InviteMemberModal;
