import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.scss";
import Providers from "./providers";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "TeamFinder — Find your team",
    template: "%s · TeamFinder",
  },
  description: "Find developers, designers and creators for your next project.",
};

// Корневой layout: только шрифты, тема и провайдеры.
// Хедер и футер — в (main)/layout.tsx, у страниц входа (auth) их нет.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Выбранная тема приходит из cookie, поэтому HTML сразу отрисовывается в нужной теме
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable}`}
      data-theme={theme}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
