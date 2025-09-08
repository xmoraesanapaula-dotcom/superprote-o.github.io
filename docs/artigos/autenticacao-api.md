# Autenticação na API

Para garantir que apenas aplicações autorizadas possam interagir com seus dados, todas as requisições à API da **Super Proteção** devem ser autenticadas. A autenticação é feita através de chaves de API secretas.

Trate suas chaves de API como senhas. Elas concedem acesso total à sua conta e devem ser mantidas em segurança.

---

## Suas Chaves de API

Você pode gerar e gerenciar suas chaves de API no seu Painel de Controle, na seção **Desenvolvedores > Chaves de API**.

Existem dois tipos de chaves:

* **Chave Publicável (`sp_pk_...`):** Destinada a ser usada em código de frontend (navegador). Possui permissões limitadas.
* **Chave Secreta (`sp_sk_...`):** Destinada a ser usada em seu servidor de backend. **Nunca exponha esta chave publicamente.** Ela possui plenos poderes para interagir com a API.

Para todas as operações de backend, você usará a Chave Secreta.

---

## Como Autenticar Requisições

A autenticação é feita pelo método **Bearer Token**. Você deve incluir sua chave secreta em um cabeçalho `Authorization` em todas as suas requisições.

O formato do cabeçalho é:
`Authorization: Bearer <SUA_CHAVE_SECRETA>`

Substitua `<SUA_CHAVE_SECRETA>` pela sua chave `sp_sk_...`.

### Exemplo Prático com `curl`

Abaixo está um exemplo de como listar os últimos eventos da sua conta usando a ferramenta de linha de comando `curl`.

```shell
curl [https://api.superprotecao.com/v1/eventos](https://api.superprotecao.com/v1/eventos) \
  -H "Authorization: Bearer sp_sk_suaChaveSecretaDeExemplo"
```

Se a autenticação for bem-sucedida, a API retornará uma resposta 200 OK com os dados solicitados.
Tratamento de Erros de Autenticação
Se uma requisição for feita com uma chave inválida, ausente ou com permissões insuficientes, a API retornará um erro.
 * 401 Unauthorized: A chave de API está ausente, é inválida ou foi revogada.

```
   {
  "error": {
    "type": "authentication_error",
    "message": "Chave de API inválida fornecida."
  }
}
```

 * 403 Forbidden: A chave de API é válida, mas não tem permissão para realizar a ação solicitada.

```
   {
  "error": {
    "type": "permission_error",
    "message": "Esta chave de API não tem permissão para acessar este recurso."
  }
}
```

> Nota:
> Sua aplicação deve ser capaz de tratar esses erros de forma adequada, por exemplo, registrando o erro e notificando um administrador.
> 
Segurança das Chaves
 * Não versione suas chaves: Nunca armazene suas chaves de API diretamente no código-fonte ou em repositórios Git.
 * Use variáveis de ambiente: A melhor prática é carregar as chaves a partir de variáveis de ambiente no seu servidor.
 * Rotacione suas chaves: Crie uma política para rotacionar (revogar as antigas e gerar novas) suas chaves de API periodicamente para limitar o dano caso uma delas seja comprometida.
<!-- end list -->

