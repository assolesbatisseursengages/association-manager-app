import React, { useState, useEffect, useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Settings, Upload, Save, RotateCcw, Mail, Globe, MapPin, FileText, Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function GlobalSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch global settings from database
  const { data: settings, isLoading, refetch } = trpc.globalSettings.get.useQuery();
  const updateMutation = trpc.globalSettings.update.useMutation();

  // Local state for form - Combined from both pages
  const [formData, setFormData] = useState({
    associationName: "",
    seatCity: "",
    folio: "",
    email: "",
    website: "",
    phone: "",
    description: "",
    logo: null as string | null,
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (settings) {
      setFormData({
        associationName: settings.associationName || "",
        seatCity: settings.seatCity || "",
        folio: settings.folio || "",
        email: settings.email || "",
        website: settings.website || "",
        phone: settings.phone || "",
        description: settings.description || "",
        logo: settings.logo || null,
      });
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("❌ Veuillez sélectionner une image valide");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("❌ Le fichier doit faire moins de 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      setFormData(prev => ({
        ...prev,
        logo: base64,
      }));
      toast.success("✅ Logo chargé avec succès");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.associationName.trim()) {
      toast.error("❌ Le nom de l'association est requis");
      return;
    }

    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        associationName: formData.associationName,
        seatCity: formData.seatCity,
        folio: formData.folio,
        email: formData.email,
        website: formData.website,
        phone: formData.phone,
        description: formData.description,
        logo: logoPreview,
      });
      toast.success("✅ Paramètres modifiés avec succès");
      refetch();
    } catch (error: any) {
      toast.error(`❌ Erreur : ${error.message}`);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        associationName: settings.associationName || "",
        seatCity: settings.seatCity || "",
        folio: settings.folio || "",
        email: settings.email || "",
        website: settings.website || "",
        phone: settings.phone || "",
        description: settings.description || "",
        logo: settings.logo || null,
      });
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
    }
    toast.info("Formulaire réinitialisé");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Section */}
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres Globaux</h1>
          <p className="text-muted-foreground mt-1">Configurez les informations et le branding de votre association</p>
        </div>
      </div>

      {/* Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Ces paramètres s'appliquent à toute l'association et sont visibles dans l'application.
        </AlertDescription>
      </Alert>

      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations de l'Association
          </CardTitle>
          <CardDescription>
            Mettez à jour les informations principales de votre association
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Logo de l'Association
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Format: PNG, JPG, GIF | Taille max: 5MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Charger un logo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {logoPreview && (
              <div className="flex items-center gap-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Aperçu du logo</p>
                  <p>Le logo s'affichera en haut à gauche de l'application</p>
                </div>
              </div>
            )}
          </div>

          {/* Name and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="associationName" className="font-semibold">
                Nom de l'Association *
              </Label>
              <Input
                id="associationName"
                name="associationName"
                value={formData.associationName}
                onChange={handleInputChange}
                placeholder="Ex: Les Bâtisseurs Engagés"
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folio" className="font-semibold">
                Numéro SIRET/FOLIO
              </Label>
              <Input
                id="folio"
                name="folio"
                value={formData.folio}
                onChange={handleInputChange}
                placeholder="Ex: 123 456 789 00012"
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              Description de l'Association
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez votre association, sa mission et ses objectifs..."
              rows={4}
              className="border-gray-300"
            />
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informations de Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">
                  Email de Contact
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@association.fr"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+33 1 23 45 67 89"
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Location and Web */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation et Web
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seatCity" className="font-semibold">
                  Ville du Siège Social
                </Label>
                <Input
                  id="seatCity"
                  name="seatCity"
                  value={formData.seatCity}
                  onChange={handleInputChange}
                  placeholder="Ex: Paris"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="font-semibold">
                  Site Web
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.association.fr"
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-5 w-5" />
            À savoir
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <p>✓ Le logo s'affichera en haut à gauche dans la barre latérale de l'application</p>
          <p>✓ Le nom de l'association apparaîtra à côté du logo</p>
          <p>✓ Ces paramètres sont visibles par tous les utilisateurs de l'application</p>
          <p>✓ Tous les champs peuvent être modifiés à tout moment</p>
        </CardContent>
      </Card>
    </div>
  );
}
