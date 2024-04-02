const { cleanErrorMessage, scapeBacktick } = require("../helpers");

/**
 * Cria o elemento JSX para mostrar o Erro encontrado.
 * @param {string} error
 * @returns
 */
const renderErrorDisplay = (error) => `return <div
style={{
  backgroundColor: "#ffcccc",
  padding: "20px",
  margin: "20px 0",
  borderRadius: "8px",
}}
>
<h4 style={{ color: "#660000" }}>Syntax Error:</h4>
<pre
  style={{
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    color: "#990000",
  }}
>${`{\`${scapeBacktick(cleanErrorMessage(error))}\`}`}</pre>
</div>`;

module.exports = renderErrorDisplay;
