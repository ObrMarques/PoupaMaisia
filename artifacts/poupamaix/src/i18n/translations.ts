export type Language =
  | "pt-BR" | "en" | "es" | "fr" | "de"
  | "zh" | "ja" | "ko" | "ru" | "ar" | "hi";

export const LANGUAGE_LABELS: Record<Language, string> = {
  "pt-BR": "Português (Brasil)",
  "en":    "English",
  "es":    "Español",
  "fr":    "Français",
  "de":    "Deutsch",
  "zh":    "中文",
  "ja":    "日本語",
  "ko":    "한국어",
  "ru":    "Русский",
  "ar":    "العربية",
  "hi":    "हिन्दी",
};

type TranslationMap = {
  nav: {
    dashboard: string; transactions: string; goals: string; cards: string;
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
    dashboard: "Painel", transactions: "Transações", goals: "Metas", cards: "Cartões",
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
    dashboard: "Dashboard", transactions: "Transactions", goals: "Goals", cards: "Cards",
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
    dashboard: "Panel", transactions: "Transacciones", goals: "Metas", cards: "Tarjetas",
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
    dashboard: "Tableau de bord", transactions: "Transactions", goals: "Objectifs", cards: "Cartes",
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

const de: TranslationMap = {
  nav: { dashboard: "Übersicht", transactions: "Transaktionen", goals: "Ziele", cards: "Karten",
    reports: "Berichte", ai: "PoupaAI", premium: "Premium", support: "Support", settings: "Einstellungen" },
  common: { save: "Speichern", cancel: "Abbrechen", delete: "Löschen", edit: "Bearbeiten", add: "Hinzufügen",
    loading: "Laden...", search: "Suchen", close: "Schließen", confirm: "Bestätigen",
    back: "Zurück", error: "Fehler", success: "Erfolg" },
  auth: { login: "Anmelden", register: "Registrieren", logout: "Abmelden", email: "E-Mail",
    password: "Passwort", name: "Name", welcome: "Willkommen zurück" },
  settings: { title: "Einstellungen", profile: "Profil", preferences: "Präferenzen",
    theme: "Thema", language: "Sprache", darkMode: "Dunkelmodus", lightMode: "Hellmodus",
    currency: "Hauptwährung", saveProfile: "Änderungen speichern", savePreferences: "Einstellungen speichern",
    changePhoto: "Foto ändern", uploadPhoto: "Foto hochladen", danger: "Gefahrenzone",
    deleteAccount: "Konto löschen", photoUpdated: "Foto aktualisiert",
    profileUpdated: "Profil aktualisiert", preferencesUpdated: "Einstellungen gespeichert" },
  support: { title: "Hilfecenter", subtitle: "Wie können wir Ihnen helfen?",
    whatsapp: "WhatsApp", email: "E-Mail", chat: "Live-Chat",
    chatTitle: "PoupaMais Support", chatOnline: "Online", chatOffline: "Offline",
    chatPlaceholder: "Nachricht eingeben...", chatSend: "Senden",
    faqTitle: "Häufig gestellte Fragen", guides: "Schnellanleitungen",
    notFound: "Nicht gefunden, was Sie suchen?", sendEmail: "E-Mail senden", typing: "Schreibt..." },
  dashboard: { title: "Finanzdashboard", balance: "Gesamtguthaben", income: "Einnahmen",
    expenses: "Ausgaben", savings: "Ersparnisse", transactions: "Transaktionen",
    recentTransactions: "Letzte Transaktionen", spendingByCategory: "Ausgaben nach Kategorie",
    monthlyTrend: "Monatlicher Trend", noData: "Keine Daten" },
};

const zh: TranslationMap = {
  nav: { dashboard: "仪表板", transactions: "交易", goals: "目标", cards: "卡片",
    reports: "报告", ai: "PoupaAI", premium: "高级版", support: "支持", settings: "设置" },
  common: { save: "保存", cancel: "取消", delete: "删除", edit: "编辑", add: "添加",
    loading: "加载中...", search: "搜索", close: "关闭", confirm: "确认",
    back: "返回", error: "错误", success: "成功" },
  auth: { login: "登录", register: "注册", logout: "退出", email: "邮箱",
    password: "密码", name: "姓名", welcome: "欢迎回来" },
  settings: { title: "设置", profile: "个人资料", preferences: "偏好",
    theme: "主题", language: "语言", darkMode: "深色模式", lightMode: "浅色模式",
    currency: "主要货币", saveProfile: "保存更改", savePreferences: "保存偏好",
    changePhoto: "更换照片", uploadPhoto: "上传照片", danger: "危险区域",
    deleteAccount: "删除账户", photoUpdated: "照片已更新",
    profileUpdated: "个人资料已更新", preferencesUpdated: "偏好已保存" },
  support: { title: "帮助中心", subtitle: "我们今天如何帮助您?",
    whatsapp: "WhatsApp", email: "邮箱", chat: "在线聊天",
    chatTitle: "PoupaMais 支持", chatOnline: "在线", chatOffline: "离线",
    chatPlaceholder: "输入您的消息...", chatSend: "发送",
    faqTitle: "常见问题", guides: "快速指南",
    notFound: "没有找到您需要的?", sendEmail: "发送邮件", typing: "正在输入..." },
  dashboard: { title: "财务仪表板", balance: "总余额", income: "收入",
    expenses: "支出", savings: "储蓄", transactions: "交易",
    recentTransactions: "最近交易", spendingByCategory: "按类别消费",
    monthlyTrend: "月度趋势", noData: "无数据" },
};

const ja: TranslationMap = {
  nav: { dashboard: "ダッシュボード", transactions: "取引", goals: "目標", cards: "カード",
    reports: "レポート", ai: "PoupaAI", premium: "プレミアム", support: "サポート", settings: "設定" },
  common: { save: "保存", cancel: "キャンセル", delete: "削除", edit: "編集", add: "追加",
    loading: "読み込み中...", search: "検索", close: "閉じる", confirm: "確認",
    back: "戻る", error: "エラー", success: "成功" },
  auth: { login: "ログイン", register: "登録", logout: "ログアウト", email: "メール",
    password: "パスワード", name: "名前", welcome: "おかえりなさい" },
  settings: { title: "設定", profile: "プロフィール", preferences: "設定",
    theme: "テーマ", language: "言語", darkMode: "ダークモード", lightMode: "ライトモード",
    currency: "主要通貨", saveProfile: "変更を保存", savePreferences: "設定を保存",
    changePhoto: "写真を変更", uploadPhoto: "写真をアップロード", danger: "危険ゾーン",
    deleteAccount: "アカウントを削除", photoUpdated: "写真が更新されました",
    profileUpdated: "プロフィールが更新されました", preferencesUpdated: "設定が保存されました" },
  support: { title: "ヘルプセンター", subtitle: "今日はどのようにお手伝いできますか?",
    whatsapp: "WhatsApp", email: "メール", chat: "ライブチャット",
    chatTitle: "PoupaMaisサポート", chatOnline: "オンライン", chatOffline: "オフライン",
    chatPlaceholder: "メッセージを入力...", chatSend: "送信",
    faqTitle: "よくある質問", guides: "クイックガイド",
    notFound: "お探しのものが見つかりませんか?", sendEmail: "メールを送信", typing: "入力中..." },
  dashboard: { title: "財務ダッシュボード", balance: "総残高", income: "収入",
    expenses: "支出", savings: "貯蓄", transactions: "取引",
    recentTransactions: "最近の取引", spendingByCategory: "カテゴリ別支出",
    monthlyTrend: "月次トレンド", noData: "データなし" },
};

const ko: TranslationMap = {
  nav: { dashboard: "대시보드", transactions: "거래", goals: "목표", cards: "카드",
    reports: "보고서", ai: "PoupaAI", premium: "프리미엄", support: "지원", settings: "설정" },
  common: { save: "저장", cancel: "취소", delete: "삭제", edit: "편집", add: "추가",
    loading: "로딩 중...", search: "검색", close: "닫기", confirm: "확인",
    back: "뒤로", error: "오류", success: "성공" },
  auth: { login: "로그인", register: "회원가입", logout: "로그아웃", email: "이메일",
    password: "비밀번호", name: "이름", welcome: "다시 오신 것을 환영합니다" },
  settings: { title: "설정", profile: "프로필", preferences: "환경설정",
    theme: "테마", language: "언어", darkMode: "다크 모드", lightMode: "라이트 모드",
    currency: "주요 통화", saveProfile: "변경사항 저장", savePreferences: "환경설정 저장",
    changePhoto: "사진 변경", uploadPhoto: "사진 업로드", danger: "위험 구역",
    deleteAccount: "계정 삭제", photoUpdated: "사진이 업데이트되었습니다",
    profileUpdated: "프로필이 업데이트되었습니다", preferencesUpdated: "환경설정이 저장되었습니다" },
  support: { title: "도움말 센터", subtitle: "오늘 어떻게 도와드릴까요?",
    whatsapp: "WhatsApp", email: "이메일", chat: "라이브 채팅",
    chatTitle: "PoupaMais 지원", chatOnline: "온라인", chatOffline: "오프라인",
    chatPlaceholder: "메시지를 입력하세요...", chatSend: "전송",
    faqTitle: "자주 묻는 질문", guides: "빠른 가이드",
    notFound: "원하는 것을 찾지 못했나요?", sendEmail: "이메일 보내기", typing: "입력 중..." },
  dashboard: { title: "금융 대시보드", balance: "총 잔액", income: "수입",
    expenses: "지출", savings: "저축", transactions: "거래",
    recentTransactions: "최근 거래", spendingByCategory: "카테고리별 지출",
    monthlyTrend: "월간 추세", noData: "데이터 없음" },
};

const ru: TranslationMap = {
  nav: { dashboard: "Панель", transactions: "Транзакции", goals: "Цели", cards: "Карты",
    reports: "Отчёты", ai: "PoupaAI", premium: "Премиум", support: "Поддержка", settings: "Настройки" },
  common: { save: "Сохранить", cancel: "Отмена", delete: "Удалить", edit: "Изменить", add: "Добавить",
    loading: "Загрузка...", search: "Поиск", close: "Закрыть", confirm: "Подтвердить",
    back: "Назад", error: "Ошибка", success: "Успех" },
  auth: { login: "Войти", register: "Зарегистрироваться", logout: "Выйти", email: "Эл. почта",
    password: "Пароль", name: "Имя", welcome: "С возвращением" },
  settings: { title: "Настройки", profile: "Профиль", preferences: "Предпочтения",
    theme: "Тема", language: "Язык", darkMode: "Тёмный режим", lightMode: "Светлый режим",
    currency: "Основная валюта", saveProfile: "Сохранить изменения", savePreferences: "Сохранить",
    changePhoto: "Изменить фото", uploadPhoto: "Загрузить фото", danger: "Опасная зона",
    deleteAccount: "Удалить аккаунт", photoUpdated: "Фото обновлено",
    profileUpdated: "Профиль обновлён", preferencesUpdated: "Настройки сохранены" },
  support: { title: "Центр помощи", subtitle: "Как мы можем вам помочь?",
    whatsapp: "WhatsApp", email: "Эл. почта", chat: "Живой чат",
    chatTitle: "Поддержка PoupaMais", chatOnline: "Онлайн", chatOffline: "Офлайн",
    chatPlaceholder: "Введите сообщение...", chatSend: "Отправить",
    faqTitle: "Частые вопросы", guides: "Быстрые руководства",
    notFound: "Не нашли то, что искали?", sendEmail: "Отправить письмо", typing: "Печатает..." },
  dashboard: { title: "Финансовая панель", balance: "Общий баланс", income: "Доходы",
    expenses: "Расходы", savings: "Сбережения", transactions: "Транзакции",
    recentTransactions: "Последние транзакции", spendingByCategory: "Расходы по категориям",
    monthlyTrend: "Месячная тенденция", noData: "Нет данных" },
};

const ar: TranslationMap = {
  nav: { dashboard: "لوحة التحكم", transactions: "المعاملات", goals: "الأهداف", cards: "البطاقات",
    reports: "التقارير", ai: "PoupaAI", premium: "مميز", support: "الدعم", settings: "الإعدادات" },
  common: { save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", add: "إضافة",
    loading: "جاري التحميل...", search: "بحث", close: "إغلاق", confirm: "تأكيد",
    back: "رجوع", error: "خطأ", success: "نجاح" },
  auth: { login: "تسجيل الدخول", register: "إنشاء حساب", logout: "تسجيل الخروج",
    email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم", welcome: "مرحباً بعودتك" },
  settings: { title: "الإعدادات", profile: "الملف الشخصي", preferences: "التفضيلات",
    theme: "المظهر", language: "اللغة", darkMode: "الوضع الداكن", lightMode: "الوضع الفاتح",
    currency: "العملة الرئيسية", saveProfile: "حفظ التغييرات", savePreferences: "حفظ التفضيلات",
    changePhoto: "تغيير الصورة", uploadPhoto: "رفع صورة", danger: "منطقة الخطر",
    deleteAccount: "حذف الحساب", photoUpdated: "تم تحديث الصورة",
    profileUpdated: "تم تحديث الملف الشخصي", preferencesUpdated: "تم حفظ التفضيلات" },
  support: { title: "مركز المساعدة", subtitle: "كيف يمكننا مساعدتك اليوم؟",
    whatsapp: "واتساب", email: "البريد الإلكتروني", chat: "دردشة مباشرة",
    chatTitle: "دعم PoupaMais", chatOnline: "متصل", chatOffline: "غير متصل",
    chatPlaceholder: "اكتب رسالتك...", chatSend: "إرسال",
    faqTitle: "الأسئلة الشائعة", guides: "أدلة سريعة",
    notFound: "لم تجد ما تبحث عنه؟", sendEmail: "إرسال بريد إلكتروني", typing: "يكتب..." },
  dashboard: { title: "لوحة التحكم المالية", balance: "الرصيد الإجمالي", income: "الدخل",
    expenses: "المصروفات", savings: "المدخرات", transactions: "المعاملات",
    recentTransactions: "المعاملات الأخيرة", spendingByCategory: "الإنفاق حسب الفئة",
    monthlyTrend: "الاتجاه الشهري", noData: "لا توجد بيانات" },
};

const hi: TranslationMap = {
  nav: { dashboard: "डैशबोर्ड", transactions: "लेनदेन", goals: "लक्ष्य", cards: "कार्ड",
    reports: "रिपोर्ट", ai: "PoupaAI", premium: "प्रीमियम", support: "सहायता", settings: "सेटिंग्स" },
  common: { save: "सहेजें", cancel: "रद्द करें", delete: "हटाएं", edit: "संपादित करें", add: "जोड़ें",
    loading: "लोड हो रहा है...", search: "खोजें", close: "बंद करें", confirm: "पुष्टि करें",
    back: "वापस", error: "त्रुटि", success: "सफलता" },
  auth: { login: "लॉग इन", register: "पंजीकरण", logout: "लॉग आउट", email: "ईमेल",
    password: "पासवर्ड", name: "नाम", welcome: "वापस स्वागत है" },
  settings: { title: "सेटिंग्स", profile: "प्रोफ़ाइल", preferences: "प्राथमिकताएं",
    theme: "थीम", language: "भाषा", darkMode: "डार्क मोड", lightMode: "लाइट मोड",
    currency: "मुख्य मुद्रा", saveProfile: "बदलाव सहेजें", savePreferences: "प्राथमिकताएं सहेजें",
    changePhoto: "फ़ोटो बदलें", uploadPhoto: "फ़ोटो अपलोड करें", danger: "खतरे का क्षेत्र",
    deleteAccount: "खाता हटाएं", photoUpdated: "फ़ोटो अपडेट हो गई",
    profileUpdated: "प्रोफ़ाइल अपडेट हो गई", preferencesUpdated: "प्राथमिकताएं सहेजी गईं" },
  support: { title: "सहायता केंद्र", subtitle: "आज हम आपकी कैसे मदद कर सकते हैं?",
    whatsapp: "WhatsApp", email: "ईमेल", chat: "लाइव चैट",
    chatTitle: "PoupaMais सहायता", chatOnline: "ऑनलाइन", chatOffline: "ऑफलाइन",
    chatPlaceholder: "अपना संदेश टाइप करें...", chatSend: "भेजें",
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न", guides: "त्वरित मार्गदर्शिका",
    notFound: "जो खोज रहे थे वो नहीं मिला?", sendEmail: "ईमेल भेजें", typing: "टाइप कर रहा है..." },
  dashboard: { title: "वित्तीय डैशबोर्ड", balance: "कुल शेष", income: "आय",
    expenses: "खर्च", savings: "बचत", transactions: "लेनदेन",
    recentTransactions: "हाल के लेनदेन", spendingByCategory: "श्रेणी के अनुसार खर्च",
    monthlyTrend: "मासिक रुझान", noData: "कोई डेटा नहीं" },
};

export const translations: Record<Language, TranslationMap> = {
  "pt-BR": ptBR, en, es, fr, de, zh, ja, ko, ru, ar, hi,
};
