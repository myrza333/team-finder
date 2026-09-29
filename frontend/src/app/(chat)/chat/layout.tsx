import Chat from "@/components/chat/Chat";

// Chat живёт в layout: при переходе между /chat/1 и /chat/6 он не пересоздаётся,
// а открытый чат берёт из URL. Сами page.tsx ничего не рисуют.
const ChatSectionLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Chat />
    {children}
  </>
);

export default ChatSectionLayout;
