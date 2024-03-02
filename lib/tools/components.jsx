const AlemSpinner = () => {
  const ldsRipple = styled.keyframes`
    0% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 0;
    }
    4.9% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 0;
    }
    5% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      top: 0px;
      left: 0px;
      width: 72px;
      height: 72px;
      opacity: 0;
    }
  `;

  const SpinnerContainer = styled.div`
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;

    div {
      position: absolute;
      border: 4px solid #000000;
      opacity: 1;
      border-radius: 50%;
      animation-timing-function: cubic-bezier(0, 0.2, 0.8, 1);
      animation-name: ${ldsRipple};
      animation-duration: 1s;
      animation-iteration-count: infinite;
    }

    div:nth-child(2) {
      animation-delay: -0.5s;
    }
  `;

  return (
    <div style={{ margin: "auto", paddingTop: "236px", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SpinnerContainer>
          <div></div>
          <div></div>
        </SpinnerContainer>
      </div>
    </div>
  );
};
