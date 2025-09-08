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
