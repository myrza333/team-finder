import SettingsNav from "@/components/pages/settings/SettingsNav";
import scss from "@/components/pages/settings/Settings.module.scss";
import { getI18n } from "@/i18n/server";

// Общий каркас всех разделов настроек: заголовок + меню слева + контент
const SettingsLayout = async ({ children }: LayoutProps<"/settings">) => {
  const { t } = await getI18n();
  return (
    <div className={scss.page}>
      <h1 className={scss.title}>{t.settings.title}</h1>
      <div className={scss.layout}>
        <SettingsNav />
        <div className={scss.content}>{children}</div>
      </div>
    </div>
  );
};

export default SettingsLayout;
