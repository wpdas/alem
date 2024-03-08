## Creating a Store

The state management is made using a combination of features `createStore` and `useStore`. This feature is used to create store objects that can be used over the app in any level down the tree.

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

By following the model above, you can easily access the `cartStore` data in other parts of the application.

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
