"use client";

import { SignOutIcon } from "@/components/ui/icons";
import { secondaryButtonSmall } from "@/components/ui/buttonStyles";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label="Sign out"
      className={secondaryButtonSmall}
    >
      <SignOutIcon className="h-3.5 w-3.5" />
      <span>{busy ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
