import Link from "next/link";
import Logo from "@/components/ui/Logo/Logo";
import { GoogleIcon, LogoMarkIcon } from "@/components/ui/Icons";
import { authErrorMessages, googleAuthUrl } from "@/lib/api";
import scss from "./Auth.module.scss";

type AuthCardProps = {
  title: string;
  subtitle: string;
  googleLabel: string;
  switchText: string;
  switchLink: { label: string; href: string };
  next: string;
  error?: string;
  children: React.ReactNode;
};

const perks = [
  "Post your idea and find teammates by skills",
  "Join projects that match your stack",
  "Chat with your team in one place",
];

const avatars = ["Aida", "Bek", "Timur", "Kamila"];

// Каркас Login и Register: слева брендовая панель (только на широких экранах), справа форма
const AuthCard = ({ title, subtitle, googleLabel, switchText, switchLink, next, error, children }: AuthCardProps) => (
  <div className={scss.page}>
    <aside className={scss.brand}>
      <Link href="/" className={scss.brandLogo}>
        <span className={scss.brandMark}>
          <LogoMarkIcon />
        </span>
        TeamFinder
      </Link>

      <div className={scss.brandContent}>
        <h2 className={scss.brandTitle}>Find your team. Build what matters.</h2>
        <ul className={scss.perks}>
          {perks.map((perk) => (
            <li key={perk}>
              <span className={scss.check} aria-hidden>
                ✓
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className={scss.social}>
        <div className={scss.socialAvatars}>
          {avatars.map((seed) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={seed} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt="" />
          ))}
        </div>
        <p>Developers, designers and creators are already building together.</p>
      </div>
    </aside>

    <main className={scss.formSide}>
      <div className={scss.formWrap}>
        <div className={scss.mobileLogo}>
          <Logo size="sm" />
        </div>

        <h1 className={scss.title}>{title}</h1>
        <p className={scss.subtitle}>{subtitle}</p>

        {error && authErrorMessages[error] && (
          <p className={scss.formError} role="alert">
            {authErrorMessages[error]}
          </p>
        )}

        {children}

        <div className={scss.divider}>
          <span>or</span>
        </div>

        <a href={googleAuthUrl(next)} className={scss.google}>
          <GoogleIcon />
          {googleLabel}
        </a>

        <p className={scss.switch}>
          {switchText} <Link href={switchLink.href}>{switchLink.label}</Link>
        </p>

        <p className={scss.legal}>
          By continuing, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  </div>
);

export default AuthCard;
