import { generateDefaultFunctionString, isFunction } from "../../utils/index";

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
  getEntryPoints() {
    const _this = this;
    return {
      performValidations: () => {
        return {
          Array: _this.performArrayValidation(),
          Object: _this.performObjectValidations(),
          JSON: _this.performJSONValidations(),
        };
      },
    };
  }
}

export default new NativeApiMonitor();
