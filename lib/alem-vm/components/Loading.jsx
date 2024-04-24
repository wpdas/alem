const Container = styled.div`
  display: flex;
  margin-top: 40%;
  justify-content: center;
  width: 100%;
`;

const Loading = () => (
  <Container>
    <div className="spinner-border text-secondary" role="status" />
  </Container>
);
