## Clear Store

Resource used to remove all items from the store.

```ts
import { getStore, clearStore } from "alem/store";

console.log(getStore());
// {cartStore: { item: 4, totalPrice: 24 }, userStore: {name: "Wendz", ...}}

clearStore();
console.log(getStore());
// {}
```
