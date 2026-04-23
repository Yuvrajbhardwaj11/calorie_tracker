import { useState } from "react";

const API = "";

const ACTIVITY_OPTS = [
  { val: "sedentary", label: "Sedentary", sub: "Desk job, no exercise" },
  { val: "light", label: "Lightly Active", sub: "Exercise 1–3 days/week" },
  { val: "moderate", label: "Moderately Active", sub: "Exercise 3–5 days/week" },
  { val: "active", label: "Very Active", sub: "Hard exercise 6–7 days/week" },
  { val: "very_active", label: "Athlete", sub: "2x training per day" },
];

function BMIGauge({ bmi, color }) {
  const clampedBmi = Math.min(Math.max(bmi, 10), 40);
  const angle = ((clampedBmi - 10) / 30) * 180 - 90;
  const rad = (angle * Math.PI) / 180;
  const cx = 110, cy = 110, r = 85;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  const colorMap = { green: "#00e5a0", orange: "#ff8c42", red: "#ff5c72" };
  const c = colorMap[color] || "#00e5a0";

  return (
    <svg viewBox="0 0 220 120" className="bmi-gauge-svg">
      <defs>
        <linearGradient id="gauge-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff5c72" />
          <stop offset="100%" stopColor="#ff8c42" />
        </linearGradient>
        <linearGradient id="gauge-green" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00e5a0" />
          <stop offset="100%" stopColor="#4d9fff" />
        </linearGradient>
      </defs>
      {/* Track */}
      <path d="M 25 110 A 85 85 0 0 1 195 110" fill="none" stroke="#1e2535" strokeWidth="14" strokeLinecap="round" />
      {/* Danger zone */}
      <path d="M 25 110 A 85 85 0 0 1 60 42" fill="none" stroke="#ff5c72" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
      {/* Normal zone */}
      <path d="M 60 42 A 85 85 0 0 1 150 28" fill="none" stroke="#00e5a0" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
      {/* Overweight zone */}
      <path d="M 150 28 A 85 85 0 0 1 195 110" fill="none" stroke="#ff8c42" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={c} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill={c} />
      <circle cx={cx} cy={cy} r="3" fill="#080a0f" />
      {/* BMI value */}
      <text x={cx} y={cy + 20} textAnchor="middle" fill={c} fontSize="22" fontWeight="700" fontFamily="Clash Display, sans-serif">{bmi}</text>
      {/* Labels */}
      <text x="22" y="118" fill="#4a5568" fontSize="8" fontFamily="Cabinet Grotesk, sans-serif">Under</text>
      <text x="88" y="22" fill="#4a5568" fontSize="8" fontFamily="Cabinet Grotesk, sans-serif" textAnchor="middle">Normal</text>
      <text x="185" y="118" fill="#4a5568" fontSize="8" fontFamily="Cabinet Grotesk, sans-serif" textAnchor="end">Obese</text>
    </svg>
  );
}

export default function BMIScreen({ onDone, existing }) {
  const [form, setForm] = useState({ height: "", weight: "", age: "", gender: "male", activity: "moderate" });
  const [result, setResult] = useState(existing || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function calculate() {
    const h = parseFloat(form.height), w = parseFloat(form.weight), a = parseInt(form.age);
    if (!h || !w || h < 0.5 || h > 3 || w < 20 || w > 300) { setError("Please enter valid height (0.5–3m) and weight (20–300kg)."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/bmi`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height: h, weight: w, age: a || 25, gender: form.gender, activity: form.activity }),
      });
      const data = await res.json();
      setResult(data);
    } catch { setError("Server offline. Check your connection."); }
    setLoading(false);
  }

  const colorMap = { green: "var(--green)", orange: "var(--orange)", red: "var(--red)" };
  const c = result ? (colorMap[result.color] || "var(--green)") : "var(--green)";

  return (
    <div className="slide-up">
      <div className="section-title">Body Profile</div>
      <div className="section-sub">Calculate your BMI and get a personalized calorie target</div>

      <div className="bmi-screen">
        {/* LEFT: FORM */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="input-label">Height (meters)</label>
                <input className="input" type="number" step="0.01" placeholder="1.72" value={form.height} onChange={e => set("height", e.target.value)} />
              </div>
              <div>
                <label className="input-label">Weight (kg)</label>
                <input className="input" type="number" step="0.1" placeholder="68" value={form.weight} onChange={e => set("weight", e.target.value)} />
              </div>
              <div>
                <label className="input-label">Age (years)</label>
                <input className="input" type="number" placeholder="25" value={form.age} onChange={e => set("age", e.target.value)} />
              </div>
              <div>
                <label className="input-label">Gender</label>
                <select className="select" value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label className="input-label">Activity Level</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                {ACTIVITY_OPTS.map(opt => (
                  <div
                    key={opt.val}
                    onClick={() => set("activity", opt.val)}
                    style={{
                      padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                      border: `1px solid ${form.activity === opt.val ? "rgba(0,229,160,0.4)" : "var(--border)"}`,
                      background: form.activity === opt.val ? "var(--green-dim2)" : "var(--surface2)",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.83rem", fontWeight: 600, color: form.activity === opt.val ? "var(--green)" : "var(--text)" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text2)" }}>{opt.sub}</div>
                    </div>
                    {form.activity === opt.val && <span style={{ color: "var(--green)", fontSize: "14px" }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={{ color: "var(--red)", fontSize: "0.82rem", marginTop: "0.8rem", padding: "8px 12px", background: "var(--red-dim)", borderRadius: "8px" }}>{error}</div>}

            <button className="btn btn-primary btn-full" style={{ marginTop: "1.2rem" }} onClick={calculate} disabled={loading}>
              {loading ? "Calculating…" : "Calculate My Profile →"}
            </button>
          </div>

          {/* BMI Scale info */}
          <div className="bmi-scale-cards">
            {[
              { range: "< 18.5", label: "Underweight", cal: "+400 kcal", color: "var(--orange)", bc: "rgba(255,140,66,0.2)" },
              { range: "18.5–24.9", label: "Normal", cal: "TDEE kcal", color: "var(--green)", bc: "rgba(0,229,160,0.2)" },
              { range: "25–29.9", label: "Overweight", cal: "-400 kcal", color: "var(--orange)", bc: "rgba(255,140,66,0.2)" },
              { range: "> 30", label: "Obese", cal: "-600 kcal", color: "var(--red)", bc: "rgba(255,92,114,0.2)" },
            ].map(s => (
              <div key={s.label} className="bmi-scale-card" style={{ borderColor: s.bc, background: `${s.color}08` }}>
                <div className="bsc-range" style={{ color: s.color }}>{s.range}</div>
                <div className="bsc-label" style={{ color: s.color }}>{s.label}</div>
                <div className="bsc-cal">{s.cal}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: RESULT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {result ? (
            <>
              <div className="card" style={{ border: `1px solid ${c}30` }}>
                <div className="bmi-gauge-wrap">
                  <BMIGauge bmi={result.bmi} color={result.color} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: c }}>{result.category}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text2)", marginTop: "4px" }}>{result.advice}</div>
                  </div>
                </div>

                <div className="bmi-stats-grid">
                  <div className="bmi-stat">
                    <div className="bmi-stat-val" style={{ color: "var(--green)" }}>{result.calLimit.toLocaleString()}</div>
                    <div className="bmi-stat-label">Daily Calories</div>
                  </div>
                  <div className="bmi-stat">
                    <div className="bmi-stat-val" style={{ color: "var(--blue)" }}>{result.tdee?.toLocaleString()}</div>
                    <div className="bmi-stat-label">TDEE</div>
                  </div>
                  <div className="bmi-stat">
                    <div className="bmi-stat-val" style={{ color: "var(--purple)" }}>{result.bmr?.toLocaleString()}</div>
                    <div className="bmi-stat-label">BMR</div>
                  </div>
                  <div className="bmi-stat">
                    <div className="bmi-stat-val" style={{ color: "var(--orange)" }}>
                      {result.idealWeight ? `${result.idealWeight.min}–${result.idealWeight.max}` : "—"}
                    </div>
                    <div className="bmi-stat-label">Ideal Weight (kg)</div>
                  </div>
                </div>

                {result.weightToLose && (
                  <div style={{ marginTop: "1rem", padding: "12px", background: "var(--orange-dim)", borderRadius: "10px", fontSize: "0.82rem", color: "var(--orange)" }}>
                    🎯 Goal: Lose <strong>{result.weightToLose} kg</strong> to reach ideal weight range
                  </div>
                )}
                {result.weightToGain && (
                  <div style={{ marginTop: "1rem", padding: "12px", background: "var(--green-dim)", borderRadius: "10px", fontSize: "0.82rem", color: "var(--green)" }}>
                    🎯 Goal: Gain <strong>{result.weightToGain} kg</strong> to reach ideal weight range
                  </div>
                )}

                <button className="btn btn-primary btn-full" style={{ marginTop: "1.2rem" }} onClick={() => onDone(result)}>
                  Start Tracking Today →
                </button>
              </div>

              {/* Macros target */}
              <div className="card">
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text3)", marginBottom: "12px" }}>Daily Macro Targets</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { name: "Protein", val: Math.round(result.calLimit * 0.25 / 4), unit: "g", color: "var(--green)", pct: "25%" },
                    { name: "Carbohydrates", val: Math.round(result.calLimit * 0.5 / 4), unit: "g", color: "var(--blue)", pct: "50%" },
                    { name: "Fats", val: Math.round(result.calLimit * 0.25 / 9), unit: "g", color: "var(--orange)", pct: "25%" },
                  ].map(m => (
                    <div key={m.name} className="progress-wrap">
                      <div className="progress-header">
                        <span style={{ fontSize: "0.78rem", color: "var(--text2)" }}>{m.name}</span>
                        <span style={{ fontSize: "0.78rem", color: m.color, fontFamily: "var(--mono)", fontWeight: 600 }}>{m.val}{m.unit} <span style={{ color: "var(--text3)" }}>({m.pct})</span></span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: m.pct, background: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "1rem" }}>
              <div style={{ fontSize: "4rem", opacity: 0.2 }}>⚡</div>
              <div style={{ fontSize: "0.9rem", color: "var(--text2)", textAlign: "center" }}>Fill in your details and calculate your BMI to get started</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
