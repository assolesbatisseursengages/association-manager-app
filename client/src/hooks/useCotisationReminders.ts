import { useMemo } from "react";

export interface Cotisation {
  id: number;
  memberId: number;
  memberName: string;
  montant: string;
  dateDebut: Date;
  dateFin: Date;
  statut: "payée" | "en attente" | "en retard";
}

export interface CotisationReminder {
  id: number;
  memberId: number;
  memberName: string;
  montant: string;
  daysOverdue: number;
  statut: "en retard" | "expirée bientôt" | "expirée";
}

export function useCotisationReminders(cotisations: Cotisation[]) {
  const reminders = useMemo(() => {
    const now = new Date();
    const reminderList: CotisationReminder[] = [];

    cotisations.forEach((cot) => {
      const dateFin = new Date(cot.dateFin);
      const daysUntilExpiry = Math.floor((dateFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Cotisations en retard (expirées depuis plus de 0 jours)
      if (daysUntilExpiry < 0 && cot.statut !== "payée") {
        reminderList.push({
          id: cot.id,
          memberId: cot.memberId,
          memberName: cot.memberName,
          montant: cot.montant,
          daysOverdue: Math.abs(daysUntilExpiry),
          statut: "en retard",
        });
      }
      // Cotisations expirées bientôt (dans les 7 jours)
      else if (daysUntilExpiry >= 0 && daysUntilExpiry <= 7 && cot.statut === "en attente") {
        reminderList.push({
          id: cot.id,
          memberId: cot.memberId,
          memberName: cot.memberName,
          montant: cot.montant,
          daysOverdue: daysUntilExpiry,
          statut: "expirée bientôt",
        });
      }
    });

    return reminderList;
  }, [cotisations]);

  const overdueCount = reminders.filter((r) => r.statut === "en retard").length;
  const expiringSoonCount = reminders.filter((r) => r.statut === "expirée bientôt").length;
  const totalReminders = reminders.length;

  return {
    reminders,
    overdueCount,
    expiringSoonCount,
    totalReminders,
  };
}
