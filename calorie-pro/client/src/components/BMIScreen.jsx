import { useState } from "react";

const API = "";

const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary", desc: "Little or no exercise", icon: "🪑" },
  { key: "light", label: "Light", desc: "Exercise 1–3 days/week", icon: "🚶" },
  { key: "moderate", label: "Moderate", desc: "Exercise 3–5 days/week", icon: "🏃" },
  { key: "active", label: "Active", desc: "Hard exercise 6–7 days/week", icon: "💪" },
  { key: "veryactive", label: "Very Active", desc: "Physical job or 2x training", icon: "🔥" },
];

export default function BMIScreen({ onDone, existing }) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState("moderate");
  const [result, setResult] = useState(existing || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1=inputs, 2=activity, 3=result

  async function calculate() {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (!h || !w || h <= 0 || w <= 0 || h > 3 || w > 300)
      return setError("Please enter valid height (m) and weight (kg).");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/bmi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height: h, weight: w, age: a || 25, gender, activity }),
      });
      const data = await res.json();
      setResult(data);
      setStep(3);
    } catch {
      setError("Could not connect to server.");
    }
    setLoading(false);
  }

  const colorMap = { green: "#22d3a0", orange: "#f59e0b", red: "#f87171" };
  const bmiPercent = result ? Math.min(((result.bmi - 10) / 35) * 100, 100) : 0;

  const BMI_ZONES = [
    { label: "Underweight", max: 18.5, color: "#60a5fa" },
    { label: "Normal", max: 24.9, color: "#22d3a0" },
    { label: "Overweight", max: 29.9, color: "#f59e0b" },
    { label: "Obese", max: 40, color: "#f87171" },
  ];

  return (
    <div className="bmi-page">
      <div className="bmi-hero">
        <div className="bmi-hero-badge">Step {step} of 3</div>
        <h1 className="bmi-hero-title">
          {step === 1 ? "Your Body Metrics" : step === 2 ? "Activity Level" : "Your Health Profile"}
        </h1>
        <p className="bmi-hero-sub">
          {step === 1 ? "We'll calculate your personalized daily calorie target" :
           step === 2 ? "How active are you on a typical week?" :
           "Here's your personalized nutrition plan"}
        </p>
      </div>

      {step === 1 && (
        <div className="bmi-card">
          <div className="gender-toggle">
            {["male", "female"].map((g) => (
              <button key={g} className={`gender-btn ${gender === g ? "active" : ""}`} onClick={() => setGender(g)}>
                {g === "male" ? "👨 Male" : "👩 Female"}
              </button>
            ))}
          </div>

          <div className="metric-grid">
            <div className="metric-input-group">
              <label>Height</label>
              <div className="metric-input-wrap">
                <input type="number" step="0.01" placeholder="1.72" value={height} onChange={(e) => setHeight(e.target.value)} />
                <span className="metric-unit">m</span>
              </div>
            </div>
            <div className="metric-input-group">
              <label>Weight</label>
              <div className="metric-input-wrap">
                <input type="number" step="0.1" placeholder="68" value={weight} onChange={(e) => setWeight(e.target.value)} />
                <span className="metric-unit">kg</span>
              </div>
            </div>
            <div className="metric-input-group">
              <label>Age</label>
              <div className="metric-input-wrap">
                <input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
                <span className="metric-unit">yrs</span>
              </div>
            </div>
          </div>

          {error && <div className="error-banner">⚠️ {error}</div>}

          <button className="btn-next" onClick={() => {
            if (!height || !weight) return setError("Please enter height and weight.");
            setError(""); setStep(2);
          }}>
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bmi-card">
          <div className="activity-list">
            {ACTIVITY_LEVELS.map((a) => (
              <button key={a.key} className={`activity-row ${activity === a.key ? "active" : ""}`} onClick={() => setActivity(a.key)}>
                <span className="act-icon">{a.icon}</span>
                <div className="act-text">
                  <div className="act-label">{a.label}</div>
                  <div className="act-desc">{a.desc}</div>
                </div>
                <div className={`act-check ${activity === a.key ? "checked" : ""}`}>✓</div>
              </button>
            ))}
          </div>
          <div className="step2-btns">
            <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-next" onClick={calculate} disabled={loading}>
              {loading ? <span className="spinner" /> : "Calculate →"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="result-layout">
          <div className="bmi-result-card">
            <div className="bmi-number-section">
              <div className="bmi-circle" style={{ "--accent": colorMap[result.color] }}>
                <div className="bmi-num">{result.bmi}</div>
                <div className="bmi-label-small">BMI</div>
              </div>
              <div className="bmi-verdict">
                <div className="bmi-category-tag" style={{ color: colorMap[result.color], background: `${colorMap[result.color]}18`, borderColor: `${colorMap[result.color]}40` }}>
                  {result.category}
                </div>
                <div className="bmi-advice-text">{result.advice}</div>
              </div>
            </div>

            {/* BMI Spectrum */}
            <div className="bmi-spectrum">
              <div className="spectrum-bar">
                {BMI_ZONES.map((z) => (
                  <div key={z.label} className="spectrum-zone" style={{ background: z.color + "40", flex: 1 }} />
                ))}
                <div className="spectrum-pointer" style={{ left: `${bmiPercent}%` }}>
                  <div className="sp-dot" style={{ background: colorMap[result.color] }} />
                  <div className="sp-label">{result.bmi}</div>
                </div>
              </div>
              <div className="spectrum-labels">
                {BMI_ZONES.map((z) => <span key={z.label} style={{ color: z.color }}>{z.label}</span>)}
              </div>
            </div>
          </div>

          {/* Macro cards */}
          <div className="macro-cards">
            {[
              { label: "Daily Calories", val: result.calLimit, unit: "kcal", icon: "🔥", color: "#f59e0b", sub: `TDEE: ${result.tdee} kcal` },
              { label: "Protein Target", val: result.proteinTarget, unit: "g", icon: "💪", color: "#22d3a0", sub: "Per day" },
              { label: "Carb Target", val: result.carbTarget, unit: "g", icon: "🌾", color: "#60a5fa", sub: "Per day" },
              { label: "Fat Target", val: result.fatTarget, unit: "g", icon: "🥑", color: "#c084fc", sub: "Per day" },
            ].map((m) => (
              <div key={m.label} className="macro-card" style={{ "--mc": m.color }}>
                <div className="mc-icon">{m.icon}</div>
                <div className="mc-val">{m.val}<span className="mc-unit">{m.unit}</span></div>
                <div className="mc-label">{m.label}</div>
                <div className="mc-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          <button className="btn-start" onClick={() => onDone(result)}>
            🍽 Start Tracking Today's Meals
          </button>

          <button className="btn-redo" onClick={() => setStep(1)}>Recalculate ↺</button>
        </div>
      )}

      {step < 3 && (
        <div className="bmi-info-strip">
          {[
            { range: "< 18.5", label: "Underweight", color: "#60a5fa" },
            { range: "18.5–24.9", label: "Normal", color: "#22d3a0" },
            { range: "25–29.9", label: "Overweight", color: "#f59e0b" },
            { range: "> 30", label: "Obese", color: "#f87171" },
          ].map((r) => (
            <div key={r.label} className="bmi-strip-chip" style={{ borderColor: r.color + "60" }}>
              <span style={{ color: r.color, fontWeight: 700 }}>{r.range}</span>
              <span className="strip-label">{r.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
