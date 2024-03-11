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
// # IMPORT STATEMENT. ex: import { AppBackground, AppContainer } from "./styles";
const IMPORT_STATEMENT = /^(import)(?:.*?(as))?(?:.*?(as))?(?:.*?(from))*.*$/gm;
const IMPORT_STATEMENT_2 =
  /^[ \t]*(import)\s+(?:\{[^}]*\}|\w+)\s+(from\s+)?["']([^"']+)["'];?$/gm; // USAR ESSE!
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

module.exports = {
  SPECIAL_CHARACTERS,
  SPECIAL_CHARACTERS_AND_SPACES,
  GET_ALL_BETWEEN_IMPORT_AND_FROM,
  SPACES,
  LINE_BREAKS,
  IMPORT_STATEMENT,
  IMPORT_STATEMENT_2,
  BETWEEN_QUOTES,
  BETWEEN_EXPORT_CONST_AND_EQUAL,
  BETWEEN_EXPORT_LET_AND_EQUAL,
  BETWEEN_EXPORT_VAR_AND_EQUAL,
  BETWEEN_EXPORT_FUNCTION_AND_OPEN_PARENTHESE,
  BETWEEN_EXPORT_DEFAULT_FUNCTION_AND_OPEN_PARENTHESE,
  AFTER_EXPORT_DEFAULT,
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
