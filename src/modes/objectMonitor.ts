import { getEventModeGetter, isObject } from "./../utils/index";
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
            valueStore = this.iterateRescursivelyAndConstructDebugObject(
              newValue,
              {},
              operationId,
              path
            );
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
  createProxy(
    targetObject: GenericObject,
    operationId: number,
    path = ""
  ): typeof Proxy {
    for (const propKey in targetObject) {
      if (isObject(targetObject[propKey])) {
        targetObject[propKey] = this.createProxy(
          targetObject[propKey],
          operationId,
          path.trim() ? path + "." + propKey : propKey
        );
      }
    }
    const proxyObj = new Proxy(targetObject, {
      set: (target: GenericObject, key: string, value: any): boolean => {
        eventBus.trigger(ObjectMonitor.getEventModes(operationId).CHANGE, {
          path: path + "." + key,
          oldValue: target[key],
          newValue: value,
        });
        target[key] = isObject(value)
          ? this.createProxy(value, operationId, path + "." + key)
          : value;
        return true;
      },
      get(target: GenericObject, key: string): any {
        return target[key];
      },
    });
    return proxyObj as any;
  }
  getEntryPoints() {
    return {
      /**
       * This is observes for any changes in the provided object.
       * @param targetObject 
       * @param callbackStore 
       * @returns 
       */
      observe: (
        targetObject: GenericObject,
        callbackStore: {
          onChange: (data: onChangeObject) => void;
          onError: (error: any) => void;
        }
      ): GenericObject => {
        // TODO: I think we need to use Proxy API only in this case.
        const opId = ++this.operationCounter;
        this.registerEventListeners(opId, callbackStore);
        return this.iterateRescursivelyAndConstructDebugObject(
          targetObject,
          {},
          opId
        );
      },
      create: (
        targetObject: GenericObject = {},
        callbackStore: {
          onChange: (data: onChangeObject) => void;
          onError: (error: any) => void;
        }
      ) => {
        const opId = ++this.operationCounter;
        this.registerEventListeners(opId, callbackStore);
        return this.createProxy(targetObject, opId);
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
