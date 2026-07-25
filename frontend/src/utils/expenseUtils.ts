import { TravelExpense, TripParticipant } from '../types';

export interface DebtSettlement {
  fromParticipantId: string;
  fromName: string;
  toParticipantId: string;
  toName: string;
  amountEur: number;
}

export interface ParticipantSummary {
  participant: TripParticipant;
  totalPaidEur: number;
  totalSharedShareEur: number;
  personalExpensesEur: number;
  netBalanceEur: number; // positive = creditor (is owed), negative = debtor (owes)
}

export function calculateTripBalances(
  expenses: TravelExpense[],
  participants: TripParticipant[]
): {
  participantSummaries: ParticipantSummary[];
  settlements: DebtSettlement[];
  totalGroupExpensesEur: number;
} {
  const summariesMap: Record<string, ParticipantSummary> = {};

  participants.forEach(p => {
    summariesMap[p.id] = {
      participant: p,
      totalPaidEur: 0,
      totalSharedShareEur: 0,
      personalExpensesEur: 0,
      netBalanceEur: 0
    };
  });

  let totalGroupExpensesEur = 0;

  expenses.forEach(exp => {
    const payerId = exp.paidByParticipantId || participants[0]?.id || 'p1';
    
    if (!exp.isShared) {
      // Personal expense
      if (summariesMap[payerId]) {
        summariesMap[payerId].personalExpensesEur += exp.amountEur;
      }
    } else {
      // Shared expense
      totalGroupExpensesEur += exp.amountEur;
      
      // Credit the payer
      if (summariesMap[payerId]) {
        summariesMap[payerId].totalPaidEur += exp.amountEur;
      }

      // Determine who splits this expense
      const splitTargets = (exp.splitWithParticipantIds && exp.splitWithParticipantIds.length > 0)
        ? exp.splitWithParticipantIds
        : participants.map(p => p.id);

      const splitCount = splitTargets.length;
      if (splitCount > 0) {
        const perPersonShare = exp.amountEur / splitCount;
        splitTargets.forEach(pId => {
          if (summariesMap[pId]) {
            summariesMap[pId].totalSharedShareEur += perPersonShare;
          }
        });
      }
    }
  });

  // Calculate net balance for each participant
  const participantSummaries = Object.values(summariesMap).map(s => {
    const netBalanceEur = s.totalPaidEur - s.totalSharedShareEur;
    return {
      ...s,
      netBalanceEur: Number(netBalanceEur.toFixed(2))
    };
  });

  // Calculate settlements ("Chi deve a chi")
  const debtors = participantSummaries
    .filter(s => s.netBalanceEur < -0.009)
    .map(s => ({ id: s.participant.id, name: s.participant.name, amount: Math.abs(s.netBalanceEur) }));

  const creditors = participantSummaries
    .filter(s => s.netBalanceEur > 0.009)
    .map(s => ({ id: s.participant.id, name: s.participant.name, amount: s.netBalanceEur }));

  const settlements: DebtSettlement[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        fromParticipantId: debtor.id,
        fromName: debtor.name,
        toParticipantId: creditor.id,
        toName: creditor.name,
        amountEur: Number(amount.toFixed(2))
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return {
    participantSummaries,
    settlements,
    totalGroupExpensesEur: Number(totalGroupExpensesEur.toFixed(2))
  };
}
