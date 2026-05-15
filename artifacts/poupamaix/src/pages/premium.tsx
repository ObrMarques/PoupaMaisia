import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Shield, PieChart, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Premium() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Redirecting to secure checkout",
      description: "Stripe integration would open here.",
    });
  };

  if (user?.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold">You are a Premium Member</h1>
          <p className="text-muted-foreground">Thank you for supporting PoupaMais. Enjoy all your exclusive features.</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Sparkles, title: "PoupaAI Advisor", desc: "Unlimited chat with your personal AI financial advisor." },
    { icon: PieChart, title: "Smart Reports", desc: "Deep analytics and custom reporting for your spending." },
    { icon: Shield, title: "Cloud Backup", desc: "Real-time sync and backup of all your financial data." },
    { icon: FileText, title: "PDF Export", desc: "Export beautiful monthly statements for your records." },
  ];

  return (
    <div className="py-12 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
          <Sparkles className="w-3 h-3 mr-2" /> PoupaMais Premium
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Take full control of your wealth.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock the ultimate financial toolkit and reach your goals faster.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="text-2xl font-bold mb-2">Monthly Plan</h3>
            <p className="text-muted-foreground mb-6">Cancel anytime.</p>
            
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold tracking-tighter">R$ 9,90</span>
              <span className="text-muted-foreground font-medium">/mês</span>
            </div>

            <ul className="space-y-4 mb-8">
              {['7-day free trial', 'All premium features', 'Priority support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00C851]" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" className="w-full h-14 text-lg font-bold" onClick={handleUpgrade}>
              Start 7-Day Free Trial
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              You won't be charged until the trial ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
