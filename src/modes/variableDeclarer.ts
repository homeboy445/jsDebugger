import { mapListenerEventPerMode } from './../utils/index';
import { GenericObject, IDebuggerMode } from "../types/index";
import eventBus from "../utils/eventBus";

export type changeListerFunction = (configObject: {
  variableThatChanged: string;
  newValue: any;
  oldValue: any;
}) => void;

class VariableDeclarer implements IDebuggerMode {
  static eventModes = mapListenerEventPerMode("VariableDeclarer");
  variables: GenericObject = {};
  private isValidVariableName(varName: string): boolean {
    return !!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(varName);
  }
  private declare(
    targetObject: Window | GenericObject,
    variableName: string,
    initialValue: any
  ): boolean {
    try {
      if (!this.isValidVariableName(variableName)) {
        throw new Error("Invalid variable name!");
      }
      this.variables[variableName] = initialValue;
      Object.defineProperty(targetObject, variableName, {
        get: () => this.variables[variableName],
        set: (value) => {
          eventBus.trigger(VariableDeclarer.eventModes["CHANGE"], {
            variableThatChanged: variableName,
            oldValue: this.variables[variableName],
            newValue: value,
          });
          this.variables[variableName] = value;
        },
      });
    } catch (e) {
      eventBus.trigger(VariableDeclarer.eventModes["ERROR"], {
        error: e
      });
      return false;
    }
    return true;
  }
  getEntryPoints() {
    const _this = this;
    // If the below function returns 'true', then it means the operation is a success, otherwise not.
    return {
      declareOnWindow(variableName: string, initialValue: any): boolean {
        return _this.declare((window || self), variableName, initialValue);
      },
      declareOnArbitraryObject(targetObject: GenericObject, variableName: string, initialValue: any): boolean {
        return _this.declare(targetObject, variableName, initialValue);
      }
    };
  }
};

export default VariableDeclarer;
