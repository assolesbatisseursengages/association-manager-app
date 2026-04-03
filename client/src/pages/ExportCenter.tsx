import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Users, BarChart3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ExportCenter() {
  const [loading, setLoading] = useState<string | null>(null);

  const exportMembersExcelMutation = trpc.exports.exportMembersExcel.useMutation();
  const exportMembersPDFMutation = trpc.exports.exportMembersPDF.useMutation();

  const handleExport = async (
    mutation: any,
    format: "excel" | "pdf",
    type: "members"
  ) => {
    try {
      setLoading(`${type}-${format}`);
      const result = await mutation.mutateAsync({});

      // Decode base64 and create blob
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: result.contentType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Export ${type} en ${format.toUpperCase()} réussi !`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Centre d'Export</h1>
          <p className="text-slate-600">
            Exportez vos données en PDF ou Excel pour les partager et analyser
          </p>
        </div>

        {/* Export Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Members Export Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Adhérents</h3>
                  <p className="text-sm text-slate-600">Liste complète</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleExport(exportMembersExcelMutation, "excel", "members")}
                disabled={loading === "members-excel"}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading === "members-excel" ? "Export en cours..." : "Excel"}
              </Button>
              <Button
                onClick={() => handleExport(exportMembersPDFMutation, "pdf", "members")}
                disabled={loading === "members-pdf"}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading === "members-pdf" ? "Export en cours..." : "PDF"}
              </Button>
            </div>
          </Card>

          {/* Invoices Export Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Factures</h3>
                  <p className="text-sm text-slate-600">Bientôt disponible</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button disabled className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button disabled className="w-full">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </Card>

          {/* Reports Export Card */}
          <Card className="p-6 hover:shadow-lg transition-shadow opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Rapports</h3>
                  <p className="text-sm text-slate-600">Bientôt disponible</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button disabled className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button disabled className="w-full">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">ℹ️ À propos des exports</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Les exports contiennent toutes les données actuelles de votre base</li>
            <li>• Les fichiers Excel peuvent être modifiés et réimportés</li>
            <li>• Les fichiers PDF sont formatés pour l'impression et le partage</li>
            <li>• Les exports sont générés en temps réel avec les données actuelles</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
