const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Full Indian Food Database (from your C++ project) ───────────────────────
const foodDatabase = {
  // South Indian
  idli: { calorie: 60, protein: 2 },
  dosa: { calorie: 180, protein: 3 },
  masaladosa: { calorie: 250, protein: 4 },
  upma: { calorie: 150, protein: 3 },
  vada: { calorie: 97, protein: 1 },
  sambar: { calorie: 120, protein: 5 },
  rasam: { calorie: 80, protein: 2 },
  uttapam: { calorie: 220, protein: 5 },
  pongal: { calorie: 200, protein: 4 },
  "lemon rice": { calorie: 230, protein: 3 },
  "curd rice": { calorie: 190, protein: 5 },
  avial: { calorie: 180, protein: 3 },
  kozhambu: { calorie: 150, protein: 2 },
  idiyappam: { calorie: 180, protein: 4 },

  // North Indian
  poha: { calorie: 200, protein: 4 },
  "aloo paratha": { calorie: 300, protein: 5 },
  "paneer paratha": { calorie: 330, protein: 8 },
  "chole bhature": { calorie: 450, protein: 10 },
  "rajma chawal": { calorie: 350, protein: 10 },
  "dal makhani": { calorie: 240, protein: 9 },
  kadhi: { calorie: 180, protein: 6 },
  "butter naan": { calorie: 210, protein: 4 },
  roti: { calorie: 90, protein: 3 },
  "plain rice": { calorie: 130, protein: 2 },
  "kadhi pakora": { calorie: 250, protein: 6 },
  "aloo tikki": { calorie: 180, protein: 3 },
  "malai kofta": { calorie: 380, protein: 7 },
  "dal tadka": { calorie: 200, protein: 8 },
  "methi roti": { calorie: 100, protein: 3 },
  "stuffed capsicum": { calorie: 160, protein: 4 },

  // Vegetables & Curries
  "aloo sabzi": { calorie: 150, protein: 2 },
  bhindi: { calorie: 110, protein: 2 },
  "palak paneer": { calorie: 250, protein: 10 },
  karela: { calorie: 60, protein: 1 },
  "mix veg": { calorie: 180, protein: 4 },
  "matar paneer": { calorie: 270, protein: 8 },
  "baingan bharta": { calorie: 140, protein: 3 },

  // Non-Vegetarian
  "boiled egg": { calorie: 78, protein: 6 },
  omelette: { calorie: 120, protein: 7 },
  "chicken curry": { calorie: 290, protein: 25 },
  "butter chicken": { calorie: 430, protein: 23 },
  "mutton curry": { calorie: 380, protein: 22 },
  "fish curry": { calorie: 220, protein: 20 },
  "grilled chicken": { calorie: 200, protein: 30 },
  "tandoori chicken": { calorie: 260, protein: 32 },
  "egg curry": { calorie: 210, protein: 14 },
  "fish fry": { calorie: 280, protein: 25 },
  keema: { calorie: 330, protein: 22 },
  "chicken biryani": { calorie: 400, protein: 18 },

  // Breakfast Options
  "bread butter": { calorie: 160, protein: 3 },
  "bread jam": { calorie: 180, protein: 2 },
  cornflakes: { calorie: 120, protein: 2 },
  oats: { calorie: 110, protein: 4 },
  daliya: { calorie: 120, protein: 5 },
  maggie: { calorie: 350, protein: 7 },
  "moong dal chilla": { calorie: 120, protein: 6 },
  "besan chilla": { calorie: 140, protein: 6 },
  "veg sandwich": { calorie: 250, protein: 5 },
  cheela: { calorie: 160, protein: 6 },
  "egg sandwich": { calorie: 220, protein: 9 },

  // Snacks
  samosa: { calorie: 262, protein: 4 },
  pakora: { calorie: 180, protein: 2 },
  "bhel puri": { calorie: 120, protein: 2 },
  "sev puri": { calorie: 200, protein: 3 },
  "pav bhaji": { calorie: 400, protein: 7 },
  "vada pav": { calorie: 295, protein: 4 },
  kachori: { calorie: 300, protein: 4 },

  // Fruits
  banana: { calorie: 90, protein: 1 },
  apple: { calorie: 52, protein: 0 },
  mango: { calorie: 99, protein: 1 },
  orange: { calorie: 47, protein: 1 },
  papaya: { calorie: 43, protein: 1 },
  grapes: { calorie: 67, protein: 1 },
  guava: { calorie: 68, protein: 2 },
  pear: { calorie: 57, protein: 0 },
  watermelon: { calorie: 30, protein: 1 },
  lychee: { calorie: 66, protein: 1 },
  pineapple: { calorie: 50, protein: 0 },
  kiwi: { calorie: 41, protein: 1 },

  // Beverages
  milk: { calorie: 150, protein: 8 },
  lassi: { calorie: 160, protein: 4 },
  buttermilk: { calorie: 40, protein: 2 },
  tea: { calorie: 30, protein: 0 },
  coffee: { calorie: 50, protein: 1 },
  "coconut water": { calorie: 45, protein: 0 },
  "sugarcane juice": { calorie: 180, protein: 0 },
  "masala chai": { calorie: 100, protein: 1 },
  "green tea": { calorie: 5, protein: 0 },
  "protein shake": { calorie: 250, protein: 20 },
  "cold coffee": { calorie: 180, protein: 4 },
  "badam milk": { calorie: 210, protein: 6 },

  // Dry Fruits & Nuts
  almonds: { calorie: 160, protein: 6 },
  walnuts: { calorie: 180, protein: 5 },
  cashews: { calorie: 155, protein: 5 },
  raisins: { calorie: 120, protein: 1 },
  peanuts: { calorie: 170, protein: 7 },
  pistachios: { calorie: 160, protein: 6 },
  figs: { calorie: 74, protein: 1 },
  dates: { calorie: 90, protein: 1 },

  // Sweets / Desserts
  "gulab jamun": { calorie: 160, protein: 2 },
  rasgulla: { calorie: 125, protein: 3 },
  kheer: { calorie: 215, protein: 5 },
  halwa: { calorie: 250, protein: 3 },
  barfi: { calorie: 150, protein: 4 },
  jalebi: { calorie: 180, protein: 2 },
  chikki: { calorie: 200, protein: 4 },
  peda: { calorie: 160, protein: 3 },
  "soan papdi": { calorie: 150, protein: 2 },
  "besan ladoo": { calorie: 180, protein: 3 },
  "moong dal halwa": { calorie: 280, protein: 4 },
  rasmalai: { calorie: 250, protein: 5 },
  shrikhand: { calorie: 200, protein: 6 },
};

// ─── BMI Calculation ─────────────────────────────────────────────────────────
app.post("/api/bmi", (req, res) => {
  const { height, weight } = req.body;
  if (!height || !weight || height <= 0 || weight <= 0) {
    return res.status(400).json({ error: "Invalid height or weight" });
  }
  const bmi = weight / (height * height);
  let category, calLimit, advice, color;

  if (bmi < 16) {
    category = "Severely Underweight";
    calLimit = 2800;
    advice = "You need to gain weight urgently. Consult a doctor.";
    color = "red";
  } else if (bmi < 18.5) {
    category = "Underweight";
    calLimit = 2500;
    advice = "Eat more nutritious, calorie-dense foods.";
    color = "orange";
  } else if (bmi <= 24.9) {
    category = "Normal";
    calLimit = 2200;
    advice = "Great! Maintain a balanced diet and active lifestyle.";
    color = "green";
  } else if (bmi <= 29.9) {
    category = "Overweight";
    calLimit = 2000;
    advice = "Try to reduce high-calorie foods and increase activity.";
    color = "orange";
  } else {
    category = "Obese";
    calLimit = 1800;
    advice = "Please consult a healthcare professional for a diet plan.";
    color = "red";
  }

  res.json({ bmi: parseFloat(bmi.toFixed(1)), category, calLimit, advice, color });
});

// ─── Get all foods ────────────────────────────────────────────────────────────
app.get("/api/foods", (req, res) => {
  const { q } = req.query;
  let foods = Object.entries(foodDatabase).map(([name, data]) => ({
    name,
    ...data,
  }));
  if (q) {
    const query = q.toLowerCase();
    foods = foods.filter((f) => f.name.includes(query));
  }
  res.json(foods);
});

// ─── Get a single food item ───────────────────────────────────────────────────
app.get("/api/foods/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const item = foodDatabase[name];
  if (!item) return res.status(404).json({ error: "Food not found" });
  res.json({ name, ...item });
});

// ─── Get healthier alternative ────────────────────────────────────────────────
app.post("/api/suggest", (req, res) => {
  const { currentFood, maxCalories } = req.body;
  let best = null;
  let maxProtein = -1;

  for (const [name, data] of Object.entries(foodDatabase)) {
    if (
      name !== currentFood.toLowerCase() &&
      data.calorie <= maxCalories &&
      data.protein > maxProtein
    ) {
      best = { name, ...data };
      maxProtein = data.protein;
    }
  }
  res.json(best ? best : null);
});

// ─── Analyze a full day's meals ───────────────────────────────────────────────
app.post("/api/analyze", (req, res) => {
  const { meals, calLimit } = req.body;
  let totalCal = 0;
  let totalProtein = 0;

  const breakdown = meals.map((meal) => {
    const mealCal = meal.items.reduce((s, i) => s + i.calorie * i.quantity, 0);
    const mealPro = meal.items.reduce((s, i) => s + i.protein * i.quantity, 0);
    totalCal += mealCal;
    totalProtein += mealPro;
    return { mealName: meal.name, calories: mealCal, protein: mealPro };
  });

  let status, message;
  if (totalCal > calLimit) {
    status = "over";
    message = `You exceeded your limit by ${totalCal - calLimit} kcal!`;
  } else if (totalCal < calLimit * 0.6) {
    status = "under";
    message = "Too few calories. Eat more nutritious food!";
  } else {
    status = "good";
    message = "Great job staying within your calorie limit!";
  }

  res.json({ totalCal, totalProtein, breakdown, status, message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
