import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/contexts/i18n-context";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg bg-[#f2f2f2] border border-[#e0e0e0] text-[#111111] placeholder:text-[#a0a0a0] text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]/20";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${basePath}/auth/callback`,
      });
      if (resetError) {
        setError(translateError(resetError.message, t));
        return;
      }
      setSent(true);
    } catch {
      setError(t("forgotPassword.sendError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-3 sm:px-6 py-8">
      <div className="bg-white rounded-2xl w-full max-w-[440px] overflow-hidden shadow-lg p-5 sm:p-8 space-y-5 sm:space-y-6">

        <div className="space-y-1 text-center">
          <img src={`${basePath}/logo.png`} alt="PoupaMais" className="w-16 h-16 mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-bold text-[#111111]">{t("forgotPassword.title")}</h1>
          <p className="text-sm text-[#737373]">{t("forgotPassword.subtitle")}</p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div>
              <p className="font-semibold text-[#111111]">{t("forgotPassword.sentTitle")}</p>
              <p className="text-sm text-[#737373] mt-1">{t("forgotPassword.sentDesc")}</p>
            </div>
            <a
              href={`${basePath}/sign-in`}
              className="text-sm text-[#111111] font-semibold hover:underline mt-2"
            >
              {t("forgotPassword.backToLogin")}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#111111]">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {t("forgotPassword.sendBtn")}
            </button>

            <a
              href={`${basePath}/sign-in`}
              className="flex items-center justify-center gap-1.5 text-sm text-[#737373] hover:text-[#111111] transition-colors"
            >
              <ArrowLeft size={14} />
              {t("forgotPassword.backToLogin")}
            </a>
          </form>
        )}
      </div>
    </div>
  );
}

function translateError(msg: string, t: (key: string) => string): string {
  const m = msg.toLowerCase();
  if (m.includes("user not found") || m.includes("invalid email"))
    return t("forgotPassword.errNotFound");
  if (m.includes("too many requests"))
    return t("forgotPassword.errTooMany");
  return t("forgotPassword.errGeneric");
}
