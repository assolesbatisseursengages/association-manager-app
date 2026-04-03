import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    errors: string[];
  }>({ score: 0, errors: [] });

  const registerMutation = trpc.localAuth.register.useMutation();

  const checkPasswordStrength = (pwd: string) => {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push("Au moins 8 caractères");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Une lettre majuscule");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Une lettre minuscule");
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("Un chiffre");
    }
    if (!/[!@#$%^&*]/.test(pwd)) {
      errors.push("Un caractère spécial");
    }

    const score = 5 - errors.length;
    setPasswordStrength({ score: Math.max(0, score), errors });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!name || !email || !password || !confirmPassword) {
        setError("Veuillez remplir tous les champs");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        setIsLoading(false);
        return;
      }

      if (passwordStrength.errors.length > 0) {
        setError(`Le mot de passe doit contenir : ${passwordStrength.errors.join(", ")}`);
        setIsLoading(false);
        return;
      }

      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
      });

      if (result.success) {
        // Store session token in localStorage
        localStorage.setItem("sessionToken", result.sessionToken);
        localStorage.setItem("userId", result.userId.toString());

        toast.success("Enregistrement réussi! Bienvenue!");
        setLocation("/");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Erreur lors de l'enregistrement";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return "bg-red-500";
    if (passwordStrength.score <= 2) return "bg-orange-500";
    if (passwordStrength.score <= 3) return "bg-yellow-500";
    if (passwordStrength.score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Les Bâtisseurs Engagés</h1>
          <p className="text-slate-400">Créer un compte</p>
        </div>

        {/* Register Card */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Enregistrement</CardTitle>
            <CardDescription className="text-slate-400">
              Créez un nouveau compte pour accéder à l'application
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-900">{error}</AlertDescription>
                </Alert>
              )}

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Nom complet
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>

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
                    onChange={handlePasswordChange}
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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i < passwordStrength.score ? getPasswordStrengthColor() : "bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.errors.length > 0 && (
                      <div className="text-xs text-slate-400">
                        <p className="font-medium mb-1">Le mot de passe doit contenir :</p>
                        <ul className="space-y-1">
                          {passwordStrength.errors.map((error, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="text-orange-400">•</span> {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {passwordStrength.errors.length === 0 && password && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Mot de passe fort
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || passwordStrength.errors.length > 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement en cours...
                  </>
                ) : (
                  "S'enregistrer"
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-slate-400">
                  Vous avez déjà un compte ?{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/login")}
                    className="text-green-400 hover:text-green-300 font-medium"
                  >
                    Se connecter
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
