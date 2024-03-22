const path = require("path");
const fs = require("fs");

// Save final file schemas
const saveFileSchemas = (finalFileSchemas) => {
  fs.writeFileSync(
    path.join(`./build/src/fileSchemas.json`),
    JSON.stringify(finalFileSchemas, null, 2),
  );
};

module.exports = saveFileSchemas;
