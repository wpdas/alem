/**
 * Call resolve or reject for a given caller
 * E.g:
 * const timeout = 5000 // 5sec
 * const getStorage = () => Storage.get('my-key');
 * promisify(getStorage, (storageData) => console.log(storageData), () => console.log('Error'), timeout)
 *
 * Default timeout is 10 seconds
 */
const promisify = (caller, resolve, reject, _timeout) => {
  const timer = 100;
  const timeout = _timeout || 10000;
  let timeoutCheck = 0;

  const find = () => {
    const response = caller();
    if (response !== undefined && response !== null) {
      resolve(response);
    } else {
      if (timeoutCheck < timeout) {
        // try again
        setTimeout(find, timer);
        timeoutCheck += timer;
      } else {
        if (reject) {
          reject(null);
        }
      }
    }
  };

  // Fist attempt
  find();
};
