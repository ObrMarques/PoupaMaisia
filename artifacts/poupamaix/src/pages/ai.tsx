import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Lock, ArrowRight } from "lucide-react";
import { useChatWithAI, useGetAIConversations } from "@workspace/api-client-react";

export default function AI() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi there! I am PoupaAI, your personal financial advisor. How can I help you optimize your finances today?' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatWithAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  if (!user?.isPremium) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-background/50">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Meet PoupaAI</h1>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          Your personal financial advisor that analyzes your spending, identifies saving opportunities, and answers complex financial questions in seconds.
        </p>
        
        <Card className="max-w-md w-full bg-card border-border/50 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
          <CardContent className="p-6 space-y-4 opacity-50">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary shrink-0" />
              <div className="bg-secondary rounded-2xl rounded-tl-sm p-3 text-sm flex-1">
                How much can I save if I cut my dining out by 20%?
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-primary shrink-0" />
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 text-sm flex-1">
                Based on your last 3 months, cutting dining by 20% would save you R$ 450/month. If invested, that's R$ 5,400 in a year!
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
            <Lock className="w-8 h-8 mb-4 text-foreground" />
            <Link href="/premium">
              <Button size="lg" className="font-bold">
                Unlock PoupaAI
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");

    chatMutation.mutate(
      { data: { message: userMsg } },
      {
        onSuccess: (res) => {
          setMessages(prev => [...prev, { role: 'assistant', content: res.message }]);
        },
        onError: () => {
          setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
        }
      }
    );
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto border-x border-border/50 bg-background">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold">PoupaAI</h2>
          <p className="text-xs text-primary">Online • Premium Advisor</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-secondary' : 'bg-primary text-primary-foreground'
            }`}>
              {msg.role === 'user' ? user?.name?.charAt(0) : <Sparkles className="w-4 h-4" />}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-secondary text-foreground rounded-tr-sm' 
                : 'bg-card border border-border rounded-tl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border rounded-tl-sm flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background border-t border-border mt-auto">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
          {["Analyze my spending", "How to save more?", "Credit card advice"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full border border-border bg-card text-xs hover:bg-secondary transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2 relative"
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your finances..." 
            className="bg-card border-border pr-12 rounded-full h-12"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1 top-1 h-10 w-10 rounded-full"
            disabled={!input.trim() || chatMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
