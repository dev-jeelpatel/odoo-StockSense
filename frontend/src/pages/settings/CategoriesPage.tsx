import { useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/api/categories";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import type { ProductCategory } from "@/types";
import { useAuth } from "@/store/auth-context";

function CategoryFormDialog({ open, onClose, editing, categories }: { open: boolean; onClose: () => void; editing: ProductCategory | null; categories: ProductCategory[] }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(editing?.name ?? "");
  const [parentId, setParentId] = useState<string>(editing?.parentId ?? "none");

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { name: name.trim(), parentId: parentId === "none" ? null : parentId };
      if (editing) return (await apiClient.patch(`/categories/${editing.id}`, payload)).data;
      return (await apiClient.post("/categories", payload)).data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); toast.success(editing ? "Category updated" : "Category created"); onClose(); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const parentOptions = categories.filter((c) => c.id !== editing?.id);

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electronics" autoFocus /></div>
          <div className="space-y-1.5">
            <Label>Parent category</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger><SelectValue placeholder="None (top level)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (top level)</SelectItem>
                {parentOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim() || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : editing ? "Save changes" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const { user } = useAuth();
  const isManager = user?.role === "MANAGER";
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [deleting, setDeleting] = useState<ProductCategory | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category deleted"); setDeleting(null); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Product Categories" description="Organize products by category and sub-category." actions={isManager ? <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-3.5 mr-1.5" /> New Category</Button> : undefined} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Parent</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Products</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Sub-categories</TableHead>
                {isManager && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>}
              {!isLoading && categories.length === 0 && <TableRow><TableCell colSpan={5}><div className="flex flex-col items-center gap-2 py-10 text-center"><FolderTree className="size-9 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No categories yet</p></div></TableCell></TableRow>}
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium"><div className="flex items-center gap-1.5">{cat.parentId && <ChevronRight className="size-3.5 text-muted-foreground/50" />}{cat.name}</div></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{cat.parent?.name ?? <span className="italic text-muted-foreground/50">Top level</span>}</TableCell>
                  <TableCell><Badge variant="secondary">{cat._count?.products ?? 0}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{cat._count?.children ?? 0}</Badge></TableCell>
                  {isManager && <TableCell><div className="flex items-center gap-1 justify-end"><Button size="icon" variant="ghost" className="size-7" onClick={() => { setEditing(cat); setFormOpen(true); }}><Pencil className="size-3.5" /></Button><Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => setDeleting(cat)}><Trash2 className="size-3.5" /></Button></div></TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {formOpen && <CategoryFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} editing={editing} categories={categories} />}
      <AlertDialog open={!!deleting} onOpenChange={(v: boolean) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the category.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => deleting && deleteMutation.mutate(deleting.id)}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
