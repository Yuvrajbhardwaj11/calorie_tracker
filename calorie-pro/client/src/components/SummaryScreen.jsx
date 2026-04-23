import { useState, useEffect } from "react";

const API = "";

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="donut-empty">No data</div>;
  let cumulative = 0;
  const r = 60, circ = 2 * Math.PI * r;
  const segments = data.map((d) => {
    const pct = d.value / total;
    const seg = { ...d, offset: circ * (1 - cumulative), dash: circ * pct };
    cumulative += pct;
    return seg;
  });

  return (
    <div className="donut-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
        {segments.map((seg) => (
          <circle key={seg.label} cx="80" cy="80" r={r} fill="none" stroke={seg.color}
            strokeWidth="20" strokeDasharray={`${seg.dash * circ / circ} ${circ}`}
            strokeDashoffset={seg.offset} strokeLinecap="butt" transform="rotate(-90 80 80)" />
        ))}
        <text x="80" y="76" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">{total}</text>
        <text x="80" y="92" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">kcal</text>
      </svg>
      <div className="donut-legend">
        {data.map((d) => (
          <div key={d.label} className="dl-row">
            <div className="dl-dot" style={{ background: d.color }} />
            <span className="dl-label">{d.label}</span>
            <span className="dl-val">{d.value}{d.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SummaryScreen({ bmiData, meals, waterGlasses, steps, onReset }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState([]);

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
        buildTips(data);
      } catch {
        // fallback
        let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
        const breakdown = meals.map((m) => {
          const mCal = m.items.reduce((s, i) => s + i.calorie * i.quantity, 0);
          const mPro = m.items.reduce((s, i) => s + i.protein * i.quantity, 0);
          const mCarbs = m.items.reduce((s, i) => s + (i.carbs || 0) * i.quantity, 0);
          const mFat = m.items.reduce((s, i) => s + (i.fat || 0) * i.quantity, 0);
          totalCal += mCal; totalProtein += mPro; totalCarbs += mCarbs; totalFat += mFat;
          return { mealName: m.name, calories: mCal, protein: mPro, carbs: mCarbs, fat: mFat };
        });
        const d = {
          totalCal, totalProtein, totalCarbs: totalCarbs || 0, totalFat: totalFat || 0, breakdown,
          status: totalCal > bmiData.calLimit ? "over" : totalCal < bmiData.calLimit * 0.6 ? "under" : "good",
          message: totalCal > bmiData.calLimit ? `Exceeded by ${totalCal - bmiData.calLimit} kcal`
            : totalCal < bmiData.calLimit * 0.6 ? "Too few calories — eat more nutritious food!"
            : "Great job staying within your calorie limit!",
        };
        setAnalysis(d);
        buildTips(d);
      }
      setLoading(false);
    }
    analyze();
  }, []);

  function buildTips(d) {
    const t = [];
    if (d.totalProtein < (bmiData.proteinTarget || 80) * 0.7)
      t.push({ icon: "💪", tip: "Protein intake is low. Add more dal, paneer, eggs, or chicken to your meals." });
    if (d.totalCal > bmiData.calLimit)
      t.push({ icon: "🍽", tip: "You exceeded your calorie limit. Try lighter options for dinner tomorrow." });
    if (waterGlasses < 6)
      t.push({ icon: "💧", tip: "Drink more water! Aim for 8 glasses per day for better metabolism." });
    if (steps < 5000)
      t.push({ icon: "🚶", tip: "You've walked less than 5,000 steps. Even a 20-minute walk helps!" });
    if (d.status === "under")
      t.push({ icon: "🥗", tip: "You're under-eating. Include more wholesome foods like rajma, paneer, or oats." });
    if (t.length === 0)
      t.push({ icon: "🌟", tip: "Excellent day! You balanced your macros and calories well. Keep it up!" });
    setTips(t);
  }

  const statusConfig = {
    over:  { color: "#f87171", icon: "⚠️", bg: "rgba(248,113,113,0.08)", label: "Over Limit" },
    under: { color: "#f59e0b", icon: "📉", bg: "rgba(245,158,11,0.08)", label: "Under-eating" },
    good:  { color: "#22d3a0", icon: "✅", bg: "rgba(34,211,160,0.08)", label: "On Track" },
  };

  if (loading) return (
    <div className="summary-loading">
      <div className="sl-spinner" />
      <div>Analyzing your day…</div>
    </div>
  );

  const cfg = statusConfig[analysis.status] || statusConfig.good;
  const pct = Math.min((analysis.totalCal / bmiData.calLimit) * 100, 100);
  const biggestMeal = analysis.breakdown.reduce((a, b) => b.calories > a.calories ? b : a, { calories: 0 });

  const macroDonutData = [
    { label: "Protein", value: Math.round(analysis.totalProtein * 4), color: "#22d3a0", unit: "kcal" },
    { label: "Carbs",   value: Math.round((analysis.totalCarbs || 0) * 4), color: "#60a5fa", unit: "kcal" },
    { label: "Fat",     value: Math.round((analysis.totalFat || 0) * 9), color: "#f59e0b", unit: "kcal" },
  ];

  return (
    <div className="summary-page">
      {/* Status Hero */}
      <div className="summary-hero" style={{ background: cfg.bg, borderColor: cfg.color + "40" }}>
        <div className="sh-icon">{cfg.icon}</div>
        <div>
          <div className="sh-status" style={{ color: cfg.color }}>{cfg.label}</div>
          <div className="sh-message">{analysis.message}</div>
        </div>
      </div>

      {/* Key stats row */}
      <div className="summary-stats-row">
        {[
          { icon: "🔥", val: analysis.totalCal, label: "Calories", sub: `/ ${bmiData.calLimit} kcal`, color: cfg.color },
          { icon: "💪", val: `${analysis.totalProtein}g`, label: "Protein", sub: `/ ${bmiData.proteinTarget || 120}g target`, color: "#22d3a0" },
          { icon: "💧", val: waterGlasses, label: "Glasses", sub: "/ 8 target", color: "#60a5fa" },
          { icon: "🚶", val: steps.toLocaleString(), label: "Steps", sub: "/ 10,000 goal", color: "#c084fc" },
        ].map((s) => (
          <div key={s.label} className="sum-stat-card">
            <div className="ssc-icon">{s.icon}</div>
            <div className="ssc-val" style={{ color: s.color }}>{s.val}</div>
            <div className="ssc-label">{s.label}</div>
            <div className="ssc-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="cal-progress-section">
        <div className="cps-header">
          <span>Calorie Progress</span>
          <span style={{ color: cfg.color, fontWeight: 700 }}>{Math.round(pct)}%</span>
        </div>
        <div className="cps-bar">
          <div className="cps-fill" style={{ width: `${pct}%`, background: cfg.color }} />
        </div>
        <div className="cps-labels">
          <span>0</span>
          <span>{Math.round(bmiData.calLimit / 2)}</span>
          <span>{bmiData.calLimit} kcal</span>
        </div>
      </div>

      {/* Two-column: donut + breakdown */}
      <div className="summary-columns">
        <div className="summary-col">
          <div className="col-title">Macro Split</div>
          <DonutChart data={macroDonutData} />
        </div>

        <div className="summary-col">
          <div className="col-title">Meal Breakdown</div>
          <div className="meal-breakdown-list">
            {analysis.breakdown.map((m) => {
              const meal = meals.find((x) => x.name === m.mealName);
              const mPct = analysis.totalCal > 0 ? (m.calories / analysis.totalCal) * 100 : 0;
              const isBig = m.mealName === biggestMeal.mealName && m.calories > 0;
              return (
                <div key={m.mealName} className={`breakdown-row ${isBig ? "biggest" : ""}`}>
                  <span className="br-icon">{meal?.icon || "🍽"}</span>
                  <div className="br-info">
                    <div className="br-name-row">
                      <span>{m.mealName}</span>
                      {isBig && <span className="br-big-tag">Biggest</span>}
                    </div>
                    <div className="br-bar-wrap">
                      <div className="br-bar"><div className="br-fill" style={{ width: `${mPct}%`, background: isBig ? "#f59e0b" : "#22d3a0" }} /></div>
                    </div>
                    {meal?.items?.length > 0 && (
                      <div className="br-items-chips">
                        {meal.items.map((it, i) => <span key={i} className="bic">{it.emoji} {it.name} ×{it.quantity}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="br-cal-col">
                    <span className="br-cal">{m.calories}</span>
                    <span className="br-cal-unit">kcal</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section">
        <div className="col-title">💬 Today's Tips</div>
        <div className="tips-list">
          {tips.map((t, i) => (
            <div key={i} className="tip-row">
              <span className="tip-icon">{t.icon}</span>
              <span className="tip-text">{t.tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-actions">
        <button className="btn-reset" onClick={onReset}>🔄 Track Another Day</button>
      </div>
    </div>
  );
}
