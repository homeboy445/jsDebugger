import ObjectMonitor from "./modes/objectMonitor";
import VariableDeclarer from "./modes/variableDeclarer";

const variableDeclarer = VariableDeclarer.getEntryPoints()

const objectMonitor = ObjectMonitor.getEntryPoints();

export { variableDeclarer, objectMonitor };
