import Link from "next/link";
import type { LegalDocument } from "@/data/legal";
import scss from "./LegalPage.module.scss";

type LegalPageProps = {
  document: LegalDocument;
  // ссылка на второй документ внизу страницы (Privacy ↔ Terms)
  related: { label: string; href: string };
};

// Один шаблон для Privacy Policy и Terms of Service
const LegalPage = ({ document, related }: LegalPageProps) => (
  <div className={scss.page}>
    <header className={scss.hero}>
      <span className={scss.badge}>Legal</span>
      <h1 className={scss.title}>{document.title}</h1>
      <p className={scss.updated}>Last updated: {document.updated}</p>
      <p className={scss.intro}>{document.intro}</p>
    </header>

    <div className={scss.layout}>
      <nav className={scss.toc} aria-label="On this page">
        <p className={scss.tocTitle}>On this page</p>
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
          <p className={scss.contactTitle}>Questions?</p>
          <p className={scss.paragraph}>
            If anything here is unclear, contact us at{" "}
            <a href="mailto:support@teamfinder.app">support@teamfinder.app</a>. See also our{" "}
            <Link href={related.href}>{related.label}</Link>.
          </p>
        </div>
      </article>
    </div>
  </div>
);

export default LegalPage;
