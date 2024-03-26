<!-- TODO: Mudar para getLocation() -->
<!-- Funciona apenas dentro dos filhos do Routes -->

<!-- Documentar o seguinte: Prefira usar getLocation().pathname <recurso> para evitar conflitos de nomes após a compilação. -->
<!-- ou embrulhe o recurso com a função na qual ele está sendo usado. -->
<!-- TODO: Pensar numa forma de corrigir isso nas proximas versões -->

## Get Location

This hook returns the current location object. It can be useful if you'd like to perform some side effect whenever the current location changes.

Use `getLocation().isRoutesReady` to get to know when the routes are ready to be accessed.

```ts
// http://127.0.0.1:8080/alem-lib.near/widget/Index?path=profile
import { getLocation } from "alem";

export const SomeComponent = () => {
  const location = getLocation();
  console.log(location);
  // { isRoutesReady: true, pathname: "profile", routes: ["home", "profile"] }

  return "";
};
```
