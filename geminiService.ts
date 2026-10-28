
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAdaptiveAdvisory(profile: any, reports: any[]) {
  const model = 'gemini-3-flash-preview';
  const prompt = `
    Act as an agricultural extension officer with memory. 
    Farmer Profile: ${JSON.stringify(profile)}
    Recent Reports: ${JSON.stringify(reports)}
    
    Task: Provide ONE clear, empathetic, and human-sounding advisory. 
    Avoid repeating generic advice. Focus on the current crop stage and historical patterns.
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            message: { type: Type.STRING },
            type: { type: Type.STRING, description: "One of: gentle, urgent, insight" },
            impact: { type: Type.STRING, description: "Why this matters in terms of yield or labor." }
          },
          required: ["title", "message", "type", "impact"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Advisory Error:", error);
    return null;
  }
}

export async function generateCaseStudy(region: string, data: any[]) {
  const model = 'gemini-3-pro-preview';
  const prompt = `
    Generate a formal academic case study abstract and discussion points for bird-induced crop loss in ${region}.
    Data: ${JSON.stringify(data)}
    Language: Neutral, academic, research-appropriate.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            abstract: { type: Type.STRING },
            discussionPoints: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
            },
            methodology: { type: Type.STRING }
          },
          required: ["abstract", "discussionPoints"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Academic Error:", error);
    return null;
  }
}
