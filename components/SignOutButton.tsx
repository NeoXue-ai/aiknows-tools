"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[signout]", error);
        toast.error("Sign out failed. Please try again.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[signout] unexpected:", err);
      toast.error("Sign out failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "w-full justify-start"
      )}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
