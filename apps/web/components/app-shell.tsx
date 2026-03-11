"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  FolderTree,
  Gauge,
  Settings,
  Tags,
  TimerReset,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  detail: string;
  icon: LucideIcon;
};

const navigation: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    detail: "Current timer and daily pulse",
    icon: Gauge,
  },
  {
    href: "/entries",
    label: "Entries",
    detail: "Timeline and manual edits",
    icon: BookOpenText,
  },
  {
    href: "/folders",
    label: "Folders",
    detail: "Nested structure and inbox",
    icon: FolderTree,
  },
  {
    href: "/labels",
    label: "Labels",
    detail: "Inherited and manual tags",
    icon: Tags,
  },
  {
    href: "/settings",
    label: "Settings",
    detail: "Profile and preferences",
    icon: Settings,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(210,166,95,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(122,161,255,0.12),_transparent_24%),linear-gradient(180deg,_#17120d_0%,_#0e0b08_100%)] text-stone-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-6 lg:flex-row lg:gap-8 lg:px-8">
        <aside className="relative overflow-hidden rounded-[2rem] border border-stone-800/80 bg-stone-950/80 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur md:p-6 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-[320px] lg:flex-none">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(214,177,99,0.12),transparent_38%,rgba(132,153,255,0.08)_100%)]" />
          <div className="relative flex h-full flex-col">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-amber-200/80">
                Phase 1 Shell
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-300 text-stone-950 shadow-[0_12px_35px_rgba(245,191,88,0.35)]">
                  <TimerReset className="size-5" />
                </div>
                <div>
                  <h1 className="font-serif text-3xl tracking-tight text-stone-50">
                    Time
                  </h1>
                  <p className="text-sm text-stone-400">
                    Personal tracking, one hierarchy.
                  </p>
                </div>
              </div>
              <p className="mt-6 max-w-sm text-sm leading-6 text-stone-400">
                The shell is intentionally operational, not decorative. Every
                section below maps directly to a Phase 1 responsibility.
              </p>
            </div>

            <nav className="mt-8 flex flex-col gap-2">
              {navigation.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative overflow-hidden rounded-[1.6rem] border px-4 py-4 transition-all",
                      active
                        ? "border-amber-300/30 bg-amber-200/12 text-stone-50 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
                        : "border-stone-800/70 bg-stone-900/55 text-stone-300 hover:border-stone-700 hover:bg-stone-900/80"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex size-9 items-center justify-center rounded-2xl transition-colors",
                          active
                            ? "bg-amber-300 text-stone-950"
                            : "bg-stone-800 text-stone-300 group-hover:bg-stone-700"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium tracking-wide">
                          {item.label}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-stone-400">
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 grid gap-3 rounded-[1.8rem] border border-stone-800/70 bg-stone-900/70 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-stone-500">
                <span>Current State</span>
                <span>Draft</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                    Routes
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-stone-100">
                    5
                  </div>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                    Focus
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-stone-100">
                    Web
                  </div>
                </div>
              </div>
              <Button
                className="mt-1 w-full rounded-2xl bg-stone-100 text-stone-950 hover:bg-stone-200"
                size="lg"
              >
                Timer Flow Next
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-stone-800/70 bg-stone-950/65 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Personal Control Room
              </p>
              <h2 className="mt-2 text-xl font-medium tracking-tight text-stone-50">
                Phase 1 foundation is live. From here on, we iterate in place.
              </h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-400">
              <div className="rounded-full border border-emerald-400/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-200">
                Local shell ready
              </div>
              <div className="rounded-full border border-stone-800 bg-stone-900 px-3 py-1.5">
                localhost:3003
              </div>
            </div>
          </header>

          <main className="mt-6 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
