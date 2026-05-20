import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import { useI18n } from "@/contexts/i18n-context";
import { useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Moon, Globe, HelpCircle, MessageCircle, Mail, Phone, ExternalLink, KeyRound, Check, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import type { Language } from "@/i18n/translations";


export default function Settings() {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t, languages } = useI18n();
  const updateMutation = useUpdateProfile();
  const qc = useQueryClient();

  const [name,     setName]     = useState(user?.name  || "");
  const [currency, setCurrency] = useState(user?.currency || "BRL");
  const [resetState, setResetState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Track whether the user has edited the name field.
  // Prevents background query refetches from overwriting what they're typing.
  const nameDirtyRef = useRef(false);

  // Sync local state when user data arrives asynchronously (avoids empty initial value).
  // Only syncs the name when the user has NOT started editing, so a background
  // refetch cannot reset the input mid-type.
  useEffect(() => {
    if (user?.name && !nameDirtyRef.current) setName(user.name);
    if (user?.currency) setCurrency(user.currency);
  }, [user?.name, user?.currency]);

  const handleSaveProfile = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setProfileError(null);
    updateMutation.mutate(
      { data: { name: trimmedName } },
      {
        onSuccess: (updated) => {
          nameDirtyRef.current = false;
          updateUser(updated);
          qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setProfileSaved(true);
          setTimeout(() => setProfileSaved(false), 3500);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.";
          setProfileError(msg);
        },
      }
    );
  };

  const handleSavePreferences = () => {
    updateMutation.mutate(
      { data: { currency, language } },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
        },
        onError: () => {},
      }
    );
  };

  const handleLanguageChange = (lang: string) => setLanguage(lang as Language);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetState("loading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const origin = window.location.origin;
      const res = await fetch(`${origin}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ redirectTo: `${origin}/reset-password` }),
      });

      if (res.ok) {
        setResetState("sent");
      } else {
        setResetState("error");
      }
    } catch {
      setResetState("error");
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

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-border">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Name + Email */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="input-name">Nome completo</Label>
                <Input
                  id="input-name"
                  value={name}
                  onChange={e => { nameDirtyRef.current = true; setName(e.target.value); }}
                  className="bg-background"
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="input-email">
                  E-mail
                  <span className="ml-2 text-xs text-muted-foreground font-normal">(não editável)</span>
                </Label>
                <Input
                  id="input-email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed opacity-70"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateMutation.isPending || !name.trim()}
                  data-testid="button-save-profile"
                >
                  {updateMutation.isPending ? t("common.loading") : t("settings.saveProfile")}
                </Button>
                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    Salvo com sucesso
                  </span>
                )}
              </div>
              {profileError && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {profileError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Segurança ───────────────────────────────── */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Segurança
            </CardTitle>
            <CardDescription>Gerencie sua senha de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Clique abaixo para receber um link de redefinição de senha no seu e-mail cadastrado.
              </p>
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={resetState === "loading" || resetState === "sent"}
                className="flex items-center gap-2"
              >
                {resetState === "loading" && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {resetState === "sent" && <Check className="w-4 h-4 text-green-600" />}
                {resetState === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                {resetState === "idle"    && "Redefinir senha"}
                {resetState === "loading" && "Enviando..."}
                {resetState === "sent"    && "Link enviado para o seu e-mail"}
                {resetState === "error"   && "Erro ao enviar. Tente novamente."}
              </Button>
            </div>
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
            <a href="mailto:poupamaisia@gmail.com">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <div>
                    <p className="text-sm font-medium">E-mail</p>
                    <p className="text-xs text-muted-foreground">poupamaisia@gmail.com</p>
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

      </div>
    </div>
  );
}
