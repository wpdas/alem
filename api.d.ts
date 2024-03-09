/**
 * Load external fonts and css files using their URLs.
 *
 * You can use any fonts source.
 *
 * E.g.: Fonts source: https://www.cdnfonts.com/
 *
 *
 * Usage example:
 *
 * ```
 * const stylesLoaded = loadExternalStyles([
 * "https://fonts.cdnfonts.com/css/display",
 * "https://cdn.jsdelivr.net/gh/codemirror/codemirror5/lib/codemirror.css",
 * ]);
 *
 * console.log(stylesLoaded); // true / false
 * ```
 *
 * @returns {boolean} styles files loaded?
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

/**
 * Flag saying if it's a development environment
 */
export declare const isDevelopment: boolean;
