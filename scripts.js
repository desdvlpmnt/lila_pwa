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
const ladders = { 3: 22, 5: 8, 11: 26, 20: 29 };

// Позиции змей на игровом поле
const snakes = { 17: 4, 19: 7, 21: 9, 27: 1 };

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

// Обработка броска кубика
rollDice.addEventListener("click", () => {
    const diceRoll = Math.floor(Math.random() * 6) + 1;

    // Удаляем атрибут `data-roll`, чтобы сбросить состояние анимации
    animatedDice.removeAttribute('data-roll');

    // Устанавливаем новый атрибут с задержкой, чтобы анимация сработала
    setTimeout(() => {
        animatedDice.setAttribute('data-roll', diceRoll);
    }, 10); // Небольшая задержка для перезапуска анимации

    let newPosition = currentPosition + diceRoll;
    if (newPosition > boardSize) newPosition = boardSize;

    logMove(diceRoll, `Игрок перемещается с ${currentPosition} на ${newPosition} (${cellNames[newPosition - 1]})`);
    currentPosition = newPosition;

    if (ladders[currentPosition]) {
        logMove("Лестница", `Поднимаемся на ${ladders[currentPosition]} (${cellNames[ladders[currentPosition] - 1]})`);
        currentPosition = ladders[currentPosition];
    } else if (snakes[currentPosition]) {
        logMove("Змея", `Спускаемся на ${snakes[currentPosition]} (${cellNames[snakes[currentPosition] - 1]})`);
        currentPosition = snakes[currentPosition];
    }

    movePlayer(currentPosition);

    if (currentPosition === boardSize) {
        logMove("Финиш", "Поздравляем! Вы достигли Космического Сознания!");
        rollDice.disabled = true; // Отключение кнопки после окончания игры
    }
});

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
