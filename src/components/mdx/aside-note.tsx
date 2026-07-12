type AsideProps = {
  label: string;
  children: React.ReactNode;
};

/**
 * Callout box for case-study asides: small uppercase accent label, then body
 * copy. Accent left border + subtle surface tint, no motion — this is a
 * static reading aid, not an animated element.
 */
export function Aside({ label, children }: AsideProps) {
  return (
    <div className="rounded-r-md border-l-2 border-accent bg-surface/40 py-4 pl-5 pr-5 sm:pl-6">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        {label}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-ink-muted [&_p]:m-0">
        {children}
      </div>
    </div>
  );
}
