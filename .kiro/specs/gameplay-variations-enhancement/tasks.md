# Plan d'Implémentation : Amélioration des Variations de Gameplay

## Vue d'ensemble

Ce plan implémente 20 exigences pour enrichir le jeu d'escalade 3D avec des variations de gameplay : prises spéciales (instables, temporaires, glissantes, etc.), conditions environnementales (vent, pluie, chaleur), zones de dévers, obstacles physiques, et un système de configuration. L'implémentation s'intègre au système existant (RouteGenerator, Game, HOLD_TYPES) en JavaScript/THREE.js.

## Tâches

- [ ] 1. Étendre les structures de données pour les variations
  - [ ] 1.1 Ajouter les nouveaux types de prises spéciales dans data.js
    - Ajouter UNSTABLE, TEMPORARY, SLIPPERY, CRUMBLING, MAGNETIC, HOT, ELECTRIC dans HOLD_TYPES
    - Définir les propriétés (fatigue, couleur, description) pour chaque type
    - _Exigences: 1.1, 2.1, 3.1, 4.1, 12.1, 13.1, 15.1_
  
  - [ ] 1.2 Créer la structure de données pour les variations de prises
    - Ajouter les champs specialType, specialData aux objets hold
    - Définir les structures pour timer, durability, gripModifier, chargePhase
    - _Exigences: 1.2, 2.2, 3.2, 4.2, 12.2, 13.2, 15.2_
  
  - [ ] 1.3 Créer la structure de données pour les zones et conditions
    - Ajouter zoneType, zoneData aux objets hold
    - Définir les structures pour OVERHANG, FOG, TIMED zones
    - Créer les types de conditions environnementales (WIND, RAIN, HEAT)
    - _Exigences: 5.1, 6.1, 7.1, 8.1, 11.1, 14.1_

- [ ] 2. Implémenter le système de gestion des variations (VariationManager)
  - [ ] 2.1 Créer la classe VariationManager dans game.js
    - Initialiser avec référence au Game
    - Créer les méthodes update(), applyHoldEffects(), checkHoldTimers()
    - Gérer les états des prises spéciales (timers, durabilité, etc.)
    - _Exigences: 1.3, 2.3, 4.3, 13.3, 15.3_
  
  - [ ] 2.2 Implémenter la logique des prises instables (UNSTABLE)
    - Démarrer timer de stabilité lors du placement d'un membre
    - Augmenter progressivement le risque de détachement
    - Retirer la prise et forcer le repositionnement si détachement
    - _Exigences: 1.2, 1.3, 1.4_
  
  - [ ] 2.3 Implémenter la logique des prises temporaires (TEMPORARY)
    - Décrémenter le timer pendant l'utilisation
    - Retirer la prise quand le timer atteint zéro
    - Forcer le repositionnement du membre si attaché
    - _Exigences: 2.3, 2.4, 2.5_
  
  - [ ] 2.4 Implémenter la logique des prises glissantes (SLIPPERY)
    - Augmenter le taux de fatigue de 50% lors du placement
    - Diminuer la stamina 1.5x plus rapidement
    - _Exigences: 3.2, 3.3_
  
  - [ ] 2.5 Implémenter la logique des prises qui s'effritent (CRUMBLING)
    - Décrémenter le compteur de durabilité à chaque utilisation
    - Réduire la taille visuelle progressivement
    - Retirer la prise quand durabilité atteint zéro
    - _Exigences: 4.2, 4.3, 4.4_
  
  - [ ] 2.6 Implémenter la logique des prises magnétiques (MAGNETIC)
    - Augmenter le rayon de capture de 50% pour attraction
    - Réduire le rayon de capture de 50% pour répulsion
    - _Exigences: 12.2, 12.3_
  
  - [ ] 2.7 Implémenter la logique des prises chauffantes (HOT)
    - Démarrer timer de tolérance lors du placement
    - Augmenter fatigue de 5 points/seconde au-delà du timer
    - _Exigences: 13.2, 13.3_
  
  - [ ] 2.8 Implémenter la logique des prises électriques (ELECTRIC)
    - Gérer le cycle de charge (phase active/inactive)
    - Diminuer stamina de 15 points si placement pendant phase active
    - _Exigences: 15.2, 15.3_

- [ ] 3. Implémenter le système de conditions environnementales (ConditionManager)
  - [ ] 3.1 Créer la classe ConditionManager dans game.js
    - Initialiser avec référence au Game
    - Gérer les conditions actives (WIND, RAIN, HEAT)
    - Créer les méthodes activateCondition(), deactivateCondition(), update()
    - _Exigences: 5.1, 6.1, 7.1_
  
  - [ ] 3.2 Implémenter la condition WIND
    - Appliquer force latérale sur le grimpeur
    - Diminuer stamina 20% plus rapidement
    - Augmenter intensité selon difficulté (>6)
    - _Exigences: 5.2, 5.3, 5.5_
  
  - [ ] 3.3 Implémenter la condition RAIN
    - Appliquer modificateur de glissance à toutes les prises
    - Augmenter fatigue 30% plus rapidement
    - Réduire adhérence de 25%
    - _Exigences: 6.2, 6.3, 6.5_
  
  - [ ] 3.4 Implémenter la condition HEAT
    - Diminuer stamina 40% plus rapidement
    - Réduire efficacité du repos de 50%
    - Augmenter taux de fatigue de 35%
    - _Exigences: 7.2, 7.3, 7.5_

- [ ] 4. Implémenter les zones de dévers et obstacles
  - [ ] 4.1 Implémenter les zones de dévers (OVERHANG)
    - Détecter entrée du grimpeur dans une zone de dévers
    - Augmenter taux de fatigue de 100%
    - Diminuer stamina 2x plus rapidement
    - _Exigences: 8.2, 8.3_
  
  - [ ] 4.2 Implémenter les séquences dynamiques obligatoires
    - Marquer les prises obligatoires dans les séquences
    - Appliquer pénalité de 20 points si prise sautée
    - Accorder bonus de 10 points si séquence complétée
    - _Exigences: 9.3, 9.4_
  
  - [ ] 4.3 Implémenter les obstacles physiques
    - Générer obstacles (branches, rochers) sur le parcours
    - Bloquer l'accès aux prises dans la zone d'obstacle
    - Rejeter le mouvement si tentative sur prise bloquée
    - _Exigences: 10.2, 10.3_
  
  - [ ] 4.4 Implémenter les sections chronométrées
    - Démarrer timer lors de l'entrée dans la section
    - Appliquer pénalité de 30 points si temps écoulé
    - Accorder bonus de 15 points si complété à temps
    - _Exigences: 11.3, 11.4, 11.5_
  
  - [ ] 4.5 Implémenter les zones de brouillard
    - Réduire visibilité des prises de 70%
    - Révéler progressivement les prises (rayon 2m)
    - _Exigences: 14.2, 14.4_

- [ ] 5. Checkpoint - Vérifier que les systèmes de base fonctionnent
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Étendre le RouteGenerator pour générer les variations
  - [ ] 6.1 Ajouter la génération de prises spéciales selon difficulté
    - Difficulté 1-3: SLIPPERY, UNSTABLE (basiques)
    - Difficulté 4-6: CRUMBLING, HOT, MAGNETIC (intermédiaires)
    - Difficulté 7-9: ELECTRIC, zones de brouillard (difficiles)
    - Garantir 40% de prises normales minimum
    - _Exigences: 17.2, 17.3, 17.4, 17.5_
  
  - [ ] 6.2 Ajouter la génération de zones de dévers
    - Générer avec angle configurable selon difficulté
    - Augmenter fréquence et angle si difficulté >4
    - _Exigences: 8.1, 8.5_
  
  - [ ] 6.3 Ajouter la génération de séquences dynamiques
    - Marquer prises comme obligatoires dans séquences
    - Augmenter fréquence si difficulté >5
    - _Exigences: 9.1, 9.5_
  
  - [ ] 6.4 Ajouter la génération d'obstacles physiques
    - Générer branches et rochers saillants
    - Augmenter densité si difficulté >3
    - _Exigences: 10.1, 10.5_
  
  - [ ] 6.5 Ajouter la génération de sections chronométrées
    - Définir limite de temps selon difficulté
    - _Exigences: 11.1_
  
  - [ ] 6.6 Ajouter la génération de zones de brouillard
    - Augmenter densité et hauteur si difficulté >7
    - _Exigences: 14.1, 14.5_
  
  - [ ] 6.7 Implémenter la logique de combinaison de variations
    - Permettre jusqu'à 2 conditions simultanées
    - Cumuler effets de manière multiplicative
    - Favoriser combinaisons si difficulté = 9
    - _Exigences: 20.2, 20.3, 20.5_

- [ ] 7. Implémenter le système d'effets visuels (VisualEffectsManager)
  - [ ] 7.1 Créer la classe VisualEffectsManager dans scene.js
    - Initialiser avec référence à la scène THREE.js
    - Créer méthodes pour chaque type d'effet visuel
    - _Exigences: 18.1, 18.3_
  
  - [ ] 7.2 Implémenter les effets visuels pour prises spéciales
    - UNSTABLE: tremblement, particules
    - TEMPORARY: timer visuel
    - SLIPPERY: brillance, gouttes
    - CRUMBLING: particules de poussière
    - MAGNETIC: aura, particules
    - HOT: rougeoiement, particules de chaleur
    - ELECTRIC: éclairs, pulsation
    - _Exigences: 1.5, 2.2, 3.4, 4.5, 12.4, 13.4, 15.4_
  
  - [ ] 7.3 Implémenter les effets visuels pour conditions environnementales
    - WIND: particules, mouvement de caméra
    - RAIN: particules, texture mouillée
    - HEAT: distorsion, teinte orangée
    - _Exigences: 5.4, 6.4, 7.4_
  
  - [ ] 7.4 Implémenter les effets visuels pour zones et obstacles
    - OVERHANG: inclinaison du mur visible
    - Séquences dynamiques: indicateurs sur prises
    - Obstacles: modèles 3D (branches, rochers)
    - Brouillard: effet de brume
    - _Exigences: 8.4, 9.2, 10.4, 14.3_
  
  - [ ] 7.5 Implémenter le système d'infobulles
    - Afficher type et effets au survol d'une prise spéciale
    - _Exigences: 18.2_

- [ ] 8. Implémenter le système de configuration des variations
  - [ ] 8.1 Créer l'interface de configuration dans le menu
    - Ajouter panneau de configuration dans l'UI
    - Afficher toutes les variations disponibles
    - _Exigences: 16.1, 16.2_
  
  - [ ] 8.2 Implémenter l'activation/désactivation des variations
    - Permettre toggle individuel de chaque variation
    - Exclure variations désactivées de la génération
    - _Exigences: 16.3, 16.4_
  
  - [ ] 8.3 Implémenter la sauvegarde des préférences
    - Sauvegarder dans le profil du joueur
    - Charger au démarrage
    - _Exigences: 16.5_

- [ ] 9. Implémenter le système de statistiques des variations
  - [ ] 9.1 Ajouter le tracking des variations rencontrées
    - Enregistrer le nombre de chaque type de prise spéciale
    - Enregistrer les conditions environnementales affrontées
    - _Exigences: 19.1_
  
  - [ ] 9.2 Créer l'affichage du résumé post-ascension
    - Afficher variations rencontrées dans l'écran de fin
    - _Exigences: 19.2_
  
  - [ ] 9.3 Implémenter la sauvegarde et l'affichage des statistiques cumulées
    - Sauvegarder dans le profil
    - Afficher dans le panneau profil
    - Calculer score de difficulté basé sur variations
    - _Exigences: 19.3, 19.4, 19.5_

- [ ] 10. Implémenter les indicateurs HUD pour les variations actives
  - [ ] 10.1 Ajouter les icônes de conditions dans le HUD
    - Afficher icône pour chaque condition active
    - Afficher tous les indicateurs si combinaisons
    - _Exigences: 18.4, 20.4_
  
  - [ ] 10.2 Créer la légende des variations dans le menu pause
    - Afficher icône/couleur pour chaque type
    - Maintenir accessible pendant le jeu
    - _Exigences: 18.1, 18.5_

- [ ] 11. Intégration et câblage final
  - [ ] 11.1 Intégrer VariationManager dans Game
    - Instancier dans Game.init()
    - Appeler update() dans _animate()
    - Connecter aux événements de placement de membres
    - _Exigences: 1.3, 2.3, 3.2, 4.2_
  
  - [ ] 11.2 Intégrer ConditionManager dans Game
    - Instancier dans Game.init()
    - Activer conditions selon mode et difficulté
    - Appeler update() dans _animate()
    - _Exigences: 5.1, 6.1, 7.1_
  
  - [ ] 11.3 Intégrer VisualEffectsManager dans Game
    - Instancier dans Game.init()
    - Connecter aux événements de variations
    - Mettre à jour effets dans _animate()
    - _Exigences: 18.3_
  
  - [ ] 11.4 Connecter le système de configuration au RouteGenerator
    - Passer les préférences lors de la génération
    - Filtrer les variations selon configuration
    - _Exigences: 16.4_
  
  - [ ] 11.5 Connecter le système de statistiques aux événements de jeu
    - Tracker lors du placement sur prises spéciales
    - Tracker lors de l'activation de conditions
    - Sauvegarder à la fin de l'ascension
    - _Exigences: 19.1, 19.2, 19.3_

- [ ] 12. Checkpoint final - Vérifier l'intégration complète
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Les tâches sont organisées par système logique (structures de données, managers, génération, effets visuels, UI)
- Chaque tâche référence les exigences spécifiques qu'elle implémente
- Les checkpoints permettent de valider l'intégration progressive
- L'implémentation utilise JavaScript/THREE.js pour s'intégrer au code existant
- Les variations sont conçues pour être modulaires et configurables
