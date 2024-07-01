var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/ag-grid-vue3/src/main.ts
var main_exports = {};
__export(main_exports, {
  AgGridVue: () => AgGridVue
});
module.exports = __toCommonJS(main_exports);

// packages/ag-grid-vue3/src/AgGridVue.ts
var import_ag_grid_community5 = require("ag-grid-community");

// packages/ag-grid-vue3/node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function makeMap(str, expectsLowerCase) {
  const set2 = new Set(str.split(","));
  return expectsLowerCase ? (val) => set2.has(val.toLowerCase()) : (val) => set2.has(val);
}
var EMPTY_OBJ = false ? Object.freeze({}) : {};
var EMPTY_ARR = false ? Object.freeze([]) : [];
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
var camelizeRE = /-(\w)/g;
var camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
var capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
var toHandlerKey = cacheStringFunction((str) => {
  const s = str ? `on${capitalize(str)}` : ``;
  return s;
});
var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
var def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isBooleanAttr = /* @__PURE__ */ makeMap(
  specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`
);

// packages/ag-grid-vue3/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var activeEffect;
function cleanupDepEffect(dep, effect2) {
  const trackId = dep.get(effect2);
  if (trackId !== void 0 && effect2._trackId !== trackId) {
    dep.delete(effect2);
    if (dep.size === 0) {
      dep.cleanup();
    }
  }
}
var shouldTrack = true;
var pauseScheduleStack = 0;
var trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function pauseScheduling() {
  pauseScheduleStack++;
}
function resetScheduling() {
  pauseScheduleStack--;
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()();
  }
}
function trackEffect(effect2, dep, debuggerEventExtraInfo) {
  var _a;
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanupDepEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
    if (false) {
      (_a = effect2.onTrack) == null ? void 0 : _a.call(effect2, extend({ effect: effect2 }, debuggerEventExtraInfo));
    }
  }
}
var queueEffectSchedulers = [];
function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
  var _a;
  pauseScheduling();
  for (const effect2 of dep.keys()) {
    let tracking;
    if (effect2._dirtyLevel < dirtyLevel && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2._shouldSchedule || (effect2._shouldSchedule = effect2._dirtyLevel === 0);
      effect2._dirtyLevel = dirtyLevel;
    }
    if (effect2._shouldSchedule && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      if (false) {
        (_a = effect2.onTrigger) == null ? void 0 : _a.call(effect2, extend({ effect: effect2 }, debuggerEventExtraInfo));
      }
      effect2.trigger();
      if ((!effect2._runnings || effect2.allowRecurse) && effect2._dirtyLevel !== 2) {
        effect2._shouldSchedule = false;
        if (effect2.scheduler) {
          queueEffectSchedulers.push(effect2.scheduler);
        }
      }
    }
  }
  resetScheduling();
}
var createDep = (cleanup, computed2) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.computed = computed2;
  return dep;
};
var targetMap = /* @__PURE__ */ new WeakMap();
var ITERATE_KEY = Symbol(false ? "iterate" : "");
var MAP_KEY_ITERATE_KEY = Symbol(false ? "Map key iterate" : "");
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep(() => depsMap.delete(key)));
    }
    trackEffect(
      activeEffect,
      dep,
      false ? {
        target,
        type,
        key
      } : void 0
    );
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || !isSymbol(key2) && key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  pauseScheduling();
  for (const dep of deps) {
    if (dep) {
      triggerEffects(
        dep,
        4,
        false ? {
          target,
          type,
          key,
          newValue,
          oldValue,
          oldTarget
        } : void 0
      );
    }
  }
  resetScheduling();
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      pauseScheduling();
      const res = toRaw(this)[key].apply(this, args);
      resetScheduling();
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty2(key) {
  if (!isSymbol(key))
    key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
var BaseReactiveHandler = class {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the reciever is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty2;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
};
var MutableReactiveHandler = class extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
};
var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    if (false) {
      warn(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
  deleteProperty(target, key) {
    if (false) {
      warn(
        `Delete operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
};
var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
var toShallow = (value) => value;
var getProto = (v) => Reflect.getPrototypeOf(v);
function get(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else if (false) {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get2.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value, oldValue);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else if (false) {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get2 ? get2.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0, oldValue);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const oldTarget = false ? isMap(target) ? new Map(target) : new Set(target) : void 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0, oldTarget);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    if (false) {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      warn(
        `${capitalize(type)} operation ${key}failed: target is readonly.`,
        toRaw(this)
      );
    }
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get(this, key);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(
      method,
      true,
      true
    );
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
var [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations
] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
var mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
var readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    if (false) {
      warn(`value cannot be made reactive: ${String(target)}`);
    }
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  if (Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
var toReactive = (value) => isObject(value) ? reactive(value) : value;
var toReadonly = (value) => isObject(value) ? readonly(value) : value;
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}

// packages/ag-grid-vue3/src/AgGridVue.ts
var import_vue3 = require("vue");

// packages/ag-grid-vue3/src/Utils.ts
var import_ag_grid_community = require("ag-grid-community");
var import_vue = require("vue");
var kebabProperty = (property) => {
  return property.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};
var kebabNameToAttrEventName = (kebabName) => {
  return `on${kebabName.charAt(0).toUpperCase()}${kebabName.substring(1, kebabName.length)}`;
};
var convertToRaw = (value) => value ? Object.isFrozen(value) ? value : (0, import_vue.markRaw)((0, import_vue.toRaw)(value)) : value;
var getAgGridProperties = () => {
  const props2 = {};
  const eventNameAsProps = import_ag_grid_community.ComponentUtil.PUBLIC_EVENTS.map(
    (eventName) => kebabNameToAttrEventName(kebabProperty(eventName))
  );
  eventNameAsProps.forEach((eventName) => props2[eventName] = void 0);
  const computed2 = {};
  const watch2 = {
    modelValue: {
      handler(currentValue, previousValue) {
        if (!this.gridCreated || !this.api) {
          return;
        }
        if (currentValue === previousValue) {
          return;
        }
        if (currentValue && previousValue) {
          if (currentValue.length === previousValue.length) {
            if (currentValue.every((item, index) => item === previousValue[index])) {
              return;
            }
          }
        }
        (0, import_ag_grid_community._processOnChange)({ rowData: currentValue }, this.api);
      },
      deep: true
    }
  };
  import_ag_grid_community.ComponentUtil.ALL_PROPERTIES.filter((propertyName) => propertyName != "gridOptions").forEach((propertyName) => {
    props2[propertyName] = {
      default: import_ag_grid_community.ComponentUtil.VUE_OMITTED_PROPERTY
    };
    watch2[propertyName] = {
      handler(currentValue, previousValue) {
        let currValue = currentValue;
        if (propertyName === "rowData" && currentValue != import_ag_grid_community.ComponentUtil.VUE_OMITTED_PROPERTY) {
          currValue = convertToRaw(currentValue);
        }
        this.batchChanges[propertyName] = currValue === import_ag_grid_community.ComponentUtil.VUE_OMITTED_PROPERTY ? void 0 : currValue;
        if (this.batchTimeout == null) {
          this.batchTimeout = setTimeout(() => {
            this.batchTimeout = null;
            (0, import_ag_grid_community._processOnChange)(this.batchChanges, this.api);
            this.batchChanges = (0, import_vue.markRaw)({});
          }, 0);
        }
      },
      deep: true
    };
  });
  return [props2, computed2, watch2];
};

// packages/ag-grid-vue3/src/VueFrameworkComponentWrapper.ts
var import_ag_grid_community3 = require("ag-grid-community");

// packages/ag-grid-vue3/src/VueComponentFactory.ts
var import_ag_grid_community2 = require("ag-grid-community");
var import_vue2 = require("vue");
function logMissingComp(component) {
  (0, import_ag_grid_community2._errorOnce)(`Could not find component with name of ${component}. Is it in Vue.components?`);
}
var VueComponentFactory = class _VueComponentFactory {
  static getComponentDefinition(component, parent) {
    let componentDefinition;
    if (typeof component === "string") {
      componentDefinition = this.searchForComponentInstance(parent, component);
    } else {
      componentDefinition = { extends: (0, import_vue2.defineComponent)({ ...component }) };
    }
    if (!componentDefinition) {
      logMissingComp(component);
    }
    if (componentDefinition.extends) {
      if (componentDefinition.extends.setup) {
        componentDefinition.setup = componentDefinition.extends.setup;
      }
      componentDefinition.extends.props = this.addParamsToProps(componentDefinition.extends.props);
    } else {
      componentDefinition.props = this.addParamsToProps(componentDefinition.props);
    }
    return componentDefinition;
  }
  static addParamsToProps(props2) {
    if (!props2 || Array.isArray(props2) && props2.indexOf("params") === -1) {
      props2 = ["params", ...props2 ? props2 : []];
    } else if (typeof props2 === "object" && !props2.params) {
      props2["params"] = {
        type: Object
      };
    }
    return props2;
  }
  static createAndMountComponent(component, params, parent, provides) {
    const componentDefinition = _VueComponentFactory.getComponentDefinition(component, parent);
    if (!componentDefinition) {
      return;
    }
    const { vNode, destroy, el } = this.mount(
      componentDefinition,
      { params: Object.freeze(params) },
      parent,
      provides || {}
    );
    return {
      componentInstance: vNode.component.proxy,
      element: el,
      destroy
    };
  }
  static mount(component, props2, parent, provides) {
    let vNode = (0, import_vue2.createVNode)(component, props2);
    vNode.appContext = parent.$.appContext;
    vNode.appContext.provides = {
      ...provides,
      ...vNode.appContext.provides ? vNode.appContext.provides : {},
      ...parent.$parent.$options.provide ? parent.$parent.$options.provide : {}
    };
    let el = document.createElement("div");
    (0, import_vue2.render)(vNode, el);
    const destroy = () => {
      if (el) {
        (0, import_vue2.render)(null, el);
      }
      el = null;
      vNode = null;
    };
    return { vNode, destroy, el };
  }
  static searchForComponentInstance(parent, component, maxDepth = 10, suppressError = false) {
    let componentInstance = null;
    let currentParent = parent.$parent;
    let depth = 0;
    while (!componentInstance && currentParent && currentParent.$options && ++depth < maxDepth) {
      const currentParentAsThis = currentParent;
      if (currentParentAsThis.$options && currentParentAsThis.$options.components && currentParentAsThis.$options.components[component]) {
        componentInstance = currentParentAsThis.$options.components[component];
      } else if (currentParentAsThis[component]) {
        componentInstance = currentParentAsThis[component];
      }
      currentParent = currentParent.$parent;
    }
    if (!componentInstance) {
      const components = parent.$.appContext.components;
      if (components && components[component]) {
        componentInstance = components[component];
      }
    }
    if (!componentInstance && !suppressError) {
      logMissingComp(component);
      return null;
    }
    return componentInstance;
  }
};

// packages/ag-grid-vue3/src/VueFrameworkComponentWrapper.ts
var VueFrameworkComponentWrapper = class _VueFrameworkComponentWrapper extends import_ag_grid_community3.BaseComponentWrapper {
  constructor(parent, provides) {
    super();
    this.parent = parent;
    if (!_VueFrameworkComponentWrapper.provides) {
      _VueFrameworkComponentWrapper.provides = provides;
    }
  }
  createWrapper(component) {
    const that = this;
    class DynamicComponent extends VueComponent {
      init(params) {
        super.init(params);
      }
      hasMethod(name) {
        const componentInstance = wrapper.getFrameworkComponentInstance();
        if (!componentInstance[name]) {
          return componentInstance.$.setupState[name] != null;
        } else {
          return true;
        }
      }
      callMethod(name, args) {
        const componentInstance = this.getFrameworkComponentInstance();
        const frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
        if (frameworkComponentInstance[name]) {
          return frameworkComponentInstance[name].apply(componentInstance, args);
        } else {
          return frameworkComponentInstance.$.setupState[name]?.apply(componentInstance, args);
        }
      }
      addMethod(name, callback) {
        wrapper[name] = callback;
      }
      processMethod(methodName, args) {
        if (methodName === "refresh") {
          this.getFrameworkComponentInstance().params = args[0];
        }
        if (this.hasMethod(methodName)) {
          return this.callMethod(methodName, args);
        }
        return methodName === "refresh";
      }
      createComponent(params) {
        return that.createComponent(component, params);
      }
    }
    const wrapper = new DynamicComponent();
    return wrapper;
  }
  createComponent(component, params) {
    return VueComponentFactory.createAndMountComponent(
      component,
      params,
      this.parent,
      _VueFrameworkComponentWrapper.provides
    );
  }
  createMethodProxy(wrapper, methodName, mandatory) {
    return function() {
      if (wrapper.hasMethod(methodName)) {
        return wrapper.callMethod(methodName, arguments);
      }
      if (mandatory) {
        (0, import_ag_grid_community3._warnOnce)("Framework component is missing the method " + methodName + "()");
      }
      return null;
    };
  }
  destroy() {
    this.parent = null;
  }
};
var VueComponent = class {
  getGui() {
    return this.element;
  }
  destroy() {
    if (this.getFrameworkComponentInstance() && typeof this.getFrameworkComponentInstance().destroy === "function") {
      this.getFrameworkComponentInstance().destroy();
    }
    this.unmount();
  }
  getFrameworkComponentInstance() {
    return this.componentInstance;
  }
  init(params) {
    const { componentInstance, element, destroy: unmount } = this.createComponent(params);
    this.componentInstance = componentInstance;
    this.unmount = unmount;
    this.element = element.firstElementChild ?? element;
  }
};

// packages/ag-grid-vue3/src/VueFrameworkOverrides.ts
var import_ag_grid_community4 = require("ag-grid-community");
var VueFrameworkOverrides = class extends import_ag_grid_community4.VanillaFrameworkOverrides {
  constructor(parent) {
    super("vue");
    this.parent = parent;
  }
  /*
   * vue components are specified in the "components" part of the vue component - as such we need a way to determine
   * if a given component is within that context - this method provides this
   * Note: This is only really used/necessary with cellRendererSelectors
   */
  frameworkComponent(name, components) {
    let result = VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true) ? name : null;
    if (!result && components && components[name]) {
      const indirectName = components[name];
      result = VueComponentFactory.searchForComponentInstance(this.parent, indirectName, 10, true) ? indirectName : null;
    }
    return result;
  }
  isFrameworkComponent(comp) {
    return typeof comp === "object";
  }
};

// packages/ag-grid-vue3/src/AgGridVue.ts
var ROW_DATA_EVENTS = /* @__PURE__ */ new Set(["rowDataUpdated", "cellValueChanged", "rowValueChanged"]);
var DATA_MODEL_ATTR_NAME = "onUpdate:modelValue";
var DATA_MODEL_EMIT_NAME = "update:modelValue";
var [props, computed, watch] = getAgGridProperties();
var AgGridVue = (0, import_vue3.defineComponent)({
  render() {
    return (0, import_vue3.h)("div");
  },
  props: {
    gridOptions: {
      type: Object,
      default: () => ({})
    },
    componentDependencies: {
      type: Array,
      default: () => []
    },
    plugins: [],
    modules: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: Array,
      default: void 0,
      required: false
    },
    ...props
  },
  data() {
    return {
      api: void 0,
      gridCreated: false,
      isDestroyed: false,
      gridReadyFired: false,
      emitRowModel: void 0,
      batchTimeout: null,
      batchChanges: markRaw({})
    };
  },
  computed,
  watch,
  methods: {
    globalEventListenerFactory(restrictToSyncOnly) {
      return (eventType) => {
        if (this.isDestroyed) {
          return;
        }
        if (eventType === "gridReady") {
          this.gridReadyFired = true;
        }
        const alwaysSync = import_ag_grid_community5.ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
        if (alwaysSync && !restrictToSyncOnly || !alwaysSync && restrictToSyncOnly) {
          return;
        }
        this.updateModelIfUsed(eventType);
      };
    },
    processChanges(propertyName, currentValue, previousValue) {
      if (this.gridCreated) {
        if (this.skipChange(propertyName, currentValue, previousValue)) {
          return;
        }
        const options = {
          [propertyName]: propertyName === "rowData" ? Object.isFrozen(currentValue) ? currentValue : markRaw(toRaw(currentValue)) : currentValue
        };
        (0, import_ag_grid_community5._processOnChange)(options, this.api);
      }
    },
    checkForBindingConflicts() {
      const thisAsAny = this;
      if ((thisAsAny.rowData && thisAsAny.rowData !== "AG-VUE-OMITTED-PROPERTY" || this.gridOptions.rowData) && thisAsAny.modelValue) {
        (0, import_ag_grid_community5._warnOnce)("Using both rowData and v-model. rowData will be ignored.");
      }
    },
    getRowData() {
      const rowData = [];
      this.api?.forEachNode((rowNode) => {
        rowData.push(rowNode.data);
      });
      return rowData;
    },
    updateModelIfUsed(eventType) {
      if (this.gridReadyFired && this.$attrs[DATA_MODEL_ATTR_NAME] && ROW_DATA_EVENTS.has(eventType)) {
        if (this.emitRowModel) {
          this.emitRowModel();
        }
      }
    },
    getRowDataBasedOnBindings() {
      const thisAsAny = this;
      const rowData = thisAsAny.modelValue;
      return rowData ? rowData : thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
    },
    getProvides() {
      let instance = (0, import_vue3.getCurrentInstance)();
      let provides = {};
      while (instance) {
        if (instance && instance.provides) {
          provides = { ...provides, ...instance.provides };
        }
        instance = instance.parent;
      }
      return provides;
    },
    /*
     * Prevents an infinite loop when using v-model for the rowData
     */
    skipChange(propertyName, currentValue, previousValue) {
      if (this.gridReadyFired && propertyName === "rowData" && this.$attrs[DATA_MODEL_ATTR_NAME]) {
        if (currentValue === previousValue) {
          return true;
        }
        if (currentValue && previousValue) {
          const currentRowData = currentValue;
          const previousRowData = previousValue;
          if (currentRowData.length === previousRowData.length) {
            for (let i = 0; i < currentRowData.length; i++) {
              if (currentRowData[i] !== previousRowData[i]) {
                return false;
              }
            }
            return true;
          }
        }
      }
      return false;
    },
    debounce(func, delay) {
      let timeout;
      return () => {
        const later = function() {
          func();
        };
        window.clearTimeout(timeout);
        timeout = window.setTimeout(later, delay);
      };
    }
  },
  mounted() {
    this.emitRowModel = this.debounce(() => {
      this.$emit(DATA_MODEL_EMIT_NAME, Object.freeze(this.getRowData()));
    }, 20);
    const provides = this.getProvides();
    const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this, provides);
    const gridOptions = markRaw((0, import_ag_grid_community5._combineAttributesAndGridOptions)(toRaw(this.gridOptions), this));
    this.checkForBindingConflicts();
    const rowData = this.getRowDataBasedOnBindings();
    if (rowData !== import_ag_grid_community5.ComponentUtil.VUE_OMITTED_PROPERTY) {
      gridOptions.rowData = convertToRaw(rowData);
    }
    const gridParams = {
      globalEventListener: this.globalEventListenerFactory().bind(this),
      globalSyncEventListener: this.globalEventListenerFactory(true).bind(this),
      frameworkOverrides: new VueFrameworkOverrides(this),
      providedBeanInstances: {
        frameworkComponentWrapper
      },
      modules: this.modules
    };
    this.api = (0, import_ag_grid_community5.createGrid)(this.$el, gridOptions, gridParams);
    this.gridCreated = true;
  },
  unmounted() {
    if (this.gridCreated) {
      this.api?.destroy();
      this.isDestroyed = true;
    }
  }
});
/*! Bundled license information:

@vue/shared/dist/shared.esm-bundler.js:
  (**
  * @vue/shared v3.4.26
  * (c) 2018-present Yuxi (Evan) You and Vue contributors
  * @license MIT
  **)
  (*! #__NO_SIDE_EFFECTS__ *)

@vue/reactivity/dist/reactivity.esm-bundler.js:
  (**
  * @vue/reactivity v3.4.26
  * (c) 2018-present Yuxi (Evan) You and Vue contributors
  * @license MIT
  **)
*/
