const { generate_data_json } = require("./data.js");
const { create_dist, for_rfile, log } = require("./utils.js");
const { process_file } = require("./parse.js");
const { read_bos_config } = require("./config");
const path = require("path");
const fs = require("fs");

const distFolder = process.env.DIST_FOLDER || "build";

// Main function to orchestrate the build script
async function build() {
  create_dist(distFolder);
  process_dist(distFolder);
  generate_data_json();
}

async function build_with_log() {
  let loading = log.loading("Building the project");
  await build().catch((err) => {
    loading.error();
    log.error(err);
    process.exit(1);
  });
  loading.finish();
  log.sucess("Build complete");
}

// walk through each app folder
function process_dist() {
  const config = read_bos_config();
  const finalFileName = config.isIndex ? 'Index' : config.name;

  // initial file body importing the tools
  let fileBundleBody = process_file(path.join(__dirname, 'tools', 'index.js'));

  // loop through all files inside the './src' and get their content
  for_rfile(path.join(".", 'src'), ["js", "jsx", "ts", "tsx"], (file) => {
    const fileBody = process_file(file);
    fileBundleBody += fileBody;
  });

  // finish the file body with the app indexer
  fileBundleBody += process_file(path.join(__dirname, 'tools', 'appIndexer.jsx'));

  // Note: Save unified file
  fs.writeFileSync(path.join(`./build/${finalFileName}.jsx`), fileBundleBody);
}

module.exports = {
  build,
  process_dist,
  build_with_log,
};
