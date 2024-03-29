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
  const routeContext = useContext<any>("alemRouterProvider");
  if (!routeContext) {
    console.error("Link component is being used without Router on top of it.");
  }

  const onClickHandler = () => {
    if (onClick) {
      onClick();
    }

    if (routeContext.alemRoutes.routeType === "ContentBased") {
      navigate(to);
    }
  };

  if (routeContext.alemRoutes.routeType === "URLBased") {
    return (
      <a
        onClick={onClickHandler}
        className={className}
        style={{ cursor: "pointer", textDecoration: "none", ...style }}
        href={`?${routeContext.alemRoutes.routeParameterName || "path"}=${to}`}
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
