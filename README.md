
# jsDebugger

The `jsDebugger` library offers a comprehensive set of tools designed to monitor, track, and validate various aspects of JavaScript runtime environments. This library comprises several modules:

## ObjectMonitor

The `ObjectMonitor` module facilitates observing and tracking changes within JavaScript objects. It provides functionalities to register listeners for object modifications, enabling real-time monitoring of object properties.

## VariableMonitor

The `VariableMonitor` module allows for dynamic monitoring of variables within the global `window` object or arbitrary objects. It offers capabilities to detect and respond to changes in specific variable paths or properties.

## VariableDeclarer

The `VariableDeclarer` module enables users to declare variables and monitor their changes, leveraging callback functionalities to handle modifications in the declared variables.

## NativeApiMonitor

The `NativeApiMonitor` module offers comprehensive validations across native JavaScript APIs. It includes methods to identify and track overridden native methods, such as those within arrays, objects, JSON, DOM, browser-specific APIs, local storage, and more.

The `jsDebugger` library equips developers with powerful tools to monitor object modifications, track variable changes, declare variables with monitoring capabilities, and validate overridden native APIs within JavaScript environments.

Helps in exploring the functionalities of each module and utilize the provided tools to enhance debugging, tracking, and validation processes within JavaScript applications.

---

# API Usage

The main file is located at release/bundle.js

CDN link: https://cdn.jsdelivr.net/gh/homeboy445/jsDebugger@main/release/bundle.js

## Object Monitor

### Returns an object providing specific functionalities to observe, create proxies, and listen to changes within JavaScript objects.

### Methods
---

#### `observe(targetObject: GenericObject, callbacks: { onChange: Function, onError: Function }): GenericObject`

Observes changes within an object and triggers callbacks upon modifications (applicable to pre-existing object keys only).

- `targetObject`: The object to observe for changes.
- `callbacks`: Object containing `onChange` and `onError` functions to handle change and error events respectively.

---

#### `create(targetObject: GenericObject, callbacks: { onChange: Function, onError: Function }): Proxy`

Creates a proxy for an object to monitor changes and trigger callbacks upon modifications.

- `targetObject`: The object for which the proxy will be created.
- `callbacks`: Object containing `onChange` and `onError` functions to handle change and error events respectively.

---

#### `listen(targetObject: GenericObject, pathToListen: string, callbacks: { onChange: Function, onError: Function }): boolean`

Listens to changes within a specific path of an object and triggers callbacks upon modifications.

- `targetObject`: The object to observe for changes within a specific path.
- `pathToListen`: The specific path within the object hierarchy to monitor.
- `callbacks`: Object containing `onChange` and `onError` functions to handle change and error events respectively.

---

### Usage

Example usage of the exposed entry points:

```javascript
// Observe changes within an object
const obj = jsDebugger.objectMonitor.observe({ a: 1, b: 2 }, { onChange: (d) => console.log(d), onError: (e) => console.error(e) });
obj.a = 2;
// output: { "path": "./a", "newValue": 2, "oldValue": 1 }

// Create proxy for an object
const objPrxy = jsDebugger.objectMonitor.create({ a: 1, b: 2 }, {onChange: (e) => console.log(e) });
objPrxy.c = 2;
// output: { "path": ".c", "newValue": 2 }

// Listen to changes within a specific path of an object
const tar = {a: 1, x: {b: 2, c: {d: 2}}};
jsDebugger.objectMonitor.listen(tar, "x.c.d", { onChange: (d) => console.log(d) });
// output: {path: 'x.c.d', newValue: 3, oldValue: 2}
```

## Variable Monitor
### Returns an object providing functionalities to declare variables on the global `window` object or arbitrary objects and track changes and also functionalities to monitor changes in variables pre-existing on the `window` object.

### Methods

---

#### `declareOnWindow(variableName: string, initialValue: any, callbackStore: { onChange: Function, onError: Function }): boolean`

Declares a variable on the global `window` object and tracks changes.

- `variableName`: Name of the variable to be declared.
- `initialValue`: Initial value of the variable.
- `callbackStore`: Object containing `onChange` and `onError` functions to handle change and error events respectively.

---

#### `declareOnArbitraryObject(targetObject: GenericObject, variableName: string, initialValue: any, callbackStore: { onChange: Function, onError: Function }): boolean`

Declares a variable on an arbitrary object and tracks changes to the specified variable.

- `targetObject`: The object on which the variable will be declared.
- `variableName`: Name of the variable to be declared.
- `initialValue`: Initial value of the variable.
- `callbackStore`: Object containing `onChange` and `onError` functions to handle change and error events respectively.

#### `monitorOnWindows(variablePath: string, callbackStore: { config?: { timer?: number }, onChange: Function, onError: Function }): { stop } | false`

Monitors changes in a variable path existing on the `window` object and triggers a callback upon any change.

- `variablePath`: The path of the variable to monitor on the `window` object.
- `callbackStore`: Object containing configuration options (`timer` for polling interval), `onChange`, and `onError` functions to handle change and error events respectively.
- To stop listening for changes in the provided path, just call the returned `stop()` function.

### Usage

Example usage of the exposed entry points:

```javascript
const variableDeclarer = new VariableDeclarer();
const entryPoints = variableDeclarer.getEntryPoints();

// Declare a variable on the global window object
jsDebugger.variableMonitor.declareOnWindow("testVar", 1, {
  onChange: (data) => {
    console.log('Variable change:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});
testVar = 11;
// will output: 'Variable change: {variableThatChanged: 'testVar', oldValue: 1, newValue: 11}'

// Declare a variable on an arbitrary object
const obj = {};
jsDebugger.variableMonitor.declareOnArbitraryObject(obj, "testVar", 1, {
  onChange: (data) => {
    console.log('Variable change:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});
obj.testVar = 2;
// will output: 'Variable change: {variableThatChanged: 'testVar', oldValue: 1, newValue: 2}'

// Monitor changes in a variable path on the window object
var main = { _test_var: 2 };
const executionController = jsDebugger.variableMonitor.monitorOnWindows("main._test_var",  {
  onChange: (data) => {
    console.log('Variable change:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});
window.main._test_var++;
// will output: 'Variable change: {newValue: 2, oldValue: 1}'
// do `executionController.stop()` in case you need to stop observing the path.
```


## Native Constants Override Checker
### Returns an object providing functionalities to track and validate native API overrides.

### Methods

#### `performValidations(): Object`

Performs validations on various native APIs and returns an object with overridden methods in different categories. It returns an object with the following structure:

- `Array`: An array containing overridden methods within the `Array` prototype.
- `Object`: An array with overridden methods within the `Object` prototype.
- `JSON`: An array listing overridden methods within the `JSON` object.
- `Browser`: An array encompassing overridden methods related to browser-specific APIs.
- `DOM`: An array indicating overridden methods within Document Object Model (DOM) APIs.
- `localStorage`: An array specifying overridden methods within the `localStorage` object.
- `sessionStorage`: An array highlighting overridden methods within the `sessionStorage` object.

---

#### `attachListener(type: supportTypes, callback: Function): boolean`

Attaches a listener to specific native APIs for monitoring changes.
Note: currently the only supported type is "cookie".

### Usage

Example usage of the exposed entry points:

```javascript
const apiTracker = new APITracker().getEntryPoints();

// Perform validations on native APIs
const validations = apiTracker.performValidations();
console.log('API Validations:', validations);

// Attach listener to monitor specific API changes
apiTracker.attachListener("cookie", (valueToBeStored, newValue) => {
  console.log('Cookie change detected:', valueToBeStored, '->', newValue);
});
```

