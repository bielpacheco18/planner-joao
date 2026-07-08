// Configurações Globais
const WHATSAPP_NUMBER = "5511939525332";
const ADMIN_PASSWORD = "admin"; // Senha para acessar o painel de leads no site

// Credenciais do projeto Supabase (armazenamento centralizado dos leads)
const SUPABASE_URL = "https://dudkonsmprvzmzrejaan.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZGtvbnNtcHJ2em16cmVqYWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MjE0NDgsImV4cCI6MjA5OTA5NzQ0OH0.zslpCQMCFiLd4BrX-uH1fTvSE7d7GTbdG43dZ6cPyRE";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Credenciais do EmailJS (notificação automática por e-mail ao assessor)
const EMAILJS_PUBLIC_KEY = "bWTyWHWxUemuQ60B7";
const EMAILJS_SERVICE_ID = "service_2n5ag1a";
const EMAILJS_TEMPLATE_ID = "template_2yynbd8";
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// Inicialização e Monitoramento da Rota Admin por Hash
window.addEventListener("DOMContentLoaded", () => {
    checkHashRoute();
    toggleCnpjFields();
});

window.addEventListener("hashchange", () => {
    checkHashRoute();
});

// Seleção interativa nos grids de opções (cards)
function selectCard(inputId, value) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    inputEl.value = value;

    const gridId = inputId + "-grid";
    const gridEl = document.getElementById(gridId);
    if (!gridEl) return;

    const cards = gridEl.querySelectorAll(".selector-card");
    cards.forEach(card => {
        if (card.textContent.trim() === value ||
            card.getAttribute("onclick").includes(value)) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    });

    // Se o grid tiver opção "Outro", mostra/esconde o campo de texto livre correspondente
    const otherInput = document.getElementById(inputId + "-other");
    if (otherInput) {
        if (value === "Outro") {
            otherInput.style.display = "block";
        } else {
            otherInput.style.display = "none";
            otherInput.value = "";
        }
    }
}

// Mostra os campos de PJ (banco, investimentos, holding) só quando há CNPJ ou interesse nele
function toggleCnpjFields() {
    const cnpjValue = document.getElementById("f-cnpj").value;
    const cnpjFields = document.getElementById("f-cnpj-fields");
    cnpjFields.style.display = cnpjValue === "Não faz sentido pra mim hoje" ? "none" : "flex";
}

// Formatação do número de telefone em tempo real: (XX) XXXXX-XXXX
function formatPhone(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 6) {
        input.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
        input.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
        input.value = `(${value}`;
    } else {
        input.value = "";
    }
}

// Formatação do CPF em tempo real: 000.000.000-00
function formatCPF(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 9) {
        input.value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
    } else if (value.length > 6) {
        input.value = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
    } else if (value.length > 3) {
        input.value = `${value.substring(0, 3)}.${value.substring(3)}`;
    } else {
        input.value = value;
    }
}

// Formatação da data de nascimento em tempo real: dd/mm/aaaa
function formatBirthDate(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 8) value = value.substring(0, 8);

    if (value.length > 4) {
        input.value = `${value.substring(0, 2)}/${value.substring(2, 4)}/${value.substring(4)}`;
    } else if (value.length > 2) {
        input.value = `${value.substring(0, 2)}/${value.substring(2)}`;
    } else {
        input.value = value;
    }
}

// Lê os campos do formulário e monta o lead + mensagem de WhatsApp
function collectLeadData() {
    const name = document.getElementById("f-name").value;
    const cpf = document.getElementById("f-cpf").value;
    const birth = document.getElementById("f-birth").value;
    const email = document.getElementById("f-email").value;
    const phone = document.getElementById("f-phone").value;
    const investAdvisor = document.getElementById("f-invest-advisor").value;
    const alignment = document.getElementById("f-alignment").value;
    const cnpj = document.getElementById("f-cnpj").value;
    const pjShowingFields = cnpj !== "Não faz sentido pra mim hoje";
    const pjInstitutionRaw = document.getElementById("f-pj-institution").value;
    const pjInstitution = pjShowingFields
        ? (pjInstitutionRaw === "Outro" ? document.getElementById("f-pj-institution-other").value : pjInstitutionRaw)
        : "N/A";
    const pjInvests = pjShowingFields ? document.getElementById("f-pj-invests").value : "N/A";
    const pjHolding = pjShowingFields ? document.getElementById("f-pj-holding").value : "N/A";
    const accumulate = document.getElementById("f-accumulate").value;
    const income = document.getElementById("f-income").value;
    const invested = document.getElementById("f-invested").value;
    const institutionRaw = document.getElementById("f-institution").value;
    const institution = institutionRaw === "Outro" ? document.getElementById("f-institution-other").value : institutionRaw;
    const risk = document.getElementById("f-risk").value;
    const goals = document.getElementById("f-goals").value || "Não informado";

    const extra = `CPF: ${cpf} | Nascimento: ${birth} | Já investe: ${investAdvisor} | ` +
                  `Estratégia alinhada: ${alignment} | CNPJ/Estrutura: ${cnpj} | ` +
                  `Banco PJ: ${pjInstitution} | Investimentos PJ: ${pjInvests} | Holding: ${pjHolding} | ` +
                  `Sabe quanto acumular: ${accumulate} | Contas: ${institution} | ` +
                  `Perfil: ${risk} | Objetivos: ${goals}`;

    const leadData = {
        date: new Date().toLocaleString("pt-BR"),
        type: "Completo",
        name,
        email,
        phone,
        income,
        invested,
        extra
    };

    const messageText = `*Novo Planejamento Financeiro - João Maximiliano*\n\n` +
                  `👤 *Nome:* ${name}\n` +
                  `🆔 *CPF:* ${cpf}\n` +
                  `🎂 *Nascimento:* ${birth}\n` +
                  `📧 *E-mail:* ${email}\n` +
                  `📱 *WhatsApp:* ${phone}\n` +
                  `📊 *Já investe:* ${investAdvisor}\n` +
                  `🧭 *Estratégia alinhada:* ${alignment}\n` +
                  `💼 *CNPJ/Estrutura:* ${cnpj}\n` +
                  (pjShowingFields ?
                    `🏦 *Banco PJ:* ${pjInstitution}\n` +
                    `📈 *Investimentos PJ:* ${pjInvests}\n` +
                    `🏛️ *Holding:* ${pjHolding}\n`
                  : "") +
                  `🎯 *Sabe quanto acumular:* ${accumulate}\n` +
                  `💰 *Renda Mensal:* ${income}\n` +
                  `📈 *Total Investido:* ${invested}\n` +
                  `🏦 *Bancos/Corretoras:* ${institution}\n` +
                  `🛡️ *Perfil de Risco:* ${risk}\n` +
                  `🎯 *Objetivos:* ${goals}`;

    return { leadData, messageText };
}

// Seletores obrigatórios (id do hidden input + rótulo amigável para a mensagem de erro).
// Os campos PJ (f-pj-*) são validados à parte, pois só são obrigatórios quando visíveis.
const REQUIRED_SELECTORS = [
    ["f-invest-advisor", "Hoje você já investe com algum banco ou assessor?"],
    ["f-alignment", "Sua estratégia atual está alinhada com seus objetivos de vida?"],
    ["f-cnpj", "Você tem empresa (CNPJ) ou estrutura patrimonial?"],
    ["f-accumulate", "Você sabe quanto precisa acumular para seus objetivos?"],
    ["f-income", "Qual é a sua Renda Mensal aproximada?"],
    ["f-invested", "Quanto você possui investido hoje?"],
    ["f-institution", "Onde você possui conta atualmente?"],
    ["f-risk", "Como se considera em relação a riscos?"]
];

// Confere se os campos obrigatórios do formulário estão preenchidos antes de qualquer ação
function validateForm() {
    const formEl = document.getElementById("full-form");
    const invalidField = formEl.querySelector(":invalid");
    if (invalidField) {
        invalidField.reportValidity();
        invalidField.focus();
        return false;
    }

    for (const [id, label] of REQUIRED_SELECTORS) {
        if (!document.getElementById(id).value) {
            alert(`Por favor, selecione uma opção para: "${label}"`);
            document.getElementById(id + "-grid").scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
        }
    }

    const cnpjValue = document.getElementById("f-cnpj").value;
    if (cnpjValue !== "Não faz sentido pra mim hoje") {
        const pjSelectors = [
            ["f-pj-institution", "Em qual banco ou corretora sua empresa (PJ) tem conta?"],
            ["f-pj-invests", "Já possui investimentos pela pessoa jurídica (PJ)?"],
            ["f-pj-holding", "Já possui holding constituída?"]
        ];
        for (const [id, label] of pjSelectors) {
            if (!document.getElementById(id).value) {
                alert(`Por favor, selecione uma opção para: "${label}"`);
                document.getElementById(id + "-grid").scrollIntoView({ behavior: "smooth", block: "center" });
                return false;
            }
        }
    }

    if (document.getElementById("f-institution").value === "Outro" && !document.getElementById("f-institution-other").value.trim()) {
        alert('Por favor, informe o nome do banco/corretora em "Onde você possui conta atualmente?"');
        document.getElementById("f-institution-other").focus();
        return false;
    }

    if (cnpjValue !== "Não faz sentido pra mim hoje" &&
        document.getElementById("f-pj-institution").value === "Outro" &&
        !document.getElementById("f-pj-institution-other").value.trim()) {
        alert('Por favor, informe o nome do banco/corretora PJ em "Em qual banco ou corretora sua empresa (PJ) tem conta?"');
        document.getElementById("f-pj-institution-other").focus();
        return false;
    }

    return true;
}

// IDs de todos os seletores do formulário, usados para limpar o estado ao resetar
const ALL_SELECTOR_IDS = [
    "f-invest-advisor", "f-alignment", "f-cnpj",
    "f-pj-institution", "f-pj-invests", "f-pj-holding",
    "f-accumulate", "f-income", "f-invested", "f-institution", "f-risk"
];

// Reseta o formulário e os seletores para o estado vazio (nenhuma opção pré-selecionada)
function resetForm() {
    document.getElementById("full-form").reset();
    ALL_SELECTOR_IDS.forEach(id => {
        document.getElementById(id).value = "";
        document.querySelectorAll(`#${id}-grid .selector-card`).forEach(card => card.classList.remove("active"));
    });
    document.getElementById("f-institution-other").style.display = "none";
    document.getElementById("f-pj-institution-other").style.display = "none";
    toggleCnpjFields();
}

// Ação independente: abrir o WhatsApp com a mensagem pronta (não salva nem envia e-mail)
function sendByWhatsapp() {
    if (!validateForm()) return;

    const { messageText } = collectLeadData();
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

    // Abrir IMEDIATAMENTE, ainda no mesmo gesto de clique do usuário — navegadores
    // mobile (Safari/iOS, in-app browsers) bloqueiam window.open() após qualquer await.
    const whatsappWindow = window.open(whatsappUrl, "_blank");

    resetForm();

    if (!whatsappWindow || whatsappWindow.closed) {
        const fallback = confirm(
            "Não conseguimos abrir o WhatsApp automaticamente (o navegador bloqueou). Clique OK para abrir o link manualmente."
        );
        if (fallback) {
            window.location.href = whatsappUrl;
        }
    } else {
        alert("Confira a nova aba do WhatsApp e clique em enviar para falar com o assessor.");
    }
}

// Ação independente: salvar o lead no Supabase e notificar o assessor por e-mail (não mexe no WhatsApp)
async function sendByEmail() {
    if (!validateForm()) return;

    const { leadData } = collectLeadData();

    await Promise.all([saveLead(leadData), sendLeadEmail(leadData)]);

    resetForm();

    alert("Obrigado pelo preenchimento! Seus dados foram enviados para o assessor por e-mail.");
}

// Lógica para Salvar Lead
async function saveLead(lead) {
    const { error } = await supabaseClient.from("leads").insert([lead]);
    if (error) {
        console.error("Erro ao salvar lead no Supabase:", error);
        alert("Não foi possível salvar seus dados agora. Tente novamente em instantes.");
    }
}

// Notificação automática por e-mail ao assessor (via EmailJS)
async function sendLeadEmail(lead) {
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            lead_type: lead.type,
            lead_name: lead.name,
            lead_email: lead.email,
            lead_phone: lead.phone,
            lead_income: lead.income,
            lead_invested: lead.invested,
            lead_extra: lead.extra,
            lead_date: lead.date
        });
    } catch (error) {
        console.error("Erro ao enviar e-mail de notificação via EmailJS:", error);
    }
}

// Roteamento para a área de Admin
function checkHashRoute() {
    if (window.location.hash === "#admin") {
        checkAdminRoute();
    } else {
        exitAdmin();
    }
}

function checkAdminRoute() {
    const isLogged = sessionStorage.getItem("admin_logged") === "true";
    if (isLogged) {
        showAdminPanel();
    } else {
        document.getElementById("auth-modal").style.display = "flex";
        document.getElementById("admin-password").focus();
    }
}

function closeAuthModal() {
    document.getElementById("auth-modal").style.display = "none";
    window.location.hash = "";
}

function handleAuthKeyDown(event) {
    if (event.key === "Enter") {
        submitAuth();
    }
}

function submitAuth() {
    const passwordInput = document.getElementById("admin-password").value;
    if (passwordInput === ADMIN_PASSWORD) {
        sessionStorage.setItem("admin_logged", "true");
        document.getElementById("auth-modal").style.display = "none";
        window.location.hash = "#admin";
        showAdminPanel();
    } else {
        alert("Senha incorreta!");
        document.getElementById("admin-password").value = "";
    }
}

function showAdminPanel() {
    document.getElementById("main-container").style.display = "none";
    document.getElementById("admin-container").style.display = "flex";
    loadLeadsTable();
}

function exitAdmin() {
    document.getElementById("admin-container").style.display = "none";
    document.getElementById("main-container").style.display = "flex";
    if (window.location.hash === "#admin") {
        window.location.hash = "";
    }
}

// Carregar a tabela de leads (Buscando do Supabase)
async function loadLeadsTable() {
    const tbody = document.getElementById("leads-tbody");
    const countEl = document.getElementById("lead-count");

    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary);">Carregando leads...</td></tr>`;

    const { data: leads, error } = await supabaseClient
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao buscar leads do Supabase:", error);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary);">Erro ao carregar leads.</td></tr>`;
        return;
    }

    countEl.textContent = leads.length;
    tbody.innerHTML = "";

    if (leads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary);">Nenhum lead cadastrado ainda.</td></tr>`;
        return;
    }

    leads.forEach(lead => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${lead.date}</td>
            <td><span class="badge ${lead.type === "Rápido" ? "quick" : "full"}">${lead.type}</span></td>
            <td style="font-weight: 600; color: #fff;">${lead.name}</td>
            <td><a href="https://wa.me/${lead.phone.replace(/\D/g, "")}" target="_blank" style="color: var(--gold); text-decoration: none;"><i class="fa-brands fa-whatsapp"></i> ${lead.phone}</a></td>
            <td>${lead.email}</td>
            <td>${lead.income}</td>
            <td>${lead.invested}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${lead.extra}">${lead.extra}</td>
            <td>
                <button class="btn-delete-lead" onclick="deleteLead(${lead.id})" title="Excluir Lead"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Excluir um único lead
async function deleteLead(id) {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
        const { error } = await supabaseClient.from("leads").delete().eq("id", id);
        if (error) {
            console.error("Erro ao excluir lead no Supabase:", error);
            alert("Não foi possível excluir o lead agora.");
        }
        loadLeadsTable();
    }
}

// Limpar todos os leads
async function clearLeads() {
    if (confirm("Tem certeza que deseja apagar TODOS os leads cadastrados? Esta ação não pode ser desfeita.")) {
        const { error } = await supabaseClient.from("leads").delete().gt("id", 0);
        if (error) {
            console.error("Erro ao limpar leads no Supabase:", error);
            alert("Não foi possível limpar os leads agora.");
        }
        loadLeadsTable();
    }
}

// Exportar leads para CSV
function exportLeads() {
    const tableRows = document.querySelectorAll("#leads-tbody tr");
    if (tableRows.length === 0 || tableRows[0].textContent.includes("Nenhum lead")) {
        alert("Não há leads para exportar.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM para suporte a acentos no Excel
    csvContent += "Data;Tipo;Nome;WhatsApp;Email;Renda;Investido;Informações Adicionais\n";

    // Pegamos direto do DOM atualizado
    tableRows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length < 8) return;
        const date = cols[0].textContent;
        const type = cols[1].textContent;
        const name = cols[2].textContent;
        const phone = cols[3].textContent;
        const email = cols[4].textContent;
        const income = cols[5].textContent;
        const invested = cols[6].textContent;
        const extra = cols[7].getAttribute("title") || cols[7].textContent;

        const csvRow = [
            date,
            type,
            name,
            phone,
            email,
            income,
            invested,
            extra.replace(/;/g, ",") // Evitar quebrar colunas
        ].join(";");
        csvContent += csvRow + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_planilha_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Exportar leads para PDF
function exportLeadsPDF() {
    const tableRows = document.querySelectorAll("#leads-tbody tr");
    if (tableRows.length === 0 || tableRows[0].textContent.includes("Nenhum lead")) {
        alert("Não há leads para exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });

    const head = [["Data", "Tipo", "Nome", "WhatsApp", "E-mail", "Renda", "Investido", "Informações Adicionais"]];
    const body = [];

    tableRows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length < 8) return;
        body.push([
            cols[0].textContent,
            cols[1].textContent,
            cols[2].textContent,
            cols[3].textContent,
            cols[4].textContent,
            cols[5].textContent,
            cols[6].textContent,
            cols[7].getAttribute("title") || cols[7].textContent
        ]);
    });

    doc.setFontSize(14);
    doc.text("Leads Cadastrados - João Maximiliano Consultoria", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 21);

    doc.autoTable({
        head,
        body,
        startY: 26,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 30, 30] }
    });

    doc.save(`leads_${new Date().toISOString().slice(0,10)}.pdf`);
}
