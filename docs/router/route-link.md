## Route Link

Este componente é usado para permitir os usuários navegarem entre as rotas. Vocé deve informar o caminho de destino usando a propriedade `to`.

```tsx
import { RouteLink } from "alem/router";

export const SomeComponent = () => {
  return (
    <RouteLink to="profile">
      <p>Go to Profile</p>
    </RouteLink>
  );
};
```
