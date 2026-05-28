import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

export function useRealtime() {
  const { supabaseUser, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!isSignedIn || !supabaseUser?.id) return;

    const channelName = `user-${supabaseUser.id}`;

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "data-changed" }, () => {
        queryClient.invalidateQueries();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [supabaseUser?.id, isSignedIn, queryClient]);
}
