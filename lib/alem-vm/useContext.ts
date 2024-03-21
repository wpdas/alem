import { props } from "alem";

// Só pode ser usado quando existir o contexto correlacionado ao "contextKey"
const useContext = <D>(contextKey: string) => {
  const wasContextInitialized = props[contextKey].initialized;
  if (!wasContextInitialized) {
    console.error(
      `Context "${contextKey}" not found. You must call createContext() before using it down the tree!`,
    );
    return;
  }
  const contextKeys: string[] = props[contextKey].keys;
  const contextItems: Record<string, any> = {};

  contextKeys.forEach((key: string) => {
    contextItems[key] = props[key];
  });

  return contextItems as D;
};

export default useContext;
