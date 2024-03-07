## Use Location

This hook returns the current location object. It can be useful if you'd like to perform some side effect whenever the current location changes.

```ts
// http://127.0.0.1:8080/alem-lib.near/widget/Index?path=profile
import { useLocation } from "alem/hooks";

export const SomeComponent = () => {
  const location = useLocation();
  console.log(location); // { pathname: "profile", routes: ["home", "profile"] }

  return "";
};
```
