import React from "react";

interface ExpenseReportProps {
  settlements: any[];
}

const ExpenseReport: React.FC<ExpenseReportProps> = ({ settlements }) => (
  <div>
    <h2 className="text-xl font-semibold mb-2">Quem deve para quem</h2>
    <ul className="space-y-2">
      {settlements.length === 0 && <li className="text-gray-500">Ninguém deve nada!</li>}
      {settlements.map((s, idx) => (
        <li key={idx} className="p-2 bg-gray-100 rounded">
          {s.from.name} deve R$ {s.amount.toFixed(2)} para {s.to.name}
        </li>
      ))}
    </ul>
  </div>
);

export default ExpenseReport;
