const fs = require("fs");
const path = require("path");

const injectModules = (bundle) => {
  const modulesPath = path.join(".", "modules.json");
  if (!fs.existsSync(modulesPath)) {
    bundle = bundle.replace("const MODULES_IFRAME = {};", "\n");
    return bundle;
  }

  const modulesRaw = fs.readFileSync(modulesPath);
  try {
    JSON.parse(modulesRaw);
  } catch (e) {
    throw new Error(`./modules.json is not a valid json file`);
  }

  const modules = JSON.parse(modulesRaw);

  let modulesBundle = `const iframeModulesCode = \`\n`;
  let accessKeys = "";

  const modulesKeys = Object.keys(modules);
  modulesKeys.forEach((moduleKey, index) => {
    modulesBundle += `<script src="${modules[moduleKey].url}" crossorigin></script>\n`;
    accessKeys += `${modules[moduleKey].accessKey},${modulesKeys.length === index ? "\n" : ""}`;
  });

  // Final modules body
  modulesBundle += `
  <script>
    window.addEventListener("message", (event) => {
      event.source.postMessage({${accessKeys}}, "*");
    }, false);
  </script>
  \`;\n`;

  bundle = bundle.replace("const MODULES_IFRAME = {};", modulesBundle);

  return bundle;
};

module.exports = injectModules;
