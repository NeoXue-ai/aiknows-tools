"use client";

import { X } from "lucide-react";
import {
  TASKS,
  PRICING_OPTIONS,
  USER_TYPES,
  type Task,
  type PricingOption,
  type UserTypeFilter,
} from "@/lib/tool-score";
import { cn } from "@/lib/utils";

interface Props {
  task: Task | null;
  pricing: PricingOption | null;
  userType: UserTypeFilter | null;
  onTaskChange: (t: Task | null) => void;
  onPricingChange: (p: PricingOption | null) => void;
  onUserTypeChange: (u: UserTypeFilter | null) => void;
  onClear: () => void;
}

export function ToolFilters({
  task,
  pricing,
  userType,
  onTaskChange,
  onPricingChange,
  onUserTypeChange,
  onClear,
}: Props) {
  const anyActive = !!(task || pricing || userType);

  return (
    <div className="space-y-3 border-y border-border py-4">
      <FilterRow
        label="Task"
        options={TASKS.map((t) => ({ value: t, label: t }))}
        value={task}
        onChange={(v) => onTaskChange(v as Task | null)}
      />
      <FilterRow
        label="Pricing"
        options={PRICING_OPTIONS.map((p) => ({ value: p, label: p }))}
        value={pricing}
        onChange={(v) => onPricingChange(v as PricingOption | null)}
      />
      <FilterRow
        label="Audience route"
        options={USER_TYPES.map((u) => ({ value: u, label: u }))}
        value={userType}
        onChange={(v) => onUserTypeChange(v as UserTypeFilter | null)}
      />
      {anyActive && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div
        className="-mx-1 flex flex-1 snap-x snap-mandatory items-center gap-1.5 overflow-x-auto px-1 pb-1"
        style={{ scrollbarWidth: "thin" }}
      >
        <PillButton
          active={value === null}
          onClick={() => onChange(null)}
          label="All"
        />
        {options.map((opt) => (
          <PillButton
            key={opt.value}
            active={value === opt.value}
            onClick={() => onChange(value === opt.value ? null : opt.value)}
            label={opt.label}
          />
        ))}
      </div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "snap-start whitespace-nowrap border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-background text-muted-foreground hover:border-accent hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}