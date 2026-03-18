type SiteLogoProps = {
  compact?: boolean;
};

export function SiteLogo({ compact = false }: SiteLogoProps) {
  return (
    <span className="flex items-center gap-3 text-slate-950 dark:text-white">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950">
        <svg
          width="28"
          height="28"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="120" height="120" rx="24" fill="#0F172A" />
          <path
            d="M38 26C38 37 28 42 28 53C28 64 38 69 49 69C60 69 71 64 71 53"
            stroke="#F8FAFC"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="74" cy="53" r="6" fill="#FDBA74" />
          <path d="M31 78L44 91" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M49 95L56 88C59 85 64 87 67 90L69 92C72 95 74 97 71 100L64 107"
            stroke="#F8FAFC"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span className="flex flex-col">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          {compact ? "Docs" : "React Utility Library"}
        </span>
        <span className="text-base font-semibold tracking-[-0.02em] sm:text-lg">
          @thepuskar/use-kit
        </span>
      </span>
    </span>
  );
}
