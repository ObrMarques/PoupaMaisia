export type Language = "pt-BR" | "en" | "es" | "fr";

export const LANGUAGE_LABELS: Record<Language, string> = {
  "pt-BR": "Português (Brasil)",
  "en":    "English",
  "es":    "Español",
  "fr":    "Français",
};

export const LANGUAGE_LOCALES: Record<Language, string> = {
  "pt-BR": "pt-BR",
  "en":    "en-US",
  "es":    "es-ES",
  "fr":    "fr-FR",
};

type TranslationMap = {
  nav: {
    dashboard: string; transactions: string; goals: string; wallets: string;
    reports: string; ai: string; premium: string; support: string; settings: string;
  };
  common: {
    save: string; cancel: string; delete: string; edit: string; add: string;
    loading: string; search: string; close: string; confirm: string; back: string;
    error: string; success: string; or: string; saving: string; optional: string;
  };
  auth: {
    login: string; register: string; logout: string; email: string; password: string;
    name: string; welcome: string;
  };
  settings: {
    title: string; profile: string; preferences: string; theme: string; language: string;
    darkMode: string; lightMode: string; currency: string; saveProfile: string;
    savePreferences: string; changePhoto: string; uploadPhoto: string;
    avatarInvalidType: string; avatarTooLarge: string; avatarUploadError: string;
    danger: string; deleteAccount: string; photoUpdated: string;
    profileUpdated: string; preferencesUpdated: string;
    appearance: string; notifications: string; legal: string; account: string;
    tapChangePhoto: string; fullName: string; notEditable: string;
    saved: string; saveError: string;
    darkModeOn: string; darkModeOff: string;
    pushNotif: string; pushNotifDesc: string;
    emailPromo: string; emailPromoDesc: string;
    termsTitle: string; termsDescShort: string;
    privacyTitle: string; privacyDescShort: string;
    cookiesTitle: string; cookiesDescShort: string;
    signOut: string; version: string;
    deleteConfirmSure: string; deleteConfirmMsg: string; deleteConfirmBtn: string;
  };
  support: {
    title: string; subtitle: string; whatsapp: string; email: string; chat: string;
    chatTitle: string; chatOnline: string; chatOffline: string; chatPlaceholder: string;
    chatSend: string; faqTitle: string; guides: string; notFound: string; sendEmail: string;
    typing: string;
    responseMinutes: string; openConversation: string;
    responseHours: string; sendEmailLink: string;
    onlineNow: string; chatTab: string;
    noFaqFound: string; teamReady: string; searchFaqs: string;
    faqAll: string; faqLogin: string; faqTransactions: string; faqCategories: string;
    faqGoals: string; faqAI: string; faqPremium: string;
    botGreeting: string; botFallback: string;
    qr1: string; qr2: string; qr3: string; qr4: string; qr5: string;
    faq1q: string; faq1a: string; faq2q: string; faq2a: string;
    faq3q: string; faq3a: string; faq4q: string; faq4a: string;
    faq5q: string; faq5a: string; faq6q: string; faq6a: string;
    faq7q: string; faq7a: string; faq8q: string; faq8a: string;
  };
  premium: {
    title: string; subtitle: string;
    alreadyPremium: string; whatsIncluded: string;
    highlight: string; thanksPremium: string;
    aiTitle: string; aiDesc: string;
    alertsTitle: string; alertsDesc: string;
    walletsTitle: string; walletsDesc: string;
    goalsTitle: string; goalsDesc: string;
    featuresTitle: string; featuresDesc: string;
    manageSubscription: string;
  };
  forgotPassword: {
    title: string; subtitle: string;
    sentTitle: string; sentDesc: string;
    backToLogin: string; sendBtn: string;
    errNotFound: string; errTooMany: string; errGeneric: string; sendError: string;
  };
  resetPassword: {
    title: string; subtitle: string;
    successTitle: string; successDesc: string;
    newPassLabel: string; minChars: string;
    confirmLabel: string; repeatPass: string;
    submitBtn: string;
    errShort: string; errMismatch: string; errExpired: string; errGeneric: string;
  };
  dashboard: {
    title: string; balance: string; income: string; expenses: string; savings: string;
    transactions: string; recentTransactions: string; spendingByCategory: string;
    monthlyTrend: string; noData: string;
    controlTitle: string; greeting: string; newTransaction: string; askAI: string;
    monthlyIncome: string; monthlyExpenses: string; billsToPay: string;
    pendingBill: string; pendingBills: string; noPending: string;
    cashFlow: string; cashFlowDesc: string; goalsProgress: string; viewAll: string; noGoals: string;
    wallets: string; walletsTotal: string; noWallets: string;
  };
  transactions: {
    title: string; subtitle: string; newTransaction: string; editTransaction: string;
    filterAll: string; filterAllDesc: string;
    filterPending: string; filterPendingDesc: string;
    filterIncome: string; filterIncomeDesc: string;
    filterExpense: string; filterExpenseDesc: string;
    filterBtn: string; showing: string; clearFilter: string;
    expense: string; income: string;
    amount: string; description: string; date: string;
    category: string; wallet: string; notes: string;
    pendingBadge: string; selectCategory: string;
    noWalletWarning: string; selectWallet: string; walletRequired: string;
    notesPlaceholder: string; descPlaceholder: string;
    saving: string; noPendingMsg: string; noTransactions: string; addTransaction: string;
    overdue: string; today: string; tomorrow: string; dUnit: string;
    paid: string; payBtn: string;
  };
  wallets: {
    title: string; subtitle: string; newWallet: string; editWallet: string;
    name: string; namePlaceholder: string;
    initialBalance: string; initialBalanceDesc: string;
    icon: string; color: string; previewPlaceholder: string;
    totalBalance: string; loading: string;
    noWallets: string; createFirst: string;
    deleteTitle: string; deleteDesc: string; deleting: string;
  };
  goals: {
    title: string; subtitle: string; newGoal: string; createGoal: string; editGoal: string;
    goalName: string; goalNameCustom: string;
    targetAmount: string; currentAmount: string; optional: string;
    deadline: string; goalColor: string;
    confirmDelete: string; yesDelete: string; no: string;
    contributeTitle: string; howMuch: string; confirm: string;
    noGoals: string; noGoalsDesc: string; createFirst: string;
    of: string; completed: string; goalReached: string; addValue: string; remaining: string;
    typeSavings: string; typeTravel: string; typeEmergency: string;
    typePurchase: string; typeOther: string;
    saving: string;
  };
  reports: {
    title: string; subtitle: string;
    spendingByCategory: string; spendingDesc: string; noData: string; transactionCount: string;
    cashFlow: string; cashFlowDesc: string; income: string; expenses: string;
    netSavings: string; netSavingsDesc: string; savings: string;
  };
  ai: {
    newConversation: string; noConversations: string; typing: string; online: string;
    newChat: string; placeholder: string;
    premiumBadge: string; premiumTitle: string; premiumDesc: string; seePremium: string;
    greeting: string; greetingDesc: string;
    s1label: string; s2label: string; s3label: string; s4label: string; s5label: string; s6label: string;
    s1msg: string; s2msg: string; s3msg: string; s4msg: string; s5msg: string; s6msg: string;
    userLabel: string;
    errorSession: string; errorConnect: string; errorTimeout: string; errorNetwork: string;
    noResponse: string; incomeLabel: string; expenseLabel: string; registered: string;
  };
  signIn: {
    title: string; subtitle: string; forgotPassword: string;
    noAccount: string; createAccount: string; continueGoogle: string; or: string; signInBtn: string;
  };
  signUp: {
    title: string; verifyTitle: string; subtitle: string; verifySubtitle: string;
    fullName: string; fullNamePh: string; passwordPh: string;
    createBtn: string; creating: string;
    alreadyHaveAccount: string; signInLink: string; or: string; continueGoogle: string;
    verifyBtn: string; verifying: string; back: string; resend: string; resendIn: string;
    enterAllDigits: string;
  };
};

const ptBR: TranslationMap = {
  nav: {
    dashboard: "Painel", transactions: "Transações", goals: "Metas", wallets: "Carteiras",
    reports: "Relatórios", ai: "PoupaAI", premium: "Premium", support: "Suporte", settings: "Configurações",
  },
  common: {
    save: "Salvar", cancel: "Cancelar", delete: "Excluir", edit: "Editar", add: "Adicionar",
    loading: "Carregando...", search: "Buscar", close: "Fechar", confirm: "Confirmar",
    back: "Voltar", error: "Erro", success: "Sucesso", or: "ou",
    saving: "Salvando...", optional: "opcional",
  },
  auth: {
    login: "Entrar", register: "Cadastrar", logout: "Sair", email: "E-mail",
    password: "Senha", name: "Nome", welcome: "Bem-vindo de volta",
  },
  settings: {
    title: "Configurações", profile: "Perfil", preferences: "Preferências",
    theme: "Tema", language: "Idioma", darkMode: "Modo Escuro", lightMode: "Modo Claro",
    currency: "Moeda principal", saveProfile: "Salvar Alterações",
    savePreferences: "Salvar Preferências", changePhoto: "Alterar Foto", uploadPhoto: "Enviar Foto",
    danger: "Zona de Perigo", deleteAccount: "Excluir Conta",
    avatarInvalidType: "Selecione uma imagem válida (JPG, PNG, WebP)",
    avatarTooLarge: "A imagem deve ter no máximo 10 MB",
    avatarUploadError: "Erro ao enviar foto. Tente novamente.",
    photoUpdated: "Foto atualizada com sucesso", profileUpdated: "Perfil atualizado com sucesso",
    preferencesUpdated: "Preferências salvas",
    appearance: "Aparência", notifications: "Notificações", legal: "Legal", account: "Conta",
    tapChangePhoto: "Toque para alterar a foto", fullName: "Nome", notEditable: "não editável",
    saved: "Salvo!", saveError: "Erro ao salvar. Tente novamente.",
    darkModeOn: "Fundo escuro, textos claros", darkModeOff: "Fundo claro, textos escuros",
    pushNotif: "Notificações push", pushNotifDesc: "Alertas e atualizações",
    emailPromo: "E-mails promocionais", emailPromoDesc: "Novidades e ofertas",
    termsTitle: "Termos de uso", termsDescShort: "Regras e condições do serviço",
    privacyTitle: "Política de privacidade", privacyDescShort: "Como seus dados são usados",
    cookiesTitle: "Política de cookies", cookiesDescShort: "Preferências de rastreamento",
    signOut: "Sair da conta", version: "Versão 1.0.0 · © 2026 PoupaMais",
    deleteConfirmSure: "Tem certeza?",
    deleteConfirmMsg: "Todos os seus dados — transações, carteiras, metas e histórico — serão permanentemente excluídos. Essa ação não pode ser desfeita.",
    deleteConfirmBtn: "Excluir conta",
  },
  support: {
    title: "Central de Ajuda", subtitle: "Como podemos ajudar você hoje?",
    whatsapp: "WhatsApp", email: "E-mail", chat: "Chat ao Vivo",
    chatTitle: "Suporte PoupaMais", chatOnline: "Online", chatOffline: "Offline",
    chatPlaceholder: "Digite sua mensagem...", chatSend: "Enviar",
    faqTitle: "Perguntas Frequentes", guides: "Guias Rápidos",
    notFound: "Não encontrou o que procurava?", sendEmail: "Enviar E-mail", typing: "Digitando...",
    responseMinutes: "Resposta em minutos", openConversation: "Abrir conversa",
    responseHours: "Resposta em até 24h", sendEmailLink: "Enviar e-mail",
    onlineNow: "Online agora", chatTab: "Chat de Suporte",
    noFaqFound: "Nenhuma pergunta encontrada.", teamReady: "Nossa equipe está pronta para ajudar você.",
    searchFaqs: "Pesquisar nas perguntas...",
    faqAll: "Todos", faqLogin: "Conta & Login", faqTransactions: "Transações",
    faqCategories: "Categorias", faqGoals: "Metas", faqAI: "PoupaAI", faqPremium: "Premium",
    botGreeting: "Olá! Sou o assistente virtual do PoupaMais. Estou aqui para ajudar com qualquer dúvida sobre o app. O que posso fazer por você?",
    botFallback: "Entendido! Para dúvidas mais específicas ou problemas técnicos, nossa equipe está disponível pelo WhatsApp ou e-mail. Como mais posso ajudar?",
    qr1: "Como adicionar transação?", qr2: "Criar meta financeira",
    qr3: "O que é o PoupaAI?", qr4: "Como usar categorias?", qr5: "Problemas com login",
    faq1q: "Como recuperar minha senha?", faq1a: "Na tela de login, clique em 'Esqueci a senha'. Você receberá um e-mail com instruções para criar uma nova senha.",
    faq2q: "Como adicionar uma transação?", faq2a: "Vá para Transações e clique em 'Nova'. Preencha tipo, valor, descrição, data e categoria. Clique em Salvar.",
    faq3q: "Posso criar categorias personalizadas?", faq3a: "Sim! No formulário de nova transação, clique em 'Selecionar Categoria' e depois em 'Categoria personalizada' no rodapé.",
    faq4q: "Como criar uma meta financeira?", faq4a: "Acesse Metas e clique em 'Nova Meta'. Defina o nome, valor alvo e tipo. Você pode adicionar contribuições a qualquer momento.",
    faq5q: "O que é o PoupaAI?", faq5a: "O PoupaAI é seu consultor financeiro com IA. Analisa seus gastos, sugere economias e responde perguntas financeiras.",
    faq6q: "Como funciona o Premium?", faq6a: "O Premium inclui PoupaAI ilimitado, relatórios avançados e exportação de extratos. R$ 9,90/mês com 7 dias grátis.",
    faq7q: "Meus dados estão seguros?", faq7a: "Sim. Todos os dados são criptografados em trânsito e em repouso. Nunca compartilhamos suas informações.",
    faq8q: "Por que as categorias não aparecem?", faq8a: "Verifique sua conexão. Se persistir, saia e entre novamente. As categorias carregam automaticamente após o login.",
  },
  premium: {
    title: "Poupa Mais Premium",
    subtitle: "Desbloqueie recursos avançados para controlar melhor sua vida financeira.",
    alreadyPremium: "Você já é Premium", whatsIncluded: "O que está incluído",
    highlight: "Destaque", thanksPremium: "Obrigado por ser Premium!",
    aiTitle: "PoupaAI — Assistente Financeira",
    aiDesc: "Assistente inteligente com IA que analisa seus dados reais e dá conselhos financeiros personalizados em tempo real.",
    alertsTitle: "Alertas Inteligentes",
    alertsDesc: "Receba avisos automáticos quando estiver gastando acima do esperado em alguma categoria.",
    walletsTitle: "Carteiras Ilimitadas",
    walletsDesc: "Crie quantas carteiras precisar — corrente, poupança, investimentos, dinheiro físico e muito mais.",
    goalsTitle: "Metas Ilimitadas",
    goalsDesc: "Organize metas financeiras ilimitadas com barras de progresso, prazos e contribuições personalizadas.",
    featuresTitle: "Recursos Premium",
    featuresDesc: "Acesso antecipado a novas funcionalidades e relatórios avançados antes de todos.",
    manageSubscription: "Gerenciar assinatura",
  },
  forgotPassword: {
    title: "Recuperar senha", subtitle: "Digite seu e-mail e enviaremos um link para criar uma nova senha.",
    sentTitle: "E-mail enviado!", sentDesc: "Verifique sua caixa de entrada e clique no link para redefinir sua senha.",
    backToLogin: "Voltar para o login", sendBtn: "Enviar link de recuperação",
    errNotFound: "Nenhuma conta encontrada com esse e-mail.",
    errTooMany: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    errGeneric: "Erro ao enviar o e-mail. Verifique o endereço e tente novamente.",
    sendError: "Erro ao enviar o e-mail. Tente novamente.",
  },
  resetPassword: {
    title: "Nova senha", subtitle: "Crie uma nova senha para sua conta.",
    successTitle: "Senha redefinida!", successDesc: "Sua senha foi alterada com sucesso. Redirecionando…",
    newPassLabel: "Nova senha", minChars: "Mínimo 6 caracteres",
    confirmLabel: "Confirmar senha", repeatPass: "Repita a nova senha",
    submitBtn: "Redefinir senha",
    errShort: "A senha deve ter pelo menos 6 caracteres.",
    errMismatch: "As senhas não coincidem.",
    errExpired: "O link de recuperação expirou. Solicite um novo.",
    errGeneric: "Erro ao redefinir a senha. Tente novamente.",
  },
  dashboard: {
    title: "Painel Financeiro", balance: "Saldo Total", income: "Receitas", expenses: "Despesas",
    savings: "Poupança", transactions: "Transações", recentTransactions: "Últimas Transações",
    spendingByCategory: "Gastos por Categoria", monthlyTrend: "Tendência Mensal", noData: "Sem dados",
    controlTitle: "Controle financeiro", greeting: "Olá", newTransaction: "Nova Transação",
    askAI: "Perguntar ao PoupaAI", monthlyIncome: "Receitas do Mês", monthlyExpenses: "Despesas do Mês",
    billsToPay: "Contas a Pagar", pendingBill: "conta pendente", pendingBills: "contas pendentes",
    noPending: "Nenhuma pendência", cashFlow: "Fluxo de Caixa",
    cashFlowDesc: "Receitas x Despesas ao longo do tempo", goalsProgress: "Progresso das Metas",
    viewAll: "Ver todas", noGoals: "Nenhuma meta ativa.",
    wallets: "Minhas Carteiras", walletsTotal: "Saldo total em carteiras",
    noWallets: "Nenhuma carteira criada.",
  },
  transactions: {
    title: "Transações", subtitle: "Gerencie suas receitas e despesas.",
    newTransaction: "Nova Transação", editTransaction: "Editar Transação",
    filterAll: "Todas", filterAllDesc: "Todas as transações",
    filterPending: "Pendentes", filterPendingDesc: "Contas a pagar / data futura",
    filterIncome: "Receitas", filterIncomeDesc: "Entradas de dinheiro",
    filterExpense: "Despesas", filterExpenseDesc: "Gastos concluídos",
    filterBtn: "Filtrar", showing: "Mostrando:", clearFilter: "Limpar filtro",
    expense: "Despesa", income: "Receita",
    amount: "Valor", description: "Descrição", date: "Data",
    category: "Categoria", wallet: "Carteira", notes: "Observações",
    pendingBadge: "pendente", selectCategory: "Selecionar...",
    noWalletWarning: "Crie uma carteira antes de adicionar transações.",
    selectWallet: "Selecionar carteira...", walletRequired: "Selecione uma carteira para continuar.",
    notesPlaceholder: "Notas adicionais...", descPlaceholder: "Ex: Supermercado Extra",
    saving: "Salvando...", noPendingMsg: "Nenhuma conta a pagar.",
    noTransactions: "Nenhuma transação encontrada.", addTransaction: "Adicionar transação",
    overdue: "atrasado", today: "hoje", tomorrow: "amanhã", dUnit: "d",
    paid: "pago", payBtn: "Pagar",
  },
  wallets: {
    title: "Carteiras", subtitle: "Gerencie suas contas e fontes de dinheiro.",
    newWallet: "Nova Carteira", editWallet: "Editar Carteira",
    name: "Nome", namePlaceholder: "Ex: Conta Corrente, Poupança...",
    initialBalance: "Saldo inicial",
    initialBalanceDesc: "Valor que você já possui nessa conta antes de registrar transações.",
    icon: "Ícone", color: "Cor", previewPlaceholder: "Nome da carteira",
    totalBalance: "Saldo total em carteiras", loading: "Carregando...",
    noWallets: "Nenhuma carteira criada ainda.", createFirst: "Criar primeira carteira",
    deleteTitle: "Excluir carteira?",
    deleteDesc: "As transações vinculadas a esta carteira não serão excluídas, apenas desvinculadas.",
    deleting: "Excluindo...",
  },
  goals: {
    title: "Metas Financeiras", subtitle: "Acompanhe suas economias e conquistas.",
    newGoal: "Nova Meta", createGoal: "Criar Meta", editGoal: "Editar Meta",
    goalName: "Nome da meta", goalNameCustom: "Qual é o seu objetivo?",
    targetAmount: "Valor alvo", currentAmount: "Valor atual", optional: "opcional",
    deadline: "Prazo", goalColor: "COR DA META",
    confirmDelete: "Confirmar exclusão?", yesDelete: "Sim, excluir", no: "Não",
    contributeTitle: "Adicionar Contribuição", howMuch: "Quanto deseja adicionar?",
    confirm: "Confirmar", noGoals: "Nenhuma meta ativa",
    noGoalsDesc: "Comece a poupar para seus sonhos hoje.", createFirst: "Criar Primeira Meta",
    of: "de", completed: "concluído", goalReached: "Meta atingida!", addValue: "Adicionar Valor",
    remaining: "Faltam",
    typeSavings: "Poupança", typeTravel: "Viagem", typeEmergency: "Emergência",
    typePurchase: "Compra", typeOther: "Personalizada",
    saving: "Salvando...",
  },
  reports: {
    title: "Relatórios", subtitle: "Analise seus hábitos financeiros em profundidade.",
    spendingByCategory: "Gastos por Categoria", spendingDesc: "Para onde foi seu dinheiro este mês",
    noData: "Sem dados para este período", transactionCount: "transações",
    cashFlow: "Fluxo de Caixa", cashFlowDesc: "Receitas e despesas ao longo do tempo",
    income: "Receitas", expenses: "Despesas",
    netSavings: "Economia Líquida", netSavingsDesc: "Valor economizado por mês", savings: "Economia",
  },
  ai: {
    newConversation: "Nova conversa", noConversations: "Suas conversas aparecerão aqui",
    typing: "Digitando…", online: "Assistente Financeiro · Online",
    newChat: "Novo chat", placeholder: "Pergunte sobre suas finanças…",
    premiumBadge: "Disponível no Premium", premiumTitle: "PoupaAI exclusivo",
    premiumDesc: "Seu assistente financeiro inteligente. Analisa seus dados reais e responde em tempo real — disponível apenas no plano Premium.",
    seePremium: "Ver plano Premium",
    greeting: "Sou o PoupaAI",
    greetingDesc: "Seu assistente financeiro pessoal. Analiso seus dados reais para oferecer insights e recomendações personalizadas.",
    s1label: "Analisar meus gastos", s1msg: "Analise meus gastos do mês e me dê um diagnóstico financeiro.",
    s2label: "Como economizar mais?", s2msg: "Com base nos meus dados, como posso economizar mais dinheiro?",
    s3label: "Alertas financeiros", s3msg: "Identifique alertas financeiros nos meus dados e riscos que devo atentar.",
    s4label: "Progresso das minhas metas", s4msg: "Como estão minhas metas financeiras? Estou no caminho certo?",
    s5label: "Resumo do mês", s5msg: "Faça um resumo completo das minhas finanças deste mês.",
    s6label: "Dicas de investimento", s6msg: "Com meu perfil financeiro atual, quais investimentos você recomenda?",
    userLabel: "Eu",
    errorSession: "Sessão expirada. Por favor, faça login novamente.",
    errorConnect: "Erro ao conectar com a PoupaAI. Tente novamente.",
    errorTimeout: "Tempo esgotado. A PoupaAI demorou muito para responder. Tente novamente.",
    errorNetwork: "Erro de conexão. Verifique sua internet e tente novamente.",
    noResponse: "Não consegui gerar uma resposta.",
    incomeLabel: "Receita", expenseLabel: "Despesa", registered: "registrada",
  },
  signIn: {
    title: "Bem-vindo de volta", subtitle: "Entre com sua conta para continuar",
    forgotPassword: "Esqueci minha senha", noAccount: "Não tem conta?",
    createAccount: "Criar conta", continueGoogle: "Continuar com Google", or: "ou", signInBtn: "Entrar",
  },
  signUp: {
    title: "Criar sua conta", verifyTitle: "Verificar e-mail",
    subtitle: "Comece sua jornada com o PoupaMais", verifySubtitle: "Insira o código enviado para",
    fullName: "Nome completo", fullNamePh: "Seu nome", passwordPh: "Mínimo 6 caracteres",
    createBtn: "Criar conta", creating: "Criando conta…",
    alreadyHaveAccount: "Já tem conta?", signInLink: "Entrar", or: "ou",
    continueGoogle: "Continuar com Google",
    verifyBtn: "Confirmar código", verifying: "Verificando…",
    back: "← Voltar", resend: "Reenviar código", resendIn: "Reenviar em",
    enterAllDigits: "Digite todos os 6 dígitos do código.",
  },
};

const en: TranslationMap = {
  nav: {
    dashboard: "Dashboard", transactions: "Transactions", goals: "Goals", wallets: "Wallets",
    reports: "Reports", ai: "PoupaAI", premium: "Premium", support: "Support", settings: "Settings",
  },
  common: {
    save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add",
    loading: "Loading...", search: "Search", close: "Close", confirm: "Confirm",
    back: "Back", error: "Error", success: "Success", or: "or",
    saving: "Saving...", optional: "optional",
  },
  auth: {
    login: "Sign In", register: "Sign Up", logout: "Sign Out", email: "Email",
    password: "Password", name: "Name", welcome: "Welcome back",
  },
  settings: {
    title: "Settings", profile: "Profile", preferences: "Preferences",
    theme: "Theme", language: "Language", darkMode: "Dark Mode", lightMode: "Light Mode",
    currency: "Primary Currency", saveProfile: "Save Changes",
    savePreferences: "Save Preferences", changePhoto: "Change Photo", uploadPhoto: "Upload Photo",
    avatarInvalidType: "Select a valid image (JPG, PNG, WebP)",
    avatarTooLarge: "Image must be at most 10 MB",
    avatarUploadError: "Failed to upload photo. Please try again.",
    danger: "Danger Zone", deleteAccount: "Delete Account",
    photoUpdated: "Photo updated successfully", profileUpdated: "Profile updated successfully",
    preferencesUpdated: "Preferences saved",
    appearance: "Appearance", notifications: "Notifications", legal: "Legal", account: "Account",
    tapChangePhoto: "Tap to change photo", fullName: "Full name", notEditable: "not editable",
    saved: "Saved!", saveError: "Error saving. Please try again.",
    darkModeOn: "Dark background, light text", darkModeOff: "Light background, dark text",
    pushNotif: "Push notifications", pushNotifDesc: "Alerts and updates",
    emailPromo: "Promotional emails", emailPromoDesc: "News and offers",
    termsTitle: "Terms of use", termsDescShort: "Rules and conditions of service",
    privacyTitle: "Privacy policy", privacyDescShort: "How your data is used",
    cookiesTitle: "Cookie policy", cookiesDescShort: "Tracking preferences",
    signOut: "Sign out", version: "Version 1.0.0 · © 2026 PoupaMais",
    deleteConfirmSure: "Are you sure?",
    deleteConfirmMsg: "All your data — transactions, wallets, goals and history — will be permanently deleted. This action cannot be undone.",
    deleteConfirmBtn: "Delete account",
  },
  support: {
    title: "Help Center", subtitle: "How can we help you today?",
    whatsapp: "WhatsApp", email: "Email", chat: "Live Chat",
    chatTitle: "PoupaMais Support", chatOnline: "Online", chatOffline: "Offline",
    chatPlaceholder: "Type your message...", chatSend: "Send",
    faqTitle: "Frequently Asked Questions", guides: "Quick Guides",
    notFound: "Didn't find what you were looking for?", sendEmail: "Send Email", typing: "Typing...",
    responseMinutes: "Response in minutes", openConversation: "Open conversation",
    responseHours: "Response within 24h", sendEmailLink: "Send email",
    onlineNow: "Online now", chatTab: "Support Chat",
    noFaqFound: "No questions found.", teamReady: "Our team is ready to help you.",
    searchFaqs: "Search questions...",
    faqAll: "All", faqLogin: "Account & Login", faqTransactions: "Transactions",
    faqCategories: "Categories", faqGoals: "Goals", faqAI: "PoupaAI", faqPremium: "Premium",
    botGreeting: "Hi! I'm the PoupaMais virtual assistant. I'm here to help with any questions about the app. What can I do for you?",
    botFallback: "Understood! For more specific questions or technical issues, our team is available via WhatsApp or email. How else can I help?",
    qr1: "How to add a transaction?", qr2: "Create a financial goal",
    qr3: "What is PoupaAI?", qr4: "How to use categories?", qr5: "Login issues",
    faq1q: "How do I recover my password?", faq1a: "On the login screen, click 'Forgot password'. You will receive an email with instructions to create a new password.",
    faq2q: "How do I add a transaction?", faq2a: "Go to Transactions and click 'New'. Fill in type, amount, description, date and category. Click Save.",
    faq3q: "Can I create custom categories?", faq3a: "Yes! In the new transaction form, click 'Select Category' and then 'Custom category' at the bottom.",
    faq4q: "How do I create a financial goal?", faq4a: "Go to Goals and click 'New Goal'. Set the name, target amount and type. You can add contributions at any time.",
    faq5q: "What is PoupaAI?", faq5a: "PoupaAI is your AI-powered financial advisor. It analyzes your spending, suggests savings and answers financial questions.",
    faq6q: "How does Premium work?", faq6a: "Premium includes unlimited PoupaAI, advanced reports and statement export. R$ 9.90/month with a 7-day free trial.",
    faq7q: "Is my data secure?", faq7a: "Yes. All data is encrypted in transit and at rest. We never share your information.",
    faq8q: "Why aren't categories showing?", faq8a: "Check your connection. If it persists, sign out and back in. Categories load automatically after login.",
  },
  premium: {
    title: "PoupaMais Premium",
    subtitle: "Unlock advanced features to better manage your financial life.",
    alreadyPremium: "You are already Premium", whatsIncluded: "What's included",
    highlight: "Featured", thanksPremium: "Thank you for being Premium!",
    aiTitle: "PoupaAI — Financial Assistant",
    aiDesc: "AI-powered smart assistant that analyzes your real data and gives personalized financial advice in real time.",
    alertsTitle: "Smart Alerts",
    alertsDesc: "Receive automatic warnings when you are spending above expectations in any category.",
    walletsTitle: "Unlimited Wallets",
    walletsDesc: "Create as many wallets as you need — checking, savings, investments, cash and more.",
    goalsTitle: "Unlimited Goals",
    goalsDesc: "Organize unlimited financial goals with progress bars, deadlines and personalized contributions.",
    featuresTitle: "Premium Features",
    featuresDesc: "Early access to new features and advanced reports before everyone else.",
    manageSubscription: "Manage subscription",
  },
  forgotPassword: {
    title: "Recover password", subtitle: "Enter your email and we'll send you a link to create a new password.",
    sentTitle: "Email sent!", sentDesc: "Check your inbox and click the link to reset your password.",
    backToLogin: "Back to login", sendBtn: "Send recovery link",
    errNotFound: "No account found with that email.",
    errTooMany: "Too many attempts. Please wait a few minutes and try again.",
    errGeneric: "Error sending email. Please check the address and try again.",
    sendError: "Error sending email. Please try again.",
  },
  resetPassword: {
    title: "New password", subtitle: "Create a new password for your account.",
    successTitle: "Password reset!", successDesc: "Your password has been changed successfully. Redirecting…",
    newPassLabel: "New password", minChars: "Minimum 6 characters",
    confirmLabel: "Confirm password", repeatPass: "Repeat the new password",
    submitBtn: "Reset password",
    errShort: "Password must be at least 6 characters.",
    errMismatch: "Passwords do not match.",
    errExpired: "The recovery link has expired. Request a new one.",
    errGeneric: "Error resetting password. Please try again.",
  },
  dashboard: {
    title: "Financial Dashboard", balance: "Total Balance", income: "Income", expenses: "Expenses",
    savings: "Savings", transactions: "Transactions", recentTransactions: "Recent Transactions",
    spendingByCategory: "Spending by Category", monthlyTrend: "Monthly Trend", noData: "No data",
    controlTitle: "Financial Overview", greeting: "Hello", newTransaction: "New Transaction",
    askAI: "Ask PoupaAI", monthlyIncome: "Monthly Income", monthlyExpenses: "Monthly Expenses",
    billsToPay: "Bills to Pay", pendingBill: "pending bill", pendingBills: "pending bills",
    noPending: "No pending bills", cashFlow: "Cash Flow",
    cashFlowDesc: "Income vs Expenses over time", goalsProgress: "Goals Progress",
    viewAll: "View all", noGoals: "No active goals.",
    wallets: "My Wallets", walletsTotal: "Total wallet balance",
    noWallets: "No wallets created.",
  },
  transactions: {
    title: "Transactions", subtitle: "Manage your income and expenses.",
    newTransaction: "New Transaction", editTransaction: "Edit Transaction",
    filterAll: "All", filterAllDesc: "All transactions",
    filterPending: "Pending", filterPendingDesc: "Bills / future date",
    filterIncome: "Income", filterIncomeDesc: "Money received",
    filterExpense: "Expenses", filterExpenseDesc: "Completed expenses",
    filterBtn: "Filter", showing: "Showing:", clearFilter: "Clear filter",
    expense: "Expense", income: "Income",
    amount: "Amount", description: "Description", date: "Date",
    category: "Category", wallet: "Wallet", notes: "Notes",
    pendingBadge: "pending", selectCategory: "Select...",
    noWalletWarning: "Create a wallet before adding transactions.",
    selectWallet: "Select wallet...", walletRequired: "Please select a wallet to continue.",
    notesPlaceholder: "Additional notes...", descPlaceholder: "e.g. Grocery store",
    saving: "Saving...", noPendingMsg: "No pending bills.",
    noTransactions: "No transactions found.", addTransaction: "Add transaction",
    overdue: "overdue", today: "today", tomorrow: "tomorrow", dUnit: "d",
    paid: "paid", payBtn: "Pay",
  },
  wallets: {
    title: "Wallets", subtitle: "Manage your accounts and money sources.",
    newWallet: "New Wallet", editWallet: "Edit Wallet",
    name: "Name", namePlaceholder: "e.g. Checking Account, Savings...",
    initialBalance: "Initial balance",
    initialBalanceDesc: "Amount you already have in this account before recording transactions.",
    icon: "Icon", color: "Color", previewPlaceholder: "Wallet name",
    totalBalance: "Total wallet balance", loading: "Loading...",
    noWallets: "No wallets created yet.", createFirst: "Create first wallet",
    deleteTitle: "Delete wallet?",
    deleteDesc: "Transactions linked to this wallet will not be deleted, only unlinked.",
    deleting: "Deleting...",
  },
  goals: {
    title: "Financial Goals", subtitle: "Track your savings and achievements.",
    newGoal: "New Goal", createGoal: "Create Goal", editGoal: "Edit Goal",
    goalName: "Goal name", goalNameCustom: "What is your goal?",
    targetAmount: "Target amount", currentAmount: "Current amount", optional: "optional",
    deadline: "Deadline", goalColor: "GOAL COLOR",
    confirmDelete: "Confirm deletion?", yesDelete: "Yes, delete", no: "No",
    contributeTitle: "Add Contribution", howMuch: "How much do you want to add?",
    confirm: "Confirm", noGoals: "No active goals",
    noGoalsDesc: "Start saving for your dreams today.", createFirst: "Create First Goal",
    of: "of", completed: "completed", goalReached: "Goal reached!", addValue: "Add Amount",
    remaining: "Remaining",
    typeSavings: "Savings", typeTravel: "Travel", typeEmergency: "Emergency",
    typePurchase: "Purchase", typeOther: "Custom",
    saving: "Saving...",
  },
  reports: {
    title: "Reports", subtitle: "Analyze your financial habits in depth.",
    spendingByCategory: "Spending by Category", spendingDesc: "Where your money went this month",
    noData: "No data for this period", transactionCount: "transactions",
    cashFlow: "Cash Flow", cashFlowDesc: "Income and expenses over time",
    income: "Income", expenses: "Expenses",
    netSavings: "Net Savings", netSavingsDesc: "Amount saved per month", savings: "Savings",
  },
  ai: {
    newConversation: "New conversation", noConversations: "Your conversations will appear here",
    typing: "Typing…", online: "Financial Assistant · Online",
    newChat: "New chat", placeholder: "Ask about your finances…",
    premiumBadge: "Available on Premium", premiumTitle: "Exclusive PoupaAI",
    premiumDesc: "Your smart financial assistant. Analyzes your real data and responds in real time — available on the Premium plan only.",
    seePremium: "See Premium plan",
    greeting: "I'm PoupaAI",
    greetingDesc: "Your personal financial assistant. I analyze your real data to provide personalized insights and recommendations.",
    s1label: "Analyze my expenses", s1msg: "Analyze my monthly expenses and give me a financial diagnosis.",
    s2label: "How to save more?", s2msg: "Based on my data, how can I save more money?",
    s3label: "Financial alerts", s3msg: "Identify financial alerts in my data and risks I should watch out for.",
    s4label: "My goals progress", s4msg: "How are my financial goals going? Am I on the right track?",
    s5label: "Monthly summary", s5msg: "Give me a complete summary of my finances this month.",
    s6label: "Investment tips", s6msg: "With my current financial profile, what investments do you recommend?",
    userLabel: "Me",
    errorSession: "Session expired. Please log in again.",
    errorConnect: "Error connecting to PoupaAI. Please try again.",
    errorTimeout: "Timed out. PoupaAI took too long to respond. Please try again.",
    errorNetwork: "Connection error. Check your internet and try again.",
    noResponse: "Could not generate a response.",
    incomeLabel: "Income", expenseLabel: "Expense", registered: "recorded",
  },
  signIn: {
    title: "Welcome back", subtitle: "Sign in to your account to continue",
    forgotPassword: "Forgot my password", noAccount: "Don't have an account?",
    createAccount: "Create account", continueGoogle: "Continue with Google", or: "or", signInBtn: "Sign In",
  },
  signUp: {
    title: "Create your account", verifyTitle: "Verify email",
    subtitle: "Start your journey with PoupaMais", verifySubtitle: "Enter the code sent to",
    fullName: "Full name", fullNamePh: "Your name", passwordPh: "Minimum 6 characters",
    createBtn: "Create account", creating: "Creating account…",
    alreadyHaveAccount: "Already have an account?", signInLink: "Sign in", or: "or",
    continueGoogle: "Continue with Google",
    verifyBtn: "Confirm code", verifying: "Verifying…",
    back: "← Back", resend: "Resend code", resendIn: "Resend in",
    enterAllDigits: "Enter all 6 digits of the code.",
  },
};

const es: TranslationMap = {
  nav: {
    dashboard: "Panel", transactions: "Transacciones", goals: "Metas", wallets: "Carteras",
    reports: "Informes", ai: "PoupaAI", premium: "Premium", support: "Soporte", settings: "Configuración",
  },
  common: {
    save: "Guardar", cancel: "Cancelar", delete: "Eliminar", edit: "Editar", add: "Agregar",
    loading: "Cargando...", search: "Buscar", close: "Cerrar", confirm: "Confirmar",
    back: "Volver", error: "Error", success: "Éxito", or: "o",
    saving: "Guardando...", optional: "opcional",
  },
  auth: {
    login: "Iniciar sesión", register: "Registrarse", logout: "Salir", email: "Correo",
    password: "Contraseña", name: "Nombre", welcome: "Bienvenido de nuevo",
  },
  settings: {
    title: "Configuración", profile: "Perfil", preferences: "Preferencias",
    theme: "Tema", language: "Idioma", darkMode: "Modo Oscuro", lightMode: "Modo Claro",
    currency: "Moneda principal", saveProfile: "Guardar cambios",
    savePreferences: "Guardar preferencias", changePhoto: "Cambiar foto", uploadPhoto: "Subir foto",
    danger: "Zona de peligro", deleteAccount: "Eliminar cuenta",
    avatarInvalidType: "Selecciona una imagen válida (JPG, PNG, WebP)",
    avatarTooLarge: "La imagen debe tener como máximo 10 MB",
    avatarUploadError: "Error al subir la foto. Inténtalo de nuevo.",
    photoUpdated: "Foto actualizada", profileUpdated: "Perfil actualizado",
    preferencesUpdated: "Preferencias guardadas",
    appearance: "Apariencia", notifications: "Notificaciones", legal: "Legal", account: "Cuenta",
    tapChangePhoto: "Toca para cambiar la foto", fullName: "Nombre completo", notEditable: "no editable",
    saved: "¡Guardado!", saveError: "Error al guardar. Inténtalo de nuevo.",
    darkModeOn: "Fondo oscuro, texto claro", darkModeOff: "Fondo claro, texto oscuro",
    pushNotif: "Notificaciones push", pushNotifDesc: "Alertas y actualizaciones",
    emailPromo: "Correos promocionales", emailPromoDesc: "Novedades y ofertas",
    termsTitle: "Términos de uso", termsDescShort: "Reglas y condiciones del servicio",
    privacyTitle: "Política de privacidad", privacyDescShort: "Cómo se usan tus datos",
    cookiesTitle: "Política de cookies", cookiesDescShort: "Preferencias de rastreo",
    signOut: "Cerrar sesión", version: "Versión 1.0.0 · © 2026 PoupaMais",
    deleteConfirmSure: "¿Estás seguro?",
    deleteConfirmMsg: "Todos tus datos — transacciones, carteras, metas e historial — serán eliminados permanentemente. Esta acción no se puede deshacer.",
    deleteConfirmBtn: "Eliminar cuenta",
  },
  support: {
    title: "Centro de ayuda", subtitle: "¿Cómo podemos ayudarte hoy?",
    whatsapp: "WhatsApp", email: "Correo", chat: "Chat en vivo",
    chatTitle: "Soporte PoupaMais", chatOnline: "En línea", chatOffline: "Sin conexión",
    chatPlaceholder: "Escribe tu mensaje...", chatSend: "Enviar",
    faqTitle: "Preguntas frecuentes", guides: "Guías rápidas",
    notFound: "¿No encontraste lo que buscabas?", sendEmail: "Enviar correo", typing: "Escribiendo...",
    responseMinutes: "Respuesta en minutos", openConversation: "Abrir conversación",
    responseHours: "Respuesta en hasta 24h", sendEmailLink: "Enviar correo",
    onlineNow: "En línea ahora", chatTab: "Chat de soporte",
    noFaqFound: "No se encontraron preguntas.", teamReady: "Nuestro equipo está listo para ayudarte.",
    searchFaqs: "Buscar en las preguntas...",
    faqAll: "Todos", faqLogin: "Cuenta y login", faqTransactions: "Transacciones",
    faqCategories: "Categorías", faqGoals: "Metas", faqAI: "PoupaAI", faqPremium: "Premium",
    botGreeting: "¡Hola! Soy el asistente virtual de PoupaMais. Estoy aquí para ayudarte con cualquier pregunta sobre la app. ¿Qué puedo hacer por ti?",
    botFallback: "¡Entendido! Para preguntas más específicas o problemas técnicos, nuestro equipo está disponible por WhatsApp o correo. ¿En qué más puedo ayudar?",
    qr1: "¿Cómo agregar una transacción?", qr2: "Crear una meta financiera",
    qr3: "¿Qué es PoupaAI?", qr4: "¿Cómo usar categorías?", qr5: "Problemas con el login",
    faq1q: "¿Cómo recupero mi contraseña?", faq1a: "En la pantalla de login, haz clic en 'Olvidé mi contraseña'. Recibirás un correo con instrucciones para crear una nueva.",
    faq2q: "¿Cómo agrego una transacción?", faq2a: "Ve a Transacciones y haz clic en 'Nueva'. Completa tipo, monto, descripción, fecha y categoría. Haz clic en Guardar.",
    faq3q: "¿Puedo crear categorías personalizadas?", faq3a: "¡Sí! En el formulario de nueva transacción, haz clic en 'Seleccionar Categoría' y luego en 'Categoría personalizada'.",
    faq4q: "¿Cómo creo una meta financiera?", faq4a: "Ve a Metas y haz clic en 'Nueva Meta'. Define el nombre, monto objetivo y tipo. Puedes agregar contribuciones en cualquier momento.",
    faq5q: "¿Qué es PoupaAI?", faq5a: "PoupaAI es tu asesor financiero con IA. Analiza tus gastos, sugiere ahorros y responde preguntas financieras.",
    faq6q: "¿Cómo funciona el Premium?", faq6a: "El Premium incluye PoupaAI ilimitado, informes avanzados y exportación de extractos. R$ 9,90/mes con 7 días gratis.",
    faq7q: "¿Mis datos están seguros?", faq7a: "Sí. Todos los datos están cifrados en tránsito y en reposo. Nunca compartimos tu información.",
    faq8q: "¿Por qué no aparecen las categorías?", faq8a: "Verifica tu conexión. Si persiste, cierra sesión y vuelve a entrar. Las categorías se cargan automáticamente tras el login.",
  },
  premium: {
    title: "PoupaMais Premium",
    subtitle: "Desbloquea funciones avanzadas para controlar mejor tu vida financiera.",
    alreadyPremium: "Ya eres Premium", whatsIncluded: "Qué está incluido",
    highlight: "Destacado", thanksPremium: "¡Gracias por ser Premium!",
    aiTitle: "PoupaAI — Asistente Financiero",
    aiDesc: "Asistente inteligente con IA que analiza tus datos reales y da consejos financieros personalizados en tiempo real.",
    alertsTitle: "Alertas inteligentes",
    alertsDesc: "Recibe avisos automáticos cuando estés gastando por encima de lo esperado en alguna categoría.",
    walletsTitle: "Carteras ilimitadas",
    walletsDesc: "Crea tantas carteras como necesites — corriente, ahorros, inversiones, efectivo y mucho más.",
    goalsTitle: "Metas ilimitadas",
    goalsDesc: "Organiza metas financieras ilimitadas con barras de progreso, plazos y contribuciones personalizadas.",
    featuresTitle: "Funciones Premium",
    featuresDesc: "Acceso anticipado a nuevas funcionalidades e informes avanzados antes que nadie.",
    manageSubscription: "Gestionar suscripción",
  },
  forgotPassword: {
    title: "Recuperar contraseña", subtitle: "Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.",
    sentTitle: "¡Correo enviado!", sentDesc: "Revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.",
    backToLogin: "Volver al login", sendBtn: "Enviar enlace de recuperación",
    errNotFound: "No se encontró ninguna cuenta con ese correo.",
    errTooMany: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
    errGeneric: "Error al enviar el correo. Verifica la dirección e inténtalo de nuevo.",
    sendError: "Error al enviar el correo. Inténtalo de nuevo.",
  },
  resetPassword: {
    title: "Nueva contraseña", subtitle: "Crea una nueva contraseña para tu cuenta.",
    successTitle: "¡Contraseña restablecida!", successDesc: "Tu contraseña fue cambiada con éxito. Redirigiendo…",
    newPassLabel: "Nueva contraseña", minChars: "Mínimo 6 caracteres",
    confirmLabel: "Confirmar contraseña", repeatPass: "Repite la nueva contraseña",
    submitBtn: "Restablecer contraseña",
    errShort: "La contraseña debe tener al menos 6 caracteres.",
    errMismatch: "Las contraseñas no coinciden.",
    errExpired: "El enlace de recuperación expiró. Solicita uno nuevo.",
    errGeneric: "Error al restablecer la contraseña. Inténtalo de nuevo.",
  },
  dashboard: {
    title: "Panel financiero", balance: "Saldo total", income: "Ingresos", expenses: "Gastos",
    savings: "Ahorros", transactions: "Transacciones", recentTransactions: "Transacciones recientes",
    spendingByCategory: "Gastos por categoría", monthlyTrend: "Tendencia mensual", noData: "Sin datos",
    controlTitle: "Control financiero", greeting: "Hola", newTransaction: "Nueva Transacción",
    askAI: "Preguntar a PoupaAI", monthlyIncome: "Ingresos del mes", monthlyExpenses: "Gastos del mes",
    billsToPay: "Cuentas por pagar", pendingBill: "cuenta pendiente", pendingBills: "cuentas pendientes",
    noPending: "Sin pendientes", cashFlow: "Flujo de caja",
    cashFlowDesc: "Ingresos vs Gastos a lo largo del tiempo", goalsProgress: "Progreso de metas",
    viewAll: "Ver todas", noGoals: "Sin metas activas.",
    wallets: "Mis Carteras", walletsTotal: "Saldo total en carteras",
    noWallets: "Ninguna cartera creada.",
  },
  transactions: {
    title: "Transacciones", subtitle: "Gestiona tus ingresos y gastos.",
    newTransaction: "Nueva Transacción", editTransaction: "Editar Transacción",
    filterAll: "Todas", filterAllDesc: "Todas las transacciones",
    filterPending: "Pendientes", filterPendingDesc: "Cuentas / fecha futura",
    filterIncome: "Ingresos", filterIncomeDesc: "Dinero recibido",
    filterExpense: "Gastos", filterExpenseDesc: "Gastos completados",
    filterBtn: "Filtrar", showing: "Mostrando:", clearFilter: "Limpiar filtro",
    expense: "Gasto", income: "Ingreso",
    amount: "Monto", description: "Descripción", date: "Fecha",
    category: "Categoría", wallet: "Cartera", notes: "Notas",
    pendingBadge: "pendiente", selectCategory: "Seleccionar...",
    noWalletWarning: "Crea una cartera antes de agregar transacciones.",
    selectWallet: "Seleccionar cartera...", walletRequired: "Selecciona una cartera para continuar.",
    notesPlaceholder: "Notas adicionales...", descPlaceholder: "Ej: Supermercado",
    saving: "Guardando...", noPendingMsg: "Sin cuentas pendientes.",
    noTransactions: "No se encontraron transacciones.", addTransaction: "Agregar transacción",
    overdue: "vencida", today: "hoy", tomorrow: "mañana", dUnit: "d",
    paid: "pagado", payBtn: "Pagar",
  },
  wallets: {
    title: "Carteras", subtitle: "Gestiona tus cuentas y fuentes de dinero.",
    newWallet: "Nueva Cartera", editWallet: "Editar Cartera",
    name: "Nombre", namePlaceholder: "Ej: Cuenta corriente, Ahorros...",
    initialBalance: "Saldo inicial",
    initialBalanceDesc: "Cantidad que ya tienes en esta cuenta antes de registrar transacciones.",
    icon: "Ícono", color: "Color", previewPlaceholder: "Nombre de la cartera",
    totalBalance: "Saldo total en carteras", loading: "Cargando...",
    noWallets: "Aún no hay carteras.", createFirst: "Crear primera cartera",
    deleteTitle: "¿Eliminar cartera?",
    deleteDesc: "Las transacciones vinculadas no serán eliminadas, solo desvinculadas.",
    deleting: "Eliminando...",
  },
  goals: {
    title: "Metas Financieras", subtitle: "Sigue tus ahorros y logros.",
    newGoal: "Nueva Meta", createGoal: "Crear Meta", editGoal: "Editar Meta",
    goalName: "Nombre de la meta", goalNameCustom: "¿Cuál es tu objetivo?",
    targetAmount: "Monto objetivo", currentAmount: "Monto actual", optional: "opcional",
    deadline: "Plazo", goalColor: "COLOR DE META",
    confirmDelete: "¿Confirmar eliminación?", yesDelete: "Sí, eliminar", no: "No",
    contributeTitle: "Agregar Contribución", howMuch: "¿Cuánto deseas agregar?",
    confirm: "Confirmar", noGoals: "Sin metas activas",
    noGoalsDesc: "Empieza a ahorrar para tus sueños hoy.", createFirst: "Crear Primera Meta",
    of: "de", completed: "completado", goalReached: "¡Meta alcanzada!", addValue: "Agregar Monto",
    remaining: "Faltan",
    typeSavings: "Ahorros", typeTravel: "Viaje", typeEmergency: "Emergencia",
    typePurchase: "Compra", typeOther: "Personalizada",
    saving: "Guardando...",
  },
  reports: {
    title: "Informes", subtitle: "Analiza tus hábitos financieros en profundidad.",
    spendingByCategory: "Gastos por categoría", spendingDesc: "A dónde fue tu dinero este mes",
    noData: "Sin datos para este período", transactionCount: "transacciones",
    cashFlow: "Flujo de caja", cashFlowDesc: "Ingresos y gastos a lo largo del tiempo",
    income: "Ingresos", expenses: "Gastos",
    netSavings: "Ahorro Neto", netSavingsDesc: "Monto ahorrado por mes", savings: "Ahorro",
  },
  ai: {
    newConversation: "Nueva conversación", noConversations: "Tus conversaciones aparecerán aquí",
    typing: "Escribiendo…", online: "Asistente Financiero · En línea",
    newChat: "Nuevo chat", placeholder: "Pregunta sobre tus finanzas…",
    premiumBadge: "Disponible en Premium", premiumTitle: "PoupaAI exclusivo",
    premiumDesc: "Tu asistente financiero inteligente. Analiza tus datos reales y responde en tiempo real — solo disponible en el plan Premium.",
    seePremium: "Ver plan Premium",
    greeting: "Soy PoupaAI",
    greetingDesc: "Tu asistente financiero personal. Analizo tus datos reales para ofrecerte insights y recomendaciones personalizadas.",
    s1label: "Analizar mis gastos", s1msg: "Analiza mis gastos del mes y dame un diagnóstico financiero.",
    s2label: "¿Cómo ahorrar más?", s2msg: "Con base en mis datos, ¿cómo puedo ahorrar más dinero?",
    s3label: "Alertas financieras", s3msg: "Identifica alertas financieras en mis datos y riesgos que debo atender.",
    s4label: "Progreso de mis metas", s4msg: "¿Cómo están mis metas financieras? ¿Estoy en el buen camino?",
    s5label: "Resumen del mes", s5msg: "Dame un resumen completo de mis finanzas de este mes.",
    s6label: "Consejos de inversión", s6msg: "Con mi perfil financiero actual, ¿qué inversiones recomiendas?",
    userLabel: "Yo",
    errorSession: "Sesión expirada. Por favor inicia sesión de nuevo.",
    errorConnect: "Error al conectar con PoupaAI. Inténtalo de nuevo.",
    errorTimeout: "Tiempo agotado. PoupaAI tardó demasiado en responder. Inténtalo de nuevo.",
    errorNetwork: "Error de conexión. Verifica tu internet e inténtalo de nuevo.",
    noResponse: "No pude generar una respuesta.",
    incomeLabel: "Ingreso", expenseLabel: "Gasto", registered: "registrado",
  },
  signIn: {
    title: "Bienvenido de nuevo", subtitle: "Inicia sesión en tu cuenta para continuar",
    forgotPassword: "Olvidé mi contraseña", noAccount: "¿No tienes cuenta?",
    createAccount: "Crear cuenta", continueGoogle: "Continuar con Google", or: "o", signInBtn: "Iniciar sesión",
  },
  signUp: {
    title: "Crear tu cuenta", verifyTitle: "Verificar correo",
    subtitle: "Comienza tu camino con PoupaMais", verifySubtitle: "Ingresa el código enviado a",
    fullName: "Nombre completo", fullNamePh: "Tu nombre", passwordPh: "Mínimo 6 caracteres",
    createBtn: "Crear cuenta", creating: "Creando cuenta…",
    alreadyHaveAccount: "¿Ya tienes cuenta?", signInLink: "Iniciar sesión", or: "o",
    continueGoogle: "Continuar con Google",
    verifyBtn: "Confirmar código", verifying: "Verificando…",
    back: "← Volver", resend: "Reenviar código", resendIn: "Reenviar en",
    enterAllDigits: "Ingresa todos los 6 dígitos del código.",
  },
};

const fr: TranslationMap = {
  nav: {
    dashboard: "Tableau de bord", transactions: "Transactions", goals: "Objectifs", wallets: "Portefeuilles",
    reports: "Rapports", ai: "PoupaAI", premium: "Premium", support: "Support", settings: "Paramètres",
  },
  common: {
    save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", edit: "Modifier", add: "Ajouter",
    loading: "Chargement...", search: "Rechercher", close: "Fermer", confirm: "Confirmer",
    back: "Retour", error: "Erreur", success: "Succès", or: "ou",
    saving: "Enregistrement...", optional: "optionnel",
  },
  auth: {
    login: "Connexion", register: "S'inscrire", logout: "Déconnexion", email: "E-mail",
    password: "Mot de passe", name: "Nom", welcome: "Bon retour",
  },
  settings: {
    title: "Paramètres", profile: "Profil", preferences: "Préférences",
    theme: "Thème", language: "Langue", darkMode: "Mode sombre", lightMode: "Mode clair",
    currency: "Devise principale", saveProfile: "Enregistrer", savePreferences: "Sauvegarder",
    changePhoto: "Changer la photo", uploadPhoto: "Télécharger",
    danger: "Zone danger", deleteAccount: "Supprimer le compte",
    avatarInvalidType: "Sélectionnez une image valide (JPG, PNG, WebP)",
    avatarTooLarge: "L'image doit faire au maximum 10 Mo",
    avatarUploadError: "Erreur lors de l'envoi de la photo. Réessayez.",
    photoUpdated: "Photo mise à jour", profileUpdated: "Profil mis à jour",
    preferencesUpdated: "Préférences sauvegardées",
    appearance: "Apparence", notifications: "Notifications", legal: "Légal", account: "Compte",
    tapChangePhoto: "Appuyez pour changer la photo", fullName: "Nom complet", notEditable: "non modifiable",
    saved: "Sauvegardé !", saveError: "Erreur lors de la sauvegarde. Réessayez.",
    darkModeOn: "Fond sombre, texte clair", darkModeOff: "Fond clair, texte sombre",
    pushNotif: "Notifications push", pushNotifDesc: "Alertes et mises à jour",
    emailPromo: "E-mails promotionnels", emailPromoDesc: "Nouveautés et offres",
    termsTitle: "Conditions d'utilisation", termsDescShort: "Règles et conditions du service",
    privacyTitle: "Politique de confidentialité", privacyDescShort: "Comment vos données sont utilisées",
    cookiesTitle: "Politique des cookies", cookiesDescShort: "Préférences de suivi",
    signOut: "Se déconnecter", version: "Version 1.0.0 · © 2026 PoupaMais",
    deleteConfirmSure: "Êtes-vous sûr ?",
    deleteConfirmMsg: "Toutes vos données — transactions, portefeuilles, objectifs et historique — seront définitivement supprimées. Cette action est irréversible.",
    deleteConfirmBtn: "Supprimer le compte",
  },
  support: {
    title: "Centre d'aide", subtitle: "Comment pouvons-nous vous aider?",
    whatsapp: "WhatsApp", email: "E-mail", chat: "Chat en direct",
    chatTitle: "Support PoupaMais", chatOnline: "En ligne", chatOffline: "Hors ligne",
    chatPlaceholder: "Tapez votre message...", chatSend: "Envoyer",
    faqTitle: "Questions fréquentes", guides: "Guides rapides",
    notFound: "Pas trouvé ce que vous cherchez?", sendEmail: "Envoyer un e-mail", typing: "En train d'écrire...",
    responseMinutes: "Réponse en quelques minutes", openConversation: "Ouvrir une conversation",
    responseHours: "Réponse sous 24h", sendEmailLink: "Envoyer un e-mail",
    onlineNow: "En ligne maintenant", chatTab: "Chat de support",
    noFaqFound: "Aucune question trouvée.", teamReady: "Notre équipe est prête à vous aider.",
    searchFaqs: "Rechercher dans les questions...",
    faqAll: "Tous", faqLogin: "Compte & Connexion", faqTransactions: "Transactions",
    faqCategories: "Catégories", faqGoals: "Objectifs", faqAI: "PoupaAI", faqPremium: "Premium",
    botGreeting: "Bonjour ! Je suis l'assistant virtuel de PoupaMais. Je suis là pour vous aider avec toute question sur l'app. Que puis-je faire pour vous ?",
    botFallback: "Compris ! Pour des questions plus spécifiques ou des problèmes techniques, notre équipe est disponible par WhatsApp ou e-mail. Comment puis-je vous aider ?",
    qr1: "Comment ajouter une transaction ?", qr2: "Créer un objectif financier",
    qr3: "Qu'est-ce que PoupaAI ?", qr4: "Comment utiliser les catégories ?", qr5: "Problèmes de connexion",
    faq1q: "Comment récupérer mon mot de passe ?", faq1a: "Sur l'écran de connexion, cliquez sur 'Mot de passe oublié'. Vous recevrez un e-mail avec des instructions.",
    faq2q: "Comment ajouter une transaction ?", faq2a: "Allez dans Transactions et cliquez sur 'Nouvelle'. Remplissez type, montant, description, date et catégorie. Cliquez sur Enregistrer.",
    faq3q: "Puis-je créer des catégories personnalisées ?", faq3a: "Oui ! Dans le formulaire de nouvelle transaction, cliquez sur 'Sélectionner une catégorie' puis sur 'Catégorie personnalisée'.",
    faq4q: "Comment créer un objectif financier ?", faq4a: "Allez dans Objectifs et cliquez sur 'Nouvel objectif'. Définissez le nom, le montant cible et le type. Vous pouvez ajouter des contributions à tout moment.",
    faq5q: "Qu'est-ce que PoupaAI ?", faq5a: "PoupaAI est votre conseiller financier IA. Il analyse vos dépenses, suggère des économies et répond aux questions financières.",
    faq6q: "Comment fonctionne le Premium ?", faq6a: "Le Premium inclut PoupaAI illimité, des rapports avancés et l'export d'extraits. R$ 9,90/mois avec 7 jours gratuits.",
    faq7q: "Mes données sont-elles sécurisées ?", faq7a: "Oui. Toutes les données sont chiffrées en transit et au repos. Nous ne partageons jamais vos informations.",
    faq8q: "Pourquoi les catégories n'apparaissent-elles pas ?", faq8a: "Vérifiez votre connexion. Si le problème persiste, déconnectez-vous et reconnectez-vous. Les catégories se chargent automatiquement après la connexion.",
  },
  premium: {
    title: "PoupaMais Premium",
    subtitle: "Débloquez des fonctionnalités avancées pour mieux gérer votre vie financière.",
    alreadyPremium: "Vous êtes déjà Premium", whatsIncluded: "Ce qui est inclus",
    highlight: "Mis en avant", thanksPremium: "Merci d'être Premium !",
    aiTitle: "PoupaAI — Assistant Financier",
    aiDesc: "Assistant intelligent IA qui analyse vos données réelles et donne des conseils financiers personnalisés en temps réel.",
    alertsTitle: "Alertes intelligentes",
    alertsDesc: "Recevez des avertissements automatiques lorsque vous dépensez au-delà des attentes dans une catégorie.",
    walletsTitle: "Portefeuilles illimités",
    walletsDesc: "Créez autant de portefeuilles que vous le souhaitez — courant, épargne, investissements, espèces et plus encore.",
    goalsTitle: "Objectifs illimités",
    goalsDesc: "Organisez des objectifs financiers illimités avec des barres de progression, des échéances et des contributions personnalisées.",
    featuresTitle: "Fonctionnalités Premium",
    featuresDesc: "Accès anticipé aux nouvelles fonctionnalités et aux rapports avancés avant tout le monde.",
    manageSubscription: "Gérer l'abonnement",
  },
  forgotPassword: {
    title: "Récupérer le mot de passe", subtitle: "Entrez votre e-mail et nous vous enverrons un lien pour créer un nouveau mot de passe.",
    sentTitle: "E-mail envoyé !", sentDesc: "Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.",
    backToLogin: "Retour à la connexion", sendBtn: "Envoyer le lien de récupération",
    errNotFound: "Aucun compte trouvé avec cet e-mail.",
    errTooMany: "Trop de tentatives. Veuillez attendre quelques minutes et réessayer.",
    errGeneric: "Erreur lors de l'envoi. Vérifiez l'adresse et réessayez.",
    sendError: "Erreur lors de l'envoi de l'e-mail. Réessayez.",
  },
  resetPassword: {
    title: "Nouveau mot de passe", subtitle: "Créez un nouveau mot de passe pour votre compte.",
    successTitle: "Mot de passe réinitialisé !", successDesc: "Votre mot de passe a été changé avec succès. Redirection…",
    newPassLabel: "Nouveau mot de passe", minChars: "Minimum 6 caractères",
    confirmLabel: "Confirmer le mot de passe", repeatPass: "Répétez le nouveau mot de passe",
    submitBtn: "Réinitialiser le mot de passe",
    errShort: "Le mot de passe doit comporter au moins 6 caractères.",
    errMismatch: "Les mots de passe ne correspondent pas.",
    errExpired: "Le lien de récupération a expiré. Demandez-en un nouveau.",
    errGeneric: "Erreur lors de la réinitialisation. Réessayez.",
  },
  dashboard: {
    title: "Tableau financier", balance: "Solde total", income: "Revenus", expenses: "Dépenses",
    savings: "Épargne", transactions: "Transactions", recentTransactions: "Dernières transactions",
    spendingByCategory: "Dépenses par catégorie", monthlyTrend: "Tendance mensuelle", noData: "Aucune donnée",
    controlTitle: "Vue financière", greeting: "Bonjour", newTransaction: "Nouvelle Transaction",
    askAI: "Demander à PoupaAI", monthlyIncome: "Revenus du mois", monthlyExpenses: "Dépenses du mois",
    billsToPay: "Factures à payer", pendingBill: "facture en attente", pendingBills: "factures en attente",
    noPending: "Aucune facture en attente", cashFlow: "Flux de trésorerie",
    cashFlowDesc: "Revenus vs Dépenses dans le temps", goalsProgress: "Progression des objectifs",
    viewAll: "Voir tout", noGoals: "Aucun objectif actif.",
    wallets: "Mes Portefeuilles", walletsTotal: "Solde total des portefeuilles",
    noWallets: "Aucun portefeuille créé.",
  },
  transactions: {
    title: "Transactions", subtitle: "Gérez vos revenus et dépenses.",
    newTransaction: "Nouvelle Transaction", editTransaction: "Modifier Transaction",
    filterAll: "Toutes", filterAllDesc: "Toutes les transactions",
    filterPending: "En attente", filterPendingDesc: "Factures / date future",
    filterIncome: "Revenus", filterIncomeDesc: "Argent reçu",
    filterExpense: "Dépenses", filterExpenseDesc: "Dépenses effectuées",
    filterBtn: "Filtrer", showing: "Affichage :", clearFilter: "Effacer le filtre",
    expense: "Dépense", income: "Revenu",
    amount: "Montant", description: "Description", date: "Date",
    category: "Catégorie", wallet: "Portefeuille", notes: "Notes",
    pendingBadge: "en attente", selectCategory: "Sélectionner...",
    noWalletWarning: "Créez un portefeuille avant d'ajouter des transactions.",
    selectWallet: "Sélectionner un portefeuille...", walletRequired: "Sélectionnez un portefeuille pour continuer.",
    notesPlaceholder: "Notes supplémentaires...", descPlaceholder: "Ex : Supermarché",
    saving: "Enregistrement...", noPendingMsg: "Aucune facture en attente.",
    noTransactions: "Aucune transaction trouvée.", addTransaction: "Ajouter une transaction",
    overdue: "en retard", today: "aujourd'hui", tomorrow: "demain", dUnit: "j",
    paid: "payé", payBtn: "Payer",
  },
  wallets: {
    title: "Portefeuilles", subtitle: "Gérez vos comptes et sources d'argent.",
    newWallet: "Nouveau Portefeuille", editWallet: "Modifier Portefeuille",
    name: "Nom", namePlaceholder: "Ex : Compte courant, Épargne...",
    initialBalance: "Solde initial",
    initialBalanceDesc: "Montant déjà présent dans ce compte avant d'enregistrer des transactions.",
    icon: "Icône", color: "Couleur", previewPlaceholder: "Nom du portefeuille",
    totalBalance: "Solde total des portefeuilles", loading: "Chargement...",
    noWallets: "Aucun portefeuille créé.", createFirst: "Créer le premier portefeuille",
    deleteTitle: "Supprimer le portefeuille ?",
    deleteDesc: "Les transactions liées ne seront pas supprimées, seulement dissociées.",
    deleting: "Suppression...",
  },
  goals: {
    title: "Objectifs Financiers", subtitle: "Suivez vos économies et réalisations.",
    newGoal: "Nouvel Objectif", createGoal: "Créer Objectif", editGoal: "Modifier Objectif",
    goalName: "Nom de l'objectif", goalNameCustom: "Quel est votre objectif ?",
    targetAmount: "Montant cible", currentAmount: "Montant actuel", optional: "optionnel",
    deadline: "Échéance", goalColor: "COULEUR",
    confirmDelete: "Confirmer la suppression ?", yesDelete: "Oui, supprimer", no: "Non",
    contributeTitle: "Ajouter une contribution", howMuch: "Combien souhaitez-vous ajouter ?",
    confirm: "Confirmer", noGoals: "Aucun objectif actif",
    noGoalsDesc: "Commencez à épargner pour vos rêves aujourd'hui.", createFirst: "Créer le premier objectif",
    of: "sur", completed: "complété", goalReached: "Objectif atteint !", addValue: "Ajouter un montant",
    remaining: "Reste",
    typeSavings: "Épargne", typeTravel: "Voyage", typeEmergency: "Urgence",
    typePurchase: "Achat", typeOther: "Personnalisé",
    saving: "Enregistrement...",
  },
  reports: {
    title: "Rapports", subtitle: "Analysez vos habitudes financières en profondeur.",
    spendingByCategory: "Dépenses par catégorie", spendingDesc: "Où est allé votre argent ce mois",
    noData: "Aucune donnée pour cette période", transactionCount: "transactions",
    cashFlow: "Flux de trésorerie", cashFlowDesc: "Revenus et dépenses dans le temps",
    income: "Revenus", expenses: "Dépenses",
    netSavings: "Épargne nette", netSavingsDesc: "Montant épargné par mois", savings: "Épargne",
  },
  ai: {
    newConversation: "Nouvelle conversation", noConversations: "Vos conversations apparaîtront ici",
    typing: "En train d'écrire…", online: "Assistant Financier · En ligne",
    newChat: "Nouveau chat", placeholder: "Posez une question sur vos finances…",
    premiumBadge: "Disponible sur Premium", premiumTitle: "PoupaAI exclusif",
    premiumDesc: "Votre assistant financier intelligent. Analyse vos données réelles et répond en temps réel — disponible uniquement sur le plan Premium.",
    seePremium: "Voir le plan Premium",
    greeting: "Je suis PoupaAI",
    greetingDesc: "Votre assistant financier personnel. J'analyse vos données réelles pour vous offrir des insights et recommandations personnalisées.",
    s1label: "Analyser mes dépenses", s1msg: "Analyse mes dépenses du mois et donne-moi un diagnostic financier.",
    s2label: "Comment économiser plus ?", s2msg: "En me basant sur mes données, comment puis-je économiser plus ?",
    s3label: "Alertes financières", s3msg: "Identifie les alertes financières dans mes données et les risques à surveiller.",
    s4label: "Progression de mes objectifs", s4msg: "Comment se portent mes objectifs financiers ? Suis-je sur la bonne voie ?",
    s5label: "Résumé du mois", s5msg: "Fais un résumé complet de mes finances de ce mois.",
    s6label: "Conseils d'investissement", s6msg: "Avec mon profil financier actuel, quels investissements recommandes-tu ?",
    userLabel: "Moi",
    errorSession: "Session expirée. Veuillez vous reconnecter.",
    errorConnect: "Erreur de connexion à PoupaAI. Réessayez.",
    errorTimeout: "Délai dépassé. PoupaAI a mis trop de temps à répondre. Réessayez.",
    errorNetwork: "Erreur réseau. Vérifiez votre connexion et réessayez.",
    noResponse: "Impossible de générer une réponse.",
    incomeLabel: "Revenu", expenseLabel: "Dépense", registered: "enregistré",
  },
  signIn: {
    title: "Bon retour", subtitle: "Connectez-vous pour continuer",
    forgotPassword: "Mot de passe oublié", noAccount: "Pas de compte ?",
    createAccount: "Créer un compte", continueGoogle: "Continuer avec Google", or: "ou", signInBtn: "Se connecter",
  },
  signUp: {
    title: "Créer votre compte", verifyTitle: "Vérifier l'e-mail",
    subtitle: "Commencez votre parcours avec PoupaMais", verifySubtitle: "Entrez le code envoyé à",
    fullName: "Nom complet", fullNamePh: "Votre nom", passwordPh: "Minimum 6 caractères",
    createBtn: "Créer un compte", creating: "Création du compte…",
    alreadyHaveAccount: "Déjà un compte ?", signInLink: "Se connecter", or: "ou",
    continueGoogle: "Continuer avec Google",
    verifyBtn: "Confirmer le code", verifying: "Vérification…",
    back: "← Retour", resend: "Renvoyer le code", resendIn: "Renvoyer dans",
    enterAllDigits: "Entrez les 6 chiffres du code.",
  },
};

export const translations: Record<Language, TranslationMap> = {
  "pt-BR": ptBR, en, es, fr,
};
