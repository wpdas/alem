## Load Fonts

Use este recurso para carregar fontes externas para dentro do seu aplicativo. Você pode usar qualquer fonte de fontes como Google Fonts ou CDN Fonts.

Você deve especificar o `font-family` nos estilos da aplicação, seja usando arquivos .css ou styled-components.

`loadFonts` retorna um `boolean` informando se todas as fontes já foram carregadas.

```css
/* app-styles.css */
p {
  font-family: "Open Sans", sans-serif;
}
```

```tsx
import { loadFonts } from "alem/theme";

const App = () => {
  const fontsLoaded = loadFonts([
    "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap",
  ]);

  if (!fontsLoaded) {
    return <p>Loading...</p>;
  }

  return <p>My Nice Content</p>;
};

export default App;
```
