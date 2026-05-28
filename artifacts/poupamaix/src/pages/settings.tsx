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
  Camera, Moon, Globe, Banknote, Check, AlertCircle, ChevronRight,
  FileText, Shield, Cookie, LogOut, Trash2, Lock, X,
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
  icon, iconBg, label, description, right, onClick, danger, divider = true,
}: {
  icon: React.ReactNode; iconBg: string; label: string; description?: string;
  right?: React.ReactNode; onClick?: () => void; danger?: boolean; divider?: boolean;
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
  const [uploadError, setUploadError]           = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const nameDirtyRef  = useRef(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
          const msg = err instanceof Error ? err.message : t("settings.saveError");
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
    // Reset input so the same file can be re-selected next time
    if (avatarInputRef.current) avatarInputRef.current.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError(t("settings.avatarInvalidType"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t("settings.avatarTooLarge"));
      return;
    }

    setUploadError(null);
    setIsUploadingPhoto(true);
    try {
      const base64 = await resizeImageToBase64(file);
      updateMutation.mutate(
        { data: { avatarUrl: base64 } },
        {
          onSuccess: (updated) => {
            updateUser(updated);
            qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
          },
          onError: () => {
            setUploadError(t("settings.avatarUploadError"));
          },
          onSettled: () => setIsUploadingPhoto(false),
        }
      );
    } catch {
      setUploadError(t("settings.avatarUploadError"));
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
    setModal(null);
    await logout();
    navigate("/sign-in");
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="min-h-full bg-background pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-center">
        <h1 className="text-base font-bold">{t("settings.title")}</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-5">

        {/* ── Perfil ───────────────────────────────── */}
        <SectionCard title={t("settings.profile")}>
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
            <input
              ref={avatarInputRef}
              id="avatar-input"
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isUploadingPhoto}
              onChange={handleAvatarChange}
            />
            {uploadError ? (
              <p className="text-xs text-destructive text-center flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />{uploadError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{t("settings.tapChangePhoto")}</p>
            )}
          </div>

          {/* Fields */}
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="input-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("settings.fullName")}</Label>
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
                {t("auth.email")}
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-normal">
                  <Lock className="w-2.5 h-2.5" /> {t("settings.notEditable")}
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
                {updateMutation.isPending ? t("common.saving") : t("settings.saveProfile")}
              </Button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 shrink-0">
                  <Check className="w-4 h-4" /> {t("settings.saved")}
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

        {/* ── Preferências ─────────────────────────── */}
        <SectionCard title={t("settings.preferences")}>
          <SettingRow
            icon={<Moon className="w-4 h-4 text-purple-400" />}
            iconBg="bg-purple-500/15"
            label={t("settings.darkMode")}
            description={isDark ? t("settings.darkModeOn") : t("settings.darkModeOff")}
            right={<Switch checked={isDark} onCheckedChange={toggleTheme} data-testid="switch-theme" />}
          />
          <SettingRow
            icon={<Globe className="w-4 h-4 text-amber-500" />}
            iconBg="bg-amber-500/15"
            label={t("settings.language")}
            right={
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 h-8 text-xs bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {(Object.entries(languages) as [Language, string][]).map(([code, label]) => (
                    <SelectItem key={code} value={code} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
          <SettingRow
            icon={<Banknote className="w-4 h-4 text-green-500" />}
            iconBg="bg-green-500/15"
            label={t("settings.currency")}
            right={
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32 h-8 text-xs bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">R$ — Real</SelectItem>
                  <SelectItem value="USD">$ — Dólar</SelectItem>
                  <SelectItem value="EUR">€ — Euro</SelectItem>
                </SelectContent>
              </Select>
            }
            divider={false}
          />
          <div className="px-4 py-3 border-t border-border/60">
            <Button onClick={handleSavePreferences} disabled={updateMutation.isPending} variant="outline" className="w-full">
              {updateMutation.isPending ? t("common.saving") : t("settings.savePreferences")}
            </Button>
          </div>
        </SectionCard>

        {/* ── Legal ────────────────────────────────── */}
        <SectionCard title={t("settings.legal")}>
          <SettingRow
            icon={<FileText className="w-4 h-4 text-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.termsTitle")}
            description={t("settings.termsDescShort")}
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setModal("terms")}
          />
          <SettingRow
            icon={<Shield className="w-4 h-4 text-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.privacyTitle")}
            description={t("settings.privacyDescShort")}
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setModal("privacy")}
          />
          <SettingRow
            icon={<Cookie className="w-4 h-4 text-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.cookiesTitle")}
            description={t("settings.cookiesDescShort")}
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setModal("cookies")}
            divider={false}
          />
        </SectionCard>

        {/* ── Conta ────────────────────────────────── */}
        <SectionCard title={t("settings.account")}>
          <SettingRow
            icon={<LogOut className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.signOut")}
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={handleLogout}
          />
          <SettingRow
            icon={<Trash2 className="w-4 h-4 text-destructive" />}
            iconBg="bg-destructive/10"
            label={t("settings.deleteAccount")}
            danger
            right={<ChevronRight className="w-4 h-4 text-destructive/60" />}
            onClick={() => { setModal("delete"); }}
            divider={false}
          />
        </SectionCard>

        {/* Rodapé */}
        <p className="text-center text-xs text-muted-foreground/50 py-4">
          {t("settings.version")}
        </p>
      </div>

      {/* ── Modais legais ───────────────────────────── */}
      <Modal open={modal === "terms"} onClose={() => setModal(null)} title={t("settings.termsTitle")}>
        <p className="text-xs text-muted-foreground mb-4">Última atualização: 26 de maio de 2026</p>
        <p className="text-sm text-muted-foreground mb-4">Ao utilizar o PoupaMais, você concorda com os termos descritos abaixo. Leia com atenção antes de continuar.</p>
        <div className="space-y-4">
          <div><p className="text-sm font-medium mb-1">1. Aceitação dos termos</p><p className="text-sm text-muted-foreground">Ao acessar ou utilizar o PoupaMais, você confirma ter lido, compreendido e concordado com estes Termos de Uso. Caso não concorde, não utilize o serviço. Estes termos constituem um contrato legalmente vinculante entre você e o PoupaMais.</p></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">2. Uso permitido</p><p className="text-sm text-muted-foreground mb-2">Você concorda em utilizar o PoupaMais apenas para fins legais e de acordo com estes termos. É expressamente proibido:</p><ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1"><li>Violar qualquer lei ou regulamento aplicável</li><li>Transmitir conteúdo ofensivo, falso ou prejudicial</li><li>Tentar acessar áreas restritas sem autorização</li><li>Realizar engenharia reversa ou descompilar o aplicativo</li><li>Usar o serviço para fins comerciais não autorizados</li></ul></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">3. Conta do usuário</p><p className="text-sm text-muted-foreground">Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta no PoupaMais. Notifique-nos imediatamente caso suspeite de acesso não autorizado.</p></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">4. Propriedade intelectual</p><p className="text-sm text-muted-foreground">Todo o conteúdo do PoupaMais, incluindo textos, gráficos, logotipos, ícones e software, é propriedade do PoupaMais e protegido pelas leis de direito autoral. Nenhum conteúdo pode ser reproduzido sem autorização prévia e por escrito.</p></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">5. Limitação de responsabilidade</p><p className="text-sm text-muted-foreground">O PoupaMais é fornecido "como está". Não garantimos que o serviço estará livre de erros ou interrupções. Em nenhuma hipótese seremos responsáveis por danos indiretos, incidentais ou consequentes decorrentes do uso do serviço.</p></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">6. Rescisão</p><p className="text-sm text-muted-foreground">Reservamos o direito de suspender ou encerrar seu acesso ao PoupaMais a qualquer momento, sem aviso prévio, caso haja violação destes termos. Você também pode encerrar sua conta a qualquer momento mediante solicitação.</p></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">7. Contato</p><p className="text-sm text-muted-foreground">Em caso de dúvidas sobre estes termos, entre em contato com nossa equipe: <span className="text-primary">suporte.poupamaisbr@gmail.com</span></p></div>
        </div>
      </Modal>

      <Modal open={modal === "privacy"} onClose={() => setModal(null)} title={t("settings.privacyTitle")}>
        <p className="text-xs text-muted-foreground mb-4">Conformidade com a LGPD · Lei nº 13.709/2018</p>
        <p className="text-sm text-muted-foreground mb-4">Sua privacidade é fundamental para nós. Esta política explica como o PoupaMais coleta, usa e protege seus dados pessoais.</p>
        <div className="space-y-4">
          <div><p className="text-sm font-medium mb-1">1. Dados que coletamos</p><ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1"><li><span className="font-medium text-foreground">Dados de identificação</span>: nome, e-mail, número de telefone</li><li><span className="font-medium text-foreground">Dados de uso</span>: páginas acessadas, funcionalidades utilizadas, tempo de sessão</li><li><span className="font-medium text-foreground">Dados técnicos</span>: endereço IP, tipo de dispositivo, sistema operacional, navegador</li><li><span className="font-medium text-foreground">Dados financeiros</span>: transações, metas e carteiras inseridas voluntariamente</li></ul></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">2. Finalidade do tratamento</p><ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1"><li>Fornecer e melhorar os serviços do PoupaMais</li><li>Personalizar a experiência do usuário</li><li>Enviar comunicações relevantes (com seu consentimento)</li><li>Cumprir obrigações legais e regulatórias</li><li>Prevenir fraudes e garantir a segurança da plataforma</li></ul></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">3. Compartilhamento de dados</p><p className="text-sm text-muted-foreground">O PoupaMais não vende seus dados pessoais. Podemos compartilhá-los com parceiros terceiros apenas nas seguintes situações: prestadores de serviços essenciais ao funcionamento da plataforma, cumprimento de obrigações legais ou ordens judiciais, e proteção de direitos em caso de disputas.</p></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">4. Armazenamento e segurança</p><p className="text-sm text-muted-foreground">Seus dados são armazenados em servidores seguros com criptografia em trânsito e em repouso. O PoupaMais aplica medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou destruição.</p></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">5. Seus direitos (LGPD)</p><ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1"><li>Confirmar a existência de tratamento dos seus dados</li><li>Acessar, corrigir ou atualizar suas informações</li><li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li><li>Revogar o consentimento a qualquer momento</li><li>Solicitar a portabilidade dos dados para outro fornecedor</li></ul></div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">6. Contato com o DPO</p><p className="text-sm text-muted-foreground">Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, entre em contato com o Encarregado de Dados (DPO) do PoupaMais: <span className="text-primary">suporte.poupamaisbr@gmail.com</span></p></div>
        </div>
      </Modal>

      <Modal open={modal === "cookies"} onClose={() => setModal(null)} title={t("settings.cookiesTitle")}>
        <p className="text-sm text-muted-foreground mb-4">O PoupaMais utiliza cookies para melhorar sua experiência. Veja quais utilizamos e como gerenciá-los.</p>
        <div className="space-y-4">
          <div><p className="text-sm font-medium mb-1">O que são cookies?</p><p className="text-sm text-muted-foreground">Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você usa o PoupaMais. Eles nos ajudam a reconhecê-lo, lembrar suas preferências e entender como você utiliza o serviço.</p></div>
          <div className="border-t border-border" />
          <div className="space-y-3">
            <p className="text-sm font-medium">Tipos de cookies que usamos</p>
            {[
              { name: "Cookies essenciais", desc: "Necessários para o funcionamento básico do PoupaMais. Não podem ser desativados.", required: true },
              { name: "Cookies de desempenho", desc: "Coletam dados de uso anônimos para melhorar o PoupaMais.", required: false },
              { name: "Cookies de funcionalidade", desc: "Lembram suas preferências e configurações personalizadas.", required: false },
              { name: "Cookies de marketing", desc: "Usados para exibir conteúdo relevante e comunicações personalizadas.", required: false },
            ].map(c => (
              <div key={c.name} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${c.required ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{c.required ? "Sempre ativo" : t("common.optional")}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border" />
          <div><p className="text-sm font-medium mb-1">Dúvidas sobre cookies</p><p className="text-sm text-muted-foreground">Para mais informações sobre como o PoupaMais utiliza cookies, entre em contato: <span className="text-primary">suporte.poupamaisbr@gmail.com</span></p></div>
        </div>
      </Modal>

      <Modal open={modal === "delete"} onClose={() => { setModal(null); }} title={t("settings.deleteAccount")}>
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-base">{t("settings.deleteConfirmSure")}</p>
            <p className="text-muted-foreground text-sm mt-1">{t("settings.deleteConfirmMsg")}</p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setModal(null); }}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount}>
              {t("settings.deleteConfirmBtn")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
