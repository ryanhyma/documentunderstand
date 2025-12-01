import React from 'react';
import './TaskList.css';

function TaskList({ tasks }) {
    return (
        <div className="task-list">
            <h3>Shared Task List</h3>
            <ul>
                {tasks.map(task => (
                    <li key={task.id} className={`task-item ${task.status.toLowerCase().replace(' ', '-')}`}>
                        <span className="task-name">{task.name}</span>
                        <span className="task-status">{task.status}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TaskList;
