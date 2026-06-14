"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AdminSubmissionActionsProps {
  submissionId: string;
}

export function AdminSubmissionActions({
  submissionId,
}: AdminSubmissionActionsProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onApprove() {
    setError(null);
    setApproving(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not approve submission.");
        return;
      }
      toast.success("Submission approved and published.");
      router.push("/admin/submissions");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setApproving(false);
    }
  }

  async function onReject() {
    setError(null);
    if (!reason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setRejecting(true);
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, reason: reason.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not reject submission.");
        return;
      }
      toast.success("Submission rejected. The submitter has been notified.");
      router.push("/admin/submissions");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setRejecting(false);
    }
  }

  const busy = approving || rejecting;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={onApprove}
          disabled={busy}
          className="flex-1"
        >
          {approving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {approving ? "Approving…" : "Approve"}
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-destructive">
            Rejection reason
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell the submitter why this tool wasn't a fit."
            rows={3}
            disabled={busy}
          />
        </div>
        <Button
          type="button"
          onClick={onReject}
          disabled={busy}
          variant="destructive"
          className="w-full sm:w-auto"
        >
          {rejecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <X className="mr-2 h-4 w-4" />
          )}
          {rejecting ? "Rejecting…" : "Reject"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
