const os = require("os");

const ALEM_VM_FOLDER = "alem-vm";
const isWindows = os.platform().includes("win32");

module.exports = {
  ALEM_VM_FOLDER,
  isWindows,
};
