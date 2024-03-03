# bos-react

This library allows you to create applications for BOS with a focus on performance, in addition to requiring concepts that are based on ReactJS.

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

### Components

Components must be created following react standards:

```tsx
// Hero.tsx
type HeroProps = { text: string };

const Hero = ({ text }: HeroProps) => {
  return (
    <div>
      <p>This is the Hero section</p>
      <p>
        <strong>{text}</strong>
      </p>
    </div>
  );
};

export default Hero;
```

All the features will be right available to be used. e.g.:

(updating App.tsx including the Hero component)

```tsx
import Hero from "./Hero"

// App.tsx
const App = () => {
  return (
    <>
      <h1>Hello World</h1>
      <Hero text="First Component">
    </>
  );
};
```

## State Management

The state management is made using built in `useStore` hook. This feature is used to create store objects that can be used over the app in any level down the tree.

```tsx
// store.ts
// initializing a store
useStore("cartStore", { items: 2, totalPrice: 24 });
// creating a hook for the store above
const useCartStore = () => useStore("cartStore");

// app.tsx
// using the cart store hook
// reading data
const { items, totalPrice, update } = useCartStore();
console.log(items, totalPrice); // 2, 24

// changing store data
update({ items: 4, newValue: "Joe" });
console.log(items, newValue); // 4, 'Joe'
```

Here's an example of this being used into the components we created above:

(updating Hero.tsx to use a store)

```tsx
// Hero.tsx
type HeroProps = { text: string };

const Hero = ({ text }: HeroProps) => {
  const { items } = useCartStore();

  return (
    <div>
      <p>This is the Hero section</p>
      <p>
        <strong>{text}</strong>
      </p>
      <p>Cart has {items} items</p>
    </div>
  );
};
```

## Config File

Create an `bos.config.json` file at the root of the project with the following content:

```json
{
  "isIndex": true,
  "account": "potlock.near",
  "name": "PotLock",
  "description": "PotLock is transforming the way public goods are funded. Create your project, donate to your favroite project, or earn automatic on-chain referrals from funding for your favorite public goods.\n\nLearn more at https://docs.potlock.io ",
  "linktree": {
    "website": "potlock.io/app"
  },
  "image": {
    "ipfs_cid": "bafkreicwzq6dlcynhceovrtslsjja2d76b7ysnjih4qmqlk7atre3w2nay"
  },
  "tags": ["your", "dapp", "tags", "here"]
}
```

<!-- TODO: Improve this text -->

**isIndex:** This field is used to inform whether this is the account's main application or not. You can have multiple apps for the same account, but there can only be one main app (Index).

The `linktree` and `image` can be different. For instance, you can use a URL for `image` like so: `"image": { "url": "https://link-to-the/image.jpg" }`.

Take a look at [https://docs.near.org/social/contract](https://docs.near.org/social/contract) to get to know more.

This file is mandatory because it is from it that information will be extracted for application deployments.

## Para Documentar

- `props` é global do BOS. Por isso, deve-se usar outro nome para referenciar as props de um componente (ex: componentProps).

- `useQuery` use isso ao invés de `props`

- `promisify`

- `RouteLink`

- `ContentRouteLink`

- `navigate`
