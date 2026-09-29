// SVG-иконки из макета. size задаёт ширину и высоту, цвет берётся из currentColor
type IconProps = { size?: number; className?: string };

export const SearchIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const BellIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <path
      d="M10 2a6 6 0 00-6 6v2l-1.5 2.5A1 1 0 003.5 14h13a1 1 0 00.866-1.5L16 10V8a6 6 0 00-6-6z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M8 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const ChevronDownIcon = ({ size = 12, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const MenuIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CloseIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M5 5L15 15M5 15L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const MoreIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="3" r="1.2" fill="currentColor" />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    <circle cx="8" cy="13" r="1.2" fill="currentColor" />
  </svg>
);

export const LogoMarkIcon = ({ size = 18, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
    <circle cx="6" cy="6" r="3" fill="white" opacity="0.9" />
    <circle cx="12" cy="6" r="3" fill="white" opacity="0.6" />
    <circle cx="9" cy="12" r="3" fill="white" opacity="0.75" />
  </svg>
);

// Цветной логотип Google (официальные цвета)
export const GoogleIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export const EyeIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const EyeOffIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M6.6 3.7C7 3.6 7.5 3.5 8 3.5c4 0 6.5 4.5 6.5 4.5s-.6 1.1-1.7 2.2M4.2 4.9C2.5 6.1 1.5 8 1.5 8S4 12.5 8 12.5c1.3 0 2.4-.5 3.3-1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const UserIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.75 13.5c.8-2.3 2.8-3.5 5.25-3.5s4.45 1.2 5.25 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SettingsIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const LogoutIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M6 2.5H3.5a1 1 0 00-1 1v9a1 1 0 001 1H6M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChatIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M3.5 4.5a1 1 0 011-1h11a1 1 0 011 1v8a1 1 0 01-1 1H8l-3.5 3v-3h0a1 1 0 01-1-1v-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const SendIcon = ({ size = 18, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M3 10l14-6.5L12.5 17 10 11 3 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const ArrowLeftIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UsersIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="7.5" cy="7" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 16c.6-2.4 2.6-3.75 5-3.75s4.4 1.35 5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 4.5a2.75 2.75 0 010 5M14.5 12.5c1.4.5 2.5 1.7 3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SunIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.3 4.3l1.1 1.1M14.6 14.6l1.1 1.1M4.3 15.7l1.1-1.1M14.6 5.4l1.1-1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const MoonIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M16.5 12.2A6.5 6.5 0 017.8 3.5a6.5 6.5 0 108.7 8.7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const MonitorIcon = ({ size = 20, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 17h6M10 13.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PaletteIcon = ({ size = 16, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 1.75a6.25 6.25 0 100 12.5c.9 0 1.4-.6 1.4-1.3 0-.4-.2-.7-.4-1-.2-.2-.3-.5-.3-.8 0-.7.6-1.2 1.3-1.2h1.5a2.8 2.8 0 002.8-2.8c0-2.9-2.8-5.4-6.3-5.4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="4.75" cy="7.5" r="1" fill="currentColor" />
    <circle cx="7" cy="4.75" r="1" fill="currentColor" />
    <circle cx="10.25" cy="5" r="1" fill="currentColor" />
  </svg>
);
