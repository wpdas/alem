// TODO: Documentar isso

// ou useContext

import { State, props, state } from "./alem-vm";

// useContext
const createContext = (
  contextKey: string,
  defaultStateValue: {},
  defaultPropsValue: {} | void,
) => {
  console.log("Create Context Check", state);
  if (!state || (state[contextKey] && !state[contextKey].initialized)) {
    State.update({
      ...state,
      ...defaultStateValue,
      [contextKey]: { initialized: true },
    });
  }

  props = {
    ...props,
    ...state,
    ...defaultPropsValue,
  };
};

export default createContext;
