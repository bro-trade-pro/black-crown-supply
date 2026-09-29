
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [salon, setSalon] = useState<string | null>(null);
  const [prenom, setPrenom] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSalon() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setConnected(false);
        setSalon(null);
        setPrenom(null);
        return;
      }

      setConnected(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("prenom, salon_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!active || !profile) return;

      setPrenom(profile.prenom);

      if (profile.salon_id) {
        const { data: salonData } = await supabase
          .from("salons")
          .select("nom_salon")
          .eq("id", profile.salon_id)
          .maybeSingle();

        if (active) {
          setSalon(salonData?.nom_salon ?? null);
        }
      }
    }

    loadSalon();

    const { data: listener } =
      supabase.auth.onAuthStateChange(() => {
        // Évite d'interroger Supabase directement
        // dans le callback d'authentification.
        setConnected(false);
        setSalon(null);
        setPrenom(null);
        // La connexion redirige vers /panier :
        // le changement de page relance loadSalon.
      });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Déconnexion impossible. Réessaie.");
      return;
    }

    setConnected(false);
    setSalon(null);
    setPrenom(null);
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <Link href="/" className="brand"
        style={{ textDecoration: "none" }}>
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
        <Link href="/panier"
          style={pathname === "/panier"
            ? { color: "#c8a75b" }
            : undefined}>
          Mon panier
        </Link>
      </nav>

      <div className="pro">
        <span>ESPACE PRO</span>

        {connected ? (
          <div style={{ marginTop: 14 }}>
            <div style={{
              color: "#c8a75b",
              fontSize: 13,
              lineHeight: 1.7
            }}>
              Bienvenue{prenom ? ` ${prenom}` : ""} !
            </div>

            {salon && (
              <strong style={{
                display: "block",
                color: "#f4efe4",
                fontSize: 15,
                margin: "8px 0 16px"
              }}>
                {salon}
              </strong>
            )}

            <button
              type="button"
              className="sidebarAuthButton"
              onClick={logout}
              style={{ width: "100%", cursor: "pointer" }}
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <>
            <Link href="/connexion"
              className="sidebarAuthButton">
              Connexion salon
            </Link>
            <Link href="/inscription"
              className="sidebarSignupLink">
              Créer un compte pro
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
