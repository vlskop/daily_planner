// Элементы DOM
const weekdayElement = document.getElementById('weekday');
const dayElement = document.getElementById('day');
const monthElement = document.getElementById('month');
const yearElement = document.getElementById('year');
const timeElement = document.getElementById('time');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const noteInput = document.getElementById('noteInput');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notesList');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const snackbar = document.getElementById('snackbar');
const totalTasksElement = document.getElementById('totalTasks');
const completedTasksElement = document.getElementById('completedTasks');
const totalNotesElement = document.getElementById('totalNotes');
const filterTabs = document.querySelectorAll('.filter-tab');
const clearCompletedBtn = document.getElementById('clearCompleted');
const exportNotesBtn = document.getElementById('exportNotes');
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const importFile = document.getElementById('importFile');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModalBtn = document.querySelector('.close-modal');
const saveSettingsBtn = document.getElementById('saveSettings');
const themeOptions = document.querySelectorAll('.theme-option');
const weatherIcon = document.getElementById('weatherIcon');
const weatherTemp = document.getElementById('weatherTemp');
const weatherDesc = document.getElementById('weatherDesc');
const weatherHumidity = document.getElementById('weatherHumidity');
const weatherPressure = document.getElementById('weatherPressure');
const weatherVisibility = document.getElementById('weatherVisibility');
const cityInput = document.getElementById('cityInput');
const updateLocationBtn = document.getElementById('updateLocation');
const refreshWeatherBtn = document.getElementById('refreshWeather');
const lockButton = document.getElementById('lockButton');
const lockLabel = document.getElementById('lockLabel');
const appGrid = document.getElementById('app-grid');
const lockIcon = document.getElementById('lockIcon');
const headerComponent = document.getElementById('statusbar');

// Переменные состояния
let currentFilter = 'all';
let currentTheme = localStorage.getItem('theme') || 'light';

// Обновление даты и времени
function updateDateTime() {
    const now = new Date();
    
    weekdayElement.textContent = now.toLocaleDateString('ru-RU', {weekday: 'long'}).toUpperCase();
    dayElement.textContent = now.toLocaleDateString('ru-RU', {day: 'numeric'});
    monthElement.textContent = now.toLocaleDateString('ru-RU', {month: 'long', day:'numeric'}).split(' ')[1].toUpperCase();
    yearElement.textContent = now.toLocaleDateString('ru-RU', {year: 'numeric'});
    timeElement.textContent = now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});          
}

// Показать уведомление
function showSnackbar(message) {
    snackbar.textContent = message;
    snackbar.className = "snackbar show";
    setTimeout(() => {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
}

// Обновление статистики задач
function updateTaskStats() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const completedTasks = tasks.filter(task => task.completed).length;
    
    totalTasksElement.textContent = tasks.length;
    completedTasksElement.textContent = completedTasks;
}

// Обновление статистики заметок
function updateNoteStats() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    totalNotesElement.textContent = notes.length;
}

// Загрузка задач из локального хранилища с сортировкой и фильтрацией
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    taskList.innerHTML = '';
    
    // Фильтрация задач
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">checklist</span>
                <p>${currentFilter === 'all' ? 'У вас пока нет задач' : 
                    currentFilter === 'active' ? 'Нет активных задач' : 
                    'Нет выполненных задач'}</p>
            </div>
        `;
        updateTaskStats();
        return;
    }
    
    // Сортируем задачи: сначала активные, затем выполненные
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return 0;
    });
    
    let hasActiveTasks = false;
    let hasCompletedTasks = false;
    
    sortedTasks.forEach((task, index) => {
        const originalIndex = tasks.findIndex(t => t === task);
        
        if (task.completed) hasCompletedTasks = true;
        else hasActiveTasks = true;
        
        // Добавляем разделитель между активными и выполненными задачами
        if (hasActiveTasks && task.completed && !document.querySelector('.task-divider')) {
            const divider = document.createElement('div');
            divider.className = 'task-divider';
            divider.innerHTML = '<div class="task-divider-text">Выполненные задачи</div>';
            taskList.appendChild(divider);
        }
        
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'task-completed' : ''} ${task.priority ? `priority-${task.priority}` : ''}`;
        taskItem.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-index="${originalIndex}">
                <div class="task-text">${task.text}</div>
            </div>
            <div class="task-actions">
                <button class="btn btn-text btn-danger ripple delete-task" data-index="${originalIndex}">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
    
    // Добавляем обработчики событий для чекбоксов и кнопок удаления
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTaskCompletion);
    });
    
    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', deleteTask);
    });
    
    updateTaskStats();
}

// Загрузка заметок из локального хранилища
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">note_add</span>
                <p>У вас пока нет заметок</p>
            </div>
        `;
        updateNoteStats();
        return;
    }
    
    // Сортируем заметки по дате (новые сверху)
    const sortedNotes = [...notes].reverse();
    
    sortedNotes.forEach((note, index) => {
        const originalIndex = notes.length - 1 - index; // Сохраняем правильный индекс
        
        const noteItem = document.createElement('li');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
            <div class="note-content">
                <div class="note-text">${note.text}</div>
                <div class="note-date">${note.date}</div>
            </div>
            <div class="note-actions">
                <button class="btn btn-text btn-danger ripple delete-note" data-index="${originalIndex}">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        notesList.appendChild(noteItem);
    });
    
    // Добавляем обработчики событий для кнопок удаления
    document.querySelectorAll('.delete-note').forEach(button => {
        button.addEventListener('click', deleteNote);
    });
    
    updateNoteStats();
}

// Добавление новой задачи
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') {
        taskInput.focus();
        return;
    }
    
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({
        text: taskText,
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskInput.value = '';
    loadTasks();
    showSnackbar('Задача добавлена');
}

// Добавление новой заметки
function addNote() {
    const noteText = noteInput.value.trim();
    if (noteText === '') {
        noteInput.focus();
        return;
    }
    
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const now = new Date();
    const dateString = now.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    notes.push({
        text: noteText,
        date: dateString,
        createdAt: now.toISOString()
    });
    
    localStorage.setItem('notes', JSON.stringify(notes));
    noteInput.value = '';
    loadNotes();
    showSnackbar('Заметка добавлена');
}

// Переключение состояния выполнения задачи
function toggleTaskCompletion(e) {
    const index = e.target.dataset.index;
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    showSnackbar(tasks[index].completed ? 'Задача выполнена' : 'Задача возобновлена');
}

// Удаление задачи
function deleteTask(e) {
    const button = e.target.closest('.delete-task');
    if (!button) return;
    
    const index = button.dataset.index;
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    showSnackbar('Задача удалена');
}

// Удаление заметки
function deleteNote(e) {
    const button = e.target.closest('.delete-note');
    if (!button) return;
    
    const index = button.dataset.index;
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
    showSnackbar('Заметка удалена');
}

// Очистка выполненных задач
function clearCompletedTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const activeTasks = tasks.filter(task => !task.completed);
    
    if (activeTasks.length === tasks.length) {
        showSnackbar('Нет выполненных задач для удаления');
        return;
    }
    
    localStorage.setItem('tasks', JSON.stringify(activeTasks));
    loadTasks();
    showSnackbar('Выполненные задачи удалены');
}

// Экспорт заметок
function exportNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    if (notes.length === 0) {
        showSnackbar('Нет заметок для экспорта');
        return;
    }
    
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `notes_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showSnackbar('Заметки экспортированы');
}

// Экспорт всех данных
function exportAllData() {
    const data = {
        tasks: JSON.parse(localStorage.getItem('tasks')) || [],
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        settings: {
            theme: currentTheme,
            city: localStorage.getItem('city') || 'Москва'
        },
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `planner_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showSnackbar('Данные экспортированы');
}

// Импорт данных
function importData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
            if (data.notes) localStorage.setItem('notes', JSON.stringify(data.notes));
            if (data.settings) {
                if (data.settings.theme) {
                    currentTheme = data.settings.theme;
                    applyTheme(currentTheme);
                }
                if (data.settings.city) {
                    localStorage.setItem('city', data.settings.city);
                    cityInput.value = data.settings.city;
                    getWeatherData();
                }
            }
            
            loadTasks();
            loadNotes();
            showSnackbar('Данные импортированы');
        } catch (error) {
            showSnackbar('Ошибка при импорте данных');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
}

// Применение темы
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Обновляем активную кнопку темы
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
}

// Получение данных о погоде
async function getWeatherData() {
    const city = cityInput.value.trim() || 'Москва';
    
    try {
        // Используем OpenWeatherMap API (нужно заменить на ваш API ключ)
        const apiKey = '269b70f75feb3a32fc783af3f21b69f9'; // Замените на реальный API ключ
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=ru`
        );
        
        if (!response.ok) throw new Error('Город не найден');
        
        const data = await response.json();
        
        // Обновляем интерфейс
        weatherTemp.textContent = `${Math.round(data.main.temp)}°`;
        weatherDesc.textContent = data.weather[0].description;
        weatherHumidity.textContent = `${data.main.humidity}%`;
        weatherPressure.textContent = `${data.main.pressure} hPa`;
        weatherVisibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        
        // Устанавливаем иконку погоды
        const iconCode = data.weather[0].icon;
        setWeatherIcon(iconCode);
        
        // Сохраняем город
        localStorage.setItem('city', city);
        
    } catch (error) {
        console.error('Weather error:', error);
        weatherTemp.textContent = '--°';
        weatherDesc.textContent = 'Город не найден';
        weatherHumidity.textContent = '--%';
        weatherPressure.textContent = '-- hPa';
        weatherVisibility.textContent = '-- km';
        weatherIcon.textContent = 'location_off';
    }
}

// Установка иконки погоды
function setWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'wb_sunny',
        '01n': 'brightness_3',
        '02d': 'wb_cloudy',
        '02n': 'wb_cloudy',
        '03d': 'cloud',
        '03n': 'cloud',
        '04d': 'cloud_queue',
        '04n': 'cloud_queue',
        '09d': 'umbrella',
        '09n': 'umbrella',
        '10d': 'beach_access',
        '10n': 'beach_access',
        '11d': 'flash_on',
        '11n': 'flash_on',
        '13d': 'ac_unit',
        '13n': 'ac_unit',
        '50d': 'cloud',
        '50n': 'cloud'
    };
    
    weatherIcon.textContent = iconMap[iconCode] || 'help_outline';
}

// Прокрутка к верху страницы
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Показать/скрыть кнопку прокрутки
function toggleScrollButton() {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
}

// Инициализация ripple эффекта
function initRippleEffects() {
    document.querySelectorAll('.ripple').forEach(element => {
        element.addEventListener('click', function(e) {
            // Удаляем существующие ripple эффекты
            const existingRipples = this.querySelectorAll('.ripple-effect');
            existingRipples.forEach(ripple => ripple.remove());
            
            const circle = document.createElement('div');
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            const radius = diameter / 2;
            
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;
            circle.classList.add('ripple-effect');
            circle.style.background = 'rgba(255, 255, 255, 0.7)';
            circle.style.borderRadius = '50%';
            circle.style.position = 'absolute';
            circle.style.pointerEvents = 'none';
            circle.style.transform = 'scale(0)';
            circle.style.animation = 'ripple 0.6s linear';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(circle);
            
            setTimeout(() => {
                if (circle.parentNode === this) {
                    this.removeChild(circle);
                }
            }, 600);
        });
    });
}

// Инициализация приложения
function init() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Загружаем настройки
    applyTheme(currentTheme);
    
    // Загружаем сохраненный город
    const savedCity = localStorage.getItem('city');
    if (savedCity) {
        cityInput.value = savedCity;
    }
    
    loadTasks();
    loadNotes();
    
    // Получаем данные о погоде
    getWeatherData();
    
    // Обработчики событий
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    addNoteBtn.addEventListener('click', addNote);
    noteInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') addNote();
    });
    
    lockButton.addEventListener('click', lockInterface);

    function lockInterface() {
         
        appGrid.classList.toggle('hide');
        headerComponent.classList.toggle('lock-interface');
        fabComponent = document.querySelector('.fab-container');
        fabComponent.classList.toggle('hide');

        if (appGrid.classList.contains('hide')) {
            lockLabel.textContent = 'Разблокировать';
            lockIcon.textContent = 'lock_open';
            
        } else {
            lockLabel.textContent = 'Заблокировать';
            lockIcon.textContent = 'lock';
        }

    }
    

    // Фильтрация задач
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            loadTasks();
        });
    });
    
    // Очистка выполненных задач
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Экспорт/импорт
    exportNotesBtn.addEventListener('click', exportNotes);
    exportDataBtn.addEventListener('click', exportAllData);
    importDataBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            importData(e.target.files[0]);
            e.target.value = ''; // Сбрасываем input
        }
    });
    
    // Настройки
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('show');
    });
    
    closeModalBtn.addEventListener('click', () => {
        settingsModal.classList.remove('show');
    });
    
    saveSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('show');
        showSnackbar('Настройки сохранены');
    });
    
    // Тема
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
        });
    });
    
    // Погода
    updateLocationBtn.addEventListener('click', getWeatherData);
    refreshWeatherBtn.addEventListener('click', getWeatherData);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getWeatherData();
    });
    
    // Прокрутка
    scrollTopBtn.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleScrollButton);
    
    // Инициализация ripple эффектов
    initRippleEffects();
    
    // Скрываем кнопку прокрутки при загрузке
    toggleScrollButton();
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('show');
        }
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);