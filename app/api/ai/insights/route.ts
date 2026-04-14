import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { metrics, riskScore, profile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt = `
      You are HealthMatrix AI, a medical data analyst. 
      Analyze the following patient metrics and risk score:
      
      Patient Profile: ${JSON.stringify(profile)}
      Metrics: ${JSON.stringify(metrics)}
      Calculated Risk Score: ${riskScore}%
      
      Provide a concise clinical insight (max 100 words) that explains:
      1. What is the primary driver of the risk.
      2. One actionable lifestyle recommendation based on the data.
      3. Use a reassuring yet professional medical tone.
      
      Format your response as a JSON object with two fields:
      "summary": "The main insight text",
      "action": "A single short action item"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from JSON response
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    const insights = JSON.parse(cleanedText);

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI insights", details: error.message },
      { status: 500 }
    );
  }
}
