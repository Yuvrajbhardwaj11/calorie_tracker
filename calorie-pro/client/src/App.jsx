import { useState, useEffect } from "react";
import BMIScreen from "./components/BMIScreen";
import TrackerScreen from "./components/TrackerScreen";
import SummaryScreen from "./components/SummaryScreen";
import Toast from "./components/Toast";

const MEALS = [
  { name: "Breakfast", icon: "🌅", color: "#ff8c42", bg: "rgba(255,140,66,0.1)" },
  { name: "Morning Snack", icon: "🍎", color: "#00e5a0", bg: "rgba(0,229,160,0.1)" },
  { name: "Lunch", icon: "☀️", color: "#ffd166", bg: "rgba(255,209,102,0.1)" },
  { name: "Evening Snack", icon: "🌤", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  { name: "Dinner", icon: "🌙", color: "#4d9fff", bg: "rgba(77,159,255,0.1)" },
];

const emptyMeals = () => MEALS.map(m => ({ ...m, items: [] }));

export default function App() {
  const [screen, setScreen] = useState("bmi");
  const [bmiData, setBmiData] = useState(null);
  const [meals, setMeals] = useState(emptyMeals());
  const [water, setWater] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [steps, setSteps] = useState(0);

  const totalItems = meals.reduce((s, m) => s + m.items.length, 0);

  function toast(msg, type = "success") {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  function resetDay() {
    setMeals(emptyMeals());
    setWater(0);
    setSteps(0);
    toast("New day started! 🌟", "info");
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a className="logo">
            <div className="logo-mark">🍽</div>
            <div>
              <div className="logo-name">NutriTrack Pro</div>
            </div>
            <span className="logo-tag">INDIA</span>
          </a>

          {bmiData && (
            <nav className="nav">
              {[
                { id: "bmi", label: "Profile", icon: "⚡" },
                { id: "tracker", label: "Track", icon: "🥗", count: totalItems },
                { id: "summary", label: "Summary", icon: "📊" },
              ].map(({ id, label, icon, count }) => (
                <button
                  key={id}
                  className={`nav-btn ${screen === id ? "active" : ""}`}
                  onClick={() => setScreen(id)}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  {count > 0 && <span className="badge">{count}</span>}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="main">
        {screen === "bmi" && (
          <BMIScreen
            onDone={data => { setBmiData(data); setScreen("tracker"); toast("Profile saved! Start tracking 🚀"); }}
            existing={bmiData}
          />
        )}
        {screen === "tracker" && bmiData && (
          <TrackerScreen
            bmiData={bmiData}
            meals={meals}
            setMeals={setMeals}
            water={water}
            setWater={setWater}
            steps={steps}
            setSteps={setSteps}
            onSummary={() => setScreen("summary")}
            toast={toast}
          />
        )}
        {screen === "summary" && bmiData && (
          <SummaryScreen
            bmiData={bmiData}
            meals={meals}
            water={water}
            steps={steps}
            onReset={resetDay}
            onTrack={() => setScreen("tracker")}
            toast={toast}
          />
        )}
      </main>

      <Toast toasts={toasts} />
    </div>
  );
}
