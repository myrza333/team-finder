import type { Locale } from "@/i18n/config";

// Тексты юридических страниц. Это шаблон для вёрстки: перед запуском
// проекта текст должен проверить юрист под вашу страну и реальную работу сервиса.

export type LegalSection = {
  id: string; // якорь для оглавления: /privacy#data-we-collect
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalDocument = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  updated: "September 27, 2026",
  intro:
    "This Privacy Policy explains what information TeamFinder collects when you use the platform, how we use it, and the choices you have. We only collect what we need to help you find a team and run the service.",
  sections: [
    {
      id: "data-we-collect",
      title: "Information we collect",
      paragraphs: ["We collect information you give us directly and information created while you use TeamFinder:"],
      list: [
        "Account data: name, email address and password (stored only as a secure hash).",
        "Google sign-in data: your name, email and profile picture, if you choose to sign in with Google.",
        "Profile data: bio, location, skills, GitHub and Telegram links.",
        "Project data: projects you create, vacancies, applications you send or receive.",
        "Messages you send in team chats and the notifications you receive.",
        "Technical data: IP address, browser type and basic usage logs needed to keep the service secure.",
      ],
    },
    {
      id: "how-we-use",
      title: "How we use your information",
      paragraphs: ["We use your information to:"],
      list: [
        "Create and manage your account and let you sign in.",
        "Show your profile and projects to other users.",
        "Deliver applications, notifications and team chat messages.",
        "Prevent spam, abuse and fraud, and keep the platform secure.",
      ],
    },
    {
      id: "sharing",
      title: "What is visible to others",
      paragraphs: [
        "Your name, avatar, bio, location, skills, links and projects are public to other TeamFinder users. Your email address is never shown publicly. Team chat messages are visible only to members of that project team.",
        "We do not sell your personal data. We share data only with service providers that help us run TeamFinder (such as hosting and database providers), and only as needed to provide the service.",
      ],
    },
    {
      id: "storage",
      title: "Storage and security",
      paragraphs: [
        "Your data is stored with our database provider. We use encrypted connections, hashed passwords and access controls to protect it. No online service can guarantee absolute security, so please use a strong, unique password.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights and choices",
      paragraphs: ["You can at any time:"],
      list: [
        "View and edit your profile information in settings.",
        "Withdraw applications and leave project teams.",
        "Delete your account, which removes your profile, projects and applications.",
        "Contact us to request a copy of your data.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      paragraphs: [
        "We use only essential cookies needed to keep you signed in and to keep the service secure. We do not use advertising cookies.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "We may update this policy as TeamFinder grows. If the changes are significant, we will notify you on the platform before they take effect.",
      ],
    },
  ],
};

const termsEn: LegalDocument = {
  title: "Terms of Service",
  updated: "September 27, 2026",
  intro:
    "These Terms govern your use of TeamFinder, a platform for finding teammates and joining projects. By creating an account or using the platform, you agree to these Terms.",
  sections: [
    {
      id: "account",
      title: "Your account",
      paragraphs: [
        "You must provide accurate information when creating an account and keep your login details secure. You are responsible for all activity on your account. One person may have only one account.",
      ],
    },
    {
      id: "using-teamfinder",
      title: "Using TeamFinder",
      paragraphs: [
        "Any user can both look for projects to join and create their own projects to find teammates. Project owners decide who joins their team; sending an application does not guarantee acceptance.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      paragraphs: ["When using TeamFinder, you agree not to:"],
      list: [
        "Post false, misleading or illegal content, or impersonate other people.",
        "Harass, threaten or discriminate against other users.",
        "Send spam, unsolicited advertising or mass messages.",
        "Publish projects that are scams or ask for payment to join a team.",
        "Try to access other accounts, break security or overload the service.",
      ],
    },
    {
      id: "content",
      title: "Your content",
      paragraphs: [
        "You keep ownership of everything you post: your profile, project descriptions and messages. You give TeamFinder permission to store and display this content so the platform can work. You are responsible for what you post.",
      ],
    },
    {
      id: "projects-and-teams",
      title: "Projects and teams",
      paragraphs: [
        "TeamFinder helps people connect but is not a party to agreements between users. Terms of collaboration — roles, ownership of work, payment or equity — are agreed directly between team members. We recommend agreeing on them in writing before starting work.",
      ],
    },
    {
      id: "termination",
      title: "Suspension and termination",
      paragraphs: [
        "We may remove content or suspend accounts that break these Terms. You can stop using TeamFinder and delete your account at any time.",
      ],
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      paragraphs: [
        "TeamFinder is provided “as is”. We work to keep it available and secure, but we cannot guarantee that it will always be error-free or uninterrupted, and we are not responsible for the actions of other users.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these Terms",
      paragraphs: [
        "We may update these Terms from time to time. If the changes are significant, we will notify you on the platform. Continuing to use TeamFinder after changes means you accept the updated Terms.",
      ],
    },
  ],
};

const privacyRu: LegalDocument = {
  title: "Политика конфиденциальности",
  updated: "27 сентября 2026 г.",
  intro:
    "Эта политика объясняет, какие данные TeamFinder собирает, когда вы пользуетесь платформой, как мы их используем и какой у вас есть выбор. Мы собираем только то, что нужно, чтобы помочь вам найти команду и обеспечить работу сервиса.",
  sections: [
    {
      id: "data-we-collect",
      title: "Какие данные мы собираем",
      paragraphs: ["Мы собираем данные, которые вы передаёте нам сами, и данные, которые появляются, пока вы пользуетесь TeamFinder:"],
      list: [
        "Данные аккаунта: имя, адрес электронной почты и пароль (хранится только в виде защищённого хеша).",
        "Данные входа через Google: имя, email и фото профиля, если вы решите входить через Google.",
        "Данные профиля: информация о себе, город, навыки, ссылки на GitHub и Telegram.",
        "Данные проектов: созданные вами проекты, вакансии, отправленные и полученные заявки.",
        "Сообщения, которые вы отправляете в чатах команд, и уведомления, которые получаете.",
        "Технические данные: IP-адрес, тип браузера и базовые журналы использования, нужные для безопасности сервиса.",
      ],
    },
    {
      id: "how-we-use",
      title: "Как мы используем данные",
      paragraphs: ["Мы используем ваши данные, чтобы:"],
      list: [
        "Создавать ваш аккаунт, управлять им и давать вам возможность входить.",
        "Показывать ваш профиль и проекты другим пользователям.",
        "Доставлять заявки, уведомления и сообщения чатов команд.",
        "Предотвращать спам, злоупотребления и мошенничество и обеспечивать безопасность платформы.",
      ],
    },
    {
      id: "sharing",
      title: "Что видят другие",
      paragraphs: [
        "Ваше имя, аватар, информация о себе, город, навыки, ссылки и проекты видны другим пользователям TeamFinder. Ваш email никогда не показывается публично. Сообщения чата команды видят только участники этой команды.",
        "Мы не продаём ваши персональные данные. Мы передаём данные только поставщикам услуг, которые помогают нам обеспечивать работу TeamFinder (например, хостингу и базе данных), и только в объёме, необходимом для работы сервиса.",
      ],
    },
    {
      id: "storage",
      title: "Хранение и безопасность",
      paragraphs: [
        "Ваши данные хранятся у нашего поставщика базы данных. Для их защиты мы используем шифрованные соединения, хеширование паролей и контроль доступа. Ни один онлайн-сервис не может гарантировать абсолютную безопасность, поэтому используйте надёжный и уникальный пароль.",
      ],
    },
    {
      id: "your-rights",
      title: "Ваши права и возможности",
      paragraphs: ["В любой момент вы можете:"],
      list: [
        "Просматривать и изменять данные профиля в настройках.",
        "Отзывать заявки и выходить из команд проектов.",
        "Удалить аккаунт — вместе с ним удаляются профиль, проекты и заявки.",
        "Связаться с нами и запросить копию своих данных.",
      ],
    },
    {
      id: "cookies",
      title: "Cookie",
      paragraphs: [
        "Мы используем только необходимые cookie: чтобы вы оставались в аккаунте и чтобы сервис был безопасным. Рекламные cookie мы не используем.",
      ],
    },
    {
      id: "changes",
      title: "Изменения политики",
      paragraphs: [
        "По мере развития TeamFinder мы можем обновлять эту политику. Если изменения существенные, мы заранее сообщим о них на платформе.",
      ],
    },
  ],
};

const termsRu: LegalDocument = {
  title: "Условия использования",
  updated: "27 сентября 2026 г.",
  intro:
    "Эти условия регулируют использование TeamFinder — платформы для поиска участников команды и присоединения к проектам. Создавая аккаунт или пользуясь платформой, вы соглашаетесь с этими условиями.",
  sections: [
    {
      id: "account",
      title: "Ваш аккаунт",
      paragraphs: [
        "При создании аккаунта указывайте достоверные данные и храните данные для входа в безопасности. Вы отвечаете за все действия в своём аккаунте. У одного человека может быть только один аккаунт.",
      ],
    },
    {
      id: "using-teamfinder",
      title: "Использование TeamFinder",
      paragraphs: [
        "Любой пользователь может и искать проекты, к которым хочет присоединиться, и создавать свои проекты, чтобы найти участников. Владельцы проектов сами решают, кого принять в команду: отправка заявки не гарантирует, что её примут.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Допустимое использование",
      paragraphs: ["Пользуясь TeamFinder, вы обязуетесь не:"],
      list: [
        "Публиковать ложную, вводящую в заблуждение или незаконную информацию и не выдавать себя за других людей.",
        "Оскорблять, запугивать или дискриминировать других пользователей.",
        "Рассылать спам, непрошеную рекламу или массовые сообщения.",
        "Публиковать мошеннические проекты или требовать плату за вступление в команду.",
        "Пытаться получить доступ к чужим аккаунтам, нарушать защиту или перегружать сервис.",
      ],
    },
    {
      id: "content",
      title: "Ваш контент",
      paragraphs: [
        "Всё, что вы публикуете — профиль, описания проектов и сообщения, — остаётся вашим. Вы разрешаете TeamFinder хранить и показывать этот контент, чтобы платформа могла работать. Вы отвечаете за то, что публикуете.",
      ],
    },
    {
      id: "projects-and-teams",
      title: "Проекты и команды",
      paragraphs: [
        "TeamFinder помогает людям находить друг друга, но не является стороной договорённостей между пользователями. Условия сотрудничества — роли, права на результаты работы, оплата или доля — участники команды согласуют напрямую. Рекомендуем зафиксировать их письменно до начала работы.",
      ],
    },
    {
      id: "termination",
      title: "Блокировка и прекращение использования",
      paragraphs: [
        "Мы можем удалять контент и блокировать аккаунты, нарушающие эти условия. Вы можете перестать пользоваться TeamFinder и удалить аккаунт в любой момент.",
      ],
    },
    {
      id: "disclaimer",
      title: "Отказ от гарантий",
      paragraphs: [
        "TeamFinder предоставляется «как есть». Мы стараемся, чтобы сервис был доступным и безопасным, но не можем гарантировать, что он всегда будет работать без ошибок и перебоев, и не отвечаем за действия других пользователей.",
      ],
    },
    {
      id: "changes",
      title: "Изменения условий",
      paragraphs: [
        "Мы можем время от времени обновлять эти условия. Если изменения существенные, мы сообщим о них на платформе. Продолжая пользоваться TeamFinder после изменений, вы принимаете обновлённые условия.",
      ],
    },
  ],
};

const privacyKy: LegalDocument = {
  title: "Купуялык саясаты",
  updated: "2026-жылдын 27-сентябры",
  intro:
    "Бул саясат платформаны колдонгонуңузда TeamFinder кандай маалыматтарды чогултарын, аларды кантип колдонорубузду жана сизде кандай тандоо бар экенин түшүндүрөт. Биз команда табууга жардам берүү жана сервистин иштеши үчүн керектүү маалыматты гана чогултабыз.",
  sections: [
    {
      id: "data-we-collect",
      title: "Кандай маалымат чогултабыз",
      paragraphs: ["Биз өзүңүз берген маалыматты жана TeamFinder'ди колдонуп жатканда пайда болгон маалыматты чогултабыз:"],
      list: [
        "Аккаунттун маалыматы: аты, электрондук почта дареги жана сырсөз (корголгон хеш түрүндө гана сакталат).",
        "Google аркылуу кирүү маалыматы: Google аркылуу кирүүнү тандасаңыз — атыңыз, email жана профиль сүрөтүңүз.",
        "Профиль маалыматы: өзүңүз жөнүндө маалымат, жашаган жери, көндүмдөр, GitHub жана Telegram шилтемелери.",
        "Долбоор маалыматы: сиз түзгөн долбоорлор, бош орундар, жөнөткөн жана алган арыздарыңыз.",
        "Командалардын чаттарында жөнөткөн билдирүүлөрүңүз жана алган эскертмелериңиз.",
        "Техникалык маалымат: IP-дарек, браузердин түрү жана сервистин коопсуздугу үчүн керектүү негизги колдонуу журналдары.",
      ],
    },
    {
      id: "how-we-use",
      title: "Маалыматты кантип колдонобуз",
      paragraphs: ["Биз маалыматыңызды төмөнкүлөр үчүн колдонобуз:"],
      list: [
        "Аккаунтуңузду түзүү, башкаруу жана ага кирүүгө мүмкүнчүлүк берүү.",
        "Профилиңизди жана долбоорлоруңузду башка колдонуучуларга көрсөтүү.",
        "Арыздарды, эскертмелерди жана командалардын чаттарындагы билдирүүлөрдү жеткирүү.",
        "Спамдын, кыянаттыктын жана алдамчылыктын алдын алуу, платформанын коопсуздугун камсыз кылуу.",
      ],
    },
    {
      id: "sharing",
      title: "Башкалар эмнени көрөт",
      paragraphs: [
        "Атыңыз, аватарыңыз, өзүңүз жөнүндө маалымат, жашаган жериңиз, көндүмдөрүңүз, шилтемелериңиз жана долбоорлоруңуз TeamFinder'дин башка колдонуучуларына көрүнөт. Email'иңиз эч качан ачык көрсөтүлбөйт. Команда чатындагы билдирүүлөрдү ошол команданын мүчөлөрү гана көрөт.",
        "Биз жеке маалыматыңызды сатпайбыз. Маалыматты TeamFinder'дин иштешине жардам берген кызмат көрсөтүүчүлөргө гана (мисалы, хостинг жана маалымат базасы) жана сервистин иштеши үчүн керектүү көлөмдө гана беребиз.",
      ],
    },
    {
      id: "storage",
      title: "Сактоо жана коопсуздук",
      paragraphs: [
        "Маалыматыңыз биздин маалымат базасын камсыз кылуучуда сакталат. Аны коргоо үчүн шифрленген байланышты, сырсөздөрдү хештөөнү жана кирүүнү көзөмөлдөөнү колдонобуз. Эч бир онлайн-сервис толук коопсуздукка кепилдик бере албайт, ошондуктан бекем жана кайталангыс сырсөз колдонуңуз.",
      ],
    },
    {
      id: "your-rights",
      title: "Сиздин укуктарыңыз жана мүмкүнчүлүктөрүңүз",
      paragraphs: ["Каалаган убакта сиз:"],
      list: [
        "Жөндөөлөрдөн профиль маалыматын көрүп, өзгөртө аласыз.",
        "Арыздарды кайтарып алып, долбоорлордун командаларынан чыга аласыз.",
        "Аккаунтуңузду өчүрө аласыз — аны менен кошо профиль, долбоорлор жана арыздар өчүрүлөт.",
        "Биз менен байланышып, маалыматыңыздын көчүрмөсүн сурай аласыз.",
      ],
    },
    {
      id: "cookies",
      title: "Cookie файлдары",
      paragraphs: [
        "Биз аккаунтта калышыңыз жана сервистин коопсуздугу үчүн керектүү зарыл cookie файлдарын гана колдонобуз. Жарнамалык cookie колдонбойбуз.",
      ],
    },
    {
      id: "changes",
      title: "Саясаттын өзгөрүшү",
      paragraphs: [
        "TeamFinder өнүккөн сайын бул саясатты жаңылап турушубуз мүмкүн. Өзгөртүүлөр олуттуу болсо, алар күчүнө кирерден мурун платформада кабарлайбыз.",
      ],
    },
  ],
};

const termsKy: LegalDocument = {
  title: "Колдонуу шарттары",
  updated: "2026-жылдын 27-сентябры",
  intro:
    "Бул шарттар TeamFinder'ди — команда мүчөлөрүн табуу жана долбоорлорго кошулуу платформасын колдонууну жөнгө салат. Аккаунт түзүү же платформаны колдонуу менен сиз бул шарттарга макул болосуз.",
  sections: [
    {
      id: "account",
      title: "Сиздин аккаунтуңуз",
      paragraphs: [
        "Аккаунт түзүп жатканда чын маалымат көрсөтүп, кирүү маалыматыңызды коопсуз сактаңыз. Аккаунтуңуздагы бардык аракеттер үчүн сиз жооптуусуз. Бир адамдын бир гана аккаунту болушу мүмкүн.",
      ],
    },
    {
      id: "using-teamfinder",
      title: "TeamFinder'ди колдонуу",
      paragraphs: [
        "Ар бир колдонуучу кошула турган долбоорлорду издей алат жана катышуучу табуу үчүн өз долбоорун түзө алат. Командага кимди алууну долбоордун ээси чечет: арыз жөнөтүү анын кабыл алынарына кепилдик бербейт.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Уруксат берилген колдонуу",
      paragraphs: ["TeamFinder'ди колдонуп жатып, сиз төмөнкүлөрдү жасабоого милдеттенесиз:"],
      list: [
        "Жалган, адаштыруучу же мыйзамсыз маалымат жарыялоо же башка адамдардын атынан чыгуу.",
        "Башка колдонуучуларды кордоо, коркутуу же басмырлоо.",
        "Спам, суралбаган жарнама же массалык билдирүүлөрдү жөнөтүү.",
        "Алдамчы долбоорлорду жарыялоо же командага кошулуу үчүн акы талап кылуу.",
        "Башкалардын аккаунттарына кирүүгө аракет кылуу, коргоону бузуу же сервисти ашыкча жүктөө.",
      ],
    },
    {
      id: "content",
      title: "Сиздин контентиңиз",
      paragraphs: [
        "Сиз жарыялаган нерселердин баары — профиль, долбоорлордун сүрөттөмөлөрү жана билдирүүлөр — сизге таандык бойдон калат. Платформа иштеши үчүн TeamFinder'ге бул контентти сактоого жана көрсөтүүгө уруксат бересиз. Жарыялаган нерселериңиз үчүн өзүңүз жооптуусуз.",
      ],
    },
    {
      id: "projects-and-teams",
      title: "Долбоорлор жана командалар",
      paragraphs: [
        "TeamFinder адамдарга бири-бирин табууга жардам берет, бирок колдонуучулардын ортосундагы келишимдердин тарабы болуп саналбайт. Кызматташуунун шарттарын — ролдорду, иштин натыйжасына укуктарды, акы төлөөнү же үлүштү — команда мүчөлөрү түздөн-түз макулдашышат. Аларды иш башталганга чейин жазуу жүзүндө бекитүүнү сунуштайбыз.",
      ],
    },
    {
      id: "termination",
      title: "Бөгөттөө жана колдонууну токтотуу",
      paragraphs: [
        "Бул шарттарды бузган контентти өчүрүп, аккаунттарды бөгөттөшүбүз мүмкүн. Сиз каалаган убакта TeamFinder'ди колдонууну токтотуп, аккаунтуңузду өчүрө аласыз.",
      ],
    },
    {
      id: "disclaimer",
      title: "Кепилдиктен баш тартуу",
      paragraphs: [
        "TeamFinder «кандай болсо, ошондой» берилет. Сервистин жеткиликтүү жана коопсуз болушу үчүн аракет кылабыз, бирок ал ар дайым катасыз жана үзгүлтүксүз иштей турганына кепилдик бере албайбыз жана башка колдонуучулардын аракеттери үчүн жооп бербейбиз.",
      ],
    },
    {
      id: "changes",
      title: "Шарттардын өзгөрүшү",
      paragraphs: [
        "Бул шарттарды мезгил-мезгили менен жаңылап турушубуз мүмкүн. Өзгөртүүлөр олуттуу болсо, платформада кабарлайбыз. Өзгөртүүлөрдөн кийин TeamFinder'ди колдонууну улантсаңыз, жаңыланган шарттарды кабыл алган болосуз.",
      ],
    },
  ],
};

export const legalDocuments: Record<Locale, { privacy: LegalDocument; terms: LegalDocument }> = {
  en: { privacy: privacyEn, terms: termsEn },
  ru: { privacy: privacyRu, terms: termsRu },
  ky: { privacy: privacyKy, terms: termsKy },
};
