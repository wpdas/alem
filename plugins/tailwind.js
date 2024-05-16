const fs = require("fs");
const path = require("path");

// Post CSS & Plugins
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const postcssNested = require("postcss-nested");
const cssnano = require("cssnano"); // Minify css
const tailwindcss = require("tailwindcss"); // Tailwind support

// Alem stuff
const { read_alem_config } = require("../lib/config");
const { scapeBacktick } = require("../lib/helpers");

const config = read_alem_config();
const cssDirPrep = config?.plugins?.tailwind?.css || "src/globals.css";

// Escapa "\"
function escapeBackslashes(str) {
  return str.replace(/\\/g, "\\\\");
}

const run = () => {
  // Tailwind config file
  const tailwindConfigDir = path.join(".", "./tailwind.config.js");
  const configExist = fs.existsSync(tailwindConfigDir);

  return new Promise((resolve) => {
    if (configExist) {
      // Internal Stuff
      const cssDir = path.join(".", cssDirPrep);

      // Tailwind config js
      const tailwindConfig = require(path.resolve(tailwindConfigDir));

      // Check if css dir exist
      if (!fs.existsSync(cssDir)) {
        throw new Error(
          `You're trying to use Taiwind in your project but the ${cssDir} file was not found! Go to https://alem.dev to get to know how to configure Tailwind.`,
        );
      }

      fs.readFile(cssDir, (err, css) => {
        // Plugins
        const plugins = [
          autoprefixer,
          postcssNested,
          tailwindcss(tailwindConfig),
          cssnano,
        ];

        // Postcss
        postcss(plugins)
          .process(css, { from: cssDir })
          .then((data) => {
            resolve(scapeBacktick(escapeBackslashes(data.css)));
          })
          .catch(() => {
            resolve("");
          });
      });
    } else {
      resolve("");
    }
  });
};

module.exports = {
  run,
  // CSS files to be ignored during compilation
  ignoreCssFiles: [cssDirPrep],
};
