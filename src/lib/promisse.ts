export interface GeneratedPixResult {
  id: string;
  pixCode: string;
  qrCodeUrl: string;
  amount: number;
  isRealApi: boolean;
}

/**
 * Cria a transação PIX na PromissePay através do backend local (/api/promisse/pix).
 * Isso garante que o código PIX e QR Code gerados sejam 100% autênticos e válidos no Banco Central.
 */
export async function createPromissePix(amountInReais: number): Promise<GeneratedPixResult> {
  const amount = Number(amountInReais || 20);

  const response = await fetch("/api/promisse/pix", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[PromissePay] Erro retornado pela API:", errorText);

    let parsed = errorText;
    try {
      const j = JSON.parse(errorText);
      parsed = j.message || j.error || j.details || errorText;
    } catch {
      // Ignora erro de parse
    }

    throw new Error(parsed || `Erro ${response.status} ao conectar à PromissePay`);
  }

  const data = await response.json();
  console.log("[PromissePay] Dados recebidos da API:", data);

  const txId = String(data.transaction?.id || data.id || "");

  // Captura o código PIX Copia e Cola oficial do Banco Central gerado pela PromissePay
  const pixCode =
    data.copyPaste ||
    data.pixCopiaECola ||
    data.pix_code ||
    data.copy_paste ||
    data.emv ||
    data.qr_code ||
    (typeof data.qrcode === "string" && !data.qrcode.startsWith("http") && !data.qrcode.startsWith("data:") ? data.qrcode : "");

  // Captura a imagem real do QR Code em Base64 ou URL gerada pela PromissePay
  let qrCodeUrl = "";
  if (data.qrCodeBase64 && typeof data.qrCodeBase64 === "string") {
    qrCodeUrl = data.qrCodeBase64;
  } else if (data.qrcode && typeof data.qrcode === "object" && typeof data.qrcode.image === "string") {
    qrCodeUrl = data.qrcode.image;
  } else if (typeof data.qrcode === "string" && (data.qrcode.startsWith("http") || data.qrcode.startsWith("data:image"))) {
    qrCodeUrl = data.qrcode;
  } else if (pixCode) {
    qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pixCode)}`;
  }

  if (!pixCode) {
    throw new Error("A PromissePay não retornou o código Pix Copia e Cola.");
  }

  return {
    id: txId,
    pixCode,
    qrCodeUrl,
    amount,
    isRealApi: true,
  };
}

/**
 * Consulta o status da transação na PromissePay via backend.
 */
export async function checkPromissePixStatus(transactionId: string): Promise<string> {
  if (!transactionId || transactionId.startsWith("tx_")) {
    return "waiting_payment";
  }

  try {
    const res = await fetch(`/api/promisse/status/${encodeURIComponent(transactionId)}`);
    if (res.ok) {
      const data = await res.json();
      const status = data.transaction?.status || data.status;
      if (status) return String(status).toLowerCase();
    }
  } catch {
    // Ignora erros momentâneos de polling
  }

  return "waiting_payment";
}
