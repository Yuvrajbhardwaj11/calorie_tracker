import { useState, useRef, useEffect, useCallback } from "react";

const API = "";

function MacroRing({ value, max, color, label, unit }) {
  const pct = Math.min(value / max, 1);
  const r = 28, circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <div className="macro-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" style={{ transition: "stroke-dasharray 0.5s ease" }} />
        <text x="36" y="32" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{value}</text>
        <text x="36" y="44" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">{unit}</text>
      </svg>
      <div className="ring-label">{label}</div>
    </div>
  );
}

function FoodSearchModal({ onAdd, onClose, mealName }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const debounceRef = useRef();

  useEffect(() => { inputRef.current?.focus(); fetchFoods("", "All"); }, []);

  async function fetchFoods(q, cat) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat && cat !== "All") params.set("category", cat);
      const res = await fetch(`${API}/api/foods?${params}`);
      const data = await res.json();
      setResults(data.foods || []);
      if (data.categories) setCategories(data.categories);
    } catch {}
    setLoading(false);
  }

  function handleSearch(q) {
    setQuery(q); setSelected(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchFoods(q, activeCategory), 280);
  }

  function handleCategory(cat) {
    setActiveCategory(cat); setSelected(null);
    fetchFoods(query, cat);
  }

  function handleAdd() {
    if (!selected) return;
    onAdd({ ...selected, quantity });
    onClose();
  }

  const macroColors = { protein: "#22d3a0", carbs: "#60a5fa", fat: "#f59e0b", fiber: "#c084fc" };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <div className="modal-title">Add to {mealName}</div>
            <div className="modal-sub">Search from 150+ Indian dishes</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search-wrap">
          <span className="search-icon">🔍</span>
          <input ref={inputRef} className="modal-search" placeholder="e.g. idli, paneer, biryani…"
            value={query} onChange={(e) => handleSearch(e.target.value)} />
          {query && <button className="search-clear" onClick={() => handleSearch("")}>✕</button>}
        </div>

        <div className="category-chips">
          {categories.map((cat) => (
            <button key={cat} className={`cat-chip ${activeCategory === cat ? "active" : ""}`} onClick={() => handleCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="food-results">
          {loading && <div className="results-loading"><div className="dot-pulse" /></div>}
          {!loading && results.length === 0 && (
            <div className="no-results">No dishes found for "{query}"</div>
          )}
          {!loading && results.map((f) => (
            <button key={f.name} className={`food-result-row ${selected?.name === f.name ? "selected" : ""}`}
              onClick={() => setSelected(selected?.name === f.name ? null : f)}>
              <span className="fr-emoji">{f.emoji || "🍽"}</span>
              <div className="fr-info">
                <div className="fr-name">{f.name}</div>
                <div className="fr-cat">{f.category}</div>
              </div>
              <div className="fr-macros">
                <span className="fr-cal">{f.calorie} kcal</span>
                <span className="fr-pro">{f.protein}g P</span>
                <span className="fr-carb">{f.carbs}g C</span>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="modal-selected-panel">
            <div className="msp-header">
              <span className="msp-emoji">{selected.emoji}</span>
              <div>
                <div className="msp-name">{selected.name}</div>
                <div className="msp-macros-row">
                  {[["🔥", selected.calorie * quantity, "kcal", "white"],
                    ["💪", selected.protein * quantity, "g P", "#22d3a0"],
                    ["🌾", selected.carbs * quantity, "g C", "#60a5fa"],
                    ["🥑", selected.fat * quantity, "g F", "#f59e0b"]].map(([icon, val, unit, color]) => (
                    <span key={unit} style={{ color }}>{icon} {val}{unit}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="msp-qty-row">
              <span className="msp-qty-label">Servings</span>
              <div className="qty-stepper">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button>
              </div>
              <button className="btn-add-food" onClick={handleAdd}>Add to Meal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MealCard({ meal, index, bmiData, onAddItem, onRemoveItem }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const mealCal = meal.items.reduce((s, i) => s + i.calorie * i.quantity, 0);
  const mealPro = meal.items.reduce((s, i) => s + i.protein * i.quantity, 0);
  const mealCarbs = meal.items.reduce((s, i) => s + (i.carbs || 0) * i.quantity, 0);
  const pct = Math.min(mealCal / (bmiData.calLimit / 5) * 100, 100);

  async function addFood(food) {
    onAddItem(index, food);
    try {
      const res = await fetch(`${API}/api/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentFood: food.name, maxCalories: food.calorie }),
      });
      const alt = await res.json();
      if (alt) setSuggestion(alt);
    } catch {}
  }

  return (
    <>
      <div className={`meal-card ${meal.items.length > 0 ? "has-items" : ""}`}>
        <div className="meal-card-header">
          <div className="meal-title-row">
            <span className="meal-emoji">{meal.icon}</span>
            <div>
              <div className="meal-name">{meal.name}</div>
              <div className="meal-time">{meal.time}</div>
            </div>
          </div>
          {mealCal > 0 && (
            <div className="meal-cal-pill">{mealCal} <span>kcal</span></div>
          )}
        </div>

        {meal.items.length > 0 && (
          <>
            <div className="meal-progress-bar">
              <div className="mpb-fill" style={{ width: `${pct}%`, background: pct > 100 ? "#f87171" : "#22d3a0" }} />
            </div>
            <div className="meal-items-list">
              {meal.items.map((item, i) => (
                <div key={i} className="meal-item-row">
                  <span className="mir-emoji">{item.emoji || "🍽"}</span>
                  <span className="mir-name">{item.name}</span>
                  <span className="mir-qty">×{item.quantity}</span>
                  <span className="mir-cal">{item.calorie * item.quantity} kcal</span>
                  <button className="mir-remove" onClick={() => onRemoveItem(index, i)}>✕</button>
                </div>
              ))}
            </div>
            <div className="meal-macro-summary">
              <span>🥩 {mealPro}g protein</span>
              <span>🌾 {mealCarbs}g carbs</span>
            </div>
          </>
        )}

        {suggestion && (
          <div className="suggestion-tip">
            <span className="sug-icon">💡</span>
            <span>Try <strong>{suggestion.name}</strong> — {suggestion.calorie} kcal, {suggestion.protein}g protein (healthier swap)</span>
            <button className="sug-dismiss" onClick={() => setSuggestion(null)}>✕</button>
          </div>
        )}

        <button className="btn-add-meal" onClick={() => setModalOpen(true)}>
          <span>+</span> Add Food
        </button>
      </div>

      {modalOpen && (
        <FoodSearchModal
          mealName={meal.name}
          onAdd={addFood}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

export default function TrackerScreen({ bmiData, meals, setMeals, waterGlasses, setWaterGlasses, steps, setSteps, onSummary }) {
  const totalCal = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.calorie * i.quantity, 0), 0);
  const totalPro = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.protein * i.quantity, 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + (i.carbs || 0) * i.quantity, 0), 0);
  const totalFat = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + (i.fat || 0) * i.quantity, 0), 0);

  const calPct = Math.min((totalCal / bmiData.calLimit) * 100, 100);
  const over = totalCal > bmiData.calLimit;
  const remaining = Math.max(bmiData.calLimit - totalCal, 0);

  function addItem(mealIndex, item) {
    setMeals((prev) => {
      const updated = [...prev];
      updated[mealIndex] = { ...updated[mealIndex], items: [...updated[mealIndex].items, item] };
      return updated;
    });
  }

  function removeItem(mealIndex, itemIndex) {
    setMeals((prev) => {
      const updated = [...prev];
      updated[mealIndex] = { ...updated[mealIndex], items: updated[mealIndex].items.filter((_, i) => i !== itemIndex) };
      return updated;
    });
  }

  const calBarColor = over ? "#f87171" : calPct > 80 ? "#f59e0b" : "#22d3a0";

  return (
    <div className="tracker-page">
      {/* Dashboard strip */}
      <div className="dashboard-strip">
        <div className="ds-inner">
          {/* Main calorie ring */}
          <div className="ds-cal-section">
            <div className="ds-big-ring" style={{ "--bar-color": calBarColor, "--pct": calPct / 100 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="55" cy="55" r="46" fill="none" stroke={calBarColor} strokeWidth="8"
                  strokeDasharray={`${(calPct / 100) * 289} 289`} strokeLinecap="round"
                  transform="rotate(-90 55 55)" style={{ transition: "all 0.5s ease" }} />
              </svg>
              <div className="ds-ring-inner">
                <div className="ds-cal-num" style={{ color: calBarColor }}>{totalCal}</div>
                <div className="ds-cal-sub">/ {bmiData.calLimit}</div>
                <div className="ds-cal-unit">kcal</div>
              </div>
            </div>
            <div className="ds-cal-meta">
              {over
                ? <span className="cal-status over">⚠️ {totalCal - bmiData.calLimit} over limit</span>
                : <span className="cal-status ok">✅ {remaining} kcal remaining</span>
              }
            </div>
          </div>

          {/* Macro rings */}
          <div className="ds-macros">
            <MacroRing value={totalPro} max={bmiData.proteinTarget || 120} color="#22d3a0" label="Protein" unit="g" />
            <MacroRing value={totalCarbs} max={bmiData.carbTarget || 250} color="#60a5fa" label="Carbs" unit="g" />
            <MacroRing value={totalFat} max={bmiData.fatTarget || 65} color="#f59e0b" label="Fat" unit="g" />
          </div>

          {/* Water & Steps */}
          <div className="ds-extras">
            <div className="extra-card">
              <div className="ec-label">💧 Water</div>
              <div className="ec-val">{waterGlasses}<span className="ec-unit">glasses</span></div>
              <div className="ec-controls">
                <button onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}>−</button>
                <div className="water-dots">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`water-dot ${i < waterGlasses ? "filled" : ""}`} onClick={() => setWaterGlasses(i + 1)} />
                  ))}
                </div>
                <button onClick={() => setWaterGlasses(Math.min(20, waterGlasses + 1))}>+</button>
              </div>
            </div>

            <div className="extra-card">
              <div className="ec-label">🚶 Steps</div>
              <div className="ec-val">{steps.toLocaleString()}<span className="ec-unit">steps</span></div>
              <div className="steps-input-row">
                <input type="number" className="steps-input" placeholder="Enter steps"
                  onChange={(e) => setSteps(Math.max(0, parseInt(e.target.value) || 0))} />
              </div>
              <div className="steps-bar-wrap">
                <div className="steps-bar">
                  <div className="steps-fill" style={{ width: `${Math.min(steps / 10000 * 100, 100)}%` }} />
                </div>
                <span className="steps-goal">/ 10k</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meals grid */}
      <div className="meals-section">
        <div className="meals-section-header">
          <h2 className="meals-section-title">Today's Meals</h2>
          <button className="btn-view-summary" onClick={onSummary}>View Summary →</button>
        </div>
        <div className="meals-grid">
          {meals.map((meal, i) => (
            <MealCard
              key={meal.name}
              meal={meal}
              index={i}
              bmiData={bmiData}
              onAddItem={addItem}
              onRemoveItem={removeItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
