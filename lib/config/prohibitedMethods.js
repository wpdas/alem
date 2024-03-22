/**
 * Métodos que não devem ser passados como parametros explicitos, já que existem em cada contexto de Widget
 */
const PROHIBITED_METHODS = [
  "styled",
  "useState",
  "useEffect",
  "state",
  "State",
  "VM",
  "Tooltip",
  "TypeAhead",
  "InfiniteScroll",
  "OverlayTrigger",
  "Files",
  "IpfsImageUpload",
  "Social",
  "Near",
  "clipboard",
  "Storage",
  "useCache",
  "asyncFetch",
  "fetch",
  "Markdown",
  "Widget",
  "context",
  "props",
];

module.exports = PROHIBITED_METHODS;
