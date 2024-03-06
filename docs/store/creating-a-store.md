## Creating a Store

Os stores são importantes e facilitam tratar dados através da aplicação. Você pode cria-los e salva-los em uma pasta destinada apenas para este fim.

```tsx
// ./stores/useCartStore.ts
import { createStore, useStore } from "alem/store";

type StoreProps = {
  items: number;
  totalPrice: number;
};

createStore("cartStore", { items: 2, totalPrice: 24 });
const useCartStore = () => useStore<StoreProps>("cartStore");
export default useCartStore;
```

Seguindo o modelo acima, você pode facilmente acessar os dados do `cartStore` em outras partes da aplicação.

```tsx
import useCartStore from "./stores/useCartStore";

const MyComponent = () => {
  // load store data
  const { items, update } = useCartStore();

  const onClickHandler = () => {
    // changing data
    update({ items: 4 });
  }

  return (<>{items}<>)
}

export default MyComponent;
```
