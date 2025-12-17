import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Equipment, MuscleGroup, WorkoutPlan, TimeOption } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Define the response schema using the GenAI Type enum
const exerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the exercise (e.g. 'Incline Bench Press')" },
    sets: { type: Type.INTEGER, description: "Number of sets" },
    repsOrDuration: { type: Type.STRING, description: "Reps (e.g., '12') or duration (e.g., '45s')" },
    restSeconds: { type: Type.INTEGER, description: "Rest time in seconds" },
    formGuidance: { type: Type.STRING, description: "Technique cue specifically mentioning the target sub-muscle (e.g., 'Focus on Upper Clavicular fibers')" },
    equipment: { type: Type.STRING, description: "Equipment needed" },
    visualTag: { type: Type.STRING, description: "Image generation prompt" },
  },
  required: ["name", "sets", "repsOrDuration", "restSeconds", "formGuidance", "equipment", "visualTag"],
};

const workoutPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    exercises: {
      type: Type.ARRAY,
      items: exerciseSchema,
      description: "List of exercises for the workout",
    },
    estimatedCalories: {
      type: Type.INTEGER,
      description: "Estimated total calories burned for this session based on intensity and duration"
    }
  },
  required: ["exercises", "estimatedCalories"],
};

export const generateWorkout = async (
  equipment: Equipment,
  muscles: MuscleGroup[],
  time: TimeOption
): Promise<WorkoutPlan> => {
  const client = getClient();

  const systemInstruction = `
    You are Vector, an elite anatomical workout engine.
    
    MISSION PROFILE:
    Generate a high-precision workout that specifically isolates anatomical sub-regions of the selected muscle groups (e.g., Chest -> Upper/Clavicular, Middle/Sternal, Lower/Costal).

    STRICT GENERATION PROTOCOLS:
    1. **SUB-MUSCLE TARGETING**: Do not just give generic exercises. If "Chest" is selected, you MUST provide distinct exercises for the Upper Chest, Middle Chest, and Lower Chest.
    2. **VOLUME & PACING (CRITICAL)**: 
       - You MUST strictly respect the **${time} minute** Time Window.
       - CALCULATION: Assume avg work time = 45s per set. Total Time = (Sets * (45s + RestSeconds)).
       - Adjust sets and exercises so the workout fits exactly. It is better to have fewer sets than to run over time.
    3. **EQUIPMENT**: Strictly use '${equipment}'.
    4. **VISUALIZATION**: Provide a 'visualTag' for each exercise. This is a short, descriptive 3-5 word prompt for an AI image generator (e.g., "Cinematic shot of athlete doing dumbbell bench press, gym lighting").
    5. **FORM CUES**: The form guidance must explicitly state which part of the muscle is being biased.
    6. **METABOLIC ESTIMATION**: Estimate the total calories burned.
    
    Output strictly valid JSON. No conversational text.
  `;

  const prompt = `
    GENERATE WORKOUT VECTOR:
    - Constraints: ${equipment}
    - Target Anatomy: ${muscles.join(', ')}
    - Time Window: ${time} minutes
    
    Execute segmentation and generation.
  `;

  try {
    // Retry logic for 503 errors (Service Unavailable / Overloaded)
    let retries = 3;
    let delay = 2000;

    let response;

    while (retries > 0) {
      try {
        response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: workoutPlanSchema,
            temperature: 0.2,
          }
        });
        break; // Success
      } catch (err: any) {
        if (err.status === 503 && retries > 1) {
          console.warn(`Gemini 503 (Overloaded). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          retries--;
        } else {
          throw err;
        }
      }
    }

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      muscleGroups: muscles,
      equipment: equipment,
      durationMinutes: time,
      exercises: data.exercises,
      estimatedCalories: data.estimatedCalories
    };

  } catch (error) {
    console.error("Vector System Failure:", error);
    throw error;
  }
};