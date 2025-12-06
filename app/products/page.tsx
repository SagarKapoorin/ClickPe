import { Suspense } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { productSchema, type Product } from "@/types";
import { FiltersClient } from "@/components/products/filters-client";

type ProductsSearchParams = {
  bank?: string;
  aprMax?: string;
  minIncome?: string;
  minCreditScore?: string;
  maxIncome?: string;
  maxCreditScore?: string;
};

async function getFilteredProducts(params: ProductsSearchParams | undefined): Promise<Product[]> {
  const supabase = createSupabaseServerClient();
  //console.log("Filter Params:", params);
  let query = supabase.from("products").select("*");

  const bank = params?.bank;
  if (bank && bank.trim()) {
    query = query.ilike("bank", `%${bank.trim()}%`);
  }

  const aprMax = params?.aprMax ? Number(params.aprMax) : undefined;
  //console.log("Parsed aprMax:", aprMax);
  if (typeof aprMax === "number" && !Number.isNaN(aprMax)) {
    query = query.lte("rate_apr", aprMax);
  }

  const minIncome = params?.minIncome ? Number(params.minIncome) : undefined;
  if (typeof minIncome === "number" && !Number.isNaN(minIncome)) {
    query = query.gte("min_income", minIncome);
  }

  const maxIncome = params?.maxIncome ? Number(params.maxIncome) : undefined;
  if (typeof maxIncome === "number" && !Number.isNaN(maxIncome)) {
    query = query.lte("min_income", maxIncome);
  }

  const minCreditScore = params?.minCreditScore ? Number(params.minCreditScore) : undefined;
  if (typeof minCreditScore === "number" && !Number.isNaN(minCreditScore)) {
    query = query.gte("min_credit_score", minCreditScore);
  }

  const maxCreditScore = params?.maxCreditScore ? Number(params.maxCreditScore) : undefined;
  if (typeof maxCreditScore === "number" && !Number.isNaN(maxCreditScore)) {
    query = query.lte("min_credit_score", maxCreditScore);
  }

  const { data, error } = await query.order("rate_apr", { ascending: true });

  if (error || !data) {
    return [];
  }
  //console.log("Filtered Products Data:", data);
  return productSchema.array().parse(data);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const products = await getFilteredProducts(resolvedSearchParams);
  const aprMaxValue =
    resolvedSearchParams?.aprMax && !Number.isNaN(Number(resolvedSearchParams.aprMax))
      ? Number(resolvedSearchParams.aprMax)
      : 40;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          All Loan Products
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Browse and filter loans by bank, APR, income, and credit score to find the right fit.
        </p>
      </header>
      <Suspense>
        <FiltersClient
          initialBank={resolvedSearchParams?.bank ?? ""}
          initialAprMax={aprMaxValue}
          initialMinIncome={resolvedSearchParams?.minIncome ?? ""}
          initialMinCreditScore={resolvedSearchParams?.minCreditScore ?? ""}
          initialMaxIncome={resolvedSearchParams?.maxIncome ?? ""}
          initialMaxCreditScore={resolvedSearchParams?.maxCreditScore ?? ""}
        />
      </Suspense>
      <section className="mt-4">
         {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            No products match your filters. Try adjusting the criteria.
          </div>
        ) : (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
