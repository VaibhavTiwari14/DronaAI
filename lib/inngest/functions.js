import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights", retries: 0 },
  { cron: "0 0 * * 0" }, // Runs every Sunday at midnight
  async ({ step }) => {
    try {
      const industries = await step.run("Fetch Industries", async () => {
        return db.industryInsight.findMany({ select: { industry: true } });
      });

      if (!industries.length) {
        console.warn("⚠ No industries found to update.");
        return;
      }

      // Batch processing to reduce API requests
      const prompts = industries.map(({ industry }) => ({
        role: "user",
        parts: [
          {
            text: `
            Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:
            {
              "salaryRanges": [
                { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
              ],
              "growthRate": number,
              "demandLevel": "HIGH" | "MEDIUM" | "LOW",
              "topSkills": ["skill1", "skill2"],
              "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
              "keyTrends": ["trend1", "trend2"],
              "recommendedSkills": ["skill1", "skill2"]
            }
            IMPORTANT: Return ONLY the JSON without additional text.
            Include at least 5 common roles for salary ranges.
            Growth rate should be a percentage.
            Include at least 5 skills and trends.
          `,
          },
        ],
      }));

      const response = await step.ai.wrap("gemini", async (p) => {
        return model.generateContent({ contents: prompts });
      });

      console.log("🔍 Gemini Response:", JSON.stringify(response, null, 2));

      if (!response?.candidates?.length) {
        console.warn("⚠ No valid response from Gemini. Skipping...");
        return;
      }

      for (let i = 0; i < industries.length; i++) {
        const industry = industries[i].industry;
        const text =
          response?.candidates?.[i]?.content?.parts?.[0]?.text?.trim() || "";

        if (!text) {
          console.warn(`⚠ AI returned an empty response for ${industry}. Skipping...`);
          continue;
        }

        let insights;
        try {
          insights = JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
        } catch (jsonError) {
          console.error(`❌ Failed to parse JSON for ${industry}:`, jsonError);
          continue;
        }

        // Add a delay to avoid hitting DB too fast
        await new Promise((resolve) => setTimeout(resolve, 500));

        await step.run(`Update ${industry} insights`, async () => {
          await db.industryInsight.update({
            where: { industry },
            data: {
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next update in 7 days
            },
          });
        });

        console.log(`✅ Successfully updated insights for ${industry}`);
      }
    } catch (error) {
      console.error("❌ Error fetching industries:", error);
    }
  }
);
