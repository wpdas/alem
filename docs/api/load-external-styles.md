## Load External Styles - Fonts & CSS

Use this feature to load external fonts and css files into your application. (Alem supports local .css files too, so you can just create them from the project's root folder.)

`loadExternalStyles` returns a `boolean` informing whether all css files have already been loaded.

You can use any fonts like Google Fonts or CDN Fonts.

You must specify `font-family` in the application's styles.

```tsx
import { loadExternalStyles } from "alem";

const App = () => {
  const stylesLoaded = loadExternalStyles([
    "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap",
    "https://cdn.jsdelivr.net/gh/codemirror/codemirror5/lib/codemirror.css",
  ]);

  if (!stylesLoaded) {
    return <p>Loading...</p>;
  }

  return <p>My Nice Content</p>;
};

export default App;
```
