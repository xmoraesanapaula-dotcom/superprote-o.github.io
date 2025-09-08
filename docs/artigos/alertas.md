# Alertas Instantâneos

O sistema de **Alertas Instantâneos** do Super Proteção é projetado para notificar você em tempo real sobre qualquer atividade que necessite de sua atenção.

## Configuração

Para receber alertas, você precisa configurar um ou mais canais de notificação. Atualmente, suportamos:

* E-mail
* SMS
* Webhooks
* Integrações (Slack, Telegram)

## Tipos de Alerta

Você pode customizar quais eventos irão gerar um alerta. Os mais comuns são:

* `login_suspeito`: Tentativa de login de um IP ou dispositivo desconhecido.
* `falha_multiplas_tentativas`: Múltiplas tentativas de login falhas em um curto período.
* `alteracao_sensivel`: Mudança de e-mail, senha ou configurações de segurança da conta.
