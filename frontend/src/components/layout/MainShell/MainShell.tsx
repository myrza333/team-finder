import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import scss from "./MainShell.module.scss";

// Каркас обычных страниц: хедер + контент + футер
const MainShell = ({ children }: { children: React.ReactNode }) => (
  <div className={scss.shell}>
    <Header />
    <main className={scss.main}>{children}</main>
    <Footer />
  </div>
);

export default MainShell;
