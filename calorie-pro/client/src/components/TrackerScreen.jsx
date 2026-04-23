import { useState, useRef, useEffect } from "react";

const API = "";

const QUICK_FOODS = ["banana", "oats", "boiled egg", "roti", "grilled chicken", "green tea", "almonds", "curd rice"];

const CATEGORIES = ["All", "Breakfast", "South Indian", "North Indian", "Biryani & Rice", "Eggs & Meat", "Street Food", "Fruits", "Beverages", "Nuts & Dry Fruits", "Sweets", "Salads"];

function FoodSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function search(q, cat) {
    if (q.length < 1 && cat === "All") { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat !== "All") params.set("category", cat);
      const res = await fetch(`${API}/api/foods?${params}`);
      const data = await res.json();
      setResults(data); setOpen(true);
    } catch { setResults([]); }
    setLoading(false);
  }

  function handleQ(q) { setQuery(q); search(q, category); }
  function handleCat(cat) { setCategory(cat); search(query, cat); setOpen(true); }

  function pick(food) {
    onSelect(food); setQuery(""); setResults([]); setOpen(false);
  }

  return (
    <div ref={ref}>
      <div className="cat-filters">
        {CATEGORIES.slice(0, 7).map(c => (
          <button key={c} className={`cat-btn ${category === c ? "active" : ""}`} onClick={() => handleCat(c)}>{c}</button>
        ))}
        {CATEGORIES.slice(7).map(c => (
          <button key={c} className={`cat-btn ${category === c ? "active" : ""}`} onClick={() => handleCat(c)}>{c}</button>
        ))}
      </div>
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search 300+ Indian foods… (idli, chicken curry, mango…)"
          value={query}
          onChange={e => handleQ(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />
        {open && (
          <div className="dropdown">
            {loading && <div className="dropdown-empty">Searching…</div>}
            {!loading && results.length === 0 && <div className="dropdown-empty">No foods found. Try another name.</div>}
            {results.map(f => (
              <div key={f.name} className="dropdown-item" onClick={() => pick(f)}>
                <div className="di-left">
                  <span className="di-emoji">{f.emoji || "🍽"}</span>
                  <div>
                    <div className="di-name">{f.name}</div>
                    <div className="di-cat">{f.category}</div>
                  </div>
                </div>
                <div className="di-right">
                  <div className="di-cal">{f.cal} kcal</div>
                  <div className="di-macros">P:{f.protein}g C:{f.carbs}g F:{f.fat}g</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MealCard({ meal, mealIndex, onAddItem, onRemoveItem, calLimit, toast }) {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [suggestion, setSuggestion] = useState(null);

  const mealCal = meal.items.reduce((s, i) => s + i.cal * i.quantity, 0);
  const mealPro = meal.items.reduce((s, i) => s + i.protein * i.quantity, 0);

  async function add() {
    if (!selected) return;
    onAddItem(mealIndex, { ...selected, quantity: qty });
    toast(`Added ${selected.name} ✓`);

    // get suggestion
    try {
      const res = await fetch(`${API}/api/suggest`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentFood: selected.name, maxCalories: selected.cal }),
      });
      const alt = await res.json();
      setSuggestion(alt);
      setTimeout(() => setSuggestion(null), 6000);
    } catch {}

    setSelected(null); setQty(1);
  }

  return (
    <div className="meal-card">
      <div className="meal-card-header" onClick={() => setOpen(o => !o)}>
        <div className="meal-header-left">
          <div className="meal-icon-wrap" style={{ background: meal.bg }}>
            <span style={{ fontSize: "1.3rem" }}>{meal.icon}</span>
          </div>
          <div>
            <div className="meal-title">{meal.name}</div>
            <div className="meal-subtitle">{meal.items.length} item{meal.items.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div className="meal-header-right">
          {mealCal > 0 && (
            <>
              <div className="meal-cal-badge" style={{ background: `${meal.color}15`, color: meal.color }}>
                {Math.round(mealCal)} kcal
              </div>
              <div className="meal-cal-badge" style={{ background: "var(--blue-dim)", color: "var(--blue)", fontSize: "0.7rem" }}>
                {Math.round(mealPro)}g P
              </div>
            </>
          )}
          <span className={`meal-chevron ${open ? "open" : ""}`}>▼</span>
        </div>
      </div>

      {open && (
        <div className="meal-body">
          {meal.items.length > 0 && (
            <div className="meal-items">
              {meal.items.map((item, i) => (
                <div key={i} className="meal-item">
                  <span className="mi-emoji">{item.emoji || "🍽"}</span>
                  <span className="mi-name">{item.name}</span>
                  <span className="mi-qty">×{item.quantity}</span>
                  <span className="mi-cal">{Math.round(item.cal * item.quantity)} kcal</span>
                  <span className="mi-macros">P:{Math.round(item.protein * item.quantity)}g C:{Math.round((item.carbs||0) * item.quantity)}g</span>
                  <button className="mi-remove" onClick={() => onRemoveItem(mealIndex, i)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="meal-add-row">
            <div style={{ flex: 1 }}>
              <FoodSearch onSelect={setSelected} />
              {selected && (
                <div style={{ marginTop: "8px", padding: "8px 12px", background: "var(--green-dim2)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{selected.emoji || "🍽"}</span>
                    <div>
                      <div style={{ fontSize: "0.83rem", color: "var(--green)", fontWeight: 600 }}>{selected.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text2)" }}>{selected.cal} kcal · {selected.protein}g protein per serving</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div className="qty-pill">
                      <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                      <span className="qty-val">{qty}</span>
                      <button className="qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={add}>Add</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick add */}
          <div style={{ padding: "0 0.6rem 0.6rem" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text3)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick Add</div>
            <div className="quick-foods">
              {QUICK_FOODS.slice(0, 6).map(f => (
                <button key={f} className="quick-food-btn" onClick={async () => {
                  try {
                    const res = await fetch(`${API}/api/foods?q=${encodeURIComponent(f)}`);
                    const data = await res.json();
                    if (data[0]) { onAddItem(mealIndex, { ...data[0], quantity: 1 }); toast(`Added ${data[0].name} ✓`); }
                  } catch {}
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {suggestion && (
            <div className="suggestion-tip">
              <span>💡</span>
              <div>
                Healthier alternative: <strong>{suggestion.name}</strong> — {suggestion.cal} kcal with {suggestion.protein}g protein. Better macros for your goals!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackerScreen({ bmiData, meals, setMeals, water, setWater, steps, setSteps, onSummary, toast }) {
  const totalCal = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.cal * i.quantity, 0), 0);
  const totalPro = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.protein * i.quantity, 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + (i.carbs||0) * i.quantity, 0), 0);
  const totalFat = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + (i.fat||0) * i.quantity, 0), 0);
  const pct = Math.min((totalCal / bmiData.calLimit) * 100, 100);
  const remaining = Math.max(0, Math.round(bmiData.calLimit - totalCal));
  const over = totalCal > bmiData.calLimit;

  function addItem(mealIndex, item) {
    setMeals(prev => prev.map((m, i) => i === mealIndex ? { ...m, items: [...m.items, item] } : m));
  }
  function removeItem(mealIndex, itemIndex) {
    setMeals(prev => prev.map((m, i) => i === mealIndex ? { ...m, items: m.items.filter((_, j) => j !== itemIndex) } : m));
  }

  const barColor = over ? "var(--red)" : pct > 85 ? "var(--orange)" : "var(--green)";
  const totalMacros = totalPro * 4 + totalCarbs * 4 + totalFat * 9 || 1;

  return (
    <div className="slide-up">
      {/* Sticky Bar */}
      <div className="tracker-bar">
        <div className="tracker-bar-inner">
          <div className="tbar-stats">
            <div className="tbar-stat">
              <div className="tbar-val" style={{ color: over ? "var(--red)" : "var(--green)" }}>{Math.round(totalCal).toLocaleString()}</div>
              <div className="tbar-label">/ {bmiData.calLimit.toLocaleString()} kcal</div>
            </div>
            <div className="tbar-stat">
              <div className="tbar-val" style={{ color: "var(--blue)" }}>{remaining.toLocaleString()}</div>
              <div className="tbar-label">remaining</div>
            </div>
            <div className="tbar-stat">
              <div className="tbar-val" style={{ color: "var(--purple)" }}>{Math.round(totalPro)}g</div>
              <div className="tbar-label">protein</div>
            </div>
            <div className="tbar-stat" style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: "120px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text2)" }}>
                <span>Calories</span><span style={{ color: barColor }}>{Math.round(pct)}%</span>
              </div>
              <div className="progress-track" style={{ height: "6px" }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
              </div>
              {/* Macro breakdown */}
              <div className="macro-bar">
                <div className="macro-seg" style={{ width: `${(totalPro * 4 / totalMacros) * 100}%`, background: "var(--green)" }} />
                <div className="macro-seg" style={{ width: `${(totalCarbs * 4 / totalMacros) * 100}%`, background: "var(--blue)" }} />
                <div className="macro-seg" style={{ width: `${(totalFat * 9 / totalMacros) * 100}%`, background: "var(--orange)" }} />
              </div>
            </div>
          </div>
          <div className="tbar-actions">
            <button className="btn btn-outline btn-sm" onClick={onSummary}>📊 Summary</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
        {/* Meal cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="section-title" style={{ fontSize: "1.5rem" }}>Today's Meals</div>
              <div className="section-sub" style={{ marginBottom: 0 }}>Track every meal for accurate results</div>
            </div>
          </div>
          {meals.map((meal, i) => (
            <MealCard
              key={meal.name}
              meal={meal}
              mealIndex={i}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              calLimit={bmiData.calLimit}
              toast={toast}
            />
          ))}
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "140px" }}>
          {/* Water */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>💧 Water Intake</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.85rem", color: "var(--blue)" }}>{water}/8 glasses</div>
            </div>
            <div className="water-glasses">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  onClick={() => setWater(w => w === i + 1 ? i : i + 1)}
                  style={{
                    width: "32px", height: "40px", borderRadius: "6px",
                    border: `2px solid ${i < water ? "var(--blue)" : "var(--border2)"}`,
                    background: i < water ? "var(--blue-dim)" : "transparent",
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  {i < water ? "💧" : ""}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "8px" }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(water / 8) * 100}%`, background: "var(--blue)" }} />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="card">
            <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "10px" }}>👟 Steps Today</div>
            <input
              className="input" type="number" placeholder="0" value={steps || ""}
              onChange={e => setSteps(parseInt(e.target.value) || 0)}
            />
            <div style={{ marginTop: "10px" }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min((steps / 10000) * 100, 100)}%`, background: "var(--green)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text2)", marginTop: "4px" }}>
                <span>0</span>
                <span style={{ color: steps >= 10000 ? "var(--green)" : "var(--text2)" }}>{steps >= 10000 ? "Goal reached! 🎉" : `${(10000 - steps).toLocaleString()} to go`}</span>
                <span>10k</span>
              </div>
            </div>
            {steps > 0 && (
              <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--text2)", background: "var(--surface2)", padding: "8px", borderRadius: "8px" }}>
                🔥 ~{Math.round(steps * 0.04)} kcal burned
              </div>
            )}
          </div>

          {/* Today snapshot */}
          <div className="card">
            <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "12px" }}>📈 Today's Macros</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Protein", val: Math.round(totalPro), target: Math.round(bmiData.calLimit * 0.25 / 4), unit: "g", color: "var(--green)" },
                { name: "Carbs", val: Math.round(totalCarbs), target: Math.round(bmiData.calLimit * 0.5 / 4), unit: "g", color: "var(--blue)" },
                { name: "Fats", val: Math.round(totalFat), target: Math.round(bmiData.calLimit * 0.25 / 9), unit: "g", color: "var(--orange)" },
              ].map(m => (
                <div key={m.name} className="progress-wrap">
                  <div className="progress-header">
                    <span style={{ fontSize: "0.75rem", color: "var(--text2)" }}>{m.name}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", color: m.color }}>{m.val}<span style={{ color: "var(--text3)" }}>/{m.target}{m.unit}</span></span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min((m.val / m.target) * 100, 100)}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
