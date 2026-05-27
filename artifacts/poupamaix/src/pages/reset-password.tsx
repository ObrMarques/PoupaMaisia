import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/contexts/i18n-context";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const [, setLocation]         = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg bg-[#f2f2f2] border border-[#e0e0e0] text-[#111111] placeholder:text-[#a0a0a0] text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]/20";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("resetPassword.errShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("resetPassword.errMismatch"));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(translateError(updateError.message, t));
        return;
      }
      setSuccess(true);
      setTimeout(() => setLocation("/dashboard"), 2500);
    } catch {
      setError(t("resetPassword.errGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-3 sm:px-6 py-8">
      <div className="bg-white rounded-2xl w-full max-w-[440px] overflow-hidden shadow-lg p-5 sm:p-8 space-y-5 sm:space-y-6">

        <div className="space-y-1 text-center">
          <img src={`${basePath}/logo.png`} alt="PoupaMais" className="w-16 h-16 mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-bold text-[#111111]">{t("resetPassword.title")}</h1>
          <p className="text-sm text-[#737373]">{t("resetPassword.subtitle")}</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div>
              <p className="font-semibold text-[#111111]">{t("resetPassword.successTitle")}</p>
              <p className="text-sm text-[#737373] mt-1">{t("resetPassword.successDesc")}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#111111]">{t("resetPassword.newPassLabel")}</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t("resetPassword.minChars")}
                  required
                  autoComplete="new-password"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#111111] transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#111111]">{t("resetPassword.confirmLabel")}</label>
              <div className="relative">
                <input
                  type={showConf ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={t("resetPassword.repeatPass")}
                  required
                  autoComplete="new-password"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#111111] transition-colors"
                  tabIndex={-1}
                >
                  {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {t("resetPassword.submitBtn")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function translateError(msg: string, t: (key: string) => string): string {
  const m = msg.toLowerCase();
  if (m.includes("weak password") || m.includes("password should be"))
    return t("resetPassword.errShort");
  if (m.includes("session") || m.includes("expired"))
    return t("resetPassword.errExpired");
  return t("resetPassword.errGeneric");
}
