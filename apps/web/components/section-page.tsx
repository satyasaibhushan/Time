import type { ReactNode } from "react";

type Stat = {
  label: string;
  value: string;
};

export function SectionPage({
  eyebrow,
  title,
  description,
  stats,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  stats: Stat[];
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-panel border border-[var(--border)] p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--terra-sage)]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-[var(--terra-pine)] md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--terra-sage)] md:text-base">
            {description}
          </p>
        </div>

        <div className="grid gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="surface-panel border border-[var(--border)] p-5"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--terra-sage)]">
                {stat.label}
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-[var(--terra-pine)]">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}
