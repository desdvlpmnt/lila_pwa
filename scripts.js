// Регистрация Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").then(() => {
        console.log("Service Worker Registered");
    });
}

let deferredPrompt;

// Обработка события beforeinstallprompt
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // Предотвращаем автоматическое появление
    deferredPrompt = e;
    showInstallButton(); // Показ кнопки установки приложения
});

// Функция отображения кнопки установки приложения
function showInstallButton() {
    const installButton = document.createElement("button");
    installButton.textContent = "Установить приложение";
    installButton.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
    `;
    document.body.appendChild(installButton);

    installButton.addEventListener("click", () => {
        deferredPrompt.prompt(); // Отображение запроса установки
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("Установка приложения подтверждена");
            } else {
                console.log("Установка приложения отклонена");
            }
            deferredPrompt = null;
            installButton.remove(); // Удаление кнопки после выбора
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light"; // Получаем тему из localStorage
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggle.checked = (savedTheme === "dark"); // Устанавливаем переключатель

    // Принудительно обновляем цвета, чтобы футер и фон были корректными
    updateThemeStyles(savedTheme);
});


// Логика игры
const board = document.getElementById("board");
const player = document.getElementById("player");
const rollDice = document.getElementById("rollDice");
const logBody = document.getElementById("logBody");
const restartGame = document.getElementById("restartGame");
const themeToggle = document.getElementById("themeToggle");
const animatedDice = document.getElementById("animatedDice");
const themeColorMeta = document.querySelector('meta[name="theme-color"]'); // Мета-тег
const historyButton = document.querySelector('.footer-button:nth-child(2)'); // Кнопка "История"
const historyModal = document.getElementById('historyModal');
const closeModal = document.getElementById('closeModal');
const modalOverlay = document.querySelector('.modal-overlay'); // Overlay (тёмный фон)

// Массив названий клеток игрового поля
const cellNames = [
        "Рождение", "Майя", "Гнев", "Жадность", "Физический план", "Заблуждение", "Тщеславие", "Алчность", "Чувственный план", "Очищение", "Развлечения", "Зависть", "Ничтожность", "Астральный план", "План фантазии", "Ревность", "Сострадание", "План радости", "План кармы", "Благотворительность", "Искупление", "План Дхармы", "Небесный план", "Плохая компания", "Хорошая компания", "Печаль", "Самоотверженное служение", "Истинная религиозность", "Отсутствие религиозности", "Хорошие тенденции", "План святости", "План равновесия", "План ароматов", "План вкуса", "Чистилище", "Ясность сознания", "Джняна", "Прана-лока", "Апана-лока", "Въяна-лока", "Человеческий план", "План Агни", "Рождение человека", "Неведение", "Правильное знание", "Различение", "План нейтральности", "Солнечный план", "Лунный план", "План аскетизма", "Земля", "План насилия", "План жидкостей", "План духовной преданности", "Эгоизм", "План изначальных вибраций", "План газов", "План сияния", "План реальности", "Позитивный интеллект", "Негативный интеллект", "Счастье", "Тамас", "Феноменальный план", "План внутреннего пространства", "План блаженства", "План космического блага", "Космическое Сознание", "План Абсолюта", "Саттвагуна", "Раджогуна", "Тамогуна"
];

// Позиции лестниц на игровом поле
const ladders = {
    10: 23, 17: 69, 20: 32, 22: 60, 27: 41, 28: 50, 37: 66, 45: 67, 46: 62, 54: 68
};

// Позиции змей на игровом поле
const snakes = {
    12: 8, 16: 4, 24: 7, 29: 6, 44: 9, 52: 35, 55: 3, 61: 13, 63: 2, 72: 51
};

const boardSize = 72;
let currentPosition = 1;
let moveCount = 0;

// Создание игрового поля
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 9; j++) {
        const index = (i % 2 === 0) ? (i * 9 + j) : (i * 9 + (8 - j));
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.innerHTML = `<span>${72 - index}</span><br>${cellNames[71 - index]}`;
        board.appendChild(cell);
    }
}

// Функция перемещения игрока
function movePlayer(position) {
    const row = Math.floor((position - 1) / 9);
    const col = (position - 1) % 9;
    const x = (row % 2 === 0 ? col + 0.5 : 8 - col + 0.5) * (100 / 9);
    const y = (7 - row + 0.5) * (100 / 8);
    player.style.left = `${x}%`;
    player.style.top = `${y}%`;
}

// Инициализация позиции игрока
movePlayer(currentPosition);

// Функция обновления информации о ходе
function updateTurnInfo(number, position) {
    const cellName = cellNames[position - 1] || `Клетка ${position}`; // Название клетки

    document.getElementById("turnName").textContent = cellName; // Вставляем название клетки
    document.getElementById("turnNumber").textContent = `Ход: ${number}`; // Теперь тут номер хода
    document.getElementById("diceResult").textContent = position; // Теперь тут номер ячейки
}

// Бросок кубика с обновлением номера клетки
animatedDice.addEventListener("click", function handleDiceClick() {
    if (currentPosition === 1) {
        let diceRoll = Math.floor(Math.random() * 6) + 1;

        animatedDice.setAttribute('data-roll', diceRoll);
        logMove(diceRoll, `Бросок: ${diceRoll}`);

        if (diceRoll === 6) {
            currentPosition = 6;
            moveCount++; // Увеличиваем номер хода
            movePlayer(currentPosition);
            logMove(diceRoll, "Вы выбросили 6! Игра начинается, вы на поле 6.");
            showMessage("Вы выбросили 6! Игра начинается, вы на поле 6."); // Показываем сообщение
        } else {
            showMessage("Вы должны выбросить 6, чтобы начать игру.");
        }
    } else {
        let diceRoll = Math.floor(Math.random() * 6) + 1;
        animatedDice.setAttribute('data-roll', diceRoll);

        let diceSum = diceRoll;
        let currentRoll = diceRoll;

        // Если выпадает 6, продолжаем бросать
        while (currentRoll === 6) {
            logMove(currentRoll, "Выпала шестерка, продолжаем бросать.");
            currentRoll = Math.floor(Math.random() * 6) + 1;
            diceSum += currentRoll;
            animatedDice.setAttribute('data-roll', currentRoll);
        }

        let newPosition = currentPosition + diceSum;
        if (newPosition > boardSize) newPosition = boardSize;

        logMove(diceSum, `${currentPosition} → ${newPosition} (${cellNames[newPosition - 1]})`);
        currentPosition = newPosition;

        if (ladders[currentPosition]) {
            const previousPosition = currentPosition;
            currentPosition = ladders[currentPosition];
            logMove("Лестница", `${previousPosition} → ${currentPosition} (${cellNames[currentPosition - 1]})`);
            showMessage(`Вы попали на лестницу! Перемещение на клетку ${currentPosition}.`);
        } else if (snakes[currentPosition]) {
            const previousPosition = currentPosition;
            currentPosition = snakes[currentPosition];
            logMove("Змея", `${previousPosition} → ${currentPosition} (${cellNames[currentPosition - 1]})`);
            showMessage(`Вы попали на змею! Перемещение на клетку ${currentPosition}.`);
        }

        if (currentPosition === 68) {
            logMove("Финиш", "Поздравляем! Вы достигли поля 68 и завершили игру!");
            showMessage("Поздравляем! Вы достигли поля 68 и завершили игру!");
            animatedDice.removeEventListener("click", handleDiceClick);
        }
    }

    movePlayer(currentPosition);
    updateTurnInfo(moveCount, currentPosition); // Передаем номер хода и номер ячейки
});

// Функция для показа сообщений без сдвига игрового поля
function showMessage(text) {
    let messageContainer = document.getElementById("messageContainer");
    if (!messageContainer) return;

    messageContainer.textContent = text;
    messageContainer.style.opacity = "1"; // Делаем контейнер видимым
    messageContainer.style.visibility = "visible"; // Обеспечиваем видимость

    setTimeout(() => {
        messageContainer.style.opacity = "0"; // Скрываем текст (делаем его прозрачным)
        messageContainer.style.visibility = "hidden"; // Делаем контейнер невидимым
    }, 3500);
}


// Логирование хода игрока
function logMove(diceRoll, description) {
    moveCount++;
    const row = document.createElement("tr");
    row.innerHTML = `<td>${moveCount}</td><td>${diceRoll}</td><td>${description}</td>`;
    logBody.prepend(row);
}

restartGame.addEventListener("click", () => {
    currentPosition = 1; // Сброс позиции игрока
    moveCount = 0; // Сброс счетчика ходов
    fullLog = []; // Очистка полного лога
    logBody.innerHTML = ""; // Очистка краткого лога
    animatedDice.setAttribute('data-roll', 1); // Сброс отображения кубика
    movePlayer(currentPosition); // Возвращаем игрока на старт
    rollDice.disabled = false; // Разрешаем бросать кубик
});

function movePlayer(position) {
    const row = Math.floor((position - 1) / 9);
    const col = (position - 1) % 9;
    const x = (row % 2 === 0 ? col + 0.5 : 8 - col + 0.5) * (100 / 9);
    const y = (7 - row + 0.5) * (100 / 8);

    // Создаем шлейф на предыдущей позиции игрока
    const trail = document.createElement("div");
    trail.classList.add("trail");
    trail.style.left = player.style.left; // Используем текущую позицию игрока
    trail.style.top = player.style.top; // Используем текущую позицию игрока
    document.querySelector(".board-container").appendChild(trail);

    // Удаляем шлейф после завершения анимации
    setTimeout(() => {
        trail.remove();
    }, 55500);

    // Перемещаем игрока на новую позицию
    player.style.left = `${x}%`;
    player.style.top = `${y}%`;
}

// Переключение темы оформления
themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "dark" : "light";

    // Устанавливаем тему в `data-theme`
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Обновляем стили для всей темы
    updateThemeStyles(newTheme);
});

// Функция для обновления всех стилей (фон, футер, цвет текста)
function updateThemeStyles(theme) {
    const isDark = theme === "dark";

    document.documentElement.style.setProperty("--background-color-light", isDark ? "#333" : "#f4f4f4");
    document.documentElement.style.setProperty("--text-color-light", isDark ? "#fff" : "#000");
    document.documentElement.style.setProperty("--primary-color-light", isDark ? "#333" : "#F4F4F4");
    document.documentElement.style.setProperty("--footer-bg-light", isDark ? "#474747" : "#ccc");
    document.documentElement.style.setProperty("--footer-text-light", isDark ? "#fff" : "#333");

    // Принудительно обновляем футер (чтобы цвет загружался сразу)
    document.querySelector(".footer").style.backgroundColor = isDark ? "#474747" : "#ccc";
    document.querySelector(".footer").style.color = isDark ? "#fff" : "#333";

    // Обновляем `<meta name="theme-color">` для браузера
    themeColorMeta.setAttribute("content", isDark ? "#474747" : "#ccc");
}


// Изначально скрываем кнопку "Свернуть"
closeModal.style.display = 'none';

// Открытие модального окна
historyButton.addEventListener('click', () => {
    historyModal.style.bottom = '0'; // Показываем модальное окно
    closeModal.style.display = 'block'; // Показываем кнопку "Свернуть"
});

// Закрытие модального окна при нажатии на кнопку "Свернуть"
closeModal.addEventListener('click', () => {
    historyModal.style.bottom = '-100%'; // Скрываем модальное окно
    closeModal.style.display = 'none'; // Скрываем кнопку "Свернуть"
});

// Закрытие модального окна при нажатии на overlay (тёмный фон)
modalOverlay.addEventListener('click', () => {
    historyModal.style.bottom = '-100%'; // Скрываем модальное окно
    closeModal.style.display = 'none'; // Скрываем кнопку "Свернуть"
});

function drawPaths() {
    const paths = document.getElementById("gamePaths");
    paths.innerHTML = ''; // Очищаем перед отрисовкой

    // Функция для рисования линий
    function drawLine(from, to, type) {
        const fromCell = document.querySelector(`[data-cell="${from}"]`);
        const toCell = document.querySelector(`[data-cell="${to}"]`);
        if (!fromCell || !toCell) return;

        const fromRect = fromCell.getBoundingClientRect();
        const toRect = toCell.getBoundingClientRect();

        const x1 = fromRect.left + fromRect.width / 2;
        const y1 = fromRect.top + fromRect.height / 2;
        const x2 = toRect.left + toRect.width / 2;
        const y2 = toRect.top + toRect.height / 2;

        const newPath = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newPath.setAttribute("x1", x1);
        newPath.setAttribute("y1", y1);
        newPath.setAttribute("x2", x2);
        newPath.setAttribute("y2", y2);
        newPath.setAttribute("class", type);

        paths.appendChild(newPath);
    }

    // Отрисовываем стрелы (лестницы)
    Object.entries(ladders).forEach(([from, to]) => {
        drawLine(parseInt(from), to, "arrow");
    });

    // Отрисовываем змей
    Object.entries(snakes).forEach(([from, to]) => {
        drawLine(parseInt(from), to, "snake");
    });
}

// Запускаем после загрузки игрового поля
setTimeout(drawPaths, 500);

// Загрузка данных из JSON
function loadJsonData() {
    return fetch('data.json') // Убедитесь, что файл в той же папке
        .then(response => response.json())
        .catch((error) => {
            console.error("Ошибка при загрузке JSON:", error);
            return {}; // Возвращаем пустой объект, чтобы избежать ошибок
        });
}

// Функция для отображения текста в всплывающем окне
function showPopup(cellName, type) {
    loadJsonData().then(data => {
        // Проверяем, что данные для ячейки существуют
        if (data[cellName] && data[cellName][type]) {
            // Обновляем название ячейки в попапе
            document.getElementById('popup-turnName').innerText = cellName;

            // Устанавливаем текст в всплывающее окно
            document.getElementById('popup-text').innerHTML = data[cellName][type];

            // Показываем всплывающее окно и overlay
            document.getElementById('popup').style.display = 'block';
            document.getElementById('popup-overlay').style.display = 'block';

            // Анимация появления окна сверху
            setTimeout(() => {
                document.getElementById('popup').style.top = '10px';
            }, 50);
        } else {
            console.warn(`Данные для ячейки "${cellName}" не найдены`);
        }
    });
}

// Закрытие всплывающего окна
function closePopup() {
    document.getElementById('popup').style.top = '-100%'; // Анимация скрытия
    setTimeout(() => {
        document.getElementById('popup').style.display = 'none'; // Скрываем окно после анимации
        document.getElementById('popup-overlay').style.display = 'none'; // Скрываем overlay
    }, 300); // Задержка для завершения анимации
}

// Обработчики для кнопок
document.getElementById('shortBtn').addEventListener('click', () => {
    const cellName = document.getElementById('turnName').innerText; // Используйте innerText для текста
    showPopup(cellName, 'коротко');
});

document.getElementById('detailedBtn').addEventListener('click', () => {
    const cellName = document.getElementById('turnName').innerText; // Используйте innerText для текста
    showPopup(cellName, 'подробно');
});

// Закрытие окна при нажатии на кнопку "×"
document.getElementById('popup-close').addEventListener('click', closePopup);

// Закрытие окна при клике на overlay
document.getElementById('popup-overlay').addEventListener('click', closePopup);

console.log('Кнопка нажата!'); // Добавьте это внутри обработчиков для кнопок

loadJsonData().then(data => {
    const text = data[cellName] && data[cellName][type];
    if (text) {
        console.log('Текст найден:', text);
        document.getElementById('popup-text').innerHTML = text;
        document.getElementById('popup').style.display = 'block';
        document.getElementById('popup-overlay').style.display = 'block';
        setTimeout(() => {
            document.getElementById('popup').style.top = '10px';
        }, 10);
    } else {
        console.error(`Не найден текст для ${cellName} с типом ${type}`);
    }
});
