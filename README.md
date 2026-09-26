# Save the Date — Sophie & Mathieu

Site du mariage du 23 octobre 2027 au Domaine de Fourniol (Septfonds).

## Activer le formulaire RSVP

Le site est statique (GitHub Pages) : les réponses sont envoyées à
[Formspree](https://formspree.io), qui les transmet par e-mail et les garde
dans un tableau de bord (offre gratuite : 50 réponses par mois).

1. Créez un compte sur formspree.io, puis **New form**.
2. Copiez l'adresse du formulaire, du type `https://formspree.io/f/abcdwxyz`.
3. Collez-la dans `script.js`, en haut du fichier :
   `const RSVP_ENDPOINT = "https://formspree.io/f/abcdwxyz";`

Tant que cette adresse est vide, le formulaire affiche aux invités que les
réponses ne sont pas encore ouvertes.

## Réglages utiles (`script.js`)

- `WEDDING_DATE` : date et heure de fin du compte à rebours.
