/**
 * Load external fonts using their URLs. You can use any fonts source.
 *
 * E.g.: Fonts source: https://www.cdnfonts.com/
 *
 * Usage example:
 *
 * ```
 * const fontsLoaded = loadFonts(["https://fonts.cdnfonts.com/css/display"]);
 * console.log(fontsLoaded); // true / false
 * ```
 *
 * @returns {boolean} fonts loaded and ready?
 */
export declare const loadFonts: (fontURLs: string[]) => boolean;
