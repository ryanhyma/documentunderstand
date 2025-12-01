// Simple mock LLM used for local development and testing.
// Exports an object with `invoke(messages)` that returns a promise
// resolving to an object with a `content` property. The mock looks
// at the last user message and constructs a JSON plan when it sees
// a string containing 'Process' or a PDF filename.

module.exports = {
  invoke: async (messages) => {
    const last = (messages && messages.length) ? messages[messages.length - 1].content : '';

    // If the user asked to process a file, return a JSON tasks list
    const m = typeof last === 'string' ? last : '';
    const match = m.match(/(\S+\.pdf)/i);

    if (m.toLowerCase().includes('process') && match) {
      const filename = match[1];
      const tasks = [{ type: 'OCR', input: filename }];
      return { content: JSON.stringify({ tasks }), tasks };
    }

    // Fallback: if message mentions 'ocr' return a basic OCR task
    if (m.toLowerCase().includes('ocr')) {
      // try to extract a token that looks like a path
      const maybe = match ? match[1] : 'uploaded.pdf';
      const tasks = [{ type: 'OCR', input: maybe }];
      return { content: JSON.stringify({ tasks }), tasks };
    }

    // Default reply
    return { content: '[]' };
  }
};
