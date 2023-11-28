import ObjectMonitor from "./modes/objectMonitor";
import VariableDeclarer from "./modes/variableMonitor/variableDeclarer";
import NativeApiMonitor from "./modes/apiMonitor/nativeApiMonitor";
import VariableMonitor from "./modes/variableMonitor/variableMonitor";

const variableMonitor = Object.assign(
  VariableDeclarer.getEntryPoints(),
  VariableMonitor.getEntryPoints()
);

const objectMonitor = ObjectMonitor.getEntryPoints();

const nativeApiMonitor = NativeApiMonitor.getEntryPoints();

export { variableMonitor, objectMonitor, nativeApiMonitor };
