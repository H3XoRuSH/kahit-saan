"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

export default function AliasTooltip({ defaultAlias }: { defaultAlias: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Alias information"
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-espresso/40 hover:text-espresso focus:text-espresso"
      >
        <HelpCircle size={13} strokeWidth={2.5} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 w-48 rounded-lg border border-espresso/20 bg-espresso p-2 text-center font-mono text-[11px] font-medium leading-tight text-milk shadow-lg normal-case tracking-normal"
        >
          You will be introduced as{" "}
          <strong className="text-mango">{defaultAlias || "Gutom …"}</strong>{" "}
          if no alias is entered.
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-espresso" />
        </span>
      )}
    </span>
  );
}
