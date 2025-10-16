

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
}

function hideQuickActionsMenu() {
    const menu = document.getElementById('quick-actions-menu');
    menu.style.display = 'none';
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
    
    // Mostra o botão de ações rápidas apenas se não for convidado
    if (currentUser.name !== 'Convidado') {
        document.getElementById("quick-actions-button").style.display = 'block';
    }
    
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
}

function showRoadmapView() {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "roadmap-view";
    viewMap["roadmap-view"].style.display = 'block';
}

function showEtapaView(etapa) {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "etapa-view";
    viewMap["etapa-view"].style.display = 'block';
    
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
    
    fetchAndRenderMaterial(topico, material);
}

function showFlashcardView(topico) {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "flashcard-view";
    viewMap["flashcard-view"].style.display = 'block';

    fetchAndRenderFlashcards(topico);
}

function showSimuladoEtapaView() {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "simulado-etapa-view";
    viewMap["simulado-etapa-view"].style.display = 'block';
    
    fetchAndRenderSimuladoEtapa();
}

function showChatView() {
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

async function fetchAndRenderMaterial(topico, material) {
    // Recarrega o tema atual da trilha ativa
    const currentTrilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const currentTheme = currentTrilha ? currentTrilha.tema : "educação";
    
    const materialConteudo = document.getElementById("material-conteudo");
    materialConteudo.innerHTML = `<p>Carregando conteúdo sobre: <strong>${topico}</strong>...</p>`;
    document.getElementById("material-titulo").innerText = topico; // Define o título

    
    try {
        // ATUALIZAÇÃO NO PROMPT: Detalhado, longo e requer múltiplas fontes citadas
        const systemPromptMaterial = `Você é um professor especialista em ${currentTheme}. Explique de forma didática, **detalhada e longa** o tópico "${topico}". Utilize o conhecimento de **diversas fontes confiáveis** para enriquecer o texto. Seu conteúdo **DEVE terminar com uma seção 'Fontes Utilizadas'** (ou similar) listando as URLs das referências utilizadas na pesquisa e composição do texto, mesmo que sejam apenas exemplos. Use o formato: 'Fontes Utilizadas: [URL1], [URL2], [URLn]'.`;
        const userPromptMaterial = `Explique o tópico "${topico}" (Nível: ${document.getElementById("nivel").value}).`;

        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({ model: MODEL_NAME, messages: [{ role: "system", content: systemPromptMaterial }, { role: "user", content: userPromptMaterial }], temperature: 0.8 })
        });

        if (!response.ok) { throw new Error(`Erro API: ${response.status}`); }
        const data = await response.json();
        let texto = data?.choices?.[0]?.message?.content || "Erro ao gerar conteúdo.";

        // CORREÇÃO: Converte **negrito** para <b>negrito</b> e quebra de linha para <br>
        texto = texto.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
        
        // Extrai e formata as fontes citadas no final do texto (ex: Fontes Utilizadas: URL1, URL2)
        let sourceHtml = '';
        const sourceMatch = texto.match(/Fontes Utilizadas:(.*)/i);
        if (sourceMatch && sourceMatch[1]) {
            const sources = sourceMatch[1].trim().split(',').map(s => s.trim()).filter(s => s.startsWith('http'));
            
            if (sources.length > 0) {
                sourceHtml = '<h3 style="margin-top: 30px; border-left: 5px solid #28A745; padding-left: 12px; color: #28A745;">🔗 Fontes Utilizadas</h3><ul>';
                sources.forEach(url => {
                    sourceHtml += `<li><a href="${url}" target="_blank" style="color: #007bff; text-decoration: none;">${url}</a></li>`;
                });
                sourceHtml += '</ul>';
            }
            // Remove a seção de fontes do corpo principal do texto
            texto = texto.substring(0, sourceMatch.index).trim();
        }

        // Adiciona a fonte obrigatória fornecida no roadmap (se existir e não estiver nas fontes do corpo)
        if (material && material !== 'null' && material.startsWith('http')) {
            sourceHtml += `<h3 style="margin-top: 30px; border-left: 5px solid var(--color-primary); padding-left: 12px;">📚 Fonte da Trilha</h3><p><a href="${material}" target="_blank" style="color: var(--color-primary-dark); font-weight: bold;">${material} (Abrirá em nova aba)</a></p>`;
        }
        
        if (!sourceHtml) {
             sourceHtml = '<p style="margin-top: 20px; color: #999;">Nenhuma fonte de estudo externa foi citada pela IA ou no roadmap.</p>';
        }

        materialConteudo.innerHTML = `<div style="max-height:450px; overflow-y:auto; padding-right:10px;">${texto}</div>${sourceHtml}`;

    } catch (err) {
        console.error("Erro:", err);
        materialConteudo.innerHTML = `<p>⚠️ Erro ao gerar conteúdo. Causa: ${err.message}.</p>`;
    }
}

// --- FUNÇÕES: FLASHCARDS POR TÓPICO ---

let currentFlashcards = [];
let currentFlashcardIndex = 0;

async function fetchAndRenderFlashcards(topico) {
    document.getElementById("flashcard-titulo").innerText = `Flashcards: ${topico}`;
    const flashcardDisplay = document.getElementById("flashcard-display");
    flashcardDisplay.innerHTML = `<p>Carregando flashcards sobre: <strong>${topico}</strong>...</p>`;

    try {
        // ATUALIZAÇÃO NO PROMPT: Requer 5 objetos únicos
        const systemPromptFlashcard = `Você é um gerador de flashcards. Sua única resposta deve ser APENAS JSON válido, sem texto introdutório. O JSON deve ser um array de **5 objetos**, onde cada objeto tem uma "pergunta" (frente do card) e uma "resposta" (verso do card). As 5 perguntas devem ser **únicas** e cobrir diferentes aspectos do tópico. O formato deve ser: [{"pergunta": "...", "resposta": "..."}, {"pergunta": "...", ...}].`;
        const userPromptFlashcard = `Crie 5 flashcards de pergunta e resposta sobre o tópico "${topico}" no nível ${document.getElementById("nivel").value}.`;

        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({ model: MODEL_NAME, messages: [{ role: "system", content: systemPromptFlashcard }, { role: "user", content: userPromptFlashcard }], response_format: { type: "json_object" }, temperature: 0.6 })
        });

        if (!response.ok) { throw new Error(`Erro API: ${response.status}`); }
        const data = await response.json();
        let texto = data?.choices?.[0]?.message?.content || "Erro ao gerar flashcards.";

        let parsedData;
        try {
            parsedData = JSON.parse(texto.trim());
        } catch (e) {
            let jsonMatch = texto.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim().match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("Não foi possível extrair JSON dos flashcards.");
            parsedData = JSON.parse(jsonMatch[0]);
        }
        
        currentFlashcards = Array.isArray(parsedData) ? parsedData : parsedData.flashcards || [parsedData];
        currentFlashcardIndex = 0;
        renderFlashcard();

    } catch (err) {
        console.error("Erro no Flashcard:", err);
        flashcardDisplay.innerHTML = `<p>⚠️ Erro ao gerar flashcards. Causa: ${err.message}.</p>`;
    }
}

function renderFlashcard() {
    const flashcardDisplay = document.getElementById("flashcard-display");
    
    if (currentFlashcards.length === 0) {
        flashcardDisplay.innerHTML = "<p>Nenhum flashcard gerado.</p>";
        return;
    }

    const card = currentFlashcards[currentFlashcardIndex];
    const total = currentFlashcards.length;

    // CORREÇÃO: Converte **negrito** para <b>negrito</b> e quebra de linha para <br>
    const perguntaFormatada = (card.pergunta || '')
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\n/g, "<br>");

    // CORREÇÃO: Converte **negrito** para <b>negrito</b> e quebra de linha para <br>
    const respostaFormatada = (card.resposta || '')
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\n/g, "<br>");

    // GERAR IMAGEM ALEATÓRIA PARA O FLASHCARD
    const randomImageNum = Math.floor(Math.random() * 5) + 1; // Gera número entre 1-5
    const randomImage = `imagem${randomImageNum}.png`;

    flashcardDisplay.innerHTML = `
        <p>Card ${currentFlashcardIndex + 1} de ${total}</p>
        <div class="flashcard-mascote-container">
            <div class="flashcard" id="current-flashcard" onclick="toggleFlip()">
                <div class="flashcard-inner">
                    <div class="flashcard-face flashcard-front">
                        <p style="font-weight: bold;">PERGUNTA:</p>
                        <p>${perguntaFormatada || 'Erro ao carregar pergunta.'}</p>
                    </div>
                    <div class="flashcard-face flashcard-back">
                        <p style="font-weight: bold;">RESPOSTA:</p>
                        <p>${respostaFormatada || 'Erro ao carregar resposta.'}</p>
                    </div>
                </div>
            </div>
            <img src="${randomImage}" alt="Mascote Flashcard" class="mascote-flashcard">
        </div>
        <div class="flashcard-navigation">
            <button class="btn-secondary" onclick="prevFlashcard()" ${currentFlashcardIndex === 0 ? 'disabled' : ''}>Anterior</button>
            <button class="btn-success" onclick="nextFlashcard()" ${currentFlashcardIndex === total - 1 ? 'disabled' : ''}>Próximo</button>
        </div>
    `;
}

function toggleFlip() {
    document.getElementById('current-flashcard').classList.toggle('flipped');
}

function prevFlashcard() {
    if (currentFlashcardIndex > 0) {
        currentFlashcardIndex--;
        // Remove a classe 'flipped' antes de renderizar o novo card para que ele comece virado para frente
        document.getElementById('current-flashcard').classList.remove('flipped'); 
        renderFlashcard();
    }
}

function nextFlashcard() {
    if (currentFlashcardIndex < currentFlashcards.length - 1) {
        currentFlashcardIndex++;
        // Remove a classe 'flipped' antes de renderizar o novo card para que ele comece virado para frente
        document.getElementById('current-flashcard').classList.remove('flipped'); 
        renderFlashcard();
    }
}

// --- FUNÇÕES: SIMULADO POR ETAPA ---

let currentSimuladoEtapa = [];
let userAnswers = {};

async function fetchAndRenderSimuladoEtapa() {
    const etapa = modalState.currentEtapa;
    document.getElementById("simulado-etapa-titulo").innerText = `Simulado Completo: ${etapa.titulo}`;
    const simuladoConteudo = document.getElementById("simulado-etapa-conteudo");
    const simuladoBotoes = document.getElementById("simulado-etapa-botoes");

    simuladoConteudo.innerHTML = `<p>Carregando simulado de 20+ questões sobre a etapa: <strong>${etapa.titulo}</strong>...</p>`;
    simuladoBotoes.innerHTML = '';
    currentSimuladoEtapa = [];
    userAnswers = {};

    try {
        // ATUALIZAÇÃO NO PROMPT: Requer diversidade de perguntas, distribuição aleatória das respostas, e estilo de prova/vestibular.
        const systemPromptSimulado = `Você é um gerador de questões de múltipla escolha no estilo de provas e vestibulares. Crie um simulado de no mínimo 20 (vinte) questões sobre todos os tópicos fornecidos. **Todas as questões devem ser únicas e cobrir diferentes áreas dos tópicos.** Sua única resposta deve ser APENAS JSON válido, sem texto introdutório. O JSON deve ser um objeto contendo um array de "simulados" seguindo o formato: {"simulados": [{"pergunta": "...", "alternativas": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "resposta_correta": "Letra da alternativa correta (ex: C)"}, ...]}. **IMPORTANTE: Distribua a resposta correta de forma aleatória (A, B, C, D ou E) para evitar ciclos viciosos de repetição de letra.**`;
        const topicosEtapa = etapa.topicos.map(t => t.tópico).join(", ");
        const nivel = document.getElementById("nivel").value;
        const userPromptSimulado = `Crie no mínimo 20 questões de múltipla escolha sobre os seguintes tópicos da etapa: ${topicosEtapa} no nível ${nivel}. As questões devem ter 5 alternativas e o estilo deve ser complexo e abrangente, como em um vestibular/curso técnico.`;

        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
            body: JSON.stringify({ model: MODEL_NAME, messages: [{ role: "system", content: systemPromptSimulado }, { role: "user", content: userPromptSimulado }], response_format: { type: "json_object" }, temperature: 0.6 })
        });

        if (!response.ok) { throw new Error(`Erro API: ${response.status}`); }
        const data = await response.json();
        let texto = data?.choices?.[0]?.message?.content || "Erro ao gerar simulado.";

        let parsedData;
        try {
            parsedData = JSON.parse(texto.trim());
        } catch (e) {
            let jsonMatch = texto.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim().match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Não foi possível extrair JSON do simulado.");
            parsedData = JSON.parse(jsonMatch[0]);
        }
        
        currentSimuladoEtapa = parsedData.simulados || [parsedData];
        renderSimuladoEtapa();

    } catch (err) {
        console.error("Erro no Simulado Etapa:", err);
        simuladoConteudo.innerHTML = `<p>⚠️ Erro ao gerar simulado da etapa. Causa: ${err.message}.</p>`;
    }
}

function renderSimuladoEtapa() {
    const simuladoConteudo = document.getElementById("simulado-etapa-conteudo");
    const simuladoBotoes = document.getElementById("simulado-etapa-botoes");

    if (currentSimuladoEtapa.length === 0) {
         simuladoConteudo.innerHTML = "<p>Nenhuma questão gerada.</p>";
         return;
    }

    const simuladosHtml = currentSimuladoEtapa.map((simulado, index) => {
        const alternativasHtml = simulado.alternativas.map((alt, altIndex) => {
            // Tenta garantir que o formato seja A), B), C), etc.
            const letra = alt.charAt(0).toUpperCase(); 
            const isSelected = userAnswers[index] === letra;
            return `<li class="alternativa ${isSelected ? 'selected' : ''}" 
                        data-question-index="${index}" 
                        data-answer="${letra}" 
                        onclick="selectAlternative(this)">
                        ${alt}
                    </li>`;
        }).join("");

        return `<div class="simulado-bloco" data-index="${index}">
                    <h4>Questão ${index + 1}:</h4>
                    <p><strong>${simulado.pergunta}</strong></p>
                    <ul>${alternativasHtml}</ul>
                </div><hr>`;
    }).join("");

    simuladoConteudo.innerHTML = `<div class="simulado-area">${simuladosHtml}</div><div id="simulado-resultado" style="display:none;"></div>`;
    
    // Botão de corrigir só aparece se o simulado existir
    simuladoBotoes.innerHTML = `<button class="btn-primary" onclick="corrigirSimuladoEtapa()">Corrigir e Ver Resultado</button>`;
}

function selectAlternative(liElement) {
    const questionIndex = liElement.getAttribute('data-question-index');
    const answer = liElement.getAttribute('data-answer');
    const ul = liElement.closest('ul');
    
    // Remove seleção de todas as alternativas
    ul.querySelectorAll('.alternativa').forEach(li => li.classList.remove('selected'));
    
    // Adiciona seleção à alternativa clicada
    liElement.classList.add('selected');
    
    // Armazena a resposta do usuário
    userAnswers[questionIndex] = answer;
}

function corrigirSimuladoEtapa() {
    let acertos = 0;
    const totalQuestoes = currentSimuladoEtapa.length;

    currentSimuladoEtapa.forEach((simulado, index) => {
        const bloco = document.querySelector(`.simulado-bloco[data-index="${index}"]`);
        if (!bloco) return;
        
        const alternativas = bloco.querySelectorAll('.alternativa');
        // Garante que a resposta correta é a letra maiúscula
        const respostaCorreta = simulado.resposta_correta.charAt(0).toUpperCase(); 
        const respostaUsuario = userAnswers[index];
        
        // Desabilita cliques após a correção
        alternativas.forEach(li => li.onclick = null);

        alternativas.forEach(li => {
            const letra = li.getAttribute('data-answer');
            li.classList.remove('selected'); // Remove a seleção temporária

            if (letra === respostaCorreta) {
                li.classList.add('correta-destacada'); // Marca a correta
            } 
            
            if (letra === respostaUsuario && letra !== respostaCorreta) {
                li.classList.add('incorreta'); // Marca a incorreta do usuário
            }
        });

        if (respostaUsuario === respostaCorreta) {
            acertos++;
        }
    });

    const porcentagem = (acertos / totalQuestoes) * 100;
    const resultadoDiv = document.getElementById('simulado-resultado');
    
    // DETERMINAR IMAGEM DO RESULTADO BASEADO NA PONTUAÇÃO
    let resultadoImagem = '';
    if (porcentagem < 50) {
        resultadoImagem = 'resul-ruim.png';
    } else if (porcentagem < 80) {
        resultadoImagem = 'resul-medio.png';
    } else {
        resultadoImagem = 'resul-bom.png';
    }
    
    resultadoDiv.innerHTML = `
        <img src="${resultadoImagem}" alt="Resultado" class="mascote-simulado">
        <div class="resultado-texto">
            <h3>Resultado Final</h3>
            <p>Total de Questões: <strong>${totalQuestoes}</strong></p>
            <p>Acertos: <strong style="color: var(--color-success);">${acertos}</strong></p>
            <p>Erros: <strong style="color: var(--color-danger);">${totalQuestoes - acertos}</strong></p>
            <p>Taxa de Acerto: <strong style="font-size: 1.5em; color: ${porcentagem >= 70 ? 'var(--color-success)' : 'var(--color-danger)'}">${porcentagem.toFixed(2)}%</strong></p>
        </div>
    `;
    resultadoDiv.style.display = 'flex';
    
    // Remove o botão de corrigir
    document.getElementById("simulado-etapa-botoes").innerHTML = '';
    
    // Rola para o resultado
    resultadoDiv.scrollIntoView({ behavior: 'smooth' });
}

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
