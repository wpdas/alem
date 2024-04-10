const AlemApp = useMemo(() => {
  if (!props.alem.ready) {
    return "";
  }

  return (
    <AlemTheme>
      <Widget
        loading=" "
        code={props.alem.componentsCode.App}
        props={{ alem: props.alem }}
      />
    </AlemTheme>
  );
}, [props.alem.ready, props.alem.alemExternalStylesBody, props.alem.rootProps]);

return AlemApp;
