import OpenAI from "openai";

import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAISuggestion(codeContext: string): Promise<string> {
  try {
    const prompt = `You are an accessibility expert. The following is an HTML code snippet. Improve its accessibility by adding meaningful aria-labels or any other necessary attributes directly into the code. Return only the modified code without any explanations or wrapping tags.

    Code:
    ${codeContext}`;

    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an accessibility expert. Modify the provided code and return the modified code only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4o-mini", // or use "gpt-3.5-turbo" if needed
      max_tokens: 500,
    });

    const content = response.choices[0].message?.content?.trim() || "";
    return content;
  } catch (error) {
    console.error("Error while fetching AI suggestion:", error);
    return "Error generating AI suggestion. Please try again.";
  }
}
