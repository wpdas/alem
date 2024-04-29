import { LinkProps, useContext, navigate } from "../alem-vm";

/**
 * Link to access routes.
 */
export const RouteLink = ({
  to,
  href,
  target,
  params,
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
      navigate.to(to, params);
    }
  };

  if (routeContext.routeType === "URLBased") {
    let strParams = "";

    // Process params
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        strParams += `&${paramKey}=${params[paramKey]}`;
      });
    }

    // Evita o refresh da pagina
    const Link = styled("Link")``;

    return (
      <Link
        onClick={onClickHandler}
        className={className}
        style={{ cursor: "pointer", textDecoration: "none", ...style }}
        target={target}
        href={
          href
            ? href
            : `?${routeContext.routeParameterName || "path"}=${to}${strParams}`
        }
      >
        {label || children}
      </Link>
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
