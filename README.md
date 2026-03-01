# 🏛️ DRH Yopougon - Système de Gestion du Personnel

Application de gestion des ressources humaines pour la **Commune de Yopougon** (Côte d'Ivoire).

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

---

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** - JWT + bcrypt
- 📊 **Tableau de bord** - Statistiques et graphiques
- 👥 **Gestion du personnel** - CRUD des agents municipaux
- 🏖️ **Congés & Absences** - Planification et validation
- 📄 **Documents** - Notes d'arrêt et reprise de service (PDF)
- 📥 **Exports** - Excel et PDF

---

## 🛠️ Stack Technique

| Frontend | Backend | Base de données |
|----------|---------|-----------------|
| React 19 | Node.js + Express 5 | SQLite |
| TypeScript | JWT + bcrypt | sqlite3 |
| Tailwind CSS 4 | CORS | |
| Recharts | | |
| Framer Motion | | |

---

## 🚀 Déploiement sur Render (Gratuit)

### Étape 1 : Créer un compte Render
1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started"** et créez un compte
3. Vous pouvez utiliser votre compte GitHub pour vous inscrire

### Étape 2 : Connecter le repository
1. Sur Render, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre compte GitHub
3. Sélectionnez le repository `drh`

### Étape 3 : Configurer le service
Remplissez les champs :

| Champ | Valeur |
|-------|--------|
| **Name** | `drh-yopougon` |
| **Region** | `Frankfurt` (ou le plus proche) |
| **Branch** | `main` |
| **Root Directory** | (laisser vide) |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### Étape 4 : Ajouter les variables d'environnement
Cliquez sur **"Advanced"** → **"Add Environment Variable"** :

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | (cliquez sur "Generate" pour créer une clé secrète) |

### Étape 5 : Déployer
1. Cliquez sur **"Create Web Service"**
2. Attendez le build (environ 2-3 minutes)
3. Votre app sera disponible sur `https://drh-yopougon.onrender.com`

---

## 💻 Développement Local

### Prérequis
- Node.js 18+
- npm ou bun

### Installation
```bash
# Cloner le repository
git clone https://github.com/Armandodino/drh.git
cd drh

# Installer les dépendances
npm install

# Initialiser la base de données et créer les comptes
npm run seed

# Lancer en développement (frontend + backend)
npm run dev:all
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:5000

### Comptes de test

| Matricule | Mot de passe | Rôle |
|-----------|--------------|------|
| `drh001` | `admin123` | ADMIN_DRH |
| `dev001` | `dev2026` | DEV |

---

## 📁 Structure du Projet

```
drh/
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── pages/              # Pages de l'application
│   ├── services/           # Services API et exports
│   ├── constants/          # Constantes (directions, etc.)
│   └── index.css           # Styles Tailwind
├── backend/                # Backend Node.js
│   ├── server.js           # Serveur Express
│   ├── database.js         # Configuration SQLite
│   └── seed.js             # Initialisation des données
├── public/                 # Assets statiques
├── render.yaml             # Configuration Render
├── vite.config.ts          # Configuration Vite
└── package.json            # Dépendances et scripts
```

---

## ⚠️ Notes Importantes

### Persistance des données
Sur le plan gratuit de Render, la base SQLite est **éphémère** : les données sont perdues à chaque redémarrage du serveur.

Pour une utilisation en production, il est recommandé de migrer vers une base de données persistante comme :
- **Supabase** (PostgreSQL gratuit - 500MB)
- **PlanetScale** (MySQL gratuit)
- **MongoDB Atlas** (MongoDB gratuit - 512MB)

### Limites du plan gratuit Render
- 750 heures/mois
- Le service se met en "sleep" après 15 min d'inactivité
- Premier démarrage lent (~30 sec) après mise en veille

---

## 📝 License

MIT © Commune de Yopougon

---

## 👨‍💻 Auteur

**Armandodino** - [GitHub](https://github.com/Armandodino)
