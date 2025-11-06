// Estado del juego
const gameState = {
    currentScreen: 'welcome',
    score: 0,
    timeLeft: 30,
    timer: null,
    trashItems: [],
    gameActive: false,
    targetScore: 150
};

// Tipos de basura con sus emojis y puntos
const trashTypes = [
    { emoji: '🍾', points: 10, name: 'Botella' },
    { emoji: '🥫', points: 8, name: 'Lata' },
    { emoji: '📄', points: 5, name: 'Papel' },
    { emoji: '🗑️', points: 15, name: 'Basura' },
    { emoji: '♻️', points: 20, name: 'Reciclable' }
];

// Referencias a elementos DOM
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const gameArea = document.getElementById('game-area');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const finalStats = document.getElementById('final-stats');

// Inicialización
function init() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
}

// Cambiar de pantalla
function showScreen(screenName) {
    // Ocultar todas las pantallas
    welcomeScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    
    // Mostrar la pantalla solicitada
    gameState.currentScreen = screenName;
    
    setTimeout(() => {
        if (screenName === 'welcome') welcomeScreen.classList.add('active');
        if (screenName === 'game') gameScreen.classList.add('active');
        if (screenName === 'result') resultScreen.classList.add('active');
    }, 50);
}

// Iniciar juego
function startGame() {
    // Reiniciar estado
    gameState.score = 0;
    gameState.timeLeft = 30;
    gameState.gameActive = true;
    gameState.trashItems = [];
    
    // Limpiar área de juego
    gameArea.innerHTML = '';
    
    // Actualizar displays
    updateScore();
    updateTimer();
    
    // Mostrar pantalla de juego
    showScreen('game');
    
    // Iniciar temporizador
    startTimer();
    
    // Generar primer icono
    generateTrash();
    
    // Continuar generando iconos
    const trashInterval = setInterval(() => {
        if (gameState.gameActive) {
            generateTrash();
        } else {
            clearInterval(trashInterval);
        }
    }, 1500); // Nuevo icono cada 1.5 segundos
}

// Generar icono de basura
function generateTrash() {
    if (!gameState.gameActive) return;
    
    // Limpiar iconos que ya no son visibles
    cleanupTrash();
    
    // Crear nuevo elemento de basura
    const trashType = trashTypes[Math.floor(Math.random() * trashTypes.length)];
    const trashElement = document.createElement('div');
    trashElement.className = 'trash-item';
    trashElement.textContent = trashType.emoji;
    trashElement.dataset.points = trashType.points;
    trashElement.dataset.name = trashType.name;
    
    // Posición aleatoria
    const maxX = gameArea.offsetWidth - 80;
    const maxY = gameArea.offsetHeight - 80;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    trashElement.style.left = `${x}px`;
    trashElement.style.top = `${y}px`;
    
    // Evento de clic
    trashElement.addEventListener('click', () => collectTrash(trashElement));
    
    // Agregar al área de juego
    gameArea.appendChild(trashElement);
    gameState.trashItems.push(trashElement);
    
    // Desaparecer después de 3 segundos si no se recoge
    setTimeout(() => {
        if (trashElement.parentNode && gameState.gameActive) {
            removeTrash(trashElement);
        }
    }, 3000);
}

// Recoger basura
function collectTrash(element) {
    if (!gameState.gameActive) return;
    
    const points = parseInt(element.dataset.points);
    const name = element.dataset.name;
    
    // Agregar puntos
    gameState.score += points;
    updateScore();
    
    // Animación de recolección
    element.classList.add('clicked');
    element.style.pointerEvents = 'none';
    
    // Remover después de la animación
    setTimeout(() => {
        removeTrash(element);
    }, 500);
    
    // Verificar si ganó
    if (gameState.score >= gameState.targetScore && gameState.gameActive) {
        endGame(true);
    }
}

// Remover basura
function removeTrash(element) {
    const index = gameState.trashItems.indexOf(element);
    if (index > -1) {
        gameState.trashItems.splice(index, 1);
    }
    if (element.parentNode) {
        element.remove();
    }
}

// Limpiar basura invisible
function cleanupTrash() {
    gameState.trashItems = gameState.trashItems.filter(item => {
        if (!item.parentNode) return false;
    return true;
    });
}

// Actualizar puntuación
function updateScore() {
    scoreDisplay.textContent = gameState.score;
    
    // Animación cuando aumenta el score
    scoreDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
        scoreDisplay.style.transform = 'scale(1)';
    }, 200);
}

// Actualizar temporizador
function updateTimer() {
    timerDisplay.textContent = gameState.timeLeft;
    
    // Cambiar color cuando queda poco tiempo
    if (gameState.timeLeft <= 10) {
        timerDisplay.style.color = '#f44336';
        timerDisplay.style.animation = 'pulse 0.5s ease-in-out';
    } else {
        timerDisplay.style.color = '#1976d2';
        timerDisplay.style.animation = 'none';
    }
}

// Iniciar temporizador
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Detener temporizador
function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

// Finalizar juego
function endGame(won) {
    gameState.gameActive = false;
    stopTimer();
    
    // Limpiar todos los iconos
    gameState.trashItems.forEach(item => {
        if (item.parentNode) {
            item.remove();
        }
    });
    gameState.trashItems = [];
    
    // Mostrar resultado después de un breve delay
    setTimeout(() => {
        showResult(won);
    }, 500);
}

// Mostrar resultado
function showResult(won) {
    if (won) {
        resultTitle.textContent = '🎉 ¡Felicitaciones!';
        resultTitle.className = 'result-title win';
        resultMessage.innerHTML = `
            <p>¡Has salvado el planeta! 🌍</p>
            <p>Recolectaste suficiente basura para alcanzar ${gameState.targetScore} puntos.</p>
            <p>¡Eres un verdadero héroe ecológico! 🦸‍♂️♻️</p>
        `;
    } else {
        resultTitle.textContent = '😔 Sigue Intentando';
        resultTitle.className = 'result-title lose';
        resultMessage.innerHTML = `
            <p>No lograste alcanzar los ${gameState.targetScore} puntos necesarios.</p>
            <p>¡Pero no te rindas! Cada intento cuenta.</p>
            <p>El planeta necesita tu ayuda. 💚</p>
        `;
    }
    
    finalStats.innerHTML = `
        <p>⭐ Puntos Finales: ${gameState.score}</p>
        <p>🎯 Objetivo: ${gameState.targetScore} puntos</p>
        <p>⏱️ Tiempo Restante: ${gameState.timeLeft} segundos</p>
    `;
    
    showScreen('result');
}

// Reiniciar juego
function resetGame() {
    // Limpiar todo
    gameState.score = 0;
    gameState.timeLeft = 30;
    gameState.trashItems = [];
    gameState.gameActive = false;
    stopTimer();
    gameArea.innerHTML = '';
    
    // Volver a pantalla de bienvenida
    showScreen('welcome');
}

// Agregar animación de pulso para el temporizador
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

