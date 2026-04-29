# Document de Conception — Amélioration des Variations de Gameplay

## Vue d'ensemble

Ce document décrit la conception technique pour l'ajout de variations de gameplay au jeu d'escalade 3D. Le système introduit des prises spéciales avec comportements uniques, des conditions environnementales affectant le gameplay, et des obstacles dynamiques pour augmenter la difficulté et la variété.

L'architecture s'intègre au système existant (RouteGenerator, Game, HOLD_TYPES) en étendant les structures de données et en ajoutant de nouveaux systèmes de gestion des variations sans modifier les mécaniques de base (drag-and-drop des membres).

## Architecture

### Composants Principaux

```
┌─────────────────────────────────────────────────────────────┐
│                      Game Engine (game.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │VariationMgr  │  │ConditionMgr  │  │ VisualEffectsMgr │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  RouteGenerator (data.js)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Génération de prises avec variations                 │  │
│  │  - Prises spéciales (UNSTABLE, SLIPPERY, etc.)       │  │
│  │  - Zones de dévers                                    │  │
│  │  - Séquences dynamiques                               │  │
│  │  - Obstacles physiques                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hold Data Structure                       │
│  {                                                           │
│    id, x, y, z, type,                                       │
│    specialType?: 'UNSTABLE' | 'TEMPORARY' | ...,           │
│    specialData?: { timer, durability, ... },               │
│    zoneType?: 'OVERHANG' | 'FOG' | 'TIMED',                │
│    zoneData?: { angle, visibility, timeLimit, ... }        │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
