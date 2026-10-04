import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.scss";
import Providers from "./providers";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";
import { getI18n } from "@/i18n/server";

const inter = Inter({
  variable: "--font-inter",
  // cyrillic-ext — кыргызские ң, ө, ү
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.meta.title, template: "%s · TeamFinder" },
    description: t.meta.description,
  };
}

// Корневой layout: только шрифты, тема, язык и провайдеры.
// Хедер и футер — в (main)/layout.tsx, у страниц входа (auth) их нет.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Выбранные тема и язык приходят из cookie, поэтому HTML сразу отрисовывается как нужно
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  const { locale } = await getI18n();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jakarta.variable}`}
      data-theme={theme}
      suppressHydrationWarning
    >
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
