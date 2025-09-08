# Webhooks da Super Proteção

Os **Webhooks** são uma forma poderosa de receber notificações em tempo real sobre eventos que acontecem na plataforma **Super Proteção**.  

Em vez de consultar nossa API constantemente para verificar se algo novo aconteceu, você pode configurar um **endpoint** (uma URL no seu servidor) e nós enviaremos os dados assim que o evento ocorrer.  

Isso é útil para:  
- Manter seus sistemas sincronizados automaticamente  
- Automatizar fluxos de trabalho  
- Integrar com ferramentas de terceiros (ex: Slack, sistemas de alerta, CRM etc.)  

---

## Configuração do Webhook

Para começar a usar webhooks, siga os passos no seu **Painel de Controle** em **Desenvolvedores > Webhooks**:

1. **URL do Endpoint**  
   - Informe a URL pública do seu servidor que receberá os dados.  
   - Essa URL deve obrigatoriamente usar **HTTPS**.  

2. **Seleção de Eventos**  
   - Escolha apenas os eventos relevantes para sua aplicação (boa prática para evitar tráfego desnecessário).  

3. **Segredo de Assinatura**  
   - Após a criação, será gerado um segredo exclusivo (`whsec_...`).  
   - Armazene-o com segurança — ele será usado para validar a autenticidade das mensagens recebidas.  

---

## Estrutura do Payload

Todos os webhooks são enviados via **`HTTP POST`** com corpo em **JSON**.  

Exemplo de evento:

```json
{
  "id": "evt_123456789",
  "object": "event",
  "api_version": "2025-09-08",
  "created": 1725833315,
  "type": "alerta.critico_gerado",
  "data": {
    "object": {
      "id": "alerta_987654321",
      "evento": "alteracao_sensivel",
      "usuario": "ana@example.com",
      "ip": "201.150.33.40",
      "nivel": "critico"
    }
  }
}
````

### Campos principais

* **id**: Identificador único do evento.
* **type**: Tipo do evento que ocorreu (exemplo: `alerta.critico_gerado`, `usuario.criado`).
* **created**: Data e hora em timestamp de quando o evento foi criado.
* **data.object**: Objeto completo relacionado ao evento (alerta, usuário, etc.).

---

## Segurança: Validando a Assinatura

Qualquer pessoa pode encontrar sua URL de endpoint e tentar enviar dados falsos.
Por isso, cada webhook inclui um cabeçalho especial chamado **`X-Protecao-Signature`**, que contém:

* O timestamp do envio
* A assinatura HMAC-SHA256 do corpo da requisição, usando o **segredo de webhook** (`whsec_...`) como chave

### Processo de validação

1. Extraia o `timestamp` e a `assinatura` do cabeçalho `X-Protecao-Signature`.
2. Monte a string de assinatura:

   ```
   {timestamp}.{corpo_da_requisicao}
   ```

   Exemplo:

   ```
   1725833315.{"id":"evt_123..."}
   ```
3. Calcule o HMAC-SHA256 dessa string, usando seu segredo de webhook.
4. Compare o valor calculado com a assinatura recebida.
5. Se forem iguais, a requisição é legítima.

> Importante: sempre utilize uma função de comparação segura contra **timing attacks**.

---

## Exemplo de Validação em Node.js

```js
const crypto = require('crypto');

// O segredo do seu endpoint de webhook
const webhookSecret = 'whsec_exemploDeSegredo123';

// Função para verificar a assinatura
function verificarAssinatura(req) {
  const signatureHeader = req.get('X-Protecao-Signature');
  const [timestamp, signature] = signatureHeader.split(',');

  // Passo 2: Preparar a string
  const payload = `${timestamp.split('=')[1]}.${req.rawBody}`;

  // Passo 3: Calcular a assinatura esperada
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const expectedSignature = hmac.update(payload).digest('hex');

  // Passo 4: Comparar com segurança
  return crypto.timingSafeEqual(
    Buffer.from(signature.split('=')[1]),
    Buffer.from(expectedSignature)
  );
}
```

---

## Respondendo aos Webhooks

* Seu endpoint deve responder rapidamente com **HTTP 200 OK**.
* Se a Super Proteção não receber essa resposta em alguns segundos, o evento será considerado como falhado.
* Nesse caso, novas tentativas de entrega serão feitas em intervalos progressivos até que seja confirmado o recebimento.

---

## Boas Práticas

* Responda o mais rápido possível (faça apenas validações básicas antes do 200 OK).
* Processe o evento de forma assíncrona em segundo plano, para evitar atrasos.
* Armazene os eventos recebidos em banco de dados para auditoria e reprocessamento.
* Utilize filas de processamento se sua aplicação receber um volume elevado de eventos.
