const { generate_data_json } = require("./data.js");
const { create_dist, log } = require("./utils.js");
const { compile_files, compile_changed_file } = require("./compiler.js");

const distFolder = process.env.DIST_FOLDER || "build";

// Main function to orchestrate the build script
async function build(opts, changedFilePath) {
  create_dist(distFolder);
  if (!changedFilePath) {
    compile_files(opts);
  } else {
    await compile_changed_file(opts, changedFilePath);
  }
  generate_data_json();
}

async function build_with_log(opts) {
  await build(opts);
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
