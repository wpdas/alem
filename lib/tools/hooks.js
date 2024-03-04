const useParams = () => {
  // Remove "path" (being used internally)
  if (Object.keys(props).includes("path")) {
    delete props.path;
  }
  return props;
};

const useLocation = () => {
  const { activeRoute, routes } = useAlemLibRoutesStore();
  return {
    pathname: activeRoute,
    routes,
  };
};
