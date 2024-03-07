## Route Link

This component is used to allow users to navigate between routes. You must inform the destination path using the `to` property.

```tsx
import { RouteLink } from "alem/router";

export const SomeComponent = () => {
  return (
    <RouteLink to="profile">
      <p>Go to Profile</p>
    </RouteLink>
  );
};
```