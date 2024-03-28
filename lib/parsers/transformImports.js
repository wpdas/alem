const babel = require("@babel/core");
const t = require("@babel/types");
const presetTypescriptPath = require("./presetTypescriptPath");
const presetReactPath = require("./presetReactPath");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Função usada para trocar items do import e seu caminho
 *
 * Isso é útil para quando se tem de injetar os itens importáveis do Além.
 *
 * Ex:
 *
 * Entrada:
 *
 * import { Router, createRoute, useParams } from "alem";
 * import { AboutPage } from "./pages/About/About";
 * import { RoutesPath } from "./routeProps";
 * ...resto do codigo
 *
 * Chama funcao: const output = transformImports(code, "Router", newItemPath);
 *
 * Saida:
 *
 * import { Router } from "./novo/caminho/para/Router";
 * import { createRoute, useParams } from "alem";
 * import { AboutPage } from "./pages/About/About";
 * import { RoutesPath } from "./routeProps";
 * ...resto do codigo
 *
 * @param {string} code
 * @param {string} itemToRemove
 * @param {string} newPath
 * @returns
 */
function transformImports(code, itemToRemove, newPath) {
  const filename = "file.tsx";
  const ast = babel.parse(code, {
    sourceType: "module",
    filename: filename,
    presets: [presetReactPath, presetTypescriptPath],
  });

  let importAdded = false;

  traverse(ast, {
    ImportDeclaration(path) {
      const specifiers = path.node.specifiers;
      const indexToRemove = specifiers.findIndex(
        (specifier) =>
          t.isImportSpecifier(specifier) &&
          specifier.imported.name === itemToRemove,
      );

      if (indexToRemove !== -1) {
        // Remove o specifier do import
        specifiers.splice(indexToRemove, 1);

        if (specifiers.length === 0) {
          path.remove(); // Remove o statement de import se não houver mais specifiers
        }

        importAdded = true; // Marca que um novo import precisa ser adicionado
      }
    },
    Program: {
      exit(path) {
        // Se precisamos adicionar o import e ainda não o fizemos, fazemos isso ao sair do Program
        if (importAdded) {
          const newImportDeclaration = t.importDeclaration(
            [
              t.importSpecifier(
                t.identifier(itemToRemove),
                t.identifier(itemToRemove),
              ),
            ],
            t.stringLiteral(newPath),
          );
          path.node.body.unshift(newImportDeclaration); // Insere no início do arquivo
        }
      },
    },
  });

  return generate(ast, {}).code;
}

module.exports = transformImports;
