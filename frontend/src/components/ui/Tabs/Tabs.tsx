import scss from "./Tabs.module.scss";

type Tab<T extends string> = { value: T; label: string; count?: number };

type TabsProps<T extends string> = {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Вкладки с подчёркиванием и необязательным счётчиком: "Received 3 | Sent"
const Tabs = <T extends string>({ tabs, value, onChange }: TabsProps<T>) => (
  <div className={scss.tabs} role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={tab.value === value}
        className={`${scss.tab} ${tab.value === value ? scss.active : ""}`}
        onClick={() => onChange(tab.value)}
      >
        {tab.label}
        {tab.count !== undefined && tab.count > 0 && <span className={scss.count}>{tab.count}</span>}
      </button>
    ))}
  </div>
);

export default Tabs;
