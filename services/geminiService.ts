import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BriefingData, GenerationResponse, PromptConfig } from "../types";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    instagram_feed: {
      type: Type.OBJECT,
      properties: {
        caption: { type: Type.STRING },
        visual_idea: { type: Type.STRING },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["caption", "visual_idea", "hashtags"],
    },
    linkedin: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING },
        slide_structure: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["text", "slide_structure"],
    },
    facebook: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING },
        visual_idea: { type: Type.STRING },
      },
      required: ["text", "visual_idea"],
    },
    blog_post: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        meta_description: { type: Type.STRING },
        body_html: { type: Type.STRING, description: "Formatted HTML content with h1, h2, p tags" },
      },
      required: ["title", "meta_description", "body_html"],
    },
    instagram_story: {
      type: Type.OBJECT,
      properties: {
        sequences: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["sequences"],
    },
    reels_shorts: {
      type: Type.OBJECT,
      properties: {
        script_table: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              visual: { type: Type.STRING },
              audio: { type: Type.STRING },
            },
          },
        },
      },
      required: ["script_table"],
    },
    youtube_video: {
      type: Type.OBJECT,
      properties: {
        title_ideas: { type: Type.ARRAY, items: { type: Type.STRING } },
        outline: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["title_ideas", "outline"],
    },
  },
  required: [
    "instagram_feed",
    "linkedin",
    "facebook",
    "blog_post",
    "instagram_story",
    "reels_shorts",
    "youtube_video",
  ],
};

// Helper to safely get the API key without crashing the app on load if process is undefined
const getApiKey = () => {
  // In a real build environment, process.env is replaced. 
  // In a raw browser environment, we need to be careful.
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.warn("API Key not found or process not defined");
    return undefined;
  }
};

export const generateSocialContent = async (briefing: BriefingData, promptConfig: PromptConfig): Promise<GenerationResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  // Construct a modular prompt based on user settings
  const prompt = `
    ${promptConfig.global}
    
    INPUT DATA:
    - Topic: ${briefing.topic}
    - Context URL: ${briefing.url || "N/A"}
    - Tone of Voice: ${briefing.tone.join(', ')}
    - Target Audience Description: ${briefing.targetAudience}

    PLATFORM SPECIFIC INSTRUCTIONS:
    1. Instagram Feed: ${promptConfig.instagram_feed}
    2. LinkedIn: ${promptConfig.linkedin}
    3. Facebook: ${promptConfig.facebook}
    4. Blog Post: ${promptConfig.blog_post}
    5. Instagram Story: ${promptConfig.instagram_story}
    6. Reels/Shorts: ${promptConfig.reels_shorts}
    7. YouTube Video: ${promptConfig.youtube_video}

    Generate all assets in the requested JSON structure.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a world-class social media manager engine. Always return valid JSON matching the schema.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as GenerationResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateAiImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      // No responseMimeType for image generation
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};