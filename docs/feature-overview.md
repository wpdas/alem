# Feature Overview

Alem is a web3 **JavaScript** / **TypeScript** library for building user interfaces for NEAR BOS DApps.

- **Declarative:** Alem makes it painless to create interactive UIs. Design simple views for each state in your application, and Alem will efficiently update and render just the right components when your data changes. Declarative views make your code more predictable, simpler to understand, and easier to debug.
- **Component-Based:** Build encapsulated components that manage their own state, then compose them to make complex UIs. Since component logic is written in JavaScript, you can easily pass rich data through your app.
- **Learn Once, Write Anywhere:** We don't make assumptions about the rest of your technology stack, so you can develop new features in Alem without rewriting existing code.
- **CSS:** Alem supports .css files. Just create them and they will all be included in the application.
- **Routes System:** An integrated router system that makes it possible to navigate between pages easily.
- **Much more:** Take a look at the other documentation items to learn how to use all the features provided by Alem.

Alem supports all the things that BOS supports.

## Component

You can create any component file using **JavaScript** or **TypeScript**. The entrypoint must be an App component like so:

```tsx
const App = () => {
  return (
    <>
      <h1>Hello World</h1>
    </>
  );
};

export default App;
```

## Component Props

Passing properties to a component is very simple. Just use react's defaults:

```tsx
export const ComponentA = ({ name }: { name: string }) => {
  return <p>{name}</p>;
};

export const ComponentB = () => {
  return <ComponentA name="Wendz" />;
};
```
