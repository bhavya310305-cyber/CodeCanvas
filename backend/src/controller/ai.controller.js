const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const askAI = async (req, res) => {
    try {
        const { message, code, language, title } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const trimmedCode = code
            ? code.split('\n').slice(0, 150).join('\n')
            : null;

        const systemPrompt = `You are an expert code assistant inside a developer tool called CodeCanvas. 
        Be concise, clear, and helpful. Use markdown formatting for code blocks.
        When analyzing code, be specific and actionable.`;

        const userMessage = trimmedCode
            ? `I'm working on a ${language} snippet called "${title}". Here's the code:\n\`\`\`${language}\n${trimmedCode}\n\`\`\`\n\n${message}`
            : message;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'openai/gpt-oss-120b',
            max_tokens: 1024,
        });

        const reply = chatCompletion.choices[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({ message: 'No response from AI. Please try again.' });
        }

        res.status(200).json({ reply });

    } catch (error) {
        console.error('AI controller error:', error.message);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

module.exports = { askAI };
