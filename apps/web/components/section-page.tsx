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
        <div className="rounded-[2rem] border border-stone-800/70 bg-[linear-gradient(145deg,rgba(38,29,23,0.96),rgba(16,13,10,0.92))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-stone-50 md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-400 md:text-base">
            {description}
          </p>
        </div>

        <div className="grid gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/70 p-5"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                {stat.label}
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-stone-50">
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
