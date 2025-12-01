class TaskParser {
    parse(raw) {
        // Simple parser that tries to extract JSON, otherwise returns raw content
        if (typeof raw === 'string') {
            try {
                const jsonMatch = raw.match(/```json\n([\s\S]*?)\n```/) || raw.match(/{[\s\S]*}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
                }
            } catch (e) {
                // Fallback to raw text if JSON parsing fails
            }
        }
        // If raw is an object (e.g. from LangChain), return it directly or wrap it
        if (typeof raw === 'object' && raw.content) {
            return { content: raw.content };
        }

        return { content: raw };
    }
}

module.exports = TaskParser;
