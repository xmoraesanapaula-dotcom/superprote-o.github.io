# Alertas
Versão: v1.7.0

O Super Proteção envia notificações em tempo real quando atividades suspeitas ou eventos importantes são detectados.  
Esses alertas ajudam você a **agir rápido** e manter a segurança da sua infraestrutura.

## 📌 Tipos de alertas
- **Críticos** ⚠️ → eventos graves que exigem atenção imediata (ex.: tentativas de invasão).  
- **Avisos** ℹ️ → situações anômalas que podem se tornar problemas (ex.: login fora do horário normal).  
- **Informativos** 📢 → atualizações gerais do sistema (ex.: atualização de software concluída).

## 📡 Canais suportados
Você pode configurar múltiplos canais para receber os alertas:
- **E-mail** → útil para registros formais.  
- **Telegram** → velocidade e simplicidade.  
- **Slack** → ideal para times de TI e suporte.  
- **WhatsApp** → canal para alertas críticos e imediatos.

## 🛠️ Configuração básica
1. Acesse o painel de configurações.  
2. Escolha o canal desejado (ex.: WhatsApp).  
3. Informe o token/chave de API fornecido pelo serviço.  
4. Salve e faça um **teste de envio**.

## 📑 Estrutura de um alerta
Um alerta possui sempre os seguintes campos:

| Campo    | Tipo     | Exemplo                                  |
|----------|----------|------------------------------------------|
| tipo     | string   | `"crítico"`, `"aviso"`, `"informativo"` |
| mensagem | string   | `"Acesso não autorizado detectado"`      |
| hora     | datetime | `"2025-09-08 14:35:22"`                  |
| origem   | string   | `"servidor-web-01"`                      |

## 📤 Exemplo de alerta em JSON
```json
{
  "tipo": "crítico",
  "mensagem": "Acesso não autorizado detectado no servidor X",
  "hora": "2025-09-08 14:35:22",
  "origem": "servidor-web-01"
}
