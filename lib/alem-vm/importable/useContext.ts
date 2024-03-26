import { props } from "../alem-vm";

// Só pode ser usado quando existir o contexto correlacionado ao "contextKey"

/**
 * Use context. This is helpful to get a previous created context's props.
 *
 * @param contextKey Context key name
 * @returns
 */
const useContext = <D>(contextKey: string) => {
  const wasContextInitialized = props[contextKey].initialized;
  if (!wasContextInitialized) {
    console.error(`Context "${contextKey}" not found.`);
    return {};
  }
  const contextKeys: string[] = props[contextKey].keys;
  const contextItems: Record<string, any> = {};

  contextKeys.forEach((key: string) => {
    contextItems[key] = props[contextKey][key];
  });

  return contextItems as D;
};

export default useContext;
