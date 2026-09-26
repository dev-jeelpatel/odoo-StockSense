import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Shield, KeyRound, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMe, useUpdateMe, useChangePassword } from "@/api/users";
import { getApiErrorMessage } from "@/lib/api-client";

function initials(name: string) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }

const profileSchema = z.object({ name: z.string().trim().min(2, "At least 2 characters") });
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type PasswordValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: "" } });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  useEffect(() => { if (me) profileForm.reset({ name: me.name }); }, [me]);

  async function onSaveProfile(values: ProfileValues) {
    try { await updateMe.mutateAsync(values); toast.success("Profile updated"); }
    catch (e) { toast.error(getApiErrorMessage(e)); }
  }

  async function onChangePassword(values: PasswordValues) {
    try { await changePassword.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword }); toast.success("Password changed successfully"); passwordForm.reset(); }
    catch (e) { toast.error(getApiErrorMessage(e)); }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="My Profile" description="Manage your account details and security settings." />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {me && (
            <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
              <Avatar className="size-14 shrink-0">
                <AvatarFallback className="text-lg font-bold text-white" style={{ background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.48 0.26 300))" }}>{initials(me.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold truncate">{me.name}</p>
                <p className="text-sm text-muted-foreground truncate">{me.email}</p>
              </div>
              <Badge variant="secondary">{me.role === "MANAGER" ? "Inventory Manager" : "Warehouse Staff"}</Badge>
            </div>
          )}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><User className="size-4" /> Personal Information</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={profileForm.control} name="name" render={({ field }) => (
                        <FormItem className="col-span-2"><FormLabel>Full name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div><p className="text-xs font-medium text-muted-foreground mb-1.5">Email address</p><p className="text-sm">{me?.email}</p></div>
                      <div><p className="text-xs font-medium text-muted-foreground mb-1.5">Role</p><p className="text-sm">{me?.role === "MANAGER" ? "Inventory Manager" : "Warehouse Staff"}</p></div>
                    </div>
                    <Button type="submit" disabled={updateMe.isPending} size="sm"><Save className="size-3.5 mr-1.5" />{updateMe.isPending ? "Saving…" : "Save changes"}</Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="size-4" /> Change Password</CardTitle></CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                  <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (<FormItem><FormLabel>Current password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>New password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm new password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <Button type="submit" variant="outline" disabled={changePassword.isPending} size="sm"><Shield className="size-3.5 mr-1.5" />{changePassword.isPending ? "Updating…" : "Update password"}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
