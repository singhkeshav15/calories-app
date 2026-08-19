# 🥗 CalorieMate

A full-stack nutrition tracking web application with JWT authentication, PostgreSQL persistence, and real-time food search.

🔗 **[Live Demo](https://caloriesmate.vercel.app)** | 🖥️ **[API](https://caloriemate-api.onrender.com)**

---

## ✨ Features

- **JWT Authentication** — register, login, logout with secure token-based auth
- **bcrypt Password Hashing** — passwords never stored in plain text
- **Per-user Data** — each user only sees their own food log
- **Add food items** — log name, calories, and protein
- **FatSecret API Search** — real-time food search with OAuth 2.0 (auto-fills calories & protein)
- **Live calorie dashboard** — total consumed, daily goal, remaining calories
- **Dynamic progress bar** — green → orange → red as you approach your goal
- **Delete entries** — remove any logged food instantly
- **Rate limiting** — brute force protection on auth endpoints (10 req / 15 min)
- **Responsive design** — works on mobile and desktop

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 | UI component library |
| Vite | Build tool & dev server |
| CSS (Glassmorphism) | Dark theme UI |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server & REST API |
| PostgreSQL (Neon) | Persistent database |
| node-postgres (pg) | Database connection pool |
| JWT (jsonwebtoken) | Stateless authentication |
| bcryptjs | Password hashing |
| express-rate-limit | Brute force protection |
| OAuth 2.0 | FatSecret API authentication |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Neon | Managed PostgreSQL |

---

## 📁 Project Structure

```
calorie-app/
├── client/                        ← React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      ← Calorie summary + progress bar
│   │   │   ├── AddFoodForm.jsx    ← Food form + FatSecret search
│   │   │   └── FoodList.jsx       ← Logged foods list
│   │   ├── pages/
│   │   │   ├── Login.jsx          ← Login page
│   │   │   └── Register.jsx       ← Register page
│   │   ├── App.jsx                ← Root component, auth state, data fetching
│   │   └── App.css                ← Global glassmorphism styles
│   └── package.json
│
└── server/                        ← Node.js + Express backend
    ├── routes/
    │   ├── foodRoutes.js          ← Protected /api/foods CRUD routes
    │   ├── authRoutes.js          ← /api/auth/register + /api/auth/login
    │   └── searchRoutes.js        ← /api/search (FatSecret proxy)
    ├── middleware/
    │   └── auth.js                ← JWT verification middleware
    ├── db/
    │   └── index.js               ← PostgreSQL connection pool
    ├── utils/
    │   └── fatSecretAuth.js       ← OAuth 2.0 token management
    ├── index.js                   ← Server entry point
    └── .env                       ← Environment variables (never committed)
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Create account, returns JWT | No |
| `POST` | `/api/auth/login` | Login, returns JWT | No |

### Foods (all protected)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/foods` | Get logged-in user's foods | ✅ |
| `POST` | `/api/foods` | Add a new food entry | ✅ |
| `DELETE` | `/api/foods/:id` | Delete a food entry | ✅ |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q=banana` | Search foods via FatSecret API |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL (local) or a [Neon](https://neon.tech) free account

### 1. Clone the repository
```bash
git clone https://github.com/singhkeshav15/calories-app.git
cd calories-app
```

### 2. Set up the database
Create a PostgreSQL database and run:
```sql
CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  email    VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE foods (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  calories   INTEGER NOT NULL,
  protein    NUMERIC(5,2) DEFAULT 0,
  logged_at  TIMESTAMP DEFAULT NOW(),
  user_id    INTEGER REFERENCES users(id)
);
```

### 3. Configure server environment
Create `server/.env`:
```
PORT=5000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=caloriemate
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key
FATSECRET_CLIENT_ID=your_fatsecret_id
FATSECRET_CLIENT_SECRET=your_fatsecret_secret
CLIENT_URL=http://localhost:5173
```

### 4. Configure client environment
Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

### 5. Start the backend
```bash
cd server
npm install
npm run dev
```
Server runs at `http://localhost:5000`

### 6. Start the frontend
```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173`

---

## 🧠 Key Concepts Implemented

- **JWT Authentication** — stateless auth with signed tokens, 7-day expiry
- **bcrypt Hashing** — one-way password hashing with salt rounds
- **Express Middleware** — custom auth middleware guards all food routes
- **OAuth 2.0 Client Credentials** — server-side token management for FatSecret API
- **Connection Pooling** — efficient PostgreSQL connections via `pg` Pool
- **Rate Limiting** — IP-based request throttling to prevent brute force attacks
- **Environment-based Config** — all secrets in `.env`, never hardcoded
- **CORS** — locked to specific frontend origin in production
- **Debouncing** — search input waits 200ms before firing API request

---

## 👨‍💻 Author

**Keshav Singh** — built to learn full-stack development end to end.

[GitHub](https://github.com/singhkeshav15) · [LinkedIn](https://linkedin.com/in/singhkeshav15)
