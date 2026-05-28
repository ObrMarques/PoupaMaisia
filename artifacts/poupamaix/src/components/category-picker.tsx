import { useState, useMemo } from "react";
import {
  useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  getGetCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Check, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";


interface CategoryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSelect: (categoryId: string, categoryName: string) => void;
  type: "income" | "expense" | "both";
}

export function CategoryPicker({ open, onOpenChange, value, onSelect, type }: CategoryPickerProps) {
  const [search, setSearch] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: categories, isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCategoriesQueryKey() });

  const filtered = useMemo(() => {
    const cats = (categories ?? []).filter(c =>
      c.type === "both" || c.type === type
    );
    if (!search.trim()) return cats;
    return cats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, type, search]);

  const handleSelect = (cat: typeof filtered[0]) => {
    if (editingId !== null || deletingId !== null) return;
    onSelect(cat.id.toString(), cat.name);
    onOpenChange(false);
    setSearch("");
    setShowCustomInput(false);
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) return;
    createMutation.mutate(
      { data: { name: customName.trim(), icon: "", color: "#6C5CE7", type } },
      {
        onSuccess: (newCat) => {
          invalidate();
          onSelect(newCat.id.toString(), newCat.name);
          onOpenChange(false);
          setCustomName("");
          setShowCustomInput(false);
          setSearch("");
        },
        onError: () => {}
      }
    );
  };

  const handleStartEdit = (e: React.MouseEvent, cat: typeof filtered[0]) => {
    e.stopPropagation();
    setDeletingId(null);
    setEditingId(cat.id);
    setEditingName(cat.name ?? "");
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingName.trim() || editingId === null) return;
    updateMutation.mutate(
      { id: editingId, data: { name: editingName.trim() } },
      {
        onSuccess: () => {
          invalidate();
          setEditingId(null);
          setEditingName("");
        },
        onError: () => {}
      }
    );
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName("");
  };

  const handleStartDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setEditingId(null);
    setDeletingId(id);
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          setDeletingId(null);
        },
        onError: () => { setDeletingId(null); }
      }
    );
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearch("");
    setShowCustomInput(false);
    setCustomName("");
    setEditingId(null);
    setDeletingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          "p-0 gap-0 border-0 shadow-2xl overflow-hidden",
          "w-[calc(100%-32px)] max-w-[420px]",
          "rounded-2xl sm:rounded-2xl",
          "flex flex-col",
          "max-h-[88dvh]",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 shrink-0">
          <DialogTitle className="text-base font-semibold tracking-tight mb-3">
            Selecionar Categoria
          </DialogTitle>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-0 h-10 text-sm rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
        </div>

        {/* ── Category grid ──────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-4 pb-2 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 && search ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada.</p>
              <Button
                variant="link"
                size="sm"
                className="text-primary mt-1"
                onClick={() => { setCustomName(search); setShowCustomInput(true); }}
              >
                Criar "{search}" como categoria personalizada
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 pb-2">
              {filtered.map(cat => {
                const isCustom = !cat.isDefault;
                const isEditing = editingId === cat.id;
                const isDeleting = deletingId === cat.id;
                const isSelected = value === cat.id.toString();

                /* ── Delete confirm ── */
                if (isDeleting) {
                  return (
                    <div
                      key={cat.id}
                      className="col-span-3 flex items-center justify-between px-4 py-3 rounded-2xl bg-destructive/8 border border-destructive/25"
                    >
                      <p className="text-sm text-foreground flex-1 mr-3 truncate">
                        Excluir <span className="font-semibold">"{cat.name}"</span>?
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => handleCancelDelete(e)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={(e) => handleConfirmDelete(e, cat.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs text-white bg-destructive hover:bg-destructive/90 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                        >
                          {deleteMutation.isPending ? "..." : "Excluir"}
                        </button>
                      </div>
                    </div>
                  );
                }

                /* ── Edit inline ── */
                if (isEditing) {
                  return (
                    <div
                      key={cat.id}
                      className="col-span-3 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary"
                      onClick={e => e.stopPropagation()}
                    >
                      <Input
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleSaveEdit(e as any);
                          if (e.key === "Escape") handleCancelEdit(e as any);
                        }}
                        className="h-8 text-sm bg-background border-input flex-1"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editingName.trim() || updateMutation.isPending}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-40 shrink-0"
                      >
                        {updateMutation.isPending ? (
                          <div className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                /* ── Category card ── */
                return (
                  <div key={cat.id} className="relative group">
                    <button
                      onClick={() => handleSelect(cat)}
                      className={cn(
                        "w-full flex flex-col items-center gap-2 pt-3.5 pb-3 px-2 rounded-2xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 border-2",
                        isSelected
                          ? "bg-secondary shadow-sm scale-[1.02]"
                          : "border-transparent bg-secondary/60 hover:bg-secondary hover:scale-[1.01] hover:shadow-sm active:scale-[0.98]"
                      )}
                      style={isSelected ? { borderColor: cat.color ?? "#6C5CE7" } : {}}
                    >
                      {/* Color circle / icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform"
                        style={{
                          backgroundColor: `${cat.color ?? "#6C5CE7"}22`,
                          border: `2px solid ${cat.color ?? "#6C5CE7"}`,
                        }}
                      >
                        {cat.icon
                          ? <span className="text-base leading-none">{cat.icon}</span>
                          : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color ?? "#6C5CE7" }} />
                        }
                      </div>

                      {/* Name */}
                      <span
                        className={cn(
                          "text-xs font-medium leading-tight text-center line-clamp-2 w-full px-0.5",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {cat.name}
                      </span>
                    </button>

                    {/* Selected check badge */}
                    {isSelected && (
                      <div
                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: cat.color ?? "#6C5CE7" }}
                      >
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Custom category edit/delete — appear on hover */}
                    {isCustom && !isSelected && (
                      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={(e) => handleStartEdit(e, cat)}
                          className="w-5 h-5 rounded-md flex items-center justify-center bg-background/90 backdrop-blur-sm text-muted-foreground hover:text-foreground shadow-sm transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => handleStartDelete(e, cat.id)}
                          className="w-5 h-5 rounded-md flex items-center justify-center bg-background/90 backdrop-blur-sm text-muted-foreground hover:text-destructive shadow-sm transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer: custom category ─────────────────────── */}
        <div className="px-4 pb-4 pt-2 border-t border-border shrink-0">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150 border border-dashed border-border hover:border-foreground/20"
            >
              <Plus className="w-4 h-4" />
              Categoria personalizada
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">
                Nova categoria
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Freelance, Presente..."
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="bg-secondary border-0 h-10 text-sm flex-1 rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleCreateCustom()}
                />
                <Button
                  size="sm"
                  className="h-10 px-3 rounded-xl shrink-0"
                  onClick={handleCreateCustom}
                  disabled={!customName.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <button
                onClick={() => { setShowCustomInput(false); setCustomName(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
