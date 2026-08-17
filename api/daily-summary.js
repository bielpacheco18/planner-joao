// Job diário (Vercel Cron): conta as aberturas do link no dia anterior e envia
// um e-mail de resumo via Resend. Configurado em vercel.json.

const SUPABASE_URL = "https://dudkonsmprvzmzrejaan.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZGtvbnNtcHJ2em16cmVqYWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MjE0NDgsImV4cCI6MjA5OTA5NzQ0OH0.zslpCQMCFiLd4BrX-uH1fTvSE7d7GTbdG43dZ6cPyRE";

const DAILY_SUMMARY_EMAIL = "Joaopedromaximiliano@gmail.com";
const TIMEZONE = "America/Sao_Paulo";

function getYesterdayRangeUTC() {
    const now = new Date();
    const todayLocalStr = now.toLocaleDateString("en-CA", { timeZone: TIMEZONE }); // YYYY-MM-DD
    const todayLocalMidnightUTC = new Date(`${todayLocalStr}T00:00:00-03:00`);
    const start = new Date(todayLocalMidnightUTC.getTime() - 24 * 60 * 60 * 1000);
    const end = todayLocalMidnightUTC;
    return { start, end, dateLabel: start.toLocaleDateString("pt-BR", { timeZone: TIMEZONE }) };
}

module.exports = async function handler(req, res) {
    try {
        const { start, end, dateLabel } = getYesterdayRangeUTC();

        const countUrl = `${SUPABASE_URL}/rest/v1/page_views?select=id&created_at=gte.${start.toISOString()}&created_at=lt.${end.toISOString()}`;
        const countResponse = await fetch(countUrl, {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                Prefer: "count=exact"
            }
        });

        if (!countResponse.ok) {
            const text = await countResponse.text();
            res.status(500).json({ error: "Falha ao consultar page_views", details: text });
            return;
        }

        const contentRange = countResponse.headers.get("content-range") || "0";
        const viewsCount = parseInt(contentRange.split("/")[1] || "0", 10);

        const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: "Planner João <onboarding@resend.dev>",
                to: [DAILY_SUMMARY_EMAIL],
                subject: `Resumo Diário - ${dateLabel} - ${viewsCount} aberturas do link`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0b0c; color: #ffffff; padding: 30px; border-radius: 12px;">
                        <h2 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Resumo Diário do Link</h2>
                        <p style="color: #a1a1aa; font-size: 13px; margin-top: -5px;">João Maximiliano | Consultoria Financeira</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <tr>
                                <td style="padding: 8px 0; color: #a1a1aa; width: 160px;">Data</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #d4af37;">${dateLabel}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #a1a1aa;">Aberturas do link</td>
                                <td style="padding: 8px 0; font-weight: bold; font-size: 20px; color: #d4af37;">${viewsCount}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(212,175,55,0.2); font-size: 12px; color: #a1a1aa;">
                            Este e-mail foi gerado automaticamente todos os dias pelo site.
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

        res.status(200).json({ ok: true, dateLabel, viewsCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
