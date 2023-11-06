import { getEventModeGetter, isObject, mapListenerEventPerMode } from "./../utils/index";
import { GenericObject, IDebuggerMode } from "../types/index";
import eventBus from "../utils/eventBus";

type onChangeObject = {
  path: number;
  newValue: any;
  oldValue: any;
};

class ObjectMonitor implements IDebuggerMode {
  static getEventModes = getEventModeGetter("ObjectMonitor");
  operationCounter = 0;
  attachProperty(
    targetObject: GenericObject,
    propertyName: string,
    value: any,
    path: string,
    operationId: number
  ) {
    let valueStore = value;
    const eventName = ObjectMonitor.getEventModes(operationId).CHANGE;
    Object.defineProperty(targetObject, propertyName, {
      configurable: false,
      get: () => valueStore,
      set: (newValue: any) => {
        if (newValue !== valueStore) {
          eventBus.trigger(eventName, {
            path,
            newValue,
            oldValue: valueStore,
          });
          if (isObject(newValue)) {
            valueStore = this.iterateRescursivelyAndConstructDebugObject(newValue, {}, operationId, path);
          } else {
            valueStore = newValue;
          }
        }
        return true;
      },
    });
  }
  iterateRescursivelyAndConstructDebugObject(
    targetObject: GenericObject,
    baseObject: GenericObject,
    operationId: number,
    path = "."
  ): GenericObject {
    try {
      if (!isObject(targetObject)) {
        return baseObject;
      }
      for (const propKey in targetObject) {
        if (isObject(targetObject[propKey])) {
          targetObject[propKey] =
            this.iterateRescursivelyAndConstructDebugObject(
              targetObject[propKey],
              {},
              operationId,
              path + "/" + propKey
            );
        }
        this.attachProperty(
          baseObject,
          propKey,
          targetObject[propKey],
          path + "/" + propKey,
          operationId
        );
      }
    } catch (e) {
      eventBus.trigger(ObjectMonitor.getEventModes(operationId).ERROR);
    }
    return baseObject;
  }
  registerEventListeners(
    operationId: number,
    {
      onChange,
      onError,
    }: {
      onChange: (data: onChangeObject) => void;
      onError: (error: any) => void;
    }
  ) {
    eventBus.on(ObjectMonitor.getEventModes(operationId).CHANGE, onChange);
    eventBus.on(ObjectMonitor.getEventModes(operationId).ERROR, onError);
  }
  getEntryPoints() {
    return {
      create: (
        targetObject: GenericObject,
        callbackStore: {
          onChange: (data: onChangeObject) => void;
          onError: (error: any) => void;
        }
      ): GenericObject => {
        const opId = ++this.operationCounter;
        this.registerEventListeners(opId, callbackStore);
        return this.iterateRescursivelyAndConstructDebugObject(
          targetObject,
          {},
          opId
        );
      },
      listen: (
        targetObject: GenericObject,
        pathToListen: string,
        callbackStore: {
          onChange: (data: onChangeObject) => void;
          onError: (error: any) => void;
        }
      ): boolean => {
        const opId = ++this.operationCounter;
        this.registerEventListeners(opId, callbackStore);
        if (!isObject(targetObject)) {
          eventBus.trigger(
            ObjectMonitor.getEventModes(opId).ERROR,
            "Cannot listen to a non-object!"
          );
          return false;
        }
        try {
          const pathArray = pathToListen.split(".");
          const targetProperty = pathArray.pop() || "";
          let valueStore = targetObject;
          for (const path of pathArray) {
            valueStore[path] = valueStore[path] || {};
            valueStore = valueStore[path];
          }
          const objValue = valueStore[targetProperty];
          delete valueStore[targetProperty];
          this.attachProperty(
            valueStore,
            targetProperty,
            objValue,
            pathToListen,
            opId
          );
        } catch (e) {
          eventBus.trigger(ObjectMonitor.getEventModes(opId).ERROR, e);
          return false;
        }
        return true;
      },
    };
  }
}

export default new ObjectMonitor();
