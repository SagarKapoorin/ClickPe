import { ProductCard } from "@/components/ui/product-card";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { productSchema, type Product } from "@/types";

async function getTopProducts(): Promise<Product[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("*").order("rate_apr", { ascending: true }).limit(5);
  if (error || !data) {
    return [];
  }
  // console.log("Fetched Products:", data);
  return productSchema.array().parse(data);
}

export default async function DashboardPage() {
  const products = await getTopProducts();

  return (
<div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          The Loan Picks Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Curated top picks based on low APR, flexible tenures, and user-friendly terms.
        </p>
      </header>
   <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Top 5 Picks
          </h2>
        </div>
        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            No products available yet. Add products in Supabase to see your top picks.
          </div>
        ) : (
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                highlight={index === 0}
                rankLabel={`#${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

