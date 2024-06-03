import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Widget } from "near-social-vm";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "index.scss";
import useRedirectMap from "./useRedirectMap";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  BrowserRouter,
} from "react-router-dom";
import { useHashRouterLegacy } from "./useHashRouterLegacy";
import { useAuth } from "./useAuth";
import { NavigationWrapper } from "./navigation/NavigationWrapper";
import { flags } from "../config/flags";

function Viewer({ widgetSrc, code }) {
  const [widgetProps, setWidgetProps] = useState({});
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setWidgetProps(
      Array.from(searchParams.entries()).reduce((props, [key, value]) => {
        props[key] = value;
        return props;
      }, {})
    );
  }, [location]);

  let src;

  if (!code) {
    // prioritize code if provided
    src = widgetSrc || location.pathname.substring(1);
    if (src) {
      src = src.substring(src.lastIndexOf("/", src.indexOf(".near")) + 1);
    } else {
      src = "sking.near/widget/Explorer";
    }
  }

  const { components: redirectMap } = useRedirectMap();

  return (
    <div className="container-xl">
      <div className="row">
        <div
          className="position-relative"
          style={{
            "--body-top-padding": "24px",
            paddingTop: "var(--body-top-padding)",
          }}
        >
          <Widget
            src={src}
            code={code}
            props={widgetProps}
            config={{ redirectMap }}
          />
        </div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const { components: redirectMap } = useRedirectMap();
  const widgets = {};

  // Force going to the main widget src (indexer)
  if (location.pathname === "/" && flags.mainWidgetSrc) {
    navigate(flags.mainWidgetSrc);
    return "";
  }

  Object.keys(redirectMap).forEach((key) => {
    const parts = key.split("/widget/");
    if (!widgets[parts[0]]) {
      widgets[parts[0]] = [];
    }
    widgets[parts[0]].push(parts[1]);
  });

  let account;
  let widgetName;

  const widgetKey = Object.keys(redirectMap);
  if (widgetKey.length > 0) {
    const widgetKeyParts = widgetKey[0].split("/widget/");
    account = widgetKeyParts[0];
    widgetName = widgetKeyParts[1];
  }

  if (!widgetName) {
    return (
      <div className="container">
        <div className="row mb-2 mt-4">
          <ul className="list-group">
            <li className="list-group-item">No widgets found</li>
          </ul>
        </div>
      </div>
    );
  }

  navigate(`${account}/widget/${widgetName}`);

  return "";
}

function App() {
  useHashRouterLegacy();

  const passProps = useAuth();
  const { EthersProviderContext, ethersProviderContext } = passProps;

  return (
    <EthersProviderContext.Provider value={ethersProviderContext}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="*"
          element={
            <>
              {!flags.hideAlemBar && <NavigationWrapper {...passProps} />}
              <Viewer {...passProps} />
            </>
          }
        />
      </Routes>
    </EthersProviderContext.Provider>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
