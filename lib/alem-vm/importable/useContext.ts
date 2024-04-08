import { props } from "../alem-vm";

// Só pode ser usado quando existir o contexto correlacionado ao "contextKey"

/**
 * Use context. This is helpful to get a previous created context's props.
 *
 * @param contextKey Context key name
 * @returns
 */
const useContext = <D>(contextKey: string) => {
  // TODO: talvez tenha que procurar pelo state e pelo props ja que as vezes
  // é requerido o acesso ainda na raíz. (Isso nao é verdade pois o state é
  // compartilhado nas props)

  const wasContextInitialized = props[contextKey].initialized;
  if (!wasContextInitialized) {
    if (props.alem.isDevelopment) {
      console.warn(`Context "${contextKey}" not ready or not found.`);
    }
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
