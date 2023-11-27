import {
  generateDefaultFunctionString,
  isFunction,
  stringifyFunction,
} from "../../utils/index";

export enum supportTypes {
  "COOKIE" = "COOKIE",
}

/**
 * This class will encapsulate the tracking of each native APIs.
 */
class APITracker {
  public attachCookieListener(callback: (valueToBeStored: string, newValue: string) => void): boolean {
    const target: any = Document.prototype || document;
    const cookieProps = Object.getOwnPropertyDescriptor(target, "cookie");
    if (!cookieProps) {
      return false;
    }
    try {
      Object.defineProperty(target, '__cookie_proxy', cookieProps);
      Object.defineProperty(target, 'cookie', {
        ...cookieProps,
        get: () => {
          return (document as any)["__cookie_proxy"];
        },
        set: (val: string) => {
          (document as any)["__cookie_proxy"] = val;
          callback(val, (document as any)["__cookie_proxy"]);
          return true;
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * This will attach the listener for specific native APIs.
   * @param type String
   * @param callback Function
   * @returns boolean
   */
  public attachListener(type: supportTypes, callback: (valueToBeStored: string, newValue: string) => void): boolean {
    const _this = this;
    switch(type) {
      case supportTypes.COOKIE: return _this.attachCookieListener(callback);
    }
    return false;
  }
}

/**
 * This class is indended for checking if any native API belonging to any native JS types
 * are overridden, e.g `Array.prototype.forEach`, etc.
 */
class NativeApiMonitor extends APITracker {
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
    const documentCookieProps = Object.getOwnPropertyDescriptor(document, 'cookie');
    if (documentCookieProps && documentCookieProps.get && overriddenMethods.at(-1) != "cookie") {
      overriddenMethods.push("cookie");
    }
    if (
      stringifyFunction(document.getElementById) !=
      generateDefaultFunctionString("getElementById")
    ) {
      overriddenMethods.push("document.getElementbyId");
    }
    if (
      stringifyFunction(document.querySelector) !=
      generateDefaultFunctionString("querySelector")
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
      generateDefaultFunctionString("fetch")
    ) {
      overridenMethods.push("fetch");
    }
    if (
      Function.prototype.toString.call(Promise) !=
      generateDefaultFunctionString("Promise")
    ) {
      overridenMethods.push("Promise");
    }
    const resolvePromise = new Promise((r) => r(1));
    if (
      stringifyFunction(resolvePromise.then) !=
      generateDefaultFunctionString("then")
    ) {
      overridenMethods.push("Promise.then");
    }
    if (
      stringifyFunction(resolvePromise.catch) !=
      generateDefaultFunctionString("catch")
    ) {
      overridenMethods.push("Promise.catch");
    }
    if (
      stringifyFunction(XMLHttpRequest) !=
      generateDefaultFunctionString("XMLHttpRequest")
    ) {
      overridenMethods.push("XMLHttpRequest");
    }
    if (stringifyFunction(Worker) != generateDefaultFunctionString("Worker")) {
      overridenMethods.push("Worker");
    }
    if (
      stringifyFunction(ServiceWorker) !=
      generateDefaultFunctionString("ServiceWorker")
    ) {
      overridenMethods.push("ServiceWorker");
    }
    if (generateDefaultFunctionString("addEventListener")) {
      overridenMethods.push("addEventListener");
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
      attachListener: _this.attachListener.bind(_this)
    };
  }
}

export default new NativeApiMonitor();
