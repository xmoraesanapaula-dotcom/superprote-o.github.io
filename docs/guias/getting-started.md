# Guias de Uso: Começando

Esta página demonstra o básico da formatação de conteúdo, incluindo o destaque de sintaxe do Prism.js.

## Exemplo de Código

O JavaScript é uma linguagem poderosa. Veja um exemplo de código com destaque de sintaxe. A palavra `function` e as strings devem ter cores diferentes.

```javascript
// Este é um teste de destaque de sintaxe.
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  return `O total é: ${total}`;
}

const myCart = [{ price: 10 }, { price: 25 }];
console.log(calculateTotal(myCart));
