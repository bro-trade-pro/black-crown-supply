# Comptes administrateurs V2

Deux comptes distincts à provisionner dans Supabase Auth :

- Florian : flo.blackcrownsup@gmail.com
- Benoît : benoit.lemegre@gmail.com

## Sécurité et activation
- Les comptes ne sont **pas encore créés**. Création via Supabase Auth avec invitation ou réinitialisation de mot de passe sécurisée.
- Ne jamais stocker de mots de passe, clés de service ou jetons dans GitHub.
- Attribuer les rôles admin via mécanisme vérifié côté serveur (table de rôles protégée / claims validés), pas via un champ modifiable par l'utilisateur.
- Les comptes clients et commandes actuels sont des données de test et peuvent être purgés, après vérification du projet cible ; conserver les produits et leur structure.
- Vérifier que les deux admins peuvent se connecter avant de supprimer les comptes de test.
