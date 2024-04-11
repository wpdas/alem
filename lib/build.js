const { generate_data_json } = require("./data.js");
const { create_dist, log } = require("./utils.js");
const { compile_files } = require("./compiler.js");

const distFolder = process.env.DIST_FOLDER || "build";

// Main function to orchestrate the build script
async function build() {
  create_dist(distFolder);
  compile_files();
  generate_data_json();
}

async function build_with_log() {
  await build();
  let loading = log.loading("Building the project");
  // INFO: isso abaixo estava inibindo a mensagem de erro completa
  // await build().catch((err) => {
  //   loading.error();
  //   log.error(err);
  //   process.exit(1);
  // });
  loading.finish();
  log.sucess("Build complete");
}

module.exports = {
  build,
  build_with_log,
};
