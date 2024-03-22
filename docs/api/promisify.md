# Promisify

Promisify is used to check if a piece of data is present until a specific check time is reached. Basically it call resolve or reject for a given caller.

```ts
import { promisify } from "alem";

const getStorage = () => Storage.get("my-key");
const resolve = (storageData) => console.log(storageData);
const reject = () => console.log("Error");
const timeout = 5000; // 5sec

promisify(getStorage, resolve, reject, timeout);
```
