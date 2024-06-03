/**
 * This file uses Widget's src to get the App Widget.
 *
 * It's used when the alem config "ejectStatefulComponents" is true
 */
const AlemApp = useMemo(() => {
  if (!props.alem.ready) {
    return "";
  }

  const widgetLayer2code = `
  const props = {
    ...props,
    // ==================================== Modules Code ====================================
    alem: {
      ...props.alem,
      // m = modulesCode, está sendo usado "m" para reduzir o bundle final
      m: {
        MODULES_CODE: {},
      },
    }
  };

  return (
    <Widget loading=" " src={"APP_INDEXER_WIDGET_SRC"} props={props} />
  )
  `;

  // staging.potlock.near/widget/potlock.ConfigForm

  return (
    <AlemTheme>
      <Widget
        loading=" "
        code={widgetLayer2code}
        props={{ alem: props.alem }}
      />
    </AlemTheme>
  );
}, [props.alem.ready, props.alem.alemExternalStylesBody, props.alem.rootProps]);

return AlemApp;
