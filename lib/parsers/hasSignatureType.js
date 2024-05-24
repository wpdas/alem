const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");

/**
 * Verifica se o componente é de um tipo específico, se for, retorna true, senão, false.
 *
 * ex:
 *
 * ```
 * const code = `const Foo: AsStateful = () => {...}`
 * const code2 = `const Foo: Other = () => {...}`
 * const signatureType = "AsStateful";
 *
 * hasSignatureType(code, signatureType); // true;
 * hasSignatureType(code2, signatureType); // false;
 * ```
 *
 * @param {*} code
 * @param {*} signatureType
 * @returns
 */
function hasSignatureType(code, signatureType) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  let found = false;

  traverse(ast, {
    VariableDeclarator(path) {
      if (
        path.node.id.typeAnnotation &&
        t.isTSTypeReference(path.node.id.typeAnnotation.typeAnnotation) &&
        path.node.id.typeAnnotation.typeAnnotation.typeName.name ===
          signatureType
      ) {
        found = true;
        path.stop();
      }
    },
    FunctionDeclaration(path) {
      if (
        path.node.returnType &&
        t.isTSTypeReference(path.node.returnType.typeAnnotation) &&
        path.node.returnType.typeAnnotation.typeName.name === signatureType
      ) {
        found = true;
        path.stop();
      }
    },
  });

  return found;
}

module.exports = hasSignatureType;
