# Exemplos de Relatórios

Abaixo estão alguns exemplos de relatórios apresentados em tabelas Markdown, representando visualizações que podem ser exportadas em PDF ou CSV.

---

## Relatório Diário de Atividades

| Data/Hora           | Usuário                                       | Evento          | IP             | Status  |
| ------------------- | --------------------------------------------- | --------------- | -------------- | ------- |
| 2025-09-07 08:12:34 | [joao@example.com](mailto:joao@example.com)   | login\_ok       | 187.100.55.200 | Sucesso |
| 2025-09-07 08:15:10 | [maria@example.com](mailto:maria@example.com) | login\_falhou   | 200.160.23.45  | Falha   |
| 2025-09-07 09:01:22 | [admin@example.com](mailto:admin@example.com) | usuario\_criado | 10.0.0.5       | Sucesso |
| 2025-09-07 09:22:47 | [joao@example.com](mailto:joao@example.com)   | login\_suspeito | 45.112.33.90   | Alerta  |

---

## Relatório Semanal Consolidado

| Tipo de Evento     | Quantidade | Usuários Impactados |
| ------------------ | ---------- | ------------------- |
| login\_ok          | 245        | 87                  |
| login\_falhou      | 32         | 18                  |
| usuario\_criado    | 4          | 4                   |
| usuario\_bloqueado | 2          | 2                   |
| login\_suspeito    | 6          | 5                   |

---

## Relatório de Auditoria (Resumo)

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

```csv
data,usuario,evento,ip,status
2025-09-07 08:12:34,joao@example.com,login_ok,187.100.55.200,sucesso
2025-09-07 08:15:10,maria@example.com,login_falhou,200.160.23.45,falha
2025-09-07 09:01:22,admin@example.com,usuario_criado,10.0.0.5,sucesso
2025-09-07 09:22:47,joao@example.com,login_suspeito,45.112.33.90,alerta
```

---

## Exemplo Gráfico (Markdown Simples)

Embora a versão final possa gerar gráficos dinâmicos no painel, em Markdown é possível simular gráficos de barras horizontais para relatórios rápidos:

```
Logins bem-sucedidos:  ██████████████████████ 245
Falhas de login:       ████ 32
Alertas suspeitos:     ██ 6
Usuários bloqueados:   █ 2
```
