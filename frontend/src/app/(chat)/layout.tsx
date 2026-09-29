import Header from "@/components/layout/Header/Header";

// Каркас мессенджера: хедер есть, футера нет — чат занимает всю высоту экрана
const ChatLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main>{children}</main>
  </>
);

export default ChatLayout;
