"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface UserMenuProps {
  email: string;
  isAdmin: boolean;
}

export function UserMenu({ email, isAdmin }: UserMenuProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onSignOut() {
    setBusy(true);
    try {
      const response = await fetch("/auth/logout", { method: "POST" });
      if (!response.ok) {
        console.error("[signout]", await response.text());
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
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:text-foreground/80 inline-flex items-center gap-1.5 text-sm">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{email}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Signed in</p>
            <p className="text-muted-foreground text-xs">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/submit" />}>
          Submit a tool
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            Admin dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} disabled={busy}>
          <LogOut className="mr-2 h-4 w-4" />
          {busy ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
