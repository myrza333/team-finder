import Link from "next/link";
import { legalDocuments } from "@/data/legal";
import { getI18n } from "@/i18n/server";
import { rich } from "@/i18n/rich";
import scss from "./LegalPage.module.scss";

// Один шаблон для Privacy Policy и Terms of Service; внизу — ссылка на второй документ
const LegalPage = async ({ kind }: { kind: "privacy" | "terms" }) => {
  const { t, locale } = await getI18n();
  const document = legalDocuments[locale][kind];
  const related = kind === "privacy" ? { label: t.meta.terms, href: "/terms" } : { label: t.meta.privacy, href: "/privacy" };
  return (
    <div className={scss.page}>
      <header className={scss.hero}>
        <span className={scss.badge}>{t.legal.badge}</span>
        <h1 className={scss.title}>{document.title}</h1>
        <p className={scss.updated}>{t.legal.updated(document.updated)}</p>
        <p className={scss.intro}>{document.intro}</p>
      </header>

      <div className={scss.layout}>
        <nav className={scss.toc} aria-label={t.legal.onThisPage}>
          <p className={scss.tocTitle}>{t.legal.onThisPage}</p>
          <ol className={scss.tocList}>
            {document.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={scss.tocLink}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className={scss.content}>
          {document.sections.map((s, i) => (
            <section key={s.id} id={s.id} className={scss.section}>
              <h2 className={scss.sectionTitle}>
                <span className={scss.number}>{i + 1}.</span> {s.title}
              </h2>
              {s.paragraphs.map((p) => (
                <p key={p} className={scss.paragraph}>
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className={scss.list}>
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className={scss.contact}>
            <p className={scss.contactTitle}>{t.legal.questions}</p>
            <p className={scss.paragraph}>
              {rich(t.legal.contact, {
                email: <a href="mailto:support@teamfinder.app">support@teamfinder.app</a>,
                related: <Link href={related.href}>{related.label}</Link>,
              })}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default LegalPage;
