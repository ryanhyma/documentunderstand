import React from 'react';
import './TaskList.css';

function TaskList({ tasks }) {
    return (
        <div className="task-list">
            <h3>Shared Task List</h3>
            <ul>
                {tasks.map(task => (
                    <li key={task.id} className={`task-item ${task.status.toLowerCase().replace(' ', '-')}`}>
                        <div className="task-main">
                            <span className="task-name">{task.name}</span>
                            <span className="task-status">{task.status}</span>
                        </div>
                        {task.result && (
                            <pre className="task-result">{typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2)}</pre>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TaskList;
