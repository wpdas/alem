## Creating a Store

Store is important and make it easier to process data through the application. You can create them and save them in a folder designed just for this purpose.

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
