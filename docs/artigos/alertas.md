# Alertas Instantâneos

O sistema de **Alertas Instantâneos** do **Super Proteção** é projetado para notificar o usuário em tempo real sobre qualquer atividade que exija atenção imediata.  

Esses alertas garantem que possíveis ameaças sejam detectadas rapidamente, permitindo que ações preventivas ou corretivas sejam tomadas sem atraso.  

Os alertas são enviados por múltiplos canais e podem ser configurados de acordo com a necessidade de cada usuário ou organização, oferecendo **flexibilidade, resiliência e confiabilidade**.  

---

## Configuração

Para receber alertas, é necessário configurar previamente os canais de notificação desejados. Atualmente, o sistema suporta:  

- **E-mail:** Notificações enviadas para endereços de e-mail autorizados.  
- **SMS:** Mensagens curtas enviadas para números de telefone cadastrados.  
- **Webhooks:** Chamadas automáticas para URLs específicas, integrando com outros sistemas.  
- **Integrações:** Compatibilidade com serviços de mensagens como **Slack** e **Telegram**.  

A configuração é realizada no **Painel de Controle**, dentro da seção **Alertas**, onde é possível:  

- Ativar ou desativar canais de comunicação.  
- Definir contatos principais e secundários.  
- Ajustar regras de prioridade (exemplo: enviar SMS apenas em casos críticos).  

---

## Tipos de Alerta

O sistema permite customizar quais eventos devem disparar notificações.  

Eventos mais comuns:  

- **`login_suspeito`** – Tentativa de login a partir de um IP, localização ou dispositivo não reconhecido.  
- **`falha_multiplas_tentativas`** – Diversas tentativas de login falhas em curto período, sugerindo ataque de força bruta.  
- **`alteracao_sensivel`** – Alterações críticas de conta, como troca de senha, alteração de e-mail ou mudança nas configurações de segurança.  
- **`bloqueio_automatico`** – Usuário bloqueado automaticamente após exceder o limite de tentativas de acesso.  
- **`acesso_novo_dispositivo`** – Login realizado a partir de um dispositivo nunca utilizado anteriormente.  
- **`token_revogado`** – Um token de autenticação foi invalidado manualmente ou por política de segurança.  

---

## Níveis de Prioridade

Cada alerta pode ser classificado em um nível de prioridade:  

- **Informativo:** Eventos de rotina que não exigem ação imediata (exemplo: login válido em novo dispositivo autorizado).  
- **Atenção:** Situações que podem indicar comportamento suspeito e exigem monitoramento (exemplo: várias falhas de login em sequência).  
- **Crítico:** Incidentes que requerem resposta imediata (exemplo: alteração não autorizada em configurações de segurança).  

### Exemplo de configuração por prioridade:
- **Informativo → apenas e-mail.**  
- **Atenção → e-mail + Slack/Telegram.**  
- **Crítico → SMS + Webhook + Integração em tempo real.**  

---

## Exemplos de Notificações

### Exemplo em E-mail

```

Assunto: Alerta de Segurança - Tentativa de Login Suspeita

Detectamos uma tentativa de login suspeita em sua conta.

Data/Hora: 2025-09-07 21:10:22 (UTC)
Usuário: [joao@example.com](mailto:joao@example.com)
IP: 45.112.33.90
Localização: São Paulo, Brasil
Status: Tentativa de login falhou

Se não foi você, recomendamos alterar sua senha imediatamente.

````

### Exemplo em JSON (para Webhook)

```json
{
  "evento": "login_suspeito",
  "data": "2025-09-07T21:10:22Z",
  "usuario": "joao@example.com",
  "ip": "45.112.33.90",
  "localizacao": "São Paulo, Brasil",
  "status": "falha"
}
````

---

## Boas Práticas

* Configurar múltiplos canais para **redundância**.
* Utilizar **Webhooks** para integração com sistemas de monitoramento em tempo real.
* Definir diferentes contatos para alertas **informativos** e **críticos**.
* Revisar periodicamente a lista de contatos e canais ativos.
* Ativar **relatórios complementares** para acompanhar tendências dos alertas.
* Testar regularmente os canais para garantir que estão funcionando corretamente.

---

## Futuras Melhorias

* Suporte a **push notifications** em aplicativos móveis.
* Integração com **Microsoft Teams** e outros sistemas corporativos.
* Inteligência de contexto: correlação de eventos para evitar falsos positivos.
* Central de alertas dentro do painel, com **histórico completo, filtros avançados e relatórios exportáveis**.
