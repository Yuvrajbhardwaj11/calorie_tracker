export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
}
