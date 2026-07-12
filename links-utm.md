# Links com UTM para divulgação

Use estes links (em vez do link puro do site) em cada canal. A origem
aparecerá automaticamente no lead — no e-mail, no Supabase e na mensagem
de WhatsApp — no lugar de "Direto".

## Instagram

- **Bio (link fixo do perfil):**
  `https://planner-joao.vercel.app/?utm_source=instagram&utm_medium=bio`
- **Stories:**
  `https://planner-joao.vercel.app/?utm_source=instagram&utm_medium=stories`
- **Post no feed:**
  `https://planner-joao.vercel.app/?utm_source=instagram&utm_medium=post`
- **Anúncio pago (Ads):**
  `https://planner-joao.vercel.app/?utm_source=instagram&utm_medium=cpc&utm_campaign=NOME_DA_CAMPANHA`

## LinkedIn

- **Post:**
  `https://planner-joao.vercel.app/?utm_source=linkedin&utm_medium=post`
- **Perfil/destaque:**
  `https://planner-joao.vercel.app/?utm_source=linkedin&utm_medium=perfil`
- **Mensagem direta (DM):**
  `https://planner-joao.vercel.app/?utm_source=linkedin&utm_medium=dm`

## WhatsApp

- **Status:**
  `https://planner-joao.vercel.app/?utm_source=whatsapp&utm_medium=status`
- **Mensagem direta:**
  `https://planner-joao.vercel.app/?utm_source=whatsapp&utm_medium=dm`
- **Grupo:**
  `https://planner-joao.vercel.app/?utm_source=whatsapp&utm_medium=grupo`

## Indicação

- **Link genérico para pedir a quem indica:**
  `https://planner-joao.vercel.app/?utm_source=indicacao&utm_medium=referral`

## E-mail (se enviar campanhas)

`https://planner-joao.vercel.app/?utm_source=email&utm_medium=campanha&utm_campaign=NOME_DA_CAMPANHA`

---

## Como funciona

- `utm_source` = de onde veio (instagram, linkedin, whatsapp, indicacao...)
- `utm_medium` = qual formato/lugar (bio, stories, post, dm...)
- `utm_campaign` = opcional, para marcar uma campanha específica (ex: `promo_julho`)

Troque `NOME_DA_CAMPANHA` pelo nome real quando for rodar uma campanha
específica (ex: `black_friday`, `webinar_agosto`).

## Encurtadores (opcional)

Como esses links ficam longos, você pode encurtá-los com um serviço como
bit.ly antes de colocar na bio do Instagram — o encurtador não afeta a
captura do UTM, pois ele redireciona para a URL completa.
