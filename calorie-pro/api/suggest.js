import foodDatabase from "./_foods.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { currentFood, maxCalories } = req.body;
  let best = null, maxProtein = -1;
  for (const [name, data] of Object.entries(foodDatabase)) {
    if (name !== currentFood?.toLowerCase() && data.cal <= maxCalories && data.protein > maxProtein) {
      best = { name, ...data }; maxProtein = data.protein;
    }
  }
  res.json(best || null);
}
