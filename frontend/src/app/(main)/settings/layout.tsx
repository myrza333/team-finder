import SettingsNav from "@/components/pages/settings/SettingsNav";
import scss from "@/components/pages/settings/Settings.module.scss";

// Общий каркас всех разделов настроек: заголовок + меню слева + контент
const SettingsLayout = ({ children }: LayoutProps<"/settings">) => (
  <div className={scss.page}>
    <h1 className={scss.title}>Settings</h1>
    <div className={scss.layout}>
      <SettingsNav />
      <div className={scss.content}>{children}</div>
    </div>
  </div>
);

export default SettingsLayout;
