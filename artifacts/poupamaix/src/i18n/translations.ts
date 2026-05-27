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
    danger: string; deleteAccount: string; photoUpdated: string;
    profileUpdated: string; preferencesUpdated: string;
  };
  support: {
    title: string; subtitle: string; whatsapp: string; email: string; chat: string;
    chatTitle: string; chatOnline: string; chatOffline: string; chatPlaceholder: string;
    chatSend: string; faqTitle: string; guides: string; notFound: string; sendEmail: string;
    typing: string;
  };
  dashboard: {
    title: string; balance: string; income: string; expenses: string; savings: string;
    transactions: string; recentTransactions: string; spendingByCategory: string;
    monthlyTrend: string; noData: string;
    controlTitle: string; greeting: string; newTransaction: string; askAI: string;
    monthlyIncome: string; monthlyExpenses: string; billsToPay: string;
    pendingBill: string; pendingBills: string; noPending: string;
    cashFlow: string; cashFlowDesc: string; goalsProgress: string; viewAll: string; noGoals: string;
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
    photoUpdated: "Foto atualizada com sucesso", profileUpdated: "Perfil atualizado com sucesso",
    preferencesUpdated: "Preferências salvas",
  },
  support: {
    title: "Central de Ajuda", subtitle: "Como podemos ajudar você hoje?",
    whatsapp: "WhatsApp", email: "E-mail", chat: "Chat ao Vivo",
    chatTitle: "Suporte PoupaMais", chatOnline: "Online", chatOffline: "Offline",
    chatPlaceholder: "Digite sua mensagem...", chatSend: "Enviar",
    faqTitle: "Perguntas Frequentes", guides: "Guias Rápidos",
    notFound: "Não encontrou o que procurava?", sendEmail: "Enviar E-mail", typing: "Digitando...",
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
    danger: "Danger Zone", deleteAccount: "Delete Account",
    photoUpdated: "Photo updated successfully", profileUpdated: "Profile updated successfully",
    preferencesUpdated: "Preferences saved",
  },
  support: {
    title: "Help Center", subtitle: "How can we help you today?",
    whatsapp: "WhatsApp", email: "Email", chat: "Live Chat",
    chatTitle: "PoupaMais Support", chatOnline: "Online", chatOffline: "Offline",
    chatPlaceholder: "Type your message...", chatSend: "Send",
    faqTitle: "Frequently Asked Questions", guides: "Quick Guides",
    notFound: "Didn't find what you were looking for?", sendEmail: "Send Email", typing: "Typing...",
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
    photoUpdated: "Foto actualizada", profileUpdated: "Perfil actualizado",
    preferencesUpdated: "Preferencias guardadas",
  },
  support: {
    title: "Centro de ayuda", subtitle: "¿Cómo podemos ayudarte hoy?",
    whatsapp: "WhatsApp", email: "Correo", chat: "Chat en vivo",
    chatTitle: "Soporte PoupaMais", chatOnline: "En línea", chatOffline: "Sin conexión",
    chatPlaceholder: "Escribe tu mensaje...", chatSend: "Enviar",
    faqTitle: "Preguntas frecuentes", guides: "Guías rápidas",
    notFound: "¿No encontraste lo que buscabas?", sendEmail: "Enviar correo", typing: "Escribiendo...",
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
    photoUpdated: "Photo mise à jour", profileUpdated: "Profil mis à jour",
    preferencesUpdated: "Préférences sauvegardées",
  },
  support: {
    title: "Centre d'aide", subtitle: "Comment pouvons-nous vous aider?",
    whatsapp: "WhatsApp", email: "E-mail", chat: "Chat en direct",
    chatTitle: "Support PoupaMais", chatOnline: "En ligne", chatOffline: "Hors ligne",
    chatPlaceholder: "Tapez votre message...", chatSend: "Envoyer",
    faqTitle: "Questions fréquentes", guides: "Guides rapides",
    notFound: "Pas trouvé ce que vous cherchez?", sendEmail: "Envoyer un e-mail", typing: "En train d'écrire...",
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
