/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Suppress closure compiler errors about unknown 'process' variable
 * @fileoverview
 * @suppress {undefinedVars}
 */

// Hack since TypeScript isn't compiling this for a worker.
declare const WorkerGlobalScope;
export const zoneSymbol: (name: string) => string = Zone['__symbol__'];
const _global = typeof window === 'object' && window || typeof self === 'object' && self || global;

export function bindArguments(args: any[], source: string): any[] {
  for (let i = args.length - 1; i >= 0; i--) {
    if (typeof args[i] === 'function') {
      args[i] = Zone.current.wrap(args[i], source + '_' + i);
    }
  }
  return args;
};

export function patchPrototype(prototype, fnNames) {
  const source = prototype.constructor['name'];
  for (let i = 0; i < fnNames.length; i++) {
    const name = fnNames[i];
    const delegate = prototype[name];
    if (delegate) {
      prototype[name] = ((delegate: Function) => {
        return function() {
          return delegate.apply(this, bindArguments(<any>arguments, source + '.' + name));
        };
      })(delegate);
    }
  }
};

export const isWebWorker: boolean =
    (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope);

export const isNode: boolean =
    (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]');

export const isBrowser: boolean =
    !isNode && !isWebWorker && !!(typeof window !== 'undefined' && window['HTMLElement']);


export function patchProperty(obj, prop) {
  const desc = Object.getOwnPropertyDescriptor(obj, prop) || {enumerable: true, configurable: true};

  // A property descriptor cannot have getter/setter and be writable
  // deleting the writable and value properties avoids this error:
  //
  // TypeError: property descriptors must not specify a value or be writable when a
  // getter or setter has been specified
  delete desc.writable;
  delete desc.value;

  // substr(2) cuz 'onclick' -> 'click', etc
  const eventName = prop.substr(2);
  const _prop = '_' + prop;

  desc.set = function(fn) {
    if (this[_prop]) {
      this.removeEventListener(eventName, this[_prop]);
    }

    if (typeof fn === 'function') {
      const wrapFn = function(event) {
        let result;
        result = fn.apply(this, arguments);

        if (result != undefined && !result) event.preventDefault();
      };

      this[_prop] = wrapFn;
      this.addEventListener(eventName, wrapFn, false);
    } else {
      this[_prop] = null;
    }
  };

  // The getter would return undefined for unassigned properties but the default value of an
  // unassigned property is null
  desc.get = function() {
    return this[_prop] || null;
  };

  Object.defineProperty(obj, prop, desc);
};

export function patchOnProperties(obj: any, properties: string[]) {
  const onProperties = [];
  for (const prop in obj) {
    if (prop.substr(0, 2) == 'on') {
      onProperties.push(prop);
    }
  }
  for (let j = 0; j < onProperties.length; j++) {
    patchProperty(obj, onProperties[j]);
  }
  if (properties) {
    for (let i = 0; i < properties.length; i++) {
      patchProperty(obj, 'on' + properties[i]);
    }
  }
};

const EVENT_TASKS = zoneSymbol('eventTasks');

// For EventTarget
const ADD_EVENT_LISTENER = 'addEventListener';
const REMOVE_EVENT_LISTENER = 'removeEventListener';


interface ListenerTaskMeta extends TaskData {
  useCapturing: boolean;
  eventName: string;
  handler: EventListenerOrEventListenerObject;
  target: any;
  name: string;
}

function findExistingRegisteredTask(
    target: any, handler: any, name: string, capture: boolean, remove: boolean): Task {
  const eventTasks: Task[] = target[EVENT_TASKS];
  if (eventTasks) {
    for (let i = 0; i < eventTasks.length; i++) {
      const eventTask = eventTasks[i];
      const data = <ListenerTaskMeta>eventTask.data;
      if (data.handler === handler && data.useCapturing === capture && data.eventName === name) {
        if (remove) {
          eventTasks.splice(i, 1);
        }
        return eventTask;
      }
    }
  }
  return null;
}


function attachRegisteredEvent(target: any, eventTask: Task): void {
  let eventTasks: Task[] = target[EVENT_TASKS];
  if (!eventTasks) {
    eventTasks = target[EVENT_TASKS] = [];
  }
  eventTasks.push(eventTask);
}

export function makeZoneAwareAddListener(
    addFnName: string, removeFnName: string, useCapturingParam: boolean = true,
    allowDuplicates: boolean = false) {
  const addFnSymbol = zoneSymbol(addFnName);
  const removeFnSymbol = zoneSymbol(removeFnName);
  const defaultUseCapturing = useCapturingParam ? false : undefined;

  function scheduleEventListener(eventTask: Task): any {
    const meta = <ListenerTaskMeta>eventTask.data;
    attachRegisteredEvent(meta.target, eventTask);
    return meta.target[addFnSymbol](meta.eventName, eventTask.invoke, meta.useCapturing);
  }

  function cancelEventListener(eventTask: Task): void {
    const meta = <ListenerTaskMeta>eventTask.data;
    findExistingRegisteredTask(
        meta.target, eventTask.invoke, meta.eventName, meta.useCapturing, true);
    meta.target[removeFnSymbol](meta.eventName, eventTask.invoke, meta.useCapturing);
  }

  return function zoneAwareAddListener(self: any, args: any[]) {
    const eventName: string = args[0];
    const handler: EventListenerOrEventListenerObject = args[1];
    const useCapturing: boolean = args[2] || defaultUseCapturing;
    // - Inside a Web Worker, `this` is undefined, the context is `global`
    // - When `addEventListener` is called on the global context in strict mode, `this` is undefined
    // see https://github.com/angular/zone.js/issues/190
    const target = self || _global;
    let delegate: EventListener = null;
    if (typeof handler == 'function') {
      delegate = <EventListener>handler;
    } else if (handler && (<EventListenerObject>handler).handleEvent) {
      delegate = (event) => (<EventListenerObject>handler).handleEvent(event);
    }
    var validZoneHandler = false;
    try {
      // In cross site contexts (such as WebDriver frameworks like Selenium),
      // accessing the handler object here will cause an exception to be thrown which
      // will fail tests prematurely.
      validZoneHandler = handler && handler.toString() === '[object FunctionWrapper]';
    } catch (e) {
      // Returning nothing here is fine, because objects in a cross-site context are unusable
      return;
    }
    // Ignore special listeners of IE11 & Edge dev tools, see
    // https://github.com/angular/zone.js/issues/150
    if (!delegate || validZoneHandler) {
      return target[addFnSymbol](eventName, handler, useCapturing);
    }

    if (!allowDuplicates) {
      const eventTask: Task =
          findExistingRegisteredTask(target, handler, eventName, useCapturing, false);
      if (eventTask) {
        // we already registered, so this will have noop.
        return target[addFnSymbol](eventName, eventTask.invoke, useCapturing);
      }
    }

    const zone: Zone = Zone.current;
    const source = target.constructor['name'] + '.' + addFnName + ':' + eventName;
    const data: ListenerTaskMeta = {
      target: target,
      eventName: eventName,
      name: eventName,
      useCapturing: useCapturing,
      handler: handler
    };
    zone.scheduleEventTask(source, delegate, data, scheduleEventListener, cancelEventListener);
  };
}

export function makeZoneAwareRemoveListener(fnName: string, useCapturingParam: boolean = true) {
  const symbol = zoneSymbol(fnName);
  const defaultUseCapturing = useCapturingParam ? false : undefined;

  return function zoneAwareRemoveListener(self: any, args: any[]) {
    const eventName: string = args[0];
    const handler: EventListenerOrEventListenerObject = args[1];
    const useCapturing: boolean = args[2] || defaultUseCapturing;
    // - Inside a Web Worker, `this` is undefined, the context is `global`
    // - When `addEventListener` is called on the global context in strict mode, `this` is undefined
    // see https://github.com/angular/zone.js/issues/190
    const target = self || _global;
    const eventTask = findExistingRegisteredTask(target, handler, eventName, useCapturing, true);
    if (eventTask) {
      eventTask.zone.cancelTask(eventTask);
    } else {
      target[symbol](eventName, handler, useCapturing);
    }
  };
}

export function makeZoneAwareListeners(fnName: string) {
  const symbol = zoneSymbol(fnName);

  return function zoneAwareEventListeners(self: any, args: any[]) {
    const eventName: string = args[0];
    const target = self || _global;
    if (!target[EVENT_TASKS]) {
      return [];
    }
    return target[EVENT_TASKS]
        .filter(task => task.data.eventName === eventName)
        .map(task => task.data.handler);
  };
}

const zoneAwareAddEventListener =
    makeZoneAwareAddListener(ADD_EVENT_LISTENER, REMOVE_EVENT_LISTENER);
const zoneAwareRemoveEventListener = makeZoneAwareRemoveListener(REMOVE_EVENT_LISTENER);

export function patchEventTargetMethods(obj: any): boolean {
  if (obj && obj.addEventListener) {
    patchMethod(obj, ADD_EVENT_LISTENER, () => zoneAwareAddEventListener);
    patchMethod(obj, REMOVE_EVENT_LISTENER, () => zoneAwareRemoveEventListener);
    return true;
  } else {
    return false;
  }
}


const originalInstanceKey = zoneSymbol('originalInstance');

// wrap some native API on `window`
export function patchClass(className) {
  const OriginalClass = _global[className];
  if (!OriginalClass) return;

  _global[className] = function() {
    const a = bindArguments(<any>arguments, className);
    switch (a.length) {
      case 0:
        this[originalInstanceKey] = new OriginalClass();
        break;
      case 1:
        this[originalInstanceKey] = new OriginalClass(a[0]);
        break;
      case 2:
        this[originalInstanceKey] = new OriginalClass(a[0], a[1]);
        break;
      case 3:
        this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2]);
        break;
      case 4:
        this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2], a[3]);
        break;
      default:
        throw new Error('Arg list too long.');
    }
  };

  const instance = new OriginalClass(function() {});

  let prop;
  for (prop in instance) {
    // https://bugs.webkit.org/show_bug.cgi?id=44721
    if (className === 'XMLHttpRequest' && prop === 'responseBlob') continue;
    (function(prop) {
      if (typeof instance[prop] === 'function') {
        _global[className].prototype[prop] = function() {
          return this[originalInstanceKey][prop].apply(this[originalInstanceKey], arguments);
        };
      } else {
        Object.defineProperty(_global[className].prototype, prop, {
          set: function(fn) {
            if (typeof fn === 'function') {
              this[originalInstanceKey][prop] = Zone.current.wrap(fn, className + '.' + prop);
            } else {
              this[originalInstanceKey][prop] = fn;
            }
          },
          get: function() {
            return this[originalInstanceKey][prop];
          }
        });
      }
    }(prop));
  }

  for (prop in OriginalClass) {
    if (prop !== 'prototype' && OriginalClass.hasOwnProperty(prop)) {
      _global[className][prop] = OriginalClass[prop];
    }
  }
};

export function createNamedFn(name: string, delegate: (self: any, args: any[]) => any): Function {
  try {
    return (Function('f', `return function ${name}(){return f(this, arguments)}`))(delegate);
  } catch (e) {
    // if we fail, we must be CSP, just return delegate.
    return function() {
      return delegate(this, <any>arguments);
    };
  }
}

export function patchMethod(
    target: any, name: string, patchFn: (delegate: Function, delegateName: string, name: string) =>
                                   (self: any, args: any[]) => any): Function {
  let proto = target;
  while (proto && Object.getOwnPropertyNames(proto).indexOf(name) === -1) {
    proto = Object.getPrototypeOf(proto);
  }
  if (!proto && target[name]) {
    // somehow we did not find it, but we can see it. This happens on IE for Window properties.
    proto = target;
  }
  const delegateName = zoneSymbol(name);
  let delegate: Function;
  if (proto && !(delegate = proto[delegateName])) {
    delegate = proto[delegateName] = proto[name];
    proto[name] = createNamedFn(name, patchFn(delegate, delegateName, name));
  }
  return delegate;
}
