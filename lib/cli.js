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
    .option(
      "-n, --network <network>",
      "Network where the app will be running",
      "mainnet",
    )
    .action((opts) => {
      dev(opts).catch((err) => {
        console.error(err);
        process.exit(1);
      });
    });
  program
    .command("build")
    .description("Build the project")
    .option(
      "-n, --network <network>",
      "Network where the app will be running",
      "mainnet",
    )
    .action((opts) => {
      build_with_log(opts).catch(console.error);
    });
  program
    .command("deploy")
    .description("Deploy the project")
    .option(
      "-n, --network <network>",
      "Network where the app should be deployed",
      "mainnet",
    )
    .action((opts) => {
      deploy_app(opts);
    });
  program
    .command("upload-metadata")
    .description("Upload metadata to SocialDB")
    .option(
      "-n, --network <network>",
      "Network where the metadata should be deployed",
      "mainnet",
    )
    .action((opts) => {
      deploy_data(opts);
    });

  program.parse();
}

module.exports = {
  run,
};
