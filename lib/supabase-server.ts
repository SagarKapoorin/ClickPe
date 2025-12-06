import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase server environment variables are not configured.");
}

export function createSupabaseServerClient(accessToken?: string | null) {
  const options: SupabaseClientOptions<"public"> | undefined =
    accessToken && accessToken.trim().length > 0
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      : undefined;

  return createClient(supabaseUrl as string, supabaseAnonKey as string, options);
}
