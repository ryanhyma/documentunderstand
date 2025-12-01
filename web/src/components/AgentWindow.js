import React from 'react';
import './AgentWindow.css';

function AgentWindow({ agent }) {
    return (
        <div className="agent-window">
            <div className="agent-header">
                <span className="agent-name">{agent.name}</span>
                <span className={`agent-status ${agent.status.toLowerCase()}`}>{agent.status}</span>
            </div>
            <div className="agent-output">
                {agent.logs.map((log, index) => (
                    <div key={index} className="log-line">{log}</div>
                ))}
            </div>
        </div>
    );
}

export default AgentWindow;
