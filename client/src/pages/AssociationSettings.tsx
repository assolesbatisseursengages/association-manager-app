import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AssociationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading: isLoadingSettings } = trpc.globalSettings.get.useQuery();
  
  const [formData, setFormData] = useState({
    associationName: settings?.associationName || '',
    seatCity: settings?.seatCity || '',
    folio: settings?.folio || '',
    email: settings?.email || '',
    website: settings?.website || '',
    phone: settings?.phone || '',
    description: settings?.description || '',
    logo: settings?.logo || null,
  });

  const updateSettingsMutation = trpc.globalSettings.update.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      toast.success('✅ Paramètres mis à jour avec succès !');
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(`❌ Erreur : ${error.message}`);
    },
  });

  // Update form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        associationName: settings.associationName || '',
        seatCity: settings.seatCity || '',
        folio: settings.folio || '',
        email: settings.email || '',
        website: settings.website || '',
        phone: settings.phone || '',
        description: settings.description || '',
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
    if (!file.type.startsWith('image/')) {
      toast.error('❌ Veuillez sélectionner une image valide');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ Le fichier doit faire moins de 5MB');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      setFormData(prev => ({
        ...prev,
        logo: base64,
      }));
      toast.success('✅ Logo chargé avec succès');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.associationName.trim()) {
      toast.error('❌ Le nom de l\'association est requis');
      return;
    }

    setIsLoading(true);
    updateSettingsMutation.mutate({
      associationName: formData.associationName,
      seatCity: formData.seatCity,
      folio: formData.folio,
      email: formData.email,
      website: formData.website,
      phone: formData.phone,
      description: formData.description,
      logo: formData.logo,
    });
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Paramètres de l'Association</h1>
          </div>
          <p className="text-slate-600">
            Personnalisez les informations de votre association, organisation ou ONG
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Section */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Logo de l'Organisation
              </CardTitle>
              <CardDescription>
                Téléchargez le logo de votre association (PNG, JPG, max 5MB)
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo Preview */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">Aucun logo</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex-1 flex flex-col justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="mb-3"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Sélectionner une image
                  </Button>
                  <p className="text-sm text-slate-600">
                    Formats acceptés : PNG, JPG, GIF
                  </p>
                  <p className="text-sm text-slate-600">
                    Taille maximale : 5 MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>
                Informations de base de votre organisation
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de l'Association *
                </label>
                <Input
                  type="text"
                  name="associationName"
                  value={formData.associationName}
                  onChange={handleInputChange}
                  placeholder="ex: Association Manager"
                  className="w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre association..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ville du Siège Social
                </label>
                <Input
                  type="text"
                  name="seatCity"
                  value={formData.seatCity}
                  onChange={handleInputChange}
                  placeholder="ex: Paris"
                  className="w-full"
                />
              </div>

              {/* SIRET/FOLIO */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Numéro SIRET / FOLIO
                </label>
                <Input
                  type="text"
                  name="folio"
                  value={formData.folio}
                  onChange={handleInputChange}
                  placeholder="ex: 12345678901234"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
              <CardTitle>Informations de Contact</CardTitle>
              <CardDescription>
                Coordonnées de votre organisation
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@association.fr"
                  className="w-full"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="ex: +33 1 23 45 67 89"
                  className="w-full"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Site Web
                </label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.association.fr"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Conseil :</strong> Ces informations seront affichées dans les en-têtes, rapports et communications de votre association.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enregistrer les Paramètres
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
