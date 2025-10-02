const now = new Date();
let currentMonth = now.getMonth();
let currentYear = now.getFullYear();
let todos = [];
let todoId = 0;
let selectedDate = null;
let headerImage = null;

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayString() {
    return formatDate(new Date());
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
                const row = document.createElement('tr');
                
                for (let day = 0; day < 7; day++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + (week * 7) + day);
                    const dateStr = formatDate(date);
                    
                    const cell = document.createElement('td');
                    cell.className = 'calendar-cell';
                    cell.onclick = () => selectDate(dateStr);
                    
                    if (date.getMonth() !== currentMonth) {
                        cell.classList.add('other-month');
                    }
                    
                    if (day === 0) {
                        cell.classList.add('weekend');
                    } else if (day === 6) {
                        cell.classList.add('saturday');
                    }
                    
                    if (dateStr === todayStr) {
                        cell.classList.add('today');
                    }

                    if (dateStr === selectedDate) {
                        cell.classList.add('selected');
                    }
                    
                    cell.innerHTML = `<div class="date-number">${date.getDate()}</div>`;
                    
                    const dateTodos = todos.filter(t => t.date === dateStr);
                    if (dateTodos.length > 0) {
                        const dotsContainer = document.createElement('div');
                        dotsContainer.className = 'todo-dots';
                        dateTodos.slice(0, 3).forEach(todo => {
                            const dot = document.createElement('div');
                            dot.className = 'todo-dot' + (todo.completed ? ' completed' : '');
                            dotsContainer.appendChild(dot);
                        });
                        cell.appendChild(dotsContainer);
                    }
                    
                    row.appendChild(cell);
                }
                
                calendarBody.appendChild(row);
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
                
                const dateHeader = document.createElement('div');
                dateHeader.className = 'todo-date-header';
                dateHeader.textContent = dateObj.toLocaleDateString('ko-KR', { 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                });
                dateGroup.appendChild(dateHeader);
                
                groupedTodos[date].forEach(todo => {
                    const todoItem = document.createElement('div');
                    todoItem.className = 'todo-item';
                    
                    todoItem.innerHTML = `
                        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                             onclick="toggleTodo(${todo.id})">
                            ${todo.completed ? '✓' : ''}
                        </div>
                        <div class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
                        <button class="delete-button" onclick="deleteTodo(${todo.id})">×</button>
                    `;
                    
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

        function handleImageUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    headerImage = e.target.result;
                    const headerDiv = document.getElementById('todo-header-image');
                    headerDiv.innerHTML = `
                        <img src="${headerImage}" alt="Header Background">
                        <div class="image-change-overlay">
                            <span>🔄 Click to change image</span>
                        </div>
                    `;
                    saveData();
                };
                reader.readAsDataURL(file);
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
                
                if (headerImage) {
                    const headerDiv = document.getElementById('todo-header-image');
                    headerDiv.innerHTML = `
                        <img src="${headerImage}" alt="Header Background">
                        <div class="image-change-overlay">
                            <span>🔄 Click to change image</span>
                        </div>
                    `;
                }
            }
        }

        // Initialize
        document.getElementById('date-input').value = getTodayString();
        loadData();
        generateCalendar();
        renderTodos();