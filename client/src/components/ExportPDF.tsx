import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportPDFProps {
  title: string;
  data: any;
  type: "documents" | "members";
}

export function ExportPDF({ title, data, type }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    
    try {
      // Create printable HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              color: #1a1a1a;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              padding-bottom: 20px;
              border-bottom: 3px solid #1a4d2e;
            }
            .header h1 { 
              color: #1a4d2e; 
              font-size: 28px;
              margin-bottom: 8px;
            }
            .header .subtitle {
              color: #666;
              font-size: 14px;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin-bottom: 40px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .stat-item {
              text-align: center;
            }
            .stat-value {
              font-size: 32px;
              font-weight: bold;
              color: #1a4d2e;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th { 
              background: #1a4d2e; 
              color: white; 
              padding: 12px 8px; 
              text-align: left;
              font-weight: 600;
            }
            td { 
              padding: 10px 8px; 
              border-bottom: 1px solid #e5e7eb;
            }
            tr:nth-child(even) { 
              background: #f9fafb; 
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
            }
            .badge-urgent { background: #fee2e2; color: #991b1b; }
            .badge-high { background: #ffedd5; color: #9a3412; }
            .badge-medium { background: #e0f2fe; color: #075985; }
            .badge-low { background: #f1f5f9; color: #475569; }
            .badge-completed { background: #d1fae5; color: #065f46; }
            .badge-in-progress { background: #dbeafe; color: #1e40af; }
            .badge-pending { background: #fef3c7; color: #92400e; }
            .badge-active { background: #d1fae5; color: #065f46; }
            .badge-inactive { background: #f1f5f9; color: #475569; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 11px;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
      `;

      if (type === "documents" && data.documents) {
        htmlContent += `
          <div class="header">
            <h1>Association Manager</h1>
            <p class="subtitle">Rapport des Documents - ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${data.stats?.total || 0}</div>
              <div class="stat-label">Total</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${data.stats?.completed || 0}</div>
              <div class="stat-label">Complétés</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${data.stats?.inProgress || 0}</div>
              <div class="stat-label">En cours</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${data.stats?.pending || 0}</div>
              <div class="stat-label">En attente</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${data.stats?.urgent || 0}</div>
              <div class="stat-label">Urgents</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Fichier</th>
              </tr>
            </thead>
            <tbody>
              ${data.documents.map((doc: any) => `
                <tr>
                  <td>
                    <strong>${doc.title}</strong>
                    ${doc.description ? `<br><small style="color:#666">${doc.description.substring(0, 50)}${doc.description.length > 50 ? '...' : ''}</small>` : ''}
                  </td>
                  <td>${doc.category}</td>
                  <td>
                    <span class="badge badge-${doc.status === 'Complété' ? 'completed' : doc.status === 'En cours' ? 'in-progress' : 'pending'}">
                      ${doc.status}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-${doc.priority === 'Urgent' ? 'urgent' : doc.priority === 'Haute' ? 'high' : doc.priority === 'Moyenne' ? 'medium' : 'low'}">
                      ${doc.priority}
                    </span>
                  </td>
                  <td>${doc.hasFile ? '✓' : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else if (type === "members" && data.members) {
        htmlContent += `
          <div class="header">
            <h1>Association Manager</h1>
            <p class="subtitle">Liste des Membres - ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${data.total || 0}</div>
              <div class="stat-label">Total Membres</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
                <th>Fonction</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${data.members.map((member: any) => `
                <tr>
                  <td><strong>${member.fullName}</strong></td>
                  <td>${member.role}</td>
                  <td>${member.function || '-'}</td>
                  <td>${member.email || '-'}</td>
                  <td>${member.phone || '-'}</td>
                  <td>
                    <span class="badge badge-${member.status === 'Actif' ? 'active' : 'inactive'}">
                      ${member.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      htmlContent += `
          <div class="footer">
            <p>Généré le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            <p>Association Manager - Gestion d'Association</p>
          </div>
        </body>
        </html>
      `;

      // Open print dialog
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
        };
        
        toast.success("Rapport généré avec succès");
      } else {
        toast.error("Impossible d'ouvrir la fenêtre d'impression");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={generatePDF}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      Exporter PDF
    </Button>
  );
}
