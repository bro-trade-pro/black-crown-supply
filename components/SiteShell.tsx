
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import WelcomeBanner from "@/components/WelcomeBanner";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Administration : aucun menu ni bandeau commercial.
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#0c0b09",
          color: "#f4efe4",
        }}
      >
        {children}
      </div>
    );
  }

  // Toutes les autres pages conservent
  // exactement leur habillage habituel.
  return (
    <div className="siteLayout">
      <Sidebar />

      <div className="siteMain">
        <WelcomeBanner />
        {children}
      </div>
    </div>
  );
}
