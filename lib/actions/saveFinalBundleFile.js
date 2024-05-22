const path = require("path");
const fs = require("fs");
const getMainWidgetName = require("./getMainWidgetName");

// Save final bundle file
// Note: must save inside a ./src folder. This is the only folder bos-clir-rs recognizes
const saveFinalBundleFile = (bundleContent, fileName) => {
  const finalFileName = fileName || getMainWidgetName();

  fs.writeFileSync(
    path.join(`./build/src/${finalFileName}.jsx`),
    bundleContent,
  );
};

module.exports = saveFinalBundleFile;
