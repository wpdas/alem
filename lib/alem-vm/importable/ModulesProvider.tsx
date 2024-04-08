import ModulesContext from "./ModulesContext";
import { ChildrenProps, ModuleResponseData, useContext } from "../alem-vm";

const ModulesProvider = ({ children }: ChildrenProps) => {
  ModulesContext();

  const modulesHandler = `
  <script>:::MODULES_SRC:::</script>
  <script>
    window.addEventListener("message", (event) => {
      if (event.data.code) {
        eval(event.data.code);
      }
    }, false);
  </script>
  `;

  const modules = useContext<any>("alemModulesContext");
  const calls = modules.calls;
  const callsKeys = Object.keys(calls);

  return (
    <>
      {callsKeys.map((callKey) => (
        <iframe
          style={{ height: 0, width: 0 }}
          srcDoc={modulesHandler}
          message={{
            code: calls[callKey].code,
          }}
          onMessage={(message: ModuleResponseData) => {
            if (message) {
              calls[message.forCallId].handler(message.response);
              modules.removeCall(message.forCallId);
            }
          }}
        />
      ))}
      {children}
    </>
  );
};

export default ModulesProvider;
