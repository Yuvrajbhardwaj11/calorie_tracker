import { useState, useEffect } from "react";

const API = "";

function MacroPie({ protein, carbs, fat }) {
  const total = protein * 4 + carbs * 4 + fat * 9 || 1;
  const p = (protein * 4 / total) * 100;
  const c = (carbs * 4 / total) * 100;
  const f = (fat * 9 / total) * 100;
  const size = 120, cx = 60, cy = 60, r = 50;
  const circumference = 2 * Math.PI * r;

  function arc(startPct, pct, color) {
    const start = (startPct / 100) * circumference;
    const dash = (pct / 100) * circumference;
    return (
      <circle
        key={color} cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="18"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-start + circumference * 0.25}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface3)" strokeWidth="18" />
      {arc(0, p, "var(--green)")}
      {arc(p, c, "var(--blue)")}
      {arc(p + c, f, "var(--orange)")}
    </svg>
  );
}

export default function SummaryScreen({ bmiData, meals, water, steps, onReset, onTrack, toast }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/analyze`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meals, calLimit: bmiData.calLimit }),
        });
        setAnalysis(await res.json());
      } catch {
        // local fallback
        let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0;
        const breakdown = meals.map(m => {
          const mCal = m.items.reduce((s, i) => s + i.cal * i.quantity, 0);
          const mPro = m.items.reduce((s, i) => s + i.protein * i.quantity, 0);
          const mC = m.items.reduce((s, i) => s + (i.carbs || 0) * i.quantity, 0);
          const mF = m.items.reduce((s, i) => s + (i.fat || 0) * i.quantity, 0);
          totalCal += mCal; totalProtein += mPro; totalCarbs += mC; totalFat += mF;
          return { mealName: m.name, calories: Math.round(mCal), protein: Math.round(mPro), carbs: Math.round(mC), fat: Math.round(mF), itemCount: m.items.length };
        });
        const over = totalCal > bmiData.calLimit;
        setAnalysis({
          totalCal: Math.round(totalCal), totalProtein: Math.round(totalProtein),
          totalCarbs: Math.round(totalCarbs), totalFat: Math.round(totalFat), totalFiber: Math.round(totalFiber),
          breakdown, status: over ? "over" : totalCal < bmiData.calLimit * 0.5 ? "under" : "good",
          message: over ? `Exceeded by ${Math.round(totalCal - bmiData.calLimit)} kcal` : "Good tracking!",
          remaining: Math.max(0, Math.round(bmiData.calLimit - totalCal)),
          targets: { protein: Math.round(bmiData.calLimit * 0.25 / 4), carbs: Math.round(bmiData.calLimit * 0.5 / 4), fat: Math.round(bmiData.calLimit * 0.25 / 9) }
        });
      }
      setLoading(false);
    }
    run();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontSize: "2rem", animation: "pulse 1.5s infinite" }}>📊</div>
      <div style={{ color: "var(--text2)" }}>Analyzing your day…</div>
    </div>
  );

  const statusCfg = {
    over: { color: "var(--red)", bg: "var(--red-dim)", border: "rgba(255,92,114,0.25)", icon: "⚠️", label: "Over Limit" },
    under: { color: "var(--orange)", bg: "var(--orange-dim)", border: "rgba(255,140,66,0.25)", icon: "📉", label: "Under Target" },
    low: { color: "var(--yellow)", bg: "var(--yellow-dim)", border: "rgba(255,209,102,0.25)", icon: "⚡", label: "A Bit Low" },
    good: { color: "var(--green)", bg: "var(--green-dim)", border: "rgba(0,229,160,0.25)", icon: "✅", label: "On Track" },
  };
  const cfg = statusCfg[analysis.status] || statusCfg.good;
  const calPct = Math.min((analysis.totalCal / bmiData.calLimit) * 100, 100);
  const biggestMeal = analysis.breakdown.reduce((a, b) => b.calories > a.calories ? b : a, { calories: 0 });

  // Wellness score
  const score = Math.round(
    (analysis.status === "good" ? 40 : analysis.status === "low" ? 25 : analysis.status === "over" ? 15 : 20) +
    Math.min((water / 8) * 20, 20) +
    Math.min((steps / 10000) * 20, 20) +
    Math.min((analysis.totalProtein / (analysis.targets?.protein || 50)) * 20, 20)
  );
  const scoreColor = score >= 75 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--orange)";

  return (
    <div className="slide-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="section-title">Daily Summary</div>
          <div className="section-sub" style={{ marginBottom: 0 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-outline btn-sm" onClick={onTrack}>← Back to Tracking</button>
          <button className="btn btn-primary btn-sm" onClick={onReset}>🔄 New Day</button>
        </div>
      </div>

      {/* Hero */}
      <div className="summary-hero" style={{ background: cfg.bg, borderColor: cfg.border, marginBottom: "1.5rem" }}>
        <div className="summary-hero-icon">{cfg.icon}</div>
        <div className="summary-hero-msg" style={{ color: cfg.color }}>{analysis.message}</div>
        <div className="summary-hero-sub">
          {analysis.status === "good" ? "Keep up the great work! Consistency is key to reaching your goals." :
           analysis.status === "over" ? "No worries — get some movement in and eat lighter tomorrow." :
           "Try to eat regular, balanced meals throughout the day."}
        </div>
      </div>

      <div className="summary-grid">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* Macro overview */}
          <div className="card">
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", marginBottom: "14px" }}>Nutrition Overview</div>
            <div className="summary-macros">
              {[
                { label: "Calories", val: analysis.totalCal, unit: "kcal", target: bmiData.calLimit, color: cfg.color },
                { label: "Protein", val: analysis.totalProtein, unit: "g", target: analysis.targets?.protein, color: "var(--green)" },
                { label: "Carbs", val: analysis.totalCarbs, unit: "g", target: analysis.targets?.carbs, color: "var(--blue)" },
                { label: "Fats", val: analysis.totalFat, unit: "g", target: analysis.targets?.fat, color: "var(--orange)" },
              ].map(m => (
                <div key={m.label} className="sm-card">
                  <div className="sm-val" style={{ color: m.color }}>{m.val}</div>
                  <div className="sm-label">{m.label}</div>
                  <div className="sm-target">Target: {m.target}{m.unit}</div>
                  <div style={{ marginTop: "6px" }}>
                    <div className="progress-track" style={{ height: "4px" }}>
                      <div className="progress-fill" style={{ width: `${Math.min((m.val / (m.target || 1)) * 100, 100)}%`, background: m.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calorie bar */}
            <div style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "6px" }}>
                <span style={{ color: "var(--text2)" }}>Calorie Progress</span>
                <span style={{ color: cfg.color, fontFamily: "var(--mono)", fontWeight: 600 }}>{Math.round(calPct)}%</span>
              </div>
              <div className="progress-track" style={{ height: "12px", borderRadius: "6px" }}>
                <div className="progress-fill" style={{ width: `${calPct}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`, borderRadius: "6px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text3)", marginTop: "4px" }}>
                <span>0 kcal</span>
                <span>{analysis.remaining > 0 ? `${analysis.remaining} kcal remaining` : `${Math.round(analysis.totalCal - bmiData.calLimit)} over`}</span>
                <span>{bmiData.calLimit} kcal</span>
              </div>
            </div>
          </div>

          {/* Meal breakdown */}
          <div className="card">
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", marginBottom: "14px" }}>Meal Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {analysis.breakdown.map(m => {
                const meal = meals.find(x => x.name === m.mealName);
                const mealPct = analysis.totalCal > 0 ? (m.calories / analysis.totalCal) * 100 : 0;
                const isBiggest = m.mealName === biggestMeal.mealName && m.calories > 0;
                return (
                  <div key={m.mealName} className="breakdown-row">
                    <div className="br-top">
                      <span className="br-icon">{meal?.icon || "🍽"}</span>
                      <span className="br-name">{m.mealName}</span>
                      {isBiggest && <span className="chip chip-yellow" style={{ fontSize: "0.6rem" }}>Biggest Meal</span>}
                      <span className="br-cal">{m.calories} kcal</span>
                      <span className="br-pct">{Math.round(mealPct)}%</span>
                    </div>
                    <div className="br-bar">
                      <div className="br-fill" style={{ width: `${mealPct}%`, background: isBiggest ? "var(--yellow)" : meal?.color || "var(--green)" }} />
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text3)", display: "flex", gap: "12px" }}>
                      <span>P: {m.protein}g</span>
                      <span>C: {m.carbs}g</span>
                      <span>F: {m.fat}g</span>
                      <span>{m.itemCount} items</span>
                    </div>
                    {meal?.items.length > 0 && (
                      <div className="br-chips">
                        {meal.items.map((it, j) => (
                          <span key={j} className="br-chip">{it.emoji || ""} {it.name} ×{it.quantity}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Wellness Score */}
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", marginBottom: "14px" }}>Wellness Score</div>
            <div style={{ position: "relative", display: "inline-block" }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface3)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="10"
                  strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px", transition: "stroke-dasharray 1s ease" }}
                />
                <text x="50" y="54" textAnchor="middle" fill={scoreColor} fontSize="20" fontWeight="700" fontFamily="Clash Display">{score}</text>
              </svg>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text2)", marginTop: "8px" }}>
              {score >= 80 ? "Excellent day! 🏆" : score >= 60 ? "Good progress! 💪" : "Room to improve 📈"}
            </div>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
              {[
                { label: "Calories", val: analysis.status === "good" ? "✓" : "✗", ok: analysis.status === "good" },
                { label: "Hydration", val: `${water}/8 glasses`, ok: water >= 6 },
                { label: "Steps", val: `${steps.toLocaleString()}`, ok: steps >= 8000 },
                { label: "Protein", val: `${analysis.totalProtein}g`, ok: analysis.totalProtein >= (analysis.targets?.protein || 50) * 0.8 },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", padding: "6px 10px", background: "var(--surface2)", borderRadius: "8px" }}>
                  <span style={{ color: "var(--text2)" }}>{item.label}</span>
                  <span style={{ color: item.ok ? "var(--green)" : "var(--orange)", fontWeight: 600 }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Macro pie */}
          <div className="card">
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", marginBottom: "14px" }}>Macro Split</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <MacroPie protein={analysis.totalProtein} carbs={analysis.totalCarbs} fat={analysis.totalFat} />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { name: "Protein", val: analysis.totalProtein, unit: "g", color: "var(--green)", cal: analysis.totalProtein * 4 },
                  { name: "Carbs", val: analysis.totalCarbs, unit: "g", color: "var(--blue)", cal: analysis.totalCarbs * 4 },
                  { name: "Fats", val: analysis.totalFat, unit: "g", color: "var(--orange)", cal: analysis.totalFat * 9 },
                ].map(m => (
                  <div key={m.name} className="macro-item">
                    <div className="macro-dot" style={{ background: m.color }} />
                    <div>
                      <div className="macro-name">{m.name}</div>
                      <div className="macro-val">{m.val}{m.unit} <span style={{ color: "var(--text3)", fontSize: "0.7rem" }}>({m.cal} kcal)</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card" style={{ background: "var(--green-dim2)", border: "1px solid rgba(0,229,160,0.1)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--green)", marginBottom: "10px" }}>💡 Tomorrow's Tips</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                analysis.totalProtein < (analysis.targets?.protein || 50) * 0.8 && "Boost protein — add eggs, paneer or dal to your meals",
                water < 6 && "Drink more water — aim for 8 glasses daily",
                steps < 8000 && "Try a 30-min walk to hit your step goal",
                analysis.status === "over" && "Choose grilled/steamed over fried options",
                analysis.status === "good" && "Great balance! Keep this routine going",
              ].filter(Boolean).slice(0, 3).map((tip, i) => (
                <div key={i} style={{ fontSize: "0.78rem", color: "var(--text2)", display: "flex", gap: "8px" }}>
                  <span style={{ color: "var(--green)" }}>→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
