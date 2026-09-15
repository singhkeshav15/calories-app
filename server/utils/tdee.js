/**
 * Calculates recommended daily calorie intake using Mifflin-St Jeor formula
 * @param {number} age
 * @param {string} gender - 'male' or 'female'
 * @param {number} height_cm
 * @param {number} weight_kg
 * @param {string} activity_level - 'sedentary' | 'light' | 'moderate' | 'active'
 * @param {string} goal - 'cutting' | 'maintenance' | 'bulking'
 * @returns {number} recommended daily calories (integer)
 */

function calculateTDEE(age, gender, height_cm, weight_kg, activity_level, goal) {
    // Step 1: BMR (Basal Metabolic Rate)
    let bmr
    if (gender === 'male') {
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    } else {
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    }

    // Step 2: Multiply by activity level
    const activityMultipliers = {
        sedentary: 1.2,
        light:     1.375,
        moderate:  1.55,
        active:    1.725
    }
    const tdee = bmr * (activityMultipliers[activity_level] || 1.2)

    // Step 3: Adjust for goal
    const goalAdjustments = {
        cutting:     -400,
        maintenance: 0,
        bulking:     +400
    }
    const recommended = tdee + (goalAdjustments[goal] || 0)

    return Math.round(recommended)
}

export default calculateTDEE
