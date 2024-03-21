// TODO: Documentar isso

// ou useContext
import { State, props, state } from "alem";

// useContext
// ATENCAO: Deve ser usado somente por statefull components
const createContext = <S extends {}, P extends {}>(
  contextKey: string,
  defaultStateValue: S,
  defaultPropsValue: P | void,
) => {
  if (!state || (state[contextKey] && !state[contextKey].initialized)) {
    const stateKeys = Object.keys(defaultStateValue);
    const propsKeys = Object.keys(defaultPropsValue || {});
    let mainKeys = [...stateKeys, ...propsKeys];

    // Remove duplicate
    mainKeys = mainKeys.filter(
      (item, index) => mainKeys.indexOf(item) === index,
    );

    State.update({
      ...state,
      ...defaultStateValue,
      [contextKey]: { initialized: true, keys: mainKeys },
    });
  }

  props = {
    ...props,
    ...state,
    ...defaultPropsValue,
  };
};

export default createContext;

// TODO: talvez criar um createStore / useStore usando a mesma estrutura mas com localstorage?
