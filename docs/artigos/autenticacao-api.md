# Autenticação na API

Para garantir que apenas aplicações autorizadas possam interagir com seus dados, todas as requisições à API da **Super Proteção** devem ser autenticadas.  

A autenticação é feita através de **chaves de API secretas**.  
Trate essas chaves como senhas: elas concedem acesso total à sua conta e devem ser mantidas em segurança.

---

## Suas Chaves de API

Você pode gerar e gerenciar suas chaves no **Painel de Controle**, na seção **Desenvolvedores > Chaves de API**.  

Existem dois tipos principais:

- **Chave Publicável (`sp_pk_...`)**  
  - Usada em código de **frontend** (navegador, aplicativos móveis).  
  - Possui permissões limitadas.  
  - Pode ser exposta em ambientes públicos.  

- **Chave Secreta (`sp_sk_...`)**  
  - Usada apenas no **backend**.  
  - Nunca deve ser exposta publicamente.  
  - Possui acesso total à API.  

> Para todas as operações de backend, você deve usar a **Chave Secreta**.

---

## Como Autenticar Requisições

A autenticação é feita pelo método **Bearer Token**.  
Inclua sua chave secreta em todas as requisições no cabeçalho **Authorization**:

```

Authorization: Bearer \<SUA\_CHAVE\_SECRETA>

````

Substitua `<SUA_CHAVE_SECRETA>` pela chave secreta real (`sp_sk_...`).  

---

## Exemplo com `curl`

A seguir, um exemplo de como listar os últimos eventos da conta utilizando `curl`:

```bash
curl https://api.superprotecao.com/v1/eventos \
  -H "Authorization: Bearer sp_sk_suaChaveSecretaDeExemplo"
````

Se a autenticação for bem-sucedida, a API responderá com **200 OK** e retornará os dados solicitados.

---

## Tratamento de Erros de Autenticação

Se a autenticação falhar, a API retornará um erro apropriado.

### 401 Unauthorized

A chave está ausente, inválida ou foi revogada.

```json
{
  "error": {
    "type": "authentication_error",
    "message": "Chave de API inválida fornecida."
  }
}
```

### 403 Forbidden

A chave é válida, mas não possui permissão suficiente para executar a operação solicitada.

```json
{
  "error": {
    "type": "permission_error",
    "message": "Esta chave de API não tem permissão para acessar este recurso."
  }
}
```

> Sua aplicação deve tratar esses erros adequadamente, registrando-os e notificando um administrador quando necessário.

---

## Boas Práticas de Segurança

* **Não versione suas chaves**
  Nunca armazene chaves diretamente no código-fonte ou em repositórios Git.

* **Use variáveis de ambiente**
  Configure suas chaves via variáveis de ambiente ou serviços de gerenciamento de segredos (ex.: Vault, AWS Secrets Manager).

* **Rotacione suas chaves periodicamente**
  Revogue chaves antigas e gere novas regularmente, reduzindo o risco em caso de comprometimento.

* **Restrinja permissões quando possível**
  Sempre prefira usar a chave mais limitada necessária para a operação.

---

## Próximos Passos

* Gere suas chaves no painel da Super Proteção.
* Configure variáveis de ambiente para armazená-las.
* Teste sua autenticação utilizando `curl` ou bibliotecas de cliente HTTP (Axios, Requests, etc.).
