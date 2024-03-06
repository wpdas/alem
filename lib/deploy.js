const { read_bos_config } = require("./config");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { log } = require("./utils");

const distFolder = process.env.DIST_FOLDER || "build";

function deploy_app() {
  const config = read_bos_config();
  const account = config.account;

  if (!account) {
    console.error(`App account is not defined. Skipping deployment.`);
    return;
  }

  const packageRoot = path.resolve(__dirname, "..");
  const bosBinaryPath = path.join(packageRoot, "node_modules", ".bin", "bos");

  const command = [
    bosBinaryPath,
    "components",
    "deploy",
    `'${account}'`,
    "sign-as",
    `'${account}'`,
    "network-config",
    "mainnet",
  ].join(" ");

  try {
    execSync(command, {
      cwd: path.join(distFolder),
      stdio: "inherit",
    }).toString();
    log.sucess(`DApp ${config.name} Deployed to NEAR BOS.`);
  } catch (error) {
    log.error(`Error deploying dApp:\n${error.message}`);
  }
}

function deploy_data() {
  const config = read_bos_config();
  const account = config.account;

  if (!account) {
    console.error(`App account is not defined. Skipping data upload.`);
    return;
  }

  const dataJSON = fs.readFileSync(
    path.join(distFolder, "src", "data.json"),
    "utf8",
  );
  const args = {
    data: {
      [account]: JSON.parse(dataJSON),
    },
  };

  const argsBase64 = Buffer.from(JSON.stringify(args)).toString("base64");

  const packageRoot = path.resolve(__dirname, "..");
  const nearBinaryPath = path.join(packageRoot, "node_modules", ".bin", "near");

  const command = [
    nearBinaryPath,
    "contract",
    "call-function",
    "as-transaction",
    "social.near",
    "set",
    "base64-args",
    `'${argsBase64}'`,
    "prepaid-gas",
    "'300.000 TeraGas'",
    "attached-deposit",
    "'0.001 NEAR'",
    "sign-as",
    account,
    "network-config",
    "mainnet",
  ].join(" ");

  try {
    execSync(command, {
      cwd: path.join(distFolder, "src"),
      stdio: "inherit",
    }).toString();
    console.log(`Uploaded data for ${config.name}`);
  } catch (error) {
    console.error(`Error uploading data:\n${error.message}`);
  }
}

module.exports = {
  deploy_app,
  deploy_data,
};
