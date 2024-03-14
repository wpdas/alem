// NOTE: Funciona, mas atualiza o estado da aplicação principal
// const [_currentParameterName, set_currentParameterName] = useState("path");
// useEffect(() => {
//   routeUpdateObservable.subscribe((routesData) => {
//     set_currentParameterName(routesData.activeRoute);
//   });
// }, []);

/**
 * useParams
 *
 * Get to know the URL params excluding the "path" prop
 *
 * @returns
 */
export const useParams = () => {
  // return _alemProps;

  // const parameterName = _currentParameterName;
  // // Remove "path" (being used internally)
  // const currentProps = _alemProps;
  // console.log("ALEM PROPS:", parameterName);

  // // console.log("useParams, Get Route Props", _alemGetRoutePropsMethod);
  // if (Object.keys(currentProps).includes(parameterName)) {
  //   delete currentProps[parameterName];
  // }
  return _alemProps;
};

//TODO: Nao funcionou
