import { Inngest } from "inngest";

export const inngest = new Inngest({
    id: "dronacharya",
    name: "DronaCharya",
    credentials: {
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
        },
    },
});