// ===================================================
// JAVASCRIPT PRINCIPAL (script.js)
// ===================================================

// ⚠️ ATENÇÃO: CHAVE DA API ATUALIZADA AQUI (Mantenha sua nova chave aqui)
const API_KEY = "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"; 

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; 

// --- NOVO: VARIÁVEIS E LÓGICA DO POMODORO CUSTOMIZÁVEL ---
let isRunning = false;
let isStudySession = true; 
let timerInterval;
let timeRemaining;
let currentCycles = 0; // Contador de sessões de estudo completas
const TOTAL_CYCLES_FOR_LONG_BREAK = 4; // 4 sessões de estudo antes de uma pausa longa

let pomodoroSettings = {
    study: 25,
    shortBreak: 5,
    longBreak: 15
};

// --- Funções de Persistência e Inicialização ---
function loadPomodoroSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
        pomodoroSettings = JSON.parse(savedSettings);
        // Aplica os valores carregados nos inputs
        document.getElementById('study-min').value = pomodoroSettings.study;
        document.getElementById('short-break-min').value = pomodoroSettings.shortBreak;
        document.getElementById('long-break-min').value = pomodoroSettings.longBreak;
    }
    // Inicializa o tempo restante com a duração do estudo
    timeRemaining = pomodoroSettings.study * 60;
}

function savePomodoroSettings() {
    localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings));
}

// --- Funções Auxiliares ---
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// --- Funções de Controle do Timer ---
function updateTimerDisplay() {
    const displayElement = document.getElementById('time-display');
    const titleElement = document.getElementById('timer-title');
    const startPauseBtn = document.getElementById('start-pause-btn');
    
    if (displayElement) {
        displayElement.textContent = formatTime(timeRemaining);
    }
    if (titleElement) {
        let sessionType = isStudySession ? 'Estudo' : 
                         (currentCycles % TOTAL_CYCLES_FOR_LONG_BREAK === 0 && !isStudySession && currentCycles !== 0) ? 'Pausa Longa' : 'Pausa Curta';
        titleElement.textContent = sessionType;
    }
    if (startPauseBtn) {
        startPauseBtn.textContent = isRunning ? 'Pausar' : 'Iniciar';
    }
    
    // Alerta visual no título da página
    if (timeRemaining >= 0) {
        document.title = `${formatTime(timeRemaining)} - ${titleElement.textContent} | Quackademy`;
    }
}

function startTimer() {
    if (isRunning) return;
    
    // Atualiza o tempo restante caso o usuário tenha alterado as configurações
    if (timeRemaining <= 0) {
        resetTimer();
    }
    
    // Desabilita as configurações enquanto o timer estiver rodando
    document.querySelectorAll('.setting-input').forEach(input => input.disabled = true);

    isRunning = true;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;

        if (timeRemaining < 0) {
            clearInterval(timerInterval);
            
            // Lógica de transição e modal
            const breakModal = document.getElementById('break-modal');
            const modalTitle = document.getElementById('modal-title');
            const modalMessage = document.getElementById('modal-message');

            if (isStudySession) {
                currentCycles++;
                
                const isLongBreak = currentCycles % TOTAL_CYCLES_FOR_LONG_BREAK === 0;
                const breakDuration = isLongBreak ? pomodoroSettings.longBreak : pomodoroSettings.shortBreak;
                
                // Exibe o Modal de Pausa
                modalTitle.textContent = isLongBreak ? "🎉 HORA DA PAUSA LONGA! 🎉" : "🚨 HORA DA PAUSA! 🚨";
                modalMessage.innerHTML = `Seu tempo de **Estudo** acabou. Descanse por <strong>${breakDuration} minutos</strong> para absorver o conteúdo.`;
                breakModal.style.display = 'flex';
                
                isStudySession = false;
                timeRemaining = breakDuration * 60;
                
                // Inicia o timer de pausa em segundo plano
                startTimer(); 
            } else {
                alert("Hora de Voltar a Estudar!");
                isStudySession = true;
                timeRemaining = pomodoroSettings.study * 60;
                isRunning = false;
                startTimer(); // Inicia o próximo ciclo de estudo
            }
        } else {
            updateTimerDisplay();
        }
    }, 1000); // 1 segundo
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    updateTimerDisplay();
}

function resetTimer() {
    pauseTimer();
    isStudySession = true;
    currentCycles = 0; // Zera os ciclos
    timeRemaining = pomodoroSettings.study * 60;
    
    document.title = 'Quackademy - Trilha de Estudos'; 
    updateTimerDisplay();
    
    // Reabilita as configurações
    document.querySelectorAll('.setting-input').forEach(input => input.disabled = false);
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}
// --- FIM DO CÓDIGO POMODORO ---

// --- SISTEMA DE USUÁRIO SIMPLES (LOCALSTORAGE) ---
let currentUser = {
    name: null, 
    trilhas: [], 
    currentTrilhaIndex: -1 
};
let allUsersData = {}; 

let modalState = {}; 
let patolindoState = {
    questionsLeft: 5,
    history: [],
    lastView: "roadmap-view" 
};

// --- Mapeamento de Elementos (Inicializado no DOMContentLoaded) ---
let viewMap = {}; 

// ... (Restante do seu código JavaScript, incluindo as funções de login, trilhas, etc.) ...

// O código abaixo é uma simulação do resto da sua lógica, se precisar, cole o seu código aqui.
function showUserTrilhasView() { console.log("Mostrando trilhas do usuário..."); }
function showPreDefinedCoursesView() { console.log("Mostrando cursos pré-definidos..."); }
function showFormView() { console.log("Mostrando formulário..."); }
function resetApp() { console.log("Resetando app..."); }

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o Pomodoro Timer
    if (document.getElementById('start-pause-btn')) {
        loadPomodoroSettings(); // Carrega as configurações salvas ou default
        
        document.getElementById('start-pause-btn').addEventListener('click', toggleTimer);
        document.getElementById('reset-btn').addEventListener('click', resetTimer);
        
        // Listener para alterações nas configurações
        document.querySelectorAll('.setting-input').forEach(input => {
            input.addEventListener('change', () => {
                // Atualiza o objeto de configurações
                pomodoroSettings.study = parseInt(document.getElementById('study-min').value) || 25;
                pomodoroSettings.shortBreak = parseInt(document.getElementById('short-break-min').value) || 5;
                pomodoroSettings.longBreak = parseInt(document.getElementById('long-break-min').value) || 15;
                savePomodoroSettings(); // Salva no localStorage
                resetTimer(); // Reinicia o timer com as novas configurações
            });
        });
        
        // Listener para o botão do Modal de Pausa
        document.getElementById('btnContinueBreak').addEventListener('click', () => {
            document.getElementById('break-modal').style.display = 'none';
        });
    }
    
    // Inicializa a exibição do tempo logo no início
    updateTimerDisplay();
});
