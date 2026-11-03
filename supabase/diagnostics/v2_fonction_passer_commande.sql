-- Lecture seule : récupérer la définition réelle de la fonction de commande.
-- N'altère aucune donnée.
SELECT
  p.oid::regprocedure::text AS signature,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'passer_commande'
ORDER BY signature;