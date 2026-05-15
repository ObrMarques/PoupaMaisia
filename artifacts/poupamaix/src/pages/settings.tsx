import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import { useI18n } from "@/contexts/i18n-context";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Camera, Sun, Moon, Globe, Upload } from "lucide-react";
import type { Language } from "@/i18n/translations";

function resizeImageToBase64(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d")!;
        const side = Math.min(img.width, img.height);
        const ox = (img.width  - side) / 2;
        const oy = (img.height - side) / 2;
        ctx.drawImage(img, ox, oy, side, side, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t, languages } = useI18n();
  const { toast } = useToast();
  const updateMutation = useUpdateProfile();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name,     setName]     = useState(user?.name  || "");
  const [email,    setEmail]    = useState(user?.email  || "");
  const [currency, setCurrency] = useState(user?.currency || "BRL");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleSaveProfile = () => {
    updateMutation.mutate(
      { data: { name, email } },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          toast({ title: t("settings.profileUpdated") });
        },
        onError: () => toast({ title: t("common.error"), variant: "destructive" }),
      }
    );
  };

  const handleSavePreferences = () => {
    updateMutation.mutate(
      { data: { currency, language } },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          toast({ title: t("settings.preferencesUpdated") });
        },
        onError: () => toast({ title: t("common.error"), variant: "destructive" }),
      }
    );
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as Language);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande. Máximo 10MB.", variant: "destructive" });
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const base64 = await resizeImageToBase64(file);
      updateMutation.mutate(
        { data: { avatarUrl: base64 } },
        {
          onSuccess: (updated) => {
            updateUser(updated);
            toast({ title: t("settings.photoUpdated") });
          },
          onError: () => toast({ title: t("common.error"), variant: "destructive" }),
          onSettled: () => setIsUploadingPhoto(false),
        }
      );
    } catch {
      setIsUploadingPhoto(false);
      toast({ title: "Erro ao processar imagem.", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>{t("settings.profile")}</CardTitle>
            <CardDescription>Atualize suas informações pessoais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-border group-hover:ring-primary transition-all">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-semibold text-foreground">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingPhoto ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-background"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  <Upload className="w-3.5 h-3.5 mr-2" />
                  {isUploadingPhoto ? t("common.loading") : t("settings.changePhoto")}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG ou GIF. Máx 10MB.</p>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-background"
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-background"
                  data-testid="input-email"
                />
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={updateMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateMutation.isPending ? t("common.loading") : t("settings.saveProfile")}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              {t("settings.theme")}
            </CardTitle>
            <CardDescription>Alterne entre modo escuro e claro.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{isDark ? t("settings.darkMode") : t("settings.lightMode")}</span>
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                data-testid="switch-theme"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => !isDark || toggleTheme()}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isDark ? "border-primary bg-zinc-900" : "border-border bg-background"
                }`}
              >
                <div className="w-full h-8 rounded bg-zinc-800 mb-2" />
                <p className="text-xs font-medium">{t("settings.darkMode")}</p>
              </button>
              <button
                onClick={() => isDark && toggleTheme()}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  !isDark ? "border-primary bg-white" : "border-border bg-background"
                }`}
              >
                <div className="w-full h-8 rounded bg-gray-100 mb-2" />
                <p className="text-xs font-medium">{t("settings.lightMode")}</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Currency */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t("settings.preferences")}
            </CardTitle>
            <CardDescription>Idioma, moeda e outras preferências.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("settings.language")}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {(Object.entries(languages) as [Language, string][]).map(([code, label]) => (
                      <SelectItem key={code} value={code}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("settings.currency")}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL — R$ (Real)</SelectItem>
                    <SelectItem value="USD">USD — $ (Dólar)</SelectItem>
                    <SelectItem value="EUR">EUR — € (Euro)</SelectItem>
                    <SelectItem value="GBP">GBP — £ (Libra)</SelectItem>
                    <SelectItem value="JPY">JPY — ¥ (Iene)</SelectItem>
                    <SelectItem value="CNY">CNY — ¥ (Yuan)</SelectItem>
                    <SelectItem value="INR">INR — ₹ (Rúpia)</SelectItem>
                    <SelectItem value="RUB">RUB — ₽ (Rublo)</SelectItem>
                    <SelectItem value="ARS">ARS — $ (Peso AR)</SelectItem>
                    <SelectItem value="MXN">MXN — $ (Peso MX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSavePreferences} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t("common.loading") : t("settings.savePreferences")}
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">{t("settings.danger")}</CardTitle>
            <CardDescription>Ações permanentes para sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("settings.deleteAccount")}</p>
                <p className="text-sm text-muted-foreground">Depois de excluir sua conta, não há como voltar atrás.</p>
              </div>
              <Button variant="destructive">{t("settings.deleteAccount")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
