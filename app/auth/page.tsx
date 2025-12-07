"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

type AuthMode = "login" | "signup";

function AuthPageContent() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data } = await supabaseClient.auth.getUser();
      if (typeof document !== "undefined") {
        if (data.user) {
          document.cookie = "lp_logged_in=1; path=/; max-age=604800";
          router.replace(redirectTo);
          return;
        }
        document.cookie = "lp_logged_in=; path=/; max-age=0";
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
    setSuccess(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } =
          await supabaseClient.auth.signUp({
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

             if (
          user &&
          Array.isArray((user).identities) &&
          (user).identities.length === 0
        ) {
          setError(
            "An account with this email already exists. Please log in instead."
          );
          setMode("login");
          setPassword("");
          return;
        }

       if (!data.session) {
          setSuccess(
            "Sign up successful! Please check your email to confirm your account before logging in."
          );
          setMode("login");
          setPassword("");
          return;
        }
        const { data: userData, error: userError } =
          await supabaseClient.auth.getUser();
        if (userError || !userData.user) {
          const message =
            userError?.message ||
            "Sign up failed. Please try again.";
          throw new Error(message);
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

        const { data: userData, error: userError } =
          await supabaseClient.auth.getUser();
        if (userError || !userData.user) {
          const message =
            userError?.message ||
            "Login failed. Please check your credentials and try again.";
          throw new Error(message);
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
    setSuccess(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-black">
      <div className="w-full max-w-md rounded-3xl border-2 border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {mode === "login"
            ? "Log in to access your personalized loan recommendations and saved chats."
            : "Sign up to get started with personalized loan recommendations and AI assistance."}
        </p>
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email Address
            </div>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Password
            </div>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              disabled={loading}
            />
          </div>
          {error && (
            <Alert variant="destructive" className="text-xs font-semibold">
              {error}
            </Alert>
          )}
          {success && !error && (
            <Alert className="text-xs font-semibold">
              {success}
            </Alert>
          )}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Signing up..."
              : mode === "login"
              ? "Log In"
              : "Sign Up"}
          </Button>
          <button
            type="button"
            onClick={handleToggleMode}
            disabled={loading}
            className="w-full text-center text-sm font-semibold text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  );
}
