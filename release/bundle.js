/*
    MIT License

    Copyright (c) 2023 homeboy445

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
var jsDebugger;(()=>{"use strict";var e={d:(t,r)=>{for(var o in r)e.o(r,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:r[o]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{nativeApiMonitor:()=>O,objectMonitor:()=>v,variableMonitor:()=>f});const r=e=>{const t=`${e}-change`,r=`${e}-error`;return e=>({CHANGE:t+":"+e,ERROR:r+":"+e})},o=e=>"function"==typeof e,n=e=>e&&"object"==typeof e&&!Array.isArray(e),s=e=>`function ${e}() { [native code] }`,i=e=>Function.prototype.toString.call(e),c=new class{constructor(){this.eventStore={}}on(e,t){this.eventStore[e]=this.eventStore[e]||[],this.eventStore[e].push(t)}off(e){delete this.eventStore[e]}trigger(e,t){var r;for(let o=0;o<((null===(r=this.eventStore[e])||void 0===r?void 0:r.length)||0);o++)this.eventStore[e][o](t)}};class a{constructor(){this.operationCounter=0}registerEventListeners(e,{onChange:t,onError:r}){c.on(a.getEventModes(e).CHANGE,t),c.on(a.getEventModes(e).ERROR,r)}attachProperty(e,t,r,o,s){let i=r;const l=a.getEventModes(s).CHANGE;Object.defineProperty(e,t,{configurable:!1,get:()=>i,set:e=>(e!==i&&(c.trigger(l,{path:o,newValue:e,oldValue:i}),i=n(e)?this.iterateRescursivelyAndConstructDebugObject(e,{},s,o):e),!0)})}iterateRescursivelyAndConstructDebugObject(e,t,r,o="."){try{if(!n(e))return t;for(const s in e)n(e[s])&&(e[s]=this.iterateRescursivelyAndConstructDebugObject(e[s],{},r,o+"/"+s)),this.attachProperty(t,s,e[s],o+"/"+s,r)}catch(e){c.trigger(a.getEventModes(r).ERROR)}return t}createProxy(e,t,r=""){for(const o in e)n(e[o])&&(e[o]=this.createProxy(e[o],t,r.trim()?r+"."+o:o));return new Proxy(e,{set:(e,o,s)=>(c.trigger(a.getEventModes(t).CHANGE,{path:r+"."+o,oldValue:e[o],newValue:s}),e[o]=n(s)?this.createProxy(s,t,r+"."+o):s,!0),get:(e,t)=>e[t]})}getEntryPoints(){return{observe:(e,t)=>{const r=++this.operationCounter;return this.registerEventListeners(r,t),this.iterateRescursivelyAndConstructDebugObject(e,{},r)},create:(e={},t)=>{const r=++this.operationCounter;return this.registerEventListeners(r,t),this.createProxy(e,r)},listen:(e,t,r)=>{const o=++this.operationCounter;if(this.registerEventListeners(o,r),!n(e))return c.trigger(a.getEventModes(o).ERROR,"Cannot listen to a non-object!"),!1;try{const r=t.split("."),n=r.pop()||"";let s=e;for(const e of r)s[e]=s[e]||{},s=s[e];const i=s[n];delete s[n],this.attachProperty(s,n,i,t,o)}catch(e){return c.trigger(a.getEventModes(o).ERROR,e),!1}return!0}}}}a.getEventModes=r("ObjectMonitor");const l=new a;class u{constructor(){this.operationId=0,this.variables={}}isValidVariableName(e){return!!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e)}registerEventListeners(e,{onChange:t,onError:r}){c.on(u.getEventModes(e).CHANGE,t),c.on(u.getEventModes(e).ERROR,r)}declare(e,t,r,o){const n=u.getEventModes(++this.operationId);try{if(!this.isValidVariableName(t))throw new Error("Invalid variable name!");this.registerEventListeners(this.operationId,o),this.variables[t]=r,Object.defineProperty(e,t,{get:()=>this.variables[t],set:e=>{c.trigger(n.CHANGE,{variableThatChanged:t,oldValue:this.variables[t],newValue:e}),this.variables[t]=e}})}catch(e){return c.trigger(n.ERROR,{error:e}),!1}return!0}getEntryPoints(){const e=this;return{declareOnWindow:(t,r,o)=>e.declare(window||self,t,r,o),declareOnArbitraryObject:(t,r,o,n)=>e.declare(t,r,o,n)}}}u.getEventModes=r("VariableDeclarer");const p=new u;var g;!function(e){e.COOKIE="COOKIE"}(g||(g={}));class h{attachCookieListener(e){const t=Document.prototype||document,r=Object.getOwnPropertyDescriptor(t,"cookie");if(!r)return!1;try{return Object.defineProperty(t,"__cookie_proxy",r),Object.defineProperty(t,"cookie",Object.assign(Object.assign({},r),{get:()=>document.__cookie_proxy,set:t=>(document.__cookie_proxy=t,e(t,document.__cookie_proxy),!0)})),!0}catch(e){return!1}}attachListener(e,t){return e===g.COOKIE&&this.attachCookieListener(t)}}const d=new class extends h{performArrayValidation(){const e=["push","pop","shift","unshift","splice","sort","reverse","fill","copyWithin","concat","join","slice","indexOf","lastIndexOf","includes","toString","toLocaleString","forEach","map","filter","reduce","reduceRight","some","every","find","findIndex","set","subarray","from","of","entries","keys","values","flatMap","flat"],t=[];for(let r=0;r<e.length;r++){const n=e[r],i=Array.prototype[n];i&&o(i)&&s(n)!=Function.prototype.toString.call(i)&&t.push(n)}return Function.prototype.toString.call(Array.prototype.constructor)!=s("Array")&&t.push("constructor"),t}performObjectValidations(){const e=["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf","__defineGetter__","__defineSetter__","__lookupGetter__","__lookupSetter__"],t=[];for(let r=0;r<e.length;r++){const n=e[r],i=Object.prototype[n];i&&o(i)&&s(n)==n&&t.push(n)}return"function Object() { [native code] }"!=Function.prototype.toString.call(Object.prototype.constructor)&&t.push("constructor"),t}performJSONValidations(){const e=[];return s("stringify")!=Function.prototype.toString.call(JSON.stringify)&&e.push("stringify"),s("parse")!=Function.prototype.toString.call(JSON.parse)&&e.push("parse"),e}performDOMApiValidations(){const e=[];"function get cookie() { [native code] }"!=i(Object.getOwnPropertyDescriptor(Document.prototype,"cookie").get)&&e.push("cookie");const t=Object.getOwnPropertyDescriptor(document,"cookie");return t&&t.get&&"cookie"!=e.at(-1)&&e.push("cookie"),i(document.getElementById)!=s("getElementById")&&e.push("document.getElementbyId"),i(document.querySelector)!=s("querySelector")&&e.push("document.querySelector"),{DOM:e}}performStorageValidations(){const e={localStorage:[],sessionStorage:[]};return i(localStorage.getItem)!=s("getItem")&&e.localStorage.push("getItem"),i(localStorage.setItem)!=s("setItem")&&e.localStorage.push("setItem"),i(sessionStorage.getItem)!=s("getItem")&&e.sessionStorage.push("getItem"),i(sessionStorage.setItem)!=s("setItem")&&e.sessionStorage.push("setItem"),e}performBrowserApiValidations(){const e=[];Function.prototype.toString.call(fetch)!=s("fetch")&&e.push("fetch"),Function.prototype.toString.call(Promise)!=s("Promise")&&e.push("Promise");const t=new Promise((e=>e(1)));return i(t.then)!=s("then")&&e.push("Promise.then"),i(t.catch)!=s("catch")&&e.push("Promise.catch"),i(XMLHttpRequest)!=s("XMLHttpRequest")&&e.push("XMLHttpRequest"),i(Worker)!=s("Worker")&&e.push("Worker"),i(ServiceWorker)!=s("ServiceWorker")&&e.push("ServiceWorker"),s("addEventListener")&&e.push("addEventListener"),Object.assign(Object.assign({Browser:e},this.performDOMApiValidations()),this.performStorageValidations())}getEntryPoints(){const e=this;return{performValidations:()=>Object.assign({Array:e.performArrayValidation(),Object:e.performObjectValidations(),JSON:e.performJSONValidations()},e.performBrowserApiValidations()),attachListener:e.attachListener.bind(e)}}},y=new class{getRefreshRateExecutor(e){const t=window.clearInterval;let r;return{run:t=>{r=setInterval(t,null!=e?e:62.5)},cancel:()=>{t(r)}}}getEntryPoints(){const e=this;return{monitorOnWindows(t,r){var o;const{run:n,cancel:s}=e.getRefreshRateExecutor(null===(o=null==r?void 0:r.config)||void 0===o?void 0:o.timer),i=t.split("."),c=i.pop()||"",a=()=>{let e=window;for(let t=0;t<i.length;t++){if(void 0===e)return;e=e[i[t]]}return e[c]};let l=a();return void 0!==l&&(n((()=>{const e=a();l!=e&&(r.onChange({newValue:e,oldValue:l}),l=e)})),{stop:s})}}}},f=Object.assign(p.getEntryPoints(),y.getEntryPoints()),v=l.getEntryPoints(),O=d.getEntryPoints();jsDebugger=t})();