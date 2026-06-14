"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skull } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminDirectoryRowActionsProps {
  directoryId: string;
  initialStatus: string;
}

export function AdminDirectoryRowActions({
  directoryId,
  initialStatus,
}: AdminDirectoryRowActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);

  async function markAsDead() {
    const previous = status;
    setStatus("dead");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/directories/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directoryId,
          status: "dead",
          last_checked: new Date().toISOString(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus(previous);
        toast.error(data.error ?? "Could not mark directory as dead");
        return;
      }
      toast.success("Marked as dead");
      router.refresh();
    } catch (err) {
      setStatus(previous);
      console.error(err);
      toast.error("Could not mark directory as dead");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={markAsDead}
        disabled={busy || status === "dead"}
        title="Mark this directory as dead"
      >
        <Skull className="h-4 w-4" />
        <span className="ml-1.5 hidden sm:inline">
          {status === "dead" ? "Dead" : "Mark as dead"}
        </span>
      </Button>
    </div>
  );
}
