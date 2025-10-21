import { pushLog } from "../pushLog";


export default function extractJSON(response) {
  try {
    // Try to find a JSON block inside triple backticks
    const match = response.match(/```json\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    // If no triple backticks, try to find a JSON object anywhere
    const objMatch = response.match(/\{[\s\S]*\}/);
    if (objMatch) {
      return JSON.parse(objMatch[0]);
    }
    pushLog("No JSON found in response", "ERROR");
    throw new Error("No JSON found in response");
  } catch (err) {
    // console.error("Failed to extract JSON:", err, response);
    pushLog("Failed to extract JSON: " + err.message, "ERROR");
    return null;
  }
}