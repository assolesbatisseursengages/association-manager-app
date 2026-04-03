import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { members } from "../../drizzle/schema";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Router for exporting data to PDF and Excel formats
 */
export const exportsRouter = router({
  /**
   * Export members list to Excel
   */
  exportMembersExcel: protectedProcedure
    .input(z.object({
      format: z.enum(["xlsx", "csv"]).default("xlsx"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        // Fetch all members with their memberships
        const membersData = await db.select().from(members).limit(1000);

        // Prepare data for export
        const exportData = membersData.map((member) => ({
          "ID": member.id,
          "Nom": `${member.firstName} ${member.lastName}`,
          "Email": member.email || "-",
          "Téléphone": member.phone || "-",
          "Rôle": member.role || "-",
          "Statut": member.status || "Actif",
          "Date d'adhésion": member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("fr-FR") : "-",
          "Dernière mise à jour": member.updatedAt ? new Date(member.updatedAt).toLocaleDateString("fr-FR") : "-",
        }));

        // Create workbook
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Adhérents");

        // Set column widths
        ws["!cols"] = [
          { wch: 8 },
          { wch: 20 },
          { wch: 25 },
          { wch: 15 },
          { wch: 15 },
          { wch: 12 },
          { wch: 15 },
          { wch: 15 },
        ];

        // Generate buffer
        const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

        return {
          success: true,
          data: buffer.toString("base64"),
          filename: `adhérents-${new Date().toISOString().split("T")[0]}.xlsx`,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };
      } catch (error) {
        console.error("[Export] Members Excel failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to export members: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Export members list to PDF
   */
  exportMembersPDF: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      // Fetch all members
      const membersData = await db.select().from(members).limit(1000);

      // Create PDF
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Liste des Adhérents", 14, 15);
      doc.setFontSize(10);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 25);

      // Prepare table data
      const tableData = membersData.map((member) => [
        `${member.firstName} ${member.lastName}`,
        member.email || "-",
        member.phone || "-",
        member.role || "-",
        member.status || "Actif",
      ]);

      // Add table
      (doc as any).autoTable({
        head: [["Nom", "Email", "Téléphone", "Rôle", "Statut"]],
        body: tableData,
        startY: 35,
        margin: { top: 35, right: 14, bottom: 14, left: 14 },
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      // Generate buffer
      const buffer = doc.output("arraybuffer");

      return {
        success: true,
        data: Buffer.from(buffer).toString("base64"),
        filename: `adhérents-${new Date().toISOString().split("T")[0]}.pdf`,
        contentType: "application/pdf",
      };
    } catch (error) {
      console.error("[Export] Members PDF failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to export members PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  // Additional export methods can be added here for invoices and contributions
  // when their tables are properly integrated
});
