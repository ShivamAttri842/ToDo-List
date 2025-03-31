document.addEventListener('DOMContentLoaded', function () {
    // Load tasks from localStorage if available
    loadTasks();

    // Add event listeners for Enter key on all inputs
    document.querySelectorAll('.task-input').forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const columnId = this.id.split('-')[0];
                addTask(columnId);
            }
        });
    });
});

function createTaskElement(text, columnId) {
    const task = document.createElement('li');
    task.className = 'task';
    task.setAttribute('draggable', 'true');

    // Create task text container
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = text;
    task.appendChild(taskText);

    // Create action buttons container
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit';
    editBtn.onclick = (e) => {
        e.stopPropagation();
        editTask(task);
    };

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteTask(task);
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    task.appendChild(actions);

    // Add drag events
    task.addEventListener('dragstart', dragStart);
    task.addEventListener('dragend', dragEnd);

    return task;
}

function addTask(columnId) {
    const input = document.getElementById(`${columnId}-input`);
    const text = input.value.trim();

    if (text) {
        const task = createTaskElement(text, columnId);
        document.getElementById(`${columnId}-list`).appendChild(task);
        input.value = '';
        saveTasks();
    }
}

function editTask(task) {
    const taskText = task.querySelector('.task-text');
    const currentText = taskText.textContent;
    taskText.contentEditable = true;
    taskText.focus();

    // Select all text for easy editing
    const range = document.createRange();
    range.selectNodeContents(taskText);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    function saveEdit() {
        taskText.contentEditable = false;
        if (taskText.textContent.trim() === '') {
            taskText.textContent = currentText;
        }
        saveTasks();
        taskText.removeEventListener('blur', saveEdit);
        taskText.removeEventListener('keydown', handleKeyDown);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        }
    }

    taskText.addEventListener('blur', saveEdit);
    taskText.addEventListener('keydown', handleKeyDown);
}

function deleteTask(task) {
    if (confirm('Are you sure you want to delete this task?')) {
        task.remove();
        saveTasks();
    }
}

function dragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.querySelector('.task-text').textContent);
    e.dataTransfer.effectAllowed = 'move';
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function allowDrop(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.target.closest('.column').classList.add('drag-over');
}

function dragLeave(e) {
    e.target.closest('.column').classList.remove('drag-over');
}

function drop(e) {
    e.preventDefault();
    const column = e.target.closest('.column');
    column.classList.remove('drag-over');

    const taskText = e.dataTransfer.getData('text/plain');
    const draggingElement = document.querySelector('.dragging');

    if (draggingElement) {
        // If we're dragging an existing element
        column.querySelector('.task-list').appendChild(draggingElement);
    } else {
        // If we're dragging new text (not implemented here, but could be useful)
        const task = createTaskElement(taskText, column.id);
        column.querySelector('.task-list').appendChild(task);
    }

    saveTasks();
}

function saveTasks() {
    const tasks = {
        todo: [],
        progress: [],
        completed: []
    };

    document.querySelectorAll('#todo-list .task').forEach(task => {
        tasks.todo.push(task.querySelector('.task-text').textContent);
    });

    document.querySelectorAll('#progress-list .task').forEach(task => {
        tasks.progress.push(task.querySelector('.task-text').textContent);
    });

    document.querySelectorAll('#completed-list .task').forEach(task => {
        tasks.completed.push(task.querySelector('.task-text').textContent);
    });

    localStorage.setItem('Tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('Tasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);

        tasks.todo.forEach(text => {
            const task = createTaskElement(text, 'todo');
            document.getElementById('todo-list').appendChild(task);
        });

        tasks.progress.forEach(text => {
            const task = createTaskElement(text, 'progress');
            document.getElementById('progress-list').appendChild(task);
        });

        tasks.completed.forEach(text => {
            const task = createTaskElement(text, 'completed');
            document.getElementById('completed-list').appendChild(task);
        });
    }
}