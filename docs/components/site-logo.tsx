type SiteLogoProps = {
  compact?: boolean;
};

export function SiteLogo({ compact = false }: SiteLogoProps) {
  return (
    <span className="flex items-center gap-3 text-[var(--uk-text-primary)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--uk-border-subtle)] bg-[rgba(255,255,255,0.75)] shadow-[var(--uk-shadow-soft)] dark:bg-[rgba(255,255,255,0.05)]">
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
        <span className="react-rsc-kit-muted-label">
          {compact ? "Docs" : "React utility library"}
        </span>
        <span className="text-base font-semibold tracking-[-0.02em] sm:text-lg">react-rsc-kit</span>
      </span>
    </span>
  );
}
