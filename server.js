import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateReply } from "./ai.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/reply", async (req, res) => {
    const { sender, messages } = req.body;

    if (!sender || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    console.log("Incoming from:", sender);
    console.log("Context size:", messages.length);

    try {
        const reply = await generateReply(sender, messages);
        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI generation failed" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Backend running at http://localhost:3000`);
});
