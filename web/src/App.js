import React, { useState } from 'react';
import './App.css';
import AgentWindow from './components/AgentWindow';
import TaskList from './components/TaskList';
import PdfUpload from './components/PdfUpload';

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
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div>
            <PdfUpload onUploaded={async (savedPath) => {
              // Add a pending task
              const id = Date.now();
              setTasks(prev => [{ id, name: savedPath, status: 'Pending' }, ...prev]);

              // Ask backend agents to run and update tasks
              try {
                const resp = await fetch('/agents/run-main', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ input: savedPath })
                });
                const data = await resp.json();
                if (resp.ok && data.result) {
                  // Extract tasks and results from agent run
                  const agentTasks = data.result.tasks || [];
                  const agentResults = data.result.results || {};

                  // Map agent tasks to UI tasks
                  const updated = agentTasks.map((t, idx) => ({
                    id: Date.now() + idx + 1,
                    name: t.input || `Task-${idx+1}`,
                    status: 'Completed',
                    result: agentResults[t.input] || null
                  }));

                  setTasks(prev => [...updated, ...prev.filter(x => x.name !== savedPath)]);
                } else {
                  // update savedPath task to failed
                  setTasks(prev => prev.map(t => t.name === savedPath ? { ...t, status: 'Failed' } : t));
                }
              } catch (err) {
                console.error(err);
                setTasks(prev => prev.map(t => t.name === savedPath ? { ...t, status: 'Error' } : t));
              }
            }} />
          </div>
          <TaskList tasks={tasks} />
        </div>
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
