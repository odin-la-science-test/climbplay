# Document d'Exigences — Amélioration des Variations de Gameplay

## Introduction

Ce document définit les exigences pour améliorer la complexité et la difficulté du jeu d'escalade 3D en ajoutant des variations de gameplay. L'objectif est de rendre le jeu plus challengeant avec plus d'obstacles et de situations variées, tout en conservant exactement les mêmes mécaniques de jeu (drag-and-drop des membres).

Le système actuel comprend des types de prises basiques, un système de fatigue/stamina, et des modes de jeu (BLOC, VOIE, INFINI). Les nouvelles variations ajouteront des comportements spéciaux aux prises, des conditions environnementales, et des obstacles dynamiques pour créer une expérience plus riche et difficile.

## Glossaire

- **Game_System**: Le système principal du jeu d'escalade 3D
- **Hold**: Une prise d'escalade sur laquelle le joueur peut placer ses membres
- **Special_Hold**: Une prise avec des comportements ou propriétés spéciales
- **Environmental_Condition**: Une condition météorologique ou environnementale affectant le gameplay
- **Limb**: Un membre du grimpeur (main gauche, main droite, pied gauche, pied droit)
- **Stamina**: L'endurance du joueur (0-100)
- **Fatigue**: La fatigue accumulée dans les bras du joueur
- **Route_Generator**: Le système qui génère les parcours d'escalade
- **Overhang_Zone**: Une zone de dévers (surplomb) où le mur est incliné vers l'extérieur
- **Dynamic_Sequence**: Une séquence de mouvements obligatoires ou recommandés
- **Grip_Modifier**: Un modificateur affectant l'adhérence des prises

## Exigences

### Exigence 1: Prises Instables

**User Story:** En tant que joueur, je veux rencontrer des prises instables qui bougent ou se détachent, afin d'ajouter un élément d'imprévisibilité et de difficulté.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des prises de type UNSTABLE avec une probabilité basée sur la difficulté
2. WHEN un Limb est placé sur une prise UNSTABLE, THE Game_System SHALL déclencher un timer de stabilité
3. WHILE un Limb reste sur une prise UNSTABLE, THE Game_System SHALL augmenter progressivement le risque de détachement
4. IF une prise UNSTABLE se détache, THEN THE Game_System SHALL retirer la prise et forcer le Limb à se repositionner
5. THE Game_System SHALL afficher un indicateur visuel (tremblement, particules) sur les prises UNSTABLE

### Exigence 2: Prises Temporaires

**User Story:** En tant que joueur, je veux des prises qui disparaissent après un certain temps, afin de créer une pression temporelle et forcer des décisions rapides.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des prises de type TEMPORARY avec une durée de vie définie
2. WHEN une prise TEMPORARY est générée, THE Game_System SHALL afficher un timer visuel sur la prise
3. WHILE un Limb utilise une prise TEMPORARY, THE Game_System SHALL décrémenter le timer
4. IF le timer d'une prise TEMPORARY atteint zéro, THEN THE Game_System SHALL retirer la prise
5. IF un Limb est attaché à une prise TEMPORARY qui disparaît, THEN THE Game_System SHALL forcer le Limb à se repositionner

### Exigence 3: Prises Glissantes

**User Story:** En tant que joueur, je veux des prises glissantes qui augmentent la fatigue et réduisent l'adhérence, afin d'augmenter la difficulté technique.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des prises de type SLIPPERY avec un modificateur d'adhérence
2. WHEN un Limb est placé sur une prise SLIPPERY, THE Game_System SHALL augmenter le taux de fatigue de 50%
3. WHILE un Limb reste sur une prise SLIPPERY, THE Stamina SHALL diminuer 1.5 fois plus rapidement
4. THE Game_System SHALL afficher un effet visuel (brillance, gouttes) sur les prises SLIPPERY
5. WHERE la difficulté est supérieure à 5, THE Route_Generator SHALL augmenter la fréquence des prises SLIPPERY

### Exigence 4: Prises qui S'effritent

**User Story:** En tant que joueur, je veux des prises qui s'effritent progressivement à chaque utilisation, afin d'ajouter une dimension stratégique sur l'ordre des mouvements.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des prises de type CRUMBLING avec un compteur de durabilité
2. WHEN un Limb est placé sur une prise CRUMBLING, THE Game_System SHALL décrémenter le compteur de durabilité
3. WHILE le compteur de durabilité diminue, THE Game_System SHALL réduire la taille visuelle de la prise
4. IF le compteur de durabilité atteint zéro, THEN THE Game_System SHALL retirer la prise complètement
5. THE Game_System SHALL afficher des particules de poussière lors de l'effritement

### Exigence 5: Conditions Environnementales - Vent

**User Story:** En tant que joueur, je veux affronter des conditions de vent qui affectent la stabilité, afin d'ajouter un défi environnemental.

#### Critères d'Acceptation

1. WHERE le mode est VOIE ou INFINI, THE Game_System SHALL pouvoir activer une condition WIND
2. WHEN la condition WIND est active, THE Game_System SHALL appliquer une force latérale sur le grimpeur
3. WHILE la condition WIND est active, THE Stamina SHALL diminuer 20% plus rapidement
4. THE Game_System SHALL afficher des effets visuels de vent (particules, mouvement de caméra)
5. WHERE la difficulté est supérieure à 6, THE Game_System SHALL augmenter l'intensité du vent

### Exigence 6: Conditions Environnementales - Pluie

**User Story:** En tant que joueur, je veux grimper sous la pluie qui rend les prises glissantes, afin d'augmenter la difficulté globale.

#### Critères d'Acceptation

1. WHERE le mode est VOIE ou INFINI, THE Game_System SHALL pouvoir activer une condition RAIN
2. WHEN la condition RAIN est active, THE Game_System SHALL appliquer un modificateur de glissance à toutes les prises
3. WHILE la condition RAIN est active, THE Fatigue SHALL s'accumuler 30% plus rapidement
4. THE Game_System SHALL afficher des effets visuels de pluie (particules, texture mouillée)
5. WHEN la condition RAIN est active, THE Game_System SHALL réduire l'adhérence de toutes les prises de 25%

### Exigence 7: Conditions Environnementales - Chaleur

**User Story:** En tant que joueur, je veux grimper sous la chaleur qui épuise plus rapidement, afin de simuler des conditions difficiles.

#### Critères d'Acceptation

1. WHERE le mode est VOIE ou INFINI, THE Game_System SHALL pouvoir activer une condition HEAT
2. WHEN la condition HEAT est active, THE Stamina SHALL diminuer 40% plus rapidement
3. WHILE la condition HEAT est active, THE Game_System SHALL réduire l'efficacité du repos de 50%
4. THE Game_System SHALL afficher des effets visuels de chaleur (distorsion, teinte orangée)
5. WHEN la condition HEAT est active, THE Game_System SHALL augmenter le taux de fatigue des bras de 35%

### Exigence 8: Zones de Dévers Prononcées

**User Story:** En tant que joueur, je veux rencontrer des zones de dévers plus prononcées qui demandent plus de force, afin d'augmenter le défi physique.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des Overhang_Zone avec un angle de dévers configurable
2. WHEN le grimpeur entre dans une Overhang_Zone, THE Game_System SHALL augmenter le taux de fatigue de 100%
3. WHILE le grimpeur est dans une Overhang_Zone, THE Stamina SHALL diminuer 2 fois plus rapidement
4. THE Game_System SHALL afficher visuellement l'inclinaison du mur dans les Overhang_Zone
5. WHERE la difficulté est supérieure à 4, THE Route_Generator SHALL augmenter la fréquence et l'angle des Overhang_Zone

### Exigence 9: Séquences Dynamiques Obligatoires

**User Story:** En tant que joueur, je veux des séquences où je dois faire des mouvements dynamiques spécifiques, afin d'ajouter de la variété technique.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des Dynamic_Sequence avec des prises marquées comme obligatoires
2. WHEN une Dynamic_Sequence est présente, THE Game_System SHALL afficher un indicateur visuel sur les prises de la séquence
3. IF le joueur saute une prise obligatoire dans une Dynamic_Sequence, THEN THE Game_System SHALL appliquer une pénalité de stamina de 20 points
4. WHEN le joueur complète une Dynamic_Sequence correctement, THE Game_System SHALL accorder un bonus de 10 points de stamina
5. WHERE la difficulté est supérieure à 5, THE Route_Generator SHALL augmenter la fréquence des Dynamic_Sequence

### Exigence 10: Obstacles Physiques

**User Story:** En tant que joueur, je veux rencontrer des obstacles physiques comme des branches ou rochers qui bloquent certaines prises, afin d'ajouter de la complexité spatiale.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des obstacles physiques (branches, rochers saillants) sur le parcours
2. WHEN un obstacle est présent, THE Game_System SHALL bloquer l'accès à certaines prises dans la zone
3. IF le joueur tente de placer un Limb sur une prise bloquée, THEN THE Game_System SHALL rejeter le mouvement
4. THE Game_System SHALL afficher visuellement les obstacles avec des modèles 3D
5. WHERE la difficulté est supérieure à 3, THE Route_Generator SHALL augmenter la densité des obstacles

### Exigence 11: Limites de Temps sur Sections

**User Story:** En tant que joueur, je veux des sections avec limite de temps qui me forcent à grimper rapidement, afin d'ajouter de la pression et de la variété.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des sections avec une limite de temps définie
2. WHEN le grimpeur entre dans une section chronométrée, THE Game_System SHALL afficher un timer visible
3. WHILE le timer est actif, THE Game_System SHALL décrémenter le temps restant
4. IF le timer atteint zéro avant que le joueur sorte de la section, THEN THE Game_System SHALL appliquer une pénalité de 30 points de stamina
5. WHEN le joueur complète une section chronométrée à temps, THE Game_System SHALL accorder un bonus de 15 points de stamina

### Exigence 12: Prises Magnétiques

**User Story:** En tant que joueur, je veux des prises magnétiques qui attirent ou repoussent les membres, afin d'ajouter une mécanique unique et déroutante.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des prises de type MAGNETIC avec une polarité (attraction ou répulsion)
2. WHEN un Limb s'approche d'une prise MAGNETIC attractive, THE Game_System SHALL faciliter le placement (rayon de capture augmenté de 50%)
3. WHEN un Limb s'approche d'une prise MAGNETIC répulsive, THE Game_System SHALL rendre le placement plus difficile (rayon de capture réduit de 50%)
4. THE Game_System SHALL afficher un effet visuel (aura, particules) sur les prises MAGNETIC
5. WHERE la difficulté est supérieure à 6, THE Route_Generator SHALL augmenter la fréquence des prises MAGNETIC répulsives

### Exigence 13: Prises Chauffantes

**User Story:** En tant que joueur, je veux des prises chauffantes qui brûlent si on reste trop longtemps, afin de forcer des mouvements rapides.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des prises de type HOT avec un timer de tolérance
2. WHEN un Limb est placé sur une prise HOT, THE Game_System SHALL démarrer un timer de tolérance
3. WHILE un Limb reste sur une prise HOT au-delà du timer, THE Fatigue SHALL augmenter de 5 points par seconde
4. THE Game_System SHALL afficher un effet visuel (rougeoiement, particules de chaleur) sur les prises HOT
5. WHEN le timer de tolérance est dépassé, THE Game_System SHALL afficher un avertissement visuel

### Exigence 14: Zones de Brouillard

**User Story:** En tant que joueur, je veux des zones de brouillard qui réduisent la visibilité des prises, afin d'augmenter la difficulté de planification.

#### Critères d'Acceptation

1. WHERE le mode est VOIE ou INFINI, THE Route_Generator SHALL générer des zones de brouillard
2. WHEN le grimpeur entre dans une zone de brouillard, THE Game_System SHALL réduire la visibilité des prises de 70%
3. WHILE le grimpeur est dans une zone de brouillard, THE Game_System SHALL afficher un effet de brume
4. THE Game_System SHALL révéler progressivement les prises à mesure que le grimpeur s'approche (rayon de 2 mètres)
5. WHERE la difficulté est supérieure à 7, THE Route_Generator SHALL augmenter la densité et la hauteur des zones de brouillard

### Exigence 15: Prises Électriques

**User Story:** En tant que joueur, je veux des prises électriques qui donnent des chocs et drainent la stamina, afin d'ajouter un élément de risque/récompense.

#### Critères d'Acceptation

1. THE Route_Generator SHALL générer des prises de type ELECTRIC avec un cycle de charge
2. WHEN un Limb est placé sur une prise ELECTRIC pendant sa phase active, THE Stamina SHALL diminuer de 15 points instantanément
3. WHEN un Limb est placé sur une prise ELECTRIC pendant sa phase inactive, THE Game_System SHALL traiter la prise normalement
4. THE Game_System SHALL afficher un indicateur visuel (éclairs, pulsation) montrant le cycle de charge
5. WHERE la difficulté est supérieure à 8, THE Route_Generator SHALL réduire la durée de la phase inactive

### Exigence 16: Système de Configuration des Variations

**User Story:** En tant que joueur, je veux pouvoir configurer quelles variations sont actives, afin de personnaliser mon expérience de jeu.

#### Critères d'Acceptation

1. THE Game_System SHALL fournir une interface de configuration des variations dans le menu
2. WHEN le joueur accède à la configuration, THE Game_System SHALL afficher toutes les variations disponibles
3. THE Game_System SHALL permettre d'activer ou désactiver chaque type de variation individuellement
4. WHEN une variation est désactivée, THE Route_Generator SHALL exclure cette variation de la génération
5. THE Game_System SHALL sauvegarder les préférences de variation dans le profil du joueur

### Exigence 17: Équilibrage de la Difficulté avec Variations

**User Story:** En tant que joueur, je veux que les variations soient équilibrées selon la difficulté, afin que le jeu reste challengeant mais juste.

#### Critères d'Acceptation

1. THE Route_Generator SHALL ajuster la fréquence des variations en fonction du niveau de difficulté
2. WHEN la difficulté est entre 1-3, THE Route_Generator SHALL limiter les variations aux types basiques (SLIPPERY, UNSTABLE)
3. WHEN la difficulté est entre 4-6, THE Route_Generator SHALL introduire les variations intermédiaires (CRUMBLING, HOT, MAGNETIC)
4. WHEN la difficulté est entre 7-9, THE Route_Generator SHALL activer toutes les variations incluant les plus difficiles (ELECTRIC, zones de brouillard)
5. THE Game_System SHALL garantir qu'au moins 40% des prises restent des prises normales même à difficulté maximale

### Exigence 18: Indicateurs Visuels des Variations

**User Story:** En tant que joueur, je veux des indicateurs visuels clairs pour chaque type de variation, afin de pouvoir anticiper les défis.

#### Critères d'Acceptation

1. THE Game_System SHALL afficher une icône ou couleur distinctive pour chaque type de Special_Hold
2. WHEN le joueur survole une Special_Hold, THE Game_System SHALL afficher une infobulle avec le type et les effets
3. THE Game_System SHALL utiliser des effets de particules distincts pour chaque type de variation
4. WHEN une Environmental_Condition est active, THE Game_System SHALL afficher une icône dans le HUD
5. THE Game_System SHALL maintenir une légende des variations accessible dans le menu pause

### Exigence 19: Statistiques des Variations

**User Story:** En tant que joueur, je veux voir des statistiques sur les variations rencontrées, afin de suivre ma progression et mes défis.

#### Critères d'Acceptation

1. THE Game_System SHALL enregistrer le nombre de chaque type de Special_Hold rencontré
2. WHEN une ascension se termine, THE Game_System SHALL afficher un résumé des variations rencontrées
3. THE Game_System SHALL sauvegarder les statistiques de variations dans le profil du joueur
4. WHEN le joueur consulte son profil, THE Game_System SHALL afficher les statistiques cumulées de variations
5. THE Game_System SHALL calculer un score de difficulté basé sur les variations surmontées

### Exigence 20: Combinaisons de Variations

**User Story:** En tant que joueur, je veux que plusieurs variations puissent se combiner, afin de créer des défis uniques et complexes.

#### Critères d'Acceptation

1. THE Route_Generator SHALL permettre la combinaison de plusieurs Environmental_Condition simultanément
2. WHEN plusieurs conditions sont actives, THE Game_System SHALL cumuler leurs effets de manière multiplicative
3. THE Game_System SHALL limiter le nombre de conditions simultanées à 2 maximum pour éviter l'impossibilité
4. WHEN des variations se combinent, THE Game_System SHALL afficher tous les indicateurs actifs dans le HUD
5. WHERE la difficulté est 9, THE Route_Generator SHALL favoriser les combinaisons de variations pour un défi maximal
