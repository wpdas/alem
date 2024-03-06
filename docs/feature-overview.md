Alem is a web3 JavaScript / TypeScript library for building user interfaces for NEAR Bos dApps.

- **Declarative:** Alem makes it painless to create interactive UIs. Design simple views for each state in your application, and Alem will efficiently update and render just the right components when your data changes. Declarative views make your code more predictable, simpler to understand, and easier to debug.
- **Component-Based:** Build encapsulated components that manage their own state, then compose them to make complex UIs. Since component logic is written in JavaScript, you can easily pass rich data through your app.
- **Learn Once, Write Anywhere:** We don't make assumptions about the rest of your technology stack, so you can develop new features in Alem without rewriting existing code.

## Starting

You can create any component file using **JavaScript** or **TypeScript**. The entrypoint must be an App component like so:

```tsx
// App.tsx
const App = () => {
  return (
    <>
      <h1>Hello World</h1>
    </>
  );
};
```
