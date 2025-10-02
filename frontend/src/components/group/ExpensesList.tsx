import React from "react";

interface ExpensesListProps {
  expenses: any[];
  members: any[];
}

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, members }) => (
  <div>
    <h2 className="text-xl font-semibold mb-2">Expenses</h2>
    <ul className="space-y-2 mb-6">
      {expenses.map((exp) => (
        <li key={exp.id} className="p-4 bg-white shadow rounded">
          <p className="font-semibold">{exp.description}</p>
          <p className="text-gray-600 text-sm">Amount: ${exp.amount}</p>
          <p className="text-gray-600 text-sm">Paid by: {exp.paidBy?.name}</p>
          <div className="mt-2">
            <span className="font-semibold text-sm">Splits:</span>
            <ul className="ml-4 list-disc">
              {exp.splits.map((s: any, idx: number) => (
                <li key={idx} className="text-xs">
                  {members.find((m: any) => m.userId === s.userId)?.user?.name || s.userId}: ${s.amount}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default ExpensesList;
