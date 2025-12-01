class OCRParser {
    parse(raw) {
        // If raw is an object (e.g. from LangChain), extract content
        if (typeof raw === 'object' && raw.content) {
            return { extractedText: raw.content };
        }
        return { extractedText: raw };
    }
}

module.exports = OCRParser;
