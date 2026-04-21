import { useState } from "react";
import BMIScreen from "./components/BMIScreen";
import TrackerScreen from "./components/TrackerScreen";
import SummaryScreen from "./components/SummaryScreen";
import "./index.css";

export default function App() {
  const [screen, setScreen] = useState("bmi");
  const [bmiData, setBmiData] = useState(null);
  const [meals, setMeals] = useState([
    { name: "Breakfast", icon: "🌅", items: [] },
    { name: "Morning Snack", icon: "🍎", items: [] },
    { name: "Lunch", icon: "☀️", items: [] },
    { name: "Evening Snack", icon: "🌤", items: [] },
    { name: "Dinner", icon: "🌙", items: [] },
  ]);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🍽</span>
            <div>
              <div className="logo-text">CalorieTracker</div>
              <div className="logo-sub">by Yuvraj</div>
            </div>
          </div>
          {bmiData && (
            <nav className="nav-pills">
              {["bmi", "tracker", "summary"].map((s) => (
                <button
                  key={s}
                  className={`nav-pill ${screen === s ? "active" : ""}`}
                  onClick={() => setScreen(s)}
                >
                  {s === "bmi" ? "BMI" : s === "tracker" ? "Meals" : "Summary"}
                </button>
              ))}
            </nav>
          )}
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
            onSummary={() => setScreen("summary")}
          />
        )}
        {screen === "summary" && bmiData && (
          <SummaryScreen
            bmiData={bmiData}
            meals={meals}
            onReset={() => {
              setMeals([
                { name: "Breakfast", icon: "🌅", items: [] },
                { name: "Morning Snack", icon: "🍎", items: [] },
                { name: "Lunch", icon: "☀️", items: [] },
                { name: "Evening Snack", icon: "🌤", items: [] },
                { name: "Dinner", icon: "🌙", items: [] },
              ]);
              setScreen("tracker");
            }}
          />
        )}
      </main>
    </div>
  );
}
