# 🏛️ DRH Yopougon - Système de Gestion du Personnel

Application de gestion des ressources humaines pour la **Commune de Yopougon** (Côte d'Ivoire).

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)
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
| React 19 | Node.js + Express 5 | PostgreSQL (Supabase) |
| TypeScript | JWT + bcrypt | 500MB gratuit |
| Tailwind CSS 4 | CORS | |
| Recharts | | |
| Framer Motion | | |

---

## 🚀 Déploiement (Render + Supabase)

### Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Créez un compte et une organisation
4. Créez un **nouveau projet** :
   - **Name** : `drh-yopougon`
   - **Database password** : (générez un mot de passe fort)
   - **Region** : `West Europe (Frankfurt)` ou le plus proche
5. Attendez ~2 minutes que le projet soit prêt

### Étape 2 : Récupérer les infos de connexion

1. Dans Supabase, allez dans **Settings** → **Database**
2. Copiez l'**URI de connexion** (format : `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`)
3. Remplacez `[PASSWORD]` par votre mot de passe de base de données

### Étape 3 : Créer les tables

1. Dans Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez-collez le contenu du fichier `backend/schema.sql`
4. Cliquez sur **Run** pour exécuter

### Étape 4 : Déployer sur Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"New +"** → **" Web Service"**
3. Connectez votre GitHub et sélectionnez le repository `drh`
4. Configurez :

| Champ | Valeur |
|-------|--------|
| **Name** | `drh-yopougon` |
| **Region** | `Frankfurt` |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### Étape 5 : Configurer les variables d'environnement

Dans Render, allez dans **Environment** et ajoutez :

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | *(cliquez "Generate")* |
| `DATABASE_URL` | *(votre URI Supabase)* |

### Étape 6 : Déployer

1. Cliquez sur **"Create Web Service"**
2. Attendez ~3 minutes
3. 🎉 Votre app est sur : `https://drh-yopougon.onrender.com`

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

# Initialiser la base SQLite locale
npm run seed

# Lancer en développement (frontend + backend)
npm run dev:all
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:5000

### Utiliser Supabase en local

Créez un fichier `.env` à la racine :

```env
DATABASE_URL=postgresql://postgres:VOTRE_MDP@db.xxx.supabase.co:5432/postgres
NODE_ENV=production
```

Puis lancez :

```bash
# Créer les tables et comptes
node backend/seed-supabase.js

# Démarrer le serveur
npm start
```

---

## 📋 Comptes de test

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
│   └── constants/          # Constantes
├── backend/                # Backend Node.js
│   ├── server-supabase.js  # Serveur PostgreSQL (production)
│   ├── server.js           # Serveur SQLite (développement)
│   ├── database-supabase.js# Config PostgreSQL
│   ├── database.js         # Config SQLite
│   ├── schema.sql          # Schéma SQL Supabase
│   └── seed.js             # Données initiales
├── public/                 # Assets statiques
├── render.yaml             # Configuration Render
└── package.json            # Dépendances
```

---

## 🔧 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le frontend Vite |
| `npm run dev:all` | Lance frontend + backend (SQLite) |
| `npm run build` | Build pour production |
| `npm start` | Lance le serveur production (PostgreSQL) |
| `npm run seed` | Initialise SQLite locale |

---

## ⚠️ Notes importantes

### SQLite vs PostgreSQL

- **Développement** : SQLite (fichier local)
- **Production** : PostgreSQL via Supabase

Le fichier `server-supabase.js` détecte automatiquement l'environnement et utilise la bonne base.

### Limites du plan gratuit

| Service | Limite |
|---------|--------|
| Render | 750h/mois, sleep après 15 min d'inactivité |
| Supabase | 500MB base de données, 1GB stockage fichiers |

---

## 📝 License

MIT © Commune de Yopougon

---

## 👨‍💻 Auteur

**Armandodino** - [GitHub](https://github.com/Armandodino)
