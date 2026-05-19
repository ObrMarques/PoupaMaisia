import { useState, useCallback } from "react";
import { Building2, RefreshCw, Unlink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    PluggyConnect: new (options: {
      connectToken: string;
      includeSandbox?: boolean;
      onSuccess: (data: { item: { id: string } }) => void;
      onError?: (error: any) => void;
      onClose?: () => void;
    }) => { init: () => void };
  }
}

const PLUGGY_CDN = "https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.js";

function loadPluggyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PluggyConnect) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${PLUGGY_CDN}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar script Pluggy")));
      return;
    }
    const script = document.createElement("script");
    script.src = PLUGGY_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar script Pluggy"));
    document.head.appendChild(script);
  });
}

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

interface PluggyConnectButtonProps {
  onConnected: () => void;
}

export function PluggyConnectButton({ onConnected }: PluggyConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const openWidget = useCallback(async () => {
    setLoading(true);
    try {
      await loadPluggyScript();

      if (!window.PluggyConnect) {
        throw new Error("Widget Pluggy não disponível após carregamento");
      }

      const resp = await fetchWithAuth("/api/pluggy/create-connect-token", { method: "POST" });
      const data = await resp.json();

      if (!resp.ok || data.error) {
        throw new Error(data.error ?? "Falha ao obter token de conexão");
      }

      const { accessToken } = data;
      if (!accessToken) throw new Error("Token de conexão inválido");

      const widget = new window.PluggyConnect({
        connectToken: accessToken,
        includeSandbox: true,
        onSuccess: async ({ item }) => {
          setLoading(true);
          try {
            const connectResp = await fetchWithAuth("/api/pluggy/connect", {
              method: "POST",
              body: JSON.stringify({ itemId: item.id }),
            });
            const result = await connectResp.json();
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
              title: "Erro ao importar",
              description: err.message ?? "Não foi possível importar as contas bancárias.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error("Pluggy widget error:", err);
          toast({
            title: "Erro no widget",
            description: "Ocorreu um erro ao conectar o banco. Tente novamente.",
            variant: "destructive",
          });
          setLoading(false);
        },
        onClose: () => setLoading(false),
      });

      widget.init();
    } catch (err: any) {
      console.error("Failed to open Pluggy widget:", err);
      toast({
        title: "Erro ao abrir widget",
        description: err.message ?? "Não foi possível abrir o conector bancário.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [onConnected, toast]);

  return (
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
  );
}

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
