import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Transaction {
  id: number;
  type: "cotisation" | "don" | "dépense";
  montant: string;
  description: string;
  date: Date;
}

interface FinanceReportPDFProps {
  transactions: Transaction[];
  totalCotisations: number;
  totalDons: number;
  totalDépenses: number;
  solde: number;
}

export function FinanceReportPDF({
  transactions,
  totalCotisations,
  totalDons,
  totalDépenses,
  solde,
}: FinanceReportPDFProps) {
  const generatePDF = () => {
    // Créer le contenu HTML pour le PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #3b82f6; }
          h2 { color: #1f2937; margin-top: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .summary-item { padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .summary-item label { font-weight: bold; display: block; margin-bottom: 5px; }
          .summary-item value { font-size: 18px; color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #3b82f6; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #f9fafb; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>RAPPORT FINANCIER</h1>
        <p style="text-align: center; color: #6b7280;">Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
        
        <h2>RÉSUMÉ FINANCIER</h2>
        <div class="summary">
          <div class="summary-item">
            <label>Cotisations totales</label>
            <value class="positive">${totalCotisations}F</value>
          </div>
          <div class="summary-item">
            <label>Dons totaux</label>
            <value class="positive">${totalDons}F</value>
          </div>
          <div class="summary-item">
            <label>Dépenses totales</label>
            <value class="negative">${totalDépenses}F</value>
          </div>
          <div class="summary-item">
            <label>Solde</label>
            <value class="${solde >= 0 ? "positive" : "negative"}">${solde}F</value>
          </div>
        </div>

        <h2>DÉTAIL DES TRANSACTIONS</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (t) => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString("fr-FR")}</td>
                <td>${t.type === "cotisation" ? "Cotisation" : t.type === "don" ? "Don" : "Dépense"}</td>
                <td>${t.description}</td>
                <td class="${t.type === "dépense" ? "negative" : "positive"}">${t.montant}F</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Ce rapport a été généré automatiquement par l'application de gestion de l'association.</p>
        </div>
      </body>
      </html>
    `;

    // Créer une fenêtre pour l'impression
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" size="sm" className="gap-2">
      <Download className="h-4 w-4" />
      Exporter en PDF
    </Button>
  );
}
