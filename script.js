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

let selectedTodoColor = 'pink'; // Default color


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
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return todoColors[Math.abs(hash) % todoColors.length];
}

// 한국어 날짜 헤더 포맷: "2025년 12월 30일 (화)" 형식으로 반환
function formatKoreanDateHeader(dateObj) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[dateObj.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
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

            const dateTodos = todos.filter(t => t.date === dateStr);
            if (dateTodos.length > 0) {
                const todosContainer = document.createElement('div');
                todosContainer.className = 'calendar-todos';

                dateTodos.forEach(todo => {
                    const todoItem = document.createElement('div');
                    const color = todo.color;
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
            color: selectedTodoColor, // Save selected color
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
    const selectedDateValue = document.getElementById('date-input').value;
    todoList.innerHTML = '';

    // 현재 선택된 날짜의 To-Do만 필터링
    const filteredTodos = todos.filter(todo => todo.date === selectedDateValue);

    if (filteredTodos.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-msg';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '2rem';
        emptyMsg.style.color = '#9ca3af';
        emptyMsg.style.fontSize = '0.875rem';
        emptyMsg.textContent = '해당 날짜에 일정이 없습니다.';
        todoList.appendChild(emptyMsg);
        return;
    }

    const [year, month, day] = selectedDateValue.split('-');
    const dateObj = new Date(year, month - 1, day);
    const dateGroup = document.createElement('div');
    dateGroup.className = 'todo-date-group';

    const dateHeader = document.createElement('h3');
    dateHeader.className = 'todo-date-header';

    const today = new Date();
    const isToday = selectedDateValue === formatDate(today);

    // 한국어 날짜 형식: '2025년 12월 30일 (화)'
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    const dateText = dateObj.toLocaleDateString('ko-KR', options);

    if (isToday) {
        dateHeader.textContent = `오늘, ${dateText}`;
    } else {
        dateHeader.textContent = dateText;
    }

    dateGroup.appendChild(dateHeader);

    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';

        const itemContent = document.createElement('div');
        itemContent.className = 'todo-item-content';

        // 색상 바 추가
        const colorBar = document.createElement('div');
        const color = todo.color || 'pink';
        colorBar.className = `todo-item-color-bar todo-bg-${color}`;
        todoItem.appendChild(colorBar);

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
    const themeMenuHTML = `
        <div class="theme-toggle-container">
            <button class="theme-toggle" onclick="toggleThemeMenu()">
                <span class="material-icons-round">palette</span>
            </button>
            <div class="theme-menu" id="theme-menu">
                <button class="theme-option" data-theme="pink" onclick="changeTheme('pink')" title="Pink">
                    <div class="theme-preview" style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);"></div>
                </button>
                <button class="theme-option" data-theme="yellow" onclick="changeTheme('yellow')" title="Yellow">
                    <div class="theme-preview" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);"></div>
                </button>
                <button class="theme-option" data-theme="green" onclick="changeTheme('green')" title="Green">
                    <div class="theme-preview" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);"></div>
                </button>
                <button class="theme-option" data-theme="blue" onclick="changeTheme('blue')" title="Blue">
                    <div class="theme-preview" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);"></div>
                </button>
                <button class="theme-option" data-theme="purple" onclick="changeTheme('purple')" title="Purple">
                    <div class="theme-preview" style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);"></div>
                </button>
                <button class="theme-option" data-theme="beige" onclick="changeTheme('beige')" title="Beige">
                    <div class="theme-preview" style="background: linear-gradient(135deg, #f5f5dc 0%, #e8e8d0 100%);"></div>
                </button>
                <button class="theme-option" data-theme="dark" onclick="changeTheme('dark')" title="Dark">
                    <div class="theme-preview" style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%);"></div>
                </button>
            </div>
        </div>
    `;

    if (headerImage) {
        headerDiv.style.backgroundImage = `url(${headerImage})`;
        headerDiv.style.background = `url(${headerImage}) center/cover`;
        headerDiv.innerHTML = `
            <input type="file" id="image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
            <div class="image-change-overlay" onclick="document.getElementById('image-upload').click()">
                <span class="material-icons-round">sync</span>
                <span>Click to change image</span>
            </div>
            ${themeMenuHTML}
        `;
    } else {
        headerDiv.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
        headerDiv.innerHTML = `
            <input type="file" id="image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
            <div class="image-placeholder" onclick="document.getElementById('image-upload').click()">
                <span class="material-icons-round">add_photo_alternate</span>
                <span>Click to add background image</span>
            </div>
            ${themeMenuHTML}
        `;
    }

    // 활성 테마 표시
    const savedTheme = localStorage.getItem('color-theme') || 'pink';
    setTimeout(() => {
        const activeOption = document.querySelector(`[data-theme="${savedTheme}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }, 100);
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

function toggleThemeMenu() {
    const menu = document.getElementById('theme-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function changeTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('color-theme', theme);

    // 활성 테마 표시
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    const activeOption = document.querySelector(`[data-theme="${theme}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }

    // 메뉴 닫기
    const menu = document.getElementById('theme-menu');
    if (menu) {
        menu.classList.remove('active');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('color-theme') || 'pink';
    document.body.setAttribute('data-theme', savedTheme);
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

        // 기존 데이터 마이그레이션: 색상이 없는 경우 'pink'로 지정
        let migrated = false;
        todos = todos.map(todo => {
            if (!todo.color) {
                todo.color = 'pink';
                migrated = true;
            }
            return todo;
        });

        if (migrated) {
            saveData();
        }

        todoId = data.lastTodoId || 0;
        headerImage = data.headerImage || null;
        updateHeaderImage();
    }
}

// 외부 클릭 시 메뉴들 닫기
document.addEventListener('click', (event) => {
    // 테마 메뉴 처리
    const themeMenu = document.getElementById('theme-menu');
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeMenu && themeToggle && !themeMenu.contains(event.target) && !themeToggle.contains(event.target)) {
        themeMenu.classList.remove('active');
    }

    // 색상 선택기 메뉴 처리
    const colorMenu = document.getElementById('color-picker-menu');
    const colorToggle = document.getElementById('current-color-btn');
    if (colorMenu && colorToggle && !colorMenu.contains(event.target) && !colorToggle.contains(event.target)) {
        colorMenu.classList.remove('active');
    }
});

function toggleColorMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('color-picker-menu');
    menu.classList.toggle('active');
}

function renderColorPicker() {
    const menu = document.getElementById('color-picker-menu');
    const trigger = document.getElementById('current-color-btn');

    // 버튼 배경색 업데이트
    trigger.className = `current-color-btn todo-bg-${selectedTodoColor}`;

    menu.innerHTML = '';
    todoColors.forEach(color => {
        const option = document.createElement('button');
        option.className = `color-option todo-bg-${color}${selectedTodoColor === color ? ' active' : ''}`;
        option.onclick = () => {
            selectedTodoColor = color;
            renderColorPicker();
            menu.classList.remove('active');
        };
        menu.appendChild(option);
    });
}

// Initialize
const dateInput = document.getElementById('date-input');
dateInput.value = getTodayString();
dateInput.addEventListener('input', renderTodos);

renderColorPicker(); // Initialize color picker
loadTheme();
loadData();
generateCalendar();
renderTodos();