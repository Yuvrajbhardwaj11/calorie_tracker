import { useState, useEffect } from "react";
import BMIScreen from "./components/BMIScreen";
import TrackerScreen from "./components/TrackerScreen";
import SummaryScreen from "./components/SummaryScreen";
import "./index.css";

const DEFAULT_MEALS = [
  { name: "Breakfast", icon: "🌅", items: [], time: "7–9 AM" },
  { name: "Morning Snack", icon: "🍎", items: [], time: "10–11 AM" },
  { name: "Lunch", icon: "☀️", items: [], time: "12–2 PM" },
  { name: "Evening Snack", icon: "🌤", items: [], time: "4–6 PM" },
  { name: "Dinner", icon: "🌙", items: [], time: "7–9 PM" },
];

export default function App() {
  const [screen, setScreen] = useState("bmi");
  const [bmiData, setBmiData] = useState(null);
  const [meals, setMeals] = useState(DEFAULT_MEALS);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [steps, setSteps] = useState(0);

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nutritrak_state");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.bmiData) { setBmiData(s.bmiData); setScreen("tracker"); }
        if (s.meals) setMeals(s.meals);
        if (s.waterGlasses) setWaterGlasses(s.waterGlasses);
        if (s.steps) setSteps(s.steps);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("nutritrak_state", JSON.stringify({ bmiData, meals, waterGlasses, steps }));
    } catch {}
  }, [bmiData, meals, waterGlasses, steps]);

  const totalCal = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.calorie * i.quantity, 0), 0);

  const navItems = [
    { key: "bmi", label: "Profile", icon: "⚡" },
    { key: "tracker", label: "Track", icon: "🍽" },
    { key: "summary", label: "Summary", icon: "📊" },
  ];

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon-wrap"><span>🥗</span></div>
            <div>
              <div className="logo-text">NutriTrak</div>
              <div className="logo-sub">Indian Food Tracker</div>
            </div>
          </div>

          {bmiData && (
            <div className="header-center">
              <div className="header-cal-pill">
                <span className="hc-consumed">{totalCal}</span>
                <span className="hc-sep">/</span>
                <span className="hc-limit">{bmiData.calLimit} kcal</span>
              </div>
            </div>
          )}

          <nav className="nav-pills">
            {navItems.map((n) => (
              <button
                key={n.key}
                className={`nav-pill ${screen === n.key ? "active" : ""} ${!bmiData && n.key !== "bmi" ? "disabled" : ""}`}
                onClick={() => { if (bmiData || n.key === "bmi") setScreen(n.key); }}
              >
                <span className="np-icon">{n.icon}</span>
                <span className="np-label">{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {screen === "bmi" && (
          <BMIScreen
            onDone={(data) => { setBmiData(data); setScreen("tracker"); }}
            existing={bmiData}
          />
        )}
        {screen === "tracker" && bmiData && (
          <TrackerScreen
            bmiData={bmiData}
            meals={meals}
            setMeals={setMeals}
            waterGlasses={waterGlasses}
            setWaterGlasses={setWaterGlasses}
            steps={steps}
            setSteps={setSteps}
            onSummary={() => setScreen("summary")}
          />
        )}
        {screen === "summary" && bmiData && (
          <SummaryScreen
            bmiData={bmiData}
            meals={meals}
            waterGlasses={waterGlasses}
            steps={steps}
            onReset={() => {
              setMeals(DEFAULT_MEALS);
              setWaterGlasses(0);
              setSteps(0);
              setScreen("tracker");
            }}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>Made with ❤️ by Yuvraj · NutriTrak v2.0</span>
      </footer>
    </div>
  );
}
