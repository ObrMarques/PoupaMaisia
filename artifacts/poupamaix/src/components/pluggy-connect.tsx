import { useState, useCallback, useEffect, useRef } from "react";
import { Building2, RefreshCw, Unlink, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PLUGGY_PORTAL = "https://connect.pluggy.ai";
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const { data: session } = await import("@/lib/supabase").then(m =>
    m.supabase.auth.getSession()
  );
  const token = session?.session?.access_token;
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

// ─── Pluggy iframe modal ────────────────────────────────────────────────────

interface PluggyModalProps {
  connectToken: string;
  onSuccess: (itemId: string) => void;
  onError: (err: string) => void;
  onClose: () => void;
}

function PluggyModal({ connectToken, onSuccess, onError, onClose }: PluggyModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const src = `${PLUGGY_PORTAL}?connectToken=${encodeURIComponent(connectToken)}&includeSandbox=true`;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only trust messages from the Pluggy portal
      if (!event.origin.includes("pluggy.ai")) return;

      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      const type: string = msg.type ?? msg.event ?? "";

      if (type === "success" || type === "pluggyConnect::success") {
        const itemId: string = msg.data?.item?.id ?? msg.itemId ?? msg.item?.id ?? "";
        if (itemId) onSuccess(itemId);
      } else if (type === "error" || type === "pluggyConnect::error") {
        onError(msg.data?.message ?? msg.message ?? "Erro na conexão bancária");
      } else if (type === "close" || type === "pluggyConnect::close") {
        onClose();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [connectToken, onSuccess, onError, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Conectar banco</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <iframe
          ref={iframeRef}
          src={src}
          title="Pluggy Connect"
          className="flex-1 w-full border-0"
          allow="camera; microphone"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}

// ─── PluggyConnectButton ────────────────────────────────────────────────────

interface PluggyConnectButtonProps {
  onConnected: () => void;
}

export function PluggyConnectButton({ onConnected }: PluggyConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const { toast } = useToast();

  const openWidget = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetchWithAuth("/api/pluggy/create-connect-token", { method: "POST" });
      const data = await resp.json();

      if (!resp.ok || data.error) {
        throw new Error(data.error ?? "Falha ao obter token de conexão");
      }
      if (!data.accessToken) {
        throw new Error("Token de conexão inválido recebido do servidor");
      }

      setConnectToken(data.accessToken);
      setLoading(false);
    } catch (err: any) {
      toast({
        title: "Erro ao conectar banco",
        description: err.message ?? "Não foi possível iniciar a conexão bancária.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  const handleSuccess = useCallback(async (itemId: string) => {
    setConnectToken(null);
    setLoading(true);
    try {
      const resp = await fetchWithAuth("/api/pluggy/connect", {
        method: "POST",
        body: JSON.stringify({ itemId }),
      });
      const result = await resp.json();
      if (result.ok) {
        toast({
          title: "Banco conectado!",
          description: `${result.walletsCreated} conta(s) importada(s) com sucesso.`,
        });
        onConnected();
      } else {
        throw new Error(result.error ?? "Falha ao importar contas");
      }
    } catch (err: any) {
      toast({
        title: "Erro ao importar contas",
        description: err.message ?? "Não foi possível importar as contas bancárias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [onConnected, toast]);

  const handleError = useCallback((msg: string) => {
    setConnectToken(null);
    setLoading(false);
    toast({
      title: "Erro na conexão",
      description: msg,
      variant: "destructive",
    });
  }, [toast]);

  const handleClose = useCallback(() => {
    setConnectToken(null);
    setLoading(false);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={openWidget}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Building2 className="w-4 h-4" />
        )}
        {loading ? "Conectando..." : "Conectar banco"}
      </Button>

      {connectToken && (
        <PluggyModal
          connectToken={connectToken}
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={handleClose}
        />
      )}
    </>
  );
}

// ─── PluggySyncButton ───────────────────────────────────────────────────────

interface PluggySyncButtonProps {
  walletId: number;
  onSynced: () => void;
}

export function PluggySyncButton({ walletId, onSynced }: PluggySyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sync = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetchWithAuth(`/api/pluggy/sync/${walletId}`, { method: "POST" });
      const result = await resp.json();
      if (result.ok) {
        toast({
          title: "Sincronizado!",
          description: `${result.imported} nova(s) transação(ões) importada(s).`,
        });
        onSynced();
      } else {
        throw new Error(result.error ?? "Falha ao sincronizar");
      }
    } catch (err: any) {
      toast({
        title: "Erro ao sincronizar",
        description: err.message ?? "Não foi possível sincronizar as transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [walletId, onSynced, toast]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={sync}
      disabled={loading}
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      title="Sincronizar transações"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <RefreshCw className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}

// ─── PluggyDisconnectButton ─────────────────────────────────────────────────

interface PluggyDisconnectButtonProps {
  walletId: number;
  onDisconnected: () => void;
}

export function PluggyDisconnectButton({ walletId, onDisconnected }: PluggyDisconnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`/api/pluggy/disconnect/${walletId}`, { method: "DELETE" });
      toast({
        title: "Banco desconectado",
        description: "O vínculo com o Open Finance foi removido.",
      });
      onDisconnected();
    } catch (err: any) {
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível remover o vínculo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [walletId, onDisconnected, toast]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={disconnect}
      disabled={loading}
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      title="Desconectar Open Finance"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Unlink className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
