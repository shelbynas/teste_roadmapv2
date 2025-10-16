
// ===================================================
// JAVASCRIPT INTEGRADO (script.js)
// ===================================================

// ⚠️ ATENÇÃO: CHAVE DA API ATUALIZADA AQUI
const API_KEY = "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";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant";

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

// --- DADOS PRÉ-DEFINIDOS ---
const preDefinedRoadmaps = [
    {
        category: "Programação e Tecnologia",
        courses: [
            {
                tema: "Python para Iniciantes",
                nivel: "Iniciante",
                objetivo: "Desenvolvimento de scripts básicos e lógica de programação.",
                etapas: [
                    {
                        titulo: "Etapa 1: Fundamentos e Sintaxe",
                        topicos: [
                            { tópico: "Variáveis e Tipos de Dados", material: "https://docs.python.org/pt-br/3/tutorial/introduction.html" },
                            { tópico: "Estruturas de Controle (If/Else)", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" },
                            { tópico: "Laços de Repetição (For/While)", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" },
                            { tópico: "Introdução a Funções", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" }
                        ],
                        atividade: "Criar uma calculadora simples que utilize If/Else e funções."
                    }
                ]
            },
        ]
    }
];

// --- FUNÇÕES DE NAVEGAÇÃO E EXIBIÇÃO ---
function hideAllViews() {
    document.querySelectorAll('.full-screen-message, #main-app, .content-view').forEach(el => el.style.display = 'none');
    document.getElementById('chat-button').style.display = 'none';
    document.getElementById('pomodoro-button').style.display = 'none';
}

function showView(viewId) {
    hideAllViews();
    const target = document.getElementById(viewId);
    if (target) {
        target.style.display = viewId.includes('-screen') ? 'flex' : 'block';
    }
    if (viewId.includes('-view')) {
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('chat-button').style.display = 'block';
        document.getElementById('pomodoro-button').style.display = 'block';
    }
}

// ... (Restante das funções de navegação: showRoadmapView, showEtapaView, etc.)

function showRoadmapView() {
    renderRoadmap(currentUser.trilhas[currentUser.currentTrilhaIndex]);
    showView('roadmap-view');
}
function showUserTrilhasView() {
    renderUserTrilhas();
    showView('user-trilhas-view');
}
function showPreDefinedCoursesView() {
    renderPreDefinedCourses();
    showView('predefined-courses-view');
}
function showFormView() {
    showView('form-view');
}
function showEtapaView(etapaIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    if (!trilha || !trilha.etapas[etapaIndex]) return;

    modalState.currentEtapaIndex = etapaIndex;

    const etapa = trilha.etapas[etapaIndex];
    document.getElementById('etapa-titulo').textContent = `Etapa ${etapaIndex + 1}: ${etapa.titulo}`;
    const etapaConteudo = document.getElementById('etapa-conteudo');
    etapaConteudo.innerHTML = '';

    const atividadeDiv = document.createElement('div');
    atividadeDiv.innerHTML = `<h3>🎯 Atividade da Etapa:</h3><p>${etapa.atividade || 'Nenhuma atividade definida para esta etapa.'}</p>`;
    etapaConteudo.appendChild(atividadeDiv);

    const topicosDiv = document.createElement('div');
    topicosDiv.innerHTML = '<h3>📚 Tópicos e Materiais:</h3>';
    const topicosContainer = document.createElement('div');
    topicosContainer.className = 'topicos-container';
    
    etapa.topicos.forEach((topico, index) => {
        const topicoBloco = document.createElement('div');
        topicoBloco.className = 'topico-bloco';
        
        const materialBtn = document.createElement('a');
        materialBtn.className = 'material-btn';
        materialBtn.textContent = `▶ ${topico.tópico}`;
        materialBtn.onclick = () => showMaterialView(etapaIndex, index);
        topicoBloco.appendChild(materialBtn);

        const flashcardBtn = document.createElement('button');
        flashcardBtn.className = 'btn-flashcard';
        flashcardBtn.textContent = '🧠 Flashcards';
        flashcardBtn.onclick = () => showFlashcardView(etapaIndex, index); 
        topicoBloco.appendChild(flashcardBtn);

        topicosContainer.appendChild(topicoBloco);
    });
    topicosDiv.appendChild(topicosContainer);
    etapaConteudo.appendChild(topicosDiv);

    const simuladoBtn = document.createElement('button');
    simuladoBtn.className = 'btn-primary btn-simulado-etapa';
    simuladoBtn.textContent = '🏆 Iniciar Simulado de Etapa (20 Perguntas)';
    simuladoBtn.onclick = () => showSimuladoEtapaView(etapaIndex);
    etapaConteudo.appendChild(simuladoBtn);

    showView('etapa-view');
}
function showMaterialView(etapaIndex, topicoIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const topico = trilha.etapas[etapaIndex].topicos[topicoIndex];

    document.getElementById('material-titulo').textContent = `Material: ${topico.tópico}`;
    document.getElementById('material-conteudo').innerHTML = `
        <p><strong>Recurso de Estudo:</strong></p>
        <p>Para estudar sobre <strong>${topico.tópico}</strong>, utilize o link abaixo.</p>
        <p><a href="${topico.material}" target="_blank" class="btn-primary" style="text-align: center; text-decoration: none;">Acessar Material Externo</a></p>
    `;
    document.getElementById('btnMaterialVoltar').onclick = () => showEtapaView(etapaIndex);
    showView('material-view');
}
function showFlashcardView(etapaIndex, topicoIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const topico = trilha.etapas[etapaIndex].topicos[topicoIndex];
    document.getElementById('flashcard-titulo').textContent = `Flashcards: ${topico.tópico}`;
    document.getElementById('flashcard-display').innerHTML = '<p class="placeholder-text">Gerando flashcards...</p>';
    document.getElementById('btnFlashcardVoltar').onclick = () => showEtapaView(etapaIndex);
    fetchFlashcards(topico.tópico, etapaIndex);
    showView('flashcard-view');
    document.getElementById('chat-button').style.display = 'none'; // Oculta o chat
}
function showSimuladoEtapaView(etapaIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const etapa = trilha.etapas[etapaIndex];
    document.getElementById('simulado-etapa-titulo').textContent = `Simulado: ${etapa.titulo}`;
    document.getElementById('simulado-etapa-conteudo').innerHTML = '<p class="placeholder-text">Gerando 20 questões...</p>';
    document.getElementById('simulado-etapa-botoes').innerHTML = '';
    document.getElementById('btnSimuladoEtapaVoltar').onclick = () => showEtapaView(etapaIndex);
    fetchSimulado(etapa, etapaIndex);
    showView('simulado-etapa-view');
    document.getElementById('chat-button').style.display = 'none'; // Oculta o chat
}


// --- FUNÇÕES DE DADOS E LÓGICA ---
function loadUserData(username) {
    // ... (sua lógica de carregar usuário) ...
}
function saveUserData() {
    // ... (sua lógica de salvar usuário) ...
}

// ... (Resto das suas funções originais: renderRoadmap, renderUserTrilhas, etc.)

// --- CÓDIGO DO POMODORO (NOVO E COMPLETO) ---
let timer;
let isPomodoroRunning = false;
let isWorkTime = true;
let sessionsCompleted = 0;
let timeRemaining = 25 * 60;

const pomodoroConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionCount: 4
};

function openPomodoroModal() { document.getElementById('pomodoro-modal').style.display = 'flex'; }
function closePomodoroModal() { document.getElementById('pomodoro-modal').style.display = 'none'; }
function openConfigModal() { document.getElementById('config-modal').style.display = 'flex'; }
function closeConfigModal() { document.getElementById('config-modal').style.display = 'none'; }

function saveConfig() {
    pomodoroConfig.workDuration = parseInt(document.getElementById('work-duration').value);
    pomodoroConfig.shortBreakDuration = parseInt(document.getElementById('short-break-duration').value);
    pomodoroConfig.longBreakDuration = parseInt(document.getElementById('long-break-duration').value);
    pomodoroConfig.sessionCount = parseInt(document.getElementById('session-count').value);
    localStorage.setItem('pomodoroConfig', JSON.stringify(pomodoroConfig));
    resetTimer(true);
    closeConfigModal();
}

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('time-display').textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    document.title = `${formatTime(timeRemaining)} - ${document.getElementById('pomodoro-status').textContent}`;
}

function startPauseTimer() {
    if (isPomodoroRunning) {
        clearInterval(timer);
        document.getElementById('start-pause-btn').textContent = 'Retomar';
    } else {
        document.getElementById('start-pause-btn').textContent = 'Pausar';
        timer = setInterval(tick, 1000);
    }
    isPomodoroRunning = !isPomodoroRunning;
}

function resetTimer(keepSession = false) {
    clearInterval(timer);
    isPomodoroRunning = false;
    document.getElementById('start-pause-btn').textContent = 'Iniciar';
    document.getElementById('pomodoro-status').textContent = 'Foco';
    if (!keepSession) sessionsCompleted = 0;
    timeRemaining = pomodoroConfig.workDuration * 60;
    updateDisplay();
}

function tick() {
    timeRemaining--;
    if (timeRemaining < 0) {
        clearInterval(timer);
        isPomodoroRunning = false;
        if (isWorkTime) {
            sessionsCompleted++;
            isWorkTime = false;
            const isLongBreak = sessionsCompleted % pomodoroConfig.sessionCount === 0;
            timeRemaining = (isLongBreak ? pomodoroConfig.longBreakDuration : pomodoroConfig.shortBreakDuration) * 60;
            document.getElementById('modal-title').textContent = isLongBreak ? "🎉 HORA DA PAUSA LONGA!" : "🚨 HORA DA PAUSA!";
            document.getElementById('modal-message').innerHTML = `Seu tempo de <strong>Foco</strong> acabou. Descanse por <strong>${isLongBreak ? pomodoroConfig.longBreakDuration : pomodoroConfig.shortBreakDuration} minutos</strong>.`;
            document.getElementById('break-modal').style.display = 'flex';
        } else {
            isWorkTime = true;
            timeRemaining = pomodoroConfig.workDuration * 60;
            alert("Pausa finalizada! Hora de voltar ao foco.");
        }
        startPauseTimer(); // Começa o próximo ciclo
    }
    updateDisplay();
}

// Inicialização do Pomodoro
document.addEventListener('DOMContentLoaded', () => {
    // ... (Seu código de inicialização original)

    // Inicialização do Pomodoro
    const savedConfig = localStorage.getItem('pomodoroConfig');
    if (savedConfig) {
        Object.assign(pomodoroConfig, JSON.parse(savedConfig));
    }
    document.getElementById('work-duration').value = pomodoroConfig.workDuration;
    document.getElementById('short-break-duration').value = pomodoroConfig.shortBreakDuration;
    document.getElementById('long-break-duration').value = pomodoroConfig.longBreakDuration;
    document.getElementById('session-count').value = pomodoroConfig.sessionCount;
    resetTimer();

    document.getElementById('pomodoro-button').addEventListener('click', openPomodoroModal);
    document.getElementById('btnContinueBreak').addEventListener('click', () => {
        document.getElementById('break-modal').style.display = 'none';
    });

    // Make the pomodoro modal draggable
    dragElement(document.getElementById("pomodoro-modal"));
    dragElement(document.getElementById("config-modal"));

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (elmnt.querySelector(".pomodoro-header")) {
            // Se houver um header, arraste por ele
            elmnt.querySelector(".pomodoro-header").onmousedown = dragMouseDown;
        } else {
            // Senão, arraste por todo o elemento
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Posição inicial do mouse
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Calcula a nova posição do cursor
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Define a nova posição do elemento
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // Para de mover quando o mouse é solto
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
});
