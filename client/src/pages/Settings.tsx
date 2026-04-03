import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsIcon, LogOut, Moon, Sun, Globe, Wifi, Download, Upload, Save, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [currency, setCurrency] = useState<'EUR' | 'CFA'>('EUR');
  const [exchangeRate, setExchangeRate] = useState('655.957');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingAssociation, setIsLoadingAssociation] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [associationFormData, setAssociationFormData] = useState({
    name: "Les Bâtisseurs Engagés",
    primaryColor: "#1a4d2e",
    secondaryColor: "#f0f0f0",
    accentColor: "#d97706",
    contactEmail: "contact.lesbatisseursengages@gmail.com",
    contactPhone: "+235 62 00 00 00",
    website: "www.lesbatisseursengage.com",
    address: "N'djaména",
    city: "N'djaména",
    country: "Tchad",
    description: "Association pour l'aide humanitaire et le développement",
    theme: "light" as "light" | "dark",
    language: "fr",
    timezone: "Africa/Ndjamena",
  });

  const { data: settings, isLoading } = trpc.globalSettings.get.useQuery();
  const { data: associationSettings, isLoading: isLoadingAssociationSettings } = trpc.associationSettings.getSettings.useQuery();
  const updateSettings = trpc.globalSettings.update.useMutation({
    onSuccess: () => {
      toast.success('Paramètres sauvegardés');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });
  const updateAssociationMutation = trpc.associationSettings.updateSettings.useMutation();
  const uploadLogoMutation = trpc.associationSettings.uploadLogo.useMutation();

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as 'EUR' | 'CFA' | null;
    if (savedCurrency) setCurrency(savedCurrency);
    
    const savedRate = localStorage.getItem('exchangeRate');
    if (savedRate) setExchangeRate(savedRate);
  }, []);

  useEffect(() => {
    if (associationSettings) {
      setAssociationFormData((prev) => ({
        ...prev,
        name: associationSettings.name || prev.name,
        primaryColor: associationSettings.primaryColor || prev.primaryColor,
        secondaryColor: associationSettings.secondaryColor || prev.secondaryColor,
        accentColor: associationSettings.accentColor || prev.accentColor,
        contactEmail: associationSettings.contactEmail || prev.contactEmail,
        contactPhone: associationSettings.contactPhone || prev.contactPhone,
        website: associationSettings.website || prev.website,
        address: associationSettings.address || prev.address,
        city: associationSettings.city || prev.city,
        country: associationSettings.country || prev.country,
        description: associationSettings.description || prev.description,
        theme: associationSettings.theme || prev.theme,
        language: associationSettings.language || prev.language,
        timezone: associationSettings.timezone || prev.timezone,
      }));
      if (associationSettings.logoUrl) {
        setLogoPreview(associationSettings.logoUrl);
      }
    }
  }, [associationSettings]);

  const handleSaveSettings = () => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('exchangeRate', exchangeRate);
    toast.success('Paramètres sauvegardés localement');
  };

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
  };

  const handleExportData = () => {
    toast.info('Fonction d\'export en développement');
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssociationInputChange = (field: string, value: string) => {
    setAssociationFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAssociation = async () => {
    setIsLoadingAssociation(true);
    try {
      // Upload logo if changed
      if (logoFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          await uploadLogoMutation.mutateAsync({
            fileName: logoFile.name,
            mimeType: logoFile.type,
            base64Data: base64,
          });
        };
        reader.readAsDataURL(logoFile);
      }

      // Update settings
      await updateAssociationMutation.mutateAsync({
        name: associationFormData.name,
        primaryColor: associationFormData.primaryColor,
        secondaryColor: associationFormData.secondaryColor,
        accentColor: associationFormData.accentColor,
        contactEmail: associationFormData.contactEmail,
        contactPhone: associationFormData.contactPhone,
        website: associationFormData.website,
        address: associationFormData.address,
        city: associationFormData.city,
        country: associationFormData.country,
        description: associationFormData.description,
        theme: associationFormData.theme,
        language: associationFormData.language,
        timezone: associationFormData.timezone,
      });

      toast.success("Paramètres de l'association sauvegardés avec succès");
      setLogoFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsLoadingAssociation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos préférences, paramètres personnels et paramètres de l'association
        </p>
      </div>

      {/* Association Settings Section */}
      {isLoadingAssociationSettings ? (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle>Logo de l'Association</CardTitle>
              <CardDescription>Téléchargez un logo pour votre association</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-6">
                {/* Logo Preview */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">Aucun logo</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Input */}
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-slate-700">
                      Sélectionner un fichier
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="mt-2 w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un fichier
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600">
                    Formats acceptés: PNG, JPG, SVG (max 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>Détails de base de votre association</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assoc-name" className="text-slate-700">
                    Nom de l'Association
                  </Label>
                  <Input
                    id="assoc-name"
                    value={associationFormData.name}
                    onChange={(e) => handleAssociationInputChange("name", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="assoc-website" className="text-slate-700">
                    Site Web
                  </Label>
                  <Input
                    id="assoc-website"
                    value={associationFormData.website}
                    onChange={(e) => handleAssociationInputChange("website", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="assoc-email" className="text-slate-700">
                    Email de Contact
                  </Label>
                  <Input
                    id="assoc-email"
                    type="email"
                    value={associationFormData.contactEmail}
                    onChange={(e) => handleAssociationInputChange("contactEmail", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="assoc-phone" className="text-slate-700">
                    Téléphone
                  </Label>
                  <Input
                    id="assoc-phone"
                    value={associationFormData.contactPhone}
                    onChange={(e) => handleAssociationInputChange("contactPhone", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="assoc-description" className="text-slate-700">
                  Description
                </Label>
                <textarea
                  id="assoc-description"
                  value={associationFormData.description}
                  onChange={(e) => handleAssociationInputChange("description", e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>Personnalisez les couleurs et le thème</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary-color" className="text-slate-700">
                    Couleur Primaire
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={associationFormData.primaryColor}
                      onChange={(e) => handleAssociationInputChange("primaryColor", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={associationFormData.primaryColor}
                      onChange={(e) => handleAssociationInputChange("primaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color" className="text-slate-700">
                    Couleur Secondaire
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={associationFormData.secondaryColor}
                      onChange={(e) => handleAssociationInputChange("secondaryColor", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={associationFormData.secondaryColor}
                      onChange={(e) => handleAssociationInputChange("secondaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color" className="text-slate-700">
                    Couleur d'Accent
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={associationFormData.accentColor}
                      onChange={(e) => handleAssociationInputChange("accentColor", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={associationFormData.accentColor}
                      onChange={(e) => handleAssociationInputChange("accentColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assoc-theme" className="text-slate-700">
                    Thème
                  </Label>
                  <select
                    id="assoc-theme"
                    value={associationFormData.theme}
                    onChange={(e) => handleAssociationInputChange("theme", e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="assoc-language" className="text-slate-700">
                    Langue
                  </Label>
                  <select
                    id="assoc-language"
                    value={associationFormData.language}
                    onChange={(e) => handleAssociationInputChange("language", e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Association Button */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSaveAssociation}
              disabled={isLoadingAssociation}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isLoadingAssociation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder les Paramètres de l'Association
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Personal Settings */}
      {/* Paramètres de Devise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Paramètres Financiers
          </CardTitle>
          <CardDescription>
            Configurez votre devise et les taux de change
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Devise par défaut</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'EUR' | 'CFA')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="EUR">Euro (€)</option>
                <option value="CFA">Franc CFA (F)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Taux de change (EUR → CFA)</Label>
              <input
                id="exchangeRate"
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                step="0.001"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>
          <Button onClick={handleSaveSettings} className="gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      {/* Paramètres d'Affichage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Affichage
          </CardTitle>
          <CardDescription>
            Personnalisez l'apparence de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Mode sombre</Label>
              <p className="text-sm text-muted-foreground">
                Activer le thème sombre
              </p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Gérez vos préférences de notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des mises à jour par email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Données et Sauvegarde */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-4" />
            Données et Sauvegarde
          </CardTitle>
          <CardDescription>
            Gérez vos données et sauvegardes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4" />
              Exporter les données
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleImportData}
            >
              <Upload className="h-4 w-4" />
              Importer les données
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Compte et Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Compte et Sécurité</CardTitle>
          <CardDescription>
            Gérez votre compte et votre sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
