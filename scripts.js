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

// Логика игры
const board = document.getElementById("board");
const player = document.getElementById("player");
const rollDice = document.getElementById("rollDice");
const logBody = document.getElementById("logBody");
const restartGame = document.getElementById("restartGame");
const themeToggle = document.getElementById("themeToggle");
const animatedDice = document.getElementById("animatedDice");

// Массив названий клеток игрового поля
const cellNames = [
    "Земля", "Желание", "Гнев", "Жадность", "Дисциплина", "Вожделение", "Обман", "Праведность", "Милосердие",
    "Ненависть", "Смирение", "Ложь", "Служение", "Хитрость", "Спокойствие", "Жестокость", "Преданность", "Гордыня",
    "Эгоизм", "Самоконтроль", "Невежество", "Ясность", "Благодарность", "Тщеславие", "Удовольствие", "Удовлетворение",
    "Зависть", "Доброта", "Счастье", "Неуверенность", "Прощение", "Дружба", "Энергия", "Лень", "Вдохновение",
    "Сомнение", "Мудрость", "Признание", "Радость", "Иллюзия", "Сострадание", "Любовь", "Искушение", "Доверие",
    "Сила", "Благодать", "Наблюдение", "Озарение", "Покой", "Освобождение", "Духовная практика", "Единство",
    "Осознание", "Истина", "Бесстрашие", "Созерцание", "Интуиция", "Харизма", "Гармония", "Устойчивость",
    "Прозрение", "Целостность", "Присутствие", "Бесконечность", "Абсолют", "Нирвана", "Блаженство", "Космическое Сознание",
    "Трансцендентность", "Просветление", "Мокша", "Самореализация"
];

// Позиции лестниц на игровом поле
const ladders = {
    10: 23, 12: 8, 17: 69, 20: 32, 22: 60, 27: 41, 28: 50, 37: 66, 45: 67, 54: 68
};

// Позиции змей на игровом поле
const snakes = {
    16: 4, 24: 7, 29: 6, 44: 9, 46: 62, 52: 35, 55: 3, 61: 13, 63: 2, 72: 51
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

// Бросок кубика
animatedDice.addEventListener("click", function handleDiceClick() {
    if (currentPosition === 1) {
        // Проверяем, находится ли игрок на старте
        const messageElement = document.getElementById("message") || createMessageElement(); // Создаем или используем существующее сообщение
        let diceRoll = Math.floor(Math.random() * 6) + 1;

        animatedDice.setAttribute('data-roll', diceRoll); // Обновляем анимацию кубика
        logMove(diceRoll, `Бросок: ${diceRoll}`);

        if (diceRoll === 6) {
            // Если выпала 6, начинаем игру
            currentPosition = 6;
            movePlayer(currentPosition);
            logMove(diceRoll, "Вы выбросили 6! Игра начинается, вы на поле 6.");
            messageElement.textContent = ""; // Очищаем сообщение
        } else {
            // Если не выпала 6, показываем сообщение
            messageElement.textContent = "Вы должны выбросить 6, чтобы начать игру.";
        }
    } else {
        // Основной ход
        let diceRoll = Math.floor(Math.random() * 6) + 1;
        animatedDice.setAttribute('data-roll', diceRoll);

        let diceSum = 0;
        let currentRoll = diceRoll;

        // Если выпадает 6, продолжаем бросать
        while (currentRoll === 6) {
            diceSum += currentRoll;
            logMove(currentRoll, "Выпала шестерка, продолжаем бросать.");
            currentRoll = Math.floor(Math.random() * 6) + 1;
            animatedDice.setAttribute('data-roll', currentRoll);
        }

        diceSum += currentRoll;
        let newPosition = currentPosition + diceSum;

        // Проверка на выход за пределы игрового поля
        if (newPosition > boardSize) newPosition = boardSize;

        logMove(diceSum, `Игрок перемещается с ${currentPosition} на ${newPosition} (${cellNames[newPosition - 1]})`);
        currentPosition = newPosition;

        // Проверка на лестницы и змеи
        if (ladders[currentPosition]) {
            logMove("Лестница", `Поднимаемся на ${ladders[currentPosition]} (${cellNames[ladders[currentPosition] - 1]})`);
            currentPosition = ladders[currentPosition];
        } else if (snakes[currentPosition]) {
            logMove("Змея", `Спускаемся на ${snakes[currentPosition]} (${cellNames[snakes[currentPosition] - 1]})`);
            currentPosition = snakes[currentPosition];
        }

        // Проверка завершения игры
        if (currentPosition === 68) {
            logMove("Финиш", "Поздравляем! Вы достигли поля 68 и завершили игру!");
            animatedDice.removeEventListener("click", handleDiceClick);
        }
    }

    movePlayer(currentPosition);
});

// Создаем или возвращаем элемент для сообщения
function createMessageElement() {
    const messageElement = document.createElement("div");
    messageElement.id = "message";
    messageElement.style.textAlign = "center";
    messageElement.style.marginTop = "10px";
    messageElement.style.color = "red";
    document.body.appendChild(messageElement);
    return messageElement;
}

// Логирование хода игрока
function logMove(diceRoll, description) {
    moveCount++;
    const row = document.createElement("tr");
    row.innerHTML = `<td>${moveCount}</td><td>${diceRoll}</td><td>${description}</td>`;
    logBody.prepend(row);
}

// Обработка перезапуска игры
restartGame.addEventListener("click", () => {
    currentPosition = 1;
    moveCount = 0;
    logBody.innerHTML = "";
    animatedDice.setAttribute('data-roll', 1); // Сброс анимации кубика
    movePlayer(currentPosition);
    rollDice.disabled = false; // Активируем кнопку броска кубика
});

// Переключение темы оформления
themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
        document.documentElement.style.setProperty('--background-color-light', '#333');
        document.documentElement.style.setProperty('--text-color-light', '#fff');
        document.documentElement.style.setProperty('--primary-color-light', '#5a9');
    } else {
        document.documentElement.style.setProperty('--background-color-light', '#f4f4f4');
        document.documentElement.style.setProperty('--text-color-light', '#000');
        document.documentElement.style.setProperty('--primary-color-light', '#007bff');
    }
});
