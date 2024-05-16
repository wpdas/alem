/* *
 * Handle the JSON, Text data under apps
 * */

const { removeComments } = require("./parse");
const fs = require("fs");
const path = require("path");
const { has_special_characters, log } = require("./utils");

const distFolder = process.env.DIST_FOLDER || "build";

// generate data.json file
function generate_data_json() {
  let fileContent = fs.readFileSync(path.join(".", "alem.config.json"), "utf8");

  fileContent = removeComments(fileContent); // remove comments and spaces
  fileContent = JSON.parse(fileContent);

  // prepare fields for data.json structure
  let metadataFields = {};
  Object.keys(fileContent).forEach((key) => {
    if (key === "tags") {
      metadataFields["tags"] = {};
      fileContent["tags"].forEach((tag) => {
        metadataFields["tags"][tag] = "";
      });
    }

    if (
      key === "isIndex" ||
      key === "mainnetAccount" ||
      key === "testnetAccount" ||
      key === "compilerOptions" ||
      key === "options" ||
      key === "tags" ||
      key === "modules" ||
      key === "plugins"
    ) {
      return;
    }

    metadataFields[key] = fileContent[key];
  });

  // Check if project's name has special characters
  if (has_special_characters(fileContent.name)) {
    log.error("The project name cannot contain special characters.");
    process.exit(1);
  }

  // Get the project name
  const projectName = fileContent.name.replaceAll(" ", "-").toLowerCase();

  // data.json structure
  const data = {
    widget: {
      [fileContent.isIndex ? "Index" : projectName]: {
        metadata: {
          ...metadataFields,
        },
      },
    },
  };

  // Note: must save inside a ./src folder. This is the only folder bos-clir-rs recognizes
  const dataPath = path.join(".", distFolder, "src", "data.json");

  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}
module.exports = {
  generate_data_json,
};
