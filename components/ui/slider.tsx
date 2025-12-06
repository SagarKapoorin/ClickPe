import type { ChangeEvent } from "react";

type SliderProps = {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
};

export function Slider(props: SliderProps) {
  const { value, min = 0, max = 100, step = 1, onValueChange } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (onValueChange) {
      onValueChange([next]);
    }
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
    />
  );
}

