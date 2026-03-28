# DRH Yopougon - Frontend Next.js

Application frontend de gestion des ressources humaines pour la Mairie de Yopougon.

## 🚀 Déploiement sur Vercel

### 1. Variables d'environnement

Dans Vercel, configurez la variable d'environnement :

```
NEXT_PUBLIC_API_URL=https://votre-backend.vercel.app/api
```

### 2. Déployer

1. Connectez votre repo GitHub à Vercel
2. Vercel détectera automatiquement Next.js
3. Configurez les variables d'environnement
4. Déployez !

## 📦 Fonctionnalités

- ✅ Authentification JWT
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des employés
- ✅ Planning des congés
- ✅ Planification annuelle des congés
- ✅ Centre de notifications
- ✅ Génération de documents PDF (Arrêté de service, Note de reprise)
- ✅ Mode sombre / clair
- ✅ Design responsive

## 🔧 Développement local

```bash
# Installer les dépendances
bun install

# Lancer le serveur de développement
bun run dev
```

## 🌐 Configuration

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📁 Structure

```
src/
├── app/
│   ├── page.tsx        # Application principale
│   ├── layout.tsx      # Layout racine
│   └── globals.css     # Styles globaux
├── components/
│   └── ui/             # Composants shadcn/ui
├── constants/
│   └── directions.ts   # Liste des directions
└── lib/
    └── config.ts       # Configuration API
```

## 🔗 Backend

Le backend doit être déployé séparément et exposer les endpoints API suivants :

- `POST /api/login` - Authentification
- `GET /api/agents` - Liste des agents
- `POST /api/agents` - Créer un agent
- `PUT /api/agents/:id` - Modifier un agent
- `DELETE /api/agents/:id` - Supprimer un agent
- `GET /api/conges` - Liste des congés
- `POST /api/conges` - Créer un congé
- `PUT /api/conges/:id` - Modifier un congé
- `GET /api/conges/fin-proche` - Congés se terminant bientôt
- `GET /api/notifications/count` - Compteur de notifications
- `GET /api/choix-conges` - Choix de congés annuels
- `POST /api/verify-password` - Vérifier le mot de passe

## 📄 Licence

© 2025 Commune de Yopougon - Direction des Ressources Humaines
