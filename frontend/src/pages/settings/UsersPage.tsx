import { useState } from "react";
import { Users, ShieldCheck, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUsers, useUpdateUserRole, useDeleteUser } from "@/api/users";
import { getApiErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/store/auth-context";
import type { User } from "@/types";

function initials(name: string) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }
const ROLE_COLORS = { MANAGER: { bg: "oklch(0.62 0.28 270 / 12%)", color: "oklch(0.48 0.26 270)" }, STAFF: { bg: "oklch(0 0 0 / 6%)", color: "var(--muted-foreground)" } };

export function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const { user: me } = useAuth();
  const [deleting, setDeleting] = useState<User | null>(null);

  async function handleRoleChange(id: string, role: "MANAGER" | "STAFF") {
    try { await updateRole.mutateAsync({ id, role }); toast.success("Role updated"); }
    catch (e) { toast.error(getApiErrorMessage(e)); }
  }

  async function handleDelete() {
    if (!deleting) return;
    try { await deleteUser.mutateAsync(deleting.id); toast.success("User removed"); setDeleting(null); }
    catch (e) { toast.error(getApiErrorMessage(e)); }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Team Members" description="Manage user roles and access across your organization." />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Member</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Email</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Role</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Joined</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>}
              {!isLoading && users.length === 0 && <TableRow><TableCell colSpan={5}><div className="flex flex-col items-center gap-2 py-10 text-center"><Users className="size-9 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No team members found</p></div></TableCell></TableRow>}
              {users.map((u) => {
                const isSelf = u.id === me?.id;
                const roleStyle = ROLE_COLORS[u.role];
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 shrink-0"><AvatarFallback className="text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.48 0.26 300))" }}>{initials(u.name)}</AvatarFallback></Avatar>
                        <span className="font-medium text-sm">{u.name}{isSelf && <span className="ml-1.5 text-[10px] text-muted-foreground">(you)</span>}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      {isSelf ? (
                        <Badge style={{ background: roleStyle.bg, color: roleStyle.color, border: "none" }}>{u.role === "MANAGER" ? "Manager" : "Staff"}</Badge>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80 cursor-pointer" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                              {u.role === "MANAGER" ? "Manager" : "Staff"}<ChevronDown className="size-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, "MANAGER")}><ShieldCheck className="size-3.5 mr-2" /> Manager</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(u.id, "STAFF")}><Users className="size-3.5 mr-2" /> Staff</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{!isSelf && <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => setDeleting(u)}><Trash2 className="size-3.5" /></Button>}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <AlertDialog open={!!deleting} onOpenChange={(v: boolean) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle><AlertDialogDescription>This will permanently delete their account.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete}>Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
