"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data } = await supabaseClient.auth.getUser();
      if (data.user) {
        if (typeof document !== "undefined") {
          document.cookie = "lp_logged_in=1; path=/; max-age=604800";
        }
        router.replace(redirectTo);
      }
    };

    void checkExistingSession();
  }, [router, redirectTo]);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabaseClient.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) {
          throw signUpError;
        }
        const user = data.user;
        if (user?.id && user.email) {
          await supabaseClient.from("users").upsert({
            id: user.id,
            email: user.email,
            display_name: user.email,
          });
        }
      } else {
        const { data, error: signInError } =
          await supabaseClient.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
        if (signInError) {
          throw signInError;
        }
        const user = data.user;
        if (user?.id && user.email) {
          await supabaseClient.from("users").upsert({
            id: user.id,
            email: user.email,
            display_name: user.email,
          });
        }
      }

      if (typeof document !== "undefined") {
        document.cookie = "lp_logged_in=1; path=/; max-age=604800";
      }

      router.push(redirectTo);
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "Unable to authenticate. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {mode === "login" ? "Log in to Loan Picks" : "Create your account"}
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Use your email and a password to continue. You can view your saved chats when logged in.
        </p>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Email
            </div>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Password
            </div>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>
          {error && (
            <div className="text-xs text-red-500">
              {error}
            </div>
          )}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Log in"
              : "Sign up"}
          </Button>
          <button
            type="button"
            onClick={handleToggleMode}
            className="w-full text-center text-xs text-zinc-600 underline underline-offset-4 dark:text-zinc-400"
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
