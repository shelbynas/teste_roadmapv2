// ===================================================
// JAVASCRIPT INTEGRADO (script.js) - COMPLETO COM MODO PROFESSOR
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
let userMode = "aluno"; // Padrão: modo aluno

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
                tema: "Matemática (6º Ano)", nivel: "Intermediário", objetivo: "Dominar números inteiros, frações e operações básica.",
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

// --- FUNÇÕES DO SISTEMA DE MODO ---

// Inicializar seletor de modo
function initializeModeSelector() {
    const alunoBtn = document.getElementById('btnAlunoMode');
    const professorBtn = document.getElementById('btnProfessorMode');
    
    alunoBtn.addEventListener('click', () => selectMode('aluno'));
    professorBtn.addEventListener('click', () => selectMode('professor'));
}

// Selecionar modo
function selectMode(mode) {
    userMode = mode;
    
    // Atualizar UI dos botões
    const alunoBtn = document.getElementById('btnAlunoMode');
    const professorBtn = document.getElementById('btnProfessorMode');
    
    alunoBtn.classList.toggle('active', mode === 'aluno');
    professorBtn.classList.toggle('active', mode === 'professor');
}

// NOVA: Mostrar tela do modo professor
function showProfessorModeView() {
    hideAllScreens();
    document.getElementById("professor-mode-view").style.display = 'flex';
}

// NOVA: Mostrar resultado do modo professor
function showProfessorResultView() {
    hideAllScreens();
    document.getElementById("professor-result-view").style.display = 'flex';
}

// NOVA: Função para esconder todas as telas
function hideAllScreens() {
    const screens = [
        "login-screen", "welcome-screen", "explanation-screen", 
        "professor-mode-view", "professor-result-view", "main-app"
    ];
    
    screens.forEach(screen => {
        document.getElementById(screen).style.display = 'none';
    });
}

// NOVA: Gerar conteúdo para professores
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
        
        const conteudoGerado = parsed.etapas;
        renderConteudoProfessor(conteudoGerado, tema, nivel);

    } catch (err) {
        console.error("Erro:", err);
        contentContainer.innerHTML = `⚠️ Erro ao gerar conteúdo. Verifique sua chave API e tente novamente. Causa: ${err.message}.`;
    }
}

// NOVA: Renderizar conteúdo do professor
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

// --- MODIFICAÇÃO: Atualizar função showWelcomeScreen para incluir seletor de modo ---
function showWelcomeScreen() {
    document.getElementById("login-screen").style.display = 'none';
    document.getElementById("welcome-screen").style.display = 'flex';
    
    // Resetar para modo aluno como padrão
    selectMode('aluno');
}

// --- MODIFICAÇÃO: Atualizar função showExplanationScreen para considerar o modo ---
function showExplanationScreen() {
    document.getElementById("welcome-screen").style.display = 'none';
    
    // Se for modo professor, vai direto para a tela do professor
    if (userMode === 'professor') {
        showProfessorModeView();
    } else {
        // Modo aluno: segue fluxo normal
        document.getElementById("explanation-screen").style.display = 'flex';
    }
}

// --- MODIFICAÇÃO: Atualizar função showMainApp para considerar o modo ---
function showMainApp(isExistingUser = false) {
    hideAllScreens();
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

// --- MODIFICAÇÃO: Atualizar listener do botão de continuar na tela de boas-vindas ---
document.addEventListener("DOMContentLoaded", () => {
    
    showLoginView(); // Inicia na tela de login

    document.getElementById("login-form").addEventListener("submit", handleAuthSubmit);
    document.getElementById("btnSkipLogin").addEventListener("click", handleSkipLogin);
    
    // 🆕 NOVO: Inicializar seletor de modo
    initializeModeSelector();
    
    document.getElementById("btnWelcomeContinue").addEventListener("click", showExplanationScreen);
    
    // 🆕 NOVO: Listener para o botão do modo professor
    document.getElementById("btnGerarConteudoProfessor").addEventListener("click", gerarConteudoProfessor);
    
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
    
    // Inicializa a posição do pomodoro
    loadPomodoroPosition();
});

// ... (O RESTANTE DO CÓDIGO EXISTENTE PERMANECE IGUAL - funções Pomodoro, flashcards, simulado, chat, etc.)

// ===================================================
// FUNÇÕES EXISTENTES (MANTIDAS SEM ALTERAÇÕES)
// ===================================================

// --- SISTEMA DE ARRASTE DO POMODORO ---
function initializePomodoroDrag() {
    const timer = document.getElementById('pomodoro-floating-timer');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // Adiciona classe para indicar que é arrastável
    timer.classList.add('draggable');

    timer.addEventListener('mousedown', dragStart);
    timer.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        // Só inicia o arraste se clicar no header
        if (e.target.classList.contains('pomodoro-header') || 
            e.target.closest('.pomodoro-header')) {
            isDragging = true;
            timer.classList.add('dragging');
            
            // Previne comportamento padrão do touch
            if (e.type === "touchstart") {
                e.preventDefault();
            }
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        timer.classList.remove('dragging');
        
        // Salva a posição no localStorage
        savePomodoroPosition();
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

function savePomodoroPosition() {
    const timer = document.getElementById('pomodoro-floating-timer');
    const transform = timer.style.transform;
    
    if (transform) {
        localStorage.setItem('pomodoroPosition', transform);
    }
}

function loadPomodoroPosition() {
    const savedPosition = localStorage.getItem('pomodoroPosition');
    const timer = document.getElementById('pomodoro-floating-timer');
    
    if (savedPosition && timer) {
        timer.style.transform = savedPosition;
    }
}

// ... (TODAS AS OUTRAS FUNÇÕES EXISTENTES PERMANECEM EXATAMENTE COMO ESTAVAM)
// Funções Pomodoro, Quick Actions, Persistência, Navegação SPA, Gerenciamento de Trilhas,
// Conteúdo (Roadmap, Material), Flashcards, Simulado, Chatbot Patolindo, etc.
