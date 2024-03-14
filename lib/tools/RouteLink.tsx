import { _alemRouteParameterName, _alemRouteType, navigate } from "./tools";

type RouteLinkProps = {
  to: string;
  children: JSX.Element;
  className?: string;
  onClick?: () => void;
};

/**
 * Route Link to access routes.
 */
export const RouteLink = ({
  to,
  children,
  className,
  onClick,
}: RouteLinkProps) => {
  // console.log("FOOOO:", _alemRouteType);
  // if (_alemRouteType === "URLBased") {
  //   if (onClick) {
  //     onClick();
  //   }
  //   return (
  //     <a
  //       className={className}
  //       style={{ cursor: "pointer", textDecoration: "none" }}
  //       href={`?${_alemRouteParameterName || "path"}=${to}`}
  //     >
  //       {children}
  //     </a>
  //   );
  // }

  const onClickHandler = () => {
    if (onClick) {
      onClick();
    }
    navigate(to);
  };

  return (
    <div
      style={{ cursor: "pointer", textDecoration: "none" }}
      onClick={onClickHandler}
    >
      {children}
    </div>
  );
};
