export type Language = "pt-BR" | "en" | "es" | "fr";

export const LANGUAGE_LABELS: Record<Language, string> = {
  "pt-BR": "Português (Brasil)",
  "en":    "English",
  "es":    "Español",
  "fr":    "Français",
};

type TranslationMap = {
  nav: {
    dashboard: string; transactions: string; goals: string; wallets: string;
    reports: string; ai: string; premium: string; support: string; settings: string;
  };
  common: {
    save: string; cancel: string; delete: string; edit: string; add: string;
    loading: string; search: string; close: string; confirm: string; back: string;
    error: string; success: string;
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
    back: "Voltar", error: "Erro", success: "Sucesso",
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
    back: "Back", error: "Error", success: "Success",
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
    back: "Volver", error: "Error", success: "Éxito",
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
    back: "Retour", error: "Erreur", success: "Succès",
  },
  auth: { login: "Connexion", register: "S'inscrire", logout: "Déconnexion", email: "E-mail",
    password: "Mot de passe", name: "Nom", welcome: "Bon retour" },
  settings: { title: "Paramètres", profile: "Profil", preferences: "Préférences",
    theme: "Thème", language: "Langue", darkMode: "Mode sombre", lightMode: "Mode clair",
    currency: "Devise principale", saveProfile: "Enregistrer", savePreferences: "Sauvegarder",
    changePhoto: "Changer la photo", uploadPhoto: "Télécharger", danger: "Zone danger",
    deleteAccount: "Supprimer le compte", photoUpdated: "Photo mise à jour",
    profileUpdated: "Profil mis à jour", preferencesUpdated: "Préférences sauvegardées" },
  support: { title: "Centre d'aide", subtitle: "Comment pouvons-nous vous aider?",
    whatsapp: "WhatsApp", email: "E-mail", chat: "Chat en direct",
    chatTitle: "Support PoupaMais", chatOnline: "En ligne", chatOffline: "Hors ligne",
    chatPlaceholder: "Tapez votre message...", chatSend: "Envoyer",
    faqTitle: "Questions fréquentes", guides: "Guides rapides",
    notFound: "Pas trouvé ce que vous cherchez?", sendEmail: "Envoyer un e-mail", typing: "En train d'écrire..." },
  dashboard: { title: "Tableau financier", balance: "Solde total", income: "Revenus",
    expenses: "Dépenses", savings: "Épargne", transactions: "Transactions",
    recentTransactions: "Dernières transactions", spendingByCategory: "Dépenses par catégorie",
    monthlyTrend: "Tendance mensuelle", noData: "Aucune donnée" },
};

export const translations: Record<Language, TranslationMap> = {
  "pt-BR": ptBR, en, es, fr,
};
