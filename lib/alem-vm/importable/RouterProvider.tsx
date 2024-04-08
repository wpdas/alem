import { ChildrenProps, RouterContext } from "../alem-vm";

const RouterProvider = ({ children }: ChildrenProps) => {
  RouterContext();

  return <>{children}</>;
};

export default RouterProvider;
