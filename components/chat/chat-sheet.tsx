"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {aiAskResponseSchema,type ChatHistoryItem,} from "@/types";
import type { Product } from "@/types";

type ChatSheetProps = {
  product: Product;
  trigger: React.ReactNode;
};

type MessageBubbleProps = {
  message: ChatHistoryItem;
};

function MessageBubble(props: MessageBubbleProps) {
  const { message } = props;
  const isUser=message.role==="user";
  //console.log("Mesage:", message);

  return (
    <div className="mb-3 flex">
      <div
        className={
          isUser? "ml-auto max-w-[80%] whitespace-pre-line rounded-2xl bg-zinc-900 px-3 py-2 text-sm text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
            : "mr-auto max-w-[80%] whitespace-pre-line rounded-2xl bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
        }
      >
        {message.content}
      </div>
    </div>
  );
}

export function ChatSheet(props: ChatSheetProps) {
const { product, trigger }=props;
   const [history, setHistory]=useState<ChatHistoryItem[]>([]);
 const [input, setInput]=useState("");
   const [loading, setLoading]=useState(false);
  const [error, setError]=useState<string | null>(null);
  const bottomRef=useRef<HTMLDivElement | null>(null);
  //console.log("ChatSheet Rendered with product:", product, "history:", history, "loading:", loading);

  const headerBadges = useMemo(() => {
    const list: string[] = [];
    if (product.rate_apr < 10) list.push("Low APR");
    if (product.disbursal_speed === "fast") list.push("Fast Disbursal");
    if (product.docs_level === "low") list.push("Low Docs");
    if (product.prepayment_allowed) list.push("No Prepayment Fee");
    return list;
  }, [product]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, loading]);

  const handleSend=async()=> {
    const trimmed=input.trim();
    if (!trimmed||loading) return;
        const nextUserMessage: ChatHistoryItem = {
      role: "user",
      content: trimmed,
    };
    const baseHistory = [...history, nextUserMessage];
    setHistory(baseHistory);
    setInput("");
    setLoading(true);
    setError(null);
    //console.log("Sending message:", trimmed, "with history:", baseHistory);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          message: trimmed,
          history: baseHistory,
        }),
      });
//console.log("API Response2:", response);
      if (!response.ok) {
        throw new Error("Request failed");
      }
      const data = await response.json();
      const parsed = aiAskResponseSchema.parse(data);

      const assistantMessage: ChatHistoryItem = {
        role: "assistant",
        content: parsed.message,
      };

      setHistory((current) => [...current, assistantMessage]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <Sheet>
      <SheetTrigger>{trigger}</SheetTrigger>
      <SheetContent>
        <div className="flex h-full flex-col gap-3">
          <SheetHeader>
            <SheetTitle>{product.name}</SheetTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{product.bank}</span>
              <span>•</span>
              <span>{product.type}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {headerBadges.map((badge) => (
                <Badge key={badge} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
            {history.length === 0 && !loading && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Ask anything about this loan, such as eligibility, fees, or ideal use cases.
              </div>
            )}
            {history.map((message, index) => (
              <MessageBubble
                key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                message={message}
              />
            ))}
            {loading && (
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            )}
            <div ref={bottomRef} />
          </ScrollArea>
          {error && (
            <div className="text-xs text-red-500">
              {error}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this product..."
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Send
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
