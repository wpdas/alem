import { Alem } from "../state";

type RouteLinkProps = {
  to: string;
  children: JSX.Element;
  className?: string;
  onClick?: () => void;
  alem: Alem;
};

/**
 * Route Link to access routes.
 */
export const RouteLink = ({
  to,
  children,
  className,
  onClick,
  alem,
}: RouteLinkProps) => {
  console.log("LINKKKKKK:", children);
  if (alem.routeType === "URLBased") {
    if (onClick) {
      onClick();
    }
    return (
      <a
        className={className}
        style={{ cursor: "pointer", textDecoration: "none" }}
        href={`?${alem.routeParameterName || "path"}=${to}`}
      >
        {children}
      </a>
    );
  }

  const onClickHandler = () => {
    if (onClick) {
      onClick();
    }
    alem;
    alem.navigate(to);
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
