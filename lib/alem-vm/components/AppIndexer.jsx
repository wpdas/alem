const AlemApp = useMemo(() => {
  if (!props.alem.ready) {
    return "";
  }

  return (
    <AlemTheme>
      {iframeModulesCode && (
        <iframe
          style={{ height: 0, width: 0 }}
          srcDoc={iframeModulesCode}
          message={"init modules"}
          onMessage={(message) => {
            console.log("Message:", message);
          }}
        />
      )}
      <Widget
        loading=" "
        code={props.alem.componentsCode.App}
        props={{ alem: props.alem }}
      />
    </AlemTheme>
  );
}, [props.alem.ready, props.alem.alemExternalStylesBody]);

return AlemApp;
