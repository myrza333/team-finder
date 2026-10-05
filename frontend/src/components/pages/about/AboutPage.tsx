import { ShieldCheck, Sparkles, Users } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import { getI18n } from "@/i18n/server";
import scss from "./AboutPage.module.scss";

// Иконки к "Что для нас важно" — по порядку: простота, открыто для всех, ваши данные
const valueIcons = [Sparkles, Users, ShieldCheck];

const AboutPage = async () => {
  const { t } = await getI18n();
  const a = t.about;

  return (
    <div className={scss.page}>
      <header className={scss.hero}>
        <span className={scss.badge}>{a.badge}</span>
        <h1 className={scss.title}>{a.title}</h1>
        <p className={scss.intro}>{a.intro}</p>
      </header>

      <section className={scss.section}>
        <h2 className={scss.sectionTitle}>{a.howTitle}</h2>
        <ol className={scss.steps}>
          {a.steps.map((step, i) => (
            <li key={step.title} className={scss.card}>
              <span className={scss.number}>{i + 1}</span>
              <h3 className={scss.cardTitle}>{step.title}</h3>
              <p className={scss.cardText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={scss.section}>
        <h2 className={scss.sectionTitle}>{a.valuesTitle}</h2>
        <ul className={scss.values}>
          {a.values.map((value, i) => {
            const Icon = valueIcons[i] ?? Sparkles;
            return (
              <li key={value.title} className={scss.card}>
                <span className={scss.icon}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className={scss.cardTitle}>{value.title}</h3>
                <p className={scss.cardText}>{value.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={scss.cta}>
        <h2 className={scss.ctaTitle}>{a.ctaTitle}</h2>
        <div className={scss.ctaActions}>
          <Button href="/projects" variant="outline" size="lg">
            {a.browse}
          </Button>
          <Button href="/projects/create" size="lg">
            {t.common.createProject}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
