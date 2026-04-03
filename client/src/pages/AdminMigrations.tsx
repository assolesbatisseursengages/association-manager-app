import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMigrations() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: user } = trpc.auth.me.useQuery();

  // Check if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAdmin(true);
    }
  }, [user]);

  const runMigrationsMutation = trpc.admin.runMigrations.useMutation({
    onSuccess: (data: any) => {
      setIsRunning(false);
      setResult(data);
      toast.success('✅ Migrations completed successfully!');
    },
    onError: (error: any) => {
      setIsRunning(false);
      toast.error(`❌ Migration failed: ${error.message}`);
      setResult({
        success: false,
        message: error.message,
      });
    },
  });

  const handleRunMigrations = () => {
    setIsRunning(true);
    setResult(null);
    runMigrationsMutation.mutate(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Database Migrations</h1>
          </div>
          <p className="text-slate-600">
            Execute database migrations to create all necessary tables for the application
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Run Migrations
            </CardTitle>
            <CardDescription>
              This will create all required database tables if they don't already exist
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Warning Alert */}
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> This operation will create tables that don't exist. 
                Existing tables will not be affected. Make sure you have a backup of your database before proceeding.
              </AlertDescription>
            </Alert>

            {/* Run Button */}
            <div className="mb-6">
              <Button
                onClick={handleRunMigrations}
                disabled={isRunning}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Migrations...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Execute Migrations
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-4">
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-start gap-3 mb-4">
                    {result.success ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-900">Migrations Completed</h3>
                          <p className="text-sm text-green-700 mt-1">{result.message}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-red-900">Migration Failed</h3>
                          <p className="text-sm text-red-700 mt-1">{result.message}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Statistics */}
                  {(result.successCount !== undefined || result.errorCount !== undefined) && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-sm text-green-600 font-medium">Successful</div>
                        <div className="text-2xl font-bold text-green-700">{result.successCount || 0}</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="text-sm text-red-600 font-medium">Failed</div>
                        <div className="text-2xl font-bold text-red-700">{result.errorCount || 0}</div>
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4 bg-red-50 rounded-lg p-4 border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2">Error Details:</h4>
                      <ul className="space-y-1">
                        {result.errors.map((error: string, index: number) => (
                          <li key={index} className="text-sm text-red-700">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">What will be created:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ 32 database tables</li>
                <li>✓ User and authentication tables</li>
                <li>✓ Members, projects, and tasks tables</li>
                <li>✓ Financial and document management tables</li>
                <li>✓ CRM and notification tables</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Need help? Check the documentation or contact support</p>
        </div>
      </div>
    </div>
  );
}
