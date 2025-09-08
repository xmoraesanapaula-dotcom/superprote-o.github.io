# Exemplos de Relatórios

O **Super Proteção** oferece relatórios detalhados para monitorar atividades, identificar incidentes e apoiar processos de auditoria e conformidade.  

Os relatórios podem ser **visualizados no painel**, exportados em **CSV** para integração com outros sistemas ou em **PDF** para fins de registro e auditoria formal.  

Abaixo estão alguns exemplos em formato **Markdown** que ilustram relatórios comuns.  

---

## Relatório Diário de Atividades

Relatório com granularidade de eventos, ideal para identificar acessos suspeitos ou falhas de autenticação em tempo real.  

| Data/Hora           | Usuário                                       | Evento          | IP             | Status  |
| ------------------- | --------------------------------------------- | --------------- | -------------- | ------- |
| 2025-09-07 08:12:34 | [joao@example.com](mailto:joao@example.com)   | login_ok        | 187.100.55.200 | Sucesso |
| 2025-09-07 08:15:10 | [maria@example.com](mailto:maria@example.com) | login_falhou    | 200.160.23.45  | Falha   |
| 2025-09-07 09:01:22 | [admin@example.com](mailto:admin@example.com) | usuario_criado  | 10.0.0.5       | Sucesso |
| 2025-09-07 09:22:47 | [joao@example.com](mailto:joao@example.com)   | login_suspeito  | 45.112.33.90   | Alerta  |

---

## Relatório Semanal Consolidado

Relatório agregado por tipo de evento, útil para medir tendências e identificar padrões de comportamento.  

| Tipo de Evento     | Quantidade | Usuários Impactados |
| ------------------ | ---------- | ------------------- |
| login_ok           | 245        | 87                  |
| login_falhou       | 32         | 18                  |
| usuario_criado     | 4          | 4                   |
| usuario_bloqueado  | 2          | 2                   |
| login_suspeito     | 6          | 5                   |

---

## Relatório de Auditoria (Resumo)

Resumo de conformidade e métricas de segurança, indicado para auditorias internas e externas.  

| Critério                 | Resultado               |
| ------------------------ | ----------------------- |
| Total de logins válidos  | 245                     |
| Total de falhas de login | 32                      |
| Contas criadas           | 4                       |
| Contas bloqueadas        | 2                       |
| Alertas de segurança     | 6                       |
| Conformidade             | 100% dentro dos padrões |

---

## Visualização de Exportação CSV

Formato de exportação simples, pronto para ser consumido por sistemas de BI, planilhas ou pipelines de auditoria.  

```csv
data,usuario,evento,ip,status
2025-09-07 08:12:34,joao@example.com,login_ok,187.100.55.200,sucesso
2025-09-07 08:15:10,maria@example.com,login_falhou,200.160.23.45,falha
2025-09-07 09:01:22,admin@example.com,usuario_criado,10.0.0.5,sucesso
2025-09-07 09:22:47,joao@example.com,login_suspeito,45.112.33.90,alerta
````

---

## Exemplo Gráfico (Markdown Simples)

Embora a versão final do painel apresente gráficos dinâmicos, em **Markdown** é possível simular uma visualização simplificada para relatórios rápidos:

```
Logins bem-sucedidos:  ██████████████████████ 245
Falhas de login:       ████ 32
Alertas suspeitos:     ██ 6
Usuários bloqueados:   █ 2
```

---

## Futuras Melhorias de Relatórios

* Exportação automática de relatórios para **S3, Google Drive ou FTP**.
* Dashboards interativos com **filtros avançados e drill-down**.
* Integração nativa com ferramentas de **BI** (exemplo: Power BI, Grafana, Metabase).
* Agendamento de relatórios recorrentes (diários, semanais, mensais).
* Alertas automáticos baseados em **anomalias detectadas nos relatórios**.
