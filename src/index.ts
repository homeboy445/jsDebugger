import ObjectMonitor from "./modes/objectMonitor";
import VariableDeclarer from "./modes/variableDeclarer";
import eventBus from "./utils/eventBus";

const getListenerMethodPerMode = (modeName: string) => {
  return {
    on: (eventName: string, callback: (...args: any) => void) =>
      eventBus.on.call(eventBus, `${modeName}-${eventName}`, callback),
    off: (eventName: string) =>
      eventBus.off.call(eventBus, `${modeName}-${eventName}`),
  };
};

const variableDeclarer = Object.assign(
  new VariableDeclarer().getEntryPoints(),
  getListenerMethodPerMode("variableDeclarer")
);

const objectMonitor = Object.assign(
  ObjectMonitor.getEntryPoints(),
  getListenerMethodPerMode("objectMonitor")
);

export { variableDeclarer, objectMonitor };
