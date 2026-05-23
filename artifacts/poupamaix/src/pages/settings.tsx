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
import { Switch } from "@/components/ui/switch";
import {
  Camera, Moon, Globe, Mail, KeyRound, Check, AlertCircle, ChevronRight,
  Bell, FileText, Shield, Cookie, LogOut, Trash2, Lock, X,
} from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import type { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2">{title}</p>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  iconBg,
  label,
  description,
  right,
  onClick,
  danger,
  divider = true,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5",
        onClick && "cursor-pointer active:bg-secondary/40 transition-colors",
        divider && "border-b border-border/60 last:border-0"
      )}
    >
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", danger && "text-destructive")}>{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {right}
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[80dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h3 className="font-semibold text-base">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm text-muted-foreground leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t, languages } = useI18n();
  const updateMutation = useUpdateProfile();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const [name,     setName]     = useState(user?.name  || "");
  const [currency, setCurrency] = useState(user?.currency || "BRL");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [resetState, setResetState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const nameDirtyRef = useRef(false);

  const [pushNotif, setPushNotif]   = useState(false);
  const [emailPromo, setEmailPromo] = useState(false);

  const [modal, setModal] = useState<"terms" | "privacy" | "cookies" | "delete" | null>(null);


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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 10 * 1024 * 1024) return;
    setIsUploadingPhoto(true);
    try {
      const base64 = await resizeImageToBase64(file);
      updateMutation.mutate(
        { data: { avatarUrl: base64 } },
        {
          onSuccess:  (updated) => { updateUser(updated); qc.invalidateQueries({ queryKey: getGetMeQueryKey() }); },
          onError:    () => {},
          onSettled:  () => setIsUploadingPhoto(false),
        }
      );
    } catch { setIsUploadingPhoto(false); }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetState("loading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const origin = window.location.origin;
      const res = await fetch(`${origin}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ redirectTo: `${origin}/reset-password` }),
      });
      setResetState(res.ok ? "sent" : "error");
    } catch { setResetState("error"); }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
   ;
    setModal(null);
    await logout();
    navigate("/sign-in");
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="min-h-full bg-background pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-center">
        <h1 className="text-base font-bold">Configurações</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-5">

        {/* ── Perfil ───────────────────────────────── */}
        <SectionCard title="Perfil">
          {/* Avatar */}
          <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-3 border-b border-border/60">
            <label htmlFor="avatar-input" className="relative group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-[#4C1D95] flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-purple-500/30">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{initials}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border-2 border-background flex items-center justify-center shadow-md">
                {isUploadingPhoto
                  ? <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <Camera className="w-3.5 h-3.5 text-foreground" />}
              </div>
            </label>
            <input id="avatar-input" type="file" accept="image/*" className="sr-only" disabled={isUploadingPhoto} onChange={handleAvatarChange} />
            <p className="text-xs text-muted-foreground">Toque para alterar a foto</p>
          </div>

          {/* Fields */}
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="input-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome completo</Label>
              <Input
                id="input-name"
                value={name}
                onChange={e => { nameDirtyRef.current = true; setName(e.target.value); }}
                className="bg-background"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="input-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                E-mail
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-normal">
                  <Lock className="w-2.5 h-2.5" /> não editável
                </span>
              </Label>
              <Input
                id="input-email"
                type="email"
                value={user?.email || ""}
                readOnly disabled
                className="bg-muted cursor-not-allowed opacity-70"
                data-testid="input-email"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleSaveProfile}
                disabled={updateMutation.isPending || !name.trim()}
                className="flex-1"
                data-testid="button-save-profile"
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 shrink-0">
                  <Check className="w-4 h-4" /> Salvo!
                </span>
              )}
            </div>
            {profileError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" /> {profileError}
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── Aparência ────────────────────────────── */}
        <SectionCard title="Aparência">
          <SettingRow
            icon={<Moon className="w-4 h-4 text-purple-400" />}
            iconBg="bg-purple-500/15"
            label="Modo escuro"
            description={isDark ? "Fundo escuro, textos claros" : "Fundo claro, textos escuros"}
            right={<Switch checked={isDark} onCheckedChange={toggleTheme} data-testid="switch-theme" />}
          />
          <SettingRow
            icon={<Globe className="w-4 h-4 text-amber-500" />}
            iconBg="bg-amber-500/15"
            label="Idioma"
            description={language === "pt-BR" ? "Português (Brasil)" : language}
            right={
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-36 h-8 text-xs bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {(Object.entries(languages) as [Language, string][]).map(([code, label]) => (
                    <SelectItem key={code} value={code} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            divider={false}
          />
        </SectionCard>

        {/* ── Moeda ────────────────────────────────── */}
        <SectionCard title="Preferências">
          <div className="px-4 py-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("settings.currency")}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL — R$ (Real)</SelectItem>
                  <SelectItem value="USD">USD — $ (Dólar)</SelectItem>
                  <SelectItem value="EUR">EUR — € (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP — £ (Libra)</SelectItem>
                  <SelectItem value="JPY">JPY — ¥ (Iene)</SelectItem>
                  <SelectItem value="ARS">ARS — $ (Peso AR)</SelectItem>
                  <SelectItem value="MXN">MXN — $ (Peso MX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSavePreferences} disabled={updateMutation.isPending} variant="outline" className="w-full">
              {updateMutation.isPending ? "Salvando..." : "Salvar preferências"}
            </Button>
          </div>
        </SectionCard>

        {/* ── Segurança ────────────────────────────── */}
        <SectionCard title="Segurança">
          <div className="px-4 py-4">
            <p className="text-xs text-muted-foreground mb-3">
              Envie um link de redefinição de senha para <strong>{user?.email}</strong>.
            </p>
            <Button
              variant="outline"
              onClick={handleResetPassword}
              disabled={resetState === "loading" || resetState === "sent"}
              className="w-full flex items-center gap-2"
            >
              {resetState === "loading" && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {resetState === "sent"    && <Check className="w-4 h-4 text-green-600" />}
              {resetState === "error"   && <AlertCircle className="w-4 h-4 text-destructive" />}
              <KeyRound className={cn("w-4 h-4", resetState === "idle" ? "" : "hidden")} />
              {resetState === "idle"    && "Redefinir senha"}
              {resetState === "loading" && "Enviando..."}
              {resetState === "sent"    && "Link enviado para o seu e-mail"}
              {resetState === "error"   && "Erro ao enviar. Tente novamente."}
            </Button>
          </div>
        </SectionCard>

        {/* ── Notificações ─────────────────────────── */}
        <SectionCard title="Notificações">
          <SettingRow
            icon={<Bell className="w-4 h-4 text-green-500" />}
            iconBg="bg-green-500/15"
            label="Notificações push"
            description="Alertas e atualizações"
            right={<Switch checked={pushNotif} onCheckedChange={setPushNotif} />}
          />
          <SettingRow
            icon={<Mail className="w-4 h-4 text-blue-500" />}
            iconBg="bg-blue-500/15"
            label="E-mails promocionais"
            description="Novidades e ofertas"
            right={<Switch checked={emailPromo} onCheckedChange={setEmailPromo} />}
            divider={false}
          />
        </SectionCard>

        {/* ── Legal ────────────────────────────────── */}
        <SectionCard title="Legal">
          <SettingRow
            icon={<FileText className="w-4 h-4 text-foreground" />}
            iconBg="bg-secondary"
            label="Termos de uso"
            description="Regras e condições do serviço"
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setModal("terms")}
          />
          <SettingRow
            icon={<Shield className="w-4 h-4 text-foreground" />}
            iconBg="bg-secondary"
            label="Política de privacidade"
            description="Como seus dados são usados"
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setModal("privacy")}
          />
          <SettingRow
            icon={<Cookie className="w-4 h-4 text-foreground" />}
            iconBg="bg-secondary"
            label="Política de cookies"
            description="Preferências de rastreamento"
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setModal("cookies")}
            divider={false}
          />
        </SectionCard>

        {/* ── Conta ────────────────────────────────── */}
        <SectionCard title="Conta">
          <SettingRow
            icon={<LogOut className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Sair da conta"
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={handleLogout}
          />
          <SettingRow
            icon={<Trash2 className="w-4 h-4 text-destructive" />}
            iconBg="bg-destructive/10"
            label="Excluir conta"
            danger
            right={<ChevronRight className="w-4 h-4 text-destructive/60" />}
            onClick={() => { setModal("delete"); }}
            divider={false}
          />
        </SectionCard>

        {/* Rodapé */}
        <p className="text-center text-xs text-muted-foreground/50 py-4">
          Versão 1.0.0 · © 2026 PoupaMais
        </p>
      </div>

      {/* ── Modais legais ───────────────────────────── */}
      <Modal open={modal === "terms"} onClose={() => setModal(null)} title="Termos de uso">
        <p><strong>1. Aceitação dos termos</strong><br />Ao utilizar o PoupaMais, você concorda com estes termos de uso. Caso não concorde, não utilize o aplicativo.</p>
        <p><strong>2. Uso permitido</strong><br />O PoupaMais é destinado ao uso pessoal para gestão de finanças pessoais. É proibido utilizar o serviço para fins ilegais ou fraudulentos.</p>
        <p><strong>3. Conta e responsabilidade</strong><br />Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas na sua conta.</p>
        <p><strong>4. Dados financeiros</strong><br />Os dados inseridos no aplicativo são de sua responsabilidade. O PoupaMais não se responsabiliza por decisões financeiras tomadas com base nas informações exibidas.</p>
        <p><strong>5. Alterações nos termos</strong><br />Podemos atualizar estes termos periodicamente. O uso continuado do aplicativo após alterações implica na aceitação dos novos termos.</p>
      </Modal>

      <Modal open={modal === "privacy"} onClose={() => setModal(null)} title="Política de privacidade">
        <p><strong>1. Dados coletados</strong><br />Coletamos nome, e-mail e dados financeiros que você insere voluntariamente no aplicativo.</p>
        <p><strong>2. Uso dos dados</strong><br />Seus dados são utilizados exclusivamente para fornecer os serviços do PoupaMais, incluindo análises financeiras personalizadas pela PoupaAI.</p>
        <p><strong>3. Compartilhamento</strong><br />Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto quando exigido por lei.</p>
        <p><strong>4. Segurança</strong><br />Utilizamos criptografia e boas práticas de segurança para proteger suas informações. Sua senha nunca é armazenada em texto simples.</p>
        <p><strong>5. Seus direitos</strong><br />Você pode solicitar a exclusão de todos os seus dados a qualquer momento através das configurações da conta.</p>
      </Modal>

      <Modal open={modal === "cookies"} onClose={() => setModal(null)} title="Política de cookies">
        <p><strong>O que são cookies?</strong><br />Cookies são pequenos arquivos armazenados no seu dispositivo que ajudam a melhorar a experiência de uso do aplicativo.</p>
        <p><strong>Cookies essenciais</strong><br />Utilizamos cookies estritamente necessários para manter sua sessão ativa e garantir o funcionamento correto do aplicativo.</p>
        <p><strong>Cookies analíticos</strong><br />Podemos utilizar dados anônimos de uso para melhorar o desempenho e a experiência do aplicativo.</p>
        <p><strong>Controle</strong><br />Você pode desativar cookies nas configurações do seu navegador, mas isso pode afetar o funcionamento do aplicativo.</p>
      </Modal>

      <Modal open={modal === "delete"} onClose={() => { setModal(null); }} title="Excluir conta">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-base">Tem certeza?</p>
            <p className="text-muted-foreground text-sm mt-1">
              Todos os seus dados — transações, carteiras, metas e histórico — serão permanentemente excluídos. Essa ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setModal(null); }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteAccount}
            >
              Excluir conta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
