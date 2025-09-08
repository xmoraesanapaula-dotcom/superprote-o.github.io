# Boas Práticas de Segurança

A segurança é uma responsabilidade compartilhada. A **Super Proteção** investe fortemente em proteger seus dados, mas a segurança da sua integração também depende de como você gerencia suas credenciais e implementa sua aplicação.  

Este guia apresenta as práticas essenciais que você deve adotar ao integrar com nossa plataforma, com exemplos práticos em código.  

---

## 1. Gerenciamento de Credenciais

Suas **chaves de API** e **segredos de webhook** funcionam como senhas de administrador para sua conta. É fundamental protegê-los.  

### Armazenamento Seguro

**Errado (inseguro):**  
```js
// Nunca faça isso
const apiKey = "sp_sk_chaveSecretaColocadaNoCodigo";
````

**Certo (seguro, usando variáveis de ambiente):**

```js
// .env
SUPERPROTECAO_API_KEY=sp_sk_chaveSecretaReal
```

```js
// index.js
const apiKey = process.env.SUPERPROTECAO_API_KEY;
```

Em produção, prefira armazenar as credenciais em serviços de gerenciamento de segredos, como **AWS Secrets Manager**, **HashiCorp Vault** ou **GCP Secret Manager**.

---

## 2. Proteção de Endpoints de Webhook

Seu **endpoint de webhook** é uma porta de entrada crítica para sua aplicação.

### Validação de Assinatura

Exemplo em **Node.js (Express)**:

```js
const crypto = require("crypto");
const express = require("express");
const app = express();

const webhookSecret = process.env.SUPERPROTECAO_WEBHOOK_SECRET;

// Middleware para capturar o corpo cru
app.use(express.raw({ type: "application/json" }));

app.post("/webhook", (req, res) => {
  const signatureHeader = req.get("X-Protecao-Signature");

  if (!verificarAssinatura(signatureHeader, req.body)) {
    return res.status(400).send("Assinatura inválida");
  }

  // Coloque o evento em uma fila para processamento assíncrono
  salvarEventoNaFila(req.body);

  res.sendStatus(200);
});

function verificarAssinatura(signatureHeader, payload) {
  const [timestampPart, signaturePart] = signatureHeader.split(",");
  const timestamp = timestampPart.split("=")[1];
  const signature = signaturePart.split("=")[1];

  const data = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac("sha256", webhookSecret);
  const expectedSignature = hmac.update(data).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Processamento Assíncrono

Em vez de processar o webhook diretamente no endpoint, armazene-o em uma **fila** (ex.: **RabbitMQ**, **Kafka**, **AWS SQS**) ou em um banco de dados para processamento posterior.

Exemplo simples usando uma **fila em memória**:

```js
const fila = [];

function salvarEventoNaFila(evento) {
  fila.push(evento);
  console.log("Evento salvo na fila:", evento.id);
}
```

---

## 3. Lógica de Aplicação Segura

### Idempotência

Use o campo `id` do evento para garantir que ele não será processado duas vezes.

```js
const eventosProcessados = new Set();

function processarEvento(evento) {
  if (eventosProcessados.has(evento.id)) {
    console.log("Evento duplicado ignorado:", evento.id);
    return;
  }

  eventosProcessados.add(evento.id);

  // Continue com a lógica de negócio
  console.log("Processando evento:", evento.id);
}
```

### Tratamento de Erros da API

Exemplo em **Node.js com Axios**:

```js
const axios = require("axios");

async function buscarEventos() {
  try {
    const resposta = await axios.get("https://api.superprotecao.com/v1/eventos", {
      headers: { Authorization: `Bearer ${process.env.SUPERPROTECAO_API_KEY}` }
    });
    return resposta.data;
  } catch (erro) {
    if (erro.response) {
      console.error("Erro da API:", erro.response.data);
    } else {
      console.error("Erro inesperado:", erro.message);
    }
  }
}
```

---

## Checklist Rápido de Segurança

| Verificação                                      | Feito? |
| ------------------------------------------------ | :----: |
| Chaves de API estão fora do código-fonte?        |    ☐   |
| Endpoints de Webhook usam HTTPS?                 |    ☐   |
| A validação de assinatura de webhook está ativa? |    ☐   |
| A aplicação responde rapidamente com `200 OK`?   |    ☐   |
| A lógica de negócio é colocada em uma fila?      |    ☐   |
| A aplicação lida com erros `4xx` e `5xx` da API? |    ☐   |

---

## Conclusão

Seguir essas práticas garante que sua integração com a **Super Proteção** seja não apenas funcional, mas também **resiliente, confiável e segura**.

Além disso, adotar exemplos práticos como variáveis de ambiente, validação de assinatura e filas de processamento ajudará a prevenir falhas e aumentar a robustez do seu sistema.
