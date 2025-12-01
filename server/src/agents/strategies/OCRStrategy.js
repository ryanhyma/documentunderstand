const fs = require('fs');
const path = require('path');

class OCRStrategy {
    constructor() {
        // Strategies are the ONLY place where prompts are loaded
        this.systemPrompt = fs.readFileSync(path.join(__dirname, '../../prompts/ocr-system.txt'), 'utf-8');
    }

    buildMessages(state) {
        return [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: state.input }
        ];
    }
}

module.exports = OCRStrategy;
