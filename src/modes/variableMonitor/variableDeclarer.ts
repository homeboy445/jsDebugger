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
