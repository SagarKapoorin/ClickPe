"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

type FiltersClientProps = {
  initialBank: string;
  initialAprMax: number;
  initialMinIncome: string;
  initialMinCreditScore: string;
};

export function FiltersClient(props: FiltersClientProps) {
  const { initialBank, initialAprMax, initialMinIncome, initialMinCreditScore } = props;
  const [bank, setBank] = useState(initialBank);
  const [aprMax, setAprMax] = useState(initialAprMax);
  const [minIncome, setMinIncome] = useState(initialMinIncome);
  const [minCreditScore, setMinCreditScore] = useState(initialMinCreditScore);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (bank.trim()) {
      params.set("bank", bank.trim());
    } else {
      params.delete("bank");
    }
    if (!Number.isNaN(aprMax)) {
      params.set("aprMax", String(aprMax));
    } else {
      params.delete("aprMax");
    }
    if (minIncome.trim()) {
      params.set("minIncome", minIncome.trim());
    } else {
      params.delete("minIncome");
    }
    if (minCreditScore.trim()) {
      params.set("minCreditScore", minCreditScore.trim());
    } else {
      params.delete("minCreditScore");
    }
    const next = `${pathname}?${params.toString()}`;
    router.push(next);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Bank
          </div>
          <Input
            value={bank}
            onChange={(event) => setBank(event.target.value)}
            placeholder="Search by bank name"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <span>Max APR</span>
            <span className="text-zinc-700 dark:text-zinc-200">
              {aprMax}%
            </span>
          </div>
          <Slider
            value={[aprMax]}
            min={5}
            max={40}
            step={0.5}
            onValueChange={(value) => setAprMax(value[0])}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Max Income Requirement
          </div>
          <Input
            type="number"
            min={0}
         value={minIncome}
            onChange={(event) => setMinIncome(event.target.value)}
            placeholder="e.g. 50000"
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Max Credit Score Requirement
          </div>
          <Input
            type="number"
            min={0}
            max={900}
            value={minCreditScore}
          onChange={(event) => setMinCreditScore(event.target.value)}
            placeholder="e.g. 750"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

