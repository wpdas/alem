const path = require("path");
const fs = require("fs");

const loadPreviousFileInfo = () => {
  const filesInfoRaw = fs.readFileSync(path.join(`./build/filesInfo.json`));
  const filesInfo = JSON.parse(filesInfoRaw);
  return {
    hasError: false,
    fileSchemas: filesInfo,
  };
};

module.exports = loadPreviousFileInfo;
