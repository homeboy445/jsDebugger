import { GenericObject, IDebuggerMode } from "../types/index";

type onChangeObject = {
  newValue: any;
  oldValue: any;
};

class VariableMonitor {
  getRefreshRateExecutor(): {
    run: (callback: (...args: any[]) => void) => void;
    cancel: () => void;
  } {
    const executor =
      window.requestAnimationFrame ||
      ((callbackToBeExec): number => {
        return setInterval(callbackToBeExec, 1e3 / 16);
      });
    const cancelExec = (window as any).requestAnimationFrame
      ? window.cancelAnimationFrame
      : window.clearInterval;
    let execId: number;
    return {
      run: (callback: (...args: any[]) => void) => {
        execId = executor(callback);
      },
      cancel: () => {
        cancelExec(execId);
      },
    };
  }
  /**
   * This will monitor the provided variable path pre-existing on windows object and
   * will trigger the callback as soon as there's any change in the value.
   * This method can be used to monitor the changes inside an object existing on windows object as well.
   * @param variablePath
   */
  monitorOnWindows(
    variablePath: string,
    callbackStore: {
      onChange: (data: onChangeObject) => void;
      onError: (error: any) => void;
    }
  ): {
    stop: () => void
  } | false { // TODO: Add proper error handling!
    const { run, cancel } = this.getRefreshRateExecutor();
    const pathArr = variablePath.split(".");
    const targetProp: string = pathArr.pop() || "";
    const getValue = () => {
        let valueStore: GenericObject = window;
        for (let idx = 0; idx < pathArr.length - 1; idx++) {
            if (typeof valueStore == "undefined") {
                return;
            }
            valueStore = valueStore[pathArr[idx]];
        }
        return valueStore[targetProp];
    }
    const initialValue = getValue();
    if (typeof initialValue == "undefined") {
        return false; // find a better solution!
    }
    run(() => {
        if (initialValue != getValue()) {
            // log stuff!
        }
    });
    return {
        stop: cancel
    };
  }
}
