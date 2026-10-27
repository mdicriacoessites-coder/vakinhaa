// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  nitro: {
    preset: process.env.NITRO_PRESET || (process.env.VERCEL ? "vercel" : "vercel"),
  },
  vite: {
    plugins: [
      {
        name: "promisse-api-middleware",
        configureServer(server) {
          const sourceBanner = "C:/Users/User/.gemini/antigravity-ide/brain/3410f5bc-f293-429c-a985-6fc9df65bd34/.user_uploaded/media_1792890392966.jpg";
          const destBanner = path.resolve(process.cwd(), "public/banner-principal.jpg");
          try {
            if (fs.existsSync(sourceBanner) && !fs.existsSync(destBanner)) {
              fs.copyFileSync(sourceBanner, destBanner);
            }
          } catch (e) {
            console.error("Erro ao copiar banner:", e);
          }

          server.middlewares.use(async (req, res, next) => {
            if (req.url === "/banner-principal.jpg") {
              if (fs.existsSync(destBanner)) {
                res.setHeader("Content-Type", "image/jpeg");
                fs.createReadStream(destBanner).pipe(res);
                return;
              } else if (fs.existsSync(sourceBanner)) {
                res.setHeader("Content-Type", "image/jpeg");
                fs.createReadStream(sourceBanner).pipe(res);
                return;
              }
            }

            // Rota para criar cobrança PIX
            if (req.url === "/api/promisse/pix" && req.method === "POST") {
              let raw = "";
              req.on("data", (chunk) => {
                raw += chunk;
              });
              req.on("end", async () => {
                try {
                  const body = JSON.parse(raw || "{}");
                  const amount = Math.round(Number(body.amount || 20) * 100);
                  const apiKey =
                    process.env.PROMISSE_API_KEY ||
                    "sk_live_FpKSi1ejC/mJoQdUCjsIw5md/y2Fb8ozL1Zb9xzukkewmuR4bq5r5jXC5lqAjq/ww4CbhRGl6anwe3TU3LDpGw==";

                  console.log(`[PromissePay] Criando transação PIX: R$ ${(amount / 100).toFixed(2)} (${amount} centavos)`);

                  let promisseRes = await fetch("https://api.promisse.com.br/transactions", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": apiKey.trim(),
                    },
                    body: JSON.stringify({ amount }),
                  });

                  if (promisseRes.status === 401 && !apiKey.startsWith("Bearer ")) {
                    promisseRes = await fetch("https://api.promisse.com.br/transactions", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey.trim()}`,
                      },
                      body: JSON.stringify({ amount }),
                    });
                  }

                  const text = await promisseRes.text();
                  console.log(`[PromissePay] Resposta da API (${promisseRes.status}):`, text);

                  res.setHeader("Content-Type", "application/json; charset=utf-8");
                  res.statusCode = promisseRes.status;
                  res.end(text);
                } catch (err: any) {
                  console.error("[PromissePay] Erro interno:", err);
                  res.setHeader("Content-Type", "application/json; charset=utf-8");
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err?.message || "Erro interno de conexão" }));
                }
              });
              return;
            }

            // Rota para consultar status da transação
            if (req.url?.startsWith("/api/promisse/status/") && req.method === "GET") {
              const txId = req.url.replace("/api/promisse/status/", "");
              const apiKey =
                process.env.PROMISSE_API_KEY ||
                "sk_live_FpKSi1ejC/mJoQdUCjsIw5md/y2Fb8ozL1Zb9xzukkewmuR4bq5r5jXC5lqAjq/ww4CbhRGl6anwe3TU3LDpGw==";

              try {
                let promisseRes = await fetch(`https://api.promisse.com.br/transactions/${encodeURIComponent(txId)}`, {
                  method: "GET",
                  headers: {
                    "Authorization": apiKey.trim(),
                  },
                });

                if (promisseRes.status === 401 && !apiKey.startsWith("Bearer ")) {
                  promisseRes = await fetch(`https://api.promisse.com.br/transactions/${encodeURIComponent(txId)}`, {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${apiKey.trim()}`,
                    },
                  });
                }

                const text = await promisseRes.text();
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.statusCode = promisseRes.status;
                res.end(text);
              } catch (err: any) {
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err?.message || "Erro ao consultar" }));
              }
              return;
            }

            next();
          });
        },
      },
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
