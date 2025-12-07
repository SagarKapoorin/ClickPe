import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { productSchema, type Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ChatSheet } from "@/components/chat/chat-sheet";

async function getProductById(id: string): Promise<Product | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }
  //console.log("Fetched Product:", data);
  return productSchema.parse(data);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const badges: string[] = [];
  if (product.rate_apr < 10) badges.push("Low APR");
  if (product.disbursal_speed === "fast") badges.push("Fast Disbursal");
  if (product.docs_level === "low") badges.push("Low Docs");
  if (product.prepayment_allowed) badges.push("No Prepayment Fee");
  const termsEntries = Object.entries(product.terms ?? {}).slice(0, 3);

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Product details
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Review this loan&apos;s key terms and continue your AI conversation.
        </p>
      </header>
      <Card className="flex flex-col gap-4 border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.bank}</CardDescription>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {badges.map((badge) => (
                <Badge key={badge} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              APR
            </div>
            <div className="font-semibold">
              {product.rate_apr.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Tenure
            </div>
            <div className="font-medium">
              {product.tenure_min_months}-{product.tenure_max_months} months
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Minimum income
            </div>
            <div className="font-medium">
              {product.min_income}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Minimum credit score
            </div>
            <div className="font-medium">
              {product.min_credit_score}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Processing fee
            </div>
            <div className="font-medium">
              {product.processing_fee_pct}% of amount
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Prepayment
            </div>
            <div className="font-medium">
              {product.prepayment_allowed ? "Allowed" : "Not allowed"}
            </div>
          </div>
        </CardContent>
        <CardContent className="border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Key details
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Disbursal speed
              </div>
              <div className="font-medium">
                {product.disbursal_speed}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Documentation level
              </div>
              <div className="font-medium">
                {product.docs_level}
              </div>
            </div>
          </div>
        </CardContent>
        {product.summary && (
          <CardContent className="text-sm text-zinc-600 dark:text-zinc-300">
            {product.summary}
          </CardContent>
        )}
        {product.faq.length > 0 && (
          <CardContent className="space-y-3 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              FAQs
            </h2>
            <div className="space-y-3">
              {product.faq.map((item, index) => (
                <div key={`${item.question}-${index}`} className="space-y-1">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {item.question}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
        {termsEntries.length > 0 && (
          <CardContent className="space-y-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Key terms
            </h2>
            <dl className="grid gap-3 md:grid-cols-2">
              {termsEntries.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                    {key}
                  </dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                    {typeof value === "string"
                      ? value
                      : JSON.stringify(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        )}
        <CardFooter>
          <div className="w-full">
            <ChatSheet
              product={product}
              trigger={
                <div className="w-full">
                  <span className="inline-flex h-10 w-full items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-zinc-50 shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                    Open AI chat
                  </span>
                </div>
              }
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
