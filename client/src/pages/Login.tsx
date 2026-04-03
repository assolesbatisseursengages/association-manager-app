import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.localAuth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError("Veuillez remplir tous les champs");
        setIsLoading(false);
        return;
      }

      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.success) {
        // Store session token in localStorage
        localStorage.setItem("sessionToken", result.sessionToken);
        localStorage.setItem("userId", result.userId.toString());
        localStorage.setItem("userName", result.name);

        toast.success("Connexion réussie!");
        setLocation("/");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erreur lors de la connexion";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Les Bâtisseurs Engagés</h1>
          <p className="text-slate-400">Plateforme de Gestion d'Association</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Connexion</CardTitle>
            <CardDescription className="text-slate-400">
              Connectez-vous à votre compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-900">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-slate-400">
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/register")}
                    className="text-green-400 hover:text-green-300 font-medium"
                  >
                    S'enregistrer
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>© 2024 Les Bâtisseurs Engagés. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
