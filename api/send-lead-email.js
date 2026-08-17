// Recebe os dados de um novo lead do front-end e notifica o assessor por e-mail via Resend.
// A API key fica só no servidor (variável de ambiente RESEND_API_KEY), nunca exposta no navegador.

const NOTIFY_EMAIL = "Joaopedromaximiliano@gmail.com";

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        const lead = req.body || {};

        const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: "Planner João <onboarding@resend.dev>",
                to: [NOTIFY_EMAIL],
                subject: `Novo Lead - ${lead.type || ""} - ${lead.name || ""}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0c; color: #ffffff; padding: 30px; border-radius: 12px;">
                        <h2 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Novo Lead Recebido</h2>
                        <p style="color: #a1a1aa; font-size: 13px; margin-top: -5px;">João Maximiliano | Consultoria Financeira</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <tr><td style="padding: 8px 0; color: #a1a1aa; width: 140px;">Tipo</td><td style="padding: 8px 0; font-weight: bold; color: #d4af37;">${lead.type || ""}</td></tr>
                            <tr><td style="padding: 8px 0; color: #a1a1aa;">Nome</td><td style="padding: 8px 0; font-weight: bold; color: #d4af37;">${lead.name || ""}</td></tr>
                            <tr><td style="padding: 8px 0; color: #a1a1aa;">E-mail</td><td style="padding: 8px 0; color: #d4af37;">${lead.email || ""}</td></tr>
                            <tr><td style="padding: 8px 0; color: #a1a1aa;">WhatsApp</td><td style="padding: 8px 0; color: #d4af37;">${lead.phone || ""}</td></tr>
                            <tr><td style="padding: 8px 0; color: #a1a1aa;">Renda Mensal</td><td style="padding: 8px 0; color: #d4af37;">${lead.income || ""}</td></tr>
                            <tr><td style="padding: 8px 0; color: #a1a1aa;">Total Investido</td><td style="padding: 8px 0; color: #d4af37;">${lead.invested || ""}</td></tr>
                            <tr><td style="padding: 8px 0; color: #a1a1aa; vertical-align: top;">Detalhes</td><td style="padding: 8px 0; color: #d4af37;">${lead.extra || ""}</td></tr>
                            <tr><td style="padding: 8px 0; color: #a1a1aa;">Data</td><td style="padding: 8px 0; color: #d4af37;">${lead.date || ""}</td></tr>
                        </table>
                        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(212,175,55,0.2); font-size: 12px; color: #a1a1aa;">
                            Este e-mail foi gerado automaticamente pelo formulário do site.
                        </div>
                    </div>
                `
            })
        });

        if (!emailResponse.ok) {
            const text = await emailResponse.text();
            res.status(500).json({ error: "Falha ao enviar e-mail", details: text });
            return;
        }

        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
