const AlemApp = useMemo(() => {
  if (!props.alem.ready) {
    return "";
  }

  // Modules, Codes Wrapper, Recursos que dependem das propriedades globais devem ser colocadas em segunda camada, senão props retorna
  // sem os dados do além.
  // Todas as propriedades que dependem de algum recurso do Além deve ser colocado nessa segunda camada, por exemplo:
  // "props.alem.isDevelopment", "props.alem.getAlemEvironment()", etc
  // TODO: colocar isso em um arquivo?
  // TODO: 2 - colocar condicional para: se usar modulos, faz esse processo de usar o layer2, senao, carrega diretamente o APP como antes
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
  }

  return (
    <Widget loading=" " code={props.alem.componentsCode.App} props={props} />
  )
  `;

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
