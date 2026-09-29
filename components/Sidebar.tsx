
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link
        href="/"
        className="brand"
        style={{ textDecoration: "none" }}
      >
        <div className="crown">♛</div>
        <strong>BLACK CROWN</strong>
        <span>SUPPLY</span>
        <small>WHOLESALE PRO</small>
      </Link>

      <nav>
        <Link href="/#accueil">Accueil</Link>
        <Link href="/#meches">Mèches</Link>
        <Link href="/#cosmetiques">Cosmétiques</Link>
        <Link href="/#avantages">Nos avantages</Link>
        <Link href="/#contact">Contact</Link>
        <Link
          href="/panier"
          style={
            pathname === "/panier"
              ? { color: "#c8a75b" }
              : undefined
          }
        >
          Mon panier
        </Link>
      </nav>

      <div className="pro">
        <span>ESPACE PRO</span>

        <Link
          href="/connexion"
          className="sidebarAuthButton"
        >
          Connexion salon
        </Link>

        <Link
          href="/inscription"
          className="sidebarSignupLink"
        >
          Créer un compte pro
        </Link>
      </div>
    </aside>
  );
}
