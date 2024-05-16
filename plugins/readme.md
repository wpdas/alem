## Tailwind

Steps to use Tailwind. Get to know more about [**Tailding here.**](https://tailwindcss.com/)

### Install Tailwind CSS

Install `tailwindcss` via npm, and create your `tailwind.config.js` file.

```sh
npm install -D tailwindcss@3.4.3
#or
yarn add tailwindcss@3.4.3 -D

npx tailwindcss init
```

### Configure your template paths

Add the paths to all of your template files in your `tailwind.config.js` file.

```js
const config = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

module.exports = config;
```

### Add the Tailwind directives to your CSS

Add the `@tailwind` directives for each of Tailwind’s layers to your main CSS file.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
