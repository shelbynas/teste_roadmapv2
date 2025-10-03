
// ARQUIVO: script.js (CORREÇÃO DE FLUXO DE TELAS)
// ===================================================

// Use a sua chave da Groq aqui
const API_KEY = "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"; 
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; 

let modalState = {}; 

// --- CONTROLE DE FLUXO DA INTERFACE ---

document.addEventListener("DOMContentLoaded", () => {
    // 1. Garante que apenas a welcome-screen esteja inicialmente ativa
    document.getElementById("explanation-screen").classList.add('hidden-screen');
    document.getElementById("main-app").classList.add('hidden-screen');
    document.getElementById("welcome-screen").classList.remove('hidden-screen');
    document.getElementById("welcome-screen").classList.add('active-screen');

    // Transição entre telas de introdução (Slide)
    document.getElementById("btnWelcomeContinue").addEventListener("click", showExplanationScreen);
    document.getElementById("btnExplanationContinue").addEventListener("click", showMainApp);
    
    // Listeners do app principal
    document.getElementById("btnGerar").addEventListener("click", gerarRoadmap);
    document.getElementById("btnToggleForm").addEventListener("click", toggleFormulario);
});

function transitionScreen(currentId, nextId) {
    const currentScreen = document.getElementById(currentId);
    const nextScreen = document.getElementById(nextId);
    
    // 1. Move a tela atual para fora
    currentScreen.classList.remove('active-screen');
    currentScreen.classList.add('hidden-screen');
    
    // 2. Tira a próxima tela do estado 'hidden' e a torna 'active'
    nextScreen.classList.remove('hidden-screen');
    // Adiciona o active com um pequeno delay, garantindo que o hidden seja aplicado primeiro
    setTimeout(() => {
        nextScreen.classList.add('active-screen'); 
    }, 10); // Apenas 10ms é suficiente
}

function showExplanationScreen() {
    transitionScreen('welcome-screen', 'explanation-screen');
}

function showMainApp() {
    // 1. Move a tela de explicação para fora
    const explanationScreen = document.getElementById('explanation-screen');
    explanationScreen.classList.remove('active-screen');
    explanationScreen.classList.add('hidden-screen');
    
    // 2. Remove o main-app do fluxo 'fixed/hidden' para torná-lo um bloco normal
    const mainApp = document.getElementById("main-app");
    mainApp.classList.remove('screen-flow', 'hidden-screen');
    
    // 3. Garante que o main-app apareça (opcional, mas bom para garantir)
    mainApp.style.opacity = 1;
    mainApp.style.pointerEvents = 'auto';

    // Estado inicial do formulário no main-app
    const controlesWrapper = document.getElementById("controles-wrapper");
    if (window.innerWidth >= 993) {
        controlesWrapper.classList.remove('retraido');
        document.getElementById("btnToggleForm").style.display = 'none';
    } else {
        // Começa expandido no mobile, mas com o botão de toggle escondido.
        controlesWrapper.classList.remove('retraido');
        document.getElementById("btnToggleForm").style.display = 'none';
    }
}

// *** FUNÇÃO: Toggle Formulário (Mobile) ***
function toggleFormulario() {
    const wrapper = document.getElementById("controles-wrapper");
    const btn = document.getElementById("btnToggleForm");
    
    const isRetraido = wrapper.classList.toggle('retraido');
    
    if (isRetraido) {
        btn.innerHTML = '⚙️ Abrir Formulário de Desafio';
        // Rola para o topo do wrapper quando retrai no mobile
        if (window.innerWidth < 993) {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        btn.innerHTML = '✅ Fechar Formulário de Desafio';
    }
}


// --- LÓGICA DO ROADMAP (Funcionalidade Inalterada) ---

async function gerarRoadmap() {
    const tema = document.getElementById("tema").value;
    const nivel = document.getElementById("nivel").value;
    const objetivo = document.getElementById("objetivo").value;
    const roadmapDiv = document.getElementById("roadmap");
    const controlesWrapper = document.getElementById("controles-wrapper");
    const btnToggleForm = document.getElementById("btnToggleForm");
    
    roadmapDiv.innerHTML = "✨ Gerando roadmap...";

    if (!tema) {
        roadmapDiv.innerHTML = "⚠️ Por favor, preencha o campo Tema.";
        return;
    }
    
    try {
        // Sua chave da Groq
        const systemPrompt = `Você é um especialista em educação técnica. Crie um roadmap detalhado com **no mínimo 8 (oito) etapas obrigatórias**...`; 
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
            throw new Error(`Erro API: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        let texto = data?.choices?.[0]?.message?.content || "";
        let parsed;
        
        let textoLimpo = texto.trim();
        try {
            parsed = JSON.parse(textoLimpo);
        } catch (e) {
            textoLimpo = textoLimpo.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
            const jsonMatch = textoLimpo.match(/\{[\s\S]*\}/);
            if (!jsonMatch) { throw new Error("Não foi possível extrair JSON da resposta."); }
            parsed = JSON.parse(jsonMatch[0]);
        }
        
        const etapas = parsed.etapas;
        modalState.etapas = etapas; 
        roadmapDiv.innerHTML = "";

        etapas.forEach(etapa => {
            const blocoDiv = document.createElement("div");
            blocoDiv.className = "bloco";
            blocoDiv.innerText = etapa.titulo;
            blocoDiv.onclick = () => abrirModalMateriais(etapa);
            roadmapDiv.appendChild(blocoDiv);
        });

        // *** NOVO FLUXO: RETRAIR O FORMULÁRIO APÓS A GERAÇÃO (MOBILE) ***
        if (window.innerWidth < 993) {
            controlesWrapper.classList.add('retraido');
            btnToggleForm.style.display = 'block';
            btnToggleForm.innerHTML = '⚙️ Alterar Desafio';
            
            // Rola para a trilha gerada
            document.getElementById("roadmap-container").scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
             btnToggleForm.style.display = 'none';
        }


    } catch (err) {
        console.error("Erro:", err);
        roadmapDiv.innerHTML = `⚠️ Erro ao gerar roadmap. Causa: ${err.message}.`;
        
        // Em caso de erro, mantém o formulário expandido
        controlesWrapper.classList.remove('retraido');
        btnToggleForm.style.display = 'none';
    }
}


// --- Funções de Modal, Simulado e Material (Mantidas) ---

function abrirModalMateriais(etapa) {
    modalState.currentEtapa = etapa; 

    document.getElementById("modal").style.display = "block";
    document.getElementById("modal-titulo").innerText = etapa.titulo;

    const conteudo = etapa.topicos.map(t => {
        const topicoEscapado = t.tópico.replace(/'/g,"\\'"); 
        const materialLink = t.material ? t.material : "";

        return `
            <div class="topico-bloco">
                <button class="bloco material-btn" onclick="gerarConteudoMaterial('${topicoEscapado}', '${materialLink}')">${t.tópico}</button>
                <button class="btn-simulado" onclick="gerarSimulado('${topicoEscapado}')">🧠 Gerar Simulado</button>
            </div>
        `;
    }).join("");

    document.getElementById("modal-conteudo").innerHTML = `
        <h3>📌 Atividade prática:</h3>
        <p>${etapa.atividade}</p>
        <h3>📚 Tópicos e Simulado:</h3>
        <div class="topicos-container">${conteudo}</div>
        <div class="modal-actions">
            <button onclick="fecharModal()" class="btn-secondary">❌ Fechar</button>
        </div>
    `;
}

async function gerarSimulado(topico) {
    const modalConteudo = document.getElementById("modal-conteudo");

    modalConteudo.innerHTML = `<p>Carregando simulado sobre: <strong>${topico}</strong>...</p>`;

    try {
        const systemPromptSimulado = `Você é um gerador de questões de múltipla escolha. Sua única resposta deve ser APENAS JSON válido, sem texto introdutório. O JSON deve ser um objeto contendo um array de **5 perguntas**...`;
        
        const userPromptSimulado = `Crie 5 questões de múltipla escolha sobre o tópico "${topico}" no nível ${document.getElementById("nivel").value}. Cada questão deve ter 5 alternativas.`;

        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ 
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: systemPromptSimulado },
                    { role: "user", content: userPromptSimulado }
                ],
                response_format: { type: "json_object" },
                temperature: 0.6 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro API: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        let texto = data?.choices?.[0]?.message?.content || "Erro ao gerar simulado.";

        let parsedData;
        try {
            parsedData = JSON.parse(texto.trim());
        } catch (e) {
            let textoLimpo = texto.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
            const jsonMatch = textoLimpo.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Não foi possível extrair JSON do simulado.");
            parsedData = JSON.parse(jsonMatch[0]);
        }
        
        const simulados = parsedData.simulados || [parsedData]; 
        
        const simuladosHtml = simulados.map((simulado, index) => {
            const alternativasHtml = simulado.alternativas.map((alt) => {
                const letra = alt.charAt(0);
                return `<li class="alternativa" 
                            data-correta="${letra === simulado.resposta_correta.charAt(0)}">
                            ${alt}
                        </li>`;
            }).join("");

            return `
                <div class="simulado-bloco">
                    <h4>Questão ${index + 1}:</h4>
                    <p><strong>${simulado.pergunta}</strong></p>
                    <ul>${alternativasHtml}</ul>
                    <button class="btnVerResposta" onclick="mostrarResposta(this)">Ver Resposta</button>
                    <p class="feedback" style="font-weight: bold; margin-top: 10px;"></p>
                </div>
                <hr>
            `;
        }).join("");

        modalConteudo.innerHTML = `
            <h3>Simulado: ${topico}</h3>
            <div class="simulado-area">
                ${simuladosHtml}
            </div>
            <div class="modal-actions">
                <button onclick="abrirModalMateriais(modalState.currentEtapa)" class="btn-secondary">⬅ Voltar</button>
            </div>
        `;

    } catch (err) {
        console.error("Erro no Simulado:", err);
        modalConteudo.innerHTML = `
            <p>⚠️ Erro ao gerar simulado. Causa: ${err.message}.</p>
            <div class="modal-actions">
              <button onclick="abrirModalMateriais(modalState.currentEtapa)" class="btn-secondary">⬅ Voltar</button>
            </div>
        `;
    }
}

function mostrarResposta(button) {
    const simuladoBloco = button.closest('.simulado-bloco');
    if (!simuladoBloco) return;

    const alternativas = simuladoBloco.querySelectorAll('.alternativa');
    const feedback = simuladoBloco.querySelector('.feedback');

    alternativas.forEach(li => {
        if (li.dataset.correta === 'true') {
            li.style.backgroundColor = '#d4edda';
            li.style.color = '#155724';
        } else {
            li.classList.add('incorreta');
        }
        li.style.cursor = 'default';
    });
    
    button.style.display = 'none';
    if (feedback) {
        feedback.innerText = 'A resposta correta está destacada.';
    }
}

async function gerarConteudoMaterial(topico, material) {
    const modalConteudo = document.getElementById("modal-conteudo");
    modalConteudo.innerHTML = `<p>Carregando conteúdo sobre: <strong>${topico}</strong>...</p>`;

    try {
        const userPromptMaterial = material 
          ? `Explique de forma didática e detalhada o tópico "${topico}" consultando o conteúdo do link: ${material}. A sua resposta deve ser APENAS a explicação, sem mencionar a fonte. Se o link for inacessível ou inválido, gere a explicação baseada em seu conhecimento.`
          : `Explique de forma didática e detalhada o tópico "${topico}".`;

        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ 
                model: MODEL_NAME,
                messages: [
                    { role: "user", content: userPromptMaterial }
                ],
                temperature: 0.8
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro API: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        let texto = data?.choices?.[0]?.message?.content || "Erro ao gerar conteúdo.";

        texto = texto.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        texto = texto.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        let sourceHtml = '';
        if (material && material !== 'null' && material.startsWith('http')) {
            sourceHtml = `
                <h3 style="margin-top: 30px; border-left: 5px solid var(--color-primary); padding-left: 12px;">🔗 Fonte Utilizada</h3>
                <p><a href="${material}" target="_blank">${material}</a></p>
            `;
        }

        modalConteudo.innerHTML = `
            <h3>${topico}</h3>
            <div style="max-height:400px; overflow-y:auto; padding-right:10px;">
                ${texto.split("\n\n").map(p => `<p>${p}</p>`).join("")}
            </div>
            ${sourceHtml} 
            <div class="modal-actions">
                <button onclick="abrirModalMateriais(modalState.currentEtapa)" class="btn-secondary">⬅ Voltar</button>
            </div>
        `;

    } catch (err) {
        console.error("Erro:", err);
        modalConteudo.innerHTML = `
            <p>⚠️ Erro ao gerar conteúdo. Causa: ${err.message}.</p>
            <div class="modal-actions">
                <button onclick="abrirModalMateriais(modalState.currentEtapa)" class="btn-secondary">⬅ Voltar</button>
            </div>
        `;
    }
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}
