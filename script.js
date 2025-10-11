
// ===================================================
// JAVASCRIPT INTEGRADO (script.js)
// ===================================================

// ⚠️ ATENÇÃO: CHAVE DA API ATUALIZADA AQUI
const API_KEY = "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"; 

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; 

// --- SISTEMA DE USUÁRIO SIMPLES (LOCALSTORAGE) ---
let currentUser = {
    name: null, // Será o nome de usuário ou 'Convidado'
    trilhas: [], // Array de todas as trilhas (roadmaps) salvas
    currentTrilhaIndex: -1 // Índice da trilha atualmente ativa
};
// Armazena todos os dados de usuários no localStorage
let allUsersData = {}; 

let modalState = {}; 
let patolindoState = {
    questionsLeft: 5,
    history: [],
    lastView: "roadmap-view" 
};

// --- SISTEMA POMODORO ---
let pomodoroState = {
    isRunning: false,
    isBreak: false,
    workTime: 25 * 60, // 25 minutos em segundos
    breakTime: 5 * 60, // 5 minutos em segundos
    timeLeft: 25 * 60,
    interval: null
};

// --- DADOS PRÉ-DEFINIDOS (PARA ECONOMIZAR REQUISIÇÕES) ---
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
            {
                tema: "JavaScript Moderno (ES6+)", nivel: "Intermediário", objetivo: "Desenvolvimento Frontend e manipulação de DOM.",
                etapas: [
                    { titulo: "Etapa 1: Variáveis e Scopes", topicos: [{ tópico: "Var, Let e Const", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Grammar_and_types" }, { tópico: "Arrow Functions e Template Literals", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Functions/Arrow_functions" }, { tópico: "Manipulação de Array (Map, Filter, Reduce)", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array" }, { tópico: "Introdução a Promises e Async/Await", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Using_promises" }], atividade: "Criar uma lista de tarefas (To-Do List) que manipule o DOM e use funções de array." }
                ]
            },
            {
                tema: "Java: POO e Backend", nivel: "Avançado", objetivo: "Entender Programação Orientada a Objetos e estruturas de dados básicas.",
                etapas: [
                    { titulo: "Etapa 1: Conceitos de POO", topicos: [{ tópico: "Classes, Objetos e Encapsulamento", material: "https://docs.oracle.com/javase/tutorial/java/concepts/index.html" }, { tópico: "Herança e Polimorfismo", material: "https://docs.oracle.com/javase/tutorial/java/concepts/index.html" }, { tópico: "Tratamento de Exceções", material: "https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html" }, { tópico: "Estruturas de Dados (ArrayList e HashMap)", material: "https://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html" }], atividade: "Desenvolver um sistema bancário simples com classes Cliente e Conta, aplicando Herança." }
                ]
            },
        ]
    },
    {
        category: "Idiomas e Linguagens",
        courses: [
            {
                tema: "Inglês Básico", nivel: "Iniciante", objetivo: "Conversação simples e compreensão de textos básicos.",
                etapas: [
                    { titulo: "Etapa 1: O Verbo 'To Be'", topicos: [{ tópico: "Afirmativa e Negativa", material: "https://www.youtube.com/watch?v=basico_to_be" }, { tópico: "Interrogativa e Short Answers", material: "https://www.duolingo.com/course/en/pt/learn-english" }, { tópico: "Pronomes Pessoais e Possessivos", material: "https://www.bbc.co.uk/learningenglish/" }, { tópico: "Vocabulário de Saudação e Apresentação", material: "https://www.memrise.com/" }], atividade: "Gravar um áudio se apresentando e falando sobre 3 membros da família em inglês." }
                ]
            },
            {
                tema: "Espanhol Intermediário", nivel: "Intermediário", objetivo: "Dominar pretéritos e conversação em viagens.",
                etapas: [
                    { titulo: "Etapa 1: Pretéritos do Indicativo", topicos: [{ tópico: "Pretérito Perfeito Simples (Pasado Simple)", material: "https://www.rae.es/" }, { tópico: "Pretérito Imperfeito", material: "https://espanhol.com/gramatica/passado-espanhol" }, { tópico: "Verbos Irregulares Comuns", material: "https://conjuga-me.net/espanhol/verbos/irregulares" }, { tópico: "Vocabulário de Viagem e Turismo", material: "https://cervantes.es/" }], atividade: "Escrever um parágrafo contando suas últimas férias usando os pretéritos estudados." }
                ]
            }
        ]
    },
    {
        category: "Matérias Escolares - Ensino Fundamental (Anos Finais)",
        courses: [
            {
                tema: "Matemática (6º Ano)", nivel: "Intermediário", objetivo: "Dominar números inteiros, frações e operações básicas.",
                etapas: [
                    { titulo: "Etapa 1: Números Inteiros e Racionais", topicos: [{ tópico: "Conjunto dos Números Inteiros (Z)", material: "https://www.auladegratis.net/matematica/6-ano/numeros-inteiros.html" }, { tópico: "Soma e Subtração de Frações", material: "https://www.somatematica.com.br/fundamental/6ano/fracoes.php" }, { tópico: "Múltiplos e Divisores (MMC e MDC)", material: "https://www.infoescola.com/matematica/mmc-e-mdc/" }, { tópico: "Expressões Numéricas", material: "https://www.toda_materia.com.br/expressoes-numericas" }], atividade: "Resolver uma lista de 10 problemas que envolvam frações em situações do dia a dia." }
                ]
            },
            {
                tema: "História (9º Ano)", nivel: "Intermediário", objetivo: "Compreender a 1ª República, a Era Vargas e a Guerra Fria.",
                etapas: [
                    { titulo: "Etapa 1: República Oligárquica e Vargas", topicos: [{ tópico: "Primeira República e Coronelismo", material: "https://brasilescola.uol.com.br/historiab/primeira-republica.htm" }, { tópico: "Revolução de 1930 e Era Vargas", material: "https://www.politize.com.br/era-vargas-resumo/" }, { tópico: "A Grande Depressão de 1929 e o Brasil", material: "https://www.sohistoria.com.br/ef2/crise29/" }, { tópico: "O Estado Novo (1937-1945)", material: "https://www.historiadigital.org/estado-novo/" }], atividade: "Criar uma linha do tempo ilustrada da Era Vargas (1930-1945) com os principais eventos." }
                ]
            }
        ]
    },
    {
        category: "Matérias Escolares - Ensino Médio",
        courses: [
            {
                tema: "Português (1º Ano EM)", nivel: "Avançado", objetivo: "Dominar a estrutura frasal, concordância e as primeiras escolas literárias.",
                etapas: [
                    { titulo: "Etapa 1: Sintaxe e Concordância", topicos: [{ tópico: "Estrutura da Oração (Sujeito, Predicado)", material: "https://www.normaculta.com.br/estrutura-da-oracao/" }, { tópico: "Concordância Verbal e Nominal", material: "https://www.portuguesonline.com.br/concordancia-verbal-e-nominal/" }, { tópico: "Introdução à Literatura: Quinhentismo e Barroco", material: "https://www.infoescola.com/literatura/quinhentismo/" }, { tópico: "Análise de Figuras de Linguagem", material: "https://www.todamateria.com.br/figuras-de-linguagem/" }], atividade: "Analisar um trecho de um poema Barroco identificando o sujeito, predicado e as figuras de linguagem." }
                ]
            }
        ]
    }
];

// --- FUNÇÕES POMODORO ---

// Sistema de arrastar o timer
function initializePomodoroDrag() {
    const timer = document.getElementById('pomodoro-floating-timer');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    timer.addEventListener('mousedown', dragStart);
    timer.addEventListener('touchstart', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target.classList.contains('pomodoro-header') || 
            e.target.classList.contains('pomodoro-drag-handle') ||
            e.target.closest('.pomodoro-header')) {
            isDragging = true;
            timer.classList.add('dragging');
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        timer.classList.remove('dragging');
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, timer);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
}

function showPomodoroModal() {
    hideQuickActionsMenu();
    const modal = document.getElementById('pomodoro-modal');
    modal.style.display = 'block';
    updatePomodoroDisplay();
}

function closePomodoroModal() {
    const modal = document.getElementById('pomodoro-modal');
    modal.style.display = 'none';
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroState.timeLeft / 60);
    const seconds = pomodoroState.timeLeft % 60;
    const timerDisplay = document.getElementById('pomodoro-timer');
    const statusDisplay = document.getElementById('pomodoro-status');
    
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (pomodoroState.isBreak) {
        statusDisplay.textContent = 'Descanso';
        timerDisplay.style.color = '#17a2b8';
    } else {
        statusDisplay.textContent = 'Tempo de Foco';
        timerDisplay.style.color = 'var(--color-primary-dark)';
    }
    
    // Atualiza botões
    document.getElementById('btn-start-pomodoro').disabled = pomodoroState.isRunning;
    document.getElementById('btn-pause-pomodoro').disabled = !pomodoroState.isRunning;
}

function startPomodoro() {
    if (pomodoroState.isRunning) return;
    
    // Atualiza os tempos com os valores dos inputs
    const workTimeInput = parseInt(document.getElementById('work-time').value) || 25;
    const breakTimeInput = parseInt(document.getElementById('break-time').value) || 5;
    
    pomodoroState.workTime = workTimeInput * 60;
    pomodoroState.breakTime = breakTimeInput * 60;
    
    if (!pomodoroState.isBreak) {
        pomodoroState.timeLeft = pomodoroState.workTime;
    }
    
    pomodoroState.isRunning = true;
    pomodoroState.interval = setInterval(updatePomodoroTimer, 1000);
    updatePomodoroDisplay();
    
    // Mostra o timer flutuante
    showPomodoroTimer();
    closePomodoroModal();
}

function pausePomodoro() {
    if (!pomodoroState.isRunning) return;
    
    pomodoroState.isRunning = false;
    clearInterval(pomodoroState.interval);
    updatePomodoroDisplay();
    updateFloatingTimer();
}

function resetPomodoro() {
    pomodoroState.isRunning = false;
    pomodoroState.isBreak = false;
    clearInterval(pomodoroState.interval);
    
    const workTimeInput = parseInt(document.getElementById('work-time').value) || 25;
    pomodoroState.workTime = workTimeInput * 60;
    pomodoroState.timeLeft = pomodoroState.workTime;
    
    updatePomodoroDisplay();
    updateFloatingTimer();
}

function togglePomodoro() {
    if (pomodoroState.isRunning) {
        pausePomodoro();
    } else {
        startPomodoro();
    }
}

function stopPomodoro() {
    resetPomodoro();
    hidePomodoroTimer();
}

function updatePomodoroTimer() {
    if (!pomodoroState.isRunning) return;
    
    pomodoroState.timeLeft--;
    
    if (pomodoroState.timeLeft <= 0) {
        // Tempo acabou
        if (pomodoroState.isBreak) {
            // Fim do descanso
            pomodoroState.isBreak = false;
            pomodoroState.timeLeft = pomodoroState.workTime;
            closeBreakModal();
            showPomodoroNotification("🎉 Hora de voltar aos estudos!");
        } else {
            // Fim do tempo de foco - inicia descanso obrigatório
            pomodoroState.isBreak = true;
            pomodoroState.timeLeft = pomodoroState.breakTime;
            showBreakModal();
            showPomodoroNotification("☕ Hora do descanso! Descanse um pouco.");
        }
    }
    
    updatePomodoroDisplay();
    updateFloatingTimer();
}

function showPomodoroTimer() {
    const floatingTimer = document.getElementById('pomodoro-floating-timer');
    floatingTimer.style.display = 'block';
    updateFloatingTimer();
    
    // Inicializa o sistema de arrastar
    initializePomodoroDrag();
}

function hidePomodoroTimer() {
    const floatingTimer = document.getElementById('pomodoro-floating-timer');
    floatingTimer.style.display = 'none';
}

function updateFloatingTimer() {
    const minutes = Math.floor(pomodoroState.timeLeft / 60);
    const seconds = pomodoroState.timeLeft % 60;
    const timerDisplay = document.getElementById('pomodoro-timer-display');
    const modeDisplay = document.getElementById('pomodoro-mode');
    const playPauseBtn = document.getElementById('btn-pomodoro-play-pause');
    
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (pomodoroState.isBreak) {
        modeDisplay.textContent = '☕ Descanso';
        timerDisplay.style.color = '#17a2b8';
    } else {
        modeDisplay.textContent = '⏱️ Foco';
        timerDisplay.style.color = 'var(--color-primary-dark)';
    }
    
    playPauseBtn.textContent = pomodoroState.isRunning ? '⏸️' : '▶️';
}

function showBreakModal() {
    const breakModal = document.getElementById('break-modal');
    const breakDuration = document.getElementById('break-duration');
    const breakTimer = document.getElementById('break-timer');
    const continueBtn = document.getElementById('btn-break-continue');
    
    breakDuration.textContent = Math.floor(pomodoroState.breakTime / 60);
    breakModal.style.display = 'block';
    continueBtn.disabled = true;
    
    // Desabilita interação com o conteúdo principal
    disableMainContent();
    
    // Atualiza o timer do break modal
    const updateBreakTimer = () => {
        if (pomodoroState.isBreak && pomodoroState.isRunning) {
            const minutes = Math.floor(pomodoroState.timeLeft / 60);
            const seconds = pomodoroState.timeLeft % 60;
            breakTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Habilita o botão quando o tempo acabar
            if (pomodoroState.timeLeft <= 0) {
                continueBtn.disabled = false;
                continueBtn.textContent = "Continuar Estudando";
            }
        }
    };
    
    // Atualiza a cada segundo
    const breakInterval = setInterval(updateBreakTimer, 1000);
    
    // Limpa o intervalo quando o modal for fechado
    breakModal.dataset.interval = breakInterval;
}

function closeBreakModal() {
    const breakModal = document.getElementById('break-modal');
    if (breakModal.dataset.interval) {
        clearInterval(parseInt(breakModal.dataset.interval));
    }
    breakModal.style.display = 'none';
    
    // Reabilita interação com o conteúdo principal
    enableMainContent();
}

function disableMainContent() {
    // Adiciona uma overlay sobre o conteúdo principal
    const overlay = document.createElement('div');
    overlay.id = 'break-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '998';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.color = 'white';
    overlay.style.fontSize = '1.5em';
    overlay.style.fontWeight = 'bold';
    overlay.innerHTML = '⏰ Tempo de Descanso - Volte em alguns minutos!';
    document.body.appendChild(overlay);
}

function enableMainContent() {
    const overlay = document.getElementById('break-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function showPomodoroNotification(message) {
    // Cria uma notificação temporária
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'var(--color-primary)';
    notification.style.color = 'var(--color-secondary)';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1003';
    notification.style.fontWeight = 'bold';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// --- FUNÇÕES DO MENU DE AÇÕES RÁPIDAS ---

function showQuickActionsMenu() {
    const menu = document.getElementById('quick-actions-menu');
    menu.style.display = 'block';
    updateQuickActionsMenu();
}

function hideQuickActionsMenu() {
    const menu = document.getElementById('quick-actions-menu');
    menu.style.display = 'none';
}

function updateQuickActionsMenu() {
    const chatBtn = document.getElementById('chat-action-btn');
    const currentView = getCurrentView();
    
    // Desabilita o chat durante flashcards e simulado
    if (currentView === 'flashcard-view' || currentView === 'simulado-etapa-view') {
        chatBtn.disabled = true;
        chatBtn.title = "Chat não disponível durante flashcards ou simulado";
    } else {
        chatBtn.disabled = false;
        chatBtn.title = "Abrir Chat com Patolindo";
    }
}

function getCurrentView() {
    for (const key in viewMap) {
        if (viewMap[key].style.display !== 'none') {
            return key;
        }
    }
    return null;
}

function updateQuickActionsButton() {
    const quickActionsBtn = document.getElementById('quick-actions-button');
    const currentView = getCurrentView();
    
    // Mostra o botão apenas quando estiver em uma trilha ativa
    const shouldShow = currentView === 'roadmap-view' || 
                      currentView === 'etapa-view' || 
                      currentView === 'material-view' ||
                      (currentUser.currentTrilhaIndex !== -1 && currentUser.trilhas.length > 0);
    
    quickActionsBtn.style.display = shouldShow ? 'block' : 'none';
}

// Fecha o menu quando clicar fora
document.addEventListener('click', function(event) {
    const quickActionsBtn = document.getElementById('quick-actions-button');
    const quickActionsMenu = document.getElementById('quick-actions-menu');
    
    if (!quickActionsBtn.contains(event.target) && !quickActionsMenu.contains(event.target)) {
        hideQuickActionsMenu();
    }
});

// --- FUNÇÕES DE PERSISTÊNCIA (ATUALIZADAS) ---

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
        currentUser.trilhas = []; // Convidado não tem trilhas salvas
        currentUser.currentTrilhaIndex = -1;
    } else {
        const userData = allUsersData[username];
        if (userData) {
            currentUser.name = username;
            currentUser.trilhas = userData.trilhas || [];
            currentUser.currentTrilhaIndex = userData.currentTrilhaIndex || -1;
        } else {
            // Novo usuário
            currentUser.name = username;
            currentUser.trilhas = [];
            currentUser.currentTrilhaIndex = -1;
            allUsersData[username] = { trilhas: [], currentTrilhaIndex: -1, password: document.getElementById('password').value }; // Salva a senha (simulada)
        }
    }
    document.getElementById("userNameDisplay").innerText = currentUser.name;
    saveAllUsersData();
    updateTrilhasCountDisplay();
}

function saveUserTrilhas() {
    if (currentUser.name && currentUser.name !== 'Convidado') {
        allUsersData[currentUser.name] = {
            ...allUsersData[currentUser.name],
            trilhas: currentUser.trilhas,
            currentTrilhaIndex: currentUser.currentTrilhaIndex
        };
        saveAllUsersData();
    }
    updateTrilhasCountDisplay();
}

function updateTrilhasCountDisplay() {
    const count = currentUser.trilhas ? currentUser.trilhas.length : 0;
    document.getElementById("btnMinhasTrilhas").innerText = `Minhas Trilhas (${count})`;
    document.getElementById("btnMinhasTrilhas").disabled = currentUser.name === 'Convidado';
}

// --- NOVO: CONTROLE DE FLUXO DE AUTENTICAÇÃO --- 
function showLoginView() {
    document.getElementById("login-screen").style.display = 'flex';
    document.getElementById("welcome-screen").style.display = 'none';
    document.getElementById("explanation-screen").style.display = 'none';
    document.getElementById("main-app").style.display = 'none';
    document.getElementById("predefined-courses-view").style.display = 'none';
    
    // Garante que os campos de login estejam limpos
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('auth-message').innerText = '';
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const authMessage = document.getElementById('auth-message');
    
    if (username.toLowerCase() === 'convidado') {
        authMessage.innerText = "Nome de usuário 'Convidado' é reservado. Escolha outro.";
        return;
    }
    if (username.length < 3 || password.length < 3) {
        authMessage.innerText = "Nome de usuário e senha devem ter no mínimo 3 caracteres.";
        return;
    }

    loadAllUsersData(); 

    let userExists = allUsersData[username];

    if (userExists) {
        // Tenta Logar
        if (userExists.password === password) {
            loadUserData(username);
            authMessage.innerText = `Login bem-sucedido para ${username}!`;
            showMainApp(true); // Indica que o usuário já existe
        } else {
            authMessage.innerText = "Senha incorreta.";
        }
    } else {
        // Tenta Cadastrar (Simulado)
        loadUserData(username); // Cria o novo usuário
        authMessage.innerText = `Usuário ${username} criado e logado!`;
        showWelcomeScreen(); // Novo usuário vê o fluxo completo
    }
}

function handleSkipLogin() {
    loadUserData('Convidado');
    showWelcomeScreen();
}

// --- Listeners de Transição Inicial ---

document.addEventListener("DOMContentLoaded", () => {
    
    showLoginView(); // Inicia na tela de login

    document.getElementById("login-form").addEventListener("submit", handleAuthSubmit);
    document.getElementById("btnSkipLogin").addEventListener("click", handleSkipLogin);
    
    document.getElementById("btnWelcomeContinue").addEventListener("click", showExplanationScreen);
    
    // 🐛 CORREÇÃO APLICADA AQUI: Chama showMainApp que decide o próximo passo (Cursos Pré-Definidos)
    document.getElementById("btnExplanationContinue").addEventListener("click", () => showMainApp(false)); 
    
    document.getElementById("btnGerar").addEventListener("click", gerarRoadmap);
    
    // Listeners dos botões de voltar (dentro das telas de conteúdo)
    document.getElementById("btnMaterialVoltar").addEventListener("click", () => showEtapaView(modalState.currentEtapa));
    document.getElementById("btnFlashcardVoltar").addEventListener("click", () => showEtapaView(modalState.currentEtapa));
    document.getElementById("btnSimuladoEtapaVoltar").addEventListener("click", () => showEtapaView(modalState.currentEtapa));
    
    // --- Listeners do Chatbot ---
    document.getElementById("chat-exit-button").addEventListener("click", () => showLastView());
    document.getElementById("chat-send-button").addEventListener("click", handleChatSend);
    document.getElementById("chat-input").addEventListener("keypress", (e) => {
        if (e.key === 'Enter') handleChatSend();
    });
    document.getElementById("chat-input").addEventListener("input", updateSendButtonState);
    
    // --- Listener do Botão de Ações Rápidas ---
    document.getElementById("quick-actions-button").addEventListener("click", showQuickActionsMenu);
});

// Funções de transição de telas iniciais
function showWelcomeScreen() {
    document.getElementById("login-screen").style.display = 'none';
    document.getElementById("welcome-screen").style.display = 'flex';
}

function showExplanationScreen() {
    document.getElementById("welcome-screen").style.display = 'none';
    document.getElementById("explanation-screen").style.display = 'flex';
}

function showMainApp(isExistingUser = false) {
    document.getElementById("explanation-screen").style.display = 'none';
    document.getElementById("welcome-screen").style.display = 'none';
    document.getElementById("login-screen").style.display = 'none';
    document.getElementById("main-app").style.display = 'block';
    
    // Atualiza a visibilidade do botão de ações rápidas
    updateQuickActionsButton();
    
    if (isExistingUser && currentUser.trilhas.length > 0) {
         // Usuário recorrente vai para o Gerenciamento
         showUserTrilhasView();
    } else {
         // Usuário novo ou sem trilhas vai para a lista de cursos
         showPreDefinedCoursesView();
    }
}

// --- LÓGICA DE NAVEGAÇÃO SPA ---

const viewMap = {
    "user-trilhas-view": document.getElementById("user-trilhas-view"),
    "predefined-courses-view": document.getElementById("predefined-courses-view"), // NOVO
    "form-view": document.getElementById("form-view"),
    "roadmap-view": document.getElementById("roadmap-view"),
    "etapa-view": document.getElementById("etapa-view"),
    "material-view": document.getElementById("material-view"),
    "flashcard-view": document.getElementById("flashcard-view"), 
    "simulado-etapa-view": document.getElementById("simulado-etapa-view"), 
    "chat-view": document.getElementById("chat-view")
};

function hideAllViews() {
    for (const key in viewMap) {
        viewMap[key].style.display = 'none';
    }
}

// --- TELA DE GERENCIAMENTO DE TRILHAS ---
function showUserTrilhasView() {
    hideAllViews();
    window.scrollTo(0, 0); 

    if (currentUser.name === 'Convidado') {
        showPreDefinedCoursesView();
        return;
    }
    
    viewMap["user-trilhas-view"].style.display = 'block';
    updateQuickActionsButton();

    const trilhasList = document.getElementById("trilhas-list");
    trilhasList.innerHTML = '';
    
    if (currentUser.trilhas.length === 0) {
        trilhasList.innerHTML = '<p class="placeholder-text">Nenhuma trilha de estudo salva. Crie uma nova para começar!</p>';
        return;
    }

    // Garante que a trilha ativa está no topo
    let trilhasOrdenadas = [...currentUser.trilhas];
    if (currentUser.currentTrilhaIndex !== -1) {
        const activeTrilha = trilhasOrdenadas.splice(currentUser.currentTrilhaIndex, 1)[0];
        trilhasOrdenadas.unshift(activeTrilha); // Coloca a ativa na frente
    }

    trilhasOrdenadas.forEach((trilha, index) => {
        // Encontra o índice original para ações
        const originalIndex = currentUser.trilhas.findIndex(t => t.id === trilha.id); 
        const isActive = currentUser.currentTrilhaIndex === originalIndex;
        
        const card = document.createElement('div');
        card.className = 'trilha-card';
        card.style.borderLeft = isActive ? '5px solid var(--color-success)' : '1px solid #ddd';

        const info = `
            <div class="trilha-info">
                <h4>${trilha.tema} (${trilha.nivel}) ${isActive ? '<b>(ATIVA)</b>' : ''}</h4>
                <p>Objetivo: ${trilha.objetivo || 'Não especificado'}</p>
                <p>Etapas: ${trilha.etapas.length}</p>
            </div>
        `;

        const actions = `
            <div class="trilha-actions">
                <button class="btn-success" onclick="loadAndShowRoadmap(${originalIndex})" style="${isActive ? 'display: none;' : ''}">Abrir</button>
                <button class="btn-danger" onclick="deleteTrilha(${originalIndex})">Excluir</button>
            </div>
        `;

        card.innerHTML = info + actions;
        trilhasList.appendChild(card);
    });

    // Se houver uma trilha ativa, carrega ela
    if (currentUser.currentTrilhaIndex !== -1) {
         loadRoadmap(currentUser.trilhas[currentUser.currentTrilhaIndex], true); // Carrega a ativa, mas não mostra o roadmap
    }
}

// --- NOVO: TELA DE CURSOS PRÉ-DEFINIDOS ---
function showPreDefinedCoursesView() {
    // Garante que a aplicação principal está visível antes de exibir a sub-tela
    document.getElementById("main-app").style.display = 'block'; 
    
    hideAllViews();
    window.scrollTo(0, 0); 
    viewMap["predefined-courses-view"].style.display = 'block';
    updateQuickActionsButton();

    const coursesListDiv = document.getElementById("predefined-courses-list");
    coursesListDiv.innerHTML = '';
    
    preDefinedRoadmaps.forEach(categoryData => {
        const categoryHtml = document.createElement('div');
        categoryHtml.className = 'course-category';
        categoryHtml.innerHTML = `<h3>${categoryData.category}</h3>`;
        
        const gridHtml = document.createElement('div');
        gridHtml.className = 'courses-grid';

        categoryData.courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            // Prepara o objeto para ser passado na função de carregamento
            const courseString = JSON.stringify(course).replace(/'/g, "\\'"); 
            card.setAttribute('onclick', `loadPreDefinedRoadmap('${courseString}')`);

            card.innerHTML = `
                <h4>${course.tema}</h4>
                <p>Nível: <b>${course.nivel}</b></p>
                <p>Objetivo: ${course.objetivo}</p>
            `;
            gridHtml.appendChild(card);
        });
        
        categoryHtml.appendChild(gridHtml);
        coursesListDiv.appendChild(categoryHtml);
    });
}

function showFormView() {
    hideAllViews();
    window.scrollTo(0, 0); 
    viewMap["form-view"].style.display = 'flex'; 
    updateQuickActionsButton();
}

function showRoadmapView() {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "roadmap-view";
    viewMap["roadmap-view"].style.display = 'block';
    updateQuickActionsButton();
}

function showEtapaView(etapa) {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "etapa-view";
    viewMap["etapa-view"].style.display = 'block';
    updateQuickActionsButton();
    
    modalState.currentEtapa = etapa; 
    document.getElementById("etapa-titulo").innerText = etapa.titulo;
    
    const conteudo = etapa.topicos.map(t => {
        const topicoEscapado = t.tópico.replace(/'/g,"\\'"); 
        const materialLink = t.material ? t.material.replace(/'/g,"\\'") : "#"; 

        return `
            <div class="topico-bloco">
                <button class="material-btn" onclick="showMaterialView('${topicoEscapado}', '${materialLink}')">
                    📚 ${t.tópico}
                </button>
                <button class="btn-flashcard" onclick="showFlashcardView('${topicoEscapado}')">🧠 Gerar Flashcards</button>
            </div>
        `;
    }).join("");

    // BOTÃO DE SIMULADO DA ETAPA
    const simularTudoBtn = `<button class="btn-primary btn-simulado-etapa" onclick="showSimuladoEtapaView()">🎯 Gerar Simulado Completo da Etapa (${etapa.topicos.length} Tópicos)</button>`;

    document.getElementById("etapa-conteudo").innerHTML = `
        <h3>📌 Atividade prática:</h3>
        <p>${etapa.atividade}</p>
        <h3>📚 Tópicos de Estudo:</h3>
        <div class="topicos-container">${conteudo}</div>
        ${simularTudoBtn}
    `;
}

function showMaterialView(topico, material) {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "material-view";
    viewMap["material-view"].style.display = 'block';
    updateQuickActionsButton();
    
    fetchAndRenderMaterial(topico, material);
}

function showFlashcardView(topico) {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "flashcard-view";
    viewMap["flashcard-view"].style.display = 'block';
    updateQuickActionsButton();

    fetchAndRenderFlashcards(topico);
}

function showSimuladoEtapaView() {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "simulado-etapa-view";
    viewMap["simulado-etapa-view"].style.display = 'block';
    updateQuickActionsButton();
    
    fetchAndRenderSimuladoEtapa();
}

function showChatView() {
    // Verifica se pode abrir o chat (não durante flashcards ou simulado)
    const currentView = getCurrentView();
    if (currentView === 'flashcard-view' || currentView === 'simulado-etapa-view') {
        alert("O chat não está disponível durante flashcards ou simulado. Finalize a atividade atual primeiro.");
        return;
    }
    
    hideAllViews();
    window.scrollTo(0, 0); 
    viewMap["chat-view"].style.display = 'block';
    resetPatolindoSession();
    hideQuickActionsMenu();
}

function showLastView() {
    // Volta para a view anterior salva
    if (patolindoState.lastView === "roadmap-view") {
        showRoadmapView();
    } else if (patolindoState.lastView === "etapa-view" && modalState.currentEtapa) {
        showEtapaView(modalState.currentEtapa);
    } else if (patolindoState.lastView === "material-view" && modalState.currentEtapa) {
         showEtapaView(modalState.currentEtapa);
    } else {
        showRoadmapView(); 
    }
}

// --- FUNÇÕES DE GERENCIAMENTO DE TRILHAS (ATUALIZADAS PARA CONVIDADO) ---

// Carrega os dados da trilha (roadmap) e exibe o RoadmapView
function loadRoadmap(trilha, skipViewChange = false) {
    if (!trilha || !trilha.etapas) {
        console.error("Trilha inválida.");
        return;
    }

    modalState.etapas = trilha.etapas;
    currentTheme = trilha.tema;
    document.getElementById("roadmap-title").innerText = `Sua Trilha: ${trilha.tema} (${trilha.nivel}) - ${currentUser.name}`;
    
    const roadmapDiv = document.getElementById("roadmap");
    roadmapDiv.innerHTML = "";

    trilha.etapas.forEach(etapa => {
        const blocoDiv = document.createElement("div");
        blocoDiv.className = "bloco";
        blocoDiv.innerText = etapa.titulo;
        blocoDiv.onclick = () => showEtapaView(etapa);
        roadmapDiv.appendChild(blocoDiv);
    });

    // Se não for para pular, mostra a view
    if (!skipViewChange) {
        showRoadmapView();
    }
}

// Define a trilha ativa, carrega e exibe
function loadAndShowRoadmap(index) {
    if (index >= 0 && index < currentUser.trilhas.length) {
        currentUser.currentTrilhaIndex = index;
        loadRoadmap(currentUser.trilhas[index]);
        if (currentUser.name !== 'Convidado') {
            saveUserTrilhas(); // Salva o índice ativo
        }
    }
}

// NOVO: Carrega e salva um roadmap pré-definido
function loadPreDefinedRoadmap(courseString) {
    try {
        const course = JSON.parse(courseString);
        
        const novaTrilha = {
            id: Date.now(),
            tema: course.tema,
            nivel: course.nivel,
            objetivo: course.objetivo,
            etapas: course.etapas
        };
        
        // Se o usuário não for convidado, a trilha é salva
        if (currentUser.name !== 'Convidado') {
            currentUser.trilhas.push(novaTrilha);
            currentUser.currentTrilhaIndex = currentUser.trilhas.length - 1; // Define como a trilha ativa
            saveUserTrilhas(); 
        } else {
             // Usuário Convidado: usa uma estrutura temporária
            currentUser.trilhas = [novaTrilha];
            currentUser.currentTrilhaIndex = 0;
        }
        
        // Carrega a trilha recém-criada
        loadRoadmap(novaTrilha);

    } catch (e) {
        alert("Erro ao carregar o curso pré-definido.");
        console.error("Erro ao parsear curso pré-definido:", e);
        showPreDefinedCoursesView();
    }
}

function deleteTrilha(index) {
     if (currentUser.name === 'Convidado') return;

    if (confirm(`Tem certeza que deseja excluir a trilha "${currentUser.trilhas[index].tema}"?`)) {
        
        // Remove a trilha
        currentUser.trilhas.splice(index, 1);
        
        // Se a trilha excluída era a ativa, desativa e carrega a próxima ou o gerenciamento
        if (currentUser.currentTrilhaIndex === index) {
            currentUser.currentTrilhaIndex = -1;
            showUserTrilhasView(); // Volta para o gerenciamento
        } else if (currentUser.currentTrilhaIndex > index) {
            // Ajusta o índice ativo se a excluída estava antes dele
            currentUser.currentTrilhaIndex--;
        }
        
        saveUserTrilhas();
        showUserTrilhasView(); // Atualiza a lista
    }
}

// --- FUNÇÕES DE CONTEÚDO (Roadmap, Material) ---

async function gerarRoadmap() {
    const tema = document.getElementById("tema").value;
    const nivel = document.getElementById("nivel").value;
    const objetivo = document.getElementById("objetivo").value;
    const roadmapDiv = document.getElementById("roadmap");
    
    roadmapDiv.innerHTML = "✨ Gerando roadmap...";
    showRoadmapView(); 

    if (!tema) {
        roadmapDiv.innerHTML = "⚠️ Por favor, preencha o campo Tema.";
        return;
    }
    
    // Simulação de delay para a API, pois o processo é lento
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        
        const systemPrompt = `Você é um especialista em educação técnica. Crie um roadmap **detalhado e extenso** com **no mínimo 10 (dez) etapas obrigatórias**. Para cada etapa, liste **no mínimo 4 (quatro) tópicos essenciais** para garantir profundidade no aprendizado. Use mais etapas e tópicos se o tema for complexo. Cada tópico **DEVE incluir uma URL de documentação oficial ou tutorial renomado** no campo 'material'. Sua única resposta deve ser APENAS JSON válido, sem texto introdutório ou blocos de código markdown. O JSON deve seguir este formato: {"etapas": [{"titulo": "Etapa 1: Nome da etapa", "topicos": [{"tópico": "Nome do tópico", "material": "URL de uma fonte externa"}], "atividade": "Descrição da atividade prática"}]}.`;
        const userPrompt = `Crie um roadmap de estudos detalhado e abrangente para o tema "${tema}" no nível "${nivel}"${objetivo ? ` com objetivo "${objetivo}"` : ""}. Inclua fontes externas de estudo no campo 'material' para todos os tópicos.`;

        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ 
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }, 
                temperature: 0.7 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro API: ${response.status} - ${errorData.error.message || 'Erro desconhecido.'}`);
        }

        const data = await response.json();
        let texto = data?.choices?.[0]?.message?.content || "";

        let textoLimpo = texto.trim();
        let parsed;
        try {
            parsed = JSON.parse(textoLimpo);
        } catch (e) {
            let jsonMatch = textoLimpo.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Não foi possível extrair JSON da resposta.");
            parsed = JSON.parse(jsonMatch[0]);
        }
        
        const etapas = parsed.etapas;
        
        // Salva ou carrega a nova trilha no contexto do usuário
        const novaTrilha = {
            id: Date.now(),
            tema: tema,
            nivel: nivel,
            objetivo: objetivo,
            etapas: etapas
        };
        
        // Se o usuário não for convidado, a trilha é salva
        if (currentUser.name !== 'Convidado') {
            currentUser.trilhas.push(novaTrilha);
            currentUser.currentTrilhaIndex = currentUser.trilhas.length - 1; // Define como a trilha ativa
            saveUserTrilhas(); 
        } else {
             // Usuário Convidado: usa uma estrutura temporária
            currentUser.trilhas = [novaTrilha];
            currentUser.currentTrilhaIndex = 0;
        }
        
        // Carrega a trilha recém-criada
        loadRoadmap(novaTrilha);

    } catch (err) {
        console.error("Erro:", err);
        roadmapDiv.innerHTML = `⚠️ Erro ao gerar roadmap. Verifique sua chave API e tente novamente. Causa: ${err.message}.`;
    }
}

// ... (restante das funções permanecem iguais) ...

// --- LÓGICA DO CHATBOT PATOLINDO (COM RESTRIÇÃO DE TEMA E TUTORIA) ---

function updateSendButtonState() {
    const input = document.getElementById("chat-input");
    const sendButton = document.getElementById("chat-send-button");
    const headerSpan = document.getElementById("chat-counter");
    
    sendButton.disabled = input.value.trim() === '' || patolindoState.questionsLeft <= 0;
    input.disabled = patolindoState.questionsLeft <= 0;
    
    headerSpan.innerText = `(${patolindoState.questionsLeft} Perguntas)`;

    if (patolindoState.questionsLeft <= 0) {
        input.placeholder = "Sessão encerrada. Reabra para começar de novo.";
    } else {
        input.placeholder = "Sua pergunta...";
    }
}

function resetPatolindoSession() {
    patolindoState.questionsLeft = 5;
    
    const currentTrilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const theme = currentTrilha ? currentTrilha.tema : null;

    const themeRestriction = theme ? `O ÚNICO TEMA permitida para conversação é: "${theme}". Você deve RECUSAR educadamente perguntas fora deste assunto.` : "Nenhuma trilha de estudos foi gerada. Você deve recusar perguntas até que uma trilha seja gerada.";

    // ⚠️ ATENÇÃO: INSTRUÇÃO DE TUTORIA E EXCEÇÃO INCLUÍDAS AQUI
    patolindoState.history = [{
        role: "system",
        content: `Você é o Patolindo, um assistente de estudos prestativo e didático. Sua função é responder a no máximo 5 perguntas do usuário. Sua **principal diretriz é guiar o usuário à resposta**, nunca a entregando de forma completa e direta. Transforme a resposta em uma dica ou uma pergunta instigante para fomentar o aprendizado ativo. **Você só deve fornecer a resposta completa e direta se o usuário solicitar explicitamente.** Seja conciso e focado. ${themeRestriction}`
    }]; 

    const chatMessages = document.getElementById("chat-messages");
    // APLICANDO A FORMATAÇÃO PARA A MENSAGEM INICIAL DE BOAS-VINDAS
    const welcomeText = `Olá! Sou o Patolindo. Você tem **${patolindoState.questionsLeft} perguntas** para tirar dúvidas sobre a sua trilha atual (**${theme || 'NENHUM TEMA'}**).`;
    const welcomeHtml = welcomeText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, "<br>");

    chatMessages.innerHTML = `<p class="bot-message"><span class="bot-bubble">${welcomeHtml}</span></p>`;
    chatMessages.scrollTop = chatMessages.scrollHeight; 
    updateSendButtonState();
}

async function handleChatSend() {
    const input = document.getElementById("chat-input");
    const question = input.value.trim();
    
    if (!question || patolindoState.questionsLeft <= 0) return;
    
    appendMessage(question, 'user');
    input.value = ''; 
    
    const sendButton = document.getElementById("chat-send-button");
    sendButton.disabled = true; 
    
    try {
        patolindoState.history.push({ role: "user", content: question });

        const currentTrilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
        const roadmapContext = currentTrilha ? JSON.stringify(currentTrilha.etapas) : "Nenhuma trilha de estudos foi gerada ainda.";
        
        // Construa a lista de mensagens, garantindo que o System Prompt esteja no início.
        const systemContext = {
            role: "system",
            content: patolindoState.history[0].content + 
                     ` O contexto da trilha de estudos atual do usuário é: ${roadmapContext}. Você deve ser rigoroso em se manter APENAS no tema da trilha.`
        };
        
        const messagesToSend = [systemContext].concat(patolindoState.history.slice(1)); 

        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({ model: MODEL_NAME, messages: messagesToSend, temperature: 0.8 })
        });

        if (!response.ok) { throw new Error(`Erro API: ${response.status}`); }

        const data = await response.json();
        const answer = data?.choices?.[0]?.message?.content || "Desculpe, ocorreu um erro de comunicação e não consegui gerar a resposta.";

        appendMessage(answer, 'bot');
        
        // Verifica se a resposta foi uma recusa (para não descontar a pergunta)
        const isRefusal = answer.toLowerCase().includes("não consigo responder") || answer.toLowerCase().includes("fora do tema");

        if (!isRefusal) {
            patolindoState.history.push({ role: "assistant", content: answer });
            patolindoState.questionsLeft--;
        } else {
             patolindoState.history.push({ role: "assistant", content: answer });
        }
        
    } catch (err) {
        console.error("Erro no Patolindo:", err);
        appendMessage("Patolindo: Desculpe, ocorreu um erro de comunicação. Tente novamente.", 'bot');
    } finally {
        sendButton.disabled = false;
        updateSendButtonState();
    }
}

function appendMessage(text, sender) {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("p");
    
    if (sender === 'user') {
        messageElement.className = 'user-message';
        messageElement.innerHTML = `<span class="user-bubble">${text}</span>`;
    } else {
        messageElement.className = 'bot-message';
        // CORREÇÃO: Garante que o negrito **Markdown** é convertido para <b>HTML</b>
        const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, "<br>");
        messageElement.innerHTML = `<span class="bot-bubble">${htmlText}</span>`;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
