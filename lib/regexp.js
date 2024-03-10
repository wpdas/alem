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

module.exports = {
  SPECIAL_CHARACTERS,
  SPECIAL_CHARACTERS_AND_SPACES,
  GET_ALL_BETWEEN_IMPORT_AND_FROM,
  SPACES,
  LINE_BREAKS,
  IMPORT_STATEMENT,
  IMPORT_STATEMENT_2,
  BETWEEN_QUOTES,
};
