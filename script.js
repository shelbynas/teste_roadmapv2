// ===================================================
// ARQUIVO: script.js (FINAL - Com Botão de Chat na Geração)
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
    document.getElementById("welcome-screen").style.display = 'flex'; // Garante que a primeira tela esteja visível

    // Adiciona listeners para os botões de transição
    document.getElementById("btnWelcomeContinue").addEventListener("click", showExplanationScreen);
    document.getElementById("btnExplanationContinue").addEventListener("click", showMainApp);
    
    // Listener do botão principal
    document.getElementById("btnGerar").addEventListener("click", gerarRoadmap);
});

function showExplanationScreen() {
    document.getElementById("welcome-screen").style.display = 'none';
    document.getElementById("explanation-screen").style.display = 'flex';
}

function showMainApp() {
    document.getElementById("explanation-screen").style.display = 'none';
    document.getElementById("main-app").style.display = 'block';
}


// --- LÓGICA DO ROADMAP (Funções Complexas Inalteradas) ---

// --- 1. FUNÇÃO PRINCIPAL: GERAR ROADMAP (8 ETAPAS E URLS OBRIGATÓRIAS) ---
async function gerarRoadmap() {
    const tema = document.getElementById("tema").value;
    const nivel = document.getElementById("nivel").value;
    const objetivo = document.getElementById("objetivo").value;
    const roadmapDiv = document.getElementById("roadmap");
    roadmapDiv.innerHTML = "✨ Gerando roadmap...";

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
