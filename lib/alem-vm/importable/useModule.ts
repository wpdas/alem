import { UseModuleProps, props } from "../alem-vm";

// TODO: DEVE ser usado dentro de um useEffect
const useModule = (inputs: UseModuleProps) => {
  const callId = Math.round(Date.now() * Math.random());

  props.alemModulesContext.callModule(
    inputs.setupCode,
    inputs.code,
    callId,
    inputs.onComplete,
  );
};
export default useModule;
