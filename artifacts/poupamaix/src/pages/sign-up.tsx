import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const googleIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

type Step = "form" | "otp";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

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

  // OTP state
  const [digits, setDigits]       = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg bg-[#f2f2f2] border border-[#e0e0e0] text-[#111111] placeholder:text-[#a0a0a0] text-sm focus:outline-none focus:ring-2 focus:ring-[#111111]/20";

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${basePath}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar conta. Tente novamente.");
        return;
      }
      setDigits(Array(OTP_LENGTH).fill(""));
      setResendCooldown(RESEND_COOLDOWN);
      setStep("otp");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-verify when all digits filled
    if (digit && next.every(d => d !== "") && next.join("").length === OTP_LENGTH) {
      handleVerifyOtp(next.join(""));
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleDigitPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      const next = pasted.split("");
      setDigits(next);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      setTimeout(() => handleVerifyOtp(pasted), 0);
    }
    e.preventDefault();
  }

  async function handleVerifyOtp(code?: string) {
    const otp = code ?? digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError("Digite todos os 6 dígitos do código.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(`${basePath}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Código inválido.");
        return;
      }
      // Success → redirect to sign-in
      setLocation(`${basePath}/sign-in?verified=1`);
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${basePath}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao reenviar código.");
        return;
      }
      setDigits(Array(OTP_LENGTH).fill(""));
      setResendCooldown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Sem conexão com o servidor.");
    } finally {
      setResending(false);
    }
  }

  async function handleGoogle() {
    // Import supabase only for Google OAuth (unchanged)
    const { supabase } = await import("@/lib/supabase");
    setError("");
    setGoogleBusy(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${basePath}/auth/callback` },
      });
      if (oauthError) setError(translateError(oauthError.message));
    } catch {
      setError("Erro ao entrar com Google.");
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-3 sm:px-6 py-8">
      <div className="bg-white rounded-2xl w-full max-w-[440px] overflow-hidden shadow-lg p-5 sm:p-8 space-y-5 sm:space-y-6">

        <div className="space-y-1 text-center">
          <img src={`${basePath}/logo.svg`} alt="PoupaMais" className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#111111]">
            {step === "form" ? "Criar sua conta" : "Verificar e-mail"}
          </h1>
          <p className="text-sm text-[#737373]">
            {step === "form"
              ? "Comece sua jornada com o PoupaMais"
              : `Insira o código enviado para ${email}`}
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
                {loading ? "Criando conta…" : "Criar conta"}
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
          <div className="space-y-6">
            {/* OTP digit inputs */}
            <div className="flex justify-center gap-1.5 sm:gap-2.5">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleDigitKeyDown(i, e)}
                  onPaste={i === 0 ? handleDigitPaste : undefined}
                  disabled={verifying}
                  className="w-10 h-12 sm:w-11 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border-2 border-[#e0e0e0] bg-[#f9f9f9] text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors disabled:opacity-50"
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={verifying || digits.some(d => !d)}
              className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying && <Loader2 size={15} className="animate-spin" />}
              {verifying ? "Verificando…" : "Confirmar código"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep("form"); setError(""); setDigits(Array(OTP_LENGTH).fill("")); }}
                className="text-[#737373] hover:text-[#111111] transition-colors"
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resending}
                className="flex items-center gap-1.5 text-[#737373] hover:text-[#111111] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending
                  ? <Loader2 size={13} className="animate-spin" />
                  : <RefreshCw size={13} />}
                {resendCooldown > 0
                  ? `Reenviar em ${resendCooldown}s`
                  : "Reenviar código"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "E-mail não confirmado. Verifique sua caixa de entrada.";
  if (m.includes("too many requests"))
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (m.includes("user not found"))
    return "Nenhuma conta encontrada com esse e-mail.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Esse e-mail já está em uso. Tente outro.";
  if (m.includes("password should be at least"))
    return "A senha deve ter no mínimo 6 caracteres.";
  return msg;
}
