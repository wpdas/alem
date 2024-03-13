// # TODAS AS CARACTERES ESPECIAIS
const SPECIAL_CHARACTERS = /[^0-9A-záéíóúàèìòùâêîôûãõç\s]/gm;
// # TODAS AS CARACTERES ESPECIAIS E ESPAÇOS
const SPECIAL_CHARACTERS_AND_SPACES = /[^0-9A-záéíóúàèìòùâêîôûãõç\s]|\s/gm;
// # TUDO ENTRE import e from
// ex: { AppBackground, AppContainer }
const GET_ALL_BETWEEN_IMPORT_AND_FROM = /(?<=import)(.*?)(?=from)/gm;
// # ALL SPACES
const SPACES = /\s/g;
// # LINE BREAKS
const LINE_BREAKS = /\r?\n|\r/g;
// # Pega todos os import statements, inclusive aqueles com quebra de linha
const GET_ALL_IMPORT_STATEMENT =
  /(import\s+.*?\s+from\s+['"].*?['"])|(import\s+({[\s\S]+?}|[^{}]+)\s+from\s+['"].*?['"])/g;
// # BETWEEN quotation marks
const BETWEEN_QUOTES = /(?<=")(.*?)(?=")/gm;

// ENTRE export const e =
const BETWEEN_EXPORT_CONST_AND_EQUAL = /(?<=export const)(.*?)(?==)/gm;

// ENTRE export let e =
const BETWEEN_EXPORT_LET_AND_EQUAL = /(?<=export let)(.*?)(?==)/gm;

// ENTRE export var e =
const BETWEEN_EXPORT_VAR_AND_EQUAL = /(?<=export var)(.*?)(?==)/gm;

// ENTRE export function e (
const BETWEEN_EXPORT_FUNCTION_AND_OPEN_PARENTHESE =
  /(?<=export function)(.*?)(?=\()/gm;

// ENTRE export default function e (
const BETWEEN_EXPORT_DEFAULT_FUNCTION_AND_OPEN_PARENTHESE =
  /(?<=export default function)(.*?)(?=\()/gm;

// VALOR DEPOIS DE export default
const AFTER_EXPORT_DEFAULT = /(?<=export default).*/gm;

const EXPORT_AND_EXPORT_DEFAULT = /export\s+default|export(?!\s+default)/g;

const USESTATE_VALUES = /(?<=\[)(.*?)(?=\]\s*=\s*useState)/g;

const ALL_BLANK_LINES = /^(?:[\t ]*(?:\r?\n|\r))+/gm;

module.exports = {
  SPECIAL_CHARACTERS,
  SPECIAL_CHARACTERS_AND_SPACES,
  GET_ALL_BETWEEN_IMPORT_AND_FROM,
  SPACES,
  LINE_BREAKS,
  GET_ALL_IMPORT_STATEMENT,
  BETWEEN_QUOTES,
  BETWEEN_EXPORT_CONST_AND_EQUAL,
  BETWEEN_EXPORT_LET_AND_EQUAL,
  BETWEEN_EXPORT_VAR_AND_EQUAL,
  BETWEEN_EXPORT_FUNCTION_AND_OPEN_PARENTHESE,
  BETWEEN_EXPORT_DEFAULT_FUNCTION_AND_OPEN_PARENTHESE,
  AFTER_EXPORT_DEFAULT,
  EXPORT_AND_EXPORT_DEFAULT,
  USESTATE_VALUES,
  ALL_BLANK_LINES,
};

// ENTRE export const e =
// util para
// export const Bla = ....
// ENCONTRA Bla
// (?<=export const)(.*?)(?=\=)

// ENTRE export default function e (
// util para
// export default function Bla(){....}
// ENCONTRA Bla
// (?<=export default function)(.*?)(?=\()

// export default Bla
// remover todos os "export default function"
// PROCURAR POR: "export default"
// (?<=export default function)(.*?)(?=\n|\r)
