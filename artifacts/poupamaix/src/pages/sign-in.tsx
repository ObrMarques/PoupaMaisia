import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const googleIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

type ClerkErrItem = { code?: string; longMessage?: string; message?: string };
type ClerkErr = { errors?: ClerkErrItem[] };

const CLERK_PT: Record<string, string> = {
  form_identifier_exists:                "Esse e-mail já está em uso. Tente outro.",
  form_identifier_not_found:             "Nenhuma conta encontrada com esse e-mail.",
  form_password_incorrect:               "Senha incorreta.",
  form_password_pwned:                   "Essa senha foi comprometida em vazamentos. Use uma senha diferente.",
  form_password_length_too_short:        "A senha deve ter no mínimo 8 caracteres.",
  form_password_strength_insufficient:   "A senha não é forte o suficiente. Use letras, números e símbolos.",
  form_password_not_strong_enough:       "A senha não é forte o suficiente. Use letras, números e símbolos.",
  form_param_format_invalid:             "Formato inválido.",
  form_param_nil:                        "Campo obrigatório.",
  strategy_for_user_invalid:             "Método de autenticação não permitido para essa conta.",
  not_allowed_access:                    "Acesso não permitido.",
  session_exists:                        "Você já está autenticado.",
  rate_limit_exceeded:                   "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  captcha_invalid:                       "Verificação de segurança falhou. Tente novamente.",
};

const CLERK_MSG_PT: [string, string][] = [
  ["no account found",           "Nenhuma conta encontrada com esse e-mail."],
  ["identifier not found",       "Nenhuma conta encontrada com esse e-mail."],
  ["incorrect password",         "Senha incorreta."],
  ["password is incorrect",      "Senha incorreta."],
  ["not strong enough",          "A senha não é forte o suficiente. Use letras, números e símbolos."],
  ["password is not strong",     "A senha não é forte o suficiente. Use letras, números e símbolos."],
  ["too many requests",          "Muitas tentativas. Aguarde alguns minutos."],
  ["password has been found in", "Essa senha foi comprometida em vazamentos. Use outra."],
  ["is already taken",           "Esse valor já está em uso."],
  ["is not a valid parameter",   "Erro de configuração. Tente novamente ou entre com Google."],
  ["not a valid parameter",      "Erro de configuração. Tente novamente ou entre com Google."],
  ["is not allowed",             "Campo não permitido para este tipo de conta."],
];

function translateClerkError(item: ClerkErrItem): string {
  if (item.code && CLERK_PT[item.code]) return CLERK_PT[item.code];
  const raw = (item.longMessage ?? item.message ?? "").toLowerCase();
  for (const [en, pt] of CLERK_MSG_PT) {
    if (raw.includes(en)) return pt;
  }
  return item.longMessage ?? item.message ?? "";
}

function getErrMsg(err: unknown, fallback: string): string {
  const e = err as ClerkErr;
  const item = e?.errors?.[0];
  if (!item) return fallback;
  const translated = translateClerkError(item);
  return translated || fallback;
}

function useHideDevBanner() {
  if (typeof document !== "undefined") {
    const banner = document.querySelector<HTMLElement>("[data-clerk-dev-badge]");
    if (banner) banner.style.display = "none";
  }
}

export default function SignInPage() {
  useHideDevBanner();
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const busy = loading || fetchStatus === "fetching";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError("");
    try {
      const { error: passErr } = await signIn.password({
        identifier: email,
        password,
      });
      if (passErr) { setError(getErrMsg(passErr, "E-mail ou senha incorretos.")); return; }

      const { error: finalErr } = await signIn.finalize();
      if (finalErr) { setError(getErrMsg(finalErr, "Erro ao entrar. Tente novamente.")); return; }

      window.location.href = `${window.location.origin}${basePath}/dashboard`;
    } catch (err) {
      setError(getErrMsg(err, "E-mail ou senha incorretos."));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!signIn) return;
    setError("");
    try {
      const { error: ssoErr } = await signIn.sso({
        strategy:            "oauth_google",
        redirectUrl:         `${window.location.origin}${basePath}/dashboard`,
        redirectCallbackUrl: `${window.location.origin}${basePath}/sso-callback`,
      });
      if (ssoErr) setError(getErrMsg(ssoErr, "Erro ao entrar com Google."));
    } catch (err) {
      setError(getErrMsg(err, "Erro ao entrar com Google."));
    }
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg bg-[#f2f2f2] border border-[#e0e0e0] text-[#111111] placeholder:text-[#a0a0a0] text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]/20";

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <div className="bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg p-8 space-y-6">

        <div className="space-y-1 text-center">
          <img src={`${basePath}/logo.svg`} alt="PoupaMais" className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#111111]">Bem-vindo de volta</h1>
          <p className="text-sm text-[#737373]">Entre com sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#111111]">E-mail</label>
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#111111]">Senha</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            Entrar
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e0e0e0]" />
          <span className="text-xs text-[#737373]">ou</span>
          <div className="flex-1 h-px bg-[#e0e0e0]" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[#e0e0e0] bg-white hover:bg-[#f5f5f5] text-sm font-medium text-[#111111] transition-colors disabled:opacity-50"
        >
          {googleIcon}
          Continuar com Google
        </button>

        <p className="text-center text-sm text-[#737373]">
          Não tem conta?{" "}
          <a href={`${basePath}/sign-up`} className="text-[#111111] font-semibold hover:underline">
            Criar conta
          </a>
        </p>

      </div>
    </div>
  );
}
