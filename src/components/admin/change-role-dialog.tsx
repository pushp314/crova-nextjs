"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/lib/types";

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserProfile | null;
  onSuccess: () => void;
}

type UserRole = "USER" | "ADMIN" | "DELIVERY";

const roleDescriptions: Record<UserRole, string> = {
  USER: "Regular customer with shopping access",
  ADMIN: "Full access to admin dashboard and settings",
  DELIVERY: "Access to delivery dashboard for order fulfillment",
};

export function ChangeRoleDialog({
  isOpen,
  onOpenChange,
  user,
  onSuccess,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("USER");
  const [isLoading, setIsLoading] = useState(false);

  // Update selected role when user changes
  useState(() => {
    if (user) {
      setSelectedRole(user.role as UserRole);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedRole === user.role) {
      toast.info("No changes made");
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      toast.success("Role updated successfully", {
        description: `${user.name || user.email} is now a ${selectedRole.toLowerCase()}`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.name || user.email}. This will change
            their access permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as UserRole)}
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">User</span>
                      <span className="text-xs text-muted-foreground">
                        Regular customer
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="DELIVERY">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Delivery</span>
                      <span className="text-xs text-muted-foreground">
                        Delivery personnel
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Admin</span>
                      <span className="text-xs text-muted-foreground">
                        Full admin access
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {roleDescriptions[selectedRole]}
              </p>
            </div>

            {selectedRole === "DELIVERY" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
                <p className="font-medium">Delivery Role Access:</p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>View assigned orders</li>
                  <li>Update delivery status</li>
                  <li>Upload delivery proof</li>
                </ul>
              </div>
            )}

            {selectedRole === "ADMIN" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                <p className="font-medium">⚠️ Admin Role Access:</p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>Full access to admin dashboard</li>
                  <li>Manage products, orders, users</li>
                  <li>Assign roles to other users</li>
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
