const fs = require("fs");
const sucrase = require("sucrase");
const { EXPORT_AND_EXPORT_DEFAULT } = require("./regexp");

const sucraseOptions = {
  transforms: ["typescript", "jsx"],
  jsxRuntime: "preserve",
  enableLegacyBabel5ModuleInterop: true, // Preserve CommonJS import/export statements
  disableESTransforms: true,
};

// process file content
function process_file_content(
  fileContent,
  shouldTranspileTypescript,
  _removeImports = true,
) {
  if (shouldTranspileTypescript) {
    fileContent = transpileTypescript(fileContent);
  }

  // Remove imports and exports
  if (_removeImports) {
    fileContent = removeImports(fileContent);
  }
  fileContent = removeExports(fileContent);

  // return file content
  return fileContent;
}

// process each file (using its path)
// function process_file(filePath, { aliases, account }) {
function process_file(filePath) {
  let fileContent = fs.readFileSync(filePath, "utf8");

  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    fileContent = transpileTypescript(fileContent);
  }

  // Remove imports and exports
  fileContent = removeImports(fileContent);
  fileContent = removeExports(fileContent);

  // return file content
  return fileContent;
}

// transpile typescript files to valid BOS Lang
const transpileTypescript = (fileContent) => {
  const transpiledCode = sucrase.transform(fileContent, sucraseOptions).code;

  // replace the default export statement
  fileContent = transpiledCode.replace(/export\s+default\s+(\w+);/, "");

  return fileContent;
};

const ignoreFiles = (c) => /\/\*__@ignore__\*\//.test(c);

// no stringify json files
// const noStringifyJsonFiles = (c) => /\/\*__@noStringify__\*\//.test(c);
// const removeExports = (c) => c.replaceAll(EXPORT_AND_EXPORT_DEFAULT, "");
const removeExports = (code) => {
  //V2
  // Remove exports padrão e nomeados, mas mantém a linha (pode precisar ajustar a regex)
  const newCode = code
    .replace(/export\s+default\s+/g, "")
    .replace(/export\s+{\s*.*?\s*};/gs, "")
    .replace(/export\s+/g, "");

  return newCode;
};

const removeImports = (c) => {
  // Remove line breaks
  const importItems = c.match(/(import)(.*?)(from)/gs);
  // Uma vez encontrado os imports, deve alinhar todos em uma linha
  if (importItems) {
    importItems.forEach((item) => {
      // Replace items and put them in line
      const itemWithoutLineBreaks = item.replace(/\r?\n|\r/g, "");
      c = c.replace(item, itemWithoutLineBreaks);
    });
  }

  // Remove all import statements
  return c.replaceAll(
    /^(import)(?:.*?(as))?(?:.*?(as))?(?:.*?(from))*.*$/gm,
    "",
  );
};

const removeComments = (c) =>
  c.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*/g, "").trim();

const removeBlankLines = (c) => c.replace(/^\s*\n/gm, "");

const ENVIRONMENT_MARKER = ":::ENV:::";
const applyEnvironment = (c) =>
  c.replaceAll(ENVIRONMENT_MARKER, process.env.NODE_ENV || "production");

const minify = (c) =>
  c
    .replace(/\r?\n|\r/gm, "")
    .replace(/\s+/gm, " ")
    .trim();

/*
 * Injects the HTML with the given injections
 * @param {string} html
 * @param {object} injections
 * @returns {string} html
 *
 * Example:
 * const html = "<div>%title%</div>";
 * const injections = { title: "Hello World" };
 * const injectedHtml = injectHTML(html, injections);
 * console.log(injectedHtml); // <div>Hello World</div>
 */
const injectHTML = (html, injections) => {
  Object.keys(injections).forEach((key) => {
    html = html.replace(`%${key}%`, injections[key]);
  });
  return html;
};

module.exports = {
  process_file_content,
  process_file,
  ignoreFiles,
  removeComments,
  injectHTML,
  removeExports,
  removeImports,
  removeBlankLines,
  minify,
  applyEnvironment,
};
