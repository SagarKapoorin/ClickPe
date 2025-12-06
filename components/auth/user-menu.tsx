"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";

type AuthUser = {
  id: string;
  email: string;
};

export function UserMenu() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const applySessionUser = (sessionUser: { id: string; email?: string | null } | null) => {
      if (sessionUser?.id && sessionUser.email) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    const load = async () => {
      const { data } = await supabaseClient.auth.getUser();
      applySessionUser(data.user ?? null);
    };

    void load();

    const { data: subscriptionData } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        applySessionUser(session?.user ?? null);
      }
    );

    return () => {
      subscriptionData.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    if (typeof document !== "undefined") {
      document.cookie = "lp_logged_in=; path=/; max-age=0";
    }
    setUser(null);
    router.push("/auth");
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/auth")}
      >
        Log in
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="max-w-[160px] truncate text-xs text-zinc-600 dark:text-zinc-300">
        {user.email}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
      >
        Log out
      </Button>
    </div>
  );
}
