# Relatórios Visuais e Análises

Entender os dados de segurança é fundamental para tomar decisões informadas. Os relatórios da **Super Proteção** são projetados para oferecer uma visão clara e objetiva das atividades em sua conta.

Nesta página, vamos explorar os principais relatórios com textos explicativos e representações visuais para facilitar a análise de tendências, a identificação de anomalias e a auditoria de conformidade.

---

## Relatório Semanal Consolidado

Este relatório agrupa os eventos da última semana, oferecendo uma visão panorâmica da atividade da sua conta. Ele é essencial para identificar padrões, como um aumento inesperado no número de falhas de login, que pode indicar um ataque em andamento.

#### Tabela de Dados

Abaixo estão os dados consolidados da semana.

| Tipo de Evento     | Quantidade |
| ------------------ | ---------- |
| login_ok           | 245        |
| login_falhou       | 32         |
| usuario_criado     | 4          |
| usuario_bloqueado  | 2          |
| login_suspeito     | 6          |

#### Análise Gráfica de Eventos

O gráfico de barras abaixo ilustra a proporção de cada evento. Fica claro que os logins bem-sucedidos são a grande maioria, mas a visualização destaca imediatamente os 32 eventos de falha e os 6 logins suspeitos que merecem atenção.

<svg width="100%" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
    <style>
        .bar { transition: all 0.3s ease; }
        .label { font-family: Inter, sans-serif; font-size: 14px; fill: var(--text-secondary); }
        .bar-label { font-family: Inter, sans-serif; font-size: 14px; font-weight: bold; fill: var(--text-primary); }
        .axis { stroke: var(--secondary-color); stroke-width: 2; }
    </style>
    <line x1="50" y1="250" x2="750" y2="250" class="axis" />

    <rect x="80" y="5" width="100" height="245" fill="#2563eb" class="bar" />
    <text x="130" y="270" text-anchor="middle" class="label">Logins OK</text>
    <text x="130" y="20" text-anchor="middle" class="bar-label">245</text>

    <rect x="220" y="218" width="100" height="32" fill="#f97316" class="bar" />
    <text x="270" y="270" text-anchor="middle" class="label">Falhas Login</text>
    <text x="270" y="213" text-anchor="middle" class="bar-label">32</text>

    <rect x="360" y="246" width="100" height="4" fill="#8b5cf6" class="bar" />
    <text x="410" y="270" text-anchor="middle" class="label">Usuários Criados</text>
    <text x="410" y="241" text-anchor="middle" class="bar-label">4</text>

    <rect x="500" y="248" width="100" height="2" fill="#ef4444" class="bar" />
    <text x="550" y="270" text-anchor="middle" class="label">Bloqueios</text>
    <text x="550" y="243" text-anchor="middle" class="bar-label">2</text>

    <rect x="640" y="244" width="100" height="6" fill="#facc15" class="bar" />
    <text x="690" y="270" text-anchor="middle" class="label">Logins Suspeitos</text>
    <text x="690" y="239" text-anchor="middle" class="bar-label">6</text>
</svg>

---

## Relatório Diário de Atividades

Este é o log detalhado de eventos, útil para investigações forenses e para entender a sequência exata de ações que levaram a um incidente de segurança.

#### Tabela de Eventos com Status Visual

A tabela abaixo foi aprimorada com um indicador visual de status para facilitar a rápida identificação de problemas.

| Data/Hora           | Usuário            | Evento          | IP             | Status   |
| ------------------- | ------------------ | --------------- | -------------- | -------- |
| 2025-09-07 08:12:34 | joao@example.com   | login_ok        | 187.100.55.200 | ✅ Sucesso |
| 2025-09-07 08:15:10 | maria@example.com  | login_falhou    | 200.160.23.45  | ❌ Falha   |
| 2025-09-07 09:01:22 | admin@example.com  | usuario_criado  | 10.0.0.5       | ✅ Sucesso |
| 2025-09-07 09:22:47 | joao@example.com   | login_suspeito  | 45.112.33.90   | ⚠️ Alerta  |

> **Análise de Incidente:**
> O evento de **`login_suspeito`** às 09:22:47 para o usuário `joao@example.com` é um ponto de atenção imediata. Ele ocorreu a partir de um endereço de IP (`45.112.33.90`) diferente do seu login bem-sucedido anterior (`187.100.55.200`). Isso pode indicar uma tentativa de acesso não autorizado e justifica uma investigação mais aprofundada.

---

## Relatório de Auditoria

O relatório de auditoria resume o estado geral da sua conta em relação às políticas de segurança e conformidade. Ele responde à pergunta: "Estamos seguros e em conformidade?".

#### Resumo de Conformidade

Com base nos dados da semana, o sistema apresenta os seguintes resultados de auditoria:

-   **Total de Logins Válidos:** 245
-   **Total de Falhas de Login:** 32
-   **Contas Criadas:** 4
-   **Contas Bloqueadas:** 2
-   **Alertas de Segurança Gerados:** 6
-   **Conformidade com as Políticas:** 100%

#### Visualização de Conformidade

O gráfico abaixo representa o status de conformidade da conta. Um resultado de 100% indica que todas as políticas de segurança configuradas (ex: rotação de senha, verificação em duas etapas) estão sendo cumpridas.

<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <style>
        .donut-bg { stroke: var(--secondary-color); }
        .donut-fg { stroke: #22c55e; transition: all 0.5s ease; }
        .donut-text { font-family: Inter, sans-serif; font-size: 20px; font-weight: bold; fill: var(--text-primary); }
    </style>
    <circle cx="50" cy="50" r="40" fill="transparent" stroke-width="15" class="donut-bg" />
    <circle cx="50" cy="50" r="40" fill="transparent" stroke-width="15" class="donut-fg"
            stroke-dasharray="251.2"
            stroke-dashoffset="0"
            transform="rotate(-90 50 50)" />
    <text x="50" y="55" text-anchor="middle" class="donut-text">100%</text>
</svg>
