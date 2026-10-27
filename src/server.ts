import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// ────────────────────────────────────────────────────────────
// Discord Webhook Notification Helper
// ────────────────────────────────────────────────────────────
async function sendDiscordNotification(payload: {
  event: "pix_generated" | "payment_confirmed" | "payment_failed" | "unknown";
  transactionId?: string;
  amountInReais?: number;
  pixCode?: string;
  status?: string;
  rawBody?: unknown;
}): Promise<void> {
  const webhookUrl =
    process.env.DISCORD_WEBHOOK_URL ||
    process.env.VITE_DISCORD_WEBHOOK_URL ||
    "https://discord.com/api/webhooks/1564752151077716148/i9y3d1rfJqQ-GKiOus4uL9GlDuzfN1yA2eaRgKURAQpO54BJo6f02IkIyHLVk857Vh2Z";

  if (!webhookUrl) {
    console.warn("[Discord] DISCORD_WEBHOOK_URL não configurada — notificação ignorada.");
    return;
  }

  const isPixGenerated = payload.event === "pix_generated";
  const isPaid = payload.event === "payment_confirmed";
  const isFailed = payload.event === "payment_failed";

  const color = isPaid ? 0x00c853 : isPixGenerated ? 0x2979ff : isFailed ? 0xff1744 : 0x9e9e9e;

  const eventLabel = isPaid
    ? "✅ Pagamento Confirmado"
    : isPixGenerated
    ? "🔔 PIX Gerado"
    : isFailed
    ? "❌ Pagamento Falhou"
    : "📋 Evento Recebido";

  const amountStr =
    payload.amountInReais != null
      ? `R$ ${Number(payload.amountInReais).toFixed(2)}`
      : "—";

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    { name: "Evento", value: eventLabel, inline: true },
    { name: "Valor", value: amountStr, inline: true },
  ];

  if (payload.transactionId) {
    fields.push({ name: "ID da Transação", value: `\`${payload.transactionId}\``, inline: false });
  }
  if (payload.status) {
    fields.push({ name: "Status", value: payload.status, inline: true });
  }
  if (payload.pixCode) {
    const shortCode = payload.pixCode.length > 60
      ? payload.pixCode.slice(0, 60) + "…"
      : payload.pixCode;
    fields.push({ name: "Código PIX (início)", value: `\`${shortCode}\``, inline: false });
  }

  const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const discordBody = {
    username: "PromissePay Bot",
    avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
    embeds: [
      {
        title: `${eventLabel} — Abrigo Patas da Esperança`,
        color,
        fields,
        footer: { text: `PromissePay Webhook • ${now}` },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordBody),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[Discord] Falha ao enviar notificação:", res.status, text);
    } else {
      console.log("[Discord] Notificação enviada com sucesso:", payload.event);
    }
  } catch (err) {
    console.error("[Discord] Erro ao enviar webhook para Discord:", err);
  }
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Endpoint server-side do PIX da PromissePay (Evita CORS e protege chave)
    if (url.pathname === "/api/promisse/pix" && request.method === "POST") {
      try {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const rawAmount = body?.amount ?? body?.value;
        const parsedAmount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount || ""));
        const amountInReais = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : 20;
        const amountInCents = Math.round(amountInReais * 100);
        const apiKey =
          process.env.PROMISSE_API_KEY ||
          "sk_live_FpKSi1ejC/mJoQdUCjsIw5md/y2Fb8ozL1Zb9xzukkewmuR4bq5r5jXC5lqAjq/ww4CbhRGl6anwe3TU3LDpGw==";

        let promisseRes = await fetch("https://api.promisse.com.br/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": apiKey.trim(),
          },
          body: JSON.stringify({ amount: amountInCents }),
        });

        if (promisseRes.status === 401 && !apiKey.startsWith("Bearer ")) {
          promisseRes = await fetch("https://api.promisse.com.br/transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey.trim()}`,
            },
            body: JSON.stringify({ amount: amountInCents }),
          });
        }

        const data = await promisseRes.json();

        // Notifica Discord: PIX gerado
        const txId = String(data.transaction?.id || data.id || "");
        const pixCode =
          data.copyPaste ||
          data.pixCopiaECola ||
          data.pix_code ||
          data.copy_paste ||
          data.emv ||
          data.qr_code ||
          "";
        if (promisseRes.ok) {
          sendDiscordNotification({
            event: "pix_generated",
            transactionId: txId || undefined,
            amountInReais: amountInReais,
            pixCode: pixCode || undefined,
            status: data.status || data.transaction?.status || undefined,
          }).catch(() => { /* não bloquear a resposta */ });
        }

        return new Response(JSON.stringify(data), {
          status: promisseRes.status,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
          },
        });
      } catch (err: any) {
        console.error("Erro no backend PromissePay /api/promisse/pix:", err);
        return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }
    }

    // Endpoint server-side de consulta de status na PromissePay
    if (url.pathname.startsWith("/api/promisse/status/") && request.method === "GET") {
      const txId = url.pathname.replace("/api/promisse/status/", "");
      const apiKey =
        process.env.PROMISSE_API_KEY ||
        "sk_live_FpKSi1ejC/mJoQdUCjsIw5md/y2Fb8ozL1Zb9xzukkewmuR4bq5r5jXC5lqAjq/ww4CbhRGl6anwe3TU3LDpGw==";

      try {
        const promisseRes = await fetch(`https://api.promisse.com.br/transactions/${encodeURIComponent(txId)}`, {
          method: "GET",
          headers: {
            "Authorization": apiKey.trim(),
          },
        });
        const data = await promisseRes.json();
        return new Response(JSON.stringify(data), {
          status: promisseRes.status,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || "Erro ao consultar" }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }
    }

    // ────────────────────────────────────────────────────────────────────────
    // Webhook da PromissePay → recebe notificações de pagamento/PIX gerado
    // Configure esta URL no painel da PromissePay como destino do webhook:
    //   https://seu-dominio.com/api/webhook/promisse
    // ────────────────────────────────────────────────────────────────────────
    if (url.pathname === "/api/webhook/promisse") {
      // Responder OPTIONS (CORS preflight)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "Content-Type, Authorization, X-Signature",
          },
        });
      }

      if (request.method === "POST") {
        try {
          const rawBody = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          console.log("[Webhook PromissePay] Payload recebido:", JSON.stringify(rawBody));

          // Normaliza campos comuns
          const rawEvent = String(
            rawBody.event ||
            rawBody.type ||
            rawBody.status ||
            (rawBody.data as any)?.status ||
            (rawBody.data as any)?.event ||
            (rawBody.transaction as any)?.status ||
            ""
          ).toLowerCase();

          const txId = String(
            rawBody.id ||
            rawBody.transaction_id ||
            (rawBody.data as any)?.id ||
            (rawBody.data as any)?.transaction_id ||
            (rawBody.transaction as any)?.id ||
            (rawBody.data as any)?.transaction?.id ||
            ""
          );

          // Extrai o valor procurando em qualquer nível do payload
          const rawAmount =
            rawBody.amount ??
            rawBody.value ??
            (rawBody.data as any)?.amount ??
            (rawBody.data as any)?.value ??
            (rawBody.transaction as any)?.amount ??
            (rawBody.transaction as any)?.value ??
            (rawBody.data as any)?.transaction?.amount ??
            (rawBody.data as any)?.transaction?.value;

          let amountReais: number | undefined;
          if (rawAmount != null) {
            const num = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount).replace(",", "."));
            if (!isNaN(num) && num > 0) {
              // Na PromissePay valores inteiros >= 100 são centavos (ex: 2000 = R$ 20, 3500 = R$ 35, 10000 = R$ 100)
              amountReais = Number.isInteger(num) && num >= 100 ? num / 100 : num;
            }
          }

          const pixCode = String(
            rawBody.copyPaste ||
            rawBody.pix_code ||
            rawBody.copy_paste ||
            rawBody.emv ||
            (rawBody.data as any)?.copyPaste ||
            (rawBody.data as any)?.pix_code ||
            (rawBody.transaction as any)?.copyPaste ||
            ""
          );

          const status = String(
            rawBody.status ||
            (rawBody.data as any)?.status ||
            (rawBody.transaction as any)?.status ||
            rawEvent ||
            ""
          );

          // Determina tipo do evento
          let eventType: "pix_generated" | "payment_confirmed" | "payment_failed" | "unknown" = "unknown";
          if (/paid|approved|confirmed|success|completed/i.test(rawEvent) || /paid|approved|confirmed|success|completed/i.test(status)) {
            eventType = "payment_confirmed";
          } else if (/pix.*gen|created|pending|waiting|generated/i.test(rawEvent) || /pending|waiting|created/i.test(status)) {
            eventType = "pix_generated";
          } else if (/fail|error|cancel|reject/i.test(rawEvent) || /fail|error|cancel|reject/i.test(status)) {
            eventType = "payment_failed";
          }

          // Envia para o Discord (sem bloquear a resposta)
          sendDiscordNotification({
            event: eventType,
            transactionId: txId || undefined,
            amountInReais: amountReais || undefined,
            pixCode: pixCode || undefined,
            status: status || event || undefined,
            rawBody,
          }).catch(() => { /* não bloquear */ });

          return new Response(JSON.stringify({ received: true, event: eventType }), {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "access-control-allow-origin": "*",
            },
          });
        } catch (err: any) {
          console.error("[Webhook PromissePay] Erro ao processar payload:", err);
          return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
            status: 500,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
