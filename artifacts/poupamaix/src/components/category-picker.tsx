import { useState, useMemo } from "react";
import {
  useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  getGetCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent aria-describedby={undefined} className="sm:max-w-[400px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
          <DialogTitle className="text-base">Selecionar Categoria</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-3 shrink-0 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-0 h-9 text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 && search ? (
            <div className="px-4 py-6 text-center">
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
            <div className="px-2">
              {filtered.map(cat => {
                const isCustom = !cat.isDefault;
                const isEditing = editingId === cat.id;
                const isDeleting = deletingId === cat.id;
                const isSelected = value === cat.id.toString();

                if (isDeleting) {
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30"
                    >
                      <p className="text-sm text-foreground flex-1 mr-2 truncate">
                        Excluir <span className="font-medium">"{cat.name}"</span>?
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleCancelDelete(e)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={(e) => handleConfirmDelete(e, cat.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs text-white bg-destructive hover:bg-destructive/90 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? "..." : "Excluir"}
                        </button>
                      </div>
                    </div>
                  );
                }

                if (isEditing) {
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary"
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
                        className="w-7 h-7 rounded flex items-center justify-center bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-40 shrink-0"
                      >
                        {updateMutation.isPending ? (
                          <div className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-foreground"
                    )}
                  >
                    <button
                      className="flex-1 text-left font-medium truncate"
                      onClick={() => handleSelect(cat)}
                    >
                      {cat.name}
                    </button>
                    <div className="flex items-center gap-0.5 shrink-0 ml-2">
                      {isSelected && !isCustom && (
                        <Check className="w-4 h-4" />
                      )}
                      {isCustom && (
                        <>
                          <button
                            onClick={(e) => handleStartEdit(e, cat)}
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center transition-colors",
                              isSelected
                                ? "hover:bg-primary-foreground/20 text-primary-foreground"
                                : "hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                            )}
                            title="Editar categoria"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleStartDelete(e, cat.id)}
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center transition-colors",
                              isSelected
                                ? "hover:bg-primary-foreground/20 text-primary-foreground"
                                : "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            )}
                            title="Excluir categoria"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          {isSelected && (
                            <Check className="w-4 h-4 ml-0.5" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-border shrink-0">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Categoria personalizada
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">Nova categoria</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Freelance, Presente..."
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="bg-secondary border-0 h-9 text-sm flex-1"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleCreateCustom()}
                />
                <Button
                  size="sm"
                  className="h-9 shrink-0"
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
