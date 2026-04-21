# 🍽 Calorie Tracker — by Yuvraj

A full-stack calorie tracking web app built from your C++ project.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Food DB**: 100+ Indian foods (from your original C++ data)

## Features
- ✅ BMI Calculator with calorie limit recommendation
- ✅ 5 meal slots: Breakfast, Morning Snack, Lunch, Evening Snack, Dinner
- ✅ Live food search with autocomplete
- ✅ Quantity selection (1–5×)
- ✅ Healthier alternative suggestions
- ✅ Real-time calorie progress bar
- ✅ Daily summary with meal breakdown

## How to Run

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the backend server
```bash
cd server
node index.js
# Runs on http://localhost:3001
```

### 3. Start the frontend (in a new terminal)
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### 4. Open in browser
Go to **http://localhost:5173**

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bmi | Calculate BMI and calorie limit |
| GET | /api/foods?q= | Search food database |
| GET | /api/foods/:name | Get single food item |
| POST | /api/suggest | Get healthier alternative |
| POST | /api/analyze | Analyze full day's meals |

## Project Structure
```
calorie-tracker/
├── server/
│   ├── index.js        # Express API server
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── BMIScreen.jsx
│   │       ├── TrackerScreen.jsx
│   │       └── SummaryScreen.jsx
│   ├── vite.config.js
│   └── package.json
└── README.md
```
