
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SalonInfo = {
  prenom: string;
  nomSalon: string;
};

export default function WelcomeBanner() {
  const pathname = usePathname();
  const [info, setInfo] = useState<SalonInfo | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: { user } } =
        await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setInfo(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("prenom, salon_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!active || !profile?.salon_id) {
        setInfo(null);
        return;
      }

      const { data: salon } = await supabase
        .from("salons")
        .select("nom_salon")
        .eq("id", profile.salon_id)
        .maybeSingle();

      if (active && salon) {
        setInfo({
          prenom: profile.prenom ?? "",
          nomSalon: salon.nom_salon,
        });
      }
    }

    load();

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) setInfo(null);
      });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  // Pas de bandeau pour les visiteurs non connectés.
  if (!info) return null;

  return (
    <section className="welcomeBanner">
      <div className="welcomeText">
        <span className="welcomeLabel">
          ESPACE PROFESSIONNEL
        </span>

        <h2>
          Bienvenue{info.prenom
            ? ` ${info.prenom}`
            : ""} !
        </h2>

        <strong>{info.nomSalon}</strong>

        <p>
          Merci pour votre confiance.
          Retrouvez vos produits et préparez
          vos commandes.
        </p>
      </div>

      <div className="welcomeActions">
        <Link href="/panier">
          MON PANIER →
        </Link>

        <small>
          Historique des commandes :
          prochainement
        </small>
      </div>
    </section>
  );
}
