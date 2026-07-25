import React from 'react';
import { TravelExpense, TripParticipant } from '../types';

interface ExpenseListProps {
  expenses: TravelExpense[];
  participants: TripParticipant[];
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, participants }) => {
  const total = expenses.reduce((sum, e) => sum + e.amountEur, 0);

  return (
    <div className="space-y-3 font-sans">
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-mono">Totale Spese Gruppo:</span>
        <strong className="text-emerald-400 font-bold text-sm font-mono">€{total.toFixed(2)}</strong>
      </div>

      <div className="space-y-2">
        {expenses.map((exp) => {
          const payer = participants.find(p => p.id === exp.paidByParticipantId);
          return (
            <div key={exp.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-100 block">{exp.title}</span>
                <span className="text-[10px] text-zinc-400 block font-mono">
                  Pagato da: <strong className="text-sky-300">{payer?.name || 'Utente'}</strong>
                </span>
              </div>
              <strong className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                €{exp.amountEur.toFixed(2)}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};