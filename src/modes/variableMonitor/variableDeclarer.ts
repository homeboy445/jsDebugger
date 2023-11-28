import { IDebuggerMode, GenericObject } from "../../types/index";
import eventBus from "../../utils/eventBus";
import { getEventModeGetter } from "../../utils/index";

type onChangeObject = {
  variableThatChanged: string;
  oldValue: any;
  newValue: any;
};

class VariableDeclarer implements IDebuggerMode {
  static getEventModes = getEventModeGetter("VariableDeclarer");
  operationId = 0;
  variables: GenericObject = {};
  isValidVariableName(varName: string): boolean {
    return !!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(varName);
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
    eventBus.on(VariableDeclarer.getEventModes(operationId).CHANGE, onChange);
    eventBus.on(VariableDeclarer.getEventModes(operationId).ERROR, onError);
  }
  declare(
    targetObject: Window | GenericObject,
    variableName: string,
    initialValue: any,
    callbackStore: {
      onChange: (data: onChangeObject) => void;
      onError: (error: any) => void;
    }
  ): boolean {
    const eventsObject = VariableDeclarer.getEventModes(++this.operationId);
    try {
      if (!this.isValidVariableName(variableName)) {
        throw new Error("Invalid variable name!");
      }
      this.registerEventListeners(this.operationId, callbackStore);
      this.variables[variableName] = initialValue;
      Object.defineProperty(targetObject, variableName, {
        get: () => this.variables[variableName],
        set: (value) => {
          eventBus.trigger(eventsObject.CHANGE, {
            variableThatChanged: variableName,
            oldValue: this.variables[variableName],
            newValue: value,
          });
          this.variables[variableName] = value;
        },
      });
    } catch (e) {
      eventBus.trigger(eventsObject.ERROR, {
        error: e,
      });
      return false;
    }
    return true;
  }
  getEntryPoints() {
    const _this = this;
    // If the below function returns 'true', then it means the operation is a success, otherwise not.
    return {
      /**
       * This will declare a variable on the global window object and will track any and all changes
       * that happens to the variable. e.g.
       * ```
       * const callbackObject = {onChange: (data) => console.log(data), onError: (error) => console.error(error)};
       * declareOnWindow("testing", 1, );
       * // now doing
       * testing = 2;
       * // will call the onChange function with the changed value.
       * // output: { variableThatChanged: "testing", oldValue: 1, newValue: 2 }
       * ``` 
       * @param variableName - string
       * @param initialValue - any
       * @param callbackStore - (onChange: ({
            variableThatChanged: string;
            oldValue: any;
            newValue: any;
        }) => void, onError: (error) => void)
       * @returns void
       */
      declareOnWindow(
        variableName: string,
        initialValue: any,
        callbackStore: {
          onChange: (data: onChangeObject) => void;
          onError: (error: any) => void;
        }
      ): boolean {
        return _this.declare(
          window || self,
          variableName,
          initialValue,
          callbackStore
        );
      },
      /**
       * This will declare a variable on an arbitrary object and will track any and all changes
       * that happens to the key of the provided target object. e.g.
       * ```
       * const obj = {};
       * const callbackObject = {onChange: (data) => console.log(data), onError: (error) => console.error(error)};
       * declareOnArbitraryObject(obj, "testing", 1, callbackObject);
       * // In case of any change, onChange will be called with appropriate changed value, like so:
       * obj.testing = 2;
       * // output: { variableThatChanged: "testing", oldValue: 1, newValue: 2 }
       * ```
       * @param targetObject Object
       * @param variableName string
       * @param initialValue any
       * @param callbackStore (onChange: ({
            variableThatChanged: string;
            oldValue: any;
            newValue: any;
        }) => void, onError: (error) => void)
       * @returns void
       */
      declareOnArbitraryObject(
        targetObject: GenericObject,
        variableName: string,
        initialValue: any,
        callbackStore: {
          onChange: (data: onChangeObject) => void;
          onError: (error: any) => void;
        }
      ): boolean {
        return _this.declare(
          targetObject,
          variableName,
          initialValue,
          callbackStore
        );
      },
    };
  }
}

export default new VariableDeclarer();
