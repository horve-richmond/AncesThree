import { GoogleGenAI } from "@google/genai";
import { FamilyMember } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBio = async (member: Partial<FamilyMember>): Promise<string> => {
  try {
    const prompt = `
      Write a warm, engaging, and respectful biography (approx 80 words) for a family tree application.
      Subject: ${member.name}
      Birth Date: ${member.birthDate}
      Location: ${member.location || 'Unknown'}
      Roles: ${member.attributes?.roles.join(', ') || 'N/A'}
      Skills: ${member.attributes?.skills.join(', ') || 'N/A'}
      Personality Traits: ${member.attributes?.traits.join(', ') || 'N/A'}
      
      Tone: Nostalgic but modern.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Could not generate bio.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate bio at this time.";
  }
};

export const askFamilyHistorian = async (
  query: string,
  contextMembers: FamilyMember[]
): Promise<string> => {
  try {
    // We provide a summarized context of the family to the AI
    const familyContext = contextMembers.map(m => 
      `${m.name} (Born: ${m.birthDate}, Roles: ${m.attributes.roles.join(', ')})`
    ).join('\n');

    const prompt = `
      You are the "Family Historian AI" for the AncesTree app.
      Here is a summary of the family members:
      ${familyContext}

      User Query: "${query}"

      Answer the user's question based on the family data provided, or provide general historical context if the data is missing. 
      Keep the answer concise (under 100 words) and friendly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't find an answer in the family records.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The historian is currently unavailable.";
  }
};