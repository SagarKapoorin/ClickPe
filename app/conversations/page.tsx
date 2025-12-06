"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Conversation = {
  productId: string;
  productName: string;
  productBank: string;
  lastMessage: string;
  lastRole: "user" | "assistant";
  updatedAt: string;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabaseClient.auth.getUser();
      const user = userData.user;

      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data, error: queryError } = await supabaseClient
        .from("ai_chat_messages")
        .select("product_id, role, content, created_at, products(name, bank)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (queryError) {
        setError("Unable to load conversations right now.");
        setLoading(false);
        return;
      }
      type RawRow = {
        product_id: string;
        role: string;
        content: string | null;
        created_at: string;
        products:
          | { name: string; bank: string }
          | { name: string; bank: string }[]
          | null;
      };
      //console.log("AI Chat Messages Data:", data);
      const rows = (data ?? []) as unknown as RawRow[];
//console.log("Typed Rows:", rows);
      const map = new Map<string, Conversation>();

      for (const row of rows) {
        if (!row.products) {
          continue;
        }

        const productRel = Array.isArray(row.products)
          ? row.products[0]
          : row.products;

        if (!productRel) {
          //console.log("Missing product relation for row:", row);
          continue;
        }

        if (map.has(row.product_id)) {
          continue;
        }

        const role: "user" | "assistant" =
          row.role === "assistant" ? "assistant" : "user";
        map.set(row.product_id, {
          productId: row.product_id,
          productName: productRel.name,
          productBank: productRel.bank,
          lastMessage: row.content ?? "",
          lastRole: role,
          updatedAt: row.created_at,
        });
      }

      setConversations(Array.from(map.values()));
      setLoading(false);
    };

    void load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading your conversations...
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          <p className="mb-3">
            Log in to view your saved AI conversations for each loan product.
          </p>
          <Link
            href="/auth"
            className="text-xs font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          My AI Conversations
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Review your recent chats with the AI assistant for each loan product.
        </p>
      </header>
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          You have no saved conversations yet. Ask a question on any product to start a chat.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conversations.map((item) => (
            <Card key={item.productId}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm">
                      {item.productName}
                    </CardTitle>
                    <CardDescription>{item.productBank}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {item.lastRole === "assistant" ? "AI reply" : "You"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {item.lastMessage || "No message content available."}
                </p>
                <Link
                  href={`/products/${item.productId}`}
                  className="mt-3 inline-flex text-xs font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
                >
                  Open chat for this product
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
