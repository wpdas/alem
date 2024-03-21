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
}: LinkProps) => {
  const routeContext = useContext<any>("alemRoutesProvider");
  if (!routeContext) {
    console.error("Link component is being used without Routes on top of it.");
  }

  console.log("VENDO:", routeContext);

  const onClickHandler = () => {
    if (onClick) {
      onClick();
    }

    if (routeContext.alemRoutes.routeType === "ContentBased") {
      navigate(to);
    }
  };

  if (routeContext.alemRoutes.routeType === "URLBased") {
    console.log("BUTICO LOKO ===> URLBased");
    return (
      <a
        onClick={onClickHandler}
        className={className}
        style={{ cursor: "pointer", textDecoration: "none", ...style }}
        href={`?${routeContext.alemRoutes.routeParameterName || "path"}=${to}`}
      >
        {label}
      </a>
    );
  }

  console.log("BRABO ===> ContentBased", to);

  return (
    <a
      style={{ cursor: "pointer", textDecoration: "none", ...style }}
      className={className}
      onClick={onClickHandler}
    >
      {label}
    </a>
  );
};
