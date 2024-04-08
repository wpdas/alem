const fs = require("fs");
const path = require("path");

const injectModules = (bundle) => {
  const modulesPath = path.join(".", "alem.modules.json");
  if (!fs.existsSync(modulesPath)) {
    bundle = bundle.replace("<script>:::MODULES_SRC:::</script>", "\n");
    return bundle;
  }

  const modulesRaw = fs.readFileSync(modulesPath);
  try {
    JSON.parse(modulesRaw);
  } catch (e) {
    throw new Error(`./alem.modules.json is not a valid json file`);
  }

  const modules = JSON.parse(modulesRaw);

  let modulesSrc = "";

  const modulesKeys = Object.keys(modules);
  modulesKeys.forEach((moduleKey) => {
    modulesSrc += `<script src="${modules[moduleKey]}" crossorigin></script>\n`;
  });

  bundle = bundle.replace("<script>:::MODULES_SRC:::</script>", modulesSrc);

  return bundle;
};

module.exports = injectModules;
