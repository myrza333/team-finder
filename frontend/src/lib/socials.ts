// Ссылки в профиле: у каждой сети свой адрес. В форме человек вводит только ник,
// в базе хранится полная ссылка. Бэкенд принимает ссылки только на "свой" домен (user.dto.ts)

export type SocialKey = "githubUrl" | "linkedinUrl" | "telegramUrl" | "instagramUrl" | "codewarsUrl" | "leetcodeUrl";

export type Social = {
  key: SocialKey;
  label: string;
  prefix: string; // как выглядит начало ссылки: "github.com/"
  // Старые/другие формы адреса, которые тоже понимаем при вставке ссылки целиком
  aliases?: string[];
};

export const socials: Social[] = [
  { key: "githubUrl", label: "GitHub", prefix: "github.com/" },
  { key: "linkedinUrl", label: "LinkedIn", prefix: "linkedin.com/in/" },
  { key: "telegramUrl", label: "Telegram", prefix: "t.me/" },
  { key: "instagramUrl", label: "Instagram", prefix: "instagram.com/" },
  { key: "codewarsUrl", label: "Codewars", prefix: "codewars.com/users/" },
  { key: "leetcodeUrl", label: "LeetCode", prefix: "leetcode.com/u/", aliases: ["leetcode.com/"] },
];

// "https://www.github.com/timur/" или "@timur" → "timur". Можно вставить ссылку целиком — останется ник
export const toHandle = (social: Social, value?: string | null) => {
  let v = (value ?? "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  for (const start of [social.prefix, ...(social.aliases ?? [])]) {
    if (v.toLowerCase().startsWith(start)) {
      v = v.slice(start.length);
      break;
    }
  }
  return v.replace(/^@/, "").replace(/[/?#].*$/, "");
};

// Ник → полная ссылка; пустой ник — ссылку убрать
export const toUrl = (social: Social, handle: string) => (handle ? `https://${social.prefix}${handle}` : "");
