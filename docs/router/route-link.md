<!-- Documentar sobre o novo formato e como estilizar -->
<!-- Exemplo de estilizacao -->

<!--
export const CustomButton = styled.div`
  a {
    padding: 0.75rem 1.5rem;
    border-radius: 30px;
    border: 1px solid #ccc;
    background-color: #fff;
    color: rgb(35 39 47);
    font-weight: 700;
    font-size: 17px;

    :hover {
      background-color: #fafafa;
    }
  }
`;

<CustomButton>
  <RouteAnchor to={RoutesPath.featureOverview.path} label="Learn Alem" />
</CustomButton> -->

## Route Link

This component creates a `<a />` element and is used to allow users to navigate between routes. You must inform the destination path using the `to` property. It also support `className`, `style` and `onClick` properties.

```tsx
import { RouteLink } from "alem";

export const SomeComponent = () => {
  return (
    <RouteLink to="profile">
      <p>Go to Profile</p>
    </RouteLink>
  );
};
```
