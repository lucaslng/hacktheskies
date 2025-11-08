import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv"

dotenv.config()

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

async function gemini(contents) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents
    });
    return response.text;
}