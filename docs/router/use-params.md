<!-- TODO: Deve ser realocado para hooks-->
<!-- Funciona globalmente -->

## Use Params

This hook returns all parameters provided by the URL.

```ts
// http://127.0.0.1:8080/alem-lib.near/widget/Index?projectId=123
import { useParams } from "alem";

export const SomeComponent = () => {
  const params = useParams();
  console.log(params); // { projectId: "123" }

  return "";
};
```
