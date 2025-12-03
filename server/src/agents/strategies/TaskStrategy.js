import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class TaskStrategy {
    constructor() {
        // Strategies are the ONLY place where prompts are loaded
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.systemPrompt = fs.readFileSync(path.join(__dirname, '../../prompts/task-system.txt'), 'utf-8');
    }

    buildMessages(state) {
        return [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: state.input }
        ];
    }
}

export default TaskStrategy;
