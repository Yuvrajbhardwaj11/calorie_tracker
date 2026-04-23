export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { height, weight, age, gender, activity } = req.body;
  if (!height || !weight || height <= 0 || weight <= 0)
    return res.status(400).json({ error: "Invalid height or weight" });

  const bmi = weight / (height * height);
  let category, advice, color;

  if (bmi < 16) {
    category = "Severely Underweight"; color = "red";
    advice = "You need to gain weight urgently. Please consult a doctor immediately.";
  } else if (bmi < 18.5) {
    category = "Underweight"; color = "orange";
    advice = "Eat more nutritious, calorie-dense foods. Focus on healthy fats and proteins.";
  } else if (bmi <= 24.9) {
    category = "Normal"; color = "green";
    advice = "Great! Maintain a balanced diet and active lifestyle to stay healthy.";
  } else if (bmi <= 29.9) {
    category = "Overweight"; color = "orange";
    advice = "Try to reduce high-calorie foods and increase physical activity gradually.";
  } else {
    category = "Obese"; color = "red";
    advice = "Please consult a healthcare professional for a personalized diet and exercise plan.";
  }

  // TDEE calculation
  const a = age || 25;
  const isMale = gender !== "female";
  let bmr;
  if (isMale) {
    bmr = 88.362 + 13.397 * weight + 4.799 * (height * 100) - 5.677 * a;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * (height * 100) - 4.330 * a;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryactive: 1.9,
  };
  const multiplier = activityMultipliers[activity] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // Adjust calorie limit based on BMI category
  let calLimit;
  if (bmi < 16) calLimit = Math.round(tdee * 1.3);
  else if (bmi < 18.5) calLimit = Math.round(tdee * 1.15);
  else if (bmi <= 24.9) calLimit = tdee;
  else if (bmi <= 29.9) calLimit = Math.round(tdee * 0.85);
  else calLimit = Math.round(tdee * 0.75);

  // Macro targets (grams)
  const proteinTarget = Math.round(weight * 1.6);
  const fatTarget = Math.round((calLimit * 0.25) / 9);
  const carbTarget = Math.round((calLimit - proteinTarget * 4 - fatTarget * 9) / 4);

  res.json({
    bmi: parseFloat(bmi.toFixed(1)),
    category,
    calLimit,
    tdee,
    advice,
    color,
    proteinTarget,
    fatTarget,
    carbTarget,
    bmr: Math.round(bmr),
  });
}
