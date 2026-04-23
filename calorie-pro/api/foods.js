import foodDatabase from "./_foods.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q, category } = req.query;
  let foods = Object.entries(foodDatabase).map(([name, data]) => ({ name, ...data }));

  if (category && category !== "All") {
    foods = foods.filter((f) => f.category === category);
  }
  if (q) {
    const query = q.toLowerCase();
    foods = foods.filter((f) => f.name.toLowerCase().includes(query));
  }

  // Return categories list too
  const categories = ["All", ...new Set(Object.values(foodDatabase).map(f => f.category))];
  res.json({ foods: foods.slice(0, 12), categories });
}
