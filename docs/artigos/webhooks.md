# Webhooks

Os Webhooks são uma maneira poderosa de receber notificações automáticas sobre eventos que acontecem na plataforma **Super Proteção**. Em vez de consultar nossa API repetidamente para verificar se algo novo aconteceu, você pode configurar um endpoint (uma URL no seu servidor) para que *nós* enviemos a informação em tempo real.

Isso é ideal para automação, integrações com outras ferramentas (como Slack ou sistemas de alerta) e para manter seus próprios sistemas sincronizados.

---

## Configuração

Para começar a usar Webhooks, você precisa registrar um novo endpoint no seu Painel de Controle, na seção **Desenvolvedores > Webhooks**.

1.  **URL do Endpoint:** Forneça a URL pública do seu servidor que irá receber os dados. É crucial que esta URL use **HTTPS**.
2.  **Eventos:** Selecione quais eventos você deseja receber. É uma boa prática receber apenas os eventos que sua aplicação realmente precisa.
3.  **Segredo de Assinatura:** Após a criação do endpoint, um "segredo de assinatura" (`whsec_...`) será gerado. Guarde este segredo em segurança. Ele é usado para verificar se as requisições de webhook são realmente da Super Proteção.

---

## Estrutura do Payload

Todos os eventos de webhook são enviados como uma requisição `HTTP POST` com um corpo em formato JSON. A estrutura básica é sempre a mesma:

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
```
 * id: Identificador único do evento.
 * type: O tipo do evento que ocorreu (ex: alerta.critico_gerado, usuario.criado).
 * created: Timestamp de quando o evento foi criado.
 * data.object: O objeto completo relacionado ao evento (por exemplo, o objeto de alerta, o objeto de usuário, etc.).
Segurança: Validando a Assinatura
Qualquer pessoa pode encontrar sua URL de endpoint e enviar dados falsos. Para garantir que cada requisição veio da Super Proteção, você deve validar a assinatura.
Cada requisição de webhook inclui um cabeçalho HTTP especial chamado X-Protecao-Signature. Ele contém um timestamp e uma assinatura HMAC-SHA256 do corpo da requisição, usando seu "segredo de assinatura" como chave.
O processo de validação é:
 * Extraia o timestamp e a assinatura do cabeçalho X-Protecao-Signature.
 * Prepare a string de assinatura, que é o timestamp, um ponto (.), e o corpo exato da requisição recebida. Ex: 1725833315.{"id":"evt_123..."}.
 * Calcule o HMAC-SHA256 da string preparada, usando seu segredo de webhook (whsec_...) como chave.
 * Compare a assinatura que você calculou com a assinatura recebida no cabeçalho. Se forem idênticas, a requisição é legítima.
> Aviso:
> Sempre use uma função de comparação segura contra "timing attacks" ao verificar assinaturas.
> 

Exemplo de Validação em Node.js

```
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
  return crypto.timingSafeEqual(Buffer.from(signature.split('=')[1]), Buffer.from(expectedSignature));
}
```

Respondendo aos Webhooks
Seu endpoint deve responder à requisição de webhook o mais rápido possível com um código de status 200 OK. Se a Super Proteção não receber uma resposta 200 dentro de alguns segundos, consideramos que a entrega falhou e tentaremos reenviar o evento em intervalos de tempo crescentes.
