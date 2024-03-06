## Bos Props

As propriedades do widget nativas do BOS continuam functionando assim como todos os outros recursos já presentes.

```tsx
import { props } from "alem/bos";

export const ComponentC = () => {
  console.log(props); // will print the widget props

  return <ComponentA name="Wendz" />;
};
```
