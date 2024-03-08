## Load External Styles (Css)

Use this feature to load external css files into your application.

`loadExternalStyles` returns a `boolean` informing whether all css files have already been loaded.

```tsx
import { loadExternalStyles } from "alem/api";

const App = () => {
  const stylesLoaded = loadExternalStyles([
    "https://cdn.jsdelivr.net/gh/codemirror/codemirror5/lib/codemirror.css",
  ]);

  if (!stylesLoaded) {
    return <p>Loading...</p>;
  }

  return <p>My Nice Content</p>;
};

export default App;
```
