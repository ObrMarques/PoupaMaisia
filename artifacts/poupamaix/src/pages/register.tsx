import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegister, useCompleteOnboarding } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const onboardingMutation = useCompleteOnboarding();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    registerMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.user, data.token);
          onboardingMutation.mutate(
            { data: { currency: "BRL", initialGoalName: undefined, initialGoalAmount: 0, favoriteCategories: [] } },
            {
              onSettled: () => {
                setLocation("/dashboard");
              },
            }
          );
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Falha no cadastro",
            description: "Ocorreu um erro durante o cadastro. Tente novamente.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl mx-auto mb-4">
            $
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Criar conta</h1>
          <p className="text-muted-foreground mt-2">Comece sua jornada com o PoupaMais</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} className="bg-card" data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="voce@exemplo.com" {...field} className="bg-card" data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-card" data-testid="input-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending || onboardingMutation.isPending}
              data-testid="button-register"
            >
              {registerMutation.isPending || onboardingMutation.isPending ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login">
            <span className="text-primary hover:underline cursor-pointer">Entrar</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
