import { useState } from "react";

const API = "http://localhost:3001";

export default function BMIScreen({ onDone, existing }) {
  const [height, setHeight] = useState(existing ? "" : "");
  const [weight, setWeight] = useState(existing ? "" : "");
  const [result, setResult] = useState(existing || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculate() {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) {
      setError("Please enter valid height and weight.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/bmi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height: h, weight: w }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Could not connect to server. Make sure the server is running.");
    }
    setLoading(false);
  }

  const bmiColor = {
    green: "#4ade80",
    orange: "#fb923c",
    red: "#f87171",
  };

  const bmiPercent = result ? Math.min((result.bmi / 40) * 100, 100) : 0;

  return (
    <div className="screen-center">
      <div className="card bmi-card">
        <div className="card-header">
          <h2>Know Your BMI</h2>
          <p className="card-sub">We'll set your daily calorie limit based on your body metrics</p>
        </div>

        <div className="input-row">
          <div className="input-group">
            <label>Height (meters)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 1.72"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
            />
          </div>
          <div className="input-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 68"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
            />
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button className="btn-primary" onClick={calculate} disabled={loading}>
          {loading ? "Calculating..." : "Calculate BMI"}
        </button>

        {result && (
          <div className="bmi-result" style={{ "--accent": bmiColor[result.color] || "#4ade80" }}>
            <div className="bmi-score-row">
              <div className="bmi-score">{result.bmi}</div>
              <div className="bmi-meta">
                <div className="bmi-category" style={{ color: bmiColor[result.color] }}>
                  {result.category}
                </div>
                <div className="bmi-limit">Daily limit: <strong>{result.calLimit} kcal</strong></div>
              </div>
            </div>

            <div className="bmi-bar-wrap">
              <div className="bmi-bar">
                <div className="bmi-bar-fill" style={{ width: `${bmiPercent}%`, background: bmiColor[result.color] }} />
                <div className="bmi-pointer" style={{ left: `${bmiPercent}%` }} />
              </div>
              <div className="bmi-labels">
                <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
              </div>
            </div>

            <div className="bmi-advice">💡 {result.advice}</div>

            <button className="btn-primary" onClick={() => onDone(result)}>
              Start Tracking Meals →
            </button>
          </div>
        )}
      </div>

      <div className="bmi-info-cards">
        {[
          { range: "< 18.5", label: "Underweight", cal: "2500 kcal", color: "#fb923c" },
          { range: "18.5–24.9", label: "Normal", cal: "2200 kcal", color: "#4ade80" },
          { range: "25–29.9", label: "Overweight", cal: "2000 kcal", color: "#fb923c" },
          { range: "> 30", label: "Obese", cal: "1800 kcal", color: "#f87171" },
        ].map((r) => (
          <div key={r.label} className="info-chip" style={{ borderColor: r.color }}>
            <span className="chip-range" style={{ color: r.color }}>{r.range}</span>
            <span className="chip-label">{r.label}</span>
            <span className="chip-cal">{r.cal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
