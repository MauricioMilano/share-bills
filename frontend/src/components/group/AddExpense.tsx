import React, { useState } from "react";

interface AddExpenseProps {
  members: any[];
  groupId: string;
  onExpenseAdded: () => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ members, groupId, onExpenseAdded }) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'times'>('equal');
  const [splitValues, setSplitValues] = useState<Record<string, number>>({});
  const [formError, setFormError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const validateExpense = () => {
    if (!description.trim()) return "A descrição é obrigatória.";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return "O valor deve ser maior que zero.";
    if (!paidById) return "Selecione quem pagou.";
    if (selectedMembers.length === 0) return "Selecione pelo menos um membro para dividir.";
    if (splitMethod === 'percentage') {
      const totalPercent = selectedMembers.reduce((acc, userId) => acc + (Number(splitValues[userId]) || 0), 0);
      if (totalPercent !== 100) return "A soma das porcentagens deve ser 100%.";
    }
    if (splitMethod === 'times') {
      if (selectedMembers.some(userId => !splitValues[userId] || splitValues[userId] <= 0)) {
        return "Todos os valores devem ser maiores que zero.";
      }
    }
    return "";
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!token) return;
    const validationMsg = validateExpense();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }
    setIsSubmitting(true);
    try {
      let splits: any[] = [];
      if (splitMethod === 'equal') {
        splits = selectedMembers.map(userId => ({ userId }));
      } else {
        splits = selectedMembers.map(userId => ({ userId, value: splitValues[userId] ?? 0 }));
      }
      await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
          description,
          amount: parseFloat(amount),
          splits,
          splitMethod,
          paidById: paidById || undefined,
        }),
      });
      setDescription("");
      setAmount("");
      setSelectedMembers([]);
      setSplitValues({});
      setPaidById("");
      setOpen(false);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err: any) {
      setFormError("Erro ao adicionar despesa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setOpen(true)}
      >
        Adicionar Despesa
      </button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
            <form onSubmit={addExpense} className="flex flex-col gap-2">
              {formError && <div className="text-red-600 font-semibold">{formError}</div>}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border p-2 rounded w-32"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="font-semibold">Quem pagou?</label>
                <select value={paidById} onChange={e => setPaidById(e.target.value)} className="border p-2 rounded">
                  <option value="">Selecione</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.name || m.userId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <label className="font-semibold">Split method:</label>
                <select value={splitMethod} onChange={e => setSplitMethod(e.target.value as any)} className="border p-2 rounded">
                  <option value="equal">Equally</option>
                  <option value="percentage">By %</option>
                  <option value="times">By times</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Select members:</label>
                <div className="flex flex-wrap gap-2">
                  {members.map(m => (
                    <label key={m.userId} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(m.userId)}
                        onChange={e => {
                          if (e.target.checked) setSelectedMembers([...selectedMembers, m.userId]);
                          else setSelectedMembers(selectedMembers.filter(id => id !== m.userId));
                        }}
                      />
                      {m.user?.name || m.userId}
                    </label>
                  ))}
                </div>
              </div>
              {(splitMethod === 'percentage' || splitMethod === 'times') && (
                <div className="flex flex-col gap-1">
                  <label className="font-semibold">{splitMethod === 'percentage' ? 'Percentages (%)' : 'Times'} for each member:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map(userId => (
                      <div key={userId} className="flex items-center gap-1">
                        <span>{members.find(m => m.userId === userId)?.user?.name || userId}:</span>
                        <input
                          type="number"
                          min="0"
                          max={splitMethod === 'percentage' ? 100 : undefined}
                          value={splitValues[userId] || ''}
                          onChange={e => setSplitValues({ ...splitValues, [userId]: Number(e.target.value) })}
                          className="border p-1 rounded w-16"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="submit"
                className={`px-4 py-2 rounded self-start text-white 
                  ${!!validateExpense() || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'}
                `}
                disabled={!!validateExpense() || isSubmitting}
              >
                {isSubmitting ? 'Adicionando...' : 'Adicionar despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddExpense;
