const path = require("path");
const fs = require("fs");
const { read_bos_config } = require("../config");

// Save final bundle file
// Note: must save inside a ./src folder. This is the only folder bos-clir-rs recognizes
const saveFinalBundleFile = (bundleContent) => {
  const config = read_bos_config();
  const finalFileName = config.isIndex
    ? "Index"
    : config.name.replaceAll(" ", "-").toLowerCase();

  fs.writeFileSync(
    path.join(`./build/src/${finalFileName}.jsx`),
    bundleContent,
  );
};

module.exports = saveFinalBundleFile;
