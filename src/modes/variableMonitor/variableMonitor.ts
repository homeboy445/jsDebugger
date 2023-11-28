import { GenericObject, IDebuggerMode } from "../../types/index";

type onChangeObject = {
  newValue: any;
  oldValue: any;
};

class VariableMonitor {
  getRefreshRateExecutor(timer?: number): {
    run: (callback: (...args: any[]) => void) => void;
    cancel: () => void;
  } {
    const executor = (callbackToBeExec: () => void): NodeJS.Timeout => {
      return setInterval(callbackToBeExec, timer ?? 1e3 / 16);
    };
    const cancelExec = window.clearInterval;
    let execId: NodeJS.Timeout;
    return {
      run: (callback: (...args: any[]) => void) => {
        execId = executor(callback);
      },
      cancel: () => {
        cancelExec(execId);
      },
    };
  }
  getEntryPoints() {
    const _this = this;
    return {
      /**
       * This will monitor the provided variable path pre-existing on windows object and
       * will trigger the callback as soon as there's any change in the value.
       * This method can be used to monitor the changes inside an object existing on windows object as well.
       * Note: This method polls for any changes per browser render cycle (approx.) by default, but it can also accept
       * an arbitrary timer as well: `monitorOnWindows("a", { config: { timer: 1000 } })`.
       * ```
       * window.obj = { "a": { "b": { "c": 1 } } };
       * monitorOnWindows("a.b.c", { onChange: (data) => console.log(data), onError: (err) => console.log(err) });
       * ```
       * @param variablePath string
       * @param callbackStore Object
       */
      monitorOnWindows(
        variablePath: string,
        callbackStore: {
          config?: { timer?: number },
          onChange: (data: onChangeObject) => void;
          onError: (error: any) => void;
        }
      ):
        | {
            stop: () => void;
          }
        | false {
        // TODO: Add proper error handling!
        const { run, cancel } = _this.getRefreshRateExecutor(callbackStore?.config?.timer);
        const pathArr = variablePath.split(".");
        const targetProp: string = pathArr.pop() || "";
        const getValue = () => {
          let valueStore: GenericObject = window;
          for (let idx = 0; idx < pathArr.length; idx++) {
            if (typeof valueStore == "undefined") {
              return;
            }
            valueStore = valueStore[pathArr[idx]];
          }
          return valueStore[targetProp];
        };
        let initialValue: any = getValue();
        if (typeof initialValue == "undefined") {
          return false; // find a better solution!
        }
        run(() => {
          const currentValue = getValue();
          if (initialValue != currentValue) {
            // log stuff!
            callbackStore.onChange({
              newValue: currentValue,
              oldValue: initialValue
            });
            initialValue = currentValue;
          }
        });
        return {
          stop: cancel,
        };
      },
    };
  }
}

export default new VariableMonitor();
