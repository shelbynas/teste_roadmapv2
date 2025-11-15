// ===================================================
// JAVASCRIPT INTEGRADO (script.js) - COMPLETO COM MODO PROFESSOR
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

let modalState = {
    flashcards: [],
    currentFlashcardIndex: 0,
    currentEtapa: null,
    etapas: [],
    simulado: [],
    currentQuestionIndex: 0,
    respostasSelecionadas: [],
    simuladoFinalizado: false
}; 

let patolindoState = {
    questionsLeft: 5,
    history: [],
    lastView: "roadmap-view" 
};

// --- NOVO: Estado do Modo ---
let userMode = "aluno";

// --- SISTEMA POMODORO ---
let pomodoroState = {
    isRunning: false,
    isBreak: false,
    workTime: 25 * 60,
    breakTime: 5 * 60,
    timeLeft: 25 * 60,
    interval: null
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
            }
        ]
    }
];

// --- FUNÇÕES DO SISTEMA DE MODO ---
function initializeModeSelector() {
    const alunoBtn = document.getElementById('btnAlunoMode');
    const professorBtn = document.getElementById('btnProfessorMode');
    
    alunoBtn.addEventListener('click', () => selectMode('aluno'));
    professorBtn.addEventListener('click', () => selectMode('professor'));
}

function selectMode(mode) {
    userMode = mode;
    
    const alunoBtn = document.getElementById('btnAlunoMode');
    const professorBtn = document.getElementById('btnProfessorMode');
    
    alunoBtn.classList.toggle('active', mode === 'aluno');
    professorBtn.classList.toggle('active', mode === 'professor');
}

function showProfessorModeView() {
    hideAllScreens();
    document.getElementById("professor-mode-view").style.display = 'flex';
}

function showProfessorResultView() {
    hideAllScreens();
    document.getElementById("professor-result-view").style.display = 'flex';
}

function hideAllScreens() {
    const screens = [
        "login-screen", "welcome-screen", "explanation-screen", 
        "professor-mode-view", "professor-result-view", "main-app"
    ];
    
    screens.forEach(screen => {
        document.getElementById(screen).style.display = 'none';
    });
}

async function gerarConteudoProfessor() {
    const tema = document.getElementById("professor-tema").value;
    const nivel = document.getElementById("professor-nivel").value;
    const explicacoes = document.getElementById("professor-explicacoes").value;
    const etapas = parseInt(document.getElementById("professor-etapas").value);
    
    if (!tema) {
        alert("Por favor, preencha o campo Tema.");
        return;
    }
    
    showProfessorResultView();
    const contentContainer = document.getElementById("professor-content-container");
    contentContainer.innerHTML = "<p>✨ Gerando conteúdo educacional e exercícios...</p>";
    
    try {
        const systemPrompt = `Você é um especialista em educação e criação de conteúdo didático. Crie um plano de ensino completo com ${etapas} etapas para o tema "${tema}" no nível "${nivel}". Para CADA etapa, forneça:
1. Um RESUMO detalhado do tópico (mínimo 200 palavras)
2. 3 EXERCÍCIOS práticos relacionados ao tópico

Formato obrigatório (APENAS JSON):
{
  "etapas": [
    {
      "titulo": "Nome da etapa",
      "resumo": "Texto detalhado do resumo...",
      "exercicios": [
        "Exercício 1...",
        "Exercício 2...", 
        "Exercício 3..."
      ]
    }
  ]
}`;

        const userPrompt = `Crie ${etapas} etapas de ensino sobre "${tema}" (Nível: ${nivel}). Detalhes adicionais: ${explicacoes}. Inclua resumos detalhados e exercícios práticos para cada etapa.`;

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
            throw new Error(`Erro API: ${response.status}`);
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
        
        const conteudoGerado = parsed.etapas;
        renderConteudoProfessor(conteudoGerado, tema, nivel);

    } catch (err) {
        console.error("Erro:", err);
        contentContainer.innerHTML = `⚠️ Erro ao gerar conteúdo. Causa: ${err.message}.`;
    }
}

function renderConteudoProfessor(conteudo, tema, nivel) {
    const contentContainer = document.getElementById("professor-content-container");
    
    let html = `
        <div class="professor-header">
            <h3>📚 Conteúdo Gerado: ${tema} (${nivel})</h3>
            <p>${conteudo.length} etapas criadas com resumos e exercícios</p>
        </div>
    `;
    
    conteudo.forEach((etapa, index) => {
        html += `
            <div class="etapa-professor">
                <h4>${index + 1}. ${etapa.titulo}</h4>
                <div class="resumo-professor">
                    <h5>📖 Resumo:</h5>
                    <p>${etapa.resumo || "Resumo não disponível."}</p>
                </div>
                <div class="exercicios-professor">
                    <h5>📝 Exercícios:</h5>
                    <ol>
                        ${etapa.exercicios ? etapa.exercicios.map(ex => `<li>${ex}</li>`).join('') : '<li>Exercícios não disponíveis.</li>'}
                    </ol>
                </div>
            </div>
            <hr>
        `;
    });
    
    contentContainer.innerHTML = html;
}

// --- FUNÇÕES DE AUTENTICAÇÃO E NAVEGAÇÃO ---
function showLoginView() {
    document.getElementById("login-screen").style.display = 'flex';
    document.getElementById("welcome-screen").style.display = 'none';
    document.getElementById("explanation-screen").style.display = 'none';
    document.getElementById("main-app").style.display = 'none';
    document.getElementById("professor-mode-view").style.display = 'none';
    document.getElementById("professor-result-view").style.display = 'none';
}

function showWelcomeScreen() {
    document.getElementById("login-screen").style.display = 'none';
    document.getElementById("welcome-screen").style.display = 'flex';
    selectMode('aluno');
}

function showExplanationScreen() {
    document.getElementById("welcome-screen").style.display = 'none';
    
    if (userMode === 'professor') {
        showProfessorModeView();
    } else {
        document.getElementById("explanation-screen").style.display = 'flex';
    }
}

function showMainApp(isExistingUser = false) {
    hideAllScreens();
    document.getElementById("main-app").style.display = 'block';
    
    if (isExistingUser && currentUser.trilhas.length > 0) {
         showUserTrilhasView();
    } else {
         showPreDefinedCoursesView();
    }
}

// --- SISTEMA DE AUTENTICAÇÃO ---
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
        if (userExists.password === password) {
            loadUserData(username);
            authMessage.innerText = `Login bem-sucedido para ${username}!`;
            showMainApp(true);
        } else {
            authMessage.innerText = "Senha incorreta.";
        }
    } else {
        loadUserData(username);
        authMessage.innerText = `Usuário ${username} criado e logado!`;
        showWelcomeScreen();
    }
}

function handleSkipLogin() {
    loadUserData('Convidado');
    showWelcomeScreen();
}

// --- NAVEGAÇÃO SPA ---
const viewMap = {
    "user-trilhas-view": document.getElementById("user-trilhas-view"),
    "predefined-courses-view": document.getElementById("predefined-courses-view"),
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

    let trilhasOrdenadas = [...currentUser.trilhas];
    if (currentUser.currentTrilhaIndex !== -1) {
        const activeTrilha = trilhasOrdenadas.splice(currentUser.currentTrilhaIndex, 1)[0];
        trilhasOrdenadas.unshift(activeTrilha);
    }

    trilhasOrdenadas.forEach((trilha, index) => {
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

    if (currentUser.currentTrilhaIndex !== -1) {
         loadRoadmap(currentUser.trilhas[currentUser.currentTrilhaIndex], true);
    }
}

function showPreDefinedCoursesView() {
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

// --- FUNÇÕES DE CONTEÚDO ---
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
    
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        const systemPrompt = `Você é um especialista em educação técnica. Crie um roadmap detalhado com no mínimo 10 etapas obrigatórias. Para cada etapa, liste no mínimo 4 tópicos essenciais. Cada tópico DEVE incluir uma URL de documentação oficial ou tutorial renomado. Sua única resposta deve ser APENAS JSON válido: {"etapas": [{"titulo": "Etapa 1: Nome", "topicos": [{"tópico": "Nome", "material": "URL"}], "atividade": "Descrição"}]}.`;
        const userPrompt = `Crie um roadmap de estudos detalhado para o tema "${tema}" no nível "${nivel}"${objetivo ? ` com objetivo "${objetivo}"` : ""}. Inclua fontes externas de estudo.`;

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
            throw new Error(`Erro API: ${response.status}`);
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
        
        const novaTrilha = {
            id: Date.now(),
            tema: tema,
            nivel: nivel,
            objetivo: objetivo,
            etapas: etapas
        };
        
        if (currentUser.name !== 'Convidado') {
            currentUser.trilhas.push(novaTrilha);
            currentUser.currentTrilhaIndex = currentUser.trilhas.length - 1;
            saveUserTrilhas(); 
        } else {
            currentUser.trilhas = [novaTrilha];
            currentUser.currentTrilhaIndex = 0;
        }
        
        loadRoadmap(novaTrilha);

    } catch (err) {
        console.error("Erro:", err);
        roadmapDiv.innerHTML = `⚠️ Erro ao gerar roadmap. Causa: ${err.message}.`;
    }
}

function loadRoadmap(trilha, skipViewChange = false) {
    if (!trilha || !trilha.etapas) {
        console.error("Trilha inválida.");
        return;
    }

    modalState.etapas = trilha.etapas;
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

    if (!skipViewChange) {
        showRoadmapView();
    }
}

function loadAndShowRoadmap(index) {
    if (index >= 0 && index < currentUser.trilhas.length) {
        currentUser.currentTrilhaIndex = index;
        loadRoadmap(currentUser.trilhas[index]);
        if (currentUser.name !== 'Convidado') {
            saveUserTrilhas();
        }
    }
}

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
        
        if (currentUser.name !== 'Convidado') {
            currentUser.trilhas.push(novaTrilha);
            currentUser.currentTrilhaIndex = currentUser.trilhas.length - 1;
            saveUserTrilhas(); 
        } else {
            currentUser.trilhas = [novaTrilha];
            currentUser.currentTrilhaIndex = 0;
        }
        
        loadRoadmap(novaTrilha);

    } catch (e) {
        alert("Erro ao carregar o curso pré-definido.");
        console.error("Erro ao parsear curso pré-definido:", e);
        showPreDefinedCoursesView();
    }
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

function deleteTrilha(index) {
     if (currentUser.name === 'Convidado') return;

    if (confirm(`Tem certeza que deseja excluir a trilha "${currentUser.trilhas[index].tema}"?`)) {
        currentUser.trilhas.splice(index, 1);
        
        if (currentUser.currentTrilhaIndex === index) {
            currentUser.currentTrilhaIndex = -1;
            showUserTrilhasView();
        } else if (currentUser.currentTrilhaIndex > index) {
            currentUser.currentTrilhaIndex--;
        }
        
        saveUserTrilhas();
        showUserTrilhasView();
    }
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    showLoginView();

    document.getElementById("login-form").addEventListener("submit", handleAuthSubmit);
    document.getElementById("btnSkipLogin").addEventListener("click", handleSkipLogin);
    
    initializeModeSelector();
    
    document.getElementById("btnGerarConteudoProfessor").addEventListener("click", gerarConteudoProfessor);
    
    document.getElementById("btnWelcomeContinue").addEventListener("click", showExplanationScreen);
    document.getElementById("btnExplanationContinue").addEventListener("click", () => showMainApp(false)); 
    document.getElementById("btnGerar").addEventListener("click", gerarRoadmap);
    
    // Listeners básicos para funcionalidade mínima
    document.getElementById("btnMaterialVoltar")?.addEventListener("click", () => showEtapaView(modalState.currentEtapa));
    document.getElementById("btnFlashcardVoltar")?.addEventListener("click", () => showEtapaView(modalState.currentEtapa));
    document.getElementById("btnSimuladoEtapaVoltar")?.addEventListener("click", () => showEtapaView(modalState.currentEtapa));
});

// Funções básicas de etapa view para evitar erros
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

    document.getElementById("etapa-conteudo").innerHTML = `
        <h3>📌 Atividade prática:</h3>
        <p>${etapa.atividade}</p>
        <h3>📚 Tópicos de Estudo:</h3>
        <div class="topicos-container">${conteudo}</div>
    `;
}

// Funções placeholder para evitar erros
function showMaterialView(topico, material) {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "material-view";
    viewMap["material-view"].style.display = 'block';
    document.getElementById("material-titulo").innerText = topico;
    document.getElementById("material-conteudo").innerHTML = `<p>Conteúdo sobre ${topico} seria carregado aqui.</p>`;
}

function showFlashcardView(topico) {
    hideAllViews();
    window.scrollTo(0, 0); 
    patolindoState.lastView = "flashcard-view";
    viewMap["flashcard-view"].style.display = 'block';
    document.getElementById("flashcard-titulo").innerText = `Flashcards: ${topico}`;
    document.getElementById("flashcard-display").innerHTML = `<p>Flashcards sobre ${topico} seriam gerados aqui.</p>`;
}

function showLastView() {
    if (patolindoState.lastView === "roadmap-view") {
        showRoadmapView();
    } else if (patolindoState.lastView === "etapa-view" && modalState.currentEtapa) {
        showEtapaView(modalState.currentEtapa);
    } else {
        showRoadmapView(); 
    }
}
