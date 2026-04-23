export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { height, weight, age, gender, activity } = req.body;
  if (!height || !weight || height <= 0 || weight <= 0)
    return res.status(400).json({ error: "Invalid input" });

  const bmi = weight / (height * height);

  // BMR using Mifflin-St Jeor
  let bmr;
  if (gender === "female") {
    bmr = 10 * weight + 6.25 * (height * 100) - 5 * (age || 25) - 161;
  } else {
    bmr = 10 * weight + 6.25 * (height * 100) - 5 * (age || 25) + 5;
  }

  const activityMult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const tdee = Math.round(bmr * (activityMult[activity] || 1.375));

  let category, advice, color, calLimit, idealWeight;
  const heightM = height;
  idealWeight = { min: Math.round(18.5 * heightM * heightM), max: Math.round(24.9 * heightM * heightM) };

  if (bmi < 16) { category = "Severely Underweight"; color = "red"; calLimit = tdee + 600; advice = "Critical: Seek medical attention immediately."; }
  else if (bmi < 18.5) { category = "Underweight"; color = "orange"; calLimit = tdee + 400; advice = "Increase calorie intake with nutritious foods."; }
  else if (bmi <= 24.9) { category = "Normal"; color = "green"; calLimit = tdee; advice = "Perfect! Maintain your healthy lifestyle."; }
  else if (bmi <= 29.9) { category = "Overweight"; color = "orange"; calLimit = tdee - 400; advice = "Reduce portions and increase physical activity."; }
  else { category = "Obese"; color = "red"; calLimit = tdee - 600; advice = "Consult a healthcare professional for a structured plan."; }

  const bmiVal = parseFloat(bmi.toFixed(1));
  const weightToLose = bmi > 24.9 ? Math.round((weight - idealWeight.max) * 10) / 10 : null;
  const weightToGain = bmi < 18.5 ? Math.round((idealWeight.min - weight) * 10) / 10 : null;

  res.json({ bmi: bmiVal, category, calLimit, advice, color, tdee, bmr: Math.round(bmr), idealWeight, weightToLose, weightToGain });
}
