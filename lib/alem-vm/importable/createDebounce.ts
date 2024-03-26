/**
 * Create a debounced method to obtain the data after the desired interval.
 * @param cb Callback
 * @param timeout Timeout. Default is 1 sec.
 * @returns
 */
const createDebounce = <D>(cb: (data: D) => void, timeout?: number) => {
  let timer;
  const _timeout = timeout || 1000;
  return (args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cb(args as D);
    }, _timeout);
  };
};

export default createDebounce;
