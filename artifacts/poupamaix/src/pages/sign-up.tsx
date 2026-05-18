import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const googleIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

type Step = "form" | "verify";

export default function SignUpPage() {
  const [, setLocation] = useLocation();
  const [step, setStep]           = useState<Step>("form");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError]         = useState("");

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg bg-[#f2f2f2] border border-[#e0e0e0] text-[#111111] placeholder:text-[#a0a0a0] text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]/20";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}${basePath}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(translateSupabaseError(signUpError.message));
        return;
      }
      setStep("verify");
    } catch (err: any) {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleBusy(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${basePath}/auth/callback`,
        },
      });
      if (oauthError) setError(translateSupabaseError(oauthError.message));
    } catch (err: any) {
      setError("Erro ao entrar com Google.");
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <div className="bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg p-8 space-y-6">

        <div className="space-y-1 text-center">
          <img src={`${basePath}/logo.svg`} alt="PoupaMais" className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#111111]">
            {step === "form" ? "Criar sua conta" : "Verificar e-mail"}
          </h1>
          <p className="text-sm text-[#737373]">
            {step === "form"
              ? "Comece sua jornada com o PoupaMais"
              : `Código enviado para ${email}`}
          </p>
        </div>

        {step === "form" ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111111]">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111111]">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
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
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
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
                disabled={loading || !name.trim() || !email || !password}
                className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Criar conta
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
              disabled={googleBusy}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[#e0e0e0] bg-white hover:bg-[#f5f5f5] text-sm font-medium text-[#111111] transition-colors disabled:opacity-50"
            >
              {googleBusy ? <Loader2 size={16} className="animate-spin" /> : googleIcon}
              Continuar com Google
            </button>

            <p className="text-center text-sm text-[#737373]">
              Já tem conta?{" "}
              <a href={`${basePath}/sign-in`} className="text-[#111111] font-semibold hover:underline">
                Entrar
              </a>
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-[#f0fdf4] border border-[#86efac] p-4 text-sm text-[#166534]">
              Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta e depois faça login.
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <a
              href={`${basePath}/sign-in`}
              className="block w-full text-center py-2.5 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium transition-colors"
            >
              Ir para o login
            </a>

            <button
              type="button"
              onClick={() => { setStep("form"); setError(""); }}
              className="w-full text-sm text-[#737373] hover:text-[#111111] transition-colors py-1"
            >
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function translateSupabaseError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "E-mail não confirmado. Verifique sua caixa de entrada.";
  if (m.includes("too many requests"))
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (m.includes("user not found"))
    return "Nenhuma conta encontrada com esse e-mail.";
  if (m.includes("email already in use") || m.includes("already registered") || m.includes("user already registered"))
    return "Esse e-mail já está em uso. Tente outro.";
  if (m.includes("password should be at least"))
    return "A senha deve ter no mínimo 6 caracteres.";
  return msg;
}
