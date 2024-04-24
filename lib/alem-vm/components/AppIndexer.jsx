const AlemApp = useMemo(() => {
  if (!props.alem.ready) {
    return "";
  }

  const Container = styled.div`
    display: flex;
    margin-top: 48%;
    justify-content: center;
    width: 100%;
  `;

  const Loading = () => (
    <Container>
      <div className="spinner-border text-secondary" role="status" />
    </Container>
  );

  return (
    <AlemTheme>
      <Widget
        loading={<Loading />}
        code={props.alem.componentsCode.App}
        props={{ alem: props.alem }}
      />
    </AlemTheme>
  );
}, [props.alem.ready, props.alem.alemExternalStylesBody, props.alem.rootProps]);

return AlemApp;
