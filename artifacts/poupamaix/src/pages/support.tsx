import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Search, ExternalLink, HelpCircle, BookOpen, Zap } from "lucide-react";

const FAQS = [
  {
    q: "Como adicionar uma transação?",
    a: "Vá para a tela de Transações e clique em 'Nova'. Preencha o tipo (receita ou despesa), valor, descrição, data e categoria. Clique em 'Salvar' para concluir."
  },
  {
    q: "Como criar uma meta financeira?",
    a: "Acesse 'Metas Financeiras' no menu lateral e clique em 'Nova Meta'. Defina o nome, valor alvo e tipo de meta. Você pode adicionar contribuições a qualquer momento."
  },
  {
    q: "O que é o PoupaAI?",
    a: "O PoupaAI é seu consultor financeiro pessoal alimentado por inteligência artificial. Disponível exclusivamente para assinantes Premium, ele analisa seus gastos, identifica oportunidades de economia e responde perguntas financeiras em tempo real."
  },
  {
    q: "Como cadastrar um cartão de crédito?",
    a: "Vá para 'Cartões' e clique em 'Adicionar Cartão'. Informe o nome, os 4 últimos dígitos, bandeira, limite, dia de fechamento e vencimento. Suas faturas serão monitoradas automaticamente."
  },
  {
    q: "Como funciona o plano Premium?",
    a: "O Premium inclui acesso ilimitado ao PoupaAI, relatórios avançados, backup em nuvem e exportação de extratos em PDF. Custa R$ 9,90/mês com 7 dias grátis. Cancele quando quiser."
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Todos os dados são criptografados em trânsito e em repouso. Nunca compartilhamos suas informações financeiras com terceiros."
  },
  {
    q: "Como alterar minha senha?",
    a: "Acesse 'Configurações' no menu e vá até a seção de Perfil. Você pode atualizar seu e-mail e senha diretamente por lá."
  },
  {
    q: "Por que as categorias não aparecem?",
    a: "Verifique sua conexão com a internet. Se o problema persistir, saia e entre novamente na sua conta. As categorias são carregadas automaticamente após o login."
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-primary transition-colors"
      >
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1">
          {a}
        </p>
      )}
    </div>
  );
}

export default function Support() {
  const [search, setSearch] = useState("");

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Central de Ajuda</h1>
        <p className="text-muted-foreground">Como podemos ajudar você hoje?</p>
      </div>

      {/* Canais de Contato */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="https://wa.me/5511999999999?text=Olá,%20preciso%20de%20ajuda%20com%20o%20PoupaMais"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card className="bg-card border-border hover:border-[#00C851]/50 hover:bg-[#00C851]/5 transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#00C851]/10 flex items-center justify-center group-hover:bg-[#00C851]/20 transition-colors">
                <Phone className="w-6 h-6 text-[#00C851]" />
              </div>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Resposta em minutos</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#00C851] font-medium">
                <span>Abrir conversa</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="mailto:suporte@poupamaix.com.br?subject=Suporte%20PoupaMais">
          <Card className="bg-card border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">E-mail</p>
                <p className="text-sm text-muted-foreground">Resposta em até 24h</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                <span>Enviar e-mail</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        </a>

        <Card className="bg-card border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group h-full">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Chat ao Vivo</p>
              <p className="text-sm text-muted-foreground">Seg–Sex, 9h às 18h</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <Zap className="w-3 h-3" />
              <span>Iniciar chat</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guias Rápidos */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Guias Rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: "💸", title: "Como registrar gastos", desc: "Aprenda a categorizar despesas corretamente" },
            { icon: "🎯", title: "Criando metas inteligentes", desc: "Configure metas realistas e acompanhe o progresso" },
            { icon: "💳", title: "Gerenciando cartões", desc: "Controle faturas e limites com facilidade" },
            { icon: "📊", title: "Lendo seus relatórios", desc: "Entenda gráficos e indicadores financeiros" },
          ].map((guide, i) => (
            <Card key={i} className="bg-card border-border hover:border-border/80 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0">
                  {guide.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{guide.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{guide.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Perguntas Frequentes
          </h2>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nas perguntas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma pergunta encontrada para "{search}"</p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA Final */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Não encontrou o que procurava?</p>
            <p className="text-sm text-muted-foreground">Nossa equipe está pronta para ajudar você.</p>
          </div>
          <div className="flex gap-3">
            <a href="mailto:suporte@poupamaix.com.br">
              <Button variant="outline" className="bg-background">
                <Mail className="w-4 h-4 mr-2" /> Enviar E-mail
              </Button>
            </a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              <Button>
                <Phone className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
