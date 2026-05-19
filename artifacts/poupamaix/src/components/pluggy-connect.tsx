import { useState, useCallback } from "react";
import { Building2, RefreshCw, Unlink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    PluggyConnect: new (options: {
      connectToken: string;
      onSuccess: (data: { item: { id: string } }) => void;
      onError?: (error: any) => void;
      onClose?: () => void;
    }) => { init: () => void };
  }
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

  const openWidget = useCallback(async () => {
    if (!window.PluggyConnect) {
      alert("Widget do Pluggy não carregou. Recarregue a página e tente novamente.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetchWithAuth("/api/pluggy/connect-token", { method: "POST" });
      const { accessToken, error } = await resp.json();
      if (error || !accessToken) throw new Error(error ?? "Falha ao obter token");

      const widget = new window.PluggyConnect({
        connectToken: accessToken,
        onSuccess: async ({ item }) => {
          setLoading(true);
          try {
            const connectResp = await fetchWithAuth("/api/pluggy/connect", {
              method: "POST",
              body: JSON.stringify({ itemId: item.id }),
            });
            const result = await connectResp.json();
            if (result.ok) {
              onConnected();
            }
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error("Pluggy widget error:", err);
          setLoading(false);
        },
        onClose: () => setLoading(false),
      });

      widget.init();
    } catch (err) {
      console.error("Failed to open Pluggy widget:", err);
      setLoading(false);
    }
  }, [onConnected]);

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

  const sync = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetchWithAuth(`/api/pluggy/sync/${walletId}`, { method: "POST" });
      const result = await resp.json();
      if (result.ok) onSynced();
    } finally {
      setLoading(false);
    }
  }, [walletId, onSynced]);

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

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      await fetchWithAuth(`/api/pluggy/disconnect/${walletId}`, { method: "DELETE" });
      onDisconnected();
    } finally {
      setLoading(false);
    }
  }, [walletId, onDisconnected]);

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
