## NEAR APIs and Components

The native NEAR VM (BOS) resources continue to function.

Get to know more about the BOS built in resources here: [https://docs.near.org/bos/api/state](https://docs.near.org/bos/api/state)

```tsx
// NOTE: These are just the BOS feature references types
import {
  Files,
  InfiniteScroll,
  IpfsImageUpload,
  Markdown,
  Near,
  OverlayTrigger,
  Social,
  State,
  Storage,
  Tooltip,
  TypeAhead,
  VM,
  Widget,
  asyncFetch,
  clipboard,
  context,
  fetch,
  props,
  state,
  useCache,
  useEffect,
  useState,
} from "alem";

export const ComponentC = () => {
  console.log(props); // will print the widget props

  return <ComponentA name="Wendz" />;
};
```
