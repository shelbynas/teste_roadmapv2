

// ===================================================
// JAVASCRIPT INTEGRADO (script.js) - CÓDIGO ORIGINAL
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

// --- DADOS PRÉ-DEFINIDOS (PARA ECONOMIZAR REQUISIÇÕES) ---
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
            },
            {
                tema: "Java: POO e Backend",
                nivel: "Avançado",
                objetivo: "Entender Programação Orientada a Objetos e estruturas de dados básicas.",
                etapas: [
                    {
                        titulo: "Etapa 1: Conceitos de POO",
                        topicos: [
                            { tópico: "Classes, Objetos e Encapsulamento", material: "https://docs.oracle.com/javase/tutorial/java/concepts/index.html" },
                            { tópico: "Herança e Polimorfismo", material: "https://docs.oracle.com/javase/tutorial/java/concepts/index.html" },
                            { tópico: "Tratamento de Exceções", material: "https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html" },
                            { tópico: "Estruturas de Dados (ArrayList e HashMap)", material: "https://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html" }
                        ],
                        atividade: "Desenvolver um sistema bancário simples com classes Cliente e Conta, aplicando Herança."
                    }
                ]
            },
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
            },
            {
                tema: "Espanhol Intermediário",
                nivel: "Intermediário",
                objetivo: "Dominar pretéritos e conversação em viagens.",
                etapas: [
                    {
                        titulo: "Etapa 1: Pretéritos do Indicativo",
                        topicos: [
                            { tópico: "Pretérito Perfeito Simples (Pasado Simple)", material: "https://www.rae.es/" },
                            { tópico: "Pretérito Imperfeito", material: "https://espanhol.com/gramatica/passado-espanhol" },
                            { tópico: "Verbos Irregulares Comuns", material: "https://conjuga-me.net/espanhol/verbos/irregulares" },
                            { tópico: "Vocabulário de Viagem e Turismo", material: "https://cervantes.es/" }
                        ],
                        atividade: "Escrever um parágrafo contando suas últimas férias usando os pretéritos estudados."
                    }
                ]
            }
        ]
    },
    {
        category: "Matérias Escolares - Ensino Fundamental (Anos Finais)",
        courses: [
            {
                tema: "Matemática (6º Ano)",
                nivel: "Intermediário",
                objetivo: "Dominar números inteiros, frações e operações básicas.",
                etapas: [
                    {
                        titulo: "Etapa 1: Números Inteiros e Racionais",
                        topicos: [
                            { tópico: "O Conjunto dos Números Inteiros (Z)", material: "https://mundoeducacao.uol.com.br/matematica/conjunto-dos-numeros-inteiros.htm" },
                            { tópico: "Adição e Subtração de Inteiros", material: "https://www.youtube.com/watch?v=inteiros_operacoes" },
                            { tópico: "Representação de Frações", material: "https://brasilescola.uol.com.br/matematica/fracao.htm" },
                            { tópico: "Números Decimais e Porcentagem", material: "https://www.somatematica.com.br/fundam/numerosdec.php" }
                        ],
                        atividade: "Resolver 10 problemas de adição/subtração com números inteiros e 10 de conversão de fração para decimal."
                    }
                ]
            }
        ]
    }
];

// --- FUNÇÕES DE NAVEGAÇÃO E EXIBIÇÃO ---

function hideAllViews() {
    document.querySelectorAll('.full-screen-message').forEach(el => el.style.display = 'none');
    document.getElementById('main-app').style.display = 'none';
    document.querySelectorAll('.content-view').forEach(el => el.style.display = 'none');
    document.getElementById('chat-button').style.display = 'none'; // Esconde o chat na tela de login/boas-vindas
    document.getElementById('pomodoro-button').style.display = 'none'; // Esconde o pomodoro nas telas iniciais
}

function showLoginScreen() {
    hideAllViews();
    document.getElementById('login-screen').style.display = 'flex';
}

function showWelcomeScreen(userName) {
    hideAllViews();
    document.getElementById('welcome-screen').style.display = 'flex';
    document.getElementById('userNameDisplay').textContent = userName;
}

function showExplanationScreen() {
    hideAllViews();
    document.getElementById('explanation-screen').style.display = 'flex';
}

function showApp(initialView) {
    hideAllViews();
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('chat-button').style.display = 'block';
    document.getElementById('pomodoro-button').style.display = 'block'; // Mostra o pomodoro na aplicação principal
    showView(initialView);
}

function showView(viewId) {
    document.querySelectorAll('.content-view').forEach(view => {
        view.style.display = 'none';
    });
    document.getElementById(viewId).style.display = 'block';
    patolindoState.lastView = viewId; // Atualiza a última view visitada
}

function showRoadmapView() {
    renderRoadmap(currentUser.trilhas[currentUser.currentTrilhaIndex]);
    showView('roadmap-view');
}

function showFormView() {
    showView('form-view');
}

function showEtapaView(etapaIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    if (!trilha || !trilha.etapas[etapaIndex]) return;

    modalState.currentEtapaIndex = etapaIndex; // Salva o índice da etapa

    const etapa = trilha.etapas[etapaIndex];
    document.getElementById('etapa-titulo').textContent = `Etapa ${etapaIndex + 1}: ${etapa.titulo}`;
    const etapaConteudo = document.getElementById('etapa-conteudo');
    etapaConteudo.innerHTML = ''; // Limpa conteúdo anterior

    // Descrição da Atividade/Objetivo
    const atividadeDiv = document.createElement('div');
    atividadeDiv.innerHTML = `<h3>🎯 Atividade da Etapa:</h3><p>${etapa.atividade || 'Nenhuma atividade definida para esta etapa.'}</p>`;
    etapaConteudo.appendChild(atividadeDiv);

    // Tópicos
    const topicosDiv = document.createElement('div');
    topicosDiv.innerHTML = '<h3>📚 Tópicos e Materiais:</h3>';
    const topicosContainer = document.createElement('div');
    topicosContainer.className = 'topicos-container';
    
    etapa.topicos.forEach((topico, index) => {
        const topicoBloco = document.createElement('div');
        topicoBloco.className = 'topico-bloco';
        
        // Botão de Material
        const materialBtn = document.createElement('a');
        materialBtn.className = 'material-btn';
        materialBtn.textContent = `▶ ${topico.tópico}`;
        materialBtn.onclick = () => showMaterialView(etapaIndex, index);
        topicoBloco.appendChild(materialBtn);

        // Botão de Flashcard (Flashcard é por tópico)
        const flashcardBtn = document.createElement('button');
        flashcardBtn.className = 'btn-flashcard';
        flashcardBtn.textContent = '🧠 Flashcards';
        flashcardBtn.onclick = () => showFlashcardView(etapaIndex, index); 
        topicoBloco.appendChild(flashcardBtn);

        topicosContainer.appendChild(topicoBloco);
    });
    topicosDiv.appendChild(topicosContainer);
    etapaConteudo.appendChild(topicosDiv);

    // Botão de Simulado (após todos os tópicos)
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
    const materialConteudo = document.getElementById('material-conteudo');
    materialConteudo.innerHTML = `
        <p><strong>Recurso de Estudo:</strong></p>
        <p>Para estudar sobre <strong>${topico.tópico}</strong>, utilize o link abaixo. Este material foi sugerido pela IA ou é um link de referência pré-definido.</p>
        <p><a href="${topico.material}" target="_blank" class="btn-primary" style="text-align: center; text-decoration: none;">Acessar Material Externo</a></p>
    `;

    document.getElementById('btnMaterialVoltar').onclick = () => showEtapaView(etapaIndex);

    showView('material-view');
}

function showFlashcardView(etapaIndex, topicoIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const topico = trilha.etapas[etapaIndex].topicos[topicoIndex];

    document.getElementById('flashcard-titulo').textContent = `Flashcards: ${topico.tópico}`;
    document.getElementById('flashcard-display').innerHTML = '';

    // Chamada à IA para gerar Flashcards
    fetchFlashcards(topico.tópico, etapaIndex, topicoIndex);

    document.getElementById('btnFlashcardVoltar').onclick = () => showEtapaView(etapaIndex);

    showView('flashcard-view');
}

function showSimuladoEtapaView(etapaIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const etapa = trilha.etapas[etapaIndex];
    
    document.getElementById('simulado-etapa-titulo').textContent = `Simulado: Etapa ${etapaIndex + 1}: ${etapa.titulo}`;
    document.getElementById('simulado-etapa-conteudo').innerHTML = 'Carregando questões do Simulado...';
    document.getElementById('simulado-etapa-botoes').innerHTML = '';
    
    // Chamada à IA para gerar Simulado
    fetchSimulado(etapa.titulo, etapaIndex);

    document.getElementById('btnSimuladoEtapaVoltar').onclick = () => showEtapaView(etapaIndex);

    showView('simulado-etapa-view');
}

function showUserTrilhasView() {
    renderUserTrilhas();
    showView('user-trilhas-view');
}

function showPreDefinedCoursesView() {
    renderPreDefinedCourses();
    showView('predefined-courses-view');
}

function goToChatView() {
    // Salva a view anterior para poder voltar
    patolindoState.lastView = document.querySelector('.content-view[style*="block"]').id;
    updateChatHeader();
    showView('chat-view');
}

// --- FUNÇÕES DE RENDERIZAÇÃO ---

function renderRoadmap(trilha) {
    document.getElementById('roadmap-title').textContent = `Sua Trilha: ${trilha.tema} (${trilha.nivel})`;
    const roadmapDiv = document.getElementById('roadmap');
    roadmapDiv.innerHTML = ''; // Limpa conteúdo anterior

    trilha.etapas.forEach((etapa, index) => {
        const bloco = document.createElement('div');
        bloco.className = 'bloco';
        bloco.textContent = `Etapa ${index + 1}: ${etapa.titulo}`;
        bloco.onclick = () => showEtapaView(index);
        roadmapDiv.appendChild(bloco);
    });
    document.getElementById('btnMinhasTrilhas').textContent = `Minhas Trilhas (${currentUser.trilhas.length})`;
    saveUserData();
}

function renderUserTrilhas() {
    const trilhasList = document.getElementById('trilhas-list');
    trilhasList.innerHTML = '';
    
    if (currentUser.trilhas.length === 0) {
        trilhasList.innerHTML = `<p class="placeholder-text">Você ainda não possui trilhas salvas.</p>`;
        return;
    }

    currentUser.trilhas.forEach((trilha, index) => {
        const trilhaCard = document.createElement('div');
        trilhaCard.className = 'trilha-card';
        
        trilhaCard.innerHTML = `
            <div class="trilha-info">
                <h4>${trilha.tema} (${trilha.nivel})</h4>
                <p>Objetivo: ${trilha.objetivo || 'Não especificado'}</p>
            </div>
            <div class="trilha-actions">
                <button onclick="loadTrilha(${index})" class="btn-primary">Abrir</button>
                <button onclick="deleteTrilha(${index})" class="btn-danger btn-secondary" style="background-color: var(--color-danger);">Excluir</button>
            </div>
        `;
        trilhasList.appendChild(trilhaCard);
    });
}

function renderPreDefinedCourses() {
    const listDiv = document.getElementById('predefined-courses-list');
    listDiv.innerHTML = '';

    preDefinedRoadmaps.forEach(categoryData => {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'course-category';
        categoryHeader.innerHTML = `<h3>${categoryData.category}</h3>`;
        listDiv.appendChild(categoryHeader);

        const grid = document.createElement('div');
        grid.className = 'courses-grid';
        
        categoryData.courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.onclick = () => loadPreDefinedCourse(course);
            card.innerHTML = `
                <h4>${course.tema}</h4>
                <p>Nível: ${course.nivel}</p>
            `;
            grid.appendChild(card);
        });
        listDiv.appendChild(grid);
    });
}

// --- FUNÇÕES DE DADOS E GESTÃO DE TRILHAS ---

function loadUserData() {
    const storedUsers = localStorage.getItem('quackademyUsers');
    const storedCurrentUser = localStorage.getItem('quackademyCurrentUser');
    
    if (storedUsers) {
        allUsersData = JSON.parse(storedUsers);
    }
    
    if (storedCurrentUser) {
        currentUser = JSON.parse(storedCurrentUser);
        if (currentUser.name) {
            // Se o usuário já estava logado, carrega os dados completos
            if (allUsersData[currentUser.name]) {
                currentUser = allUsersData[currentUser.name];
            }
            showWelcomeScreen(currentUser.name);
        } else {
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

function saveUserData() {
    if (currentUser.name) {
        allUsersData[currentUser.name] = currentUser;
        localStorage.setItem('quackademyUsers', JSON.stringify(allUsersData));
    }
    // Sempre salva o estado atual do usuário (mesmo que seja convidado)
    localStorage.setItem('quackademyCurrentUser', JSON.stringify(currentUser));
}

function loadTrilha(index) {
    currentUser.currentTrilhaIndex = index;
    saveUserData();
    showRoadmapView();
}

function deleteTrilha(index) {
    if (confirm("Tem certeza que deseja excluir esta trilha?")) {
        // Se a trilha atual for a excluída, resetamos o índice
        if (currentUser.currentTrilhaIndex === index) {
            currentUser.currentTrilhaIndex = -1; 
        } else if (currentUser.currentTrilhaIndex > index) {
            // Se o índice atual for maior, ajustamos o índice
            currentUser.currentTrilhaIndex--; 
        }
        
        currentUser.trilhas.splice(index, 1);
        saveUserData();
        renderUserTrilhas();
        
        // Atualiza a contagem no header
        document.getElementById('btnMinhasTrilhas').textContent = `Minhas Trilhas (${currentUser.trilhas.length})`;
        
        // Se todas as trilhas foram excluídas, volta para a tela de seleção/criação
        if (currentUser.trilhas.length === 0) {
            showPreDefinedCoursesView();
        }
    }
}

function loadPreDefinedCourse(course) {
    // Cria uma cópia da trilha pre-definida
    const newTrilha = JSON.parse(JSON.stringify(course)); 
    
    // Adiciona a nova trilha ao array
    currentUser.trilhas.push(newTrilha);
    
    // Define a nova trilha como a trilha atual
    currentUser.currentTrilhaIndex = currentUser.trilhas.length - 1; 

    // Salva e exibe
    saveUserData();
    showRoadmapView();
}


// --- FUNÇÕES DE GERAÇÃO DE CONTEÚDO (IA) ---

// Função principal de comunicação com a Groq API
async function fetchAIResponse(systemPrompt, userPrompt, jsonOutput = false) {
    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    };

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];

    const body = {
        model: MODEL_NAME,
        messages: messages,
        temperature: 0.7,
        response_format: jsonOutput ? { type: "json_object" } : undefined
    };

    try {
        const response = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro da API Groq:", errorData);
            throw new Error(`Erro HTTP: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Erro ao comunicar com a IA:", error);
        return null; // Retorna null em caso de erro
    }
}

// 1. Gerar Trilha
async function generateRoadmap() {
    const tema = document.getElementById('tema').value;
    const nivel = document.getElementById('nivel').value;
    const objetivo = document.getElementById('objetivo').value;
    
    if (!tema) {
        alert("Por favor, insira um Tema.");
        return;
    }

    const btnGerar = document.getElementById('btnGerar');
    btnGerar.disabled = true;
    btnGerar.textContent = 'Gerando Trilha... ⏳';

    const systemPrompt = `Você é um especialista em planejamento educacional. Sua tarefa é criar um roadmap de estudos detalhado em português, com cerca de 10 etapas (tópicos principais) sobre o tema e nível fornecidos pelo usuário.

    Sua resposta deve ser estritamente um objeto JSON (JSON Object) contendo a chave 'etapas', que é um array de objetos. CADA objeto de etapa deve seguir este formato:
    {
        "titulo": "Nome Curto e Descritivo da Etapa",
        "topicos": [
            {"tópico": "Tópico Específico 1", "material": "URL_De_Um_Recurso_Educacional_Fictício_Ou_Exemplo"},
            {"tópico": "Tópico Específico 2", "material": "URL_De_Um_Recurso_Educacional_Fictício_Ou_Exemplo"}
            // ... pelo menos 4 tópicos
        ],
        "atividade": "Uma atividade prática de aplicação (ex: Criar um mini-projeto, resolver 5 exercícios, escrever um resumo, etc.)"
    }
    
    O campo 'material' DEVE conter uma URL (link) válida, mesmo que seja fictícia (ex: https://docs.exemplo.com/recurso). O objetivo é simular links reais.
    `;

    const userPrompt = `
    Tema: ${tema}
    Nível: ${nivel}
    Objetivo Específico: ${objetivo || 'Não fornecido'}
    
    Gere o JSON do roadmap de 10 etapas.
    `;
    
    const jsonResponse = await fetchAIResponse(systemPrompt, userPrompt, true);
    
    btnGerar.disabled = false;
    btnGerar.textContent = 'Gerar Trilha 🚀';

    if (jsonResponse) {
        try {
            const roadmapData = JSON.parse(jsonResponse);
            
            const newTrilha = {
                tema: tema,
                nivel: nivel,
                objetivo: objetivo,
                etapas: roadmapData.etapas
            };
            
            currentUser.trilhas.push(newTrilha);
            currentUser.currentTrilhaIndex = currentUser.trilhas.length - 1;
            
            showRoadmapView();

        } catch (e) {
            alert("Erro ao processar a resposta da IA. O formato pode estar incorreto. Tente novamente.");
            console.error("Erro de Parsing JSON:", e);
        }
    } else {
        alert("Falha na comunicação com a IA. Verifique sua chave de API ou tente novamente.");
    }
}


// 2. Gerar Flashcards
async function fetchFlashcards(topico, etapaIndex, topicoIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const tema = trilha.tema;
    const flashcardDisplay = document.getElementById('flashcard-display');
    flashcardDisplay.innerHTML = `<p class="placeholder-text">Gerando 5 Flashcards sobre <strong>${topico}</strong>...</p>`;
    
    const systemPrompt = `Você é um gerador de flashcards. Sua saída DEVE ser estritamente um objeto JSON (JSON Object) contendo a chave 'flashcards', que é um array de 5 objetos.
    Cada flashcard deve conter uma pergunta ('frente') e uma resposta detalhada ('verso') sobre o tópico fornecido.
    Formato de cada objeto no array:
    {
        "frente": "Pergunta clara sobre o conceito",
        "verso": "Resposta detalhada e concisa"
    }
    `;
    
    const userPrompt = `Gere 5 flashcards sobre o tópico: "${topico}", dentro do contexto da trilha: "${tema}".`;

    const jsonResponse = await fetchAIResponse(systemPrompt, userPrompt, true);

    if (jsonResponse) {
        try {
            const data = JSON.parse(jsonResponse);
            renderFlashcards(data.flashcards, etapaIndex);
        } catch (e) {
            flashcardDisplay.innerHTML = `<p class="placeholder-text" style="color: var(--color-danger);">Erro ao carregar flashcards. O formato da IA falhou.</p>`;
            console.error("Erro de Parsing JSON:", e);
        }
    } else {
        flashcardDisplay.innerHTML = `<p class="placeholder-text" style="color: var(--color-danger);">Falha na comunicação com a IA para flashcards.</p>`;
    }
}

let currentFlashcardIndex = 0;
let flashcardsData = [];

function renderFlashcards(flashcards, etapaIndex) {
    flashcardsData = flashcards;
    currentFlashcardIndex = 0;
    
    if (flashcards.length === 0) {
        document.getElementById('flashcard-display').innerHTML = `<p class="placeholder-text">Nenhum flashcard gerado.</p>`;
        return;
    }

    const flashcardDisplay = document.getElementById('flashcard-display');
    flashcardDisplay.innerHTML = `
        <div class="flashcard" id="current-flashcard" onclick="flipCard()">
            <div class="flashcard-inner">
                <div class="flashcard-face flashcard-front" id="flashcard-front"></div>
                <div class="flashcard-face flashcard-back" id="flashcard-back"></div>
            </div>
        </div>
        <div class="flashcard-navigation">
            <button id="prev-flashcard" class="btn-secondary">Anterior</button>
            <span id="flashcard-counter" style="font-weight: bold; align-self: center;"></span>
            <button id="next-flashcard" class="btn-primary">Próximo</button>
        </div>
    `;

    document.getElementById('prev-flashcard').addEventListener('click', (e) => {
        e.stopPropagation(); 
        navigateFlashcard(-1);
    });
    document.getElementById('next-flashcard').addEventListener('click', (e) => {
        e.stopPropagation(); 
        navigateFlashcard(1);
    });

    loadFlashcard();
}

function loadFlashcard() {
    if (flashcardsData.length === 0) return;
    
    const card = flashcardsData[currentFlashcardIndex];
    document.getElementById('flashcard-front').innerHTML = `<h3>❓ Pergunta:</h3><p>${card.frente}</p>`;
    document.getElementById('flashcard-back').innerHTML = `<h3>💡 Resposta:</h3><p>${card.verso}</p>`;
    
    document.getElementById('current-flashcard').classList.remove('flipped');
    document.getElementById('flashcard-counter').textContent = `${currentFlashcardIndex + 1} / ${flashcardsData.length}`;
}

function flipCard() {
    document.getElementById('current-flashcard').classList.toggle('flipped');
}

function navigateFlashcard(direction) {
    currentFlashcardIndex = (currentFlashcardIndex + direction + flashcardsData.length) % flashcardsData.length;
    loadFlashcard();
}

// 3. Gerar Simulado
async function fetchSimulado(etapaTitulo, etapaIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const tema = trilha.tema;
    const simuladoConteudo = document.getElementById('simulado-etapa-conteudo');
    simuladoConteudo.innerHTML = `<p class="placeholder-text">Gerando Simulado de 20 questões sobre <strong>${etapaTitulo}</strong>...</p>`;
    
    const systemPrompt = `Você é um gerador de simulados de múltipla escolha. Sua saída DEVE ser estritamente um objeto JSON (JSON Object) contendo a chave 'questoes', que é um array de 20 objetos.
    Cada objeto de questão deve ter 4 alternativas, onde apenas uma é correta.
    Formato de cada objeto no array:
    {
        "pergunta": "O que é [conceito]?",
        "alternativas": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
        "respostaCorreta": "Alternativa A" // Deve ser EXATAMENTE uma das alternativas
    }
    `;
    
    const userPrompt = `Gere 20 questões de múltipla escolha sobre o conteúdo da etapa: "${etapaTitulo}", dentro do contexto da trilha: "${tema}".`;

    const jsonResponse = await fetchAIResponse(systemPrompt, userPrompt, true);

    if (jsonResponse) {
        try {
            const data = JSON.parse(jsonResponse);
            renderSimulado(data.questoes, etapaIndex);
        } catch (e) {
            simuladoConteudo.innerHTML = `<p class="placeholder-text" style="color: var(--color-danger);">Erro ao carregar simulado. O formato da IA falhou.</p>`;
            console.error("Erro de Parsing JSON:", e);
        }
    } else {
        simuladoConteudo.innerHTML = `<p class="placeholder-text" style="color: var(--color-danger);">Falha na comunicação com a IA para simulado.</p>`;
    }
}

let simuladoData = [];
let userAnswers = {}; // { questaoIndex: 'Alternativa Selecionada' }

function renderSimulado(questoes) {
    simuladoData = questoes;
    userAnswers = {};
    const simuladoConteudo = document.getElementById('simulado-etapa-conteudo');
    const simuladoBotoes = document.getElementById('simulado-etapa-botoes');
    simuladoConteudo.innerHTML = '';
    
    if (questoes.length === 0) {
        simuladoConteudo.innerHTML = `<p class="placeholder-text">Nenhuma questão gerada.</p>`;
        return;
    }

    questoes.forEach((q, qIndex) => {
        const bloco = document.createElement('div');
        bloco.className = 'simulado-bloco';
        bloco.id = `questao-${qIndex}`;
        
        bloco.innerHTML = `
            <h4>Questão ${qIndex + 1}:</h4>
            <p>${q.pergunta}</p>
            <ul id="alternativas-${qIndex}">
                ${q.alternativas.map(alt => `<li class="alternativa" onclick="selectAlternativa(${qIndex}, '${alt.replace(/'/g, "\\'")}')">${alt}</li>`).join('')}
            </ul>
            <hr>
        `;
        simuladoConteudo.appendChild(bloco);
    });

    simuladoBotoes.innerHTML = `
        <button id="btnFinalizarSimulado" class="btn-primary" onclick="checkSimulado()">Finalizar Simulado</button>
    `;
}

function selectAlternativa(qIndex, selectedAlt) {
    userAnswers[qIndex] = selectedAlt;
    const ul = document.getElementById(`alternativas-${qIndex}`);
    ul.querySelectorAll('li').forEach(li => {
        li.classList.remove('selected');
    });

    // Encontra a LI selecionada para aplicar a classe 'selected'
    Array.from(ul.querySelectorAll('li')).find(li => li.textContent === selectedAlt).classList.add('selected');
}

function checkSimulado() {
    let score = 0;
    const simuladoConteudo = document.getElementById('simulado-etapa-conteudo');
    
    simuladoData.forEach((q, qIndex) => {
        const ul = document.getElementById(`alternativas-${qIndex}`);
        const userAnswer = userAnswers[qIndex];
        const correctAnswer = q.respostaCorreta;
        
        ul.querySelectorAll('li').forEach(li => {
            li.onclick = null; // Desabilita cliques após a checagem
            li.classList.remove('selected'); // Remove seleção anterior
            
            if (li.textContent === correctAnswer) {
                li.classList.add('correta-destacada'); // Destaca a correta
            } else if (li.textContent === userAnswer && userAnswer !== correctAnswer) {
                li.classList.add('incorreta'); // Destaca a incorreta
            }
        });

        if (userAnswer === correctAnswer) {
            score++;
        }
    });

    const resultadoDiv = document.createElement('div');
    resultadoDiv.id = 'simulado-resultado';
    resultadoDiv.innerHTML = `
        <h3>Resultado Final</h3>
        <p>Você acertou <strong>${score}</strong> de ${simuladoData.length} questões.</p>
        <p>Aproveitamento: <strong>${((score / simuladoData.length) * 100).toFixed(2)}%</strong></p>
    `;
    
    // Insere o resultado antes da primeira questão para ficar visível
    simuladoConteudo.insertBefore(resultadoDiv, simuladoConteudo.firstChild);

    // Oculta o botão de finalizar
    document.getElementById('simulado-etapa-botoes').style.display = 'none';
}


// --- LÓGICA DE AUTENTICAÇÃO E INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    
    // Login / Cadastro
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        
        if (allUsersData[username]) {
            // Login
            currentUser = allUsersData[username];
            showWelcomeScreen(currentUser.name);
        } else {
            // Cadastro/Novo Usuário
            currentUser.name = username;
            currentUser.trilhas = [];
            currentUser.currentTrilhaIndex = -1;
            saveUserData();
            showWelcomeScreen(currentUser.name);
        }
    });

    document.getElementById('btnSkipLogin').addEventListener('click', () => {
        currentUser.name = 'Convidado';
        currentUser.trilhas = preDefinedRoadmaps.map(c => c.courses).flat(); // Carrega todos os cursos como trilhas para o convidado
        currentUser.currentTrilhaIndex = -1; // Sem trilha ativa inicialmente
        showWelcomeScreen(currentUser.name);
    });

    document.getElementById('btnWelcomeContinue').addEventListener('click', () => {
        showExplanationScreen();
    });

    document.getElementById('btnExplanationContinue').addEventListener('click', () => {
        showApp('predefined-courses-view');
    });

    // Geração de Trilha
    document.getElementById('btnGerar').addEventListener('click', generateRoadmap);
    
    // Chat Patolindo
    document.getElementById('chat-button').addEventListener('click', goToChatView);
    document.getElementById('chat-exit-button').addEventListener('click', () => {
        showView(patolindoState.lastView);
    });

    document.getElementById('chat-send-button').addEventListener('click', handleChatSend);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatSend();
        }
    });
    
});

// --- LÓGICA DO CHATBOT ---

function updateChatHeader() {
    document.getElementById('chat-counter').textContent = `(${patolindoState.questionsLeft} Perguntas)`;
    if (patolindoState.questionsLeft <= 0) {
        document.getElementById('chat-input').placeholder = "Limite de perguntas atingido. Não é possível enviar mais.";
        document.getElementById('chat-input').disabled = true;
        document.getElementById('chat-send-button').disabled = true;
    } else {
         document.getElementById('chat-input').placeholder = "Sua pergunta...";
         document.getElementById('chat-input').disabled = false;
         updateSendButtonState();
    }
}

function updateSendButtonState() {
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('chat-send-button');
    sendButton.disabled = input.value.trim() === '' || patolindoState.questionsLeft <= 0;
}

async function handleChatSend() {
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('chat-send-button');
    const userMessage = input.value.trim();

    if (userMessage === '') return;
    if (patolindoState.questionsLeft <= 0) return;

    appendMessage(userMessage, 'user');
    input.value = ''; // Limpa o input
    sendButton.disabled = true;

    // Adiciona a mensagem do usuário ao histórico
    patolindoState.history.push({ role: "user", content: userMessage });

    const currentTrilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const context = currentTrilha ? `O usuário está estudando o tema: ${currentTrilha.tema}, Nível: ${currentTrilha.nivel}.` : `O usuário não está em nenhuma trilha ativa.`;

    const chatSystemPrompt = `Você é o Patolindo, um assistente de estudos amigável e focado.
    Seu objetivo é responder a perguntas do usuário para sanar dúvidas imediatas.
    Contexto Atual do Usuário: ${context}
    
    Regras:
    1. Seja breve, direto e prestativo.
    2. Use **negrito** (Markdown) para destacar conceitos-chave.
    3. Mantenha o tom informal e de suporte.
    4. Você tem um limite de 5 perguntas por sessão. Responda a pergunta atual e, se for uma das 5 permitidas, avise o usuário quantas restam.
    5. O histórico da conversa é: ${JSON.stringify(patolindoState.history)}
    `;

    try {
        const answer = await fetchAIResponse(chatSystemPrompt, userMessage, false);

        if (answer) {
            // Verifica se a resposta foi baseada em uma das 5 perguntas permitidas (para evitar decremento em respostas de erro ou contextuais)
            if (patolindoState.history.filter(m => m.role === 'user').length <= 5) {
                // Se foi uma das perguntas que consome o limite
                appendMessage(`Patolindo: ${answer} (Restam ${patolindoState.questionsLeft - 1} perguntas)`, 'bot');
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


// ===================================================
// LÓGICA DO POMODORO CUSTOMIZÁVEL (INTEGRAÇÃO NOVA)
// ===================================================

let timer;
let isRunning = false;
let isWorkTime = true;
let sessionsCompleted = 0;
let timeRemaining = 25 * 60; // 25 minutos em segundos

// Configurações Padrão
let pomodoroConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionCount: 4
};

// Referências de Elementos
const pomodoroButton = document.getElementById('pomodoro-button');
const pomodoroModal = document.getElementById('pomodoro-modal');
const configModal = document.getElementById('config-modal');
const timerDisplay = document.getElementById('timer-display');
const statusDisplay = document.getElementById('pomodoro-status');
const startPauseBtn = document.getElementById('start-pause-btn');

// --- Funções de Controle do Modal ---
function openPomodoroModal() {
    pomodoroModal.style.display = 'flex';
}

function closePomodoroModal() {
    pomodoroModal.style.display = 'none';
    closeConfigModal(); // Fecha a config se estiver aberta
}

function openConfigModal() {
    // Carrega os valores atuais para os campos do modal
    document.getElementById('work-duration').value = pomodoroConfig.workDuration;
    document.getElementById('short-break-duration').value = pomodoroConfig.shortBreakDuration;
    document.getElementById('long-break-duration').value = pomodoroConfig.longBreakDuration;
    document.getElementById('session-count').value = pomodoroConfig.sessionCount;
    configModal.style.display = 'flex';
}

function closeConfigModal() {
    configModal.style.display = 'none';
}

function saveConfig() {
    const work = parseInt(document.getElementById('work-duration').value);
    const shortBreak = parseInt(document.getElementById('short-break-duration').value);
    const longBreak = parseInt(document.getElementById('long-break-duration').value);
    const count = parseInt(document.getElementById('session-count').value);

    // Atualiza as configurações
    pomodoroConfig = {
        workDuration: work > 0 ? work : 25,
        shortBreakDuration: shortBreak > 0 ? shortBreak : 5,
        longBreakDuration: longBreak > 0 ? longBreak : 15,
        sessionCount: count > 0 ? count : 4
    };

    // Reseta o timer para aplicar a nova duração de FOCO
    resetTimer(true);
    closeConfigModal();
}


// --- Funções Principais do Timer ---

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    // Atualiza o título da página com o tempo restante
    document.title = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds} - Quackademy`; 
}

function startPauseTimer() {
    if (isRunning) {
        clearInterval(timer);
        startPauseBtn.textContent = 'Retomar';
        isRunning = false;
    } else {
        isRunning = true;
        startPauseBtn.textContent = 'Pausar';
        timer = setInterval(tick, 1000);
    }
}

function resetTimer(keepSession = false) {
    clearInterval(timer);
    isRunning = false;
    startPauseBtn.textContent = 'Iniciar';
    timerDisplay.style.color = 'var(--color-primary-dark)';
    
    // Se for reset por mudança de config, não reseta o contador de sessões
    if (!keepSession) {
        isWorkTime = true;
        sessionsCompleted = 0;
    }
    
    statusDisplay.textContent = 'Foco';
    timeRemaining = pomodoroConfig.workDuration * 60;
    updateDisplay();
}

function switchMode() {
    // Para o timer atual
    clearInterval(timer);
    
    if (isWorkTime) {
        sessionsCompleted++;
        
        // Verifica se é hora da Pausa Longa
        if (sessionsCompleted % pomodoroConfig.sessionCount === 0) {
            statusDisplay.textContent = 'Pausa Longa';
            timeRemaining = pomodoroConfig.longBreakDuration * 60;
            timerDisplay.style.color = 'var(--color-success)'; 
            // Notificação
            new Audio('https://s3.amazonaws.com/media.samplefocus.com/sfx/f26fae3d231548e69784366a50e58832.mp3').play();
            alert('⏰ Hora da Pausa Longa! Você completou ' + sessionsCompleted + ' sessões de foco.');
        } else {
            statusDisplay.textContent = 'Pausa Curta';
            timeRemaining = pomodoroConfig.shortBreakDuration * 60;
            timerDisplay.style.color = '#007bff'; // Azul para Pausa Curta
            // Notificação
            new Audio('https://s3.amazonaws.com/media.samplefocus.com/sfx/f26fae3d231548e69784366a50e58832.mp3').play();
            alert('☕ Hora da Pausa Curta!');
        }
        isWorkTime = false;
    } else {
        // Volta para o Foco
        statusDisplay.textContent = 'Foco';
        timeRemaining = pomodoroConfig.workDuration * 60;
        isWorkTime = true;
        timerDisplay.style.color = 'var(--color-primary-dark)';
        // Notificação
        new Audio('https://s3.amazonaws.com/media.samplefocus.com/sfx/f26fae3d231548e69784366a50e58832.mp3').play();
    }
    
    // Inicia o próximo modo automaticamente (ou aguarda se estiver pausado)
    startPauseTimer(); 
}

function tick() {
    timeRemaining--;
    if (timeRemaining < 0) {
        switchMode(); // Mudar para o próximo modo
    } else {
        updateDisplay();
    }
}

// Inicialização e Listeners
document.addEventListener('DOMContentLoaded', () => {
    // (O restante do código de inicialização original já está acima)
    
    // Inicializa a exibição do Pomodoro na primeira carga
    updateDisplay(); 
    
    // Adiciona o listener para o botão do Pomodoro
    pomodoroButton.addEventListener('click', openPomodoroModal);
});

// Listener para fechar o modal clicando fora (melhora a usabilidade)
window.onclick = function(event) {
    if (event.target == pomodoroModal) {
        closePomodoroModal();
    }
    if (event.target == configModal) {
        // Permite fechar apenas o modal de config se clicar fora
        closeConfigModal();
    }
}
