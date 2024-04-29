const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const removeGetNameAndLastComma = require("./removeGetNameAndLastComma");
const generate = require("@babel/generator").default;

/**
 * Dado um código, filtra quais as chaves devem permanecer no return dessa função dentro do código.
 *
 * Exemplo de entrada:
 *
 * const code = `() => {
 * const myFirstModule = props.alem.m["a_1"]().myFirstModule;
 * const DependeciaNormal = () => {
 *   return <h4>DependeciaNormal: {myFirstModule.getIt}</h4>;
 * };
 * const Modulo = () => {
 *   return <>
 *     <h4>Modulo: {myFirstModule.getIt}</h4>
 *     <DependeciaNormal />
 *   </>;
 * };
 * return {
 *   myFirstModule: myFirstModule,
 *   DependeciaNormal: DependeciaNormal,
 *   Modulo: Modulo
 *  };
 *  }`
 *
 * console.log(code, ["Modulo", "myFirstModule"]);
 *
 * Saída:
 *
 * () => {
 * const myFirstModule = props.alem.m["a_1"]().myFirstModule;
 * const DependeciaNormal = () => {
 *   return <h4>DependeciaNormal: {myFirstModule.getIt}</h4>;
 * };
 * const Modulo = () => {
 *   return <>
 *     <h4>Modulo: {myFirstModule.getIt}</h4>
 *     <DependeciaNormal />
 *   </>;
 * };
 * return {
 *   myFirstModule: myFirstModule,
 *   Modulo: Modulo
 * };
 * };
 *
 *
 * @param {*} code
 * @param {*} keys
 * @returns
 */
function filterReturn(code, keys) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"], // Habilita o suporte para sintaxe JSX
  });

  traverse(ast, {
    ReturnStatement(path) {
      // Checa se o retorno é um objeto
      if (t.isObjectExpression(path.node.argument)) {
        const properties = path.node.argument.properties;
        // Filtra as propriedades para manter apenas as chaves especificadas
        const filteredProperties = properties.filter((prop) => {
          // console.log("Prop =====>", prop);
          // console.log("Prop Name =====>", prop.key?.name);
          return keys.includes(prop.key?.name);
        });
        // Substitui as propriedades do objeto de retorno pelas filtradas
        path.node.argument.properties = filteredProperties;
      }
    },
  });

  // Gera o novo código a partir do AST modificado
  const { code: newCode } = generate(ast);
  return removeGetNameAndLastComma(newCode);
}

module.exports = filterReturn;
