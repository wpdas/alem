/* *
 * Handle the JSON, Text data under apps
 * */

const {
  removeComments,
} = require("./parse");
const fs = require("fs");
const path = require("path");

const distFolder = process.env.DIST_FOLDER || "build";

// generate data.json file
function generate_data_json() {
  let fileContent = fs.readFileSync(path.join(".", "bos.config.json"), "utf8");

  fileContent = removeComments(fileContent).replace(/\s/g, ""); // remove comments and spaces
  fileContent = JSON.parse(fileContent);

  // prepare fields for data.json structure
  let metadataFields = {};
  Object.keys(fileContent).forEach((key) => {
    if (key === 'tags') {
      metadataFields['tags'] = {};
      fileContent['tags'].forEach((tag) => {
        metadataFields['tags'][tag] = ""
      })
    } else if (key !== 'appAccount') {
      metadataFields[key] = fileContent[key];
    }
  })

  // data.json structure
  const data = {
    widget: {
      Index: {
        metadata: {
          ...metadataFields
        }
      }
    }
  };

  const dataPath = path.join(".", distFolder, "data.json");

  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}
module.exports = {
  generate_data_json,
};
