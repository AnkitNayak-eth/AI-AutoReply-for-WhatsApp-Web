import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function generateReply(sender, messages) {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content:
                    "You are replying as the WhatsApp user. Keep replies short, natural, casual, human. No emojis. No explanations."
            },
            ...messages
        ],
        temperature: 1,
        max_completion_tokens: 80,
        top_p: 1
    });

    return completion.choices[0].message.content.trim();
}
