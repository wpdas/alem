## Routes

Este componente é responsável por gerenciar o conteúdo a ser exibido na tela de acordo com a rota ativa. Você pode utilizar o recurso `createRoute` para criar as rotas da aplicação e passa-las para o Routes.

```tsx
import { Routes, createRoute } from "alem/router";

import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";

const AppRoutes = () => {
  // Creating routes
  const FeatureOverviewRoute = createRoute("home", HomePage);
  const StateManagementRoute = createRoute("profile", ProfilePage);

  // Initializing Routes
  return (
    <Routes
      routes={[FeatureOverviewRoute, StateManagementRoute]}
      type="ContentBased"
    />
  );
};

export default AppRoutes;
```

## Tipos de Comportamento

O `Routes` pode tratar os links de duas formas:

- **URLBased:** Este é o comportamento padrão. Todo link será irá recarregar a página alterando a estrutura da URL no navegador;
- **ContentBased:** Este comportamento não muda a URL no navegador e não recarrega a página. Sendo assim, é mais rapida para exibir o conteúdo na tela.

Você pode passar o tipo de comportamento usando a propriedade `type` do Routes.

```html
<!-- URL Based -->
<Routes
  routes="{[FeatureOverviewRoute,"
  StateManagementRoute]}
  type="URLBased"
/>

<!-- Content Based -->
<Routes
  routes="{[FeatureOverviewRoute,"
  StateManagementRoute]}
  type="ContentBased"
/>
```
