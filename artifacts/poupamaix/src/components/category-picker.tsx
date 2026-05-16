import { useState, useMemo } from "react";
import { useGetCategories, useCreateCategory, getGetCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Check, ChevronRight } from "lucide-react";
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
  const { data: categories, isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const queryClient = useQueryClient();

  const filtered = useMemo(() => {
    const cats = (categories ?? []).filter(c =>
      c.type === "both" || c.type === type
    );
    if (!search.trim()) return cats;
    return cats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, type, search]);

  const handleSelect = (cat: typeof filtered[0]) => {
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
          queryClient.invalidateQueries({ queryKey: getGetCategoriesQueryKey() });
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

  const handleClose = () => {
    onOpenChange(false);
    setSearch("");
    setShowCustomInput(false);
    setCustomName("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
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
              {filtered.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                    value === cat.id.toString()
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  <span className="font-medium">{cat.name}</span>
                  {value === cat.id.toString() && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
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
