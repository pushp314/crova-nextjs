"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/lib/types";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
});

const avatarFormSchema = z.object({
  avatar: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, "Avatar image is required.")
    .refine((files) => files?.[0]?.size <= 1024 * 1024, `Max file size is 1MB.`)
    .refine(
      (files) => ["image/jpeg", "image/png", "image/gif"].includes(files?.[0]?.type),
      "Only .jpg, .png, and .gif formats are supported."
    ),
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;
type AvatarFormValues = z.infer<typeof avatarFormSchema>;

interface EditProfileDialogProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
  children: React.ReactNode;
}

export function EditProfileDialog({ user, onUpdate, children }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user.name || "" },
  });
  
  const avatarForm = useForm<AvatarFormValues>();
  const avatarFileRef = avatarForm.register("avatar");


  const onNameSubmit = async (data: ProfileFormValues) => {
    setIsNameLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile.");
      }

      const updatedUser = await res.json();
      onUpdate(updatedUser);
      toast.success("Name updated successfully!");
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message });
    } finally {
      setIsNameLoading(false);
    }
  };
  
  const onAvatarSubmit = async (data: AvatarFormValues) => {
      setIsAvatarLoading(true);
      const formData = new FormData();
      formData.append("avatar", data.avatar[0]);

      try {
          const res = await fetch("/api/users/me/avatar", {
              method: "POST",
              body: formData,
          });

          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || "Failed to upload avatar.");
          }

          const updatedUser = await res.json();
          onUpdate(updatedUser);
          toast.success("Avatar updated successfully!");
          setIsOpen(false);
      } catch (error: any) {
           toast.error("Upload Failed", { description: error.message });
      } finally {
          setIsAvatarLoading(false);
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...avatarForm}>
            <form onSubmit={avatarForm.handleSubmit(onAvatarSubmit)} className="space-y-4 py-4 border-b">
                 <FormField
                    control={avatarForm.control}
                    name="avatar"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profile Picture</FormLabel>
                            <FormControl>
                                <Input type="file" {...avatarFileRef} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                <Button type="submit" disabled={isAvatarLoading} className="w-full">
                    {isAvatarLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload New Picture
                </Button>
            </form>
        </Form>
        
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onNameSubmit)} className="space-y-4 pt-4">
            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isNameLoading} className="w-full">
                {isNameLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Name
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
