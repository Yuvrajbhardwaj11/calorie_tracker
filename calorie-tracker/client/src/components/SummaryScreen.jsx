import { useState, useEffect } from "react";

const API = "http://localhost:3001";

export default function SummaryScreen({ bmiData, meals, onReset }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyze() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meals, calLimit: bmiData.calLimit }),
        });
        const data = await res.json();
        setAnalysis(data);
      } catch {
        // fallback: compute locally
        let totalCal = 0, totalProtein = 0;
        const breakdown = meals.map((m) => {
          const mCal = m.items.reduce((s, i) => s + i.calorie * i.quantity, 0);
          const mPro = m.items.reduce((s, i) => s + i.protein * i.quantity, 0);
          totalCal += mCal; totalProtein += mPro;
          return { mealName: m.name, calories: mCal, protein: mPro };
        });
        const over = totalCal > bmiData.calLimit;
        setAnalysis({
          totalCal, totalProtein, breakdown,
          status: over ? "over" : totalCal < bmiData.calLimit * 0.6 ? "under" : "good",
          message: over
            ? `Exceeded by ${totalCal - bmiData.calLimit} kcal`
            : totalCal < bmiData.calLimit * 0.6
            ? "Too few calories eaten today!"
            : "Great job staying within your limit!",
        });
      }
      setLoading(false);
    }
    analyze();
  }, []);

  const statusConfig = {
    over: { color: "#f87171", icon: "⚠️", bg: "rgba(248,113,113,0.08)" },
    under: { color: "#fb923c", icon: "📉", bg: "rgba(251,146,60,0.08)" },
    good: { color: "#4ade80", icon: "✅", bg: "rgba(74,222,128,0.08)" },
  };

  if (loading) return <div className="loading-screen">Analyzing your day…</div>;

  const cfg = statusConfig[analysis.status];
  const pct = Math.min((analysis.totalCal / bmiData.calLimit) * 100, 100);
  const biggestMeal = analysis.breakdown.reduce((a, b) => (b.calories > a.calories ? b : a), { calories: 0 });

  return (
    <div className="summary-screen">
      <div className="summary-hero" style={{ background: cfg.bg, borderColor: cfg.color }}>
        <div className="summary-icon">{cfg.icon}</div>
        <div className="summary-message" style={{ color: cfg.color }}>{analysis.message}</div>
        <div className="summary-tip">💡 Balance your meals with protein-rich foods for a healthier lifestyle.</div>
      </div>

      <div className="summary-stats-row">
        <div className="stat-card">
          <div className="sc-val" style={{ color: cfg.color }}>{analysis.totalCal}</div>
          <div className="sc-label">Calories consumed</div>
          <div className="sc-sub">/ {bmiData.calLimit} kcal limit</div>
        </div>
        <div className="stat-card">
          <div className="sc-val" style={{ color: "#60a5fa" }}>{analysis.totalProtein}g</div>
          <div className="sc-label">Total Protein</div>
          <div className="sc-sub">~{Math.round(analysis.totalProtein / 0.8)}% of daily need</div>
        </div>
        <div className="stat-card">
          <div className="sc-val" style={{ color: "#c084fc" }}>{bmiData.bmi}</div>
          <div className="sc-label">BMI</div>
          <div className="sc-sub">{bmiData.category}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="summary-bar-section">
        <div className="summary-bar-label">
          <span>Calorie Progress</span>
          <span style={{ color: cfg.color }}>{Math.round(pct)}%</span>
        </div>
        <div className="summary-bar">
          <div className="summary-bar-fill" style={{ width: `${pct}%`, background: cfg.color }} />
        </div>
      </div>

      {/* Meal breakdown */}
      <div className="meal-breakdown">
        <h3>Meal Breakdown</h3>
        {analysis.breakdown.map((m) => {
          const mPct = analysis.totalCal > 0 ? (m.calories / analysis.totalCal) * 100 : 0;
          const meal = meals.find((x) => x.name === m.mealName);
          return (
            <div key={m.mealName} className="breakdown-row">
              <div className="br-header">
                <span className="br-icon">{meal?.icon || "🍽"}</span>
                <span className="br-name">{m.mealName}</span>
                <span className="br-cal">{m.calories} kcal</span>
                <span className="br-pro">{m.protein}g pro</span>
              </div>
              <div className="br-bar">
                <div
                  className="br-fill"
                  style={{
                    width: `${mPct}%`,
                    background: m.mealName === biggestMeal.mealName ? "#f59e0b" : "#4ade80",
                  }}
                />
              </div>
              {meal?.items.length > 0 && (
                <div className="br-items">
                  {meal.items.map((it, i) => (
                    <span key={i} className="br-item-chip">
                      {it.name} ×{it.quantity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="summary-actions">
        <button className="btn-primary" onClick={onReset}>🔄 Track Another Day</button>
      </div>
    </div>
  );
}
