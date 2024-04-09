// NOTA: Arquivo original antes da descoberta e uso do `Link`
// `Link` não está sendo usado pois falha quando se tentar voltar ou ir pra frente
// usando os botoes do navegador

import { LinkProps, navigate, useContext } from "../alem-vm";

/**
 * Link to access routes.
 */
export const RouteLink = ({
  to,
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

    return (
      <a
        onClick={onClickHandler}
        className={className}
        style={{ cursor: "pointer", textDecoration: "none", ...style }}
        href={`?${routeContext.routeParameterName || "path"}=${to}${strParams}`}
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
