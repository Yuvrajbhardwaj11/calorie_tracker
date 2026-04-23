export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { meals, calLimit } = req.body;
  let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0;

  const breakdown = meals.map(meal => {
    const mCal = meal.items.reduce((s, i) => s + i.cal * i.quantity, 0);
    const mPro = meal.items.reduce((s, i) => s + i.protein * i.quantity, 0);
    const mCarbs = meal.items.reduce((s, i) => s + (i.carbs || 0) * i.quantity, 0);
    const mFat = meal.items.reduce((s, i) => s + (i.fat || 0) * i.quantity, 0);
    totalCal += mCal; totalProtein += mPro; totalCarbs += mCarbs; totalFat += mFat;
    totalFiber += meal.items.reduce((s, i) => s + (i.fiber || 0) * i.quantity, 0);
    return { mealName: meal.name, calories: Math.round(mCal), protein: Math.round(mPro), carbs: Math.round(mCarbs), fat: Math.round(mFat), itemCount: meal.items.length };
  });

  let status, message;
  if (totalCal > calLimit) { status = "over"; message = `Exceeded by ${Math.round(totalCal - calLimit)} kcal`; }
  else if (totalCal < calLimit * 0.5) { status = "under"; message = "Eating too little! Your body needs more fuel."; }
  else if (totalCal < calLimit * 0.8) { status = "low"; message = "A bit low — consider a healthy snack."; }
  else { status = "good"; message = "Perfect! You're right on track today 🎯"; }

  const proteinTarget = Math.round(calLimit * 0.25 / 4);
  const carbTarget = Math.round(calLimit * 0.5 / 4);
  const fatTarget = Math.round(calLimit * 0.25 / 9);

  res.json({
    totalCal: Math.round(totalCal), totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs), totalFat: Math.round(totalFat), totalFiber: Math.round(totalFiber),
    breakdown, status, message,
    targets: { protein: proteinTarget, carbs: carbTarget, fat: fatTarget },
    remaining: Math.max(0, Math.round(calLimit - totalCal))
  });
}
