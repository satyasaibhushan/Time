"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/states";
import { Check, Loader2, Pencil, X } from "lucide-react";

export default function SettingsPage() {
  const user = useQuery(api.users.current, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const updatePreferences = useMutation(api.users.updatePreferences);

  // Edit mode toggles
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Preferences form state
  const [timezone, setTimezone] = useState("");
  const [weekStart, setWeekStart] = useState<"monday" | "sunday">("monday");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [prefsSaving, setPrefsSaving] = useState(false);

  // Sync form state from server data
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setTimezone(user.timezone);
      setWeekStart(user.weekStart);
      setTimeFormat(user.timeFormat);
    }
  }, [user]);

  function cancelProfileEdit() {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
    setEditingProfile(false);
  }

  function cancelPrefsEdit() {
    if (user) {
      setTimezone(user.timezone);
      setWeekStart(user.weekStart);
      setTimeFormat(user.timeFormat);
    }
    setEditingPrefs(false);
  }

  async function saveProfile() {
    setProfileSaving(true);
    try {
      await updateProfile({ name, email });
      setEditingProfile(false);
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePreferences() {
    setPrefsSaving(true);
    try {
      await updatePreferences({ timezone, weekStart, timeFormat });
      setEditingPrefs(false);
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium tracking-tight text-stone-100">
                Profile
              </h2>
              <p className="mt-2 text-sm text-stone-400">
                Your display name and email.
              </p>
            </div>
            {!editingProfile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProfile(true)}
                className="gap-1.5 text-stone-400 hover:text-stone-100"
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            {editingProfile ? (
              <>
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={cancelProfileEdit}
                    disabled={profileSaving}
                    className="flex-1 gap-1.5 rounded-xl border-stone-700 bg-stone-950/80 text-stone-100 hover:bg-stone-800/80 hover:text-stone-50"
                  >
                    <X className="size-3.5" />
                    Cancel
                  </Button>
                  <Button
                    onClick={saveProfile}
                    disabled={profileSaving}
                    className="flex-1 gap-2 rounded-xl bg-amber-300 text-stone-950 hover:bg-amber-200"
                  >
                    {profileSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                    Name
                  </div>
                  <div className="mt-1 text-sm text-stone-200">
                    {user.name || "Not set"}
                  </div>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                    Email
                  </div>
                  <div className="mt-1 text-sm text-stone-200">
                    {user.email || "Not set"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-[1.8rem] border border-stone-800/70 bg-stone-950/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium tracking-tight text-stone-100">
                Preferences
              </h2>
              <p className="mt-2 text-sm text-stone-400">
                Timezone, time format, and week start.
              </p>
            </div>
            {!editingPrefs && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPrefs(true)}
                className="gap-1.5 text-stone-400 hover:text-stone-100"
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            {editingPrefs ? (
              <>
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
                            : "border-stone-800 bg-stone-900/70 text-stone-300 hover:border-stone-700"
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
                            : "border-stone-800 bg-stone-900/70 text-stone-300 hover:border-stone-700"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={cancelPrefsEdit}
                    disabled={prefsSaving}
                    className="flex-1 gap-1.5 rounded-xl border-stone-700 bg-stone-950/80 text-stone-100 hover:bg-stone-800/80 hover:text-stone-50"
                  >
                    <X className="size-3.5" />
                    Cancel
                  </Button>
                  <Button
                    onClick={savePreferences}
                    disabled={prefsSaving}
                    className="flex-1 gap-2 rounded-xl bg-amber-300 text-stone-950 hover:bg-amber-200"
                  >
                    {prefsSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                    Timezone
                  </div>
                  <div className="mt-1 text-sm text-stone-200">
                    {user.timezone}
                  </div>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                    Time Format
                  </div>
                  <div className="mt-1 text-sm text-stone-200">
                    {user.timeFormat}
                  </div>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                    Week Start
                  </div>
                  <div className="mt-1 text-sm capitalize text-stone-200">
                    {user.weekStart}
                  </div>
                </div>
              </>
            )}
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
