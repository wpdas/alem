const useParams = () => {
  const { parameterName } = useAlemLibRoutesStore();
  // Remove "path" (being used internally)
  if (Object.keys(props).includes(parameterName)) {
    delete props[parameterName];
  }
  return props;
};

const useLocation = () => {
  const { activeRoute, routes } = useAlemLibRoutesStore();
  return {
    pathname: activeRoute,
    routes,
    isRoutesReady: routes && routes.length > 0,
  };
};
