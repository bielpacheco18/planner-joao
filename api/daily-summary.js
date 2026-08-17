// Job diário (Vercel Cron): conta as aberturas do link no dia anterior e envia
// um e-mail de resumo via EmailJS. Configurado em vercel.json.

const SUPABASE_URL = "https://dudkonsmprvzmzrejaan.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZGtvbnNtcHJ2em16cmVqYWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MjE0NDgsImV4cCI6MjA5OTA5NzQ0OH0.zslpCQMCFiLd4BrX-uH1fTvSE7d7GTbdG43dZ6cPyRE";

const EMAILJS_SERVICE_ID = "service_2n5ag1a";
const EMAILJS_TEMPLATE_ID = "template_r83cgt3";
const EMAILJS_PUBLIC_KEY = "bWTyWHWxUemuQ60B7";

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

        const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                accessToken: process.env.EMAILJS_PRIVATE_KEY,
                template_params: {
                    to_email: DAILY_SUMMARY_EMAIL,
                    date: dateLabel,
                    views_count: viewsCount
                }
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
