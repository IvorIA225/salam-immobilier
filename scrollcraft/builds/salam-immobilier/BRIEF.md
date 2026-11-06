# BRIEF · Salam Immobilier Bouaké

> **Self-authored under explicit creative delegation.** Le client a répondu
> « Je vous délègue la direction créative, faites au mieux ». Les réponses
> verbatim sont marquées *(client)*, le reste est une décision d'auteur.

## Faits vérifiés (sources publiques)

- Nom : Salam Immobilier Bouaké (SIB). Fiche Google Maps « Salam Immobilier BOUAKE », coordonnées 7.680131, -5.0867008.
- Adresse : premier immeuble à droite, Cité des Impôts, sur la voie menant au Château, Bouaké, Côte d'Ivoire. 03 BP 361 Bouaké 03. (goafricaonline, cybo)
- Téléphones publiés : +225 01 42 20 09 09 et +225 07 67 35 90 47. **Le numéro WhatsApp exact reste à confirmer par le client.**
- Activités publiées : lotissement et aménagement foncier, construction et réhabilitation, gestion immobilière.
- Aucun chiffre réel fourni *(client : « Non, n'affichez aucun chiffre inventé »)*. Donc : aucun compteur, aucune statistique, aucun avis client inventé.

## Les huit sujets

1. **Ambiance (auteur).** Chaleureux, solide, rassurant, cinématique. Références : la lumière de fin d'après-midi sur la latérite rouge, une maquette d'architecte sur une table, un dossier foncier bien rangé.
2. **Parcours (auteur, à partir des services choisis par le client).** Bouaké et une maison qui pourrait être la vôtre → les vraies peurs de l'achat foncier → un plan de lotissement qui devient une maison → les cinq services → les quatre vérifications avant d'acheter → passer à l'agence ou écrire sur WhatsApp.
3. **Énergie.** Calme et lumineux au début, très calme et sombre sur les doutes, le plus intense sur la maquette 3D, ouvert et riche sur les services, posé et clair sur les papiers, chaleureux et décidé à la fin.
4. **Sentiment par étape et moment à retenir.** Voir la courbe ci-dessous.
5. **Ce que ce site fait qu'aucun autre ne fait.** En faisant défiler, un plan de lotissement vu du ciel bascule en perspective, un lot se borne, puis une maison sort de terre et s'allume au crépuscule. Une règle de niveau d'architecte sur le côté mesure la hauteur pendant que la maison monte.
6. **Distance au premium-minimal.** Premium chaleureux plutôt que luxe noir. Fond vert forêt très sombre, os, accent latérite. Pas de crème-et-laiton.
7. **Monde unique ou scènes distinctes.** Scènes distinctes. Une agence immobilière n'est pas un voyage continu.
8. **Ressources existantes** *(client : « Rien : générez des images photoréalistes »)*. Pas de clé kie.ai : pas de vidéo générée. Photos générées + une vraie scène WebGL pour la 3D.

## Action unique

*(client)* « Contacter l'agence sur WhatsApp ». Libellé unique partout : **Écrire sur WhatsApp**.

## Services mis en avant

*(client)* Vente de terrains / lotissements, vente de maisons, location de maisons et appartements, gestion locative, conseil et démarches (ACD, papiers fonciers). La construction n'est pas mise en avant.

## Grammaire : « Élévation » (nouvelle grammaire nommée)

- **Unité** : un niveau du projet immobilier, du sol à la remise des clés.
- **Navigation** : barre minimale (marque + Écrire sur WhatsApp) **plus** une règle de niveau verticale sur le bord gauche (desktop), avec le symbole de cote d'architecte qui monte au fil du scroll et des repères cliquables. Sur mobile, la règle disparaît et un bouton WhatsApp fixe en bas la remplace.
- **Héros** : composition photographique en plans séparés (ciel, mot « Bouaké », villa, feuillage, brume).
- **Fin** : un poste de contact où le choix du visiteur (acheter, louer, confier, papiers) construit le message WhatsApp, avec la carte et l'adresse réelles.
- **Interdits** : vidéo scrub plein écran, grilles de cartes identiques, chiffres décoratifs, copie centrée partout, plus d'un rail horizontal, spotlight décoratif.

Pourquoi pas les autres : filmic one-shot (pas de vidéo et le parcours a de vraies coupures), éditorial (le public veut agir vite, pas lire un dossier), live surface (pas de logiciel), monde continu (exige une vidéo continue), poster typographique (l'immobilier se vend avec des images), galerie (pas de vraies annonces à montrer), split stage (pas de vrai avant/après), cutlist (trop nerveux pour un achat de confiance).

## Courbe de sentiments (écrite avant les actes)

| Acte | Sentiment | Ce qui le provoque |
|---|---|---|
| 1 Héros | Envie, reconnaissance | Bouaké en lumière dorée, une villa, le feuillage qui s'écarte quand on avance |
| 2 Doutes | Inquiétude honnête, puis soulagement | Les vraies questions d'un acheteur, en grosse typo sur fond sombre, sans image |
| 3 Maquette | **Émerveillement, confiance** (pic) | Le plan vu du ciel bascule, le lot se borne, la maison monte et s'allume |
| 4 Services | Appétit, choix | Cinq services qui défilent sur le côté, photos, inclinaison au pointeur |
| 5 Papiers | Clarté, sérieux | Une feuille claire, quatre vérifications, chaque point tamponné au scroll |
| 6 Contact | Décision, chaleur | Je choisis ce que je veux, le message WhatsApp est prêt, la carte est là |

**Silence voulu** : l'acte 2 est volontairement sans image, c'est le calme avant la maquette. Ce n'est pas du scroll mort.

## Le pic

> « J'ai fait défiler et le plan du lotissement s'est transformé en vraie maison qui s'allumait le soir. »

Il vit dans l'acte 3, qui a la plus grande longueur de scroll de la page.

## Phrase à raconter

« C'est le site où tu vois ton terrain passer d'un plan à une maison allumée, juste en faisant défiler. »

## Partition

| Beat | Device | Pourquoi |
|---|---|---|
| Héros | `pin` court + parallax en plans (CSS sur `--sc-p`) + pointeur | La profondeur vient des plans séparés, pas d'une vidéo |
| Doutes | `flow` + `in` | Le calme typographique avant le pic |
| Maquette | `pin` long + WebGL piloté par `--sc-p` (signature) | Le moment à retenir |
| Services | `pan` + `tilt` | Le latéral se lit comme « plusieurs choix » |
| Papiers | `reveal` (fond clair, coupure nette) | Un tampon est un changement d'état |
| Contact | `flow` + interaction réelle | La page s'arrête et répond |

Longueur visée : environ 12 hauteurs d'écran sur 6 actes. Le pic (4,8) dépasse nettement le rail (3,4).

