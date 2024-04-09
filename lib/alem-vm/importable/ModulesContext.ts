import { createContext } from "../alem-vm";

const ModulesContext = () => {
  const { setDefaultData, updateData, getSelf } =
    createContext<any>("alemModulesContext");

  setDefaultData({
    calls: {},

    //
    callModule: (
      setupCode: string,
      code: string,
      callId: number,
      onComplete: (data: any) => void,
    ) => {
      if (!code || !callId) return;

      const codeStructure = `
      ${setupCode};
      event.source.postMessage({response: ${code.replaceAll(";", "")}, forCallId: ${callId}}, "*");
      `;

      const updatedCalls = { ...getSelf().calls };

      // Registra as chamadas
      updatedCalls[callId] = { code: codeStructure, handler: onComplete };

      updateData({
        calls: updatedCalls,
      });
    },

    removeCall: (callId: number) => {
      const updatedCalls: any = {};
      const currentCalls = getSelf().calls;
      const calls = Object.keys(currentCalls);
      calls.forEach((call) => {
        if (call !== callId.toString()) {
          updatedCalls[call] = currentCalls[call];
        }
      });

      updateData({
        calls: updatedCalls,
      });
    },
  });
};

export default ModulesContext;
