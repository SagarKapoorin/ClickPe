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
  const [name, setName] = useState("");
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
    const trimmedName = name.trim();
    if (
      !trimmedEmail ||
      !password ||
      loading ||
      (mode === "signup" && !trimmedName)
    ) {
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
            display_name: trimmedName || user.email,
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
            display_name: trimmedName || user.email,
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 px-4 py-8 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <div className="w-full max-w-5xl grid gap-8 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-8 md:grid-cols-[1.2fr,1fr]">
        {/* Left: marketing / context (hidden on small screens) */}
        <div className="hidden flex-col justify-between rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-zinc-50 md:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Loan Picks
            </p>
            <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
              Smarter loan decisions with AI.
            </h1>
            <p className="mt-3 text-sm text-zinc-300">
              Compare products, understand your options, and chat with an
              assistant that explains everything in plain language.
            </p>
          </div>
          <ul className="mt-6 space-y-2 text-xs text-zinc-300">
            <li>• Personalized recommendations based on your profile</li>
            <li>• Secure, encrypted authentication with Supabase</li>
            <li>• Save and revisit your loan conversations anytime</li>
          </ul>
        </div>

        {/* Right: auth form */}
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex flex-col gap-2">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {mode === "login"
                  ? "Log in to access your dashboard and saved chats."
                  : "Sign up to get personalized loan recommendations."}
              </p>
            </div>
            <span className="inline-flex items-center self-start rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
              {mode === "login" ? "Existing user" : "New user"}
            </span>
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Full name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  disabled={loading}
                  className="h-10 rounded-xl"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Email address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-600 dark:text-zinc-300">
                  Password
                </span>
                <span className="text-[11px] text-zinc-400">
                  Minimum 6 characters
                </span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
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
          </div>

          <Button
            className="mt-4 w-full rounded-xl text-sm font-semibold"
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && (
              <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50" />
            )}
            {loading
              ? mode === "login"
                ? "Logging you in..."
                : "Creating your account..."
              : mode === "login"
              ? "Continue"
              : "Create account"}
          </Button>

          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            By continuing, you agree to receive relevant loan updates on this
            email.
          </p>

          <button
            type="button"
            onClick={handleToggleMode}
            disabled={loading}
            className="mt-3 w-full text-center text-xs font-medium text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {mode === "login"
              ? "New here? Create an account"
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
