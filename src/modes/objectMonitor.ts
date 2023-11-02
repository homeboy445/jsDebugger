import { isObject, mapListenerEventPerMode } from "./../utils/index";
import { GenericObject, IDebuggerMode } from "../types/index";
import eventBus from "../utils/eventBus";

class ObjectMonitor implements IDebuggerMode {
  static eventModes = mapListenerEventPerMode("ObjectMonitor");
  attachProperty(
    targetObject: GenericObject,
    propertyName: string,
    value: any,
    path: string
  ) {
    let valueStore = value;
    Object.defineProperty(targetObject, propertyName, {
      configurable: false,
      get: () => valueStore,
      set: (newValue: any) => {
        eventBus.trigger(ObjectMonitor.eventModes["CHANGE"], {
            path,
            newValue,
            oldValue: valueStore
        });
        valueStore = newValue;
        return true;
      },
    });
  }
  iterateRescursivelyAndConstructDebugObject(
    targetObject: GenericObject,
    baseObject: GenericObject,
    path = "."
  ): GenericObject {
    try {
      if (!isObject(targetObject)) {
        return baseObject;
      }
      const objKeys = Object.keys(targetObject);
      for (const propKey of objKeys) {
        if (isObject(targetObject[propKey])) {
          this.iterateRescursivelyAndConstructDebugObject(
            targetObject[propKey],
            (baseObject[propKey] = {}),
            path + "/" + propKey
          );
        } else {
          this.attachProperty(baseObject, propKey, targetObject[propKey], path + "/" + propKey);
        }
      }
    } catch (e) {
      eventBus.trigger(ObjectMonitor.eventModes["ERROR"]);
    }
    return baseObject;
  }
  /** this is buggy in mObj.c.f path!
         * const objectMonitor = jsDebugger.objectMonitor;
        objectMonitor.on("change", (d) => console.log(d));
        objectMonitor.on("error", (e) => console.error(e));
        const mObj = objectMonitor.create({ a: 1, b: { d: 4 }, c: { f: {e: {o: 1}} }, x: 1, p: 1111 });
   */
  getEntryPoints() {
    return {
      create: (targetObject: GenericObject): GenericObject => {
        return this.iterateRescursivelyAndConstructDebugObject(
          targetObject,
          {}
        );
      },
      listen: (targetObject: GenericObject, pathToListen: string): boolean => {
        return false;
      },
    };
  }
}

export default new ObjectMonitor();
