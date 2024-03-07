## Load Fonts

Use this feature to load external fonts into your application. You can use any fonts like Google Fonts or CDN Fonts.

You must specify `font-family` in the application's styles, whether using .css or styled-components files.

`loadFonts` returns a `boolean` informing whether all fonts have already been loaded.

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
