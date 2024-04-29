const fs = require("fs");
const { glob } = require("glob");
const path = require("path");

/**
 * Loop through all the folders in the specified folder and run the callback if provided, and return the folders
 * @param {string} folder
 * @param {function} fn
 * @returns {string[]} folders
 */
function for_folder(folder, fn) {
  try {
    const folders = fs
      .readdirSync(folder)
      .map((file) => path.join(folder, file));
    if (fn) {
      for (const folder of folders) {
        fn(folder);
      }
    }
    return folders;
  } catch (error) {
    process.stderr.write(`Error reading folder: ${folder}\n${error}`);
    return [];
  }
}

/**
 * Loop through all the files in the specified folder and run the callback if provided, and return the files
 * @param {string} folder
 * @param {function} fn
 * @param {string[]} extensions
 * @returns {string[]} files as path object
 */

function for_rfile(folder, extensions, fn) {
  try {
    let files;
    if (extensions) {
      files = glob.sync(`${folder}/**/*.{${extensions.join(",")}}`, {
        windowsPathsNoEscape: true,
      });
    } else {
      files = glob.sync(`${folder}/**/*`, {
        windowsPathsNoEscape: true,
      });
    }
    files = files.map((file) => path.join(file));
    if (fn) {
      for (const file of files) {
        fn(file);
      }
    }
    return files;
  } catch (error) {
    process.stderr.write(`Error reading folder: ${folder}\n${error}`);
    return [];
  }
}

/**
 * Creates the dist folder for the {appName} app, and copies all the widget files to it
 * @param {string} distFolder
 */
function create_dist(distFolder) {
  // NOTE: Should save file to build/src. bos-cli-rs recognizes components inside ./src only
  const distPath = path.join(".", distFolder, "src");
  try {
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true });
    }
    fs.mkdirSync(distPath, { recursive: true });
  } catch (error) {
    process.stderr.write(`Error creating folder: ${distPath}\n${error}`);
  }

  return distPath;
}

const log = {
  loading: (text = "", enabledots = true) => {
    let x = 0;
    const chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const dots = [
      "   ",
      "   ",
      ".  ",
      ".  ",
      ".  ",
      ".. ",
      ".. ",
      ".. ",
      "...",
      "...",
      "...",
    ];
    const delay = 80;

    const interval = setInterval(function () {
      // change dots slower than the chars
      process.stdout.write(
        "\r" +
          chars[x++] +
          " " +
          text +
          (enabledots ? dots[x % dots.length] : ""),
      );
      x = x % chars.length;
    }, delay);

    return {
      finish: (text1 = text) => {
        clearInterval(interval);
        process.stdout.write(
          "\r\x1b[32m\x1b[1m\u2713\x1b[0m " +
            text1 +
            "                                      \n",
        );
      },
      error: (text1 = text) => {
        clearInterval(interval);
        process.stdout.write(
          "\r\x1b[31m\x1b[1m\u2717\x1b[0m " +
            text1 +
            "                                      \n",
        );
      },
    };
  },
  error: (text) => {
    process.stdout.write("\x1b[31m\x1b[1m\u2717\x1b[0m " + text + "\n");
  },
  sucess: (text) => {
    process.stdout.write("\x1b[32m\x1b[1m\u2713\x1b[0m " + text + "\n");
  },
  info: (text) => {
    process.stdout.write("\x1b[34m\x1b[1m⋅\x1b[0m " + text + "\n");
  },
  log: (text) => {
    process.stdout.write(text + "\n");
  },
};

/**
 * Generates random hexadecimal value
 * @param {number} size
 * @returns
 */
const get_randon_hexadecimal = function (size) {
  let maxlen = 8;
  let min = Math.pow(16, Math.min(size, maxlen) - 1);
  let max = Math.pow(16, Math.min(size, maxlen)) - 1;
  let n = Math.floor(Math.random() * (max - min + 1)) + min;
  let r = n.toString(16);
  while (r.length < size) {
    r = r + get_randon_hexadecimal(size - maxlen);
  }
  return r;
};

const get_random_character = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters.charAt(randomIndex);
};

const capitalize_first_letter = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

let nameChangeCounter = 0;
/**
 * Generate new name
 * @param {boolean} _toLowerCase
 */
const create_new_name = (_toLowerCase = false) => {
  // let randomHexName = get_randon_hexadecimal(6);
  // return capitalize_first_letter(
  //   `${get_random_character()}${get_random_character()}_${randomHexName}`,
  // );
  nameChangeCounter++;

  // if (_toLowerCase) {
  //   return `${get_random_character()}_${nameChangeCounter}`;
  // }

  // return capitalize_first_letter(
  //   `${get_random_character()}_${nameChangeCounter}`,
  // );

  if (_toLowerCase) {
    return `a_${nameChangeCounter}`;
  }

  return capitalize_first_letter(`a_${nameChangeCounter}`);
};

const reset_name_counter = () => (nameChangeCounter = 0);

module.exports = {
  create_dist,
  for_rfile,
  for_folder,
  log,
  get_randon_hexadecimal,
  get_random_character,
  capitalize_first_letter,
  create_new_name,
  reset_name_counter,
};
