import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TimerControllerProvider } from "@/components/timer/timer-controller";
import { auth0 } from "@/lib/auth0";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <TimerControllerProvider>
      <AppShell
        user={{
          email: session.user.email,
          imageUrl: session.user.picture,
          name: session.user.name ?? session.user.nickname ?? "Personal account",
        }}
      >
        {children}
      </AppShell>
    </TimerControllerProvider>
  );
}
