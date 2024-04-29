## Modules

The files inside this folder are going to be injected only once and their references will be used throughout the app, thus reducing the final size of the final file. To add a file to be compiled as module, just add it to the `src/modules` folder.

WARNING: If you want to use `props` inside the modules, you must pass it as a parameter. Modules live at the very top layer of Além and can't automatically access the props where it's being used.

## When should I put files here?

You should place files here when they are repeatedly imported into the project. Remembering again that they will not have access to the properties where they are being used automatically. Therefore, you must pass the necessary properties per parameter.

Example:

**Module files**

```ts
// src/modules/routesProps.ts Module
export const routes = {
  HOME: "home";
  PROFILE: "profile";
  EDIT_PROFILE: "profile/edit"
}

// "parentProps" - props passed by the caller
export const logParams = (parentProps: any) => {
  console.log(parentProps);
}
```

```ts
// src/modules/Banner.tsx Module
import { routes } from "./modules/parentProps";

const bannerText = "This is my banner!";

type BannerProps = { label: string };

const Banner = ({ label }: BannerProps) => {
  const availableRoutes = Object.keys(routes).join(", ");

  return (
    <>
      <h3>{bannerText}</h3>
      <p>{label}</p>
      <p>Available routes: {availableRoutes}</p>
    </>
  );
};
export default Banner;
```

**Using module**

```tsx
// src/MyStatefulComponent.tsx
import { useEffect, props } from "alem";
import { logParams } from "./modules/parentProps";
import Banner from "./modules/Banner";

const MyStatefulComponent = () => {
  //...
  useEffect(() => {
    logParams(props);
  }, []);

  return (
    <>
      <Banner label="just a simple banner" />
    </>
  );
};
```
