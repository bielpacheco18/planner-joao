// Configurações Globais
const WHATSAPP_NUMBER = "5511939525332";
const ADMIN_PASSWORD = "admin"; // Senha para acessar o painel de leads no site

// Credenciais do projeto Supabase (armazenamento centralizado dos leads)
const SUPABASE_URL = "https://dudkonsmprvzmzrejaan.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZGtvbnNtcHJ2em16cmVqYWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MjE0NDgsImV4cCI6MjA5OTA5NzQ0OH0.zslpCQMCFiLd4BrX-uH1fTvSE7d7GTbdG43dZ6cPyRE";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Inicialização e Monitoramento da Rota Admin por Hash
window.addEventListener("DOMContentLoaded", () => {
    checkHashRoute();
});

window.addEventListener("hashchange", () => {
    checkHashRoute();
});

// Alternância entre abas
function switchForm(type) {
    const tabQuick = document.getElementById("tab-quick");
    const tabFull = document.getElementById("tab-full");
    const formQuick = document.getElementById("quick-form");
    const formFull = document.getElementById("full-form");

    if (type === "quick") {
        tabQuick.classList.add("active");
        tabFull.classList.remove("active");
        formQuick.classList.add("active");
        formFull.classList.remove("active");
    } else {
        tabQuick.classList.remove("active");
        tabFull.classList.add("active");
        formQuick.classList.remove("active");
        formFull.classList.add("active");
    }
}

// Controle do formulário multi-etapas (Cadastro Rápido)
const QUICK_TOTAL_STEPS = 4;
let quickCurrentStep = 1;

function changeStep(direction) {
    const currentStepEl = document.getElementById(`quick-step-${quickCurrentStep}`);

    if (direction > 0) {
        const invalidField = currentStepEl.querySelector(":invalid");
        if (invalidField) {
            currentStepEl.reportValidity ? currentStepEl.reportValidity() : invalidField.reportValidity();
            invalidField.focus();
            return;
        }
    }

    const nextStep = quickCurrentStep + direction;
    if (nextStep < 1 || nextStep > QUICK_TOTAL_STEPS) return;

    currentStepEl.style.display = "none";
    currentStepEl.classList.remove("active");

    quickCurrentStep = nextStep;
    const nextStepEl = document.getElementById(`quick-step-${quickCurrentStep}`);
    nextStepEl.style.display = "block";
    nextStepEl.classList.add("active");

    updateQuickStepUI();
}

function updateQuickStepUI() {
    const progressBar = document.getElementById("quick-progress-bar");
    const progressText = document.getElementById("quick-progress-text");
    const prevBtn = document.getElementById("q-prev-btn");
    const nextBtn = document.getElementById("q-next-btn");
    const submitBtn = document.getElementById("q-submit-btn");

    progressBar.style.width = `${(quickCurrentStep / QUICK_TOTAL_STEPS) * 100}%`;
    progressText.textContent = `Passo ${quickCurrentStep} de ${QUICK_TOTAL_STEPS}`;

    prevBtn.style.display = quickCurrentStep > 1 ? "inline-flex" : "none";
    nextBtn.style.display = quickCurrentStep < QUICK_TOTAL_STEPS ? "block" : "none";
    submitBtn.style.display = quickCurrentStep === QUICK_TOTAL_STEPS ? "block" : "none";
}

function resetQuickSteps() {
    for (let i = 1; i <= QUICK_TOTAL_STEPS; i++) {
        const stepEl = document.getElementById(`quick-step-${i}`);
        stepEl.style.display = i === 1 ? "block" : "none";
        stepEl.classList.toggle("active", i === 1);
    }
    quickCurrentStep = 1;
    updateQuickStepUI();
}

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

// Envio do formulário
async function handleFormSubmit(event, type) {
    event.preventDefault();
    
    let leadData = {};
    let messageText = "";

    if (type === "quick") {
        const name = document.getElementById("q-name").value;
        const email = document.getElementById("q-email").value;
        const phone = document.getElementById("q-phone").value;
        const income = document.getElementById("q-income").value;
        const invested = document.getElementById("q-invested").value;
        const institution = document.getElementById("q-institution").value || "Não informado";

        leadData = {
            date: new Date().toLocaleString("pt-BR"),
            type: "Rápido",
            name,
            email,
            phone,
            income,
            invested,
            extra: `Contas: ${institution}`
        };

        messageText = `*Novo Lead - João Maximiliano Consultoria*\n\n` +
                      `👤 *Nome:* ${name}\n` +
                      `📧 *E-mail:* ${email}\n` +
                      `📱 *WhatsApp:* ${phone}\n` +
                      `💰 *Renda Mensal:* ${income}\n` +
                      `📈 *Total Investido:* ${invested}\n` +
                      `🏦 *Bancos/Corretoras:* ${institution}`;
    } else {
        const name = document.getElementById("f-name").value;
        const email = document.getElementById("f-email").value;
        const phone = document.getElementById("f-phone").value;
        const income = document.getElementById("f-income").value;
        const invested = document.getElementById("f-invested").value;
        const institution = document.getElementById("f-institution").value || "Não informado";
        const risk = document.getElementById("f-risk").value;
        const goals = document.getElementById("f-goals").value || "Não informado";

        leadData = {
            date: new Date().toLocaleString("pt-BR"),
            type: "Completo",
            name,
            email,
            phone,
            income,
            invested,
            extra: `Contas: ${institution} | Perfil: ${risk} | Objetivos: ${goals}`
        };

        messageText = `*Novo Planejamento Financeiro - João Maximiliano*\n\n` +
                      `👤 *Nome:* ${name}\n` +
                      `📧 *E-mail:* ${email}\n` +
                      `📱 *WhatsApp:* ${phone}\n` +
                      `💰 *Renda Mensal:* ${income}\n` +
                      `📈 *Total Investido:* ${invested}\n` +
                      `🏦 *Bancos/Corretoras:* ${institution}\n` +
                      `🛡️ *Perfil de Risco:* ${risk}\n` +
                      `🎯 *Objetivos:* ${goals}`;
    }

    // Gerar link do WhatsApp e abrir IMEDIATAMENTE, ainda no mesmo gesto de clique do usuário.
    // Navegadores mobile (Safari/iOS, in-app browsers) bloqueiam window.open() se ele
    // acontecer depois de um await — por isso isso vem antes de salvar no Supabase.
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank");

    // Salvar lead no Supabase (não bloqueia a abertura do WhatsApp)
    await saveLead(leadData);

    // Limpar formulários
    event.target.reset();

    // Resetar seletores para o padrão active
    if (type === "quick") {
        selectCard('q-income', 'De R$ 5.000 a R$ 10.000');
        selectCard('q-invested', 'De R$ 300 mil a R$ 1 milhão');
        resetQuickSteps();
    } else {
        selectCard('f-income', 'R$ 15.000 a R$ 30.000');
        selectCard('f-invested', 'R$ 300.000 a R$ 1 Milhão');
        selectCard('f-risk', 'Moderado');
    }

    if (!whatsappWindow || whatsappWindow.closed) {
        // Popup bloqueado: oferecer o link diretamente para o usuário clicar
        const fallback = confirm(
            "Não conseguimos abrir o WhatsApp automaticamente (o navegador bloqueou). Clique OK para abrir o link manualmente."
        );
        if (fallback) {
            window.location.href = whatsappUrl;
        }
    } else {
        alert("Obrigado pelo preenchimento! Confira a nova aba do WhatsApp e clique em enviar para falar com o assessor.");
    }
}

// Lógica para Salvar Lead
async function saveLead(lead) {
    const { error } = await supabaseClient.from("leads").insert([lead]);
    if (error) {
        console.error("Erro ao salvar lead no Supabase:", error);
        alert("Não foi possível salvar seus dados agora. Tente novamente em instantes.");
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
