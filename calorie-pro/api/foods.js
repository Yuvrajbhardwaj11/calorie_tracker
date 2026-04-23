import foodDatabase from "./_foods.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q, category, tag } = req.query;
  let foods = Object.entries(foodDatabase).map(([name, data]) => ({ name, ...data }));

  if (q) { const query = q.toLowerCase(); foods = foods.filter(f => f.name.includes(query) || f.tags?.some(t => t.includes(query))); }
  if (category) foods = foods.filter(f => f.category === category);
  if (tag) foods = foods.filter(f => f.tags?.includes(tag));

  res.json(foods.slice(0, 20));
}
