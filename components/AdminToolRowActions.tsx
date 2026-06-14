"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminToolRowActionsProps {
  toolId: string;
  initialFeatured: boolean;
  initialVerified: boolean;
  initialStatus: string;
}

export function AdminToolRowActions({
  toolId,
  initialFeatured,
  initialVerified,
  initialStatus,
}: AdminToolRowActionsProps) {
  const router = useRouter();
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);

  async function updateTool(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tools/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, ...payload }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Update failed");
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onToggleFeatured() {
    const next = !isFeatured;
    const previous = isFeatured;
    setIsFeatured(next);
    const ok = await updateTool({ is_featured: next });
    if (ok) {
      toast.success(next ? "Promoted to featured" : "Removed from featured");
      router.refresh();
    } else {
      setIsFeatured(previous);
    }
  }

  async function onToggleVerified() {
    const next = !isVerified;
    const previous = isVerified;
    setIsVerified(next);
    const ok = await updateTool({ is_verified: next });
    if (ok) {
      toast.success(next ? "Marked as verified" : "Unmarked verified");
      router.refresh();
    } else {
      setIsVerified(previous);
    }
  }

  async function onUnpublish() {
    const previous = status;
    setStatus("pending");
    const ok = await updateTool({ status: "pending" });
    if (ok) {
      toast.success("Tool unpublished");
      router.refresh();
    } else {
      setStatus(previous);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant={isFeatured ? "default" : "outline"}
        onClick={onToggleFeatured}
        disabled={busy}
        title={isFeatured ? "Remove from featured" : "Promote to featured"}
      >
        <Star className="h-4 w-4" />
        <span className="ml-1.5 hidden sm:inline">
          {isFeatured ? "Featured" : "Feature"}
        </span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant={isVerified ? "default" : "outline"}
        onClick={onToggleVerified}
        disabled={busy}
        title={isVerified ? "Unmark verified" : "Mark verified"}
      >
        <span className="font-mono text-xs">V</span>
        <span className="ml-1.5 hidden sm:inline">
          {isVerified ? "Verified" : "Verify"}
        </span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={onUnpublish}
        disabled={busy || status === "pending"}
        title="Unpublish this tool"
      >
        <EyeOff className="h-4 w-4" />
        <span className="ml-1.5 hidden sm:inline">Unpublish</span>
      </Button>
    </div>
  );
}
