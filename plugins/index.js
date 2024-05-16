const tailwind = require("./tailwind");

module.exports = {
  css: async () => {
    // Note: run all css plugins here and return the final result
    const cssContent = await tailwind.run();
    return cssContent;
  },
  // CSS files to be ignored during compilation
  ignoreCssFiles: [...tailwind.ignoreCssFiles],
};
