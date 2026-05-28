import { ReactNode } from "react";
import TopBar from "./TopBar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <TopBar />
      <main className="main">{children}</main>
    </div>
  );
}
