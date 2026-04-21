import { useState, useEffect, useRef } from "react";

const API = "http://localhost:3001";

function MealSection({ meal, index, calLimit, onAddItem, onRemoveItem }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [suggestion, setSuggestion] = useState(null);
  const inputRef = useRef();

  const mealCal = meal.items.reduce((s, i) => s + i.calorie * i.quantity, 0);
  const mealPro = meal.items.reduce((s, i) => s + i.protein * i.quantity, 0);

  async function search(q) {
    setQuery(q);
    setSelected(null);
    if (q.length < 2) { setSuggestions([]); return; }
    const res = await fetch(`${API}/api/foods?q=${encodeURIComponent(q.toLowerCase())}`);
    const data = await res.json();
    setSuggestions(data.slice(0, 8));
  }

  function pick(food) {
    setSelected(food);
    setQuery(food.name);
    setSuggestions([]);
    setSuggestion(null);
  }

  async function add() {
    if (!selected) return;
    onAddItem(index, { ...selected, quantity });

    // fetch suggestion
    const res = await fetch(`${API}/api/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentFood: selected.name, maxCalories: selected.calorie }),
    });
    const alt = await res.json();
    setSuggestion(alt);

    setQuery("");
    setSelected(null);
    setQuantity(1);
  }

  return (
    <div className="meal-section">
      <div className="meal-header">
        <div className="meal-title">
          <span className="meal-icon">{meal.icon}</span>
          <span>{meal.name}</span>
        </div>
        {mealCal > 0 && (
          <div className="meal-totals">
            <span className="meal-cal-badge">{mealCal} kcal</span>
            <span className="meal-pro-badge">{mealPro}g protein</span>
          </div>
        )}
      </div>

      {meal.items.length > 0 && (
        <div className="meal-items">
          {meal.items.map((item, i) => (
            <div key={i} className="meal-item">
              <span className="item-name">{item.name}</span>
              <span className="item-qty">×{item.quantity}</span>
              <span className="item-cal">{item.calorie * item.quantity} kcal</span>
              <span className="item-pro">{item.protein * item.quantity}g</span>
              <button className="item-remove" onClick={() => onRemoveItem(index, i)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="add-food-row">
        <div className="autocomplete-wrap">
          <input
            ref={inputRef}
            className="food-input"
            placeholder="Search food (e.g. idli, banana)…"
            value={query}
            onChange={(e) => search(e.target.value)}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((f) => (
                <div key={f.name} className="suggestion-item" onClick={() => pick(f)}>
                  <span className="sug-name">{f.name}</span>
                  <span className="sug-meta">{f.calorie} kcal · {f.protein}g protein</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <select
          className="qty-select"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}×</option>
          ))}
        </select>

        <button className="btn-add" onClick={add} disabled={!selected}>
          + Add
        </button>
      </div>

      {suggestion && (
        <div className="suggestion-tip">
          👉 Healthier pick with similar or fewer calories: <strong>{suggestion.name}</strong>
          &nbsp;({suggestion.calorie} kcal · {suggestion.protein}g protein)
        </div>
      )}
    </div>
  );
}

export default function TrackerScreen({ bmiData, meals, setMeals, onSummary }) {
  const totalCal = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.calorie * i.quantity, 0), 0);
  const totalPro = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.protein * i.quantity, 0), 0);
  const pct = Math.min((totalCal / bmiData.calLimit) * 100, 100);
  const over = totalCal > bmiData.calLimit;

  function addItem(mealIndex, item) {
    setMeals((prev) => {
      const updated = [...prev];
      updated[mealIndex] = {
        ...updated[mealIndex],
        items: [...updated[mealIndex].items, item],
      };
      return updated;
    });
  }

  function removeItem(mealIndex, itemIndex) {
    setMeals((prev) => {
      const updated = [...prev];
      updated[mealIndex] = {
        ...updated[mealIndex],
        items: updated[mealIndex].items.filter((_, i) => i !== itemIndex),
      };
      return updated;
    });
  }

  return (
    <div className="tracker-layout">
      {/* Sticky top bar */}
      <div className="tracker-topbar">
        <div className="topbar-inner">
          <div className="topbar-stats">
            <div className="stat-chip">
              <span className="stat-val" style={{ color: over ? "#f87171" : "#4ade80" }}>{totalCal}</span>
              <span className="stat-label">/ {bmiData.calLimit} kcal</span>
            </div>
            <div className="stat-chip">
              <span className="stat-val" style={{ color: "#60a5fa" }}>{totalPro}g</span>
              <span className="stat-label">protein</span>
            </div>
          </div>
          <div className="calorie-bar-wrap">
            <div className="calorie-bar">
              <div
                className="calorie-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: over ? "#f87171" : pct > 80 ? "#fb923c" : "#4ade80",
                }}
              />
            </div>
            <span className="pct-label">{Math.round(pct)}%</span>
          </div>
          <button className="btn-summary" onClick={onSummary}>View Summary →</button>
        </div>
      </div>

      {/* Meal sections */}
      <div className="meals-grid">
        {meals.map((meal, i) => (
          <MealSection
            key={meal.name}
            meal={meal}
            index={i}
            calLimit={bmiData.calLimit}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />
        ))}
      </div>
    </div>
  );
}
