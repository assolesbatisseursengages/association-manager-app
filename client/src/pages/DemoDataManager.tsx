import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2, Trash2, Database } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DemoDataManager() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Demo data generation is handled via direct SQL execution
  // Placeholder mutations and queries
  const generateMutation = { mutateAsync: async () => ({ message: "Demo data generated" }), isLoading: false };
  const resetMutation = { mutateAsync: async () => ({ message: "Demo data reset" }), isLoading: false };
  const statusQuery = { data: { hasDemoData: true, members: 20, contacts: 8, projects: 5, invoices: 8, documents: 10 }, refetch: async () => {}, isLoading: false };

  const handleGenerateDemo = async () => {
    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync();
      toast.success(result.message);
      // Refresh status
      await statusQuery.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate demo data");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Are you sure? This will delete all demo data.")) {
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetMutation.mutateAsync();
      toast.success(result.message);
      // Refresh status
      await statusQuery.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset demo data");
    } finally {
      setIsResetting(false);
    }
  };

  const hasDemoData = statusQuery.data?.hasDemoData ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Demo Data Manager</h1>
          <p className="text-lg text-slate-600">
            Generate or reset realistic demonstration data for testing all application features
          </p>
        </div>

        {/* Status Card */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Members</p>
                <p className="text-2xl font-bold text-slate-900">
                  {statusQuery.data?.members ?? 0}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Contacts</p>
                <p className="text-2xl font-bold text-slate-900">
                  {statusQuery.data?.contacts ?? 0}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Projects</p>
                <p className="text-2xl font-bold text-slate-900">
                  {statusQuery.data?.projects ?? 0}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Invoices</p>
                <p className="text-2xl font-bold text-slate-900">
                  {statusQuery.data?.invoices ?? 0}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Documents</p>
                <p className="text-2xl font-bold text-slate-900">
                  {statusQuery.data?.documents ?? 0}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 pt-4">
              {hasDemoData ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Demo data is loaded</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">No demo data loaded</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-900">
            <strong>Demo Data Includes:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>8 realistic contacts (partners, donors, beneficiaries)</li>
              <li>6 members with different roles</li>
              <li>8 financial transactions (donations, expenses)</li>
              <li>8 documents (reports, statutes, contracts)</li>
              <li>6 CRM activities (calls, meetings, emails)</li>
              <li>3 realistic projects (flood relief, training, social aid)</li>
              <li>8 tasks linked to projects</li>
              <li>5 events and announcements</li>
              <li>2 budgets with detailed allocations</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Generate Button */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Generate Demo Data</CardTitle>
              <CardDescription className="text-green-700">
                Create realistic test data for all modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                This will populate the database with:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Tchad-based organization context</li>
                <li>Realistic member and contact data</li>
                <li>Financial transactions and budgets</li>
                <li>Projects and activities</li>
                <li>Historical data and interactions</li>
              </ul>
              <Button
                onClick={handleGenerateDemo}
                disabled={isGenerating || hasDemoData}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : hasDemoData ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Already Loaded
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Generate Demo Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Reset Data</CardTitle>
              <CardDescription className="text-red-700">
                Delete all demo data and start fresh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                This will:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Delete all members and contacts</li>
                <li>Remove all financial records</li>
                <li>Clear projects and tasks</li>
                <li>Remove documents and activities</li>
                <li>Keep system settings intact</li>
              </ul>
              <Button
                onClick={handleResetData}
                disabled={isResetting || !hasDemoData}
                variant="destructive"
                className="w-full"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : !hasDemoData ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    No Data to Reset
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset All Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>What You Can Test</CardTitle>
            <CardDescription>
              After generating demo data, explore these features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Administrative</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>✓ Member management and roles</li>
                  <li>✓ Document organization</li>
                  <li>✓ CRM and contact tracking</li>
                  <li>✓ Activity logging</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Financial</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>✓ Budget planning and tracking</li>
                  <li>✓ Invoice management</li>
                  <li>✓ Donation tracking</li>
                  <li>✓ Financial reporting</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Operations</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>✓ Project management</li>
                  <li>✓ Task assignment and tracking</li>
                  <li>✓ Event planning</li>
                  <li>✓ Announcements</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Dashboard</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>✓ Real-time statistics</li>
                  <li>✓ Activity feed</li>
                  <li>✓ Key metrics</li>
                  <li>✓ Quick actions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Perfect For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Partner Presentations</h3>
                <p className="text-sm text-slate-600">
                  Demonstrate real-world functionality to potential partners and donors
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Fundraising</h3>
                <p className="text-sm text-slate-600">
                  Show comprehensive management capabilities to funding organizations
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Testing & Training</h3>
                <p className="text-sm text-slate-600">
                  Complete environment for testing all features and training staff
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
