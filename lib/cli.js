const { deploy_app, deploy_data } = require("./deploy");
const { version, name, description } = require("../package.json");
const { Command } = require("commander");

const program = new Command();

const { build_with_log } = require("./build.js");
const { dev } = require("./dev.js");

async function run() {
  program.name(name).description(description).version(version);

  program
    .command("dev")
    .description("Run the development server")
    .option("-p, --port <port>", "Port to run the server on", "8080")
    // .option("-no-gateway", "Disable the gateway", false)
    // .option("-no-hot", "Disable hot reloading", false)
    .option("-no-open", "Disable opening the browser", false)
    .action((opts) => {
      dev(opts).catch((err) => {
        console.error(err);
        process.exit(1);
      });
    });
  program
    .command("build")
    .description("Build the project")
    .action(() => {
      build_with_log().catch(console.error);
    });
  program
    .command("deploy")
    .description("Deploy the project")
    .action(() => {
      deployCLI();
    });
  program
    .command("upload-data")
    .description("Upload data to SocialDB")
    .argument("[string]", "app name")
    .action((appName) => {
      uploadDataCLI(appName);
    });

  program.parse();
}

function deployCLI() {
  deploy_app();
}

function uploadDataCLI() {
  deploy_data();
}

module.exports = {
  run,
};
