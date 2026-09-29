// Моки чатов команд. Потом: история — GET /api/chats/:projectId/messages, новые — через WebSocket
import type { ChatMessage, Project } from "@/types";
import { currentUser, getProjectById, projects, users } from "./mock";

const [timur, aida, bek, , daniyar] = users;

// Кто сейчас онлайн (потом — из WebSocket)
export const onlineUserIds = new Set(["a0000000-0000-4000-8000-000000000001", "a0000000-0000-4000-8000-000000000002", "a0000000-0000-4000-8000-000000000005"]);

const system = (id: string, text: string, day: string, time: string): ChatMessage => ({
  id,
  author: null,
  text,
  day,
  time,
});

export const chatMessages: Record<string, ChatMessage[]> = {
  // AI Study Platform — переписка из ТЗ
  "b0000000-0000-4000-8000-000000000001": [
    system("1-1", "Timur Akmatov created the project", "Sep 20", "09:12"),
    system("1-2", "Aida Bekova joined the team", "Sep 21", "14:30"),
    system("1-3", "Bek Osorov joined the team", "Yesterday", "11:05"),
    { id: "1-4", author: timur, text: "Всем привет 👋", day: "Today", time: "10:00" },
    { id: "1-5", author: aida, text: "Привет! Я займусь дизайном", day: "Today", time: "10:02" },
    { id: "1-6", author: bek, text: "Я тогда беру backend", day: "Today", time: "10:05" },
    { id: "1-7", author: timur, text: "Отлично, тогда я за frontend", day: "Today", time: "10:07" },
    { id: "1-8", author: aida, text: "Начну с wireframes сегодня вечером", day: "Today", time: "10:10" },
    { id: "1-9", author: aida, text: "Скину ссылку на Figma сюда, как будет готово", day: "Today", time: "10:11" },
  ],
  // LearnFlow
  "b0000000-0000-4000-8000-000000000006": [
    system("6-1", "Timur Akmatov created the project", "Sep 12", "16:40"),
    system("6-2", "Aida Bekova joined the team", "Sep 14", "10:15"),
    { id: "6-3", author: aida, text: "I looked through the course structure — looks great!", day: "Yesterday", time: "18:20" },
    { id: "6-4", author: aida, text: "Can we add live sessions to the MVP, or is that phase 2?", day: "Yesterday", time: "18:21" },
  ],
  // HealthMate — здесь Timur участник, владелец Bek
  "b0000000-0000-4000-8000-000000000004": [
    system("4-1", "Bek Osorov created the project", "Sep 5", "12:00"),
    system("4-2", "Daniyar Seitov joined the team", "Sep 9", "09:30"),
    system("4-3", "Timur Akmatov joined the team", "Sep 15", "17:45"),
    { id: "4-4", author: bek, text: "Welcome, Timur! Let's sync tomorrow at 11:00.", day: "Sep 15", time: "17:50" },
    { id: "4-5", author: daniyar, text: "I've pushed the first version of the model API.", day: "Yesterday", time: "20:14" },
    { id: "4-6", author: timur, text: "Nice, I'll connect the mobile screens to it 👍", day: "Yesterday", time: "20:31" },
  ],
};

// Непрочитанные (потом — с сервера)
export const unreadCounts: Record<string, number> = { "b0000000-0000-4000-8000-000000000006": 2 };

// Чаты текущего пользователя = проекты, где он в команде
export const getMyChats = (): Project[] =>
  projects.filter((p) => p.members.some((m) => m.id === currentUser.id));

export const isChatMember = (projectId: string) => {
  const project = getProjectById(projectId);
  return Boolean(project?.members.some((m) => m.id === currentUser.id));
};
