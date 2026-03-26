"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/states";
import { Check, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const user = useQuery(api.users.current, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const updatePreferences = useMutation(api.users.updatePreferences);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("");
  const [weekStart, setWeekStart] = useState<"monday" | "sunday">("monday");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setTimezone(user.timezone);
      setWeekStart(user.weekStart);
      setTimeFormat(user.timeFormat);
    }
  }, [user]);

  async function saveProfile() {
    setProfileSaving(true);
    try {
      await updateProfile({ name, email });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePreferences() {
    setPrefsSaving(true);
    try {
      await updatePreferences({ timezone, weekStart, timeFormat });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } finally {
      setPrefsSaving(false);
    }
  }

  if (user === undefined) {
    return <LoadingState message="Loading settings..." />;
  }

  if (user === null) {
    return null;
  }

  return (
    <section className="grid gap-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-stone-800/70 bg-[linear-gradient(145deg,rgba(38,29,23,0.96),rgba(16,13,10,0.92))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-8">
        <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
          Settings
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-stone-50 md:text-5xl">
          Preferences
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-400">
          Personal settings that shape how the app displays time and organizes
          your day.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <h2 className="text-lg font-medium tracking-tight text-stone-100">
            Profile
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            Your display name and email.
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 border-stone-800 bg-stone-900/70 text-stone-100"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 border-stone-800 bg-stone-900/70 text-stone-100"
              />
            </div>
            <Button
              onClick={saveProfile}
              disabled={profileSaving}
              className="w-full gap-2 rounded-xl bg-amber-300 text-stone-950 hover:bg-amber-200"
            >
              {profileSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : profileSaved ? (
                <Check className="size-4" />
              ) : null}
              {profileSaved ? "Saved" : "Save Profile"}
            </Button>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <h2 className="text-lg font-medium tracking-tight text-stone-100">
            Preferences
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            Timezone, time format, and week start.
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                Timezone
              </label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. America/New_York"
                className="mt-1.5 border-stone-800 bg-stone-900/70 text-stone-100 placeholder:text-stone-600"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                Time Format
              </label>
              <div className="mt-1.5 flex gap-2">
                {(["24h", "12h"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setTimeFormat(fmt)}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      timeFormat === fmt
                        ? "border-amber-300/30 bg-amber-300/10 text-amber-300"
                        : "border-stone-800 bg-stone-900/70 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                Week Start
              </label>
              <div className="mt-1.5 flex gap-2">
                {(["monday", "sunday"] as const).map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setWeekStart(day)}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition ${
                      weekStart === day
                        ? "border-amber-300/30 bg-amber-300/10 text-amber-300"
                        : "border-stone-800 bg-stone-900/70 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={savePreferences}
              disabled={prefsSaving}
              className="w-full gap-2 rounded-xl bg-amber-300 text-stone-950 hover:bg-amber-200"
            >
              {prefsSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : prefsSaved ? (
                <Check className="size-4" />
              ) : null}
              {prefsSaved ? "Saved" : "Save Preferences"}
            </Button>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)] lg:col-span-2">
          <h2 className="text-lg font-medium tracking-tight text-stone-100">
            Account
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            Auth provider and session management.
          </p>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/70 px-4 py-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                Provider
              </div>
              <div className="mt-1 text-sm text-stone-200">
                Auth0 (Google + Email)
              </div>
            </div>
            <a
              className="inline-flex items-center justify-center rounded-xl border border-stone-700 bg-stone-900/75 px-4 py-2 text-sm font-medium text-stone-100 transition hover:border-stone-600 hover:bg-stone-900"
              href="/auth/logout"
            >
              Log out
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
