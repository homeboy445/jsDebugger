import { isObject } from "./../utils/index";
import { GenericObject, IDebuggerMode } from "../types/index";

class ObjectMonitor implements IDebuggerMode {
  eventModes = {
    ["CHANGE"]: "ObjectMonitor-Change",
    ["ERROR"]: "ObjectMonitor-Error",
  };
  attachProperty(
    targetObject: GenericObject,
    propertyName: string,
    value: any
  ) {
    let valueStore = value;
    Object.defineProperty(targetObject, propertyName, {
      configurable: false,
      get: () => valueStore,
      set: () => {
        valueStore = value;
        return true;
      },
    });
  }
  iterateRescursivelyAndConstructDebugObject(
    targetObject: GenericObject,
    baseObject: GenericObject
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
            (baseObject[propKey] = {})
          );
        } else {
          this.attachProperty(baseObject, propKey, targetObject[propKey]);
        }
      }
      return baseObject;
    } catch (e) {
      eventBus.trigger("");
    }
  }
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
