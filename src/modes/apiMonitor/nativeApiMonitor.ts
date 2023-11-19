import {
  generateDefaultFunctionString,
  isFunction,
  stringifyFunction,
} from "../../utils/index";

/**
 * This class is indended for checking if any native API belonging to any native JS types
 * are overridden, e.g `Array.prototype.forEach`, etc.
 */
class NativeApiMonitor {
  performArrayValidation(): string[] {
    const arrayMethods = [
      "push",
      "pop",
      "shift",
      "unshift",
      "splice",
      "sort",
      "reverse",
      "fill",
      "copyWithin",
      "concat",
      "join",
      "slice",
      "indexOf",
      "lastIndexOf",
      "includes",
      "toString",
      "toLocaleString",
      "forEach",
      "map",
      "filter",
      "reduce",
      "reduceRight",
      "some",
      "every",
      "find",
      "findIndex",
      "set",
      "subarray",
      "from",
      "of",
      "entries",
      "keys",
      "values",
      "flatMap",
      "flat",
    ];
    const overriddenMethods = [];
    for (let idx = 0; idx < arrayMethods.length; idx++) {
      const methodName: string = arrayMethods[idx];
      const functionInstance = (Array as any).prototype[methodName];
      if (
        functionInstance &&
        isFunction(functionInstance) &&
        generateDefaultFunctionString(methodName) !=
          Function.prototype.toString.call(functionInstance)
      ) {
        overriddenMethods.push(methodName);
      }
    }
    if (
      Function.prototype.toString.call(Array.prototype.constructor) !=
      generateDefaultFunctionString("Array")
    ) {
      overriddenMethods.push("constructor");
    }
    return overriddenMethods;
  }
  performObjectValidations(): string[] {
    const objectMethods = [
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "toLocaleString",
      "toString",
      "valueOf",
      "__defineGetter__",
      "__defineSetter__",
      "__lookupGetter__",
      "__lookupSetter__",
    ];
    const overridenMethods = [];
    for (let idx = 0; idx < objectMethods.length; idx++) {
      const methodName = objectMethods[idx];
      const methodInstance = (Object as any).prototype[methodName];
      if (
        methodInstance &&
        isFunction(methodInstance) &&
        generateDefaultFunctionString(methodName) == methodName
      ) {
        overridenMethods.push(methodName);
      }
    }
    if (
      Function.prototype.toString.call(Object.prototype.constructor) !=
      `function Object() { [native code] }`
    ) {
      overridenMethods.push("constructor");
    }
    return overridenMethods;
  }
  performJSONValidations() {
    const overiddenMethods = [];
    if (
      generateDefaultFunctionString("stringify") !=
      Function.prototype.toString.call(JSON.stringify)
    ) {
      overiddenMethods.push("stringify");
    }
    if (
      generateDefaultFunctionString("parse") !=
      Function.prototype.toString.call(JSON.parse)
    ) {
      overiddenMethods.push("parse");
    }
    return overiddenMethods;
  }
  performDOMApiValidations() {
    const overriddenMethods = [];
    if (
      stringifyFunction(
        (Object as any).getOwnPropertyDescriptor(Document.prototype, "cookie")
          .get
      ) != "function get cookie() { [native code] }"
    ) {
      overriddenMethods.push("cookie");
    }
    if (
      stringifyFunction(document.getElementById) !=
      "function getElementById() { [native code] }"
    ) {
      overriddenMethods.push("document.getElementbyId");
    }
    if (
      stringifyFunction(document.querySelector) !=
      "function querySelector() { [native code] }"
    ) {
      overriddenMethods.push("document.querySelector");
    }
    return { DOM: overriddenMethods };
  }
  performStorageValidations() {
    const overiddenMethods: {
      localStorage: string[];
      sessionStorage: string[];
    } = { localStorage: [], sessionStorage: [] };
    if (
      stringifyFunction(localStorage.getItem) !=
      generateDefaultFunctionString("getItem")
    ) {
      overiddenMethods["localStorage"].push("getItem");
    }
    if (
      stringifyFunction(localStorage.setItem) !=
      generateDefaultFunctionString("setItem")
    ) {
      overiddenMethods["localStorage"].push("setItem");
    }
    if (
      stringifyFunction(sessionStorage.getItem) !=
      generateDefaultFunctionString("getItem")
    ) {
      overiddenMethods["sessionStorage"].push("getItem");
    }
    if (
      stringifyFunction(sessionStorage.setItem) !=
      generateDefaultFunctionString("setItem")
    ) {
      overiddenMethods["sessionStorage"].push("setItem");
    }
    return overiddenMethods;
  }
  performBrowserApiValidations() {
    const overridenMethods = [];
    if (
      Function.prototype.toString.call(fetch) !=
      "function fetch() { [native code] }"
    ) {
      overridenMethods.push("fetch");
    }
    if (
      Function.prototype.toString.call(Promise) !=
      "function Promise() { [native code] }"
    ) {
      overridenMethods.push("Promise");
    }
    const resolvePromise = new Promise((r) => r(1));
    if (
      stringifyFunction(resolvePromise.then) !=
      "function then() { [native code] }"
    ) {
      overridenMethods.push("Promise.then");
    }
    if (
      stringifyFunction(resolvePromise.catch) !=
      "function catch() { [native code] }"
    ) {
      overridenMethods.push("Promise.catch");
    }
    if (
      stringifyFunction(XMLHttpRequest) !=
      "function XMLHttpRequest() { [native code] }"
    ) {
      overridenMethods.push("XMLHttpRequest");
    }
    if (stringifyFunction(Worker) != "function Worker() { [native code] }") {
      overridenMethods.push("Worker");
    }
    if (
      stringifyFunction(ServiceWorker) !=
      "function ServiceWorker() { [native code] }"
    ) {
      overridenMethods.push("ServiceWorker");
    }
    return {
      "Browser": overridenMethods,
      ...this.performDOMApiValidations(),
      ...this.performStorageValidations()
    };
  }
  getEntryPoints() {
    const _this = this;
    return {
      performValidations: () => {
        return {
          Array: _this.performArrayValidation(),
          Object: _this.performObjectValidations(),
          JSON: _this.performJSONValidations(),
          ..._this.performBrowserApiValidations()
        };
      },
    };
  }
}

export default new NativeApiMonitor();
