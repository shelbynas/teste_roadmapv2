// ===================================================
// JAVASCRIPT COMPLETO COM TODAS AS FUNCIONALIDADES
// ===================================================

// Configuração da API
const API_KEY = "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"; 
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; 

// Estados do Sistema
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

let userMode = "aluno";
let pomodoroState = {
    isRunning: false,
    isBreak: false,
    workTime: 25 * 60,
    breakTime: 5 * 60,
    timeLeft: 25 * 60,
    interval: null
};

// Dados Pré-definidos
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
            {
                tema: "JavaScript Moderno (ES6+)", 
                nivel: "Intermediário", 
                objetivo: "Desenvolvimento Frontend e manipulação de DOM.",
                etapas: [
                    { 
                        titulo: "Etapa 1: Variáveis e Scopes", 
                        topicos: [
                            { tópico: "Var, Let e Const", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Grammar_and_types" }, 
                            { tópico: "Arrow Functions e Template Literals", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Functions/Arrow_functions" }, 
                            { tópico: "Manipulação de Array (Map, Filter, Reduce)", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array" }, 
                            { tópico: "Introdução a Promises e Async/Await", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Using_promises" }
                        ], 
                        atividade: "Criar uma lista de tarefas (To-Do List) que manipule o DOM e use funções de array." 
                    }
                ]
            }
        ]
    },
    {
        category: "Idiomas e Linguagens",
        courses: [
            {
                tema: "Inglês Básico", 
                nivel: "Iniciante", 
                objetivo: "Conversação simples e compreensão de textos básicos.",
                etapas: [
                    { 
                        titulo: "Etapa 1: O Verbo 'To Be'", 
                        topicos: [
                            { tópico: "Afirmativa e Negativa", material: "https://www.youtube.com/watch?v=basico_to_be" }, 
                            { tópico: "Interrogativa e Short Answers", material: "https://www.duolingo.com/course/en/pt/learn-english" }, 
                            { tópico: "Pronomes Pessoais e Possessivos", material: "https://www.bbc.co.uk/learningenglish/" }, 
                            { tópico: "Vocabulário de Saudação e Apresentação", material: "https://www.memrise.com/" }
                        ], 
                        atividade: "Gravar um áudio se apresentando e falando sobre 3 membros da família em inglês." 
                    }
                ]
            }
        ]
    }
];

// ===================================================
// SISTEMA DE MODO PROFESSOR
// ===================================================

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
    updateBottomNav('professor');
}

function showProfessorResultView() {
    hideAllScreens();
    document.getElementById("professor-result-view").style.display = 'flex';
    updateBottomNav('professor');
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
        showNotification("⚠️ Por favor, preencha o campo Tema.", "error");
        return;
    }
    
    if (etapas < 1 || etapas > 10) {
        showNotification("⚠️ O número de etapas deve ser entre 1 e 10.", "error");
        return;
    }
    
    // Atualizar metadados do resultado
    document.getElementById("result-tema").textContent = tema;
    document.getElementById("result-nivel").textContent = nivel;
    document.getElementById("result-etapas").textContent = `${etapas} etapas`;
    
    showProfessorResultView();
    const contentContainer = document.getElementById("professor-content-container");
    contentContainer.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>✨ Gerando conteúdo educacional personalizado...</p>
            <p class="loading-details">Isso pode levar alguns segundos</p>
        </div>
    `;
    
    try {
        const systemPrompt = `Você é um especialista em educação e criação de conteúdo didático. Crie um plano de ensino completo com ${etapas} etapas para o tema "${tema}" no nível "${nivel}". 

PARA CADA ETAPA, forneça:
1. Um RESUMO detalhado e educativo (mínimo 250 palavras)
2. 3 EXERCÍCIOS práticos com RESPOSTAS CORRETAS

CRITÉRIOS IMPORTANTES:
- Os exercícios devem ser objetivos e claros
- Inclua a resposta correta para cada exercício
- Use linguagem adequada ao nível ${nivel}
- Seja prático e aplicável

Formato obrigatório (APENAS JSON):
{
  "etapas": [
    {
      "titulo": "Nome criativo da etapa",
      "resumo": "Texto educativo detalhado...",
      "exercicios": [
        {
          "pergunta": "Texto da pergunta...",
          "resposta": "Resposta correta detalhada..."
        }
      ]
    }
  ]
}`;

        const userPrompt = `Crie ${etapas} etapas de ensino sobre "${tema}" (Nível: ${nivel}). 
Contexto adicional: ${explicacoes || "Sem detalhes adicionais."}
Inclua resumos educativos e exercícios práticos com respostas.`;

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
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
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
        showNotification("✅ Conteúdo gerado com sucesso!", "success");

    } catch (err) {
        console.error("Erro:", err);
        contentContainer.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Erro ao gerar conteúdo</h3>
                <p>${err.message}</p>
                <button onclick="showProfessorModeView()" class="btn-secondary">Tentar Novamente</button>
            </div>
        `;
        showNotification("❌ Erro ao gerar conteúdo", "error");
    }
}

function renderConteudoProfessor(conteudo, tema, nivel) {
    const contentContainer = document.getElementById("professor-content-container");
    
    if (!conteudo || !Array.isArray(conteudo)) {
        contentContainer.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Formato inválido</h3>
                <p>O conteúdo retornado não está no formato esperado.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="professor-success">
            <div class="success-header">
                <h3>🎉 Conteúdo Gerado com Sucesso!</h3>
                <p>${conteudo.length} etapas criadas para <strong>${tema}</strong> (${nivel})</p>
            </div>
    `;
    
    conteudo.forEach((etapa, index) => {
        const exerciciosHtml = etapa.exercicios && Array.isArray(etapa.exercicios) 
            ? etapa.exercicios.map((exercicio, exIndex) => `
                <div class="exercicio-item">
                    <div class="exercicio-pergunta">
                        <strong>${exIndex + 1}.</strong> ${exercicio.pergunta || 'Pergunta não disponível'}
                    </div>
                    <div class="exercicio-resposta">
                        <span class="resposta-label">🎯 Resposta:</span>
                        ${exercicio.resposta || 'Resposta não disponível'}
                    </div>
                </div>
            `).join('')
            : '<p>Exercícios não disponíveis para esta etapa.</p>';
        
        html += `
            <div class="etapa-professor">
                <h4>📖 ${etapa.titulo || `Etapa ${index + 1}`}</h4>
                
                <div class="resumo-professor">
                    <h5>📚 Resumo Educativo</h5>
                    <p>${etapa.resumo || "Resumo não disponível."}</p>
                </div>
                
                <div class="exercicios-professor">
                    <h5>📝 Exercícios Práticos</h5>
                    <div class="exercicios-lista">
                        ${exerciciosHtml}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    contentContainer.innerHTML = html;
}

// ===================================================
// SISTEMA DE NAVEGAÇÃO E BOTTOM NAV
// ===================================================

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
        if (viewMap[key]) {
            viewMap[key].style.display = 'none';
        }
    }
}

function updateBottomNav(activeView) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === activeView) {
            btn.classList.add('active');
        }
    });
}

function showUserTrilhasView() {
    hideAllViews();
    window.scrollTo(0, 0);
    viewMap["user-trilhas-view"].style.display = 'block';
    updateBottomNav('user-trilhas-view');
    loadUserTrilhas();
}

function showPreDefinedCoursesView() {
    hideAllViews();
    window.scrollTo(0, 0);
    viewMap["predefined-courses-view"].style.display = 'block';
    updateBottomNav('predefined-courses-view');
    loadPreDefinedCourses();
}

function showFormView() {
    hideAllViews();
    window.scrollTo(0, 0);
    viewMap["form-view"].style.display = 'flex';
    updateBottomNav('form-view');
}

function showRoadmapView() {
    hideAllViews();
    window.scrollTo(0, 0);
    viewMap["roadmap-view"].style.display = 'block';
    updateBottomNav('user-trilhas-view');
}

function showEtapaView(etapa) {
    hideAllViews();
    window.scrollTo(0, 0);
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
        <div class="etapa-content">
            <div class="atividade-section">
                <h3>🎯 Atividade Prática</h3>
                <div class="atividade-card">
                    <p>${etapa.atividade}</p>
                </div>
            </div>
            <div class="topicos-section">
                <h3>📚 Tópicos de Estudo</h3>
                <div class="topicos-container">${conteudo}</div>
            </div>
        </div>
    `;
}

// ===================================================
// SISTEMA DE AUTENTICAÇÃO E USUÁRIO
// ===================================================

function showLoginView() {
    hideAllScreens();
    document.getElementById("login-screen").style.display = 'flex';
}

function showWelcomeScreen() {
    hideAllScreens();
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
            allUsersData[username] = { 
                trilhas: [], 
                currentTrilhaIndex: -1, 
                password: document.getElementById('password').value 
            };
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
            authMessage.innerText = `✅ Login bem-sucedido para ${username}!`;
            setTimeout(() => showMainApp(true), 1000);
        } else {
            authMessage.innerText = "❌ Senha incorreta.";
        }
    } else {
        loadUserData(username);
        authMessage.innerText = `🎉 Usuário ${username} criado e logado!`;
        setTimeout(() => showWelcomeScreen(), 1000);
    }
}

function handleSkipLogin() {
    loadUserData('Convidado');
    showWelcomeScreen();
}

// ===================================================
// SISTEMA DE TRILHAS E CONTEÚDO
// ===================================================

function loadUserTrilhas() {
    const trilhasList = document.getElementById("trilhas-list");
    if (!trilhasList) return;
    
    trilhasList.innerHTML = '';
    
    if (currentUser.trilhas.length === 0) {
        trilhasList.innerHTML = `
            <div class="placeholder-content">
                <p>📝 Nenhuma trilha de estudo salva.</p>
                <p>Crie sua primeira trilha para começar!</p>
            </div>
        `;
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
        card.style.borderLeft = isActive ? '5px solid var(--color-success)' : '3px solid var(--color-primary)';

        const info = `
            <div class="trilha-info">
                <h4>${trilha.tema} (${trilha.nivel}) ${isActive ? '🎯' : ''}</h4>
                <p>${trilha.objetivo || 'Sem objetivo específico'}</p>
                <div class="trilha-meta">
                    <span class="meta-item">📚 ${trilha.etapas.length} etapas</span>
                    ${isActive ? '<span class="active-badge">ATIVA</span>' : ''}
                </div>
            </div>
        `;

        const actions = `
            <div class="trilha-actions">
                <button class="btn-success" onclick="loadAndShowRoadmap(${originalIndex})">
                    ${isActive ? '🎯 Abrir' : '📖 Abrir'}
                </button>
                <button class="btn-danger" onclick="deleteTrilha(${originalIndex})">🗑️</button>
            </div>
        `;

        card.innerHTML = info + actions;
        trilhasList.appendChild(card);
    });
}

function loadPreDefinedCourses() {
    const coursesListDiv = document.getElementById("predefined-courses-list");
    if (!coursesListDiv) return;
    
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
                <p><strong>Nível:</strong> ${course.nivel}</p>
                <p>${course.objetivo}</p>
                <div class="course-meta">
                    <span>📖 ${course.etapas.length} etapa${course.etapas.length > 1 ? 's' : ''}</span>
                </div>
            `;
            gridHtml.appendChild(card);
        });
        
        categoryHtml.appendChild(gridHtml);
        coursesListDiv.appendChild(categoryHtml);
    });
}

async function gerarRoadmap() {
    const tema = document.getElementById("tema").value;
    const nivel = document.getElementById("nivel").value;
    const objetivo = document.getElementById("objetivo").value;
    const roadmapDiv = document.getElementById("roadmap");
    
    if (!tema) {
        showNotification("⚠️ Por favor, preencha o campo Tema.", "error");
        return;
    }
    
    roadmapDiv.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>✨ Gerando trilha personalizada...</p>
        </div>
    `;
    showRoadmapView();

    try {
        const systemPrompt = `Você é um especialista em educação técnica. Crie um roadmap detalhado com 8-12 etapas para o tema fornecido. Para cada etapa, inclua 3-5 tópicos essenciais com links de referência. Formato JSON obrigatório.`;

        const userPrompt = `Crie um roadmap de estudos para "${tema}" no nível "${nivel}". ${objetivo ? `Objetivo: ${objetivo}` : ''}. Inclua fontes externas confiáveis.`;

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
            throw new Error(`Erro na API: ${response.status}`);
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
        
        const etapas = parsed.etapas || [];
        
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
        showNotification("✅ Trilha criada com sucesso!", "success");

    } catch (err) {
        console.error("Erro:", err);
        roadmapDiv.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Erro ao gerar trilha</h3>
                <p>${err.message}</p>
                <button onclick="showFormView()" class="btn-secondary">Tentar Novamente</button>
            </div>
        `;
    }
}

function loadRoadmap(trilha, skipViewChange = false) {
    if (!trilha || !trilha.etapas) {
        console.error("Trilha inválida.");
        return;
    }

    modalState.etapas = trilha.etapas;
    document.getElementById("roadmap-title").innerText = `🗺️ ${trilha.tema} (${trilha.nivel})`;
    
    const roadmapDiv = document.getElementById("roadmap");
    roadmapDiv.innerHTML = "";

    trilha.etapas.forEach((etapa, index) => {
        const blocoDiv = document.createElement("div");
        blocoDiv.className = "bloco";
        blocoDiv.innerHTML = `
            <div class="etapa-number">${index + 1}</div>
            <div class="etapa-title">${etapa.titulo}</div>
        `;
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
        showNotification("✅ Curso carregado com sucesso!", "success");

    } catch (e) {
        console.error("Erro ao carregar curso:", e);
        showNotification("❌ Erro ao carregar o curso", "error");
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
    const btn = document.getElementById("btnMinhasTrilhas");
    if (btn) {
        btn.innerText = `Minhas Trilhas (${count})`;
        btn.disabled = currentUser.name === 'Convidado';
    }
}

function deleteTrilha(index) {
    if (currentUser.name === 'Convidado') return;

    if (confirm(`Tem certeza que deseja excluir a trilha "${currentUser.trilhas[index].tema}"?`)) {
        currentUser.trilhas.splice(index, 1);
        
        if (currentUser.currentTrilhaIndex === index) {
            currentUser.currentTrilhaIndex = -1;
        } else if (currentUser.currentTrilhaIndex > index) {
            currentUser.currentTrilhaIndex--;
        }
        
        saveUserTrilhas();
        showUserTrilhasView();
        showNotification("🗑️ Trilha excluída", "info");
    }
}

// ===================================================
// FUNÇÕES UTILITÁRIAS
// ===================================================

function showNotification(message, type = "info") {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showMaterialView(topico, material) {
    hideAllViews();
    window.scrollTo(0, 0);
    viewMap["material-view"].style.display = 'block';
    document.getElementById("material-titulo").innerText = topico;
    document.getElementById("material-conteudo").innerHTML = `
        <div class="material-content">
            <h3>📚 ${topico}</h3>
            <div class="material-info">
                <p>Conteúdo detalhado sobre <strong>${topico}</strong> seria carregado aqui.</p>
                ${material && material !== '#' ? `
                    <div class="material-link">
                        <a href="${material}" target="_blank" class="btn-primary">
                            🔗 Acessar Material Externo
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function showFlashcardView(topico) {
    hideAllViews();
    window.scrollTo(0, 0);
    viewMap["flashcard-view"].style.display = 'block';
    document.getElementById("flashcard-titulo").innerText = `Flashcards: ${topico}`;
    document.getElementById("flashcard-display").innerHTML = `
        <div class="flashcard-placeholder">
            <h3>🧠 Flashcards Interativos</h3>
            <p>Flashcards sobre <strong>${topico}</strong> seriam gerados aqui.</p>
            <button class="btn-primary" onclick="generateSampleFlashcards('${topico}')">
                Gerar Flashcards de Exemplo
            </button>
        </div>
    `;
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

// ===================================================
// INICIALIZAÇÃO
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
    showLoginView();

    // Event Listeners
    document.getElementById("login-form").addEventListener("submit", handleAuthSubmit);
    document.getElementById("btnSkipLogin").addEventListener("click", handleSkipLogin);
    
    initializeModeSelector();
    
    document.getElementById("btnGerarConteudoProfessor").addEventListener("click", gerarConteudoProfessor);
    
    document.getElementById("btnWelcomeContinue").addEventListener("click", showExplanationScreen);
    document.getElementById("btnExplanationContinue").addEventListener("click", () => showMainApp(false)); 
    document.getElementById("btnGerar").addEventListener("click", gerarRoadmap);
    
    // Listeners de navegação
    document.getElementById("btnMaterialVoltar")?.addEventListener("click", () => showEtapaView(modalState.currentEtapa));
    document.getElementById("btnFlashcardVoltar")?.addEventListener("click", () => showEtapaView(modalState.currentEtapa));
    document.getElementById("btnSimuladoEtapaVoltar")?.addEventListener("click", () => showEtapaView(modalState.currentEtapa));
    
    // Inicializar dados
    loadAllUsersData();
    
    console.log("🚀 Quackademy inicializado com sucesso!");
});
