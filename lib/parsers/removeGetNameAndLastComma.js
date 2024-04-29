// Troca o "const Get = " por "()", isso porque o módulo é a função diretamente
// e remove o último ";" encontrado porque a função vai ser colocar em uma lista de objetos, ou seja,
// vai ter um "," separando cada objeto.
const removeGetNameAndLastComma = (code) => {
  // WARNING: enviar as props do escopo local como referencia para os módulos causa um perda significativa de desempenho
  // return code.replace("const Get = ()", "(props)").replace(/;(?=[^;]*$)/, "");
  return code.replace("const Get = ", "").replace(/;(?=[^;]*$)/, "");
};

module.exports = removeGetNameAndLastComma;
