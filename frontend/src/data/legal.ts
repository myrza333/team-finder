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

export const privacyPolicy: LegalDocument = {
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
        "Profile data: job title, bio, location, skills, GitHub and Telegram links.",
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
        "Your name, avatar, title, bio, location, skills, links and projects are public to other TeamFinder users. Your email address is never shown publicly. Team chat messages are visible only to members of that project team.",
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

export const termsOfService: LegalDocument = {
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
