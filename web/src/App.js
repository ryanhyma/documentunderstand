import React, { useState } from 'react';
import './App.css';
import AgentWindow from './components/AgentWindow';
import TaskList from './components/TaskList';

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Analyze Document', status: 'In Progress' },
    { id: 2, name: 'Extract Entities', status: 'Pending' },
    { id: 3, name: 'Summarize Text', status: 'Completed' },
  ]);

  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Document Analyzer',
      status: 'Running',
      logs: [
        '[INFO] Starting analysis...',
        '[INFO] Loading document...',
        '[DEBUG] Parsing PDF structure...',
        '[INFO] Found 5 pages.'
      ]
    },
    {
      id: 2,
      name: 'Entity Extractor',
      status: 'Idle',
      logs: [
        '[INFO] Waiting for input...',
      ]
    },
  ]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Agent Orchestrator</h1>
      </header>
      <div className="App-body">
        <TaskList tasks={tasks} />
        <div className="agents-container">
          {agents.map(agent => (
            <AgentWindow key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
