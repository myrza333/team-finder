import { ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import SocialIcon from "@/components/ui/SocialIcon/SocialIcon";
import { getI18n } from "@/i18n/server";
import { contacts } from "@/lib/contacts";
import scss from "./HelpPage.module.scss";

// Частые вопросы: раскрываются на встроенном <details> — работает без JavaScript и с клавиатуры
const HelpPage = async () => {
  const { t } = await getI18n();
  const h = t.help;

  return (
    <div className={scss.page}>
      <header className={scss.hero}>
        <span className={scss.badge}>{h.badge}</span>
        <h1 className={scss.title}>{h.title}</h1>
        <p className={scss.intro}>{h.intro}</p>
      </header>

      {h.groups.map((group) => (
        <section key={group.title} className={scss.group}>
          <h2 className={scss.groupTitle}>{group.title}</h2>
          <div className={scss.items}>
            {group.items.map((item) => (
              <details key={item.q} className={scss.item}>
                <summary className={scss.question}>
                  <span>{item.q}</span>
                  <ChevronDown size={18} strokeWidth={1.75} className={scss.chevron} aria-hidden />
                </summary>
                <p className={scss.answer}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className={scss.contact}>
        <div>
          <p className={scss.contactTitle}>{h.contactTitle}</p>
          <p className={scss.contactText}>{h.contactText}</p>
        </div>
        <Button href={contacts.telegram} target="_blank" rel="noopener noreferrer">
          <SocialIcon social="telegramUrl" size={16} branded={false} />
          {h.contactButton}
        </Button>
      </section>
    </div>
  );
};

export default HelpPage;
