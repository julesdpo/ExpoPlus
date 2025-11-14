# ExpoPlus – Backend API

API REST complète pour la gestion d'expositions culturelles, favoris et authentification sécurisée.

## Fonctionnalités principales

* **Authentification JWT complète :**

  * Register / Login
  * Access + Refresh tokens (rotation sécurisée)
  * Logout + invalidation des tokens
  * Rôles `user` et `admin`
* **Sécurité avancée :**

  * CORS configuré
  * Rate limiting sur `/auth/login`
  * Hashing des mots de passe (bcrypt)
  * Vérification des permissions
* **Données culturelles :**

  * Import OpenData Paris / Paris Musées
  * Stockage normalisé (venues + exhibitions)
* **Favoris utilisateur :**

  * Ajouter / retirer une exposition
  * Listing personnalisé
* **Logs MongoDB :**

  * Logs informations
  * Logs erreurs
  * Méthode, URL, userId, timestamp
* **Documentation Swagger complète**

---

## Architecture du projet

```
ExpoPlus/
├── node_modules/
├── sql/
│   └── schema.sql
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── mongo.js
│   │   ├── ratelimit.js
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── favorites.controller.js
│   ├── middlewares/
│   │   ├── admin.middleware.js
│   │   ├── auth.middleware.js
│   │   ├── logger.js
│   │   ├── ratelimit.middleware.js
│   │   └── validate.middleware.js
│   ├── models/
│   │   ├── apiCache.model.js
│   │   ├── exhibition.model.js
│   │   ├── favorite.model.js
│   │   ├── ingestionRun.model.js
│   │   ├── log.model.js
│   │   ├── refreshToken.model.js
│   │   ├── users.model.js
│   │   └── venue.model.js
│   ├── public/
│   │   ├── app.js
│   │   ├── index.html
│   │   └── style.css
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── events.routes.js
│   │   ├── favorites.routes.js
│   │   ├── index.js
│   │   ├── users.routes.js
│   │   └── venues.routes.js
│   ├── services/
│   │   ├── eventImporter.service.js
│   │   ├── ingestionService.js
│   │   ├── jwt.service.js
│   │   └── refreshToken.service.js
│   ├── swagger/
│   │   └── swagger.json
│   ├── utils/
│   │   ├── jwt.js
│   │   └── logger.js
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── docker-compose.yml
├── package-lock.json
├── package.json
└── readme.md
```

Architecture **REST + MVC + Services**.

---

## Prérequis

Assure-toi d'avoir installé :

* **Node.js >= 18**
* **Docker + Docker Compose**
* **PostgreSQL (automatique via Docker)**
* **MongoDB (automatique via Docker)**

---

## 1. Lancer les bases PostgreSQL + MongoDB

Dans le dossier du projet :

```bash
docker compose up -d
```

Cela démarre :

* PostgreSQL sur **localhost:5432**
* MongoDB sur **localhost:27017**

Tu peux vérifier avec :

```bash
docker ps
```

---

## 2. Configurer l'environnement

Crée un fichier `.env` à la racine :

```env
# Express
PORT=4000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cultural_explorer
POSTGRES_USER=app_user
POSTGRES_PASSWORD=app_password

# MongoDB
MONGO_URI=mongodb://root:rootpassword@localhost:27017/cultural_explorer_logs?authSource=admin

# JWT
JWT_SECRET=supersecretkey
JWT_REFRESH_SECRET=superrefreshkey
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d
```

---

## 3. Créer la base PostgreSQL (Schéma Complet)

Lancer PostgreSQL :

```bash
docker exec -it expoplus_postgres psql -U app_user -d cultural_explorer
```

Puis exécuter le script SQL situé dans `sql/schema.sql` :

```bash
docker exec -i expoplus_postgres psql -U app_user -d cultural_explorer < sql/schema.sql
```

---

## 4. Installer les dépendances

```bash
npm install
```

---

## 5. Lancer le serveur

Mode normal :

```bash
npm start
```

Mode développement (nodemon) :

```bash
npm run dev
```

Le serveur démarre sur :

```
http://localhost:4000
```

---

## 6. Documentation Swagger

Une fois le serveur démarré, accéder à :

**[http://localhost:4000/docs](http://localhost:4000/docs)**

Tu y trouveras toutes les routes : Auth / Users / Events / Favorites + exemples.

---

## 7. Authentification – Flow complet

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Login

Reçoit :

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { 
    "id": "...",
    "email": "test@example.com",
    "role": "user"
  }
}
```

### Accéder à une route protégée

Ajouter dans Postman ou votre client HTTP :

```
Authorization: Bearer <accessToken>
```

### Rafraîchir un token

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

Nouvelle rotation :

- Ancien token supprimé
- Nouveau refresh token
- Nouveau access token

### Logout

```bash
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

Supprime tous les refresh tokens du user.

---

## 8. Scripts utiles

### Supprimer les conteneurs

```bash
docker compose down
```

### Rebuild complet

```bash
docker compose down
docker compose up --build -d
```

### Voir les logs du serveur

```bash
npm run dev
```

---

## 9. Accéder aux logs MongoDB

Connexion au conteneur :

```bash
docker exec -it expoplus_mongo mongosh -u root -p rootpassword
```

Puis :

```js
use cultural_explorer_logs
db.logs.find().pretty()
```

---

## 10. Routes principales

### Auth

* `POST /api/auth/register` - Inscription
* `POST /api/auth/login` - Connexion
* `POST /api/auth/refresh` - Rafraîchir le token
* `POST /api/auth/logout` - Déconnexion
* `GET /api/auth/me` - Profil utilisateur

### Expositions

* `GET /api/events` - Liste des expositions
* `POST /api/events/import/paris` - Importer depuis OpenData Paris

### Favoris

* `POST /api/favorites/:eventId` - Ajouter un favori
* `GET /api/favorites` - Liste des favoris
* `DELETE /api/favorites/:eventId` - Retirer un favori

### Administration (Admin uniquement)

* `GET /api/users` - Liste des utilisateurs
* `DELETE /api/users/:id` - Supprimer un utilisateur

---

## 11. Technologies utilisées

| Technologie                    | Rôle                                                          |
| ------------------------------ | -------------------------------------------------------------- |
| **Node.js / Express.js** | Framework backend                                              |
| **PostgreSQL**           | Base de données relationnelle (users, exhibitions, favorites) |
| **MongoDB**              | Base de données NoSQL (logs)                                  |
| **JWT**                  | Authentification stateless                                     |
| **bcryptjs**             | Hashing des mots de passe                                      |
| **Swagger**              | Documentation API interactive                                  |
| **Mongoose**             | ODM pour MongoDB                                               |
| **express-rate-limit**   | Protection contre le brute-force                               |
| **Docker Compose**       | Orchestration des conteneurs                                   |

---

## 12. Objectif pédagogique

Ce projet démontre :

* Une architecture MVC réelle et professionnelle
* La gestion de la sécurité d'une API (JWT, refresh tokens, rate limiting)
* La maîtrise de JWT avec politique de rotation
* Une intégration multi-base SQL/NoSQL
* Une documentation technique professionnelle avec Swagger
* Des logs exploités en production
* De la rigueur dans la structure du code

---

## 13. Auteurs

Projet réalisé par Vincent LEBEL & Jules DUPONT**.**

---

## Licence

Ce projet est réalisé dans un cadre pédagogique.
