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
import { Camera, Upload, Moon, Globe, HelpCircle, MessageCircle, Mail, Phone, ExternalLink } from "lucide-react";
import { Link } from "wouter";
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
  const { isDark, toggleTheme } = useTheme();
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
        onSuccess: (updated) => { updateUser(updated); toast({ title: t("settings.profileUpdated") }); },
        onError:   () => toast({ title: t("common.error"), variant: "destructive" }),
      }
    );
  };

  const handleSavePreferences = () => {
    updateMutation.mutate(
      { data: { currency, language } },
      {
        onSuccess: (updated) => { updateUser(updated); toast({ title: t("settings.preferencesUpdated") }); },
        onError:   () => toast({ title: t("common.error"), variant: "destructive" }),
      }
    );
  };

  const handleLanguageChange = (lang: string) => setLanguage(lang as Language);

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
          onSuccess:  (updated) => { updateUser(updated); toast({ title: t("settings.photoUpdated") }); },
          onError:    () => toast({ title: t("common.error"), variant: "destructive" }),
          onSettled:  () => setIsUploadingPhoto(false),
        }
      );
    } catch {
      setIsUploadingPhoto(false);
      toast({ title: "Erro ao processar imagem.", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências.</p>
      </div>

      <div className="grid gap-6">

        {/* ── Perfil ─────────────────────────────────── */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>{t("settings.profile")}</CardTitle>
            <CardDescription>Atualize suas informações pessoais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-border group-hover:ring-primary transition-all">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingPhoto
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Camera className="w-5 h-5 text-white" />}
                </div>
              </div>
              <div>
                <Button variant="outline" size="sm" className="bg-background" onClick={() => avatarInputRef.current?.click()} disabled={isUploadingPhoto}>
                  <Upload className="w-3.5 h-3.5 mr-2" />
                  {isUploadingPhoto ? t("common.loading") : t("settings.changePhoto")}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG ou GIF · Máx 10 MB</p>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-background" data-testid="input-name" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-background" data-testid="input-email" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={updateMutation.isPending} data-testid="button-save-profile">
              {updateMutation.isPending ? t("common.loading") : t("settings.saveProfile")}
            </Button>
          </CardContent>
        </Card>

        {/* ── Aparência ──────────────────────────────── */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              {t("settings.theme")}
            </CardTitle>
            <CardDescription>Alterne entre modo escuro e claro em todo o aplicativo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{isDark ? t("settings.darkMode") : t("settings.lightMode")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isDark ? "Fundo preto, textos brancos" : "Fundo branco, textos pretos"}
                </p>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} data-testid="switch-theme" />
            </div>
          </CardContent>
        </Card>

        {/* ── Idioma & Moeda ─────────────────────────── */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t("settings.preferences")}
            </CardTitle>
            <CardDescription>Idioma, moeda e outras preferências do app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("settings.language")}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
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

        {/* ── Suporte ────────────────────────────────── */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Suporte
            </CardTitle>
            <CardDescription>Central de ajuda e canais de atendimento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/support">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <div>
                    <p className="text-sm font-medium">Central de Ajuda</p>
                    <p className="text-xs text-muted-foreground">FAQ e perguntas frequentes</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
            <Link href="/support">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <div>
                    <p className="text-sm font-medium">Chat de Suporte</p>
                    <p className="text-xs text-muted-foreground">Atendimento em tempo real</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00C851]" />
                  <span className="text-xs text-[#00C851] font-medium">Online</span>
                </div>
              </div>
            </Link>
            <a href="mailto:suporte@poupamaix.com.br">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <div>
                    <p className="text-sm font-medium">E-mail</p>
                    <p className="text-xs text-muted-foreground">suporte@poupamaix.com.br</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </a>
            <a href="https://wa.me/5511999999999?text=Olá,%20preciso%20de%20ajuda%20com%20o%20PoupaMais" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-[#00C851]/50 hover:bg-[#00C851]/5 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground group-hover:text-[#00C851]" />
                  <div>
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Resposta em minutos</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#00C851]" />
              </div>
            </a>
          </CardContent>
        </Card>

        {/* ── Zona de Perigo ─────────────────────────── */}
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
