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
