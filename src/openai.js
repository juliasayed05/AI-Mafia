import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_API_KEY?.trim();
const modelName = "gemini-2.5-flash";

function toUserFriendlyError(error) {
  const message = error?.message || "Unknown Gemini API error.";

  if (message.includes("fetch failed")) {
    return "The request could not reach Gemini. Check your internet connection or firewall.";
  }

  if (
    message.includes("API key") ||
    message.includes("API_KEY") ||
    message.includes("permission") ||
    message.includes("PERMISSION_DENIED")
  ) {
    return "Your Gemini API key is invalid, restricted, or does not have access to the Gemini API.";
  }

  if (
    message.includes("not found") ||
    message.includes("NOT_FOUND") ||
    message.includes("model")
  ) {
    return `The model "${modelName}" is not available for this request.`;
  }
  return message;
}

export async function sendMsgToGemini(message) {
  if (!apiKey) {
    throw new Error(
      "Missing VITE_API_KEY. Add it to the project root .env file and restart the Vite server.",
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: message,
    });

    return response.text || "I couldn't generate a response yet.";
  } catch (error) {
    throw new Error(toUserFriendlyError(error));
  }
}
