// ===================================================
// JAVASCRIPT PRINCIPAL (script.js)
// ===================================================

// ⚠️ ATENÇÃO: CHAVE DA API ATUALIZADA AQUI (Mantenha sua nova chave aqui)
const API_KEY = "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"; 

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; 

// --- VARIÁVEIS DO POMODORO ---
let isPomodoroRunning = false;
let isStudySession = true; 
let timerInterval;
let timeRemaining;
let currentCycles = 0;
const TOTAL_CYCLES_FOR_LONG_BREAK = 4;

let pomodoroSettings = {
    study: 25,
    shortBreak: 5,
    longBreak: 15
};

// --- SISTEMA DE USUÁRIO E ESTADO GLOBAL ---
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

// --- DADOS PRÉ-DEFINIDOS ---
const preDefinedRoadmaps = [
    {
        category: "Programação e Tecnologia",
        courses: [
            {
                tema: "Python para Iniciantes", nivel: "Iniciante", objetivo: "Desenvolvimento de scripts básicos e lógica de programação.",
                etapas: [
                    { titulo: "Etapa 1: Fundamentos e Sintaxe", topicos: [{ tópico: "Variáveis e Tipos de Dados", material: "https://docs.python.org/pt-br/3/tutorial/introduction.html" }, { tópico: "Estruturas de Controle (If/Else)", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" }, { tópico: "Laços de Repetição (For/While)", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" }, { tópico: "Introdução a Funções", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" }], atividade: "Criar uma calculadora simples que utilize If/Else e funções." }
                ]
            },
        ]
    }
]; 

// --- FUNÇÕES DE PERSISTÊNCIA ---
function loadAllUsersData() { 
    const data = localStorage.getItem('quackademyAllUsers'); 
    if (data) { 
        allUsersData = JSON.parse(data); 
    } 
} 
function saveAllUsersData() { 
    localStorage.setItem('quackademyAllUsers', JSON.stringify(allUsersData)); 
} 
function loadUserData(username) { 
    loadAllUsersData(); 
    if (!username || username === 'Convidado') { 
        currentUser.name = 'Convidado'; 
        currentUser.trilhas = []; 
        currentUser.currentTrilhaIndex = -1; 
    } else { 
        const userData = allUsersData[username]; 
        if (userData) { 
            currentUser.name = username; 
            currentUser.trilhas = userData.trilhas || []; 
            currentUser.currentTrilhaIndex = userData.currentTrilhaIndex || -1; 
        } else { 
            currentUser.name = username; 
            currentUser.trilhas = []; 
            currentUser.currentTrilhaIndex = -1; 
            allUsersData[username] = { trilhas: [], currentTrilhaIndex: -1, password: document.getElementById('password').value }; 
        } 
    } 
    document.getElementById("userNameDisplay").innerText = currentUser.name; 
    saveAllUsersData(); 
    updateTrilhasCountDisplay(); 
} 
function saveUserTrilhas() { 
    if (currentUser.name && currentUser.name !== 'Convidado') { 
        allUsersData[currentUser.name] = { ...allUsersData[currentUser.name], trilhas: currentUser.trilhas, currentTrilhaIndex: currentUser.currentTrilhaIndex }; 
        saveAllUsersData(); 
    } 
    updateTrilhasCountDisplay(); 
} 
function updateTrilhasCountDisplay() { 
    const count = currentUser.trilhas ? currentUser.trilhas.length : 0; 
    document.getElementById("btnMinhasTrilhas").innerText = `Minhas Trilhas (${count})`; 
    document.getElementById("btnMinhasTrilhas").disabled = (count === 0 && currentUser.name === 'Convidado');
}

// --- CONTROLE DE FLUXO DE TELAS ---
function showView(viewId) {
    // Esconde todas as telas e o app principal
    document.querySelectorAll('.full-screen-message, #main-app').forEach(el => el.style.display = 'none');
    
    // Mostra a tela desejada
    const target = document.getElementById(viewId);
    if (target) {
        target.style.display = viewId.includes('-screen') ? 'flex' : 'block';
    }
}

// --- FUNÇÕES DE LOGIN E NAVEGAÇÃO INICIAL ---
function handleAuthSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const authMessage = document.getElementById('auth-message');
    
    if (username.length < 3 || password.length < 3) {
        authMessage.innerText = "Usuário e senha devem ter no mínimo 3 caracteres.";
        return;
    }
    
    loadAllUsersData();
    let userExists = allUsersData[username];

    if (userExists) {
        if (userExists.password === password) {
            loadUserData(username);
            showView('welcome-screen');
        } else {
            authMessage.innerText = "Senha incorreta.";
        }
    } else {
        loadUserData(username); // Cria novo usuário
        showView('welcome-screen');
    }
}

function handleSkipLogin() {
    loadUserData('Convidado');
    showView('welcome-screen');
}

// --- FUNÇÕES DO POMODORO ---
function loadPomodoroSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        pomodoroSettings = JSON.parse(saved);
        document.getElementById('study-min').value = pomodoroSettings.study;
        document.getElementById('short-break-min').value = pomodoroSettings.shortBreak;
        document.getElementById('long-break-min').value = pomodoroSettings.longBreak;
    }
    timeRemaining = pomodoroSettings.study * 60;
    updateTimerDisplay();
}

function savePomodoroSettings() {
    pomodoroSettings.study = parseInt(document.getElementById('study-min').value);
    pomodoroSettings.shortBreak = parseInt(document.getElementById('short-break-min').value);
    pomodoroSettings.longBreak = parseInt(document.getElementById('long-break-min').value);
    localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings));
    resetTimer();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateTimerDisplay() {
    document.getElementById('time-display').textContent = formatTime(timeRemaining);
    const title = document.getElementById('timer-title');
    if (isStudySession) {
        title.textContent = `Foco #${currentCycles + 1}`;
    } else {
        const isLongBreak = currentCycles % TOTAL_CYCLES_FOR_LONG_BREAK === 0 && currentCycles > 0;
        title.textContent = isLongBreak ? "Pausa Longa" : "Pausa Curta";
    }
    document.getElementById('start-pause-btn').textContent = isRunning ? "Pausar" : "Iniciar";
    document.title = `${formatTime(timeRemaining)} - ${title.textContent}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    
    // Desabilita configurações
    document.querySelectorAll('.setting-input').forEach(input => input.disabled = true);

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining < 0) {
            clearInterval(timerInterval);
            isRunning = false;

            if (isStudySession) {
                currentCycles++;
                isStudySession = false;
                const isLongBreak = currentCycles % TOTAL_CYCLES_FOR_LONG_BREAK === 0;
                timeRemaining = (isLongBreak ? pomodoroSettings.longBreak : pomodoroSettings.shortBreak) * 60;
                
                // Exibe o modal de pausa forçada
                document.getElementById('modal-title').textContent = isLongBreak ? "🎉 HORA DA PAUSA LONGA!" : "🚨 HORA DA PAUSA!";
                document.getElementById('modal-message').innerHTML = `Seu tempo de <strong>Foco</strong> acabou. Descanse por <strong>${isLongBreak ? pomodoroSettings.longBreak : pomodoroSettings.shortBreak} minutos</strong>.`;
                document.getElementById('break-modal').style.display = 'flex';
                
            } else {
                isStudySession = true;
                timeRemaining = pomodoroSettings.study * 60;
                alert("Pausa finalizada! Hora de voltar ao foco.");
            }
            startTimer();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    updateTimerDisplay();
}

function resetTimer() {
    pauseTimer();
    isStudySession = true;
    currentCycles = 0;
    timeRemaining = pomodoroSettings.study * 60;
    updateTimerDisplay();
    document.querySelectorAll('.setting-input').forEach(input => input.disabled = false);
    document.title = "Quackademy";
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Listeners do Login
    document.getElementById('login-form').addEventListener('submit', handleAuthSubmit);
    document.getElementById('btnSkipLogin').addEventListener('click', handleSkipLogin);
    
    // Listeners das Telas de Boas-Vindas
    document.getElementById('btnWelcomeContinue').addEventListener('click', () => showView('explanation-screen'));
    document.getElementById('btnExplanationContinue').addEventListener('click', () => {
        showView('main-app');
        showPreDefinedCoursesView();
    });

    // --- Listeners do Pomodoro ---
    document.getElementById('pomodoro-button').addEventListener('click', () => {
        document.getElementById('pomodoro-modal').style.display = 'flex';
    });
    // Fechar modal ao clicar fora do conteúdo
    document.getElementById('pomodoro-modal').addEventListener('click', (e) => {
        if (e.target.id === 'pomodoro-modal') {
            document.getElementById('pomodoro-modal').style.display = 'none';
        }
    });

    document.getElementById('start-pause-btn').addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
    document.getElementById('reset-btn').addEventListener('click', resetTimer);
    document.querySelectorAll('.setting-input').forEach(input => input.addEventListener('change', savePomodoroSettings));

    document.getElementById('btnContinueBreak').addEventListener('click', () => {
        document.getElementById('break-modal').style.display = 'none';
    });

    loadPomodoroSettings();
    
    // Lógica para decidir a tela inicial
    const lastUser = localStorage.getItem('quackademyLastUser');
    if (lastUser) {
        loadUserData(lastUser);
        showView('main-app');
        showUserTrilhasView();
    } else {
        showView('login-screen');
    }
});
