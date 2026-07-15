# 🥗 CalorieMate

A full-stack calorie tracking web application built with **React** and **Node.js + Express**.

Track your daily food intake, monitor calories consumed vs your daily goal, and manage your nutrition in real time.

---

## 🚀 Features

- **Add food items** — log anything you eat with its calorie count
- **Live calorie dashboard** — see total consumed, daily goal, and remaining calories
- **Dynamic progress bar** — color shifts green → orange → red as you approach your goal
- **Delete entries** — remove any logged food instantly
- **REST API backend** — all data is managed through a proper Express API
- **Responsive design** — works on mobile and desktop

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 | UI component library |
| Vite | Build tool & dev server |
| CSS (Glassmorphism) | Styling with dark theme |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework & routing |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |
| nodemon | Auto-restart during development |

---

## 📁 Project Structure

```
calorie-app/
├── client/                  ← React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    ← Calorie summary + progress bar
│   │   │   ├── AddFoodForm.jsx  ← Form to log food
│   │   │   └── FoodList.jsx     ← List of logged foods
│   │   ├── App.jsx              ← Root component, state management
│   │   └── App.css              ← Global styles
│   └── package.json
│
└── server/                  ← Node.js + Express backend
    ├── routes/
    │   └── foodRoutes.js        ← All /api/foods routes
    ├── data/
    │   └── food.js              ← In-memory data store
    ├── index.js                 ← Server entry point
    ├── .env                     ← Environment variables
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/foods` | Get all logged foods |
| `GET` | `/api/foods/:id` | Get a single food by ID |
| `POST` | `/api/foods` | Add a new food entry |
| `DELETE` | `/api/foods/:id` | Remove a food entry |

### Example POST body
```json
{
  "name": "Chicken Rice",
  "calories": 450
}
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or above)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/your-username/calorie-app.git
cd calorie-app
```

### 2. Start the Backend
```bash
cd server
npm install
npm run dev
```
Server runs at `http://localhost:5000`

### 3. Start the Frontend
```bash
cd client
npm install
npm run dev
```
App runs at `http://localhost:5173`

---

## 🧠 Key Concepts Used

- **React Hooks** — `useState` for state management, `useEffect` for data fetching
- **Lifting State Up** — parent component (`App.jsx`) owns the data, passes it down via props
- **Callback Props** — child components communicate up to parent via functions passed as props
- **REST API design** — proper HTTP methods, status codes, and JSON responses
- **Express Middleware** — `express.json()` for body parsing, `cors()` for cross-origin requests
- **Express Router** — routes organized in separate files for clean code structure
- **Environment Variables** — sensitive config stored in `.env`, not hardcoded
- **Async/Await** — for clean asynchronous API calls using the `fetch` API

---

## 📌 Notes

> ⚠️ **Data persistence**: This app uses an in-memory array as its data store. All logged foods will reset when the server restarts. A future version will use a database (MongoDB or SQLite) for persistent storage.

---

## 🗺️ Future Improvements

- [ ] Database integration (MongoDB) for persistent storage
- [ ] User authentication (login/signup)
- [ ] Edit food entries
- [ ] Daily history — track intake across multiple days
- [ ] Macro tracking (protein, carbs, fat)
- [ ] Custom daily calorie goal setting

---

## 👨‍💻 Author

Built as a learning project to practice full-stack web development with React and Node.js.
