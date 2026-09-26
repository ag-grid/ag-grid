var __agSuperclass_BeanStub = BeanStub;
var __agSuperclass_BaseComponentWrapper = BaseComponentWrapper;
var __agSuperclass_VanillaFrameworkOverrides = VanillaFrameworkOverrides;
// packages/ag-grid-react/src/agGridReact.tsx
import React21, { Component } from "react";

// packages/ag-stack/dist/package/main.esm.mjs
var VERSION = "36.2.0-beta.20260922.1430";
var IS_SSR = typeof window !== "object" || !window?.document?.fonts?.forEach;
var getInjectionState = () => {
  const versionMap = globalThis.agStyleInjectionVersions ?? (globalThis.agStyleInjectionVersions = /* @__PURE__ */ new Map());
  let state = versionMap.get(VERSION);
  if (!state) {
    state = {
      map: /* @__PURE__ */ new WeakMap(),
      grids: /* @__PURE__ */ new Map(),
      paramsId: 0
    };
    versionMap.set(VERSION, state);
  }
  return state;
};
var injectionState = getInjectionState();
var LocalEventService = class {
  constructor() {
    this.allSyncListeners = /* @__PURE__ */ new Map();
    this.allAsyncListeners = /* @__PURE__ */ new Map();
    this.globalSyncListeners = /* @__PURE__ */ new Set();
    this.globalAsyncListeners = /* @__PURE__ */ new Set();
    this.asyncFunctionsQueue = [];
    this.scheduled = false;
    this.firedEvents = {};
  }
  setFrameworkOverrides(frameworkOverrides) {
    this.frameworkOverrides = frameworkOverrides;
  }
  getListeners(eventType, async, autoCreateListenerCollection) {
    const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
    let listeners = listenerMap.get(eventType);
    if (!listeners && autoCreateListenerCollection) {
      listeners = /* @__PURE__ */ new Set();
      listenerMap.set(eventType, listeners);
    }
    return listeners;
  }
  noRegisteredListenersExist() {
    return this.allSyncListeners.size === 0 && this.allAsyncListeners.size === 0 && this.globalSyncListeners.size === 0 && this.globalAsyncListeners.size === 0;
  }
  addEventListener(eventType, listener, async = false) {
    this.getListeners(eventType, async, true).add(listener);
  }
  removeEventListener(eventType, listener, async = false) {
    const listeners = this.getListeners(eventType, async, false);
    if (!listeners) {
      return;
    }
    listeners.delete(listener);
    if (listeners.size === 0) {
      (async ? this.allAsyncListeners : this.allSyncListeners).delete(eventType);
    }
  }
  addGlobalListener(listener, async = false) {
    this.getGlobalListeners(async).add(listener);
  }
  removeGlobalListener(listener, async = false) {
    this.getGlobalListeners(async).delete(listener);
  }
  dispatchEvent(event) {
    this.dispatchToListeners(event, true);
    this.dispatchToListeners(event, false);
    this.firedEvents[event.type] = true;
  }
  dispatchEventOnce(event) {
    if (!this.firedEvents[event.type]) {
      this.dispatchEvent(event);
    }
  }
  dispatchToListeners(event, async) {
    const eventType = event.type;
    if (async && "event" in event) {
      const browserEvent = event.event;
      if (browserEvent instanceof Event) {
        event.eventPath = browserEvent.composedPath();
      }
    }
    const { frameworkOverrides } = this;
    const runCallback = (func) => {
      const callback = frameworkOverrides ? () => frameworkOverrides.wrapIncoming(func) : func;
      if (async) {
        this.dispatchAsync(callback);
      } else {
        callback();
      }
    };
    const originalListeners = this.getListeners(eventType, async, false);
    if ((originalListeners?.size ?? 0) > 0) {
      const listeners = new Set(originalListeners);
      for (const listener of listeners) {
        if (!originalListeners?.has(listener)) {
          continue;
        }
        runCallback(() => listener(event));
      }
    }
    const globalListenersSrc = this.getGlobalListeners(async);
    if (globalListenersSrc.size > 0) {
      const globalListeners = new Set(globalListenersSrc);
      for (const listener of globalListeners) {
        runCallback(() => listener(eventType, event));
      }
    }
  }
  getGlobalListeners(async) {
    return async ? this.globalAsyncListeners : this.globalSyncListeners;
  }
  // this gets called inside the grid's thread, for each event that it
  // wants to set async. the grid then batches the events into one setTimeout()
  // because setTimeout() is an expensive operation. ideally we would have
  // each event in it's own setTimeout(), but we batch for performance.
  dispatchAsync(func) {
    this.asyncFunctionsQueue.push(func);
    if (!this.scheduled) {
      const flush = () => {
        window.setTimeout(this.flushAsyncQueue.bind(this), 0);
      };
      const frameworkOverrides = this.frameworkOverrides;
      if (frameworkOverrides) {
        frameworkOverrides.wrapIncoming(flush);
      } else {
        flush();
      }
      this.scheduled = true;
    }
  }
  // this happens in the next VM turn only, and empties the queue of events
  flushAsyncQueue() {
    this.scheduled = false;
    const queueCopy = this.asyncFunctionsQueue.slice();
    this.asyncFunctionsQueue = [];
    for (const func of queueCopy) {
      func();
    }
  }
};
function _areEqual(a, b, comparator) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return a == null && b == null;
  }
  const len = a.length;
  if (len !== b.length) {
    return false;
  }
  if (comparator) {
    for (let i = 0; i < len; ++i) {
      const valueA = a[i];
      const valueB = b[i];
      if (valueA !== valueB && !comparator(valueA, valueB)) {
        return false;
      }
    }
    return true;
  }
  for (let i = 0; i < len; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
function _removeFromArray(array, object) {
  const index = array.indexOf(object);
  if (index >= 0) {
    array.splice(index, 1);
  }
}
function _setAriaAttribute(element, attribute, value) {
  element.setAttribute(_ariaAttributeName(attribute), value.toString());
}
function _removeAriaAttribute(element, attribute) {
  element.removeAttribute(_ariaAttributeName(attribute));
}
function _ariaAttributeName(attribute) {
  return `aria-${attribute}`;
}
function _setAriaRole(element, role) {
  if (role) {
    element.setAttribute("role", role);
  } else {
    element.removeAttribute("role");
  }
}
function _setAriaMultiSelectable(element, multiSelectable) {
  _setAriaAttribute(element, "multiselectable", multiSelectable);
}
function _setAriaRowCount(element, rowCount) {
  _setAriaAttribute(element, "rowcount", rowCount);
}
function _setAriaRowIndex(element, rowIndex) {
  _setAriaAttribute(element, "rowindex", rowIndex);
}
function _setAriaColCount(element, colCount) {
  _setAriaAttribute(element, "colcount", colCount);
}
function _setAriaSort(element, sort) {
  _setAriaAttribute(element, "sort", sort);
}
function _removeAriaSort(element) {
  _removeAriaAttribute(element, "sort");
}
function _exists(value) {
  return value != null && value !== "";
}
function _getRootNode(beans) {
  return beans.eRootDiv.getRootNode();
}
function _getActiveDomElement(beans) {
  return _getRootNode(beans).activeElement;
}
function _getDocument(beans) {
  const { gos, eRootDiv } = beans;
  let result = null;
  const optionsGetDocument = gos.get("getDocument");
  if (optionsGetDocument && _exists(optionsGetDocument)) {
    result = optionsGetDocument();
  } else if (eRootDiv) {
    result = eRootDiv.ownerDocument;
  }
  if (result && _exists(result)) {
    return result;
  }
  return document;
}
function _getWindow(beans) {
  const eDocument = _getDocument(beans);
  return eDocument.defaultView || window;
}
function _removeFromParent(node) {
  if (node?.parentNode) {
    node.remove();
  }
}
function _observeResize(beans, element, callback) {
  const win = _getWindow(beans);
  const ResizeObserverImpl = win.ResizeObserver;
  const resizeObserver = ResizeObserverImpl ? new ResizeObserverImpl(callback) : null;
  resizeObserver?.observe(element);
  return () => resizeObserver?.disconnect();
}
function _requestAnimationFrame(beans, callback) {
  const win = _getWindow(beans);
  if (win.requestAnimationFrame) {
    win.requestAnimationFrame(callback);
  } else if (win.webkitRequestAnimationFrame) {
    win.webkitRequestAnimationFrame(callback);
  } else {
    win.setTimeout(callback, 0);
  }
}
var PASSIVE_EVENTS = ["touchstart", "touchend", "touchmove", "touchcancel", "scroll"];
var NON_PASSIVE_EVENTS = ["wheel"];
function _addSafePassiveEventListener(eElement, event, listener) {
  const passive = getPassiveStateForEvent(event);
  let options;
  if (passive != null) {
    options = { passive };
  }
  eElement.addEventListener(event, listener, options);
}
var getPassiveStateForEvent = (event) => {
  const isPassive = PASSIVE_EVENTS.includes(event);
  const isNonPassive = NON_PASSIVE_EVENTS.includes(event);
  if (isPassive) {
    return true;
  }
  if (isNonPassive) {
    return false;
  }
};
function defaultLocaleTextFunc(_key, defaultValue) {
  return defaultValue;
}
function _getLocaleTextFunc(localeSvc) {
  return localeSvc?.getLocaleTextFunc() ?? defaultLocaleTextFunc;
}
var DESTROYED_EVENT = { type: "destroyed" };
var AgBeanStub = class {
  constructor() {
    this.beans = null;
    this.gos = null;
    this.eventSvc = null;
    this.destroyed = false;
    this.localEventService = null;
    this.stubContext = null;
    this.destroyFunctions = null;
    this.propertyListenerId = 0;
    this.lastChangeSetIdLookup = null;
  }
  preWireBeans(beans) {
    this.beans = beans;
    this.gos = beans.gos;
    this.eventSvc = beans.eventSvc;
    this.stubContext = beans.context;
  }
  // this was a test constructor niall built, when active, it prints after 5 seconds all beans/components that are
  // not destroyed. to use, create a new grid, then api.destroy() before 5 seconds. then anything that gets printed
  // points to a bean or component that was not properly disposed of.
  // constructor() {
  //     setTimeout(()=> {
  //         if (this.isAlive()) {
  //             let prototype: any = Object.getPrototypeOf(this);
  //             const constructor: any = prototype.constructor;
  //             const constructorString = constructor.toString();
  //             const beanName = constructorString.substring(9, constructorString.indexOf("("));
  //             console.log('is alive ' + beanName);
  //         }
  //     }, 5000);
  // }
  destroy() {
    const destroyFunctions = this.destroyFunctions;
    if (destroyFunctions) {
      for (let i = 0; i < destroyFunctions.length; i++) {
        destroyFunctions[i]();
      }
      destroyFunctions.length = 0;
    }
    this.destroyed = true;
    this.dispatchLocalEvent(DESTROYED_EVENT);
  }
  /** Add a local event listener against this BeanStub */
  addEventListener(eventType, listener, async) {
    let localEventService = this.localEventService;
    if (!localEventService) {
      localEventService = new LocalEventService();
      this.localEventService = localEventService;
    }
    localEventService.addEventListener(eventType, listener, async);
  }
  /** Remove a local event listener from this BeanStub */
  removeEventListener(eventType, listener, async) {
    this.localEventService?.removeEventListener(eventType, listener, async);
  }
  dispatchLocalEvent(event) {
    this.localEventService?.dispatchEvent(event);
  }
  addManagedElementListeners(object, handlers) {
    return this._setupListeners(object, handlers);
  }
  addManagedEventListeners(handlers) {
    return this._setupListeners(this.eventSvc, handlers);
  }
  addManagedListeners(object, handlers) {
    return this._setupListeners(object, handlers);
  }
  _setupListeners(object, handlers) {
    const destroyFuncs = [];
    const keys = Object.keys(handlers);
    for (let i = 0, len = keys.length; i < len; ++i) {
      const k = keys[i];
      const handler = handlers[k];
      if (handler) {
        destroyFuncs.push(this._setupListener(object, k, handler));
      }
    }
    return destroyFuncs;
  }
  _setupListener(object, event, listener) {
    if (this.destroyed) {
      return () => null;
    }
    let destroyFunc;
    if (isAgEventEmitter(object)) {
      object.__addEventListener(event, listener);
      destroyFunc = () => {
        object.__removeEventListener(event, listener);
        return null;
      };
    } else {
      const objIsEventService = isEventService(object);
      if (object instanceof HTMLElement) {
        _addSafePassiveEventListener(object, event, listener);
      } else if (objIsEventService) {
        object.addListener(event, listener);
      } else {
        object.addEventListener(event, listener);
      }
      destroyFunc = objIsEventService ? () => {
        object.removeListener(event, listener);
        return null;
      } : () => {
        object.removeEventListener(event, listener);
        return null;
      };
    }
    return this.registerDestroyFunc(destroyFunc);
  }
  /**
   * Setup a managed property listener for the given property.
   * However, stores the destroy function in the beanStub so that if this bean
   * is a component the destroy function will be called when the component is destroyed
   * as opposed to being cleaned up only when the properties service is destroyed.
   */
  setupPropertyListener(event, listener) {
    const { gos } = this;
    gos.addPropertyEventListener(event, listener);
    const destroyFunc = () => {
      gos.removePropertyEventListener(event, listener);
      return null;
    };
    return this.registerDestroyFunc(destroyFunc);
  }
  /**
   * Setup a managed property listener for the given GridOption property.
   * @param event GridOption property to listen to changes for.
   * @param listener Listener to run when property value changes
   */
  addManagedPropertyListener(event, listener) {
    if (this.destroyed) {
      return () => null;
    }
    return this.setupPropertyListener(event, listener);
  }
  /**
   * Setup managed property listeners for the given set of GridOption properties.
   * The listener will be run if any of the property changes but will only run once if
   * multiple of the properties change within the same framework lifecycle event.
   * Works on the basis that GridOptionsService updates all properties *before* any property change events are fired.
   * @param events Array of GridOption properties to listen for changes too.
   * @param listener Shared listener to run if any of the properties change
   */
  addManagedPropertyListeners(events, listener) {
    if (this.destroyed) {
      return;
    }
    const eventsKey = events.join("-") + this.propertyListenerId++;
    const wrappedListener = (event) => {
      const changeSet = event.changeSet;
      if (changeSet) {
        let lookup = this.lastChangeSetIdLookup;
        if (!lookup) {
          lookup = {};
          this.lastChangeSetIdLookup = lookup;
        }
        if (changeSet.id === lookup[eventsKey]) {
          return;
        }
        lookup[eventsKey] = changeSet.id;
      }
      const propertiesChangeEvent = {
        type: "propertyChanged",
        changeSet,
        source: event.source
      };
      listener(propertiesChangeEvent);
    };
    for (let i = 0, len = events.length; i < len; ++i) {
      this.setupPropertyListener(events[i], wrappedListener);
    }
  }
  // Prototype method, not a per-instance arrow — never invoked detached, so binding per bean only wastes memory.
  isAlive() {
    return !this.destroyed;
  }
  /** Returns a function that runs `callback` at most once per animation frame. `_requestAnimationFrame`
   *  has no cancellation, so a destroyed bean instead leaves the flag set and queues no further frames. */
  throttleToFrame(callback) {
    let queued = false;
    const run = () => {
      if (this.isAlive()) {
        queued = false;
        callback();
      }
    };
    return () => {
      if (!queued) {
        queued = true;
        _requestAnimationFrame(this.beans, run);
      }
    };
  }
  getLocaleTextFunc() {
    return _getLocaleTextFunc(this.beans.localeSvc);
  }
  // Lazy — most beans never register a destroy func, so the array is allocated on first push.
  pushDestroyFunc(destroyFunc) {
    const destroyFunctions = this.destroyFunctions;
    if (destroyFunctions) {
      destroyFunctions.push(destroyFunc);
    } else {
      this.destroyFunctions = [destroyFunc];
    }
  }
  /** Register a destroy func and return an unregister callback that removes it if called before destroy. */
  registerDestroyFunc(destroyFunc) {
    this.pushDestroyFunc(destroyFunc);
    return () => {
      destroyFunc();
      const destroyFunctions = this.destroyFunctions;
      if (destroyFunctions) {
        _removeFromArray(destroyFunctions, destroyFunc);
      }
      return null;
    };
  }
  addDestroyFunc(func) {
    if (this.destroyed) {
      func();
    } else {
      this.pushDestroyFunc(func);
    }
  }
  /** doesn't throw an error if `bean` is undefined */
  createOptionalManagedBean(bean, context) {
    return bean ? this.createManagedBean(bean, context) : void 0;
  }
  createManagedBean(bean, context) {
    const res = this.createBean(bean, context);
    this.addDestroyFunc(this.destroyBean.bind(this, bean, context));
    return res;
  }
  createBean(bean, context, afterPreCreateCallback) {
    return (context || this.stubContext).createBean(bean, afterPreCreateCallback);
  }
  /**
   * Destroys a bean and returns undefined to support destruction and clean up in a single line.
   * this.dateComp = this.context.destroyBean(this.dateComp);
   */
  destroyBean(bean, context) {
    return (context || this.stubContext).destroyBean(bean);
  }
  /**
   * Destroys an array of beans and returns an empty array to support destruction and clean up in a single line.
   * this.dateComps = this.context.destroyBeans(this.dateComps);
   */
  destroyBeans(beans, context) {
    return (context || this.stubContext).destroyBeans(beans);
  }
};
AgBeanStub.prototype.__v_skip = true;
function isAgEventEmitter(object) {
  return object.__addEventListener !== void 0;
}
function isEventService(object) {
  return object.eventServiceType === "global";
}
var CssClassManager = class {
  constructor(getGui) {
    this.cssClassStates = {};
    this.getGui = getGui;
  }
  toggleCss(className, addOrRemove) {
    if (!className) {
      return;
    }
    if (className.includes(" ")) {
      const list = (className || "").split(" ");
      if (list.length > 1) {
        for (const cls of list) {
          this.toggleCss(cls, addOrRemove);
        }
        return;
      }
    }
    const updateNeeded = this.cssClassStates[className] !== addOrRemove;
    if (updateNeeded && className.length) {
      this.getGui()?.classList.toggle(className, addOrRemove);
      this.cssClassStates[className] = addOrRemove;
    }
  }
};
var doOnceSet = /* @__PURE__ */ new Set();
var _doOnce = (func, key) => {
  if (!doOnceSet.has(key)) {
    doOnceSet.add(key);
    func();
  }
};
_doOnce._set = doOnceSet;
var memoize = (fn) => {
  const values = /* @__PURE__ */ new Map();
  return (a) => {
    const key = a;
    if (!values.has(key)) {
      values.set(key, fn(a));
    }
    return values.get(key);
  };
};
var accentMix = (mix) => ({ ref: "accentColor", mix });
var foregroundMix = (mix) => ({ ref: "foregroundColor", mix });
var foregroundBackgroundMix = (mix) => ({
  ref: "foregroundColor",
  mix,
  onto: "backgroundColor"
});
var backgroundColor = { ref: "backgroundColor" };
var foregroundColor = { ref: "foregroundColor" };
var accentColor = { ref: "accentColor" };
var defaultLightColorSchemeParams = {
  backgroundColor: "#fff",
  foregroundColor: "#181d1f",
  borderColor: foregroundMix(0.15),
  chromeBackgroundColor: foregroundBackgroundMix(0.02),
  browserColorScheme: "light"
};
var defaultFontFamily = () => [
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Oxygen-Sans",
  "Ubuntu",
  "Cantarell",
  "Helvetica Neue",
  "sans-serif"
];
var sharedDefaults = {
  ...defaultLightColorSchemeParams,
  textColor: foregroundColor,
  accentColor: "#2196f3",
  rowHoverColor: accentMix(0.08),
  invalidColor: "#e02525",
  fontFamily: defaultFontFamily(),
  subtleTextColor: {
    ref: "textColor",
    mix: 0.5
  },
  borderWidth: 1,
  borderRadius: 4,
  spacing: 8,
  fontSize: 14,
  fontWeight: 400,
  focusShadow: {
    spread: 3,
    color: accentMix(0.5)
  },
  focusErrorShadow: {
    spread: 3,
    color: {
      ref: "invalidColor",
      onto: "backgroundColor",
      mix: 0.5
    }
  },
  popupShadow: "0 0 16px #00000026",
  cardShadow: "0 1px 4px 1px #00000018",
  dropdownShadow: { ref: "cardShadow" },
  listItemHeight: {
    calc: "max(iconSize, dataFontSize) + widgetVerticalSpacing"
  },
  dragAndDropImageBackgroundColor: backgroundColor,
  dragAndDropImageBorder: true,
  dragAndDropImageNotAllowedBorder: {
    color: {
      ref: "invalidColor",
      onto: "dragAndDropImageBackgroundColor",
      mix: 0.5
    }
  },
  dragAndDropImageShadow: {
    ref: "popupShadow"
  },
  iconSize: 16,
  iconColor: "inherit",
  toggleButtonWidth: 28,
  toggleButtonHeight: 18,
  toggleButtonOnBackgroundColor: accentColor,
  toggleButtonOffBackgroundColor: foregroundBackgroundMix(0.3),
  toggleButtonSwitchBackgroundColor: backgroundColor,
  toggleButtonSwitchInset: 2,
  tooltipBackgroundColor: {
    ref: "chromeBackgroundColor"
  },
  tooltipErrorBackgroundColor: {
    ref: "invalidColor",
    onto: "backgroundColor",
    mix: 0.1
  },
  tooltipTextColor: {
    ref: "textColor"
  },
  tooltipErrorTextColor: {
    ref: "invalidColor"
  },
  tooltipBorder: true,
  tooltipErrorBorder: {
    color: {
      ref: "invalidColor",
      onto: "backgroundColor",
      mix: 0.25
    }
  },
  panelBackgroundColor: backgroundColor,
  panelTitleBarHeight: { ref: "headerHeight" },
  panelTitleBarBackgroundColor: {
    ref: "headerBackgroundColor"
  },
  panelTitleBarIconColor: {
    ref: "headerTextColor"
  },
  panelTitleBarTextColor: {
    ref: "headerTextColor"
  },
  panelTitleBarFontFamily: {
    ref: "headerFontFamily"
  },
  panelTitleBarFontSize: {
    ref: "headerFontSize"
  },
  panelTitleBarFontWeight: {
    ref: "headerFontWeight"
  },
  panelTitleBarBorder: true,
  // Unlike other picker field params, pickerFieldHeight must be a shared param
  // because the pagination panel height depends on it
  pickerFieldHeight: {
    calc: "max(iconSize, fontSize) + spacing * 2"
  },
  dialogShadow: {
    ref: "popupShadow"
  },
  dialogBorder: {
    color: foregroundMix(0.2)
  },
  widgetContainerHorizontalPadding: {
    calc: "spacing * 1.5"
  },
  widgetContainerVerticalPadding: {
    calc: "spacing * 1.5"
  },
  widgetHorizontalSpacing: {
    calc: "spacing * 1.5"
  },
  widgetVerticalSpacing: {
    ref: "spacing"
  },
  dataFontSize: {
    ref: "fontSize"
  },
  headerBackgroundColor: {
    ref: "chromeBackgroundColor"
  },
  headerFontFamily: {
    ref: "fontFamily"
  },
  headerFontSize: {
    ref: "fontSize"
  },
  headerFontWeight: 500,
  headerTextColor: {
    ref: "textColor"
  },
  headerHeight: {
    calc: "max(iconSize, headerFontSize) + spacing * 4 * headerVerticalPaddingScale"
  },
  headerVerticalPaddingScale: 1,
  menuBorder: {
    color: foregroundMix(0.2)
  },
  menuBackgroundColor: foregroundBackgroundMix(0.03),
  menuTextColor: foregroundBackgroundMix(0.95),
  menuShadow: {
    ref: "popupShadow"
  },
  menuSeparatorColor: {
    ref: "borderColor"
  }
};
var paramTypes = [
  "colorScheme",
  "color",
  "length",
  "scale",
  "borderStyle",
  "border",
  "shadow",
  "image",
  "fontFamily",
  "fontWeight",
  "duration"
];
var getParamType = memoize((param) => {
  param = param.toLowerCase();
  return paramTypes.find((type) => param.endsWith(type.toLowerCase())) ?? "length";
});
var TabGuardClassNames = {
  TAB_GUARD: "ag-tab-guard",
  TAB_GUARD_TOP: "ag-tab-guard-top",
  TAB_GUARD_BOTTOM: "ag-tab-guard-bottom"
};
var RESIZE_CONTAINER_STYLE = "ag-resizer-wrapper";
var makeDiv = (dataRefPrefix, classSuffix) => ({
  tag: "div",
  ref: `${dataRefPrefix}Resizer`,
  cls: `ag-resizer ag-resizer-${classSuffix}`
});
var RESIZE_TEMPLATE = {
  tag: "div",
  cls: RESIZE_CONTAINER_STYLE,
  children: [
    makeDiv("eTopLeft", "topLeft"),
    makeDiv("eTop", "top"),
    makeDiv("eTopRight", "topRight"),
    makeDiv("eRight", "right"),
    makeDiv("eBottomRight", "bottomRight"),
    makeDiv("eBottom", "bottom"),
    makeDiv("eBottomLeft", "bottomLeft"),
    makeDiv("eLeft", "left")
  ]
};
function _toString(toEscape) {
  return toEscape?.toString().toString() ?? null;
}
var DATE_TIME_SEPARATOR = "T";
var DATE_TIME_SEPARATOR_REGEXP = new RegExp(`[${DATE_TIME_SEPARATOR} ]`);
var DATE_TIME_REGEXP = new RegExp(
  `^\\d{4}-\\d{2}-\\d{2}([${DATE_TIME_SEPARATOR} ]\\d{2}:\\d{2}(:\\d{2})?(\\.\\d+)?(Z|[+-]\\d{2}(:?\\d{2})?)?)?$`
);

// packages/ag-grid-react/src/reactUi/agGridReactUi.tsx
import React20, {
  forwardRef as forwardRef3,
  useCallback as useCallback15,
  useContext as useContext16,
  useEffect as useEffect12,
  useImperativeHandle as useImperativeHandle3,
  useMemo as useMemo12,
  useRef as useRef18,
  useState as useState16
} from "react";
import {
  BaseComponentWrapper,
  GridCoreCreator,
  VanillaFrameworkOverrides,
  _combineAttributesAndGridOptions,
  _findEnterpriseCoreModule,
  _getGridOption,
  _getGridRegisteredModules,
  _isClientSideRowModel,
  _isServerSideRowModel,
  _processOnChange,
  _warnForGrid as _warnForGrid2,
  _warnWithoutAttribution
} from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/cellRenderer/groupCellRenderer.tsx
import React3, {
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

// packages/ag-grid-react/src/reactUi/beansContext.tsx
import React from "react";
var BeansContext = React.createContext({});
var RenderModeContext = React.createContext("default");

// packages/ag-grid-react/src/reactUi/jsComp.tsx
var showJsComp = (compDetails, context, eParent, ref) => {
  const doNothing = !compDetails || compDetails.componentFromFramework || context.isDestroyed();
  if (doNothing) {
    return;
  }
  const promise = compDetails.newAgStackInstance();
  let comp;
  let compGui;
  let destroyed = false;
  promise.then((c) => {
    if (destroyed) {
      context.destroyBean(c);
      return;
    }
    comp = c;
    compGui = comp.getGui?.();
    if (compGui) {
      eParent.appendChild(compGui);
    }
    setRef(ref, comp);
  });
  return () => {
    destroyed = true;
    if (!comp) {
      return;
    }
    compGui?.remove();
    context.destroyBean(comp);
    if (ref) {
      setRef(ref, void 0);
    }
  };
};
var setRef = (ref, value) => {
  if (!ref) {
    return;
  }
  if (ref instanceof Function) {
    const refCallback = ref;
    refCallback(value);
  } else {
    const refObj = ref;
    refObj.current = value;
  }
};

// packages/ag-grid-react/src/reactUi/utils.tsx
import React2 from "react";
import ReactDOM from "react-dom";
var classesList = (...list) => {
  const filtered = list.filter((s) => s != null && s !== "");
  return filtered.join(" ");
};
var CssClasses = class _CssClasses {
  constructor(...initialClasses) {
    this.classesMap = {};
    for (const className of initialClasses) {
      this.classesMap[className] = true;
    }
  }
  setClass(className, on) {
    const nothingHasChanged = !!this.classesMap[className] == on;
    if (nothingHasChanged) {
      return this;
    }
    const res = new _CssClasses();
    res.classesMap = { ...this.classesMap };
    res.classesMap[className] = on;
    return res;
  }
  toString() {
    const res = Object.keys(this.classesMap).filter((key) => this.classesMap[key]).join(" ");
    return res;
  }
};
var isComponentStateless = (Component2) => {
  const hasSymbol = () => typeof Symbol === "function" && Symbol.for;
  const getMemoType = () => hasSymbol() ? /* @__PURE__ */ Symbol.for("react.memo") : 60115;
  return typeof Component2 === "function" && !(Component2.prototype && Component2.prototype.isReactComponent) || typeof Component2 === "object" && Component2.$$typeof === getMemoType();
};
var reactVersion = React2.version?.split(".")[0];
var isReactVersion17Minus = reactVersion === "16" || reactVersion === "17";
function isReact19() {
  return reactVersion === "19";
}
var disableFlushSync = false;
function runWithoutFlushSync(func) {
  if (!disableFlushSync) {
    setTimeout(() => disableFlushSync = false, 0);
  }
  disableFlushSync = true;
  return func();
}
var agFlushSync = (useFlushSync, fn) => {
  if (!isReactVersion17Minus && useFlushSync && !disableFlushSync) {
    ReactDOM.flushSync(fn);
  } else {
    fn();
  }
};
var agStartTransition = (fn) => {
  if (!isReactVersion17Minus) {
    React2.startTransition(fn);
  } else {
    fn();
  }
};
function agUseSyncExternalStore(subscribe, getSnapshot, defaultSnapshot) {
  if (React2.useSyncExternalStore) {
    return React2.useSyncExternalStore(subscribe, getSnapshot);
  } else {
    return defaultSnapshot;
  }
}
function getNextValueIfDifferent(prev, next, maintainOrder) {
  if (next == null || prev == null) {
    return next;
  }
  if (prev === next || next.length === 0 && prev.length === 0) {
    return prev;
  }
  if (maintainOrder || prev.length === 0 && next.length > 0 || prev.length > 0 && next.length === 0) {
    return next;
  }
  const oldValues = [];
  const newValues = [];
  const prevMap = /* @__PURE__ */ new Map();
  const nextMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < next.length; i++) {
    const c = next[i];
    nextMap.set(c.instanceId, c);
  }
  for (let i = 0; i < prev.length; i++) {
    const c = prev[i];
    prevMap.set(c.instanceId, c);
    if (nextMap.has(c.instanceId)) {
      oldValues.push(c);
    }
  }
  for (let i = 0; i < next.length; i++) {
    const c = next[i];
    const instanceId = c.instanceId;
    if (!prevMap.has(instanceId)) {
      newValues.push(c);
    }
  }
  if (oldValues.length === prev.length && newValues.length === 0) {
    return prev;
  }
  if (oldValues.length === 0 && newValues.length === next.length) {
    return next;
  }
  if (oldValues.length === 0) {
    return newValues;
  }
  if (newValues.length === 0) {
    return oldValues;
  }
  return [...oldValues, ...newValues];
}

// packages/ag-grid-react/src/reactUi/cellRenderer/groupCellRenderer.tsx
var GroupCellRenderer = forwardRef((props, ref) => {
  const { registry, context } = useContext(BeansContext);
  const eGui = useRef(null);
  const eValueRef = useRef(null);
  const eCheckboxRef = useRef(null);
  const eExpandedRef = useRef(null);
  const eContractedRef = useRef(null);
  const ctrlRef = useRef();
  const [innerCompDetails, setInnerCompDetails] = useState();
  const [childCount, setChildCount] = useState();
  const [value, setValue] = useState();
  const [cssClasses, setCssClasses] = useState(() => new CssClasses());
  const [expandedCssClasses, setExpandedCssClasses] = useState(() => new CssClasses("ag-hidden"));
  const [expandedAriaHidden, setExpandedAriaHidden] = useState(true);
  const [contractedCssClasses, setContractedCssClasses] = useState(() => new CssClasses("ag-hidden"));
  const [contractedAriaHidden, setContractedAriaHidden] = useState(true);
  const [checkboxCssClasses, setCheckboxCssClasses] = useState(() => new CssClasses("ag-invisible"));
  const [checkboxAriaHidden, setCheckboxAriaHidden] = useState(true);
  useImperativeHandle(ref, () => {
    return {
      // force new instance when grid tries to refresh
      refresh() {
        return false;
      }
    };
  });
  useLayoutEffect(() => {
    return showJsComp(innerCompDetails, context, eValueRef.current);
  }, [innerCompDetails]);
  const setRef2 = useCallback((eRef) => {
    eGui.current = eRef;
    if (!eRef || context.isDestroyed()) {
      ctrlRef.current = context.destroyBean(ctrlRef.current);
      return;
    }
    const compProxy = {
      setInnerRenderer: (details, valueToDisplay) => {
        setInnerCompDetails(details);
        setValue(valueToDisplay);
      },
      setChildCount: (count) => setChildCount(count),
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setContractedDisplayed: (displayed) => {
        setContractedCssClasses((prev) => prev.setClass("ag-hidden", !displayed));
        setContractedAriaHidden(!displayed);
      },
      setExpandedDisplayed: (displayed) => {
        setExpandedCssClasses((prev) => prev.setClass("ag-hidden", !displayed));
        setExpandedAriaHidden(!displayed);
      },
      setCheckboxVisible: (visible) => {
        setCheckboxCssClasses((prev) => prev.setClass("ag-invisible", !visible));
        setCheckboxAriaHidden(!visible);
      },
      setCheckboxSpacing: (add) => setCheckboxCssClasses((prev) => prev.setClass("ag-group-checkbox-spacing", add))
    };
    const groupCellRendererCtrl = registry.createDynamicBean("groupCellRendererCtrl", true);
    if (groupCellRendererCtrl) {
      ctrlRef.current = context.createBean(groupCellRendererCtrl);
      ctrlRef.current.init(
        compProxy,
        eRef,
        eCheckboxRef.current,
        eExpandedRef.current,
        eContractedRef.current,
        GroupCellRenderer,
        props
      );
    }
  }, []);
  const className = useMemo(() => `ag-cell-wrapper ${cssClasses.toString()}`, [cssClasses]);
  const expandedClassName = useMemo(() => `ag-group-expanded ${expandedCssClasses.toString()}`, [expandedCssClasses]);
  const contractedClassName = useMemo(
    () => `ag-group-contracted ${contractedCssClasses.toString()}`,
    [contractedCssClasses]
  );
  const checkboxClassName = useMemo(() => `ag-group-checkbox ${checkboxCssClasses.toString()}`, [checkboxCssClasses]);
  const useFwRenderer = innerCompDetails?.componentFromFramework;
  const FwRenderer = useFwRenderer ? innerCompDetails.componentClass : void 0;
  const useValue = innerCompDetails == null && value != null;
  const escapedValue = _toString(value);
  return /* @__PURE__ */ React3.createElement(
    "span",
    {
      className,
      ref: setRef2,
      ...!props.colDef ? { role: ctrlRef.current?.getCellAriaRole() } : {}
    },
    /* @__PURE__ */ React3.createElement("span", { className: expandedClassName, ref: eExpandedRef, "aria-hidden": expandedAriaHidden }),
    /* @__PURE__ */ React3.createElement("span", { className: contractedClassName, ref: eContractedRef, "aria-hidden": contractedAriaHidden }),
    /* @__PURE__ */ React3.createElement("span", { className: checkboxClassName, ref: eCheckboxRef, "aria-hidden": checkboxAriaHidden }),
    /* @__PURE__ */ React3.createElement("span", { className: "ag-group-value", ref: eValueRef }, useValue ? escapedValue : useFwRenderer ? /* @__PURE__ */ React3.createElement(FwRenderer, { ...innerCompDetails.params }) : null),
    /* @__PURE__ */ React3.createElement("span", { className: "ag-group-child-count" }, childCount)
  );
});
var groupCellRenderer_default = GroupCellRenderer;

// packages/ag-grid-react/src/shared/customComp/customComponentWrapper.ts
import { AgPromise as AgPromise2 } from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/customComp/customWrapperComp.tsx
import React4, { memo, useEffect, useState as useState2 } from "react";

// packages/ag-grid-react/src/shared/customComp/customContext.ts
import { createContext } from "react";
var CustomContext = createContext({
  setMethods: () => {
  }
});

// packages/ag-grid-react/src/reactUi/customComp/customWrapperComp.tsx
var CustomWrapperComp = (params) => {
  const { initialProps, addUpdateCallback, CustomComponentClass, setMethods } = params;
  const [{ key, ...props }, setProps] = useState2(initialProps);
  useEffect(() => {
    addUpdateCallback((newProps) => setProps(newProps));
  }, []);
  return /* @__PURE__ */ React4.createElement(CustomContext.Provider, { value: { setMethods } }, /* @__PURE__ */ React4.createElement(CustomComponentClass, { key, ...props }));
};
var customWrapperComp_default = memo(CustomWrapperComp);

// packages/ag-grid-react/src/shared/reactComponent.ts
import { createElement } from "react";
import { createPortal } from "react-dom";
import { AgPromise } from "ag-grid-community";

// packages/ag-grid-react/src/shared/keyGenerator.ts
var counter = 0;
function generateNewKey() {
  return `agPortalKey_${++counter}`;
}

// packages/ag-grid-react/src/shared/reactComponent.ts
var ReactComponent = class {
  constructor(reactComponent, portalManager, componentType, suppressFallbackMethods) {
    this.portal = null;
    this.oldPortal = null;
    this.reactComponent = reactComponent;
    this.portalManager = portalManager;
    this.componentType = componentType;
    this.suppressFallbackMethods = !!suppressFallbackMethods;
    this.statelessComponent = this.isStateless(this.reactComponent);
    this.key = generateNewKey();
    this.portalKey = generateNewKey();
    this.instanceCreated = this.isStatelessComponent() ? AgPromise.resolve(false) : new AgPromise((resolve) => {
      this.resolveInstanceCreated = resolve;
    });
  }
  getGui() {
    return this.eParentElement;
  }
  /** `getGui()` returns the parent element. This returns the actual root element. */
  getRootElement() {
    const firstChild = this.eParentElement.firstChild;
    return firstChild;
  }
  destroy() {
    if (this.componentInstance && typeof this.componentInstance.destroy == "function") {
      this.componentInstance.destroy();
    }
    const portal = this.portal;
    if (portal) {
      this.portalManager.destroyPortal(portal);
    }
  }
  createParentElement(params) {
    const componentWrappingElement = this.portalManager.getComponentWrappingElement();
    const eParentElement = document.createElement(componentWrappingElement || "div");
    eParentElement.classList.add("ag-react-container");
    if (this.componentType.requiresBlockWrapper) {
      eParentElement.classList.add("ag-react-wrapper-block");
    }
    params.reactContainer = eParentElement;
    return eParentElement;
  }
  statelessComponentRendered() {
    return this.eParentElement.childElementCount > 0 || this.eParentElement.childNodes.length > 0;
  }
  getFrameworkComponentInstance() {
    return this.componentInstance;
  }
  isStatelessComponent() {
    return this.statelessComponent;
  }
  getReactComponentName() {
    return this.reactComponent.name;
  }
  getMemoType() {
    return this.hasSymbol() ? /* @__PURE__ */ Symbol.for("react.memo") : 60115;
  }
  hasSymbol() {
    return typeof Symbol === "function" && Symbol.for;
  }
  isStateless(Component2) {
    return typeof Component2 === "function" && !(Component2.prototype && Component2.prototype.isReactComponent) || typeof Component2 === "object" && Component2.$$typeof === this.getMemoType();
  }
  hasMethod(name) {
    const frameworkComponentInstance = this.getFrameworkComponentInstance();
    return !!frameworkComponentInstance && frameworkComponentInstance[name] != null || this.fallbackMethodAvailable(name);
  }
  callMethod(name, args) {
    const frameworkComponentInstance = this.getFrameworkComponentInstance();
    if (this.isStatelessComponent()) {
      return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
    } else if (!frameworkComponentInstance) {
      setTimeout(() => this.callMethod(name, args));
      return;
    }
    const method = frameworkComponentInstance[name];
    if (method) {
      return method.apply(frameworkComponentInstance, args);
    }
    if (this.fallbackMethodAvailable(name)) {
      return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
    }
  }
  addMethod(name, callback) {
    this[name] = callback;
  }
  init(params) {
    this.eParentElement = this.createParentElement(params);
    this.createOrUpdatePortal(params);
    return new AgPromise((resolve) => this.createReactComponent(resolve));
  }
  createOrUpdatePortal(params) {
    if (!this.isStatelessComponent()) {
      this.ref = (element) => {
        this.componentInstance = element;
        this.resolveInstanceCreated?.(true);
        this.resolveInstanceCreated = void 0;
      };
      params.ref = this.ref;
    }
    this.reactElement = this.createElement(this.reactComponent, { ...params, key: this.key });
    this.portal = createPortal(
      this.reactElement,
      this.eParentElement,
      this.portalKey
      // fixed deltaRowModeRefreshCompRenderer
    );
  }
  createElement(reactComponent, props) {
    return createElement(reactComponent, props);
  }
  createReactComponent(resolve) {
    this.portalManager.mountReactPortal(this.portal, this, resolve);
  }
  rendered() {
    return this.isStatelessComponent() && this.statelessComponentRendered() || !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
  }
  /*
   * fallback methods - these will be invoked if a corresponding instance method is not present
   * for example if refresh is called and is not available on the component instance, then refreshComponent on this
   * class will be invoked instead
   *
   * Currently only refresh is supported
   */
  refreshComponent(args) {
    this.oldPortal = this.portal;
    this.createOrUpdatePortal(args);
    this.portalManager.updateReactPortal(this.oldPortal, this.portal);
  }
  fallbackMethod(name, params) {
    const method = this[`${name}Component`];
    if (!this.suppressFallbackMethods && !!method) {
      return method.bind(this)(params);
    }
  }
  fallbackMethodAvailable(name) {
    if (this.suppressFallbackMethods) {
      return false;
    }
    const method = this[`${name}Component`];
    return !!method;
  }
};

// packages/ag-grid-react/src/shared/customComp/customComponentWrapper.ts
function addOptionalMethods(optionalMethodNames, providedMethods, component) {
  for (const methodName of optionalMethodNames) {
    const providedMethod = providedMethods[methodName];
    if (providedMethod) {
      component[methodName] = providedMethod;
    }
  }
}
var CustomComponentWrapper = class extends ReactComponent {
  constructor() {
    super(...arguments);
    this.awaitUpdateCallback = new AgPromise2((resolve) => {
      this.resolveUpdateCallback = resolve;
    });
    this.wrapperComponent = customWrapperComp_default;
  }
  init(params) {
    this.sourceParams = params;
    return super.init(this.getProps());
  }
  addMethod() {
  }
  getInstance() {
    return this.instanceCreated.then(() => this.componentInstance);
  }
  getFrameworkComponentInstance() {
    return this;
  }
  createElement(reactComponent, props) {
    return super.createElement(this.wrapperComponent, {
      initialProps: props,
      CustomComponentClass: reactComponent,
      setMethods: (methods) => this.setMethods(methods),
      addUpdateCallback: (callback) => {
        this.updateCallback = () => {
          callback(this.getProps());
          return new AgPromise2((resolve) => {
            setTimeout(() => {
              resolve();
            });
          });
        };
        this.resolveUpdateCallback();
      }
    });
  }
  setMethods(methods) {
    this.providedMethods = methods;
    addOptionalMethods(this.getOptionalMethods(), this.providedMethods, this);
  }
  getOptionalMethods() {
    return [];
  }
  getProps() {
    return {
      ...this.sourceParams,
      key: this.key,
      ref: this.ref
    };
  }
  refreshProps() {
    if (this.updateCallback) {
      return this.updateCallback();
    }
    return new AgPromise2(
      (resolve) => this.awaitUpdateCallback.then(() => {
        this.updateCallback().then(() => resolve());
      })
    );
  }
};

// packages/ag-grid-react/src/shared/customComp/cellRendererComponentWrapper.ts
var CellRendererComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
  }
};

// packages/ag-grid-react/src/shared/customComp/columnSelectionLabelRendererComponentWrapper.ts
var ColumnSelectionLabelRendererComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
  }
};

// packages/ag-grid-react/src/shared/customComp/customOverlayComponentWrapper.ts
var CustomOverlayComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
  }
};

// packages/ag-grid-react/src/shared/customComp/dateComponentWrapper.ts
var DateComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.date = null;
    this.onDateChange = (date) => this.updateDate(date);
  }
  getDate() {
    return this.date;
  }
  setDate(date) {
    this.date = date;
    this.refreshProps();
  }
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
  }
  getOptionalMethods() {
    return ["afterGuiAttached", "setInputPlaceholder", "setInputAriaLabel", "setDisabled"];
  }
  updateDate(date) {
    this.setDate(date);
    this.sourceParams.onDateChanged();
  }
  getProps() {
    const props = super.getProps();
    props.date = this.date;
    props.onDateChange = this.onDateChange;
    delete props.onDateChanged;
    return props;
  }
};

// packages/ag-grid-react/src/shared/customComp/dragAndDropImageComponentWrapper.ts
var DragAndDropImageComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.label = "";
    this.icon = null;
    this.shake = false;
  }
  setIcon(iconName, shake) {
    this.icon = iconName;
    this.shake = shake;
    this.refreshProps();
  }
  setLabel(label) {
    this.label = label;
    this.refreshProps();
  }
  getProps() {
    const props = super.getProps();
    const { label, icon, shake } = this;
    props.label = label;
    props.icon = icon;
    props.shake = shake;
    return props;
  }
};

// packages/ag-grid-react/src/shared/customComp/filterComponentWrapper.ts
import { AgPromise as AgPromise3 } from "ag-grid-community";
var FilterComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.model = null;
    this.onModelChange = (model) => this.updateModel(model);
    this.onUiChange = () => this.sourceParams.filterModifiedCallback();
    this.expectingNewMethods = true;
    this.hasBeenActive = false;
    this.awaitSetMethodsCallback = new AgPromise3((resolve) => {
      this.resolveSetMethodsCallback = resolve;
    });
  }
  isFilterActive() {
    return this.model != null;
  }
  doesFilterPass(params) {
    return this.providedMethods.doesFilterPass(params);
  }
  getModel() {
    return this.model;
  }
  setModel(model) {
    this.expectingNewMethods = true;
    this.model = model;
    this.hasBeenActive || (this.hasBeenActive = this.isFilterActive());
    return this.refreshProps();
  }
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
    return true;
  }
  afterGuiAttached(params) {
    const providedMethods = this.providedMethods;
    if (!providedMethods) {
      this.awaitSetMethodsCallback.then(() => this.providedMethods?.afterGuiAttached?.(params));
    } else {
      providedMethods.afterGuiAttached?.(params);
    }
  }
  getOptionalMethods() {
    return ["afterGuiDetached", "onNewRowsLoaded", "getModelAsString", "onAnyFilterChanged"];
  }
  setMethods(methods) {
    if (this.expectingNewMethods === false && this.hasBeenActive && this.providedMethods?.doesFilterPass !== methods?.doesFilterPass) {
      setTimeout(() => {
        this.sourceParams.filterChangedCallback();
      });
    }
    this.expectingNewMethods = false;
    super.setMethods(methods);
    this.resolveSetMethodsCallback();
    this.resolveFilterPassCallback?.();
    this.resolveFilterPassCallback = void 0;
  }
  updateModel(model) {
    this.resolveFilterPassCallback?.();
    const awaitFilterPassCallback = new AgPromise3((resolve) => {
      this.resolveFilterPassCallback = resolve;
    });
    this.setModel(model).then(() => {
      awaitFilterPassCallback.then(() => {
        this.sourceParams.filterChangedCallback();
      });
    });
  }
  getProps() {
    const props = super.getProps();
    props.model = this.model;
    props.onModelChange = this.onModelChange;
    props.onUiChange = this.onUiChange;
    delete props.filterChangedCallback;
    return props;
  }
};

// packages/ag-grid-react/src/shared/customComp/filterDisplayComponentWrapper.ts
import { AgPromise as AgPromise4 } from "ag-grid-community";
var FilterDisplayComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.awaitSetMethodsCallback = new AgPromise4((resolve) => {
      this.resolveSetMethodsCallback = resolve;
    });
  }
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
    return true;
  }
  afterGuiAttached(params) {
    const providedMethods = this.providedMethods;
    if (!providedMethods) {
      this.awaitSetMethodsCallback.then(() => this.providedMethods?.afterGuiAttached?.(params));
    } else {
      providedMethods.afterGuiAttached?.(params);
    }
  }
  getOptionalMethods() {
    return ["afterGuiDetached", "onNewRowsLoaded", "onAnyFilterChanged"];
  }
  setMethods(methods) {
    super.setMethods(methods);
    this.resolveSetMethodsCallback();
  }
};

// packages/ag-grid-react/src/shared/customComp/floatingFilterComponentProxy.ts
import { AgPromise as AgPromise5, ProvidedFilter } from "ag-grid-community";
function updateFloatingFilterParent(params, model) {
  params.parentFilterInstance((instance) => {
    ((instance instanceof ProvidedFilter ? instance.setModel(model, true) : instance.setModel(model)) || AgPromise5.resolve()).then(() => {
      params.filterParams.filterChangedCallback();
    });
  });
}
var FloatingFilterComponentProxy = class {
  constructor(floatingFilterParams, refreshProps) {
    this.floatingFilterParams = floatingFilterParams;
    this.refreshProps = refreshProps;
    this.model = null;
    this.onModelChange = (model) => this.updateModel(model);
  }
  getProps() {
    return {
      ...this.floatingFilterParams,
      model: this.model,
      onModelChange: this.onModelChange
    };
  }
  onParentModelChanged(parentModel) {
    this.model = parentModel;
    this.refreshProps();
  }
  refresh(params) {
    this.floatingFilterParams = params;
    this.refreshProps();
  }
  setMethods(methods) {
    addOptionalMethods(this.getOptionalMethods(), methods, this);
  }
  getOptionalMethods() {
    return ["afterGuiAttached"];
  }
  updateModel(model) {
    this.model = model;
    this.refreshProps();
    updateFloatingFilterParent(this.floatingFilterParams, model);
  }
};

// packages/ag-grid-react/src/shared/customComp/floatingFilterComponentWrapper.ts
var FloatingFilterComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.model = null;
    this.onModelChange = (model) => this.updateModel(model);
  }
  onParentModelChanged(parentModel) {
    this.model = parentModel;
    this.refreshProps();
  }
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
  }
  getOptionalMethods() {
    return ["afterGuiAttached"];
  }
  updateModel(model) {
    this.model = model;
    this.refreshProps();
    updateFloatingFilterParent(this.sourceParams, model);
  }
  getProps() {
    const props = super.getProps();
    props.model = this.model;
    props.onModelChange = this.onModelChange;
    return props;
  }
};

// packages/ag-grid-react/src/shared/customComp/floatingFilterDisplayComponentWrapper.ts
var FloatingFilterDisplayComponentWrapper = class extends CustomComponentWrapper {
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
  }
  getOptionalMethods() {
    return ["afterGuiAttached"];
  }
};

// packages/ag-grid-react/src/shared/customComp/innerHeaderComponentWrapper.ts
var InnerHeaderComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
  }
};

// packages/ag-grid-react/src/shared/customComp/menuItemComponentWrapper.ts
var MenuItemComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.active = false;
    this.expanded = false;
    this.onActiveChange = (active) => this.updateActive(active);
  }
  setActive(active) {
    this.awaitSetActive(active);
  }
  setExpanded(expanded) {
    this.expanded = expanded;
    this.refreshProps();
  }
  getOptionalMethods() {
    return ["select", "configureDefaults"];
  }
  awaitSetActive(active) {
    this.active = active;
    return this.refreshProps();
  }
  updateActive(active) {
    const result = this.awaitSetActive(active);
    if (active) {
      result.then(() => this.sourceParams.onItemActivated());
    }
  }
  getProps() {
    const props = super.getProps();
    props.active = this.active;
    props.expanded = this.expanded;
    props.onActiveChange = this.onActiveChange;
    delete props.onItemActivated;
    return props;
  }
};

// packages/ag-grid-react/src/shared/customComp/statusPanelComponentWrapper.ts
var StatusPanelComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
  }
};

// packages/ag-grid-react/src/shared/customComp/toolPanelComponentWrapper.ts
var ToolPanelComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.onStateChange = (state) => this.updateState(state);
  }
  init(params) {
    this.applyInitialState(params);
    return super.init(params);
  }
  refresh(params) {
    this.sourceParams = params;
    this.applyInitialState(params);
    this.refreshProps();
    return true;
  }
  /**
   * A restore hands over fresh params; `api.refreshToolPanel()` re-presents the applied ones, so the
   * state the component has since reported must survive it. The state object can be the same on
   * repeat restores.
   */
  applyInitialState(params) {
    if (params.initialState !== void 0 && params !== this.appliedParams) {
      this.state = params.initialState;
    }
    this.appliedParams = params;
  }
  getState() {
    return this.state;
  }
  updateState(state) {
    this.state = state;
    this.refreshProps();
    this.sourceParams.onStateUpdated();
  }
  getProps() {
    const props = super.getProps();
    props.state = this.state;
    props.onStateChange = this.onStateChange;
    return props;
  }
};

// packages/ag-grid-react/src/shared/customComp/util.ts
import { AgPromise as AgPromise6, _warnForGrid } from "ag-grid-community";
function getInstance(wrapperComponent, callback) {
  const promise = wrapperComponent?.getInstance?.() ?? AgPromise6.resolve(void 0);
  promise.then((comp) => callback(comp));
}
function warnReactiveCustomComponents(gridId) {
  _warnForGrid(gridId, 231);
}

// packages/ag-grid-react/src/shared/portalManager.ts
var MAX_COMPONENT_CREATION_TIME_IN_MS = 1e3;
var PortalManager = class {
  constructor(refresher, wrappingElement, maxComponentCreationTimeMs) {
    this.destroyed = false;
    this.portals = [];
    this.hasPendingPortalUpdate = false;
    this.wrappingElement = wrappingElement ? wrappingElement : "div";
    this.refresher = refresher;
    this.maxComponentCreationTimeMs = maxComponentCreationTimeMs ? maxComponentCreationTimeMs : MAX_COMPONENT_CREATION_TIME_IN_MS;
  }
  getPortals() {
    return this.portals;
  }
  destroy() {
    this.destroyed = true;
  }
  destroyPortal(portal) {
    this.portals = this.portals.filter((curPortal) => curPortal !== portal);
    this.batchUpdate();
  }
  getComponentWrappingElement() {
    return this.wrappingElement;
  }
  mountReactPortal(portal, reactComponent, resolve) {
    this.portals = [...this.portals, portal];
    this.waitForInstance(reactComponent, resolve);
    this.batchUpdate();
  }
  updateReactPortal(oldPortal, newPortal) {
    this.portals[this.portals.indexOf(oldPortal)] = newPortal;
    this.batchUpdate();
  }
  batchUpdate() {
    if (this.hasPendingPortalUpdate) {
      return;
    }
    setTimeout(() => {
      if (!this.destroyed) {
        this.refresher();
        this.hasPendingPortalUpdate = false;
      }
    });
    this.hasPendingPortalUpdate = true;
  }
  waitForInstance(reactComponent, resolve, startTime = Date.now()) {
    if (this.destroyed) {
      resolve(null);
      return;
    }
    if (reactComponent.rendered()) {
      resolve(reactComponent);
    } else {
      if (Date.now() - startTime >= this.maxComponentCreationTimeMs && !this.hasPendingPortalUpdate) {
        agFlushSync(true, () => this.refresher());
        if (reactComponent.rendered()) {
          resolve(reactComponent);
        }
        return;
      }
      window.setTimeout(() => {
        this.waitForInstance(reactComponent, resolve, startTime);
      });
    }
  }
};

// packages/ag-grid-react/src/reactUi/agGridProvider.tsx
import React5, { useContext as useContext2, useRef as useRef2 } from "react";
var ModulesContext = React5.createContext(null);
var LicenseContext = React5.createContext(void 0);
function AgGridProvider({ modules, licenseKey, children }) {
  const parentModulesRaw = useContext2(ModulesContext);
  const parentModules = parentModulesRaw ?? [];
  const parentLicenseKey = useContext2(LicenseContext);
  const modulesRef = useRef2(modules);
  const parentModulesRef = useRef2(parentModules);
  const mergedModules = useRef2([...parentModules, ...modules]);
  const parentModulesChanged = !_areEqual(parentModulesRef.current, parentModules);
  if (parentModulesChanged) {
    parentModulesRef.current = parentModules;
  }
  const modulesChanged = !_areEqual(modulesRef.current, modules);
  if (modulesChanged) {
    modulesRef.current = modules;
  }
  if (parentModulesChanged || modulesChanged) {
    mergedModules.current = [...parentModulesRef.current, ...modulesRef.current];
  }
  const effectiveLicenseKey = licenseKey ?? parentLicenseKey;
  return /* @__PURE__ */ React5.createElement(ModulesContext.Provider, { value: mergedModules.current }, /* @__PURE__ */ React5.createElement(LicenseContext.Provider, { value: effectiveLicenseKey }, children));
}

// packages/ag-grid-react/src/reactUi/gridComp.tsx
import React19, { memo as memo14, useCallback as useCallback14, useEffect as useEffect11, useMemo as useMemo11, useRef as useRef17, useState as useState15 } from "react";
import { GridCtrl } from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/gridBodyComp.tsx
import React17, { memo as memo12, useCallback as useCallback12, useContext as useContext14, useEffect as useEffect10, useMemo as useMemo10, useRef as useRef15, useState as useState14 } from "react";
import {
  FakeHScrollComp,
  FakeVScrollComp,
  GridBodyCtrl,
  _isCellSelectionEnabled,
  _isMultiRowSelection
} from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/header/gridHeaderComp.tsx
import React11, { memo as memo7, useCallback as useCallback7, useContext as useContext8, useRef as useRef8, useState as useState8 } from "react";
import { GridHeaderCtrl } from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/header/headerRowsComp.tsx
import React10, { memo as memo6, useCallback as useCallback6, useContext as useContext7, useLayoutEffect as useLayoutEffect5, useRef as useRef7, useState as useState7 } from "react";
import { HeaderRowContainerCtrl } from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/header/headerRowComp.tsx
import React9, { memo as memo5, useCallback as useCallback5, useContext as useContext6, useMemo as useMemo5, useRef as useRef6, useState as useState6 } from "react";
import { _EmptyBean as _EmptyBean4, _isHeaderFocusSuppressed, _updatePinnedSectionWidths } from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/header/headerCellComp.tsx
import React6, { memo as memo2, useCallback as useCallback2, useContext as useContext3, useEffect as useEffect2, useLayoutEffect as useLayoutEffect2, useMemo as useMemo2, useRef as useRef3, useState as useState3 } from "react";
import { _EmptyBean } from "ag-grid-community";
var HeaderCellComp = ({ ctrl }) => {
  const isAlive = ctrl.isAlive();
  const { context } = useContext3(BeansContext);
  const [userCompDetails, setUserCompDetails] = useState3();
  const [userStyles, setUserStyles] = useState3();
  const compBean = useRef3();
  const eGui = useRef3(null);
  const eResize = useRef3(null);
  const eHeaderCompWrapper = useRef3(null);
  const userCompRef = useRef3();
  const cssManager = useRef3();
  if (isAlive && !cssManager.current) {
    cssManager.current = new CssClassManager(() => eGui.current);
  }
  const setRef2 = useCallback2((eRef) => {
    eGui.current = eRef;
    if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new _EmptyBean());
    const refreshSelectAllGui = () => {
      const selectAllGui = ctrl.getSelectAllGui();
      if (selectAllGui) {
        eResize.current?.insertAdjacentElement("afterend", selectAllGui);
        compBean.current.addDestroyFunc(() => selectAllGui.remove());
      }
    };
    const compProxy = {
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      toggleCss: (name, on) => cssManager.current.toggleCss(name, on),
      setUserStyles: (styles) => setUserStyles(styles),
      setAriaSort: (sort) => {
        if (eGui.current) {
          if (sort) {
            _setAriaSort(eGui.current, sort);
          } else {
            _removeAriaSort(eGui.current);
          }
        }
      },
      setUserCompDetails: (compDetails) => setUserCompDetails(compDetails),
      getUserCompInstance: () => userCompRef.current || void 0,
      refreshSelectAllGui,
      removeSelectAllGui: () => ctrl.getSelectAllGui()?.remove()
    };
    ctrl.setComp(compProxy, eRef, eResize.current, eHeaderCompWrapper.current, compBean.current);
    refreshSelectAllGui();
  }, []);
  useLayoutEffect2(
    () => showJsComp(userCompDetails, context, eHeaderCompWrapper.current, userCompRef),
    [userCompDetails]
  );
  useEffect2(() => {
    ctrl.setDragSource(eGui.current);
  }, [userCompDetails]);
  const userCompStateless = useMemo2(() => {
    const res = userCompDetails?.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const reactUserComp = userCompDetails?.componentFromFramework;
  const UserCompClass = userCompDetails?.componentClass;
  return /* @__PURE__ */ React6.createElement("div", { ref: setRef2, style: userStyles, className: "ag-header-cell", role: "columnheader" }, /* @__PURE__ */ React6.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }), /* @__PURE__ */ React6.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" }, reactUserComp ? userCompStateless ? /* @__PURE__ */ React6.createElement(UserCompClass, { ...userCompDetails.params }) : /* @__PURE__ */ React6.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompRef }) : null));
};
var headerCellComp_default = memo2(HeaderCellComp);

// packages/ag-grid-react/src/reactUi/header/headerFilterCellComp.tsx
import React7, { memo as memo3, useCallback as useCallback3, useContext as useContext4, useEffect as useEffect3, useLayoutEffect as useLayoutEffect3, useMemo as useMemo3, useRef as useRef4, useState as useState4 } from "react";
import { AgPromise as AgPromise7, _EmptyBean as _EmptyBean2 } from "ag-grid-community";

// packages/ag-grid-react/src/shared/customComp/floatingFilterDisplayComponentProxy.ts
var FloatingFilterDisplayComponentProxy = class {
  constructor(floatingFilterParams, refreshProps) {
    this.floatingFilterParams = floatingFilterParams;
    this.refreshProps = refreshProps;
  }
  getProps() {
    return this.floatingFilterParams;
  }
  refresh(params) {
    this.floatingFilterParams = params;
    this.refreshProps();
  }
  setMethods(methods) {
    addOptionalMethods(this.getOptionalMethods(), methods, this);
  }
  getOptionalMethods() {
    return ["afterGuiAttached"];
  }
};

// packages/ag-grid-react/src/reactUi/header/headerFilterCellComp.tsx
var HeaderFilterCellComp = ({ ctrl }) => {
  const { context, gos } = useContext4(BeansContext);
  const [userStyles, setUserStyles] = useState4();
  const [cssClasses, setCssClasses] = useState4(
    () => new CssClasses("ag-header-cell", "ag-floating-filter")
  );
  const [cssBodyClasses, setBodyCssClasses] = useState4(() => new CssClasses());
  const [cssButtonWrapperClasses, setButtonWrapperCssClasses] = useState4(
    () => new CssClasses("ag-floating-filter-button", "ag-hidden")
  );
  const [buttonWrapperAriaHidden, setButtonWrapperAriaHidden] = useState4("false");
  const [userCompDetails, setUserCompDetails] = useState4();
  const [, setRenderKey] = useState4(1);
  const compBean = useRef4();
  const eGui = useRef4(null);
  const eFloatingFilterBody = useRef4(null);
  const eButtonWrapper = useRef4(null);
  const eButtonShowMainFilter = useRef4(null);
  const userCompResolve = useRef4();
  const userCompPromise = useRef4();
  const userCompRef = (value) => {
    if (value == null) {
      return;
    }
    userCompResolve.current?.(value);
  };
  const setRef2 = useCallback3((eRef) => {
    eGui.current = eRef;
    if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new _EmptyBean2());
    userCompPromise.current = new AgPromise7((resolve) => {
      userCompResolve.current = resolve;
    });
    const compProxy = {
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setUserStyles: (styles) => setUserStyles(styles),
      addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses((prev) => prev.setClass(name, on)),
      setButtonWrapperDisplayed: (displayed) => {
        setButtonWrapperCssClasses((prev) => prev.setClass("ag-hidden", !displayed));
        setButtonWrapperAriaHidden(!displayed ? "true" : "false");
      },
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      setCompDetails: (compDetails) => setUserCompDetails(compDetails),
      getFloatingFilterComp: () => userCompPromise.current ? userCompPromise.current : null,
      setMenuIcon: (eIcon) => eButtonShowMainFilter.current?.appendChild(eIcon)
    };
    ctrl.setComp(compProxy, eRef, eButtonShowMainFilter.current, eFloatingFilterBody.current, compBean.current);
  }, []);
  useLayoutEffect3(
    () => showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompRef),
    [userCompDetails]
  );
  const className = useMemo3(() => cssClasses.toString(), [cssClasses]);
  const bodyClassName = useMemo3(() => cssBodyClasses.toString(), [cssBodyClasses]);
  const buttonWrapperClassName = useMemo3(() => cssButtonWrapperClasses.toString(), [cssButtonWrapperClasses]);
  const userCompStateless = useMemo3(() => {
    const res = userCompDetails && userCompDetails.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const reactiveCustomComponents = useMemo3(() => gos.get("reactiveCustomComponents"), []);
  const enableFilterHandlers = useMemo3(() => gos.get("enableFilterHandlers"), []);
  const [floatingFilterCompProxy, setFloatingFilterCompProxy] = useState4();
  useEffect3(() => {
    if (userCompDetails?.componentFromFramework) {
      if (reactiveCustomComponents) {
        const ProxyClass = enableFilterHandlers ? FloatingFilterDisplayComponentProxy : FloatingFilterComponentProxy;
        const compProxy = new ProxyClass(userCompDetails.params, () => setRenderKey((prev) => prev + 1));
        userCompRef(compProxy);
        setFloatingFilterCompProxy(compProxy);
      } else {
        warnReactiveCustomComponents(context.getId());
      }
    }
  }, [userCompDetails]);
  const floatingFilterProps = floatingFilterCompProxy?.getProps();
  const reactUserComp = userCompDetails?.componentFromFramework;
  const UserCompClass = userCompDetails?.componentClass;
  return /* @__PURE__ */ React7.createElement("div", { ref: setRef2, style: userStyles, className, role: "gridcell" }, /* @__PURE__ */ React7.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" }, reactUserComp ? reactiveCustomComponents ? floatingFilterProps && /* @__PURE__ */ React7.createElement(
    CustomContext.Provider,
    {
      value: {
        setMethods: (methods) => floatingFilterCompProxy.setMethods(methods)
      }
    },
    /* @__PURE__ */ React7.createElement(UserCompClass, { ...floatingFilterProps })
  ) : /* @__PURE__ */ React7.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompStateless ? () => {
  } : userCompRef }) : null), /* @__PURE__ */ React7.createElement(
    "div",
    {
      ref: eButtonWrapper,
      "aria-hidden": buttonWrapperAriaHidden,
      className: buttonWrapperClassName,
      role: "presentation"
    },
    /* @__PURE__ */ React7.createElement(
      "button",
      {
        ref: eButtonShowMainFilter,
        type: "button",
        className: "ag-button ag-floating-filter-button-button",
        tabIndex: -1
      }
    )
  ));
};
var headerFilterCellComp_default = memo3(HeaderFilterCellComp);

// packages/ag-grid-react/src/reactUi/header/headerGroupCellComp.tsx
import React8, { memo as memo4, useCallback as useCallback4, useContext as useContext5, useEffect as useEffect4, useLayoutEffect as useLayoutEffect4, useMemo as useMemo4, useRef as useRef5, useState as useState5 } from "react";
import { _EmptyBean as _EmptyBean3, _applyHeaderWrapperHidden, _applyHeaderWrapperMaxHeight } from "ag-grid-community";
var HeaderGroupCellComp = ({ ctrl }) => {
  const { context } = useContext5(BeansContext);
  const [userStyles, setUserStyles] = useState5();
  const [cssClasses, setCssClasses] = useState5(() => new CssClasses());
  const [cssResizableClasses, setResizableCssClasses] = useState5(() => new CssClasses());
  const [resizableAriaHidden, setResizableAriaHidden] = useState5("false");
  const [ariaExpanded, setAriaExpanded] = useState5();
  const [userCompDetails, setUserCompDetails] = useState5();
  const compBean = useRef5();
  const eGui = useRef5(null);
  const eResize = useRef5(null);
  const eHeaderCompWrapper = useRef5(null);
  const userCompRef = useRef5();
  const setRef2 = useCallback4((eRef) => {
    eGui.current = eRef;
    if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new _EmptyBean3());
    const compProxy = {
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setUserStyles: (styles) => setUserStyles(styles),
      setHeaderWrapperHidden: (hidden) => {
        if (eHeaderCompWrapper.current) {
          _applyHeaderWrapperHidden(eHeaderCompWrapper.current, hidden);
        }
      },
      setHeaderWrapperMaxHeight: (value) => {
        if (eHeaderCompWrapper.current) {
          _applyHeaderWrapperMaxHeight(eHeaderCompWrapper.current, value);
        }
      },
      setUserCompDetails: (compDetails) => setUserCompDetails(compDetails),
      setResizableDisplayed: (displayed) => {
        setResizableCssClasses((prev) => prev.setClass("ag-hidden", !displayed));
        setResizableAriaHidden(!displayed ? "true" : "false");
      },
      setAriaExpanded: (expanded) => setAriaExpanded(expanded),
      getUserCompInstance: () => userCompRef.current || void 0
    };
    ctrl.setComp(compProxy, eRef, eResize.current, eHeaderCompWrapper.current, compBean.current);
  }, []);
  useLayoutEffect4(
    () => showJsComp(userCompDetails, context, eHeaderCompWrapper.current, userCompRef),
    [context, userCompDetails]
  );
  useEffect4(() => {
    if (eGui.current) {
      ctrl.setDragSource(eGui.current);
    }
  }, [userCompDetails]);
  const userCompStateless = useMemo4(() => {
    const res = userCompDetails?.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const className = useMemo4(() => "ag-header-group-cell " + cssClasses.toString(), [cssClasses]);
  const resizableClassName = useMemo4(
    () => "ag-header-cell-resize " + cssResizableClasses.toString(),
    [cssResizableClasses]
  );
  const reactUserComp = userCompDetails?.componentFromFramework;
  const UserCompClass = userCompDetails?.componentClass;
  return /* @__PURE__ */ React8.createElement("div", { ref: setRef2, style: userStyles, className, role: "columnheader", "aria-expanded": ariaExpanded }, /* @__PURE__ */ React8.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" }, reactUserComp ? userCompStateless ? /* @__PURE__ */ React8.createElement(UserCompClass, { ...userCompDetails.params }) : /* @__PURE__ */ React8.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompRef }) : null), /* @__PURE__ */ React8.createElement("div", { ref: eResize, "aria-hidden": resizableAriaHidden, className: resizableClassName }));
};
var headerGroupCellComp_default = memo4(HeaderGroupCellComp);

// packages/ag-grid-react/src/reactUi/header/headerRowComp.tsx
function getCellSectionSignature(ctrls, isPrint) {
  if (isPrint) {
    return "print";
  }
  return ctrls.map((ctrl) => `${ctrl.instanceId}:${ctrl.column?.pinnedLane ?? 1}`).join("|");
}
var partitionByLane = (cellCtrls) => {
  const byLane = [[], [], []];
  for (let i = 0, len = cellCtrls.length; i < len; ++i) {
    const cellCtrl = cellCtrls[i];
    byLane[cellCtrl.column?.pinnedLane ?? 1].push(cellCtrl);
  }
  return { left: byLane[0], center: byLane[1], right: byLane[2] };
};
var HeaderRowComp = ({
  ctrl,
  setGuiRef
}) => {
  const beans = useContext6(BeansContext);
  const { context, visibleCols, gos } = beans;
  const eGui = useRef6(null);
  const ePinnedLeft = useRef6(null);
  const eScrolling = useRef6(null);
  const ePinnedRight = useRef6(null);
  const compBean = useRef6();
  const cellCtrlsRef = useRef6([]);
  const prevCellCtrlsRef = useRef6([]);
  const sectionSignatureRef = useRef6("");
  const domOrderRef = useRef6(false);
  const [cellCtrls, setCellCtrls] = useState6([]);
  const [tabIndex, setTabIndex] = useState6(
    () => _isHeaderFocusSuppressed(beans) ? void 0 : gos.get("tabIndex")
  );
  const pinnedWidthsCache = useRef6({
    pinnedLeftWidth: void 0,
    centerWidth: void 0,
    pinnedRightWidth: void 0
  });
  const refreshPinnedWidths = useCallback5(() => {
    if (!ePinnedLeft.current || !eScrolling.current || !ePinnedRight.current) {
      return;
    }
    const isPrint2 = gos.get("domLayout") === "print";
    _updatePinnedSectionWidths(
      visibleCols,
      isPrint2,
      { ePinnedLeft: ePinnedLeft.current, eScrolling: eScrolling.current, ePinnedRight: ePinnedRight.current },
      pinnedWidthsCache.current
    );
  }, [gos, visibleCols]);
  const setRef2 = useCallback5(
    (eRef) => {
      eGui.current = eRef;
      setGuiRef?.(eRef);
      if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
        compBean.current = context.destroyBean(compBean.current);
        return;
      }
      compBean.current = context.createBean(new _EmptyBean4());
      const updateCellCtrls = (useFlushSync) => {
        const isPrint2 = gos.get("domLayout") === "print";
        const nextSectionSignature = getCellSectionSignature(cellCtrlsRef.current, isPrint2);
        const shouldRefreshForSectionChange = sectionSignatureRef.current !== nextSectionSignature;
        const next = shouldRefreshForSectionChange ? cellCtrlsRef.current : getNextValueIfDifferent(prevCellCtrlsRef.current, cellCtrlsRef.current, domOrderRef.current);
        if (next !== prevCellCtrlsRef.current) {
          prevCellCtrlsRef.current = next;
          sectionSignatureRef.current = nextSectionSignature;
          agFlushSync(useFlushSync, () => setCellCtrls(next));
        }
      };
      const compProxy = {
        setTop: (value) => {
          if (eGui.current) {
            eGui.current.style.top = value;
          }
        },
        setHeight: (value) => {
          if (eGui.current) {
            eGui.current.style.height = value;
          }
        },
        setHeaderCtrls: (ctrls, forceOrder, afterScroll) => {
          domOrderRef.current = forceOrder;
          cellCtrlsRef.current = ctrls;
          updateCellCtrls(afterScroll);
        },
        refreshPinnedCellGroupWidths: () => refreshPinnedWidths(),
        setWidth: (value) => {
          if (eGui.current) {
            eGui.current.style.width = value;
          }
        },
        setRowIndex: (rowIndex) => {
          if (eGui.current) {
            _setAriaRowIndex(eGui.current, rowIndex);
            eGui.current.classList.toggle("ag-header-row-not-first", rowIndex !== 1);
          }
        },
        setTabIndex
      };
      ctrl.setComp(compProxy, compBean.current);
    },
    [context, ctrl, refreshPinnedWidths, setGuiRef]
  );
  const isPrint = gos.get("domLayout") === "print";
  const {
    left: leftCells,
    center: centerCells,
    right: rightCells
  } = useMemo5(() => {
    if (isPrint) {
      return { left: [], center: cellCtrls, right: [] };
    }
    return partitionByLane(cellCtrls);
  }, [cellCtrls, isPrint]);
  const createCellJsx = useCallback5(
    (cellCtrl) => {
      switch (ctrl.type) {
        case "group":
          return /* @__PURE__ */ React9.createElement(headerGroupCellComp_default, { ctrl: cellCtrl, key: cellCtrl.instanceId });
        case "filter":
          return /* @__PURE__ */ React9.createElement(headerFilterCellComp_default, { ctrl: cellCtrl, key: cellCtrl.instanceId });
        default:
          return /* @__PURE__ */ React9.createElement(headerCellComp_default, { ctrl: cellCtrl, key: cellCtrl.instanceId });
      }
    },
    [ctrl.type]
  );
  return /* @__PURE__ */ React9.createElement("div", { ref: setRef2, className: ctrl.headerRowClass, role: "row", tabIndex }, /* @__PURE__ */ React9.createElement("div", { ref: ePinnedLeft, className: "ag-grid-pinned-left-cells", role: "presentation" }, /* @__PURE__ */ React9.createElement("div", { className: "ag-grid-container-wrapper", role: "presentation" }, leftCells.map(createCellJsx))), /* @__PURE__ */ React9.createElement("div", { ref: eScrolling, className: "ag-grid-scrolling-cells", role: "presentation" }, centerCells.map(createCellJsx)), /* @__PURE__ */ React9.createElement("div", { ref: ePinnedRight, className: "ag-grid-pinned-right-cells", role: "presentation" }, /* @__PURE__ */ React9.createElement("div", { className: "ag-grid-container-wrapper", role: "presentation" }, rightCells.map(createCellJsx))));
};
var headerRowComp_default = memo5(HeaderRowComp);

// packages/ag-grid-react/src/reactUi/header/headerRowsComp.tsx
var HeaderRowsComp = ({
  eGui,
  eGridViewport,
  setHeaderRowFocusableElements
}) => {
  const { context } = useContext7(BeansContext);
  const [headerRowCtrls, setHeaderRowCtrls] = useState7([]);
  const headerRowContainerCtrlRef = useRef7();
  const rowGuisRef = useRef7(/* @__PURE__ */ new Map());
  const setRowGui = useCallback6((instanceId, eGui2) => {
    if (eGui2) {
      rowGuisRef.current.set(instanceId, eGui2);
    } else {
      rowGuisRef.current.delete(instanceId);
    }
  }, []);
  useLayoutEffect5(() => {
    if (!setHeaderRowFocusableElements) {
      return;
    }
    setHeaderRowFocusableElements(
      headerRowCtrls.map((ctrl) => rowGuisRef.current.get(ctrl.instanceId)).filter((eGui2) => !!eGui2)
    );
  }, [headerRowCtrls, setHeaderRowFocusableElements]);
  useLayoutEffect5(() => {
    if (!eGui || context.isDestroyed()) {
      headerRowContainerCtrlRef.current = context.destroyBean(headerRowContainerCtrlRef.current);
      return;
    }
    const compProxy = {
      setCtrls: (ctrls) => setHeaderRowCtrls(ctrls),
      setViewportScrollLeft: (_left) => {
      }
    };
    headerRowContainerCtrlRef.current = context.createBean(new HeaderRowContainerCtrl());
    headerRowContainerCtrlRef.current.setComp(compProxy, eGui, eGridViewport);
    return () => {
      if (setHeaderRowFocusableElements) {
        setHeaderRowFocusableElements([]);
      }
      headerRowContainerCtrlRef.current = context.destroyBean(headerRowContainerCtrlRef.current);
    };
  }, [context, eGui, eGridViewport, setHeaderRowFocusableElements]);
  return /* @__PURE__ */ React10.createElement(React10.Fragment, null, headerRowCtrls.map((ctrl) => /* @__PURE__ */ React10.createElement(
    headerRowComp_default,
    {
      ctrl,
      key: ctrl.instanceId,
      setGuiRef: (eGui2) => setRowGui(ctrl.instanceId, eGui2)
    }
  )));
};
var headerRowsComp_default = memo6(HeaderRowsComp);

// packages/ag-grid-react/src/reactUi/header/gridHeaderComp.tsx
var GridHeaderComp = ({ eGridViewport }) => {
  const { context } = useContext8(BeansContext);
  const gridHeaderCtrlRef = useRef8();
  const cssManager = useRef8();
  const eGui = useRef8(null);
  const [headerElement, setHeaderElement] = useState8(null);
  const [mounted, setMounted] = useState8(false);
  if (!cssManager.current) {
    cssManager.current = new CssClassManager(() => eGui.current);
  }
  const setHeaderRowFocusableElements = useCallback7((elements) => {
    gridHeaderCtrlRef.current?.setHeaderRowFocusableElements(elements);
  }, []);
  const setRef2 = useCallback7(
    (eRef) => {
      eGui.current = eRef;
      setHeaderElement(eRef);
      if (!eRef || context.isDestroyed()) {
        gridHeaderCtrlRef.current = context.destroyBean(gridHeaderCtrlRef.current);
        setMounted(false);
        return;
      }
      cssManager.current.toggleCss("ag-header", true);
      const compProxy = {
        toggleCss: (name, on) => cssManager.current.toggleCss(name, on)
      };
      gridHeaderCtrlRef.current = context.createBean(new GridHeaderCtrl());
      gridHeaderCtrlRef.current.setComp(compProxy, eRef, eGridViewport);
      setMounted(true);
    },
    [context, eGridViewport]
  );
  return /* @__PURE__ */ React11.createElement("div", { ref: setRef2, role: "presentation" }, mounted && headerElement && /* @__PURE__ */ React11.createElement(
    headerRowsComp_default,
    {
      eGui: headerElement,
      eGridViewport,
      setHeaderRowFocusableElements
    }
  ));
};
var gridHeaderComp_default = memo7(GridHeaderComp);

// packages/ag-grid-react/src/reactUi/reactComment.tsx
import { useEffect as useEffect5 } from "react";
var useReactCommentEffect = (comment, eForCommentRef) => {
  useEffect5(() => {
    const eForComment = eForCommentRef.current;
    if (eForComment) {
      const eParent = eForComment.parentElement;
      if (eParent) {
        const eComment = document.createComment(comment);
        eParent.insertBefore(eComment, eForComment);
        return () => {
          eComment.remove();
        };
      }
    }
  }, [comment]);
};
var reactComment_default = useReactCommentEffect;

// packages/ag-grid-react/src/reactUi/rows/rowContainerComp.tsx
import React16, { memo as memo11, useCallback as useCallback11, useContext as useContext13, useEffect as useEffect9, useMemo as useMemo9, useRef as useRef14, useState as useState13 } from "react";
import {
  RowContainerCtrl,
  _getRowContainerClass,
  _getRowContainerOptions,
  _getRowSpanContainerClass
} from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/rows/rowComp.tsx
import React15, { memo as memo10, useCallback as useCallback10, useContext as useContext12, useEffect as useEffect8, useLayoutEffect as useLayoutEffect8, useMemo as useMemo8, useRef as useRef13, useState as useState12 } from "react";
import { _EmptyBean as _EmptyBean6 } from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/cells/cellComp.tsx
import React14, { Suspense, memo as memo9, useCallback as useCallback9, useContext as useContext11, useLayoutEffect as useLayoutEffect7, useMemo as useMemo7, useRef as useRef12, useState as useState11 } from "react";
import { _EmptyBean as _EmptyBean5 } from "ag-grid-community";

// packages/ag-grid-react/src/shared/customComp/cellEditorComponentProxy.ts
import { AgPromise as AgPromise8 } from "ag-grid-community";
var CellEditorComponentProxy = class {
  constructor(cellEditorParams, refreshProps) {
    this.cellEditorParams = cellEditorParams;
    this.refreshProps = refreshProps;
    this.instanceCreated = new AgPromise8((resolve) => {
      this.resolveInstanceCreated = resolve;
    });
    this.onValueChange = (value) => this.updateValue(value);
    this.value = cellEditorParams.value;
  }
  getProps() {
    return {
      ...this.cellEditorParams,
      initialValue: this.cellEditorParams.value,
      value: this.value,
      onValueChange: this.onValueChange
    };
  }
  getValue() {
    return this.value;
  }
  refresh(params) {
    this.cellEditorParams = params;
    this.refreshProps();
  }
  setMethods(methods) {
    addOptionalMethods(this.getOptionalMethods(), methods, this);
  }
  getInstance() {
    return this.instanceCreated.then(() => this.componentInstance);
  }
  setRef(componentInstance) {
    this.componentInstance = componentInstance;
    this.resolveInstanceCreated?.();
    this.resolveInstanceCreated = void 0;
  }
  getOptionalMethods() {
    return [
      "isCancelBeforeStart",
      "isCancelAfterEnd",
      "focusIn",
      "focusOut",
      "afterGuiAttached",
      "getValidationErrors",
      "getValidationElement"
    ];
  }
  updateValue(value) {
    this.value = value;
    this.refreshProps();
  }
};

// packages/ag-grid-react/src/reactUi/cells/cellEditorComp.tsx
import React12 from "react";

// packages/ag-grid-react/src/reactUi/cells/popupEditorComp.tsx
import { memo as memo8, useContext as useContext9, useLayoutEffect as useLayoutEffect6, useState as useState10 } from "react";
import { createPortal as createPortal2 } from "react-dom";

// packages/ag-grid-react/src/reactUi/useEffectOnce.tsx
import { useEffect as useEffect6, useRef as useRef9, useState as useState9 } from "react";
var useEffectOnce = (effect) => {
  const effectFn = useRef9(effect);
  const destroyFn = useRef9();
  const effectCalled = useRef9(false);
  const rendered = useRef9(false);
  const [, setVal] = useState9(0);
  if (effectCalled.current) {
    rendered.current = true;
  }
  useEffect6(() => {
    if (!effectCalled.current) {
      destroyFn.current = effectFn.current();
      effectCalled.current = true;
    }
    setVal((val) => val + 1);
    return () => {
      if (!rendered.current) {
        return;
      }
      destroyFn.current?.();
    };
  }, []);
};

// packages/ag-grid-react/src/reactUi/cells/popupEditorComp.tsx
var PopupEditorComp = (props) => {
  const [popupEditorWrapper, setPopupEditorWrapper] = useState10();
  const beans = useContext9(BeansContext);
  const { context, popupSvc, gos, editSvc } = beans;
  const { editDetails, cellCtrl, eParentCell } = props;
  useEffectOnce(() => {
    const { compDetails } = editDetails;
    const useModelPopup = gos.get("stopEditingWhenCellsLoseFocus");
    let hideEditorPopup = void 0;
    let wrapper;
    if (!context.isDestroyed()) {
      wrapper = context.createBean(editSvc.createPopupEditorWrapper(compDetails.params));
      const ePopupGui = wrapper.getGui();
      if (props.jsChildComp) {
        const eChildGui = props.jsChildComp.getGui();
        if (eChildGui) {
          ePopupGui.appendChild(eChildGui);
        }
      }
      const { column, rowNode } = cellCtrl;
      const positionParams = {
        column,
        rowNode,
        type: "popupCellEditor",
        eventSource: eParentCell,
        ePopup: ePopupGui,
        position: editDetails.popupPosition,
        keepWithinBounds: true
      };
      const positionCallback = popupSvc?.positionPopupByComponent.bind(popupSvc, positionParams);
      const addPopupRes = popupSvc?.addPopup({
        modal: useModelPopup,
        eChild: ePopupGui,
        closeOnEsc: true,
        closedCallback: (e) => {
          editSvc.onPopupEditorClosed(cellCtrl, e);
        },
        anchorToElement: eParentCell,
        positionCallback,
        ariaOwns: eParentCell
      });
      hideEditorPopup = addPopupRes ? addPopupRes.hideFunc : void 0;
      setPopupEditorWrapper(wrapper);
      props.jsChildComp?.afterGuiAttached?.();
    }
    return () => {
      hideEditorPopup?.();
      context.destroyBean(wrapper);
    };
  });
  useLayoutEffect6(() => {
    return () => {
      if (cellCtrl.isCellFocused() && popupEditorWrapper?.getGui().contains(_getActiveDomElement(beans))) {
        eParentCell.focus({ preventScroll: true });
      }
    };
  }, [popupEditorWrapper]);
  return popupEditorWrapper && props.wrappedContent ? createPortal2(props.wrappedContent, popupEditorWrapper.getGui()) : null;
};
var popupEditorComp_default = memo8(PopupEditorComp);

// packages/ag-grid-react/src/reactUi/cells/cellEditorComp.tsx
var jsxEditorProxy = (editDetails, CellEditorClass, setRef2) => {
  const { compProxy } = editDetails;
  setRef2(compProxy);
  const props = compProxy.getProps();
  const isStateless = isComponentStateless(CellEditorClass);
  return /* @__PURE__ */ React12.createElement(
    CustomContext.Provider,
    {
      value: {
        setMethods: (methods) => compProxy.setMethods(methods)
      }
    },
    isStateless ? /* @__PURE__ */ React12.createElement(CellEditorClass, { ...props }) : /* @__PURE__ */ React12.createElement(CellEditorClass, { ...props, ref: (ref) => compProxy.setRef(ref) })
  );
};
var jsxEditor = (editDetails, CellEditorClass, setRef2) => {
  const newFormat = editDetails.compProxy;
  return newFormat ? jsxEditorProxy(editDetails, CellEditorClass, setRef2) : /* @__PURE__ */ React12.createElement(CellEditorClass, { ...editDetails.compDetails.params, ref: setRef2 });
};
var jsxEditValue = (editDetails, setCellEditorRef, eGui, cellCtrl, jsEditorComp) => {
  const compDetails = editDetails.compDetails;
  const CellEditorClass = compDetails.componentClass;
  const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
  const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
  const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;
  return reactInlineEditor ? jsxEditor(editDetails, CellEditorClass, setCellEditorRef) : reactPopupEditor ? /* @__PURE__ */ React12.createElement(
    popupEditorComp_default,
    {
      editDetails,
      cellCtrl,
      eParentCell: eGui,
      wrappedContent: jsxEditor(editDetails, CellEditorClass, setCellEditorRef)
    }
  ) : jsPopupEditor && jsEditorComp ? /* @__PURE__ */ React12.createElement(popupEditorComp_default, { editDetails, cellCtrl, eParentCell: eGui, jsChildComp: jsEditorComp }) : null;
};

// packages/ag-grid-react/src/reactUi/cells/showJsRenderer.tsx
import { useCallback as useCallback8, useContext as useContext10, useEffect as useEffect7, useRef as useRef10 } from "react";
var useJsCellRenderer = (showDetails, showTools, eCellValue, cellValueVersion, jsCellRendererRef, eGui, suppressInlineEditRenderer = false, onRendererDestroyed) => {
  const { context } = useContext10(BeansContext);
  const onRendererDestroyedRef = useRef10(onRendererDestroyed);
  onRendererDestroyedRef.current = onRendererDestroyed;
  const destroyCellRenderer = useCallback8((resetTooltip = true) => {
    const comp = jsCellRendererRef.current;
    if (!comp) {
      return;
    }
    const compGui = comp.getGui();
    if (compGui && compGui.parentElement) {
      compGui.remove();
    }
    context.destroyBean(comp);
    jsCellRendererRef.current = void 0;
    if (!resetTooltip) {
      return;
    }
    onRendererDestroyedRef.current?.();
  }, []);
  useEffect7(() => {
    const showValue = showDetails != null && !suppressInlineEditRenderer;
    const jsCompDetails = showDetails?.compDetails && !showDetails.compDetails.componentFromFramework;
    const waitingForToolsSetup = showTools && eCellValue == null;
    const showComp = showValue && jsCompDetails && !waitingForToolsSetup;
    if (!showComp) {
      destroyCellRenderer();
      return;
    }
    const compDetails = showDetails.compDetails;
    if (jsCellRendererRef.current) {
      const comp = jsCellRendererRef.current;
      const attemptRefresh = comp.refresh != null && showDetails.force == false;
      const refreshResult = attemptRefresh ? comp.refresh(compDetails.params) : false;
      const refreshWorked = refreshResult === true || refreshResult === void 0;
      if (refreshWorked) {
        return;
      }
      destroyCellRenderer();
    }
    const promise = compDetails.newAgStackInstance();
    promise.then((comp) => {
      if (!comp) {
        return;
      }
      const compGui = comp.getGui();
      if (!compGui) {
        return;
      }
      const parent = showTools ? eCellValue : eGui.current;
      parent.appendChild(compGui);
      jsCellRendererRef.current = comp;
    });
  }, [showDetails, showTools, cellValueVersion, suppressInlineEditRenderer]);
  useEffect7(() => {
    return () => destroyCellRenderer(false);
  }, []);
};
var showJsRenderer_default = useJsCellRenderer;

// packages/ag-grid-react/src/reactUi/cells/skeletonCellComp.tsx
import React13, { useMemo as useMemo6, useRef as useRef11 } from "react";
var SkeletonCellRenderer = ({
  cellCtrl,
  parent
}) => {
  const jsCellRendererRef = useRef11();
  const renderDetails = useMemo6(() => {
    const { loadingComp } = cellCtrl.getDeferLoadingCellRenderer();
    return loadingComp ? {
      value: void 0,
      compDetails: loadingComp,
      force: false
    } : void 0;
  }, [cellCtrl]);
  showJsRenderer_default(renderDetails, false, void 0, 1, jsCellRendererRef, parent);
  if (renderDetails?.compDetails?.componentFromFramework) {
    const CellRendererClass = renderDetails.compDetails.componentClass;
    return /* @__PURE__ */ React13.createElement(CellRendererClass, { ...renderDetails.compDetails.params });
  }
  return /* @__PURE__ */ React13.createElement(React13.Fragment, null);
};

// packages/ag-grid-react/src/reactUi/cells/cellComp.tsx
var CellComp = ({
  cellCtrl,
  printLayout,
  editingCell
}) => {
  const beans = useContext11(BeansContext);
  const { context } = beans;
  const {
    column: { colIdSanitised },
    instanceId
  } = cellCtrl;
  const compBean = useRef12();
  const [renderDetails, setRenderDetails] = useState11(
    () => cellCtrl.isCellRenderer() ? void 0 : { compDetails: void 0, value: cellCtrl.getValueToDisplay(), force: false }
  );
  const [editDetails, setEditDetails] = useState11();
  const [renderKey, setRenderKey] = useState11(1);
  const [userStyles, setUserStyles] = useState11();
  const [includeSelection, setIncludeSelection] = useState11(false);
  const [includeRowDrag, setIncludeRowDrag] = useState11(false);
  const [includeDndSource, setIncludeDndSource] = useState11(false);
  const rowResizerElement = useRef12(null);
  const [jsEditorComp, setJsEditorComp] = useState11();
  const forceWrapper = useMemo7(() => cellCtrl.isForceWrapper(), [cellCtrl]);
  const cellAriaRole = useMemo7(() => cellCtrl.getCellAriaRole(), [cellCtrl]);
  const eGui = useRef12(null);
  const eWrapper = useRef12(null);
  const cellRendererRef = useRef12(null);
  const jsCellRendererRef = useRef12();
  const cellEditorRef = useRef12();
  const eCellWrapper = useRef12();
  const cellWrapperDestroyFuncs = useRef12([]);
  const rowDragCompRef = useRef12();
  const eCellValue = useRef12();
  const [cellValueVersion, setCellValueVersion] = useState11(0);
  const setCellValueRef = useCallback9((ref) => {
    eCellValue.current = ref;
    setCellValueVersion((v) => v + 1);
  }, []);
  const showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag) && (editDetails == null || !!editDetails.popup);
  const showCellWrapper = forceWrapper || showTools;
  const cellValueClass = useMemo7(() => {
    return cellCtrl.getCellValueClass();
  }, [cellCtrl]);
  const setCellEditorRef = useCallback9(
    (cellEditor) => {
      cellEditorRef.current = cellEditor;
      if (cellEditor) {
        const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
        setTimeout(() => {
          if (!cellCtrl.isAlive() || context.isDestroyed()) {
            return;
          }
          if (editingCancelledByUserComp) {
            cellCtrl.stopEditing(true);
            cellCtrl.focusCell({ forceBrowserFocus: true });
          } else {
            beans.editSvc?.onEditorAttached(cellCtrl);
            cellCtrl.enableEditorTooltipFeature(cellEditor);
          }
        });
      }
    },
    [cellCtrl]
  );
  const cssManager = useRef12();
  if (!cssManager.current) {
    cssManager.current = new CssClassManager(() => eGui.current);
  }
  const suppressJsRenderer = !!editDetails && !editDetails.popup;
  const resetCellRendererTooltip = useCallback9(() => cellCtrl.resetCellRendererTooltip(), [cellCtrl]);
  showJsRenderer_default(
    renderDetails,
    showCellWrapper,
    eCellValue.current,
    cellValueVersion,
    jsCellRendererRef,
    eGui,
    suppressJsRenderer,
    resetCellRendererTooltip
  );
  const lastRenderDetails = useRef12();
  useLayoutEffect7(() => {
    const oldDetails = lastRenderDetails.current;
    const newDetails = renderDetails;
    lastRenderDetails.current = renderDetails;
    const oldCompDetails = oldDetails?.compDetails;
    const newCompDetails = newDetails?.compDetails;
    if (oldCompDetails == null || newCompDetails == null || oldCompDetails === newCompDetails) {
      return;
    }
    rowDragCompRef.current?.refreshVisibility();
    if (oldCompDetails.componentClass != newCompDetails.componentClass) {
      return;
    }
    if (cellRendererRef.current?.refresh == null) {
      return;
    }
    const result = cellRendererRef.current.refresh(newCompDetails.params);
    if (result != true) {
      cellCtrl.resetCellRendererTooltip();
      setRenderKey((prev) => prev + 1);
    }
  }, [renderDetails]);
  useLayoutEffect7(() => {
    const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
    if (!doingJsEditor || context.isDestroyed()) {
      return;
    }
    const compDetails = editDetails.compDetails;
    const isPopup = editDetails.popup === true;
    const cellEditorPromise = compDetails.newAgStackInstance();
    cellEditorPromise.then((cellEditor) => {
      if (!cellEditor) {
        return;
      }
      const compGui = cellEditor.getGui();
      setCellEditorRef(cellEditor);
      if (!isPopup) {
        const parentEl = (forceWrapper ? eCellWrapper : eGui).current;
        parentEl?.appendChild(compGui);
        cellEditor.afterGuiAttached?.();
      }
      setJsEditorComp(cellEditor);
    });
    return () => {
      cellEditorPromise.then((cellEditor) => {
        const compGui = cellEditor.getGui();
        cellCtrl.disableEditorTooltipFeature();
        context.destroyBean(cellEditor);
        setCellEditorRef(void 0);
        setJsEditorComp(void 0);
        compGui?.remove();
      });
    };
  }, [editDetails]);
  const setCellWrapperRef = useCallback9(
    (eRef) => {
      eCellWrapper.current = eRef;
      if (!eRef || context.isDestroyed() || !cellCtrl.isAlive()) {
        const callbacks = cellWrapperDestroyFuncs.current;
        cellWrapperDestroyFuncs.current = [];
        for (const cb of callbacks) {
          cb();
        }
        return;
      }
      let rowDragComp;
      const addComp = (comp) => {
        if (comp) {
          eRef.insertAdjacentElement("afterbegin", comp.getGui());
          cellWrapperDestroyFuncs.current.push(() => {
            _removeFromParent(comp.getGui());
            context.destroyBean(comp);
            if (rowDragCompRef.current === rowDragComp) {
              rowDragCompRef.current = void 0;
            }
          });
        }
      };
      if (includeSelection) {
        addComp(cellCtrl.createSelectionCheckbox());
      }
      if (includeDndSource) {
        addComp(cellCtrl.createDndSource());
      }
      if (includeRowDrag) {
        rowDragComp = cellCtrl.createRowDragComp();
        rowDragCompRef.current = rowDragComp;
        if (rowDragComp) {
          addComp(rowDragComp);
          rowDragComp.refreshVisibility();
        }
      }
    },
    [cellCtrl, context, includeDndSource, includeRowDrag, includeSelection]
  );
  const init = useCallback9(() => {
    const spanReady = !cellCtrl.isCellSpanning() || eWrapper.current;
    const eRef = eGui.current;
    if (!eRef || !spanReady || !cellCtrl?.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new _EmptyBean5());
    const compProxy = {
      toggleCss: (name, on) => cssManager.current.toggleCss(name, on),
      setUserStyles: (styles) => setUserStyles(styles),
      getFocusableElement: () => eGui.current,
      setIncludeSelection: (include) => setIncludeSelection(include),
      setIncludeRowDrag: (include) => setIncludeRowDrag(include),
      setIncludeDndSource: (include) => setIncludeDndSource(include),
      setRowResizerElement: (element) => {
        if (rowResizerElement.current) {
          _removeFromParent(rowResizerElement.current);
        }
        rowResizerElement.current = element;
        if (element && eGui.current) {
          eGui.current.appendChild(element);
        }
      },
      getCellEditor: () => cellEditorRef.current ?? null,
      getCellRenderer: () => cellRendererRef.current ?? jsCellRendererRef.current,
      getParentOfValue: () => eCellValue.current ?? eCellWrapper.current ?? eGui.current,
      setRenderDetails: (compDetails, value, force) => {
        const setDetails = () => {
          setRenderDetails((prev) => {
            if (prev?.compDetails !== compDetails || prev?.value !== value || prev?.force !== force) {
              const previousCompDetails = prev?.compDetails;
              const rendererRemoved = previousCompDetails != null && compDetails == null;
              const rendererReplaced = previousCompDetails != null && compDetails != null && previousCompDetails.componentClass !== compDetails.componentClass;
              if (rendererRemoved || rendererReplaced) {
                cellCtrl.resetCellRendererTooltip();
              }
              return {
                value,
                compDetails,
                force
              };
            } else {
              return prev;
            }
          });
        };
        if (compDetails?.params?.deferRender && !cellCtrl.rowNode.group) {
          const { loadingComp, onReady } = cellCtrl.getDeferLoadingCellRenderer();
          if (loadingComp) {
            setRenderDetails({
              value: void 0,
              compDetails: loadingComp,
              force: false
            });
            onReady.then(() => agStartTransition(setDetails));
            return;
          }
        }
        setDetails();
      },
      setEditDetails: (compDetails, popup, popupPosition, reactiveCustomComponents) => {
        if (compDetails) {
          let compProxy2 = void 0;
          if (compDetails.componentFromFramework) {
            if (reactiveCustomComponents) {
              compProxy2 = new CellEditorComponentProxy(
                compDetails.params,
                () => setRenderKey((prev) => prev + 1)
              );
            } else {
              warnReactiveCustomComponents(beans.context.getId());
            }
          }
          setEditDetails({
            compDetails,
            popup,
            popupPosition,
            compProxy: compProxy2
          });
          if (!popup) {
            setRenderDetails(void 0);
          }
        } else {
          const recoverFocus = cellCtrl.hasBrowserFocus();
          if (recoverFocus) {
            compProxy.getFocusableElement().focus({ preventScroll: true });
          }
          cellEditorRef.current = void 0;
          setEditDetails(void 0);
        }
      },
      refreshEditStyles: (editing, isPopup) => {
        if (!eGui.current) {
          return;
        }
        const { current } = cssManager;
        current.toggleCss("ag-cell-value", !showCellWrapper);
        current.toggleCss("ag-cell-inline-editing", !!editing && !isPopup);
        current.toggleCss("ag-cell-popup-editing", !!editing && !!isPopup);
        current.toggleCss("ag-cell-not-inline-editing", !editing || !!isPopup);
      }
    };
    const cellWrapperOrUndefined = eCellWrapper.current || void 0;
    cellCtrl.setComp(
      compProxy,
      eRef,
      eWrapper.current ?? void 0,
      cellWrapperOrUndefined,
      printLayout,
      editingCell,
      compBean.current
    );
  }, []);
  const setGuiRef = useCallback9((ref) => {
    eGui.current = ref;
    init();
  }, []);
  const setWrapperRef = useCallback9((ref) => {
    eWrapper.current = ref;
    init();
  }, []);
  const reactCellRendererStateless = useMemo7(() => {
    const res = renderDetails?.compDetails?.componentFromFramework && isComponentStateless(renderDetails.compDetails.componentClass);
    return !!res;
  }, [renderDetails]);
  useLayoutEffect7(() => {
    if (!eGui.current) {
      return;
    }
    const { current } = cssManager;
    current.toggleCss("ag-cell-value", !showCellWrapper);
    current.toggleCss("ag-cell-inline-editing", !!editDetails && !editDetails.popup);
    current.toggleCss("ag-cell-popup-editing", !!editDetails && !!editDetails.popup);
    current.toggleCss("ag-cell-not-inline-editing", !editDetails || !!editDetails.popup);
  });
  const valueOrCellComp = () => {
    const { compDetails, value } = renderDetails;
    if (!compDetails) {
      return value?.toString?.() ?? value;
    }
    if (compDetails.componentFromFramework) {
      const CellRendererClass = compDetails.componentClass;
      return /* @__PURE__ */ React14.createElement(Suspense, { fallback: /* @__PURE__ */ React14.createElement(SkeletonCellRenderer, { cellCtrl, parent: eGui }) }, reactCellRendererStateless ? /* @__PURE__ */ React14.createElement(CellRendererClass, { ...compDetails.params, key: renderKey }) : /* @__PURE__ */ React14.createElement(CellRendererClass, { ...compDetails.params, key: renderKey, ref: cellRendererRef }));
    }
  };
  const showCellOrEditor = () => {
    const showCellValue = () => {
      if (renderDetails == null) {
        return null;
      }
      return showCellWrapper ? /* @__PURE__ */ React14.createElement("span", { role: "presentation", id: `cell-${instanceId}`, className: cellValueClass, ref: setCellValueRef }, valueOrCellComp()) : valueOrCellComp();
    };
    const showEditValue = (details) => jsxEditValue(details, setCellEditorRef, eGui.current, cellCtrl, jsEditorComp);
    if (editDetails != null) {
      if (editDetails.popup) {
        return /* @__PURE__ */ React14.createElement(React14.Fragment, null, showCellValue(), showEditValue(editDetails));
      }
      return showEditValue(editDetails);
    }
    return showCellValue();
  };
  const renderCell = () => /* @__PURE__ */ React14.createElement("div", { ref: setGuiRef, style: userStyles, role: cellAriaRole, "col-id": colIdSanitised }, showCellWrapper ? /* @__PURE__ */ React14.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: setCellWrapperRef }, showCellOrEditor()) : showCellOrEditor());
  if (cellCtrl.isCellSpanning()) {
    return /* @__PURE__ */ React14.createElement("div", { ref: setWrapperRef, className: "ag-spanned-cell-wrapper", role: "presentation" }, renderCell());
  }
  return renderCell();
};
var cellComp_default = memo9(CellComp);

// packages/ag-grid-react/src/reactUi/rows/rowComp.tsx
var RowComp = ({ rowCtrl, containerType }) => {
  const { context, gos, editSvc } = useContext12(BeansContext);
  const enableUses = useContext12(RenderModeContext) === "default";
  const compBean = useRef13();
  const domOrderRef = useRef13(rowCtrl.getDomOrder());
  const isFullWidth = rowCtrl.isFullWidth();
  const fullWidthAnchorRole = rowCtrl.getFullWidthAnchorRole();
  const isDisplayed = rowCtrl.rowNode.displayed;
  const [rowIndex, setRowIndex] = useState12(
    () => isDisplayed ? rowCtrl.rowNode.getRowIndexString() : null
  );
  const [rowId, setRowId] = useState12(() => rowCtrl.rowId);
  const [rowBusinessKey, setRowBusinessKey] = useState12(() => rowCtrl.businessKey);
  const [userStyles, setUserStyles] = useState12(() => rowCtrl.rowStyles);
  const [cellCtrlsFlushSync, setCellCtrlsFlushSync] = useState12(
    () => rowCtrl.getInitialCellCtrls(containerType)
  );
  const cellCtrlsRef = useRef13(cellCtrlsFlushSync);
  const [fullWidthCompDetails, setFullWidthCompDetails] = useState12();
  const [embeddedFullWidthCompDetails, setEmbeddedFullWidthCompDetails] = useState12();
  const embeddedFullWidthCompDetailsRef = useRef13();
  const [top, setTop] = useState12(() => isDisplayed ? rowCtrl.getInitialRowTop() : void 0);
  const [transform, setTransform] = useState12(
    () => isDisplayed ? rowCtrl.getInitialTransform() : void 0
  );
  const eGui = useRef13(null);
  const eFullWidthAnchor = useRef13(null);
  const ePinnedLeftCells = useRef13(null);
  const eScrollingCells = useRef13(null);
  const ePinnedRightCells = useRef13(null);
  const fullWidthCompRef = useRef13();
  const fullWidthEmbeddedLeftCompRef = useRef13();
  const fullWidthEmbeddedCenterCompRef = useRef13();
  const fullWidthEmbeddedRightCompRef = useRef13();
  const fullWidthParamsRef = useRef13();
  const fullWidthEmbeddedLeftParamsRef = useRef13();
  const fullWidthEmbeddedCenterParamsRef = useRef13();
  const fullWidthEmbeddedRightParamsRef = useRef13();
  const [, setEmbeddedSectionHasContent] = useState12(() => rowCtrl.embeddedSectionHasContent);
  const [, refreshWidths] = useState12(0);
  const autoHeightSetup = useRef13(false);
  const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = useState12(0);
  useEffect8(() => {
    if (autoHeightSetup.current || !fullWidthCompDetails || autoHeightSetupAttempt > 10) {
      return;
    }
    const eChild = eFullWidthAnchor.current?.firstChild;
    if (eChild) {
      rowCtrl.setupDetailRowAutoHeight(eChild);
      autoHeightSetup.current = true;
    } else {
      setAutoHeightSetupAttempt((prev) => prev + 1);
    }
  }, [fullWidthCompDetails, autoHeightSetupAttempt]);
  const cssManager = useRef13();
  if (!cssManager.current) {
    cssManager.current = new CssClassManager(() => eGui.current);
  }
  const cellsChanged = useRef13(() => {
  });
  const sub = useCallback10((onStoreChange) => {
    cellsChanged.current = onStoreChange;
    return () => {
      cellsChanged.current = () => {
      };
    };
  }, []);
  const cellCtrlsUses = agUseSyncExternalStore(sub, () => {
    return cellCtrlsRef.current;
  }, []);
  const cellCtrlsMerged = enableUses ? cellCtrlsUses : cellCtrlsFlushSync;
  const setRef2 = useCallback10((eRef) => {
    eGui.current = eRef;
    compBean.current = eRef ? context.createBean(new _EmptyBean6()) : context.destroyBean(compBean.current);
    if (!eRef) {
      rowCtrl.unsetComp(containerType);
      return;
    }
    if (!rowCtrl.isAlive() || context.isDestroyed()) {
      return;
    }
    const compProxy = {
      // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
      // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
      setTop,
      setTransform,
      // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
      // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
      toggleCss: (name, on) => cssManager.current.toggleCss(name, on),
      setDomOrder: (domOrder) => domOrderRef.current = domOrder,
      setRowIndex,
      setRowId,
      setRowBusinessKey,
      setUserStyles,
      // if we don't maintain the order, then cols will be ripped out and into the dom
      // when cols reordered, which would stop the CSS transitions from working
      setCellCtrls: (next, useFlushSync) => {
        const prevCellCtrls = cellCtrlsRef.current;
        const nextCells = getNextValueIfDifferent(prevCellCtrls, next, domOrderRef.current);
        if (nextCells !== prevCellCtrls) {
          cellCtrlsRef.current = nextCells;
          if (enableUses) {
            cellsChanged.current();
          } else {
            agFlushSync(useFlushSync, () => setCellCtrlsFlushSync(nextCells));
          }
        }
      },
      getPinnedLeftRowElement: () => ePinnedLeftCells.current ?? void 0,
      getScrollingRowElement: () => eScrollingCells.current ?? void 0,
      getPinnedRightRowElement: () => ePinnedRightCells.current ?? void 0,
      refreshPinnedSections: () => refreshWidths((v) => v + 1),
      showFullWidth: (compDetails) => {
        embeddedFullWidthCompDetailsRef.current = void 0;
        setEmbeddedFullWidthCompDetails(void 0);
        setEmbeddedSectionHasContent({ left: true, center: true, right: true });
        fullWidthParamsRef.current = compDetails.params;
        setFullWidthCompDetails(compDetails);
      },
      showEmbeddedFullWidth: (compDetails) => {
        setFullWidthCompDetails(void 0);
        setEmbeddedSectionHasContent({ left: true, center: true, right: true });
        fullWidthEmbeddedLeftParamsRef.current = compDetails.left.params;
        fullWidthEmbeddedCenterParamsRef.current = compDetails.center.params;
        fullWidthEmbeddedRightParamsRef.current = compDetails.right.params;
        embeddedFullWidthCompDetailsRef.current = compDetails;
        setEmbeddedFullWidthCompDetails(compDetails);
      },
      getFullWidthCellRenderers: () => {
        if (rowCtrl.isEmbeddedFullWidth) {
          return [
            fullWidthEmbeddedLeftCompRef.current,
            fullWidthEmbeddedCenterCompRef.current,
            fullWidthEmbeddedRightCompRef.current
          ].filter((r) => r != null);
        }
        return fullWidthCompRef.current ? [fullWidthCompRef.current] : [];
      },
      getFullWidthCellRendererParams: () => fullWidthParamsRef.current ?? fullWidthEmbeddedCenterParamsRef.current,
      getFullWidthCellRendererParamsForPinned: (pinned) => pinned === "left" ? fullWidthEmbeddedLeftParamsRef.current : pinned === "right" ? fullWidthEmbeddedRightParamsRef.current : fullWidthEmbeddedCenterParamsRef.current,
      refreshFullWidth: (getUpdatedParams) => {
        const fullWidthParams = getUpdatedParams();
        fullWidthParamsRef.current = fullWidthParams;
        if (canRefreshFullWidthRef.current) {
          setFullWidthCompDetails((prevFullWidthCompDetails) => ({
            ...prevFullWidthCompDetails,
            params: fullWidthParams
          }));
          return true;
        } else {
          if (!fullWidthCompRef.current || !fullWidthCompRef.current.refresh) {
            return false;
          }
          return fullWidthCompRef.current.refresh(fullWidthParams);
        }
      },
      refreshEmbeddedFullWidth: (getUpdatedParams) => {
        const leftParams = getUpdatedParams("left");
        const centerParams = getUpdatedParams(null);
        const rightParams = getUpdatedParams("right");
        fullWidthEmbeddedLeftParamsRef.current = leftParams;
        fullWidthEmbeddedCenterParamsRef.current = centerParams;
        fullWidthEmbeddedRightParamsRef.current = rightParams;
        const leftRef = fullWidthEmbeddedLeftCompRef.current;
        const centerRef = fullWidthEmbeddedCenterCompRef.current;
        const rightRef = fullWidthEmbeddedRightCompRef.current;
        const currentDetails = embeddedFullWidthCompDetailsRef.current;
        let nextDetails;
        const refreshSection = (section, params, renderer, hasContent) => {
          const details = currentDetails?.[section];
          const isStatelessFrameworkRenderer = !!details?.componentFromFramework && isComponentStateless(details.componentClass);
          if (isStatelessFrameworkRenderer) {
            if (!gos.get("reactiveCustomComponents") || !currentDetails) {
              return false;
            }
            nextDetails ?? (nextDetails = { ...currentDetails });
            nextDetails[section] = { ...details, params };
            return true;
          }
          return renderer?.refresh?.(params) ?? !hasContent;
        };
        const leftRefreshed = refreshSection(
          "left",
          leftParams,
          leftRef,
          rowCtrl.embeddedSectionHasContent.left
        );
        const centerRefreshed = refreshSection("center", centerParams, centerRef, true);
        const rightRefreshed = refreshSection(
          "right",
          rightParams,
          rightRef,
          rowCtrl.embeddedSectionHasContent.right
        );
        if (nextDetails) {
          embeddedFullWidthCompDetailsRef.current = nextDetails;
          setEmbeddedFullWidthCompDetails(nextDetails);
        }
        return leftRefreshed && centerRefreshed && rightRefreshed;
      }
    };
    rowCtrl.setComp(compProxy, eRef, containerType, compBean.current);
  }, []);
  const showEmbeddedFullWidth = isFullWidth && rowCtrl.shouldCreateCellSections();
  useLayoutEffect8(
    () => showJsComp(fullWidthCompDetails, context, eFullWidthAnchor.current ?? eGui.current, fullWidthCompRef),
    [fullWidthCompDetails]
  );
  useLayoutEffect8(() => {
    if (!ePinnedLeftCells.current) {
      return;
    }
    return showJsComp(
      embeddedFullWidthCompDetails?.left,
      context,
      ePinnedLeftCells.current,
      fullWidthEmbeddedLeftCompRef
    );
  }, [embeddedFullWidthCompDetails?.left]);
  useLayoutEffect8(() => {
    if (!eScrollingCells.current) {
      return;
    }
    return showJsComp(
      embeddedFullWidthCompDetails?.center,
      context,
      eScrollingCells.current,
      fullWidthEmbeddedCenterCompRef
    );
  }, [embeddedFullWidthCompDetails?.center]);
  useLayoutEffect8(() => {
    if (!ePinnedRightCells.current) {
      return;
    }
    return showJsComp(
      embeddedFullWidthCompDetails?.right,
      context,
      ePinnedRightCells.current,
      fullWidthEmbeddedRightCompRef
    );
  }, [embeddedFullWidthCompDetails?.right]);
  useLayoutEffect8(() => {
    if (!showEmbeddedFullWidth) {
      return;
    }
    const updateLaneVisibility = () => {
      const next = {
        left: !!ePinnedLeftCells.current?.firstElementChild,
        center: !!eScrollingCells.current?.firstElementChild,
        right: !!ePinnedRightCells.current?.firstElementChild
      };
      rowCtrl.embeddedSectionHasContent = next;
      setEmbeddedSectionHasContent(
        (prev) => prev.left === next.left && prev.center === next.center && prev.right === next.right ? prev : next
      );
    };
    updateLaneVisibility();
    const observer = new MutationObserver(updateLaneVisibility);
    if (ePinnedLeftCells.current) {
      observer.observe(ePinnedLeftCells.current, { childList: true });
    }
    if (eScrollingCells.current) {
      observer.observe(eScrollingCells.current, { childList: true });
    }
    if (ePinnedRightCells.current) {
      observer.observe(ePinnedRightCells.current, { childList: true });
    }
    return () => observer.disconnect();
  }, [showEmbeddedFullWidth, embeddedFullWidthCompDetails]);
  const rowStyles = useMemo8(() => {
    const res = { top, transform };
    Object.assign(res, userStyles);
    return res;
  }, [top, transform, userStyles]);
  const showFullWidthFramework = isFullWidth && fullWidthCompDetails?.componentFromFramework;
  const showCells = !isFullWidth && cellCtrlsMerged != null;
  const { leftCellCtrls, centerCellCtrls, rightCellCtrls } = useMemo8(() => {
    const byLane = [[], [], []];
    for (const cellCtrl of cellCtrlsMerged ?? []) {
      byLane[rowCtrl.laneFor(cellCtrl.column)].push(cellCtrl);
    }
    return {
      leftCellCtrls: byLane[0],
      centerCellCtrls: byLane[1],
      rightCellCtrls: byLane[2]
    };
  }, [cellCtrlsMerged, rowCtrl]);
  const { leftWidth, centerWidth, rightWidth, renderLeft, renderRight } = rowCtrl.getMappedPinnedCellGroupWidths();
  const reactFullWidthCellRendererStateless = useMemo8(() => {
    const res = fullWidthCompDetails?.componentFromFramework && isComponentStateless(fullWidthCompDetails.componentClass);
    return !!res;
  }, [fullWidthCompDetails]);
  const canRefreshFullWidthRef = useRef13(false);
  useEffect8(() => {
    canRefreshFullWidthRef.current = reactFullWidthCellRendererStateless && !!fullWidthCompDetails && !!gos.get("reactiveCustomComponents");
  }, [reactFullWidthCellRendererStateless, fullWidthCompDetails]);
  const showCellsJsx = (cellCtrls) => cellCtrls.map((cellCtrl) => /* @__PURE__ */ React15.createElement(
    cellComp_default,
    {
      cellCtrl,
      editingCell: editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) ?? false,
      printLayout: rowCtrl.printLayout,
      key: cellCtrl.instanceId
    }
  ));
  const showFullWidthFrameworkJsx = () => {
    const FullWidthComp = fullWidthCompDetails.componentClass;
    return reactFullWidthCellRendererStateless ? /* @__PURE__ */ React15.createElement(FullWidthComp, { ...fullWidthCompDetails.params }) : /* @__PURE__ */ React15.createElement(FullWidthComp, { ...fullWidthCompDetails.params, ref: fullWidthCompRef });
  };
  const showEmbeddedFrameworkSection = (section) => {
    const details = embeddedFullWidthCompDetails?.[section];
    if (!details?.componentFromFramework) {
      return null;
    }
    const FullWidthComp = details.componentClass;
    const compRef = section === "left" ? fullWidthEmbeddedLeftCompRef : section === "right" ? fullWidthEmbeddedRightCompRef : fullWidthEmbeddedCenterCompRef;
    const stateless = isComponentStateless(details.componentClass);
    return stateless ? /* @__PURE__ */ React15.createElement(FullWidthComp, { ...details.params }) : /* @__PURE__ */ React15.createElement(FullWidthComp, { ...details.params, ref: compRef });
  };
  const renderCellSection = (sectionClass, ref, width, children, pinned = false, shouldRender = true) => {
    if (!shouldRender) {
      return null;
    }
    if (pinned) {
      return /* @__PURE__ */ React15.createElement("div", { className: sectionClass, role: "presentation", style: { width: `${width}px` } }, /* @__PURE__ */ React15.createElement("div", { className: "ag-grid-container-wrapper", role: "presentation", ref }, children));
    }
    return /* @__PURE__ */ React15.createElement("div", { className: sectionClass, role: "presentation", ref, style: { width: `${width}px` } }, children);
  };
  return /* @__PURE__ */ React15.createElement(
    "div",
    {
      ref: setRef2,
      role: "row",
      style: rowStyles,
      "row-index": rowIndex,
      "row-id": rowId,
      "row-business-key": rowBusinessKey
    },
    showCells || showEmbeddedFullWidth ? /* @__PURE__ */ React15.createElement(React15.Fragment, null, renderCellSection(
      "ag-grid-pinned-left-cells",
      ePinnedLeftCells,
      leftWidth,
      showCells ? showCellsJsx(leftCellCtrls) : showEmbeddedFrameworkSection("left"),
      true,
      renderLeft
    ), renderCellSection(
      "ag-grid-scrolling-cells",
      eScrollingCells,
      centerWidth,
      showCells ? showCellsJsx(centerCellCtrls) : showEmbeddedFrameworkSection("center")
    ), renderCellSection(
      "ag-grid-pinned-right-cells",
      ePinnedRightCells,
      rightWidth,
      showCells ? showCellsJsx(rightCellCtrls) : showEmbeddedFrameworkSection("right"),
      true,
      renderRight
    )) : showFullWidthFramework ? /* @__PURE__ */ React15.createElement("div", { className: "ag-full-width-anchor", role: fullWidthAnchorRole, ref: eFullWidthAnchor }, showFullWidthFrameworkJsx()) : isFullWidth ? /* @__PURE__ */ React15.createElement("div", { className: "ag-full-width-anchor", role: fullWidthAnchorRole, ref: eFullWidthAnchor }) : null
  );
};
var rowComp_default = memo10(RowComp);

// packages/ag-grid-react/src/reactUi/rows/rowContainerComp.tsx
var RowContainerComp = ({
  name,
  viewportElement,
  extraClassName
}) => {
  const { context, gos } = useContext13(BeansContext);
  const containerOptions = useMemo9(() => _getRowContainerOptions(name), [name]);
  const eContainer = useRef14(null);
  const eSpanContainer = useRef14(null);
  const rowCtrlsRef = useRef14([]);
  const prevRowCtrlsRef = useRef14([]);
  const [hidden, setHidden] = useState13(true);
  const [rowCtrlsOrdered, setRowCtrlsOrdered] = useState13(() => []);
  const isSpanning = !!gos.get("enableCellSpan") && !!containerOptions.getSpannedRowCtrls;
  const spannedRowCtrlsRef = useRef14([]);
  const prevSpannedRowCtrlsRef = useRef14([]);
  const [spannedRowCtrlsOrdered, setSpannedRowCtrlsOrdered] = useState13(() => []);
  const domOrderRef = useRef14(false);
  const rowContainerCtrlRef = useRef14();
  const containerClasses = useMemo9(
    () => classesList(_getRowContainerClass(name), hidden ? "ag-hidden" : null, extraClassName),
    [extraClassName, name, hidden]
  );
  const spanClasses = useMemo9(() => classesList("ag-spanning-container", _getRowSpanContainerClass(name)), [name]);
  reactComment_default(" AG Row Container " + name + " ", eContainer);
  const setRef2 = useCallback11(() => {
    if (eContainer.current == null && eSpanContainer.current == null) {
      rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
    }
    if (context.isDestroyed()) {
      return;
    }
    const eContainerForCtrl = eContainer.current;
    const eViewportForCtrl = viewportElement ?? eContainer.current;
    if (!eContainerForCtrl || !eViewportForCtrl || isSpanning && !eSpanContainer.current) {
      return;
    }
    if (rowContainerCtrlRef.current) {
      return;
    }
    const eSpanContainerForCtrl = eSpanContainer.current ?? void 0;
    const updateRowCtrlsOrdered = (useFlushSync) => {
      const next = getNextValueIfDifferent(prevRowCtrlsRef.current, rowCtrlsRef.current, domOrderRef.current);
      if (next !== prevRowCtrlsRef.current) {
        prevRowCtrlsRef.current = next;
        agFlushSync(useFlushSync, () => setRowCtrlsOrdered(next));
      }
    };
    const updateSpannedRowCtrlsOrdered = (useFlushSync) => {
      const next = getNextValueIfDifferent(
        prevSpannedRowCtrlsRef.current,
        spannedRowCtrlsRef.current,
        domOrderRef.current
      );
      if (next !== prevSpannedRowCtrlsRef.current) {
        prevSpannedRowCtrlsRef.current = next;
        agFlushSync(useFlushSync, () => setSpannedRowCtrlsOrdered(next));
      }
    };
    const compProxy = {
      setRowCtrls: ({ rowCtrls, useFlushSync }) => {
        const useFlush = !!useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
        rowCtrlsRef.current = rowCtrls;
        updateRowCtrlsOrdered(useFlush);
      },
      setSpannedRowCtrls: (rowCtrls, useFlushSync) => {
        const useFlush = !!useFlushSync && spannedRowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
        spannedRowCtrlsRef.current = rowCtrls;
        updateSpannedRowCtrlsOrdered(useFlush);
      },
      setDomOrder: (domOrder) => {
        if (domOrderRef.current !== domOrder) {
          domOrderRef.current = domOrder;
          updateRowCtrlsOrdered(false);
        }
      },
      setContainerWidth: (width) => {
        if (eContainerForCtrl) {
          eContainerForCtrl.style.width = width;
        }
        if (eSpanContainerForCtrl) {
          eSpanContainerForCtrl.style.width = width;
        }
      },
      setOffsetTop: (offset) => {
        eContainerForCtrl.style.transform = `translateY(${offset})`;
        if (eSpanContainerForCtrl) {
          eSpanContainerForCtrl.style.transform = `translateY(${offset})`;
        }
      },
      setHidden: (hidden2) => setHidden(hidden2)
    };
    rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(name));
    rowContainerCtrlRef.current.setComp(compProxy, eContainerForCtrl, eSpanContainerForCtrl, eViewportForCtrl);
  }, [context, isSpanning, name, viewportElement]);
  useEffect9(
    () => () => {
      rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
    },
    [context, name]
  );
  const setContainerRef = useCallback11(
    (e) => {
      eContainer.current = e;
      setRef2();
    },
    [setRef2]
  );
  const setSpanContainerRef = useCallback11(
    (e) => {
      eSpanContainer.current = e;
      setRef2();
    },
    [setRef2]
  );
  const buildSpanContainer = () => /* @__PURE__ */ React16.createElement("div", { className: spanClasses, ref: setSpanContainerRef, role: "presentation" }, spannedRowCtrlsOrdered.map((rowCtrl) => /* @__PURE__ */ React16.createElement(rowComp_default, { rowCtrl, containerType: containerOptions.type, key: rowCtrl.instanceId })));
  const rows = rowCtrlsOrdered.map((rowCtrl) => /* @__PURE__ */ React16.createElement(rowComp_default, { rowCtrl, containerType: containerOptions.type, key: rowCtrl.instanceId }));
  return /* @__PURE__ */ React16.createElement("div", { className: containerClasses, ref: setContainerRef, role: "presentation" }, rows, isSpanning ? buildSpanContainer() : null);
};
var rowContainerComp_default = memo11(RowContainerComp);

// packages/ag-grid-react/src/reactUi/gridBodyComp.tsx
var GridBodyComp = () => {
  const { context, gos, overlays, rangeSvc } = useContext14(BeansContext);
  const [rowAnimationClass, setRowAnimationClass] = useState14("");
  const [pinnedSections, setPinnedSections] = useState14({
    top: { height: 0, invisible: true },
    bottom: { height: 0, invisible: true }
  });
  const [stickyBottomHeight, setStickyBottomHeight] = useState14("0px");
  const [stickyBottomWidth, setStickyBottomWidth] = useState14("100%");
  const [cellSelectableCss, setCellSelectableCss] = useState14(null);
  const [preventRowAnimationClass, setPreventRowAnimationClass] = useState14(null);
  const [pinnedColumnsOverflowing, setPinnedColumnsOverflowing] = useState14(false);
  const [layoutClass, setLayoutClass] = useState14("ag-layout-normal");
  const cssManager = useRef15();
  if (!cssManager.current) {
    cssManager.current = new CssClassManager(() => eRoot.current);
  }
  const eRoot = useRef15(null);
  const [rootElement, setRootElement] = useState14(null);
  const eTop = useRef15(null);
  const [topElement, setTopElement] = useState14(null);
  const eGridViewport = useRef15(null);
  const [gridViewportElement, setGridViewportElement] = useState14(null);
  const eGridScrollableArea = useRef15(null);
  const eBody = useRef15(null);
  const eBottom = useRef15(null);
  const eTopExtraRows = useRef15(null);
  reactComment_default(" AG Grid Body ", eRoot);
  reactComment_default(" AG Pinned Top ", eTop);
  reactComment_default(" AG Middle ", eGridViewport);
  reactComment_default(" AG Pinned Bottom ", eBottom);
  const setRootRef = useCallback12((eRef) => {
    eRoot.current = eRef;
    setRootElement(eRef);
  }, []);
  const setPinnedSection = useCallback12((section, state) => {
    setPinnedSections((prev) => {
      const current = prev[section];
      if (current.height === state.height && current.invisible === state.invisible) {
        return prev;
      }
      return { ...prev, [section]: state };
    });
  }, []);
  useEffect10(() => {
    if (!rootElement || context.isDestroyed() || !eGridViewport.current || !eBody.current || !eTop.current || !eBottom.current || !eTopExtraRows.current) {
      return;
    }
    const beansToDestroy = [];
    const destroyFuncs = [];
    const attachToDom = (eParent, eChild) => {
      eParent.appendChild(eChild);
      destroyFuncs.push(() => eChild.remove());
    };
    const newComp = (compClass) => {
      const comp = context.createBean(new compClass());
      beansToDestroy.push(comp);
      return comp;
    };
    const addComp = (eParent, compClass, comment) => {
      attachToDom(eParent, document.createComment(comment));
      attachToDom(eParent, newComp(compClass).getGui());
    };
    addComp(rootElement, FakeHScrollComp, " AG Fake Horizontal Scroll ");
    addComp(rootElement, FakeVScrollComp, " AG Fake Vertical Scroll ");
    const overlayComp = overlays?.getOverlayWrapperCompClass();
    if (overlayComp) {
      addComp(rootElement, overlayComp, " AG Overlay Wrapper ");
    }
    const compProxy = {
      setColumnCount: (count) => {
        if (eGridViewport.current) {
          _setAriaColCount(eGridViewport.current, count);
        }
      },
      setRowCount: (count) => {
        if (eGridViewport.current) {
          _setAriaRowCount(eGridViewport.current, count);
        }
      },
      setPinnedSection,
      setColumnMovingCss: (cssClass, flag) => cssManager.current.toggleCss(cssClass, flag),
      updateLayoutClasses: setLayoutClass,
      setCellSelectableCss: (cssClass, flag) => setCellSelectableCss(flag ? cssClass : null),
      setRowAnimationCssOnScrollableArea: (animate) => setRowAnimationClass(animate ? "ag-row-animation" : "ag-row-no-animation"),
      setPreventRowAnimationCssOnContainers: (prevent) => setPreventRowAnimationClass(prevent ? "ag-prevent-animation" : null),
      setGridScrollableAreaWidth: (width) => {
        if (eGridScrollableArea.current) {
          eGridScrollableArea.current.style.width = width;
        }
      },
      setPinnedColumnsOverflowing,
      setStickyBottomHeight,
      setStickyBottomWidth,
      setGridRole: (role) => {
        if (eGridViewport.current) {
          _setAriaRole(eGridViewport.current, role);
        }
      }
    };
    const ctrl = context.createBean(new GridBodyCtrl());
    beansToDestroy.push(ctrl);
    ctrl.setComp(
      compProxy,
      rootElement,
      eGridViewport.current,
      eBody.current,
      eTop.current,
      eTopExtraRows.current,
      eBottom.current
    );
    if (eGridViewport.current && (rangeSvc && _isCellSelectionEnabled(gos) || _isMultiRowSelection(gos))) {
      _setAriaMultiSelectable(eGridViewport.current, true);
    }
    return () => {
      context.destroyBeans(beansToDestroy);
      for (const f of destroyFuncs) {
        f();
      }
    };
  }, [context, gos, overlays, rangeSvc, rootElement]);
  const rootClasses = useMemo10(() => classesList("ag-root", "ag-unselectable", layoutClass), [layoutClass]);
  const gridViewportClasses = useMemo10(
    () => classesList(
      "ag-grid-viewport",
      layoutClass,
      pinnedColumnsOverflowing ? "ag-pinned-columns-overflow" : null
    ),
    [layoutClass, pinnedColumnsOverflowing]
  );
  const bodyClasses = useMemo10(
    () => classesList("ag-grid-scrolling-rows", layoutClass, cellSelectableCss),
    [layoutClass, cellSelectableCss]
  );
  const topSection = pinnedSections.top;
  const bottomSection = pinnedSections.bottom;
  const topClasses = useMemo10(
    () => classesList("ag-grid-pinned-top-rows", cellSelectableCss),
    [cellSelectableCss, topSection.invisible]
  );
  const stickyBottomHeightNumber = Number.parseFloat(stickyBottomHeight) || 0;
  const bottomSectionHidden = bottomSection.height <= 0 && stickyBottomHeightNumber <= 0;
  const scrollableClasses = useMemo10(
    () => classesList(
      "ag-grid-scrollable-area",
      topSection.invisible ? null : "ag-has-top-pinned-rows",
      bottomSection.invisible ? null : "ag-has-bottom-pinned-rows"
    ),
    [bottomSection.invisible, topSection.invisible]
  );
  const bottomClasses = useMemo10(
    () => classesList("ag-grid-pinned-bottom-rows", bottomSectionHidden ? "ag-hidden" : null, cellSelectableCss),
    [bottomSection.invisible, bottomSectionHidden, cellSelectableCss]
  );
  const rowAnimationContainerClass = useMemo10(
    () => classesList(rowAnimationClass, preventRowAnimationClass),
    [preventRowAnimationClass, rowAnimationClass]
  );
  const gridViewportStyle = useMemo10(
    () => ({
      "--ag-internal-top-rows-height": `${topSection.height}px`,
      "--ag-internal-bottom-rows-height": `${bottomSection.height}px`
    }),
    [topSection.height, bottomSection.height]
  );
  const topStyle = useMemo10(() => {
    const topSectionHeight = `calc(var(--ag-internal-header-rows-height, 0px) + ${topSection.height}px)`;
    return {
      minHeight: topSectionHeight,
      height: topSectionHeight
    };
  }, [topSection.height]);
  const bottomStyle = useMemo10(
    () => ({
      height: `calc(${bottomSection.height}px + ${stickyBottomHeight})`,
      minHeight: `calc(${bottomSection.height}px + ${stickyBottomHeight})`,
      width: stickyBottomWidth
    }),
    [bottomSection.height, stickyBottomHeight, stickyBottomWidth]
  );
  const setTopRef = useCallback12((el) => {
    eTop.current = el;
    setTopElement(el);
  }, []);
  const setGridViewportRef = useCallback12((el) => {
    eGridViewport.current = el;
    setGridViewportElement(el);
  }, []);
  return /* @__PURE__ */ React17.createElement("div", { ref: setRootRef, className: rootClasses, role: "presentation" }, /* @__PURE__ */ React17.createElement("div", { ref: setGridViewportRef, className: gridViewportClasses, role: "presentation", style: gridViewportStyle }, /* @__PURE__ */ React17.createElement("div", { ref: eGridScrollableArea, className: scrollableClasses, role: "rowgroup" }, /* @__PURE__ */ React17.createElement("div", { ref: setTopRef, className: topClasses, role: "presentation", style: topStyle }, topElement && gridViewportElement && /* @__PURE__ */ React17.createElement(gridHeaderComp_default, { eGridViewport: gridViewportElement }), /* @__PURE__ */ React17.createElement("div", { ref: eTopExtraRows, className: "ag-extra-rows-container", role: "presentation" }), /* @__PURE__ */ React17.createElement(
    rowContainerComp_default,
    {
      name: "pinnedTop",
      viewportElement: gridViewportElement,
      extraClassName: rowAnimationContainerClass
    }
  ), /* @__PURE__ */ React17.createElement(rowContainerComp_default, { name: "stickyTop", viewportElement: gridViewportElement })), /* @__PURE__ */ React17.createElement("div", { className: bodyClasses, ref: eBody, role: "presentation" }, /* @__PURE__ */ React17.createElement(
    rowContainerComp_default,
    {
      name: "scrolling",
      viewportElement: gridViewportElement,
      extraClassName: rowAnimationContainerClass
    }
  )), /* @__PURE__ */ React17.createElement("div", { className: bottomClasses, ref: eBottom, role: "presentation", style: bottomStyle }, /* @__PURE__ */ React17.createElement(rowContainerComp_default, { name: "stickyBottom", viewportElement: gridViewportElement }), /* @__PURE__ */ React17.createElement(
    rowContainerComp_default,
    {
      name: "pinnedBottom",
      viewportElement: gridViewportElement,
      extraClassName: rowAnimationContainerClass
    }
  )))));
};
var gridBodyComp_default = memo12(GridBodyComp);

// packages/ag-grid-react/src/reactUi/tabGuardComp.tsx
import React18, { forwardRef as forwardRef2, memo as memo13, useCallback as useCallback13, useContext as useContext15, useImperativeHandle as useImperativeHandle2, useRef as useRef16 } from "react";
import { TabGuardCtrl } from "ag-grid-community";
var TabGuardCompRef = (props, forwardRef4) => {
  const { children, eFocusableElement, onTabKeyDown, gridCtrl, forceFocusOutWhenTabGuardsAreEmpty, isEmpty } = props;
  const { context } = useContext15(BeansContext);
  const topTabGuardRef = useRef16(null);
  const bottomTabGuardRef = useRef16(null);
  const tabGuardCtrlRef = useRef16();
  const setTabIndex = (value) => {
    const processedValue = value == null ? void 0 : parseInt(value, 10).toString();
    for (const tabGuard of [topTabGuardRef, bottomTabGuardRef]) {
      if (processedValue === void 0) {
        tabGuard.current?.removeAttribute("tabindex");
      } else {
        tabGuard.current?.setAttribute("tabindex", processedValue);
      }
    }
  };
  useImperativeHandle2(forwardRef4, () => ({
    forceFocusOutOfContainer(up) {
      tabGuardCtrlRef.current?.forceFocusOutOfContainer(up);
    },
    focusNextElementOutsideContainer(up, excludeElements) {
      return tabGuardCtrlRef.current?.focusNextElementOutsideContainer(up, excludeElements) ?? false;
    }
  }));
  const setupCtrl = useCallback13(() => {
    const topTabGuard = topTabGuardRef.current;
    const bottomTabGuard = bottomTabGuardRef.current;
    if (!topTabGuard && !bottomTabGuard || context.isDestroyed()) {
      tabGuardCtrlRef.current = context.destroyBean(tabGuardCtrlRef.current);
      return;
    }
    if (topTabGuard && bottomTabGuard) {
      const compProxy = {
        setTabIndex
      };
      tabGuardCtrlRef.current = context.createBean(
        new TabGuardCtrl({
          comp: compProxy,
          eTopGuard: topTabGuard,
          eBottomGuard: bottomTabGuard,
          eFocusableElement,
          onTabKeyDown,
          forceFocusOutWhenTabGuardsAreEmpty,
          focusInnerElement: (fromBottom) => gridCtrl.focusInnerElement(fromBottom),
          isEmpty
        })
      );
    }
  }, []);
  const setTopRef = useCallback13(
    (e) => {
      topTabGuardRef.current = e;
      setupCtrl();
    },
    [setupCtrl]
  );
  const setBottomRef = useCallback13(
    (e) => {
      bottomTabGuardRef.current = e;
      setupCtrl();
    },
    [setupCtrl]
  );
  const createTabGuard = (side) => {
    const className = side === "top" ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;
    return /* @__PURE__ */ React18.createElement(
      "div",
      {
        className: `${TabGuardClassNames.TAB_GUARD} ${className}`,
        role: "presentation",
        ref: side === "top" ? setTopRef : setBottomRef
      }
    );
  };
  return /* @__PURE__ */ React18.createElement(React18.Fragment, null, createTabGuard("top"), children, createTabGuard("bottom"));
};
var TabGuardComp = forwardRef2(TabGuardCompRef);
var tabGuardComp_default = memo13(TabGuardComp);

// packages/ag-grid-react/src/reactUi/gridComp.tsx
var GridComp = ({ context }) => {
  const [layoutClass, setLayoutClass] = useState15("");
  const [cursor, setCursor] = useState15(null);
  const [userSelect, setUserSelect] = useState15(null);
  const [initialised, setInitialised] = useState15(false);
  const [tabGuardReady, setTabGuardReady] = useState15();
  const gridCtrlRef = useRef17();
  const eRootWrapperRef = useRef17(null);
  const ariaDescriptionRef = useRef17(null);
  const tabGuardRef = useRef17();
  const [eGridBodyParent, setGridBodyParent] = useState15(null);
  const focusInnerElementRef = useRef17(() => void 0);
  const paginationCompRef = useRef17();
  const focusableContainersRef = useRef17([]);
  const onTabKeyDown = useCallback14(() => void 0, []);
  reactComment_default(" AG Grid ", eRootWrapperRef);
  const setRef2 = useCallback14((eRef) => {
    eRootWrapperRef.current = eRef;
    gridCtrlRef.current = eRef ? context.createBean(new GridCtrl()) : context.destroyBean(gridCtrlRef.current);
    if (!eRef || context.isDestroyed()) {
      return;
    }
    const gridCtrl = gridCtrlRef.current;
    focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);
    const compProxy = {
      destroyGridUi: () => {
      },
      // do nothing, as framework users destroy grid by removing the comp
      forceFocusOutOfContainer: (up) => {
        if (!up && paginationCompRef.current?.isDisplayed()) {
          paginationCompRef.current.forceFocusOutOfContainer(up);
          return;
        }
        tabGuardRef.current?.forceFocusOutOfContainer(up);
      },
      focusNextElementOutsideContainer: (up, eExcludeContainers) => {
        const eRootWrapper = eRootWrapperRef.current;
        return eRootWrapper ? tabGuardRef.current?.focusNextElementOutsideContainer(up, [
          eRootWrapper,
          ...eExcludeContainers
        ]) ?? false : false;
      },
      updateLayoutClasses: setLayoutClass,
      getFocusableContainers: () => {
        const beforeGridBody = [];
        const afterGridBody = [];
        const gridBodyCompEl = eRootWrapperRef.current?.querySelector(".ag-root");
        for (const comp of focusableContainersRef.current) {
          if (!comp.isDisplayed()) {
            continue;
          }
          const name = comp.getFocusableContainerName();
          if (name === "toolbar" || name === "rowGroupToolbar" || name === "pivotToolbar") {
            beforeGridBody.push(comp);
            continue;
          }
          afterGridBody.push(comp);
        }
        const comps = [...beforeGridBody];
        if (gridBodyCompEl) {
          comps.push({
            getGui: () => gridBodyCompEl,
            getFocusableContainerName: () => "gridBody"
          });
        }
        comps.push(...afterGridBody);
        return comps;
      },
      setCursor,
      setUserSelect
    };
    gridCtrl.setComp(compProxy, eRef, ariaDescriptionRef.current);
    setInitialised(true);
  }, []);
  useEffect11(() => {
    const gridCtrl = gridCtrlRef.current;
    const eRootWrapper = eRootWrapperRef.current;
    if (!tabGuardReady || !gridCtrl || !eGridBodyParent || !eRootWrapper || context.isDestroyed()) {
      return;
    }
    const beansToDestroy = [];
    focusableContainersRef.current = [];
    paginationCompRef.current = void 0;
    const {
      watermarkSelector,
      paginationSelector,
      sideBarSelector,
      statusBarSelector,
      toolbarSelector,
      gridHeaderDropZonesSelector
    } = gridCtrl.getOptionalSelectors();
    const additionalEls = [];
    const addComponentToDom = (component, position = "beforeend") => {
      const comp = context.createBean(new component());
      const eGui = comp.getGui();
      eRootWrapper.insertAdjacentElement(position, eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(comp);
      return comp;
    };
    if (toolbarSelector) {
      const toolbarComp = addComponentToDom(toolbarSelector.component, "afterbegin");
      focusableContainersRef.current.push(toolbarComp);
    }
    if (gridHeaderDropZonesSelector) {
      const headerDropZonesComp = context.createBean(
        new gridHeaderDropZonesSelector.component()
      );
      const eGui = headerDropZonesComp.getGui();
      const toolbar = eRootWrapper.querySelector(".ag-toolbar");
      if (toolbar) {
        toolbar.after(eGui);
      } else {
        eRootWrapper.prepend(eGui);
      }
      additionalEls.push(eGui);
      beansToDestroy.push(headerDropZonesComp);
      focusableContainersRef.current.push(...headerDropZonesComp.getFocusableContainers?.() ?? []);
    }
    if (sideBarSelector) {
      const sideBarComp = context.createBean(new sideBarSelector.component());
      const eGui = sideBarComp.getGui();
      const bottomTabGuard = eGridBodyParent.querySelector(".ag-tab-guard-bottom");
      if (bottomTabGuard) {
        bottomTabGuard.insertAdjacentElement("beforebegin", eGui);
        additionalEls.push(eGui);
      }
      beansToDestroy.push(sideBarComp);
      focusableContainersRef.current.push(sideBarComp);
    }
    if (statusBarSelector) {
      const statusBarComp = addComponentToDom(statusBarSelector.component);
      focusableContainersRef.current.push(statusBarComp);
    }
    if (paginationSelector) {
      const paginationComp = addComponentToDom(paginationSelector.component);
      paginationCompRef.current = paginationComp;
      focusableContainersRef.current.push(paginationComp);
    }
    if (watermarkSelector) {
      addComponentToDom(watermarkSelector.component);
    }
    return () => {
      context.destroyBeans(beansToDestroy);
      focusableContainersRef.current = [];
      paginationCompRef.current = void 0;
      for (const el of additionalEls) {
        el.remove();
      }
    };
  }, [tabGuardReady, eGridBodyParent, context]);
  const rootWrapperClasses = useMemo11(() => classesList("ag-root-wrapper", layoutClass), [layoutClass]);
  const rootWrapperBodyClasses = useMemo11(
    () => classesList("ag-root-wrapper-body", "ag-focus-managed", layoutClass),
    [layoutClass]
  );
  const topStyle = useMemo11(
    () => ({
      userSelect: userSelect != null ? userSelect : "",
      WebkitUserSelect: userSelect != null ? userSelect : "",
      cursor: cursor != null ? cursor : ""
    }),
    [userSelect, cursor]
  );
  const setTabGuardCompRef = useCallback14((ref) => {
    tabGuardRef.current = ref;
    setTabGuardReady(ref !== null);
  }, []);
  const isFocusable = useCallback14(() => !gridCtrlRef.current?.isFocusable(), []);
  return /* @__PURE__ */ React19.createElement("div", { ref: setRef2, className: rootWrapperClasses, style: topStyle, role: "presentation" }, /* @__PURE__ */ React19.createElement("div", { className: "ag-aria-description-container", ref: ariaDescriptionRef }), /* @__PURE__ */ React19.createElement("div", { className: rootWrapperBodyClasses, ref: setGridBodyParent, role: "presentation" }, initialised && eGridBodyParent && !context.isDestroyed() && /* @__PURE__ */ React19.createElement(BeansContext.Provider, { value: context.getBeans() }, /* @__PURE__ */ React19.createElement(
    tabGuardComp_default,
    {
      ref: setTabGuardCompRef,
      eFocusableElement: eGridBodyParent,
      onTabKeyDown,
      gridCtrl: gridCtrlRef.current,
      forceFocusOutWhenTabGuardsAreEmpty: true,
      isEmpty: isFocusable
    },
    // we wait for initialised before rending the children, so GridComp has created and registered with it's
    // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
    // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
    // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
    // hangs the UI)
    /* @__PURE__ */ React19.createElement(gridBodyComp_default, null)
  ))));
};
var gridComp_default = memo14(GridComp);

// packages/ag-grid-react/src/reactUi/renderStatusService.tsx
import { BeanStub } from "ag-grid-community";
var RenderStatusService = class extends __agSuperclass_BeanStub {
  postConstruct() {
    if (this.beans.colAutosize) {
      const queueResizeOperationsForTick = this.queueResizeOperationsForTick.bind(this);
      this.addManagedEventListeners({
        rowExpansionStateChanged: queueResizeOperationsForTick,
        expandOrCollapseAll: queueResizeOperationsForTick,
        // Enable devs to resize after they updated via the API
        cellValueChanged: queueResizeOperationsForTick,
        rowNodeDataChanged: queueResizeOperationsForTick,
        rowDataUpdated: queueResizeOperationsForTick
      });
    }
  }
  queueResizeOperationsForTick() {
    const colAutosize = this.beans.colAutosize;
    colAutosize.shouldQueueResizeOperations = true;
    setTimeout(() => {
      colAutosize.processResizeOperations();
    }, 0);
  }
  areHeaderCellsRendered() {
    return this.beans.ctrlsSvc.getHeaderRowContainerCtrl()?.getAllCtrls().every((ctrl) => ctrl.areCellsRendered()) ?? true;
  }
  areCellsRendered() {
    return this.beans.rowRenderer.getAllRowCtrls().every((row) => row.isRowRendered() && row.getAllCellCtrls().every((cellCtrl) => !!cellCtrl.eGui));
  }
};

// packages/ag-grid-react/src/reactUi/agGridReactUi.tsx
var deprecatedProps = {
  setGridApi: void 0,
  maxComponentCreationTimeMs: void 0,
  children: void 0
};
var reactPropsNotGridOptions = {
  gridOptions: void 0,
  modules: void 0,
  containerStyle: void 0,
  className: void 0,
  passGridApi: void 0,
  hasAncestorStyledRoot: void 0,
  componentWrappingElement: void 0,
  ...deprecatedProps
};
var excludeReactCompProps = new Set(Object.keys(reactPropsNotGridOptions));
var deprecatedReactCompProps = new Set(Object.keys(deprecatedProps));
var AgGridReactUi = (props) => {
  const modulesFromContext = useContext16(ModulesContext);
  const licenseKeyFromContext = useContext16(LicenseContext);
  const usesAgGridProvider = modulesFromContext !== null;
  const apiRef = useRef18();
  const innermostRef = useRef18(null);
  const portalManager = useRef18(null);
  const destroyFuncs = useRef18([]);
  const whenReadyFuncs = useRef18([]);
  const prevProps = useRef18(props);
  const frameworkOverridesRef = useRef18();
  const gridIdRef = useRef18();
  const ready = useRef18(false);
  const [context, setContext] = useState16(void 0);
  const [, setPortalRefresher] = useState16(0);
  const setOutermostRef = useCallback15((outermost) => {
    if (!outermost) {
      ready.current = false;
      for (const f of destroyFuncs.current) {
        f();
      }
      destroyFuncs.current.length = 0;
      return;
    }
    const modules = [...props.modules ?? [], ...modulesFromContext ?? []];
    if (licenseKeyFromContext) {
      _findEnterpriseCoreModule(modules)?.setLicenseKey(licenseKeyFromContext);
    }
    if (!portalManager.current) {
      portalManager.current = new PortalManager(
        () => setPortalRefresher((prev) => prev + 1),
        props.componentWrappingElement,
        props.maxComponentCreationTimeMs
      );
      destroyFuncs.current.push(() => {
        portalManager.current?.destroy();
        portalManager.current = null;
      });
    }
    const mergedGridOps = _combineAttributesAndGridOptions(
      props.gridOptions,
      props,
      Object.keys(props).filter((key) => !excludeReactCompProps.has(key))
    );
    const processQueuedUpdates = () => {
      if (ready.current) {
        const getFn = () => frameworkOverridesRef.current?.shouldQueueUpdates() ? void 0 : whenReadyFuncs.current.shift();
        let fn = getFn();
        while (fn) {
          fn();
          fn = getFn();
        }
      }
    };
    const frameworkOverrides = new ReactFrameworkOverrides(processQueuedUpdates, usesAgGridProvider);
    frameworkOverridesRef.current = frameworkOverrides;
    const renderStatus = new RenderStatusService();
    const gridParams = {
      providedBeanInstances: {
        frameworkCompWrapper: new ReactFrameworkComponentWrapper(portalManager.current, mergedGridOps),
        renderStatus
      },
      modules,
      frameworkOverrides,
      hasAncestorStyledRoot: props.hasAncestorStyledRoot
    };
    const createUiCallback = (ctx) => {
      setContext(ctx);
      ctx.createBean(renderStatus);
      destroyFuncs.current.push(() => {
        ctx.destroy();
      });
      ctx.getBean("ctrlsSvc").whenReady(
        {
          addDestroyFunc: (func) => {
            destroyFuncs.current.push(func);
          }
        },
        () => {
          if (ctx.isDestroyed()) {
            return;
          }
          const api = apiRef.current;
          if (api) {
            props.passGridApi?.(api);
          }
        }
      );
    };
    const acceptChangesCallback = (context2) => {
      context2.getBean("ctrlsSvc").whenReady(
        {
          addDestroyFunc: (func) => {
            destroyFuncs.current.push(func);
          }
        },
        () => {
          for (const f of whenReadyFuncs.current) {
            f();
          }
          whenReadyFuncs.current.length = 0;
          ready.current = true;
        }
      );
    };
    const gridCoreCreator = new GridCoreCreator();
    mergedGridOps.gridId ?? (mergedGridOps.gridId = gridIdRef.current);
    apiRef.current = gridCoreCreator.create(
      outermost,
      innermostRef.current,
      mergedGridOps,
      createUiCallback,
      acceptChangesCallback,
      gridParams
    );
    destroyFuncs.current.push(() => {
      apiRef.current = void 0;
    });
    if (apiRef.current) {
      gridIdRef.current = apiRef.current.getGridId();
    }
  }, []);
  const style = useMemo12(() => {
    return {
      width: "100%",
      height: "100%",
      ...props.containerStyle || {}
    };
  }, [props.containerStyle]);
  const processWhenReady = useCallback15((func) => {
    if (ready.current && !frameworkOverridesRef.current?.shouldQueueUpdates()) {
      func();
    } else {
      whenReadyFuncs.current.push(func);
    }
  }, []);
  useEffect12(() => {
    const changes = extractGridPropertyChanges(gridIdRef.current, prevProps.current, props);
    prevProps.current = props;
    processWhenReady(() => {
      if (apiRef.current) {
        _processOnChange(changes, apiRef.current);
      }
    });
  }, [props]);
  const renderMode = !React20.useSyncExternalStore || _getGridOption(props, "renderingMode") === "legacy" ? "legacy" : "default";
  return /* @__PURE__ */ React20.createElement("div", { className: props.className, style, ref: setOutermostRef }, /* @__PURE__ */ React20.createElement("div", null, /* @__PURE__ */ React20.createElement("div", null, /* @__PURE__ */ React20.createElement("div", { ref: innermostRef }, /* @__PURE__ */ React20.createElement(RenderModeContext.Provider, { value: renderMode }, context && !context.isDestroyed() ? /* @__PURE__ */ React20.createElement(gridComp_default, { key: context.instanceId, context }) : null, portalManager.current?.getPortals() ?? null)))));
};
function extractGridPropertyChanges(gridId, prevProps, nextProps) {
  const changes = {};
  for (const propKey of Object.keys(nextProps)) {
    if (excludeReactCompProps.has(propKey)) {
      if (deprecatedReactCompProps.has(propKey)) {
        if (gridId) {
          _warnForGrid2(gridId, 274, { prop: propKey });
        } else {
          _warnWithoutAttribution(274, { prop: propKey });
        }
      }
      continue;
    }
    const propValue = nextProps[propKey];
    if (prevProps[propKey] !== propValue) {
      changes[propKey] = propValue;
    }
  }
  return changes;
}
var ReactFrameworkComponentWrapper = class extends __agSuperclass_BaseComponentWrapper {
  constructor(parent, gridOptions) {
    super();
    this.parent = parent;
    this.gridOptions = gridOptions;
  }
  createWrapper(UserReactComponent, componentType) {
    const gridOptions = this.gridOptions;
    const reactiveCustomComponents = _getGridOption(gridOptions, "reactiveCustomComponents");
    if (reactiveCustomComponents) {
      const getComponentClass = (propertyName) => {
        switch (propertyName) {
          case "filter":
            return _getGridOption(gridOptions, "enableFilterHandlers") ? FilterDisplayComponentWrapper : FilterComponentWrapper;
          case "floatingFilterComponent":
            return _getGridOption(gridOptions, "enableFilterHandlers") ? FloatingFilterDisplayComponentWrapper : FloatingFilterComponentWrapper;
          case "dateComponent":
            return DateComponentWrapper;
          case "dragAndDropImageComponent":
            return DragAndDropImageComponentWrapper;
          case "loadingOverlayComponent":
          case "noRowsOverlayComponent":
          case "overlayComponent":
          case "activeOverlay":
            return CustomOverlayComponentWrapper;
          case "statusPanel":
            return StatusPanelComponentWrapper;
          case "toolPanel":
            return ToolPanelComponentWrapper;
          case "menuItem":
            return MenuItemComponentWrapper;
          case "cellRenderer":
            return CellRendererComponentWrapper;
          case "columnLabelRenderer":
            return ColumnSelectionLabelRendererComponentWrapper;
          case "innerHeaderComponent":
            return InnerHeaderComponentWrapper;
        }
      };
      const ComponentClass = getComponentClass(componentType.name);
      if (ComponentClass) {
        return new ComponentClass(UserReactComponent, this.parent, componentType);
      }
    } else {
      switch (componentType.name) {
        case "filter":
        case "floatingFilterComponent":
        case "dateComponent":
        case "dragAndDropImageComponent":
        case "loadingOverlayComponent":
        case "noRowsOverlayComponent":
        case "overlayComponent":
        case "activeOverlay":
        case "statusPanel":
        case "toolPanel":
        case "menuItem":
        case "cellRenderer":
        case "columnLabelRenderer":
          warnReactiveCustomComponents(this.gridId);
          break;
      }
    }
    const suppressFallbackMethods = !componentType.supportsJsFunction && componentType.name !== "toolPanel";
    return new ReactComponent(UserReactComponent, this.parent, componentType, suppressFallbackMethods);
  }
};
var DetailCellRenderer = forwardRef3((props, ref) => {
  const beans = useContext16(BeansContext);
  const { registry, context, gos, rowModel } = beans;
  const [cssClasses, setCssClasses] = useState16(() => new CssClasses());
  const [gridCssClasses, setGridCssClasses] = useState16(() => new CssClasses());
  const [detailGridOptions, setDetailGridOptions] = useState16();
  const [detailRowData, setDetailRowData] = useState16();
  const ctrlRef = useRef18();
  const eGuiRef = useRef18(null);
  const resizeObserverDestroyFunc = useRef18();
  const parentModules = useMemo12(
    () => _getGridRegisteredModules(props.api.getGridId(), detailGridOptions?.rowModelType ?? "clientSide"),
    [props]
  );
  const topClassName = useMemo12(() => cssClasses.toString() + " ag-details-row", [cssClasses]);
  const gridClassName = useMemo12(() => gridCssClasses.toString() + " ag-details-grid", [gridCssClasses]);
  if (ref) {
    useImperativeHandle3(ref, () => ({
      refresh() {
        return ctrlRef.current?.refresh() ?? false;
      }
    }));
  }
  if (props.template) {
    beans.log.warn(230);
  }
  const setRef2 = useCallback15((eRef) => {
    eGuiRef.current = eRef;
    if (!eRef || context.isDestroyed()) {
      ctrlRef.current = context.destroyBean(ctrlRef.current);
      resizeObserverDestroyFunc.current?.();
      return;
    }
    const compProxy = {
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      toggleDetailGridCss: (name, on) => setGridCssClasses((prev) => prev.setClass(name, on)),
      setDetailGrid: (gridOptions) => setDetailGridOptions(gridOptions),
      setRowData: (rowData) => setDetailRowData(rowData),
      getGui: () => eGuiRef.current
    };
    const ctrl = registry.createDynamicBean("detailCellRendererCtrl", true);
    if (!ctrl) {
      return;
    }
    context.createBean(ctrl);
    ctrl.init(compProxy, props);
    ctrlRef.current = ctrl;
    if (gos.get("detailRowAutoHeight")) {
      const checkRowSizeFunc = () => {
        if (eGuiRef.current == null) {
          return;
        }
        const clientHeight = eGuiRef.current.clientHeight;
        if (clientHeight != null && clientHeight > 0) {
          const updateRowHeightFunc = () => {
            props.node.setRowHeight(clientHeight);
            if (_isClientSideRowModel(gos, rowModel) || _isServerSideRowModel(gos, rowModel)) {
              rowModel.onRowHeightChanged();
            }
          };
          setTimeout(updateRowHeightFunc, 0);
        }
      };
      resizeObserverDestroyFunc.current = _observeResize(beans, eRef, checkRowSizeFunc);
      checkRowSizeFunc();
    }
  }, []);
  const registerGridApi = useCallback15((api) => {
    ctrlRef.current?.registerDetailWithMaster(api);
  }, []);
  return /* @__PURE__ */ React20.createElement("div", { className: topClassName, ref: setRef2 }, detailGridOptions && /* @__PURE__ */ React20.createElement(
    AgGridReactUi,
    {
      className: gridClassName,
      ...detailGridOptions,
      modules: parentModules,
      rowData: detailRowData,
      passGridApi: registerGridApi,
      hasAncestorStyledRoot: true
    }
  ));
});
var ReactFrameworkOverrides = class extends __agSuperclass_VanillaFrameworkOverrides {
  constructor(processQueuedUpdates, usesAgGridProvider) {
    super("react");
    this.processQueuedUpdates = processQueuedUpdates;
    this.usesAgGridProvider = usesAgGridProvider;
    this.queueUpdates = false;
    this.renderingEngine = "react";
    this.frameworkComponents = {
      agGroupCellRenderer: groupCellRenderer_default,
      agGroupRowRenderer: groupCellRenderer_default,
      agDetailCellRenderer: DetailCellRenderer
    };
    this.wrapIncoming = (callback, source) => {
      if (source === "ensureVisible") {
        return runWithoutFlushSync(callback);
      }
      return callback();
    };
  }
  frameworkComponent(name) {
    return this.frameworkComponents[name];
  }
  isFrameworkComponent(comp) {
    if (!comp) {
      return false;
    }
    const prototype = comp.prototype;
    const isJsComp = prototype && "getGui" in prototype;
    return !isJsComp;
  }
  getLockOnRefresh() {
    this.queueUpdates = true;
  }
  releaseLockOnRefresh() {
    this.queueUpdates = false;
    this.processQueuedUpdates();
  }
  shouldQueueUpdates() {
    return this.queueUpdates;
  }
  runWhenReadyAsync() {
    return isReact19();
  }
};

// packages/ag-grid-react/src/agGridReact.tsx
var AgGridReact = class extends Component {
  constructor() {
    super(...arguments);
    this.apiListeners = [];
    this.setGridApi = (api) => {
      this.api = api;
      for (const listener of this.apiListeners) {
        listener(api);
      }
    };
  }
  registerApiListener(listener) {
    this.apiListeners.push(listener);
  }
  componentWillUnmount() {
    this.apiListeners.length = 0;
  }
  render() {
    return /* @__PURE__ */ React21.createElement(AgGridReactUi, { ...this.props, passGridApi: this.setGridApi });
  }
};

// packages/ag-grid-react/src/shared/customComp/interfaces.ts
import { useContext as useContext17 } from "react";
function useGridCustomComponent(methods) {
  const { setMethods } = useContext17(CustomContext);
  setMethods(methods);
}
function useGridCellEditor(callbacks) {
  useGridCustomComponent(callbacks);
}
function useGridDate(callbacks) {
  return useGridCustomComponent(callbacks);
}
function useGridFilter(callbacks) {
  return useGridCustomComponent(callbacks);
}
function useGridFilterDisplay(callbacks) {
  return useGridCustomComponent(callbacks);
}
function useGridFloatingFilter(callbacks) {
  useGridCustomComponent(callbacks);
}
function useGridMenuItem(callbacks) {
  useGridCustomComponent(callbacks);
}
export {
  AgGridProvider,
  AgGridReact,
  CustomContext as CustomComponentContext,
  getInstance,
  useGridCellEditor,
  useGridDate,
  useGridFilter,
  useGridFilterDisplay,
  useGridFloatingFilter,
  useGridMenuItem,
  warnReactiveCustomComponents
};
//# sourceMappingURL=index.esm.mjs.map
