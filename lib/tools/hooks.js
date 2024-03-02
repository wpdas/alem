const useQuery = () => {
  // Remove "path" (being used internally)
  if (Object.keys(props).includes("path")) {
    delete props.path;
  }
  return props;
};
