## Get Store

This feature returns all current data for each item in the global store.

```ts
import { getStore } from "alem/store";

console.log(getStore());
// {cartStore: { item: 4, totalPrice: 24 }, userStore: {name: "Wendz", ...}}
```
