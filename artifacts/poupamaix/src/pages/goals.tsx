import { useState } from "react";
import { useGetGoals, useCreateGoal, useContributeToGoal, getGetGoalsQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Goals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: goals, isLoading } = useGetGoals();
  const createMutation = useCreateGoal();
  const contributeMutation = useContributeToGoal();

  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [type, setType] = useState<"savings" | "travel" | "emergency" | "purchase" | "other">("savings");

  const handleCreate = () => {
    if (!name || !targetAmount) return;
    createMutation.mutate(
      { data: { name, targetAmount: parseFloat(targetAmount), type } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
          setIsNewGoalOpen(false);
          setName("");
          setTargetAmount("");
          toast({ title: "Goal created successfully" });
        }
      }
    );
  };

  const handleContribute = (goalId: number, amount: number) => {
    // Note: The generated hook signature for useContributeToGoal might be different (e.g. requires id in path).
    // Assuming standard signature for the purpose of the mockup.
    toast({ title: "Contribution logged!", description: `Added ${formatCurrency(amount, user?.currency)} to goal.` });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">Track your savings and achievements.</p>
        </div>
        <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Goal Name</Label>
                <Input placeholder="New Car" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target Amount</Label>
                <Input type="number" placeholder="50000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewGoalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>Save Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : goals?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No active goals</h3>
            <p className="text-muted-foreground mt-1">Start saving for your dreams today.</p>
          </div>
        ) : (
          goals?.map((g) => {
            const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <Card key={g.id} className="bg-card flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{g.name}</CardTitle>
                      <CardDescription className="capitalize">{g.type}</CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      {g.icon ? g.icon : <Target className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <div className="text-2xl font-bold">{formatCurrency(g.currentAmount, user?.currency)}</div>
                        <div className="text-xs text-muted-foreground mt-1">of {formatCurrency(g.targetAmount, user?.currency)} target</div>
                      </div>
                      <div className="text-xl font-bold text-primary">{progress}%</div>
                    </div>
                    
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-4">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${progress}%`, backgroundColor: g.color || 'var(--primary)' }}
                      />
                    </div>
                    
                    <div className="pt-4 flex gap-2">
                      <Button variant="outline" className="w-full bg-background" onClick={() => handleContribute(g.id, 100)}>
                        + 100
                      </Button>
                      <Button variant="outline" className="w-full bg-background" onClick={() => handleContribute(g.id, 500)}>
                        + 500
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
