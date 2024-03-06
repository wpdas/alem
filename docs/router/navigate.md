## Navigate

Este recurso possibilita navegar programaticamente para as rotas disponíveis. A URL não será afetada!

```ts
import { navigate } from "alem/router";

export const SomeComponent = () => {
  const onClickHandler = () => {
    navigate("profile")
  }

  return (
    <button onClick={onClickHandler}>Go to Profile</button>
  );
};
```
