import { State, props, state } from "../alem-vm";

const createContext = <S extends {}>(contextKey: string) => {
  const setDefaultData = (defaultStateValue: S) => {
    if (!state[contextKey] || !state[contextKey].initialized) {
      const stateKeys = Object.keys(defaultStateValue);
      // const propsKeys = Object.keys(defaultPropsValue || {});
      // let mainKeys = [...stateKeys, ...propsKeys];
      let mainKeys = [...stateKeys];

      // Remove duplicate
      mainKeys = mainKeys.filter(
        (item, index) => mainKeys.indexOf(item) === index,
      );

      State.update({
        ...state,
        // ...defaultStateValue,
        [contextKey]: {
          initialized: true,
          keys: mainKeys,
          ...defaultStateValue,
        },
      });

      // props = {
      //   ...props,
      //   ...state,
      //   [contextKey]: { ...state[contextKey], ...defaultPropsValue },
      // };
    }

    props = {
      ...props,
      ...state,
      // [contextKey]: { ...state[contextKey], ...defaultPropsValue },
      [contextKey]: { ...state[contextKey] },
    };
  };

  const updateData = (updates: Partial<S>) => {
    // NOTE: Tem que ser assim, passar o objeto pronto para o props,
    // antes estava pegando apenas o ...state mas estava falhando a atualizacao
    // das props
    const updatedState = { [contextKey]: { ...state[contextKey], ...updates } };

    State.update(updatedState);

    props = {
      ...props,
      ...updatedState,
    };
  };

  const getSelf = () => props[contextKey] as S;

  return {
    setDefaultData,
    updateData,
    getSelf,
  };
};

/**
 * Create context for stateful component and send context props to its children.
 * This can be useful if you'd like to perform some side effect whenever some context data changes.
 *
 * @param contextKey Context key name (must be unique)
 * @param defaultStateValue Default values to be inserted to the Component's State
 */
// const createContext = <S extends {}>(
//   contextKey: string,
//   defaultStateValue: S,
//   // defaultPropsValue: P | void,
// ) => {
//   // console.log("Context Key:", contextKey);
//   // console.log("State Context Key:", state[contextKey]);
//   // console.log("");

//   if (
//     !state[contextKey] ||
//     (state[contextKey] && !state[contextKey].initialized)
//   ) {
//     const stateKeys = Object.keys(defaultStateValue);
//     // const propsKeys = Object.keys(defaultPropsValue || {});
//     // let mainKeys = [...stateKeys, ...propsKeys];
//     let mainKeys = [...stateKeys];

//     // Remove duplicate
//     mainKeys = mainKeys.filter(
//       (item, index) => mainKeys.indexOf(item) === index,
//     );

//     State.update({
//       ...state,
//       // ...defaultStateValue,
//       [contextKey]: { initialized: true, keys: mainKeys, ...defaultStateValue },
//     });

//     // props = {
//     //   ...props,
//     //   ...state,
//     //   [contextKey]: { ...state[contextKey], ...defaultPropsValue },
//     // };
//   }

//   props = {
//     ...props,
//     ...state,
//     // [contextKey]: { ...state[contextKey], ...defaultPropsValue },
//     [contextKey]: { ...state[contextKey] },
//   };
// };

export default createContext;
