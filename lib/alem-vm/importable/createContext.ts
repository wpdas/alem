import { State, props, state } from "../alem-vm";

/**
 * Create context for statefull component and send context props to its children
 * @param contextKey Context key name (must be unique)
 * @param defaultStateValue Default values to be inserted to the Component's State
 * @param defaultPropsValue Default values to be inserted to the Component's props
 */
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
