// ===================================================
// ARQUIVO: script.js (Completo e Aprimorado com Transição Mobile)
// ===================================================

const API_KEY = "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"; // ⬅️ SUA CHAVE DA GROQ
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; // MODELO CORRETO E ATIVO

let modalState = {}; 

// --- CONTROLE DE FLUXO DA INTERFACE ---

document.addEventListener("DOMContentLoaded", () => {
    // Esconde todas as telas e mostra a primeira
    document.getElementById("explanation-screen").style.display = 'none';
    document.getElementById("main-app").style.display = 'none';
    document.getElementById("welcome-screen").style.display = 'flex'; 

    // Adiciona listeners para os botões de transição
    document.getElementById("btnWelcomeContinue").addEventListener("click", showExplanationScreen);
    document.getElementById("btnExplanationContinue").addEventListener("click", showMainApp);
    
    // Listener do botão principal e do novo botão mobile
    document.getElementById("btnGerar").addEventListener("click", gerarRoadmap);
    document.getElementById("btnGerarMobile").addEventListener("click", scrollToForm); 
});

function showExplanationScreen() {
    document.getElementById("welcome-screen").style.display = 'none';
    document.getElementById("explanation-screen").style.display = 'flex';
}

function showMainApp() {
    document.getElementById("explanation-screen").style.display = 'none';
    document.getElementById("main-app").style.display = 'block';
}

// *** NOVA FUNÇÃO: Rola para o formulário no mobile ***
function scrollToForm() {
    document.getElementById("main-app").scrollIntoView({ behavior: 'smooth' });
    // Esconde o botão flutuante ao rolar
    document.getElementById("btnGerarMobile").classList.remove('show');
}

// *** NOVA FUNÇÃO: Exibe/Esconde o botão flutuante ***
function toggleMobileButton(show) {
    const btnMobile = document.getElementById("btnGerarMobile");
    // 992px é o breakpoint que usamos no CSS para mobile/tablet
    if (window.innerWidth <= 992) { 
        if (show) {
            btnMobile.classList.add('show');
        } else {
            btnMobile.classList.remove('show');
        }
    }
}


// --- LÓGICA DO ROADMAP (Funções Complexas Inalteradas) ---

// --- 1. FUNÇÃO PRINCIPAL: GERAR ROADMAP (8 ETAPAS E URLS OBRIGATÓRIAS) ---
async function gerarRoadmap() {
    const tema = document.getElementById("tema").value;
    const nivel = document.getElementById("nivel").value;
    const objetivo = document.getElementById("objetivo").value;
    const roadmapDiv = document.getElementById("roadmap");
    roadmapDiv.innerHTML = "✨ Gerando roadmap...";
    toggleMobileButton(false); // Esconde o botão mobile enquanto gera

    if (!tema) {
        roadmapDiv.innerHTML = "⚠️ Por favor, preencha o campo Tema.";
        return;
    }
    
    try {
        // PROMPTS: 8 ETAPAS MÍNIMAS e URLS OBRIGATÓRIAS
        const systemPrompt = `Você é um especialista em educação técnica. Crie um roadmap detalhado com **no mínimo 8 (oito) etapas obrigatórias**. Cada tópico deve ser ultra específico e **DEVE incluir uma URL de documentação oficial ou tutorial renomado** no campo 'material'. Sua única resposta deve ser APENAS JSON válido, sem texto introdutório ou blocos de código markdown. O JSON deve seguir este formato: {"etapas": [{"titulo": "Etapa 1: Nome da etapa", "topicos": [{"tópico": "Nome do tópico", "material": "URL de uma fonte externa"}], "atividade": "Descrição da atividade prática"}]}.`;
        
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

        let textoLimpo = texto.trim();
        let parsed;
        try {
            parsed = JSON.parse(textoLimpo);
        } catch (e) {
            console.warn("JSON direto falhou. Tentando extração robusta.");
            textoLimpo = textoLimpo.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
            const jsonMatch = textoLimpo.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                 console.error("Texto falhou na extração:", texto);
                 throw new Error("Não foi possível extrair JSON da resposta.");
            }
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

        // *** ADICIONADO: MOSTRA O BOTÃO MOBILE APÓS GERAR ***
        toggleMobileButton(true);


    } catch (err) {
        console.error("Erro:", err);
        roadmapDiv.innerHTML = `⚠️ Erro ao gerar roadmap. Causa: ${err.message}.`;
        toggleMobileButton(false); // Garante que não apareça em caso de erro
    }
}

// --- 2. FUNÇÃO: ABRIR MODAL DA ETAPA ---
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

// --- 3. FUNÇÃO: GERAR SIMULADO (5 PERGUNTAS MÍNIMAS) ---
async function gerarSimulado(topico) {
    const modalConteudo = document.getElementById("modal-conteudo");

    modalConteudo.innerHTML = `<p>Carregando simulado sobre: <strong>${topico}</strong>...</p>`;

    try {
        // PROMPT: 5 QUESTÕES MÍNIMAS
        const systemPromptSimulado = `Você é um gerador de questões de múltipla escolha. Sua única resposta deve ser APENAS JSON válido, sem texto introdutório. O JSON deve ser um objeto contendo um array de **5 perguntas**. O formato deve ser: {"simulados": [{"pergunta": "...", "alternativas": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "resposta_correta": "Letra da alternativa correta (ex: C)"}, {"pergunta": "...", ...}]}.`;
        
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

// --- 4. FUNÇÃO: MOSTRAR RESPOSTA DO SIMULADO ---
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


// --- 5. FUNÇÃO: GERAR CONTEÚDO MATERIAL (EXIBE FONTE) ---
async function gerarConteudoMaterial(topico, material) {
    const modalConteudo = document.getElementById("modal-conteudo");
    modalConteudo.innerHTML = `<p>Carregando conteúdo sobre: <strong>${topico}</strong>...</p>`;

    try {
        // PROMPT: Instrução para usar o link e gerar a explicação.
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

        // Conversão simples de Markdown para HTML
        texto = texto.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        texto = texto.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        // CONDIÇÃO PARA EXIBIR A FONTE
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

// --- 6. FUNÇÃO: FECHAR MODAL ---
function fecharModal() {
    document.getElementById("modal").style.display = "none";
}
