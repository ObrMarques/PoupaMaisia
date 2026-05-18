import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export default function ResetPasswordPage() {
  const [, setLocation]       = useLocation();
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
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(translateError(updateError.message));
        return;
      }
      setSuccess(true);
      setTimeout(() => setLocation("/dashboard"), 2500);
    } catch {
      setError("Erro ao redefinir a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <div className="bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg p-8 space-y-6">

        <div className="space-y-1 text-center">
          <img src={`${basePath}/logo.svg`} alt="PoupaMais" className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#111111]">Nova senha</h1>
          <p className="text-sm text-[#737373]">Crie uma nova senha para sua conta.</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div>
              <p className="font-semibold text-[#111111]">Senha redefinida!</p>
              <p className="text-sm text-[#737373] mt-1">
                Sua senha foi alterada com sucesso. Redirecionando…
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#111111]">Nova senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
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
              <label className="text-sm font-medium text-[#111111]">Confirmar senha</label>
              <div className="relative">
                <input
                  type={showConf ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
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
              Redefinir senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("weak password") || m.includes("password should be"))
    return "A senha é muito fraca. Use pelo menos 6 caracteres.";
  if (m.includes("session") || m.includes("expired"))
    return "O link de recuperação expirou. Solicite um novo.";
  return "Erro ao redefinir a senha. Tente novamente.";
}
