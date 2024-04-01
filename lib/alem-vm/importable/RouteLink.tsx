import { LinkProps, navigate, useContext } from "../alem-vm";

/**
 * Link to access routes.
 */
export const RouteLink = ({
  to,
  label,
  className,
  style,
  onClick,
  children,
}: LinkProps) => {
  const routeContext = useContext<any>("alemRoutes");
  if (!routeContext) {
    console.error(
      "RouteLink component is being used without Router on top of it.",
    );
  }

  const onClickHandler = () => {
    if (onClick) {
      onClick();
    }

    if (routeContext.routeType === "ContentBased") {
      navigate(to);
    }
  };

  if (routeContext.routeType === "URLBased") {
    return (
      <a
        onClick={onClickHandler}
        className={className}
        style={{ cursor: "pointer", textDecoration: "none", ...style }}
        href={`?${routeContext.routeParameterName || "path"}=${to}`}
      >
        {label || children}
      </a>
    );
  }

  return (
    <a
      style={{ cursor: "pointer", textDecoration: "none", ...style }}
      className={className}
      onClick={onClickHandler}
    >
      {label || children}
    </a>
  );
};
