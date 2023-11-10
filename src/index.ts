import ObjectMonitor from "./modes/objectMonitor";
import VariableDeclarer from "./modes/variableMonitor/variableDeclarer";
import VariableMonitor from "./modes/variableMonitor/variableMonitor";

const variableMonitor = Object.assign(
  VariableDeclarer.getEntryPoints(),
  VariableMonitor.getEntryPoints()
);

const objectMonitor = ObjectMonitor.getEntryPoints();

export { variableMonitor, objectMonitor };
