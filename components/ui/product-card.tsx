import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChatSheet } from "@/components/chat/chat-sheet";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  highlight?: boolean;
  rankLabel?: string;
};

function getProductTypeLabel(type: Product["type"]): string {
  if (type === "credit_line") return "Credit Line";
  if (type === "debt_consolidation") return "Debt Consolidation";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ProductCard(props: ProductCardProps) {
  const { product, highlight = false, rankLabel } = props;

  const badges: string[] = [];

  if (product.rate_apr < 10) badges.push("Low APR");
  if (product.disbursal_speed === "fast") badges.push("Fast Disbursal");
  if (product.docs_level === "low") badges.push("Low Docs");
  if (product.prepayment_allowed) badges.push("No Prepayment Fee");

  return (
    <Card className="flex h-full flex-col gap-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.bank}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            {highlight && (
              <Badge variant="success">
                Best Match
              </Badge>
            )}
            {rankLabel && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {rankLabel}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Type
            </div>
            <div className="font-medium">
              {getProductTypeLabel(product.type)}
            </div>
          </div>
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
              {product.tenure_min_months}–{product.tenure_max_months} months
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {badges.map((badge) => (
            <Badge key={badge} variant="outline">
              {badge}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <ChatSheet
          product={product}
          trigger={(
            <Button className="w-full" size="md">
              Ask AI
            </Button>
          )}
        />
      </CardFooter>
    </Card>
  );
}

