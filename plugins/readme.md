## Tailwind

Steps to configure Tailwind manually. Get to know more about [**Tailwind here.**](https://tailwindcss.com/)

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
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Add the Tailwind directives to your CSS

The main file to be used with tailwind is `src/globals.css`, create this file in your project and add the `@tailwind` directives for each of Tailwind’s layers to your main CSS file.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Chaging the Main CSS File

You can change the main css file, to do this, add the following session in the `alem.config.json` file:

```json
"plugins": {
    "tailwind": {
      "css": "src/globals.css"
    }
  }
```

Replace `src/globals.css` with the file you want to use.
