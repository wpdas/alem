import { Alem } from "../state";

type RouteLinkProps = {
  to: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  alem: Alem;
};

/**
 * Route Link to access routes.
 */
export const RouteLink = ({
  to,
  label,
  className,
  style,
  onClick,
  alem,
}: RouteLinkProps) => {
  if (alem.routeType === "URLBased") {
    if (onClick) {
      onClick();
    }
    return (
      <a
        className={className}
        style={{ cursor: "pointer", textDecoration: "none", ...style }}
        href={`?${alem.routeParameterName || "path"}=${to}`}
      >
        {/* // TODO: trocar todos os {children} ou {props.children} pelo valor de */}
        {/* children de fato */}
        {label}
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
    <a
      style={{ cursor: "pointer", textDecoration: "none", ...style }}
      className={className}
      onClick={onClickHandler}
    >
      {label}
    </a>
  );
};

// NOTE: a versao antiga tinha um erro, ela requeria um children, mas children nao é suportado pela VM,
// porém estou implementando uma forma de passar o valor da children direto para o objeto

// export const RouteLink = ({
//   to,
//   children,
//   className,
//   onClick,
//   alem,
// }: RouteLinkProps) => {
//   console.log("LINKKKKKK:", children);
//   if (alem.routeType === "URLBased") {
//     if (onClick) {
//       onClick();
//     }
//     return (
//       <a
//         className={className}
//         style={{ cursor: "pointer", textDecoration: "none" }}
//         href={`?${alem.routeParameterName || "path"}=${to}`}
//       >
//         {/* // TODO: trocar todos os {children} ou {props.children} pelo valor de */}
//         {/* children de fato */}
//         {children}
//       </a>
//     );
//   }

//   const onClickHandler = () => {
//     if (onClick) {
//       onClick();
//     }
//     alem;
//     alem.navigate(to);
//   };

//   return (
//     <div
//       style={{ cursor: "pointer", textDecoration: "none" }}
//       onClick={onClickHandler}
//     >
//       {children}
//     </div>
//   );
// };
