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
 * @returns {boolean} fonts loaded?
 */
export declare const loadFonts: (fontURLs: string[]) => boolean;

/**
 * Load external css files using their URLs.
 *
 * Usage example:
 *
 * ```
 * const stylesLoaded = loadExternalStyles(["https://cdn.jsdelivr.net/gh/codemirror/codemirror5/lib/codemirror.css"]);
 * console.log(stylesLoaded); // true / false
 * ```
 *
 * @returns {boolean} css files loaded?
 */
export declare const loadExternalStyles: (fontURLs: string[]) => boolean;

/**
 * Call resolve or reject for a given caller
 * E.g:
 * ```
 * const getStorage = () => Storage.get('my-key');
 * const resolve = (storageData) => console.log(storageData);
 * const reject = () => console.log('Error');
 * const timeout = 5000; // 5sec
 * promisify(getStorage, resolve, reject, timeout);
 * ```
 *
 * Default timeout is 10 seconds
 */
export declare const promisify: (
  caller: () => any,
  resolve: (data: any) => void,
  reject?: () => void,
  _timeout?: number,
) => void;
