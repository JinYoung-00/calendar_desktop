const now = new Date();
let currentMonth = now.getMonth();
let currentYear = now.getFullYear();
let todos = [];
let todoId = 0;
let selectedDate = null;
let headerImage = null;

// Todo color palette
const todoColors = [
    'pink', 'amber', 'orange', 'indigo', 'rose',
    'blue', 'emerald', 'teal', 'red', 'purple', 'fuchsia'
];

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayString() {
    return formatDate(new Date());
}

function getColorForTodo(text) {
    // Simple hash function to get consistent color for same text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return todoColors[Math.abs(hash) % todoColors.length];
}

function generateCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarBody = document.getElementById('calendar-body');
    const title = document.getElementById('calendar-title');

    title.textContent = `${currentYear}년 ${currentMonth + 1}월`;
    calendarBody.innerHTML = '';

    const today = new Date();
    const todayStr = formatDate(today);

    for (let week = 0; week < 6; week++) {
        for (let day = 0; day < 7; day++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + (week * 7) + day);
            const dateStr = formatDate(date);

            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.onclick = () => selectDate(dateStr);

            if (date.getMonth() !== currentMonth) {
                cell.classList.add('other-month');
            }

            if (day === 0) {
                cell.classList.add('sunday');
            } else if (day === 6) {
                cell.classList.add('saturday');
            }

            if (dateStr === todayStr) {
                cell.classList.add('today');
            }

            if (dateStr === selectedDate) {
                cell.classList.add('selected');
            }

            const dateNumber = document.createElement('div');
            dateNumber.className = 'date-number';
            dateNumber.textContent = date.getDate();
            cell.appendChild(dateNumber);

            // Add todo items to calendar
            const dateTodos = todos.filter(t => t.date === dateStr);
            if (dateTodos.length > 0) {
                const todosContainer = document.createElement('div');
                todosContainer.className = 'calendar-todos';

                dateTodos.slice(0, 3).forEach(todo => {
                    const todoItem = document.createElement('div');
                    const color = getColorForTodo(todo.text);
                    todoItem.className = `calendar-todo-item todo-color-${color}`;
                    todoItem.textContent = todo.text;
                    todoItem.title = todo.text;
                    todosContainer.appendChild(todoItem);
                });

                cell.appendChild(todosContainer);
            }

            calendarBody.appendChild(cell);
        }
    }
}

function selectDate(dateStr) {
    selectedDate = dateStr;
    document.getElementById('date-input').value = dateStr;
    generateCalendar();
    renderTodos();
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
}

function addTodo() {
    const input = document.getElementById('todo-input');
    const dateInput = document.getElementById('date-input');
    const text = input.value.trim();
    const date = dateInput.value || getTodayString();

    if (text) {
        todos.push({
            id: todoId++,
            text: text,
            date: date,
            completed: false,
            createdAt: new Date().toISOString()
        });
        input.value = '';
        saveData();
        generateCalendar();
        renderTodos();
    }
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    const sortedTodos = [...todos].sort((a, b) => a.date.localeCompare(b.date));

    const groupedTodos = {};
    sortedTodos.forEach(todo => {
        if (!groupedTodos[todo.date]) {
            groupedTodos[todo.date] = [];
        }
        groupedTodos[todo.date].push(todo);
    });

    Object.keys(groupedTodos).forEach(date => {
        const [year, month, day] = date.split('-');
        const dateObj = new Date(year, month - 1, day);
        const dateGroup = document.createElement('div');
        dateGroup.className = 'todo-date-group';

        const dateHeader = document.createElement('h3');
        dateHeader.className = 'todo-date-header';

        const today = new Date();
        const isToday = date === formatDate(today);

        if (isToday) {
            dateHeader.textContent = `Today, ${day} ${dateObj.toLocaleDateString('en-US', { month: 'short' })}`;
        } else {
            dateHeader.textContent = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            });
        }

        dateGroup.appendChild(dateHeader);

        groupedTodos[date].forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';

            const itemContent = document.createElement('div');
            itemContent.className = 'todo-item-content';

            const leftDiv = document.createElement('div');
            leftDiv.className = 'todo-item-left';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.completed;
            checkbox.onchange = () => toggleTodo(todo.id);

            const text = document.createElement('span');
            text.className = 'todo-text' + (todo.completed ? ' completed' : '');
            text.textContent = todo.text;

            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(text);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-button';
            deleteBtn.onclick = () => deleteTodo(todo.id);
            deleteBtn.innerHTML = '<span class="material-icons-round">close</span>';

            itemContent.appendChild(leftDiv);
            itemContent.appendChild(deleteBtn);
            todoItem.appendChild(itemContent);

            dateGroup.appendChild(todoItem);
        });

        todoList.appendChild(dateGroup);
    });
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveData();
        generateCalendar();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveData();
    generateCalendar();
    renderTodos();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
}

function updateHeaderImage() {
    const headerDiv = document.getElementById('todo-header-image');

    if (headerImage) {
        headerDiv.style.backgroundImage = `url(${headerImage})`;
        headerDiv.style.background = `url(${headerImage}) center/cover`;
        headerDiv.innerHTML = `
            <input type="file" id="image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
            <div class="image-change-overlay" onclick="document.getElementById('image-upload').click()">
                <span class="material-icons-round">sync</span>
                <span>Click to change image</span>
            </div>
            <button class="theme-toggle" onclick="toggleTheme()">
                <span class="material-icons-round light-icon">dark_mode</span>
                <span class="material-icons-round dark-icon">light_mode</span>
            </button>
        `;
    } else {
        headerDiv.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
        headerDiv.innerHTML = `
            <input type="file" id="image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
            <div class="image-placeholder" onclick="document.getElementById('image-upload').click()">
                <span class="material-icons-round">add_photo_alternate</span>
                <span>Click to add background image</span>
            </div>
            <button class="theme-toggle" onclick="toggleTheme()">
                <span class="material-icons-round light-icon">dark_mode</span>
                <span class="material-icons-round dark-icon">light_mode</span>
            </button>
        `;
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            headerImage = e.target.result;
            updateHeaderImage();
            saveData();
        };
        reader.readAsDataURL(file);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
}

function saveData() {
    const data = {
        todos: todos,
        lastTodoId: todoId,
        headerImage: headerImage,
        lastSaved: new Date().toISOString()
    };
    localStorage.setItem('calendarTodoData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('calendarTodoData');
    if (saved) {
        const data = JSON.parse(saved);
        todos = data.todos || [];
        todoId = data.lastTodoId || 0;
        headerImage = data.headerImage || null;

        updateHeaderImage();
    }
}

// Initialize
document.getElementById('date-input').value = getTodayString();
loadTheme();
loadData();
generateCalendar();
renderTodos();