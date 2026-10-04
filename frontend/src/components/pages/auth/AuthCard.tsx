"use client";
import { Check } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo/Logo";
import { GoogleIcon, LogoMarkIcon } from "@/components/ui/Icons";
import { googleAuthUrl } from "@/lib/api";
import { useI18n } from "@/i18n/client";
import { rich } from "@/i18n/rich";
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

// Каркас Login и Register: слева брендовая панель (только на широких экранах), справа форма
const AuthCard = ({ title, subtitle, googleLabel, switchText, switchLink, next, error, children }: AuthCardProps) => {
  const { t } = useI18n();
  return (
    <div className={scss.page}>
      <aside className={scss.brand}>
        <Link href="/" className={scss.brandLogo}>
          <span className={scss.brandMark}>
            <LogoMarkIcon />
          </span>
          TeamFinder
        </Link>

        <div className={scss.brandContent}>
          <h2 className={scss.brandTitle}>{t.auth.brandTitle}</h2>
          <ul className={scss.perks}>
            {t.auth.perks.map((perk) => (
              <li key={perk}>
                <span className={scss.check} aria-hidden>
                  <Check size={12} strokeWidth={2.5} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className={scss.social}>
          <p>{t.auth.brandFooter}</p>
        </div>
      </aside>

      <main className={scss.formSide}>
        <div className={scss.formWrap}>
          <div className={scss.mobileLogo}>
            <Logo size="sm" />
          </div>

          <h1 className={scss.title}>{title}</h1>
          <p className={scss.subtitle}>{subtitle}</p>

          {error && t.auth.oauthErrors[error] && (
            <p className={scss.formError} role="alert">
              {t.auth.oauthErrors[error]}
            </p>
          )}

          {children}

          <div className={scss.divider}>
            <span>{t.auth.or}</span>
          </div>

          <a href={googleAuthUrl(next)} className={scss.google}>
            <GoogleIcon />
            {googleLabel}
          </a>

          <p className={scss.switch}>
            {switchText} <Link href={switchLink.href}>{switchLink.label}</Link>
          </p>

          <p className={scss.legal}>
            {rich(t.auth.legal, {
              terms: <Link href="/terms">{t.auth.termsLink}</Link>,
              privacy: <Link href="/privacy">{t.auth.privacyLink}</Link>,
            })}
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthCard;
