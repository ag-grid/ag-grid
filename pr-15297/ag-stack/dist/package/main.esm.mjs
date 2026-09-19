// packages/ag-stack/src/constants/keyCode.ts
var KeyCode = {
  BACKSPACE: "Backspace",
  TAB: "Tab",
  ENTER: "Enter",
  ESCAPE: "Escape",
  SPACE: " ",
  LEFT: "ArrowLeft",
  UP: "ArrowUp",
  RIGHT: "ArrowRight",
  DOWN: "ArrowDown",
  DELETE: "Delete",
  F2: "F2",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
  PAGE_HOME: "Home",
  PAGE_END: "End",
  // these should be used with `event.code` instead of `event.key`
  // as `event.key` changes when non-latin keyboards are used
  A: "KeyA",
  C: "KeyC",
  D: "KeyD",
  V: "KeyV",
  X: "KeyX",
  Y: "KeyY",
  Z: "KeyZ"
};
var A_KEYCODE = 65;
var C_KEYCODE = 67;
var V_KEYCODE = 86;
var D_KEYCODE = 68;
var Z_KEYCODE = 90;
var Y_KEYCODE = 89;
function _normaliseQwertyAzerty(keyboardEvent) {
  const { keyCode } = keyboardEvent;
  let code;
  switch (keyCode) {
    case A_KEYCODE:
      code = KeyCode.A;
      break;
    case C_KEYCODE:
      code = KeyCode.C;
      break;
    case V_KEYCODE:
      code = KeyCode.V;
      break;
    case D_KEYCODE:
      code = KeyCode.D;
      break;
    case Z_KEYCODE:
      code = KeyCode.Z;
      break;
    case Y_KEYCODE:
      code = KeyCode.Y;
      break;
    default:
      code = keyboardEvent.code;
  }
  return code;
}

// packages/ag-stack/src/version.ts
var VERSION = "36.2.0-beta.20260917.132";

// packages/ag-stack/src/theming/shared/shared.css
var shared_default = ':where([class^=ag-]),:where([class^=ag-]):after,:where([class^=ag-]):before{box-sizing:border-box}:where([class^=ag-]):where(button){color:inherit}:where([class^=ag-]):where(input:not([type]),input[type=text],input[type=number],input[type=tel],input[type=date],input[type=datetime-local],textarea){font-family:inherit;font-size:inherit;line-height:inherit;padding:0}:where([class^=ag-]):where(div,span,label):focus-visible{box-shadow:inset var(--ag-focus-shadow);outline:none;&:where(.invalid){box-shadow:inset var(--ag-focus-error-shadow)}}:where([class^=ag-]) ::-ms-clear{display:none}.ag-hidden{display:none!important}.ag-invisible{visibility:hidden!important}.ag-tab-guard{display:block;height:0;position:absolute;width:0}.ag-tab-guard-top{top:1px}.ag-tab-guard-bottom{bottom:1px}.ag-measurement-container{height:0;overflow:hidden;visibility:hidden;width:0}.ag-measurement-element-border{display:inline-block}.ag-measurement-element-border:before{border-left:var(--ag-internal-measurement-border);content:"";display:block}.ag-aria-description-container{border:0;clip-path:inset(50%);height:1px;overflow:hidden;padding:0;position:absolute;white-space:nowrap;width:1px;z-index:9999}.ag-popup{background-color:var(--ag-wrapper-background-color)}.ag-popup-child{max-width:min(100%,calc(100vw - 30px));top:0;z-index:5}.ag-popup-child:where(:not(.ag-tooltip-custom)){box-shadow:var(--ag-popup-shadow)}.ag-input-wrapper,.ag-picker-field-wrapper{align-items:center;display:flex;flex:1 1 auto;line-height:normal;position:relative}.ag-input-field{align-items:center;display:flex;flex-direction:row}.ag-input-field-input:where(:not([type=checkbox],[type=radio])){flex:1 1 auto;min-width:0;width:100%}.ag-styled-root{cursor:default;display:contents;line-height:normal;white-space:normal;-webkit-font-smoothing:antialiased;color:var(--ag-text-color);color-scheme:var(--ag-browser-color-scheme);font-family:var(--ag-font-family);font-size:var(--ag-font-size);font-weight:var(--ag-font-weight);--ag-indentation-level:0}:where(.ag-toolbar) .ag-react-container:where(:not(.ag-react-wrapper-block)){display:contents}:where(.ag-icon):before{align-items:center;background-color:currentcolor;color:inherit;content:"";display:flex;font-family:inherit;font-size:var(--ag-icon-size);font-style:normal;font-variant:normal;height:var(--ag-icon-size);justify-content:center;line-height:var(--ag-icon-size);-webkit-mask-size:contain;mask-size:contain;text-transform:none;width:var(--ag-icon-size)}.ag-icon{background-position:50%;background-repeat:no-repeat;background-size:contain;color:var(--ag-icon-color);display:block;height:var(--ag-icon-size);position:relative;-webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-user-select:none;-moz-user-select:none;user-select:none;width:var(--ag-icon-size)}.ag-disabled .ag-icon,[disabled] .ag-icon{opacity:.5}.ag-icon-grip.ag-disabled,.ag-icon-grip[disabled]{opacity:.35}.ag-icon-loading{animation-duration:1s;animation-iteration-count:infinite;animation-name:spin;animation-timing-function:linear}@keyframes spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.ag-resizer{pointer-events:none;position:absolute;-webkit-user-select:none;-moz-user-select:none;user-select:none;z-index:1}:where(.ag-resizer){&.ag-resizer-topLeft{cursor:nwse-resize;height:5px;left:0;top:0;width:5px}&.ag-resizer-top{cursor:ns-resize;height:5px;left:5px;right:5px;top:0}&.ag-resizer-topRight{cursor:nesw-resize;height:5px;right:0;top:0;width:5px}&.ag-resizer-right{bottom:5px;cursor:ew-resize;right:0;top:5px;width:5px}&.ag-resizer-bottomRight{bottom:0;cursor:nwse-resize;height:5px;right:0;width:5px}&.ag-resizer-bottom{bottom:0;cursor:ns-resize;height:5px;left:5px;right:5px}&.ag-resizer-bottomLeft{bottom:0;cursor:nesw-resize;height:5px;left:0;width:5px}&.ag-resizer-left{bottom:5px;cursor:ew-resize;left:0;top:5px;width:5px}}.ag-menu{background-color:var(--ag-menu-background-color);border:var(--ag-menu-border);border-radius:var(--ag-border-radius);box-shadow:var(--ag-menu-shadow);color:var(--ag-menu-text-color);max-height:100%;overflow-y:auto;position:absolute;-webkit-user-select:none;-moz-user-select:none;user-select:none}';

// packages/ag-stack/src/theming/inject.ts
var IS_SSR = typeof window !== "object" || !window?.document?.fonts?.forEach;
var FORCE_LEGACY_THEMES = false;
var styleInjectionForcedForTesting = false;
var _setStyleInjectionEnabledForTesting = (enabled) => {
  styleInjectionForcedForTesting = enabled;
};
var _isStyleInjectionDisabled = () => IS_SSR && !styleInjectionForcedForTesting || FORCE_LEGACY_THEMES;
var _injectGlobalCSS = (rawCss, styleContainer, debugId, layer, priority, nonce, isParams = false) => {
  if (_isStyleInjectionDisabled()) {
    return;
  }
  let injectedCss = rawCss;
  if (layer) {
    injectedCss = `@layer ${CSS.escape(layer).replaceAll("\\.", ".")} { ${rawCss} }`;
  }
  let injections = injectionState.map.get(styleContainer);
  if (!injections) {
    injections = [];
    injectionState.map.set(styleContainer, injections);
  }
  if (injections.some((i) => i.injectedCss === injectedCss)) {
    return;
  }
  const el = document.createElement("style");
  if (nonce) {
    el.setAttribute("nonce", nonce);
  }
  el.dataset.agCss = debugId;
  el.dataset.agCssVersion = VERSION;
  el.textContent = injectedCss;
  const newInjection = { rawCss, injectedCss, el, priority, isParams };
  let insertAfter;
  for (const injection of injections) {
    if (injection.priority > priority) {
      break;
    }
    insertAfter = injection;
  }
  if (insertAfter) {
    insertAfter.el.after(el);
    const index = injections.indexOf(insertAfter);
    injections.splice(index + 1, 0, newInjection);
  } else {
    if (styleContainer.nodeName === "STYLE") {
      styleContainer.after(el);
    } else {
      styleContainer.insertBefore(el, styleContainer.querySelector(":not(title, meta)"));
    }
    injections.push(newInjection);
  }
};
var _injectCoreAndModuleCSS = (styleContainer, layer, nonce, moduleCss) => {
  _injectGlobalCSS(shared_default, styleContainer, "shared", layer, 0, nonce);
  moduleCss?.forEach(
    (css, debugId) => css.forEach((singleCss) => _injectGlobalCSS(singleCss, styleContainer, debugId, layer, 0, nonce))
  );
};
var _useParamsCss = (environment, paramsCss, paramsDebugId, styleContainer, layer, nonce) => {
  if (_isStyleInjectionDisabled()) {
    return;
  }
  const gridState = injectionState.grids.get(environment);
  if (!gridState) {
    injectionState.grids.set(environment, { styleContainer, paramsCss });
  } else {
    gridState.paramsCss = paramsCss;
  }
  removeStaleParamsCss(styleContainer);
  if (paramsCss && paramsDebugId) {
    _injectGlobalCSS(paramsCss, styleContainer, paramsDebugId, layer, 2, nonce, true);
  }
};
var _unregisterInstanceUsingThemingAPI = (environment) => {
  const styleContainer = injectionState.grids.get(environment)?.styleContainer;
  if (!styleContainer) {
    return;
  }
  injectionState.grids.delete(environment);
  const containerStillInUse = Array.from(injectionState.grids.values()).some(
    (gs) => gs.styleContainer === styleContainer
  );
  if (containerStillInUse) {
    removeStaleParamsCss(styleContainer);
  } else {
    removeStaleParamsCss(styleContainer, true);
    injectionState.map.delete(styleContainer);
  }
};
var removeStaleParamsCss = (styleContainer, deleteAll = false) => {
  const neededCss = /* @__PURE__ */ new Set();
  for (const gs of injectionState.grids.values()) {
    if (gs.styleContainer === styleContainer) {
      neededCss.add(gs.paramsCss);
    }
  }
  const injections = injectionState.map.get(styleContainer) ?? [];
  for (let i = injections.length - 1; i >= 0; i--) {
    if (deleteAll || injections[i].isParams && !neededCss.has(injections[i].rawCss)) {
      injections[i].el.remove();
      injections.splice(i, 1);
    }
  }
};
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

// packages/ag-stack/src/theming/partImpl.ts
var createPart = (args) => {
  return /* @__PURE__ */ new PartImpl(args);
};
var defaultModeName = "$default";
var partCounter = 0;
var PartImpl = class {
  constructor({ feature, params, modeParams = {}, css, cssImports }) {
    this.feature = feature;
    this.css = css;
    this.cssImports = cssImports;
    this.modeParams = {
      // NOTE: it's important that default is defined first, putting it
      // first in iteration order, because when merging params the default
      // params override any prior modal params, so modal params in this
      // part need to come after default params to prevent them from being
      // immediately overridden.
      [defaultModeName]: {
        ...modeParams[defaultModeName] ?? {},
        ...params ?? {}
      },
      ...modeParams
    };
  }
  use(styleContainer, layer, nonce) {
    let inject = this._inject;
    if (inject == null) {
      let { css } = this;
      if (css) {
        const className = `ag-theme-${this.feature ?? "part"}-${++partCounter}`;
        if (typeof css === "function") {
          css = css();
        }
        css = `:where(.${className}) {
${css}
}
`;
        for (const cssImport of this.cssImports ?? []) {
          css = `@import url(${JSON.stringify(cssImport)});
${css}`;
        }
        inject = { css, class: className };
      } else {
        inject = false;
      }
      this._inject = inject;
    }
    if (inject && styleContainer) {
      _injectGlobalCSS(inject.css, styleContainer, inject.class, layer, 1, nonce);
    }
    return inject ? inject.class : false;
  }
};

// packages/ag-stack/src/utils/promise.ts
function _isPromise(fn) {
  return typeof fn.then === "function";
}
function _wrapInterval(action, timeout) {
  return new AgPromise((resolve) => {
    resolve(window.setInterval(action, timeout));
  });
}
var AgPromise = class _AgPromise {
  constructor(callback) {
    this.status = 0 /* IN_PROGRESS */;
    this.resolution = null;
    this.waiters = [];
    callback(
      (value) => this.onDone(value),
      (params) => this.onReject(params)
    );
  }
  static all(promises) {
    return promises.length ? new _AgPromise((resolve) => {
      let remainingToResolve = promises.length;
      const combinedValues = new Array(remainingToResolve);
      promises.forEach((promise, index) => {
        promise.then((value) => {
          combinedValues[index] = value;
          remainingToResolve--;
          if (remainingToResolve === 0) {
            resolve(combinedValues);
          }
        });
      });
    }) : _AgPromise.resolve();
  }
  static resolve(value = null) {
    return new _AgPromise((resolve) => resolve(value));
  }
  then(func) {
    return new _AgPromise((resolve) => {
      if (this.status === 1 /* RESOLVED */) {
        resolve(func(this.resolution));
      } else {
        this.waiters.push((value) => resolve(func(value)));
      }
    });
  }
  onDone(value) {
    this.status = 1 /* RESOLVED */;
    this.resolution = value;
    for (const waiter of this.waiters) {
      waiter(value);
    }
  }
  onReject(_) {
  }
};

// packages/ag-stack/src/constants/direction.ts
var Direction = /* @__PURE__ */ ((Direction2) => {
  Direction2[Direction2["Vertical"] = 0] = "Vertical";
  Direction2[Direction2["Horizontal"] = 1] = "Horizontal";
  return Direction2;
})(Direction || {});

// packages/ag-stack/src/events/localEventService.ts
var LocalEventService = class {
  constructor() {
    this.allSyncListeners = /* @__PURE__ */ new Map();
    this.allAsyncListeners = /* @__PURE__ */ new Map();
    this.globalSyncListeners = /* @__PURE__ */ new Set();
    this.globalAsyncListeners = /* @__PURE__ */ new Set();
    this.asyncFunctionsQueue = [];
    this.scheduled = false;
    // using an object performs better than a Set for the number of different events we have
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

// packages/ag-stack/src/utils/array.ts
function _last(arr) {
  const len = arr?.length;
  return len ? arr[len - 1] : void 0;
}
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
function _reuseArrayIfEqual(prev, current) {
  if (!current) {
    return [];
  }
  const len = current.length;
  if (prev && prev !== current && prev.length === len) {
    for (let i = 0; i < len; ++i) {
      if (prev[i] !== current[i]) {
        return current.slice();
      }
    }
    return prev;
  }
  return current.slice();
}
function _removeFromArray(array, object) {
  const index = array.indexOf(object);
  if (index >= 0) {
    array.splice(index, 1);
  }
}
function _removeAllFromArray(array, elementsToRemove) {
  const len = array.length;
  const removeLen = elementsToRemove.length;
  if (!len || !removeLen) {
    return;
  }
  let j = 0;
  const removeSet = new Set(elementsToRemove);
  for (let i = 0; i < len; ++i) {
    const value = array[i];
    if (!removeSet.has(value)) {
      if (i !== j) {
        array[j] = value;
      }
      ++j;
    }
  }
  if (j < len) {
    array.length = j;
  }
}
function _moveInArray(array, objectsToMove, toIndex) {
  const objectsToMoveLen = objectsToMove.length;
  for (let i = 0; i < objectsToMoveLen; ++i) {
    _removeFromArray(array, objectsToMove[i]);
  }
  for (let i = objectsToMoveLen - 1; i >= 0; i--) {
    array.splice(toIndex, 0, objectsToMove[i]);
  }
}
function _flatten(arrays) {
  return [].concat.apply([], arrays);
}
function _symmetricDiff(a, b) {
  if (a === b) {
    return [];
  }
  const leftLen = a?.length;
  const rightLen = b?.length;
  if (!leftLen) {
    return b ? b.slice() : [];
  }
  if (!rightLen) {
    return a ? a.slice() : [];
  }
  const diff = new Set(a);
  for (let i = 0; i < rightLen; ++i) {
    const item = b[i];
    if (!diff.delete(item)) {
      diff.add(item);
    }
  }
  return Array.from(diff);
}
function _pushToMapArray(map, key, value) {
  const bucket = map.get(key);
  if (bucket === void 0) {
    map.set(key, [value]);
    return;
  }
  bucket.push(value);
}
function _indexMap(arr) {
  const map = /* @__PURE__ */ new Map();
  if (arr) {
    for (let i = 0, len = arr.length; i < len; ++i) {
      map.set(arr[i], i);
    }
  }
  return map;
}

// packages/ag-stack/src/utils/aria.ts
function _toggleAriaAttribute(element, attribute, value) {
  if (value == null || typeof value === "string" && value == "") {
    _removeAriaAttribute(element, attribute);
  } else {
    _setAriaAttribute(element, attribute, value);
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
function _getAriaPosInSet(element) {
  return Number.parseInt(element.getAttribute("aria-posinset"), 10);
}
function _getAriaLabel(element) {
  return element.getAttribute("aria-label");
}
function _setAriaLabel(element, label) {
  _toggleAriaAttribute(element, "label", label);
}
function _setAriaLabelledBy(element, labelledBy) {
  _toggleAriaAttribute(element, "labelledby", labelledBy);
}
function _setAriaDescribedBy(element, describedby) {
  _toggleAriaAttribute(element, "describedby", describedby);
}
function _setAriaLive(element, live) {
  _toggleAriaAttribute(element, "live", live);
}
function _setAriaAtomic(element, atomic) {
  _toggleAriaAttribute(element, "atomic", atomic);
}
function _setAriaRelevant(element, relevant) {
  _toggleAriaAttribute(element, "relevant", relevant);
}
function _setAriaInvalid(element, invalid) {
  _toggleAriaAttribute(element, "invalid", invalid);
}
function _setAriaLevel(element, level) {
  _toggleAriaAttribute(element, "level", level);
}
function _setAriaDisabled(element, disabled) {
  _toggleAriaAttribute(element, "disabled", disabled);
}
function _setAriaHidden(element, hidden) {
  _toggleAriaAttribute(element, "hidden", hidden);
}
function _setAriaActiveDescendant(element, descendantId) {
  _toggleAriaAttribute(element, "activedescendant", descendantId);
}
function _setAriaAutoComplete(element, autoComplete) {
  _setAriaAttribute(element, "autocomplete", autoComplete);
}
function _setAriaExpanded(element, expanded) {
  _setAriaAttribute(element, "expanded", expanded);
}
function _removeAriaExpanded(element) {
  _removeAriaAttribute(element, "expanded");
}
function _setAriaSetSize(element, setsize) {
  _setAriaAttribute(element, "setsize", setsize);
}
function _setAriaPosInSet(element, position) {
  _setAriaAttribute(element, "posinset", position);
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
function _setAriaRowSpan(element, spanCount) {
  _setAriaAttribute(element, "rowspan", spanCount);
}
function _setAriaColCount(element, colCount) {
  _setAriaAttribute(element, "colcount", colCount);
}
function _setAriaColIndex(element, colIndex) {
  _setAriaAttribute(element, "colindex", colIndex);
}
function _setAriaColSpan(element, colSpan) {
  _setAriaAttribute(element, "colspan", colSpan);
}
function _setAriaSort(element, sort) {
  _setAriaAttribute(element, "sort", sort);
}
function _removeAriaSort(element) {
  _removeAriaAttribute(element, "sort");
}
function _setAriaSelected(element, selected) {
  _toggleAriaAttribute(element, "selected", selected);
}
function _setAriaChecked(element, checked) {
  _setAriaAttribute(element, "checked", checked === void 0 ? "mixed" : checked);
}
function _setAriaControls(controllerElement, controlledId) {
  _toggleAriaAttribute(controllerElement, "controls", controlledId);
}
function _setAriaControlsAndLabel(controllerElement, controlledElement) {
  _setAriaControls(controllerElement, controlledElement.id);
  _setAriaLabelledBy(controlledElement, controllerElement.id);
}
function _setAriaOwns(ownerElement, ownedId) {
  _toggleAriaAttribute(ownerElement, "owns", ownedId);
}
function _setAriaHasPopup(element, hasPopup) {
  _toggleAriaAttribute(element, "haspopup", hasPopup === false ? null : hasPopup);
}
function _getAriaCheckboxStateName(translate, state) {
  return state === void 0 ? translate("ariaIndeterminate", "indeterminate") : state === true ? translate("ariaChecked", "checked") : translate("ariaUnchecked", "unchecked");
}
function _setAriaOrientation(element, orientation) {
  if (orientation) {
    _setAriaAttribute(element, "orientation", orientation);
  } else {
    _removeAriaAttribute(element, "orientation");
  }
}

// packages/ag-stack/src/utils/generic.ts
var hasOwnProperty = Object.prototype.hasOwnProperty;
function _hasOwn(obj, key) {
  return key !== "__proto__" && hasOwnProperty.call(obj, key);
}
function _getOwn(table, key) {
  return table != null && _hasOwn(table, key) ? table[key] : void 0;
}
var _makeNull = (value) => {
  if (value == null || value === "") {
    return null;
  }
  return value;
};
function _exists(value) {
  return value != null && value !== "";
}
function _missing(value) {
  return !_exists(value);
}
var _toStringOrNull = (value) => {
  return value != null && typeof value.toString === "function" ? value.toString() : null;
};
var _jsonEquals = (val1, val2) => {
  const val1Json = val1 ? JSON.stringify(val1) : null;
  const val2Json = val2 ? JSON.stringify(val2) : null;
  return val1Json === val2Json;
};
var _defaultComparator = (valueA, valueB, accentedCompare = false) => {
  if (typeof valueA === "object" && valueA !== null && typeof valueA.toNumber === "function") {
    valueA = valueA.toNumber();
  }
  if (typeof valueB === "object" && valueB !== null && typeof valueB.toNumber === "function") {
    valueB = valueB.toNumber();
  }
  if (valueA == null) {
    return valueB == null ? 0 : -1;
  }
  if (valueB == null) {
    return 1;
  }
  if (!accentedCompare || typeof valueA !== "string") {
    if (valueA > valueB) {
      return 1;
    }
    if (valueA < valueB) {
      return -1;
    }
    return 0;
  }
  return valueA.localeCompare(valueB);
};

// packages/ag-stack/src/utils/document.ts
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
function _isNothingFocused(beans) {
  const activeEl = _getActiveDomElement(beans);
  return activeEl === null || activeEl === _getDocument(beans).body;
}
function _getWindow(beans) {
  const eDocument = _getDocument(beans);
  return eDocument.defaultView || window;
}
function _getPageBody(beans) {
  let rootNode = null;
  let targetEl;
  try {
    rootNode = _getDocument(beans).fullscreenElement;
  } catch {
  } finally {
    if (!rootNode) {
      rootNode = _getRootNode(beans);
    }
    const body = rootNode.querySelector("body");
    if (body) {
      targetEl = body;
    } else if (rootNode instanceof ShadowRoot) {
      targetEl = rootNode;
    } else if (rootNode instanceof Document) {
      targetEl = rootNode?.documentElement;
    } else {
      targetEl = rootNode;
    }
  }
  return targetEl;
}
function _getBodyWidth(beans) {
  const body = _getPageBody(beans);
  return body?.clientWidth ?? (window.innerWidth || -1);
}
function _getBodyHeight(beans) {
  const body = _getPageBody(beans);
  return body?.clientHeight ?? (window.innerHeight || -1);
}

// packages/ag-stack/src/utils/dom.ts
function _radioCssClass(element, elementClass, otherElementClass) {
  const parent = element.parentElement;
  let sibling = parent && parent.firstChild;
  while (sibling) {
    if (elementClass) {
      sibling.classList.toggle(elementClass, sibling === element);
    }
    if (otherElementClass) {
      sibling.classList.toggle(otherElementClass, sibling !== element);
    }
    sibling = sibling.nextSibling;
  }
}
var FOCUSABLE_SELECTOR = "[tabindex], input, select, button, textarea, [href]";
var FOCUSABLE_EXCLUDE = "[disabled], .ag-disabled:not(.ag-button), .ag-disabled *, .ag-hidden, .ag-hidden *";
function _isFocusableFormField(element) {
  if (!element) {
    return false;
  }
  const isFocusable = element.matches("input, select, button, textarea");
  if (!isFocusable) {
    return false;
  }
  const isNotFocusable = element.matches(FOCUSABLE_EXCLUDE);
  if (isNotFocusable) {
    return false;
  }
  return _isVisible(element);
}
function _setDisplayed(element, displayed, options = {}) {
  const { skipAriaHidden } = options;
  element.classList.toggle("ag-hidden", !displayed);
  if (!skipAriaHidden) {
    _setAriaHidden(element, !displayed);
  }
}
function _setVisible(element, visible, options = {}) {
  const { skipAriaHidden } = options;
  element.classList.toggle("ag-invisible", !visible);
  if (!skipAriaHidden) {
    _setAriaHidden(element, !visible);
  }
}
function _setDisabled(element, disabled) {
  const attributeName = "disabled";
  const addOrRemoveDisabledAttribute = disabled ? (e) => e.setAttribute(attributeName, "") : (e) => e.removeAttribute(attributeName);
  addOrRemoveDisabledAttribute(element);
  const inputs = element.querySelectorAll("input") ?? [];
  for (const input of inputs) {
    addOrRemoveDisabledAttribute(input);
  }
}
function _isElementChildOfClass(element, cls, maxNest) {
  let counter = 0;
  while (element) {
    if (element.classList.contains(cls)) {
      return true;
    }
    element = element.parentElement;
    if (typeof maxNest == "number") {
      if (++counter > maxNest) {
        break;
      }
    } else if (element === maxNest) {
      break;
    }
  }
  return false;
}
var pf = (value) => Number.parseFloat(value) || 0;
function _getInnerHeight(el, style = window.getComputedStyle(el)) {
  const height = pf(style.height);
  if (style.boxSizing === "border-box") {
    return height - pf(style.paddingTop) - pf(style.paddingBottom) - pf(style.borderTopWidth) - pf(style.borderBottomWidth);
  }
  return height;
}
function _getInnerWidth(el, style = window.getComputedStyle(el)) {
  const width = pf(style.width);
  if (style.boxSizing === "border-box") {
    return width - pf(style.paddingLeft) - pf(style.paddingRight) - pf(style.borderLeftWidth) - pf(style.borderRightWidth);
  }
  return width;
}
function _getVerticalPaddingAndBorder(el) {
  const style = window.getComputedStyle(el);
  return pf(style.paddingTop) + pf(style.paddingBottom) + pf(style.borderTopWidth) + pf(style.borderBottomWidth);
}
function _getAbsoluteHeight(el) {
  const style = window.getComputedStyle(el);
  return Math.floor(pf(style.height) + pf(style.marginBottom) + pf(style.marginTop));
}
function _getAbsoluteWidth(el) {
  const style = window.getComputedStyle(el);
  return Math.floor(pf(style.width) + pf(style.marginLeft) + pf(style.marginRight));
}
function _getElementRectWithOffset(el) {
  const offsetElementRect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return {
    top: offsetElementRect.top + pf(style.borderTopWidth),
    left: offsetElementRect.left + pf(style.borderLeftWidth),
    right: offsetElementRect.right + pf(style.borderRightWidth),
    bottom: offsetElementRect.bottom + pf(style.borderBottomWidth)
  };
}
function _getScrollLeft(element, rtl) {
  let scrollLeft = element.scrollLeft;
  if (rtl) {
    scrollLeft = Math.abs(scrollLeft);
  }
  return scrollLeft;
}
function _setScrollLeft(element, value, rtl) {
  if (rtl) {
    value *= -1;
  }
  element.scrollLeft = value;
}
function _clearElement(el) {
  while (el?.firstChild) {
    el.firstChild.remove();
  }
}
function _removeFromParent(node) {
  if (node?.parentNode) {
    node.remove();
  }
}
function _isInDOM(element) {
  return !!element.offsetParent;
}
function _isVisible(element) {
  if (element.checkVisibility) {
    return element.checkVisibility({ checkVisibilityCSS: true });
  }
  const isHidden = !_isInDOM(element) || window.getComputedStyle(element).visibility !== "visible";
  return !isHidden;
}
function _loadTemplate(template) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = (template || "").trim();
  return tempDiv.firstChild;
}
function _ensureDomOrder(eContainer, eChild, eChildBefore) {
  if (eChildBefore?.nextSibling === eChild) {
    return;
  }
  if (!eContainer.firstChild) {
    eContainer.appendChild(eChild);
  } else if (eChildBefore) {
    if (eChildBefore.nextSibling) {
      eContainer.insertBefore(eChild, eChildBefore.nextSibling);
    } else {
      eContainer.appendChild(eChild);
    }
  } else if (eContainer.firstChild && eContainer.firstChild !== eChild) {
    eContainer.prepend(eChild);
  }
}
function _setDomChildOrder(eContainer, orderedChildren) {
  for (let i = 0; i < orderedChildren.length; i++) {
    const correctCellAtIndex = orderedChildren[i];
    const actualCellAtIndex = eContainer.children[i];
    if (actualCellAtIndex !== correctCellAtIndex) {
      eContainer.insertBefore(correctCellAtIndex, actualCellAtIndex);
    }
  }
}
function _camelCaseToHyphenated(camelCase) {
  return camelCase.replace(/[A-Z]/g, (s) => `-${s.toLocaleLowerCase()}`);
}
function _addStylesToElement(eElement, styles) {
  if (!styles) {
    return;
  }
  for (const key of Object.keys(styles)) {
    const value = styles[key];
    if (!key?.length || value == null) {
      continue;
    }
    const parsedKey = _camelCaseToHyphenated(key);
    const valueAsString = value.toString();
    const parsedValue = valueAsString.replace(/\s*!important/g, "");
    const priority = parsedValue.length != valueAsString.length ? "important" : void 0;
    eElement.style.setProperty(parsedKey, parsedValue, priority);
  }
}
function _isElementOverflowingCallback(getElement) {
  return () => {
    const element = getElement();
    if (!element) {
      return true;
    }
    return _isHorizontalScrollShowing(element) || _isVerticalScrollShowing(element);
  };
}
function _isHorizontalScrollShowing(element) {
  return element.clientWidth < element.scrollWidth;
}
function _isVerticalScrollShowing(element) {
  return element.clientHeight < element.scrollHeight;
}
function _setElementWidth(element, width) {
  if (width === "flex") {
    element.style.removeProperty("width");
    element.style.removeProperty("minWidth");
    element.style.removeProperty("maxWidth");
    element.style.flex = "1 1 auto";
  } else {
    _setFixedWidth(element, width);
  }
}
function _setFixedWidth(element, width) {
  width = _formatSize(width);
  element.style.width = width;
  element.style.maxWidth = width;
  element.style.minWidth = width;
}
function _setFixedHeight(element, height) {
  height = _formatSize(height);
  element.style.height = height;
  element.style.maxHeight = height;
  element.style.minHeight = height;
}
function _formatSize(size) {
  return typeof size === "number" ? `${size}px` : size;
}
function _isNodeOrElement(o) {
  return o instanceof Node || o instanceof HTMLElement;
}
function _addOrRemoveAttribute(element, name, value) {
  if (value == null || value === "") {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value.toString());
  }
}
function _placeCaretAtEnd(beans, contentElement) {
  if (!contentElement.isContentEditable) {
    return;
  }
  const selection = _getWindow(beans).getSelection();
  if (!selection) {
    return;
  }
  const range = _getDocument(beans).createRange();
  range.selectNodeContents(contentElement);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}
function _observeResize(beans, element, callback) {
  const win = _getWindow(beans);
  const ResizeObserverImpl = win.ResizeObserver;
  const resizeObserver = ResizeObserverImpl ? new ResizeObserverImpl(callback) : null;
  resizeObserver?.observe(element);
  return () => resizeObserver?.disconnect();
}
function _observeIntersection(beans, element, callback, options) {
  const win = _getWindow(beans);
  const IntersectionObserver = win.IntersectionObserver;
  const intersectionObserver = IntersectionObserver ? new IntersectionObserver((entries) => {
    callback(_last(entries));
  }, options) : null;
  intersectionObserver?.observe(element);
  return () => intersectionObserver?.disconnect();
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
var DataRefAttribute = "data-ref";
var whitespaceNode;
function getWhitespaceNode() {
  whitespaceNode ?? (whitespaceNode = document.createTextNode(" "));
  return whitespaceNode.cloneNode();
}
function _createAgElement(params) {
  const { attrs, children, cls, ref, role, tag } = params;
  const element = document.createElement(tag);
  if (cls) {
    element.className = cls;
  }
  if (ref) {
    element.setAttribute(DataRefAttribute, ref);
  }
  if (role) {
    element.setAttribute("role", role);
  }
  if (attrs) {
    for (const key of Object.keys(attrs)) {
      element.setAttribute(key, attrs[key]);
    }
  }
  if (children) {
    if (typeof children === "string") {
      element.textContent = children;
    } else {
      let addFirstWhitespace = true;
      for (const child of children) {
        if (child) {
          if (typeof child === "string") {
            element.appendChild(document.createTextNode(child));
            addFirstWhitespace = false;
          } else if (typeof child === "function") {
            element.appendChild(child());
          } else {
            if (addFirstWhitespace) {
              element.appendChild(getWhitespaceNode());
              addFirstWhitespace = false;
            }
            element.append(_createAgElement(child));
            element.appendChild(getWhitespaceNode());
          }
        }
      }
    }
  }
  return element;
}

// packages/ag-stack/src/utils/event.ts
var PASSIVE_EVENTS = ["touchstart", "touchend", "touchmove", "touchcancel", "scroll"];
var NON_PASSIVE_EVENTS = ["wheel"];
var supports = {};
var _isEventSupported = /* @__PURE__ */ (() => {
  const tags = {
    select: "input",
    change: "input",
    submit: "form",
    reset: "form",
    error: "img",
    load: "img",
    abort: "img"
  };
  const eventChecker = (eventName) => {
    if (typeof supports[eventName] === "boolean") {
      return supports[eventName];
    }
    const el = document.createElement(tags[eventName] || "div");
    eventName = "on" + eventName;
    return supports[eventName] = eventName in el;
  };
  return eventChecker;
})();
function _isElementInEventPath(element, event) {
  if (!event || !element) {
    return false;
  }
  return _getEventPath(event).indexOf(element) >= 0;
}
function _createEventPath(event) {
  const res = [];
  let pointer = event.target;
  while (pointer) {
    res.push(pointer);
    pointer = pointer.parentElement;
  }
  return res;
}
function _getEventPath(event) {
  const eventNoType = event;
  if (eventNoType.path) {
    return eventNoType.path;
  }
  if (eventNoType.composedPath) {
    return eventNoType.composedPath();
  }
  return _createEventPath(eventNoType);
}
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
function _areEventsNear(e1, e2, pixelCount) {
  if (pixelCount === 0) {
    return false;
  }
  const diffX = Math.abs(e1.clientX - e2.clientX);
  const diffY = Math.abs(e1.clientY - e2.clientY);
  return Math.max(diffX, diffY) <= pixelCount;
}
var _getFirstActiveTouch = (touch, touchList) => {
  const identifier = touch.identifier;
  for (let i = 0, len = touchList.length; i < len; ++i) {
    const item = touchList[i];
    if (item.identifier === identifier) {
      return item;
    }
  }
  return null;
};
function _isEventFromThisInstance(beans, event) {
  return beans.gos.isElementInThisInstance(event.target);
}
function _anchorElementToMouseMoveEvent(element, mouseMoveEvent, beans) {
  const eRect = element.getBoundingClientRect();
  const height = eRect.height;
  const browserWidth = _getBodyWidth(beans) - 2;
  const browserHeight = _getBodyHeight(beans) - 2;
  const offsetParent = element.offsetParent;
  if (!offsetParent) {
    return;
  }
  const offsetParentSize = _getElementRectWithOffset(element.offsetParent);
  const { clientY, clientX } = mouseMoveEvent;
  let top = clientY - offsetParentSize.top - height / 2;
  let left = clientX - offsetParentSize.left - 10;
  const eDocument = _getDocument(beans);
  const win = eDocument.defaultView || window;
  const windowScrollY = win.pageYOffset || eDocument.documentElement.scrollTop;
  const windowScrollX = win.pageXOffset || eDocument.documentElement.scrollLeft;
  if (browserWidth > 0 && left + element.clientWidth > browserWidth + windowScrollX) {
    left = browserWidth + windowScrollX - element.clientWidth;
  }
  if (left < 0) {
    left = 0;
  }
  if (browserHeight > 0 && top + element.clientHeight > browserHeight + windowScrollY) {
    top = browserHeight + windowScrollY - element.clientHeight;
  }
  if (top < 0) {
    top = 0;
  }
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}
var addTempEventHandlers = (list, ...handlers) => {
  for (const handler of handlers) {
    const [target, type, eventListener, options] = handler;
    target.addEventListener(type, eventListener, options);
    list.push(handler);
  }
};
var clearTempEventHandlers = (list) => {
  if (list) {
    for (const [target, type, listener, options] of list) {
      target.removeEventListener(type, listener, options);
    }
    list.length = 0;
  }
};
var preventEventDefault = (event) => {
  if (event.cancelable) {
    event.preventDefault();
  }
};

// packages/ag-stack/src/utils/locale.ts
function defaultLocaleTextFunc(_key, defaultValue) {
  return defaultValue;
}
function _getLocaleTextFunc(localeSvc) {
  return localeSvc?.getLocaleTextFunc() ?? defaultLocaleTextFunc;
}
function _translate(bean, localeValues, key, variableValues) {
  const defaultValue = localeValues[key];
  return bean.getLocaleTextFunc()(
    key,
    typeof defaultValue === "function" ? defaultValue(variableValues) : defaultValue,
    variableValues
  );
}
function _getLocaleTextFromFunc(getLocaleText) {
  return (key, defaultValue, variableValues) => {
    return getLocaleText({
      key,
      defaultValue,
      variableValues
    });
  };
}
function _getLocaleTextFromMap(localeText) {
  return (key, defaultValue, variableValues) => {
    let localisedText = localeText?.[key];
    if (localisedText && variableValues?.length) {
      let found = 0;
      while (true) {
        if (found >= variableValues.length) {
          break;
        }
        const idx = localisedText.indexOf("${variable}");
        if (idx === -1) {
          break;
        }
        localisedText = localisedText.replace("${variable}", variableValues[found++]);
      }
    }
    return localisedText ?? defaultValue;
  };
}

// packages/ag-stack/src/core/agBeanStub.ts
var DESTROYED_EVENT = { type: "destroyed" };
var AgBeanStub = class {
  constructor() {
    this.beans = null;
    this.gos = null;
    this.eventSvc = null;
    /** Indicates whether the bean has been destroyed */
    this.destroyed = false;
    this.localEventService = null;
    // Cold — touched only on bean creation / destruction.
    this.stubContext = null;
    // not named context to allow children to use 'context' as a variable name
    this.destroyFunctions = null;
    this.propertyListenerId = 0;
    // Enable multiple grid properties to be updated together by the user but only trigger shared logic once.
    // Closely related to logic in GridOptionsUtils.ts _processOnChange
    // Lazy — most beans never register grouped property listeners, so the lookup object is allocated on first use.
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

// packages/ag-stack/src/interfaces/agComponent.ts
var RefPlaceholder = null;
function _isComponent(item) {
  return typeof item?.getGui === "function";
}

// packages/ag-stack/src/rendering/cssClassManager.ts
var CssClassManager = class {
  constructor(getGui) {
    // to minimise DOM hits, we only apply CSS classes if they have changed. as adding a CSS class that is already
    // there, or removing one that wasn't present, all takes CPU.
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

// packages/ag-stack/src/core/agComponentStub.ts
var compIdSequence = 0;
var AgComponentStub = class extends AgBeanStub {
  constructor(templateOrParams, componentSelectors) {
    super();
    this.suppressDataRefValidation = false;
    // if false, then CSS class "ag-hidden" is applied, which sets "display: none"
    this.displayed = true;
    // if false, then CSS class "ag-invisible" is applied, which sets "visibility: hidden"
    this.visible = true;
    // unique id for this row component. this is used for getting a reference to the HTML dom.
    // we cannot use the RowNode id as this is not unique (due to animation, old rows can be lying
    // around as we create a new rowComp instance for the same row node).
    this.compId = compIdSequence++;
    this.cssManager = new CssClassManager(() => this.eGui);
    this.componentSelectors = new Map((componentSelectors ?? []).map((comp) => [comp.selector, comp]));
    if (templateOrParams) {
      this.setTemplate(templateOrParams);
    }
  }
  preConstruct() {
    this.wireTemplate(this.getGui());
    this.addGlobalCss();
  }
  wireTemplate(element, paramsMap) {
    if (element && this.gos) {
      this.applyElementsToComponent(element);
      this.createChildComponentsFromTags(element, paramsMap);
    }
  }
  getCompId() {
    return this.compId;
  }
  getDataRefAttribute(element) {
    if (element.getAttribute) {
      return element.getAttribute(DataRefAttribute);
    }
    return null;
  }
  applyElementsToComponent(element, elementRef, paramsMap, newComponent = null) {
    if (elementRef === void 0) {
      elementRef = this.getDataRefAttribute(element);
    }
    if (elementRef) {
      const current = this[elementRef];
      if (current === RefPlaceholder) {
        this[elementRef] = newComponent ?? element;
      } else {
        const usedAsParamRef = paramsMap?.[elementRef];
        if (!this.suppressDataRefValidation && !usedAsParamRef) {
          throw new Error(`data-ref: ${elementRef} on ${this.constructor.name} with ${current}`);
        }
      }
    }
  }
  // for registered components only, eg creates AgCheckbox instance from ag-checkbox HTML tag
  createChildComponentsFromTags(parentNode, paramsMap) {
    const childNodeList = [];
    for (const childNode of parentNode.childNodes ?? []) {
      childNodeList.push(childNode);
    }
    for (const childNode of childNodeList) {
      if (!(childNode instanceof HTMLElement)) {
        continue;
      }
      const childComp = this.createComponentFromElement(
        childNode,
        (childComp2) => {
          const childGui = childComp2.getGui();
          if (childGui) {
            for (const attr of childNode.attributes ?? []) {
              childGui.setAttribute(attr.name, attr.value);
            }
          }
        },
        paramsMap
      );
      if (childComp) {
        if (childComp.addItems && childNode.children.length) {
          this.createChildComponentsFromTags(childNode, paramsMap);
          const items = Array.prototype.slice.call(childNode.children);
          childComp.addItems(items);
        }
        this.swapComponentForNode(childComp, parentNode, childNode);
      } else if (childNode.childNodes) {
        this.createChildComponentsFromTags(childNode, paramsMap);
      }
    }
  }
  createComponentFromElement(element, afterPreCreateCallback, paramsMap) {
    const key = element.nodeName;
    const elementRef = this.getDataRefAttribute(element);
    const isAgGridComponent = key.indexOf("AG-") === 0;
    const componentSelector = isAgGridComponent ? this.componentSelectors.get(key) : null;
    let newComponent = null;
    if (componentSelector) {
      const componentParams = paramsMap && elementRef ? paramsMap[elementRef] : void 0;
      newComponent = new componentSelector.component(componentParams);
      newComponent.setParentComponent(
        this
      );
      this.createBean(newComponent, null, afterPreCreateCallback);
    } else if (isAgGridComponent) {
      throw new Error(`selector: ${key}`);
    }
    this.applyElementsToComponent(element, elementRef, paramsMap, newComponent);
    return newComponent;
  }
  swapComponentForNode(newComponent, parentNode, childNode) {
    const eComponent = newComponent.getGui();
    parentNode.replaceChild(eComponent, childNode);
    parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
    this.addDestroyFunc(this.destroyBean.bind(this, newComponent));
  }
  activateTabIndex(elements, overrideTabIndex) {
    const tabIndex = overrideTabIndex ?? this.gos.get("tabIndex");
    if (!elements) {
      elements = [];
    }
    if (!elements.length) {
      elements.push(this.getGui());
    }
    for (const el of elements) {
      el.setAttribute("tabindex", tabIndex.toString());
    }
  }
  setTemplate(templateOrParams, componentSelectors, paramsMap) {
    let eGui;
    if (typeof templateOrParams === "string" || templateOrParams == null) {
      eGui = _loadTemplate(templateOrParams);
    } else {
      eGui = _createAgElement(templateOrParams);
    }
    this.setTemplateFromElement(eGui, componentSelectors, paramsMap);
  }
  setTemplateFromElement(element, components, paramsMap, suppressDataRefValidation = false) {
    this.eGui = element;
    this.suppressDataRefValidation = suppressDataRefValidation;
    if (components) {
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        this.componentSelectors.set(component.selector, component);
      }
    }
    this.wireTemplate(element, paramsMap);
  }
  getGui() {
    return this.eGui;
  }
  getFocusableElement() {
    return this.eGui;
  }
  getAriaElement() {
    return this.getFocusableElement();
  }
  setParentComponent(component) {
    this.parentComponent = component;
  }
  getParentComponent() {
    return this.parentComponent;
  }
  // this method is for older code, that wants to provide the gui element,
  // it is not intended for this to be in ag-Stack
  setGui(eGui) {
    this.eGui = eGui;
  }
  queryForHtmlElement(cssSelector) {
    return this.eGui.querySelector(cssSelector);
  }
  getContainerAndElement(newChild, container) {
    let parent = container;
    if (newChild == null) {
      return null;
    }
    if (!parent) {
      parent = this.eGui;
    }
    if (_isNodeOrElement(newChild)) {
      return {
        element: newChild,
        parent
      };
    }
    return {
      element: newChild.getGui(),
      parent
    };
  }
  prependChild(newChild, container) {
    const { element, parent } = this.getContainerAndElement(newChild, container) || {};
    if (!element || !parent) {
      return;
    }
    parent.prepend(element);
  }
  appendChild(newChild, container) {
    const { element, parent } = this.getContainerAndElement(newChild, container) || {};
    if (!element || !parent) {
      return;
    }
    parent.appendChild(element);
  }
  isDisplayed() {
    return this.displayed;
  }
  setVisible(visible, options = {}) {
    if (visible !== this.visible) {
      this.visible = visible;
      const { skipAriaHidden } = options;
      _setVisible(this.eGui, visible, { skipAriaHidden });
    }
  }
  setDisplayed(displayed, options = {}) {
    if (displayed !== this.displayed) {
      this.displayed = displayed;
      const { skipAriaHidden } = options;
      _setDisplayed(this.eGui, displayed, { skipAriaHidden });
      const event = {
        type: "displayChanged",
        visible: this.displayed
      };
      this.dispatchLocalEvent(event);
    }
  }
  destroy() {
    if (this.parentComponent) {
      this.parentComponent = void 0;
    }
    super.destroy();
  }
  addGuiEventListener(event, listener, options) {
    this.eGui.addEventListener(event, listener, options);
    this.addDestroyFunc(() => this.eGui.removeEventListener(event, listener));
  }
  addCss(className) {
    this.cssManager.toggleCss(className, true);
  }
  removeCss(className) {
    this.cssManager.toggleCss(className, false);
  }
  toggleCss(className, addOrRemove) {
    this.cssManager.toggleCss(className, addOrRemove);
  }
  registerCSS(css) {
    if (this.css === globalCssAdded) {
      this.css = [css];
      this.addGlobalCss();
    } else {
      this.css || (this.css = []);
      this.css.push(css);
    }
  }
  addGlobalCss() {
    if (Array.isArray(this.css)) {
      const debugId = "component-" + Object.getPrototypeOf(this)?.constructor?.name;
      for (const css of this.css ?? []) {
        this.beans.environment.addGlobalCSS(css, debugId);
      }
    }
    this.css = globalCssAdded;
  }
};
var globalCssAdded = /* @__PURE__ */ Symbol();

// packages/ag-stack/src/core/agContext.ts
var contextId = 1;
var AgContext = class {
  constructor(params) {
    this.beans = {};
    this.createdBeans = [];
    this.destroyed = false;
    this.instanceId = contextId++;
    if (!params?.beanClasses) {
      return;
    }
    this.beanDestroyComparator = params.beanDestroyComparator;
    this.init(params);
  }
  init(params) {
    this.id = params.id;
    this.beans.context = this;
    this.destroyCallback = params.destroyCallback;
    for (const beanName of Object.keys(params.providedBeanInstances)) {
      this.beans[beanName] = params.providedBeanInstances[beanName];
    }
    for (const BeanClass of params.beanClasses) {
      const instance = new BeanClass();
      if (instance.beanName) {
        this.beans[instance.beanName] = instance;
      } else {
        console.error(`Bean ${BeanClass.name} is missing beanName`);
      }
      this.createdBeans.push(instance);
    }
    for (const beanFunc of params.derivedBeans ?? []) {
      const { beanName, bean } = beanFunc(this);
      this.beans[beanName] = bean;
      this.createdBeans.push(bean);
    }
    if (params.beanInitComparator) {
      this.createdBeans.sort(params.beanInitComparator);
    }
    this.initBeans(this.createdBeans);
  }
  getBeanInstances() {
    return Object.values(this.beans);
  }
  createBean(bean, afterPreCreateCallback) {
    this.initBeans([bean], afterPreCreateCallback);
    return bean;
  }
  initBeans(beanInstances, afterPreCreateCallback) {
    const beans = this.beans;
    for (const instance of beanInstances) {
      instance.preWireBeans?.(beans);
      instance.wireBeans?.(beans);
    }
    for (const instance of beanInstances) {
      instance.preConstruct?.();
    }
    if (afterPreCreateCallback) {
      beanInstances.forEach(afterPreCreateCallback);
    }
    for (const instance of beanInstances) {
      instance.postConstruct?.();
    }
  }
  getBeans() {
    return this.beans;
  }
  getBean(name) {
    return this.beans[name];
  }
  getId() {
    return this.id;
  }
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    const beanInstances = this.getBeanInstances();
    if (this.beanDestroyComparator) {
      beanInstances.sort(this.beanDestroyComparator);
    }
    this.destroyBeans(beanInstances);
    this.beans = {};
    this.createdBeans = [];
    this.destroyCallback?.();
  }
  /**
   * Destroys a bean and returns undefined to support destruction and clean up in a single line.
   * this.dateComp = this.context.destroyBean(this.dateComp);
   */
  destroyBean(bean) {
    bean?.destroy?.();
  }
  /**
   * Destroys an array of beans and returns an empty array to support destruction and clean up in a single line.
   * this.dateComps = this.context.destroyBeans(this.dateComps);
   */
  destroyBeans(beans) {
    if (beans) {
      for (let i = 0; i < beans.length; i++) {
        this.destroyBean(beans[i]);
      }
    }
    return [];
  }
  isDestroyed() {
    return this.destroyed;
  }
};

// packages/ag-stack/src/fastTestTimings.ts
var FAST_TEST_TIMINGS = false;

// packages/ag-stack/src/utils/function.ts
var doOnceSet = /* @__PURE__ */ new Set();
var _doOnce = (func, key) => {
  if (!doOnceSet.has(key)) {
    doOnceSet.add(key);
    func();
  }
};
_doOnce._set = doOnceSet;
var batchedCallsSetTimeout = {
  pending: false,
  funcs: []
};
var batchedCallsRaf = {
  pending: false,
  funcs: []
};
function _batchCall(func, mode = "setTimeout", beans) {
  const batch = mode === "raf" ? batchedCallsRaf : batchedCallsSetTimeout;
  batch.funcs.push(func);
  if (batch.pending) {
    return;
  }
  batch.pending = true;
  const runBatch = () => {
    const funcsCopy = batch.funcs.slice();
    batch.funcs.length = 0;
    batch.pending = false;
    let firstError;
    let failed = false;
    for (let i = 0, len = funcsCopy.length; i < len; ++i) {
      try {
        funcsCopy[i]();
      } catch (e) {
        if (!failed) {
          failed = true;
          firstError = e;
        }
      }
    }
    if (failed) {
      throw firstError;
    }
  };
  if (mode === "raf") {
    _requestAnimationFrame(beans, runBatch);
  } else {
    window.setTimeout(runBatch, 0);
  }
}
function _debounce(bean, func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    window.clearTimeout(timeout);
    timeout = window.setTimeout(function() {
      if (bean.isAlive()) {
        func.apply(context, args);
      }
    }, delay);
    return timeout;
  };
}
function _throttle(func, wait) {
  let previousCall = 0;
  return function(...args) {
    const context = this;
    const currentCall = Date.now();
    if (currentCall - previousCall < wait) {
      return;
    }
    previousCall = currentCall;
    func.apply(context, args);
  };
}
function _waitUntil(bean, condition, callback, timeout = 100) {
  const timeStamp = Date.now();
  let interval = null;
  let executed = false;
  const clearWait = () => {
    if (interval != null) {
      window.clearInterval(interval);
      interval = null;
    }
  };
  bean.addDestroyFunc(clearWait);
  const internalCallback = () => {
    const reachedTimeout = Date.now() - timeStamp > timeout;
    if (condition() || reachedTimeout) {
      callback();
      executed = true;
      clearWait();
    }
  };
  internalCallback();
  if (!executed) {
    interval = window.setInterval(internalCallback, 10);
  }
}

// packages/ag-stack/src/core/baseAriaAnnouncementService.ts
var ANNOUNCE_DEBOUNCE = FAST_TEST_TIMINGS ? 0 : 200;
var ANNOUNCE_REPEAT_DELAY = FAST_TEST_TIMINGS ? 0 : 50;
var BaseAriaAnnouncementService = class extends AgBeanStub {
  constructor() {
    super();
    this.beanName = "ariaAnnounce";
    this.descriptionContainer = null;
    this.pendingAnnouncements = /* @__PURE__ */ new Map();
    // outlives the queue so a same-key update can cancel a value already waiting for its delayed DOM write.
    this.announcementGenerations = /* @__PURE__ */ new Map();
    this.lastAnnouncement = "";
    this.updateAnnouncement = _debounce(this, this.updateAnnouncement.bind(this), ANNOUNCE_DEBOUNCE);
  }
  setDescriptionContainer(div) {
    this.descriptionContainer = div;
    _setAriaLive(div, "polite");
    _setAriaRelevant(div, "additions text");
    _setAriaAtomic(div, true);
    this.updateAnnouncement();
  }
  /**
   * @param key used for debouncing calls
   */
  announceValue(value, key) {
    const generation = (this.announcementGenerations.get(key) ?? 0) + 1;
    this.announcementGenerations.set(key, generation);
    this.pendingAnnouncements.set(key, { generation, value });
    this.updateAnnouncement();
  }
  updateAnnouncement() {
    if (!this.descriptionContainer) {
      return;
    }
    const announcements = Array.from(this.pendingAnnouncements, ([key, announcement]) => ({
      ...announcement,
      key
    }));
    this.pendingAnnouncements.clear();
    this.descriptionContainer.textContent = "";
    setTimeout(() => {
      const value = announcements.filter(({ generation, key }) => this.announcementGenerations.get(key) === generation).map(({ value: value2 }) => value2).join(". ");
      this.handleAnnouncementUpdate(value);
    }, ANNOUNCE_REPEAT_DELAY);
  }
  handleAnnouncementUpdate(value) {
    if (!this.isAlive() || !this.descriptionContainer) {
      return;
    }
    let valueToAnnounce = value;
    if (valueToAnnounce == null || valueToAnnounce.replace(/[ .]/g, "") == "") {
      this.lastAnnouncement = "";
      return;
    }
    if (this.lastAnnouncement === valueToAnnounce) {
      valueToAnnounce = `${valueToAnnounce}\u200B`;
    }
    this.lastAnnouncement = valueToAnnounce;
    this.descriptionContainer.textContent = valueToAnnounce;
  }
  destroy() {
    super.destroy();
    this.descriptionContainer = null;
    this.pendingAnnouncements.clear();
    this.announcementGenerations.clear();
  }
};

// packages/ag-stack/src/theming/styledRoot.ts
function _initDetachedStyledRoot(env, child) {
  const [outer, inner] = _createStyledRootElements();
  inner.appendChild(child);
  const destroy = _initStyledRootFromInnerOfThreeElements(env, inner);
  return [outer, destroy];
}
function _initStyledRoot(env, parent, child) {
  const [element, destroy] = _initDetachedStyledRoot(env, child);
  parent.appendChild(element);
  return () => {
    destroy();
    element.remove();
  };
}
function _createStyledRootElements() {
  const el = { tag: "div", cls: "ag-styled-root" };
  const outer = _createAgElement({ ...el, children: [{ ...el, children: [el] }] });
  return [outer, outer.firstElementChild.firstElementChild];
}
function _initStyledRootFromInnerOfThreeElements(env, inner, postApplyClasses, hasAncestorStyledRoot, legacyThemeClassesInherited) {
  const middle = inner.parentElement;
  const outer = middle.parentElement;
  const applyClasses = () => {
    const [inheritClass, applyClass, directionClass] = env.getStyledRootClasses(
      hasAncestorStyledRoot,
      legacyThemeClassesInherited
    );
    outer.className = ["ag-styled-root", inheritClass].join(" ");
    middle.className = ["ag-styled-root", applyClass].join(" ");
    inner.className = ["ag-styled-root", directionClass].join(" ");
    postApplyClasses?.();
  };
  applyClasses();
  return env.onThemeChanged(applyClasses);
}

// packages/ag-stack/src/core/baseDragAndDropService.ts
var BaseDragAndDropService = class extends AgBeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "dragAndDrop";
    this.dragSourceAndParamsList = [];
    this.dragItem = null;
    this.dragInitialSourcePointerOffsetX = 0;
    this.dragInitialSourcePointerOffsetY = 0;
    this.lastMouseEvent = null;
    this.lastDraggingEvent = null;
    this.dragSource = null;
    this.dragImageCompPromise = null;
    this.dragImageComp = null;
    this.disconnect = null;
    this.dragImageLastIcon = void 0;
    this.dragImageLastLabel = void 0;
    this.dropTargets = [];
    this.externalDropZoneCount = 0;
    this.lastDropTarget = null;
  }
  addDragSource(dragSource, allowTouch = false) {
    const entry = {
      capturePointer: true,
      dragSource,
      eElement: dragSource.eElement,
      dragStartPixels: dragSource.dragStartPixels,
      onDragStart: (mouseEvent) => this.onDragStart(dragSource, mouseEvent),
      onDragStop: this.onDragStop.bind(this),
      onDragging: this.onDragging.bind(this),
      onDragCancel: this.onDragCancel.bind(this),
      includeTouch: allowTouch
    };
    this.dragSourceAndParamsList.push(entry);
    this.beans.dragSvc.addDragSource(entry);
  }
  setDragImageCompIcon(iconName, shake = false) {
    const component = this.dragImageComp;
    if (component && (shake || this.dragImageLastIcon !== iconName)) {
      this.dragImageLastIcon = iconName;
      component.setIcon(iconName, shake);
    }
  }
  removeDragSource(dragSource) {
    const { dragSourceAndParamsList, beans } = this;
    for (let i = 0, len = dragSourceAndParamsList.length; i < len; i++) {
      if (dragSourceAndParamsList[i].dragSource === dragSource) {
        const sourceAndParams = dragSourceAndParamsList[i];
        beans.dragSvc?.removeDragSource(sourceAndParams);
        dragSourceAndParamsList.splice(i, 1);
        break;
      }
    }
  }
  destroy() {
    const { dragSourceAndParamsList, dropTargets, beans } = this;
    const dragSvc = beans.dragSvc;
    for (const sourceAndParams of dragSourceAndParamsList) {
      dragSvc?.removeDragSource(sourceAndParams);
    }
    dragSourceAndParamsList.length = 0;
    dropTargets.length = 0;
    this.externalDropZoneCount = 0;
    this.clearDragAndDropProperties();
    super.destroy();
  }
  nudge() {
    const lastMouseEvent = this.lastMouseEvent;
    if (lastMouseEvent) {
      this.onDragging(lastMouseEvent, true);
    }
  }
  onDragStart(dragSource, mouseEvent) {
    this.lastMouseEvent = mouseEvent;
    this.dragSource = dragSource;
    this.dragItem = dragSource.getDragItem();
    const rect = dragSource.eElement.getBoundingClientRect();
    this.dragInitialSourcePointerOffsetX = mouseEvent.clientX - rect.left;
    this.dragInitialSourcePointerOffsetY = mouseEvent.clientY - rect.top;
    dragSource.onDragStarted?.();
    this.createAndUpdateDragImageComp(dragSource);
  }
  onDragStop(mouseEvent) {
    const { dragSource, lastDropTarget } = this;
    dragSource?.onDragStopped?.();
    if (lastDropTarget) {
      const dragEndEvent = this.dropTargetEvent(lastDropTarget, mouseEvent, false);
      lastDropTarget.onDragStop?.(dragEndEvent);
    }
    this.clearDragAndDropProperties();
  }
  onDragCancel() {
    const { dragSource, lastDropTarget, lastMouseEvent } = this;
    dragSource?.onDragCancelled?.();
    if (lastDropTarget && lastMouseEvent) {
      const dragCancelEvent = this.dropTargetEvent(lastDropTarget, lastMouseEvent, false);
      lastDropTarget.onDragCancel?.(dragCancelEvent);
    }
    this.clearDragAndDropProperties();
  }
  onDragging(mouseEvent, fromNudge = false) {
    this.positionDragImageComp(mouseEvent);
    const dropTarget = this.findCurrentDropTarget(mouseEvent);
    const { lastDropTarget, dragSource, dragItem } = this;
    let needUpdate = false;
    if (dropTarget !== lastDropTarget) {
      needUpdate = true;
      if (lastDropTarget) {
        const dragLeaveEvent = this.dropTargetEvent(lastDropTarget, mouseEvent, fromNudge);
        lastDropTarget.onDragLeave?.(dragLeaveEvent);
      }
      if (lastDropTarget !== null && !dropTarget) {
        this.handleExit(dragSource, dragItem);
      } else if (lastDropTarget === null && dropTarget) {
        this.handleEnter(dragSource, dragItem);
      }
      if (dropTarget) {
        const dragEnterEvent = this.dropTargetEvent(dropTarget, mouseEvent, fromNudge);
        dropTarget.onDragEnter?.(dragEnterEvent);
      }
      this.lastDropTarget = dropTarget;
    } else if (dropTarget) {
      const dragMoveEvent = this.dropTargetEvent(dropTarget, mouseEvent, fromNudge);
      dropTarget.onDragging?.(dragMoveEvent);
      if (dragMoveEvent?.changed) {
        needUpdate = true;
      }
    }
    this.lastMouseEvent = mouseEvent;
    if (needUpdate) {
      this.updateDragImageComp();
    }
  }
  clearDragAndDropProperties() {
    this.removeDragImageComp(this.dragImageComp);
    this.dragImageCompPromise = null;
    this.dragImageLastIcon = void 0;
    this.dragImageLastLabel = void 0;
    this.lastMouseEvent = null;
    this.lastDraggingEvent = null;
    this.lastDropTarget = null;
    this.dragItem = null;
    this.dragInitialSourcePointerOffsetX = 0;
    this.dragInitialSourcePointerOffsetY = 0;
    this.dragSource = null;
  }
  getAllContainersFromDropTarget(dropTarget) {
    const primaryContainer = dropTarget.getContainer();
    const secondaryContainers = dropTarget.getSecondaryContainers?.();
    const secondaryContainersLen = secondaryContainers?.length;
    if (!secondaryContainersLen) {
      return [[primaryContainer]];
    }
    const containers = new Array(secondaryContainersLen + 1);
    containers[0] = [primaryContainer];
    for (let i = 0; i < secondaryContainersLen; ++i) {
      containers[i + 1] = secondaryContainers[i];
    }
    return containers;
  }
  // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
  isMouseOnDropTarget(mouseEvent, dropTarget) {
    const allContainersFromDropTarget = this.getAllContainersFromDropTarget(dropTarget);
    let mouseOverTarget = false;
    const allContainersIntersect = (mouseEvent2, containers) => {
      for (const container of containers) {
        const { width, height, left, right, top, bottom } = container.getBoundingClientRect();
        if (width === 0 || height === 0) {
          return false;
        }
        const horizontalFit = mouseEvent2.clientX >= left && mouseEvent2.clientX < right;
        const verticalFit = mouseEvent2.clientY >= top && mouseEvent2.clientY < bottom;
        if (!horizontalFit || !verticalFit) {
          return false;
        }
      }
      return true;
    };
    for (const currentContainers of allContainersFromDropTarget) {
      if (allContainersIntersect(mouseEvent, currentContainers)) {
        mouseOverTarget = true;
        break;
      }
    }
    const { eElement, type } = this.dragSource;
    if (dropTarget.targetContainsSource && !dropTarget.getContainer().contains(eElement)) {
      return false;
    }
    return mouseOverTarget && dropTarget.isInterestedIn(type, eElement);
  }
  findCurrentDropTarget(mouseEvent) {
    const validDropTargets = [];
    const dropTargets = this.dropTargets;
    for (let i = 0, len2 = dropTargets.length; i < len2; ++i) {
      const target = dropTargets[i];
      if (this.isMouseOnDropTarget(mouseEvent, target)) {
        validDropTargets.push(target);
      }
    }
    const len = validDropTargets.length;
    if (len === 0) {
      return null;
    }
    if (len === 1) {
      return validDropTargets[0];
    }
    const rootNode = _getRootNode(this.beans);
    const elementStack = rootNode.elementsFromPoint(mouseEvent.clientX, mouseEvent.clientY);
    for (let i = 0, stackLen = elementStack.length; i < stackLen; ++i) {
      const el = elementStack[i];
      for (let targetIndex = 0, targetsLen = validDropTargets.length; targetIndex < targetsLen; targetIndex++) {
        const dropTarget = validDropTargets[targetIndex];
        const containerGroups = this.getAllContainersFromDropTarget(dropTarget);
        let matched = false;
        for (let groupIdx = 0, groupLen = containerGroups.length; groupIdx < groupLen && !matched; groupIdx++) {
          const group = containerGroups[groupIdx];
          for (let elIdx = 0, elLen = group.length; elIdx < elLen; elIdx++) {
            if (group[elIdx] === el) {
              matched = true;
              break;
            }
          }
        }
        if (matched) {
          return dropTarget;
        }
      }
    }
    return null;
  }
  addDropTarget(dropTarget) {
    this.dropTargets.push(dropTarget);
    if (dropTarget.external) {
      this.externalDropZoneCount++;
    }
  }
  removeDropTarget(dropTarget) {
    const container = dropTarget.getContainer();
    const dropTargets = this.dropTargets;
    let writeIndex = 0;
    for (let readIndex = 0, len = dropTargets.length; readIndex < len; ++readIndex) {
      const target = dropTargets[readIndex];
      if (target.getContainer() === container) {
        if (target.external) {
          --this.externalDropZoneCount;
        }
        continue;
      }
      if (writeIndex !== readIndex) {
        dropTargets[writeIndex] = target;
      }
      ++writeIndex;
    }
    dropTargets.length = writeIndex;
  }
  hasExternalDropZones() {
    return this.externalDropZoneCount > 0;
  }
  findExternalZone(container) {
    const dropTargets = this.dropTargets;
    for (let i = 0, len = dropTargets.length; i < len; ++i) {
      const zone = dropTargets[i];
      if (zone.external && zone.getContainer() === container) {
        return zone;
      }
    }
    return null;
  }
  dropTargetEvent(dropTarget, mouseEvent, fromNudge) {
    const {
      dragSource,
      dragItem,
      lastDraggingEvent,
      lastMouseEvent,
      dragInitialSourcePointerOffsetX,
      dragInitialSourcePointerOffsetY
    } = this;
    const dropZoneTarget = dropTarget.getContainer();
    const rect = dropZoneTarget.getBoundingClientRect();
    const { clientX, clientY } = mouseEvent;
    const xDir = clientX - (lastMouseEvent?.clientX || 0);
    const yDir = clientY - (lastMouseEvent?.clientY || 0);
    const draggingEvent = this.createEvent({
      event: mouseEvent,
      x: clientX - rect.left,
      // relative x
      y: clientY - rect.top,
      // relative y
      vDirection: yDir > 0 ? "down" : yDir < 0 ? "up" : null,
      hDirection: xDir < 0 ? "left" : xDir > 0 ? "right" : null,
      initialSourcePointerOffsetX: dragInitialSourcePointerOffsetX,
      initialSourcePointerOffsetY: dragInitialSourcePointerOffsetY,
      dragSource,
      fromNudge,
      dragItem,
      dropZoneTarget,
      dropTarget: lastDraggingEvent?.dropTarget ?? null,
      // updated by rowDragFeature
      changed: !!lastDraggingEvent?.changed
    });
    this.lastDraggingEvent = draggingEvent;
    return draggingEvent;
  }
  positionDragImageComp(event) {
    const gui = this.dragImageComp?.getGui();
    if (gui) {
      _anchorElementToMouseMoveEvent(gui, event, this.beans);
    }
  }
  removeDragImageComp(comp) {
    if (this.dragImageComp === comp) {
      this.dragImageComp = null;
    }
    if (comp) {
      this.disconnect?.();
      this.disconnect = null;
      this.destroyBean(comp);
    }
  }
  createAndUpdateDragImageComp(dragSource) {
    const promise = this.createDragImageComp(dragSource) ?? null;
    this.dragImageCompPromise = promise;
    promise?.then((dragImageComp) => {
      const lastMouseEvent = this.lastMouseEvent;
      if (promise !== this.dragImageCompPromise || !lastMouseEvent || !this.isAlive()) {
        this.destroyBean(dragImageComp);
        return;
      }
      this.dragImageCompPromise = null;
      this.dragImageLastIcon = void 0;
      this.dragImageLastLabel = void 0;
      const oldDragImageComp = this.dragImageComp;
      if (oldDragImageComp !== dragImageComp) {
        this.dragImageComp = dragImageComp;
        this.removeDragImageComp(oldDragImageComp);
      }
      if (dragImageComp) {
        this.appendDragImageComp(dragImageComp);
        this.updateDragImageComp();
        this.positionDragImageComp(lastMouseEvent);
      }
    });
  }
  appendDragImageComp(component) {
    const eGui = component.getGui();
    const style = eGui.style;
    style.position = "absolute";
    style.zIndex = "9999";
    if (this.beans.dragSvc?.hasPointerCapture()) {
      style.pointerEvents = "none";
    }
    this.gos.setInstanceDomData(eGui);
    style.top = "20px";
    style.left = "20px";
    const targetEl = _getPageBody(this.beans);
    if (!targetEl) {
      this.warnNoBody();
      return;
    }
    this.disconnect = _initStyledRoot(this.beans.environment, targetEl, eGui);
  }
  updateDragImageComp() {
    const { dragImageComp, dragSource, lastDropTarget, lastDraggingEvent, dragImageLastLabel } = this;
    if (!dragImageComp) {
      return;
    }
    this.setDragImageCompIcon(lastDropTarget?.getIconName?.(lastDraggingEvent) ?? null);
    let label = dragSource?.dragItemName;
    if (typeof label === "function") {
      label = label(lastDraggingEvent);
    }
    label || (label = "");
    if (dragImageLastLabel !== label) {
      this.dragImageLastLabel = label;
      dragImageComp.setLabel(label);
    }
  }
};

// packages/ag-stack/src/events/pointerCapture.ts
var tryPointerCapture = (eElement, pointerId) => {
  if (pointerId != null && eElement?.setPointerCapture) {
    try {
      eElement.setPointerCapture(pointerId);
      return eElement.hasPointerCapture(pointerId);
    } catch {
    }
  }
  return false;
};
var capturePointer = (eElement, mouseEvent) => {
  if (typeof PointerEvent === "undefined" || !(mouseEvent instanceof PointerEvent)) {
    return null;
  }
  const pointerId = mouseEvent.pointerId;
  if (!tryPointerCapture(eElement, pointerId)) {
    return null;
  }
  const capture = {
    eElement,
    pointerId,
    onLost(pointerEvent) {
      pointerLostHandler(capture, pointerEvent);
    }
  };
  eElement.addEventListener("lostpointercapture", capture.onLost);
  return capture;
};
var releasePointerCapture = (capture) => {
  if (!capture) {
    return;
  }
  removeLostHandler(capture);
  const { eElement, pointerId } = capture;
  if (!eElement) {
    return;
  }
  try {
    eElement.releasePointerCapture(pointerId);
  } catch {
  }
  capture.eElement = null;
};
var removeLostHandler = (capture) => {
  const { eElement, onLost } = capture;
  if (eElement && onLost) {
    eElement.removeEventListener("lostpointercapture", onLost);
    capture.onLost = null;
  }
};
var pointerLostHandler = (capture, pointerEvent) => {
  removeLostHandler(capture);
  const { eElement, pointerId } = capture;
  if (eElement && pointerEvent.pointerId === pointerId) {
    tryPointerCapture(eElement, pointerId);
  }
};

// packages/ag-stack/src/utils/browser.ts
var isSafari;
var isFirefox;
var isMacOs;
var isIOS;
var invisibleScrollbar;
var realCssEngine;
var browserScrollbarWidth;
var maxDivHeight;
function _isBrowserSafari() {
  if (isSafari === void 0) {
    isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }
  return isSafari;
}
function _isBrowserFirefox() {
  if (isFirefox === void 0) {
    isFirefox = /(firefox)/i.test(navigator.userAgent);
  }
  return isFirefox;
}
function _isMacOsUserAgent() {
  if (isMacOs === void 0) {
    isMacOs = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
  }
  return isMacOs;
}
function _isIOSUserAgent() {
  if (isIOS === void 0) {
    isIOS = /iPad|iPhone|iPod/.test(navigator.platform) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }
  return isIOS;
}
function _getTabIndex(el) {
  if (!el) {
    return null;
  }
  const numberTabIndex = el.tabIndex;
  const tabIndex = el.getAttribute("tabIndex");
  if (numberTabIndex === -1 && (tabIndex === null || tabIndex === "" && !_isBrowserFirefox())) {
    return null;
  }
  return numberTabIndex.toString();
}
var CSS_ENGINE_PROBE_PROPERTY = "--ag-css-engine-probe";
var CSS_ENGINE_PROBE_VALUE = "137px";
function _isRealCssEngine() {
  if (realCssEngine !== void 0) {
    return realCssEngine;
  }
  const body = typeof document === "undefined" ? null : document.body;
  if (!body) {
    return null;
  }
  const parent = document.createElement("div");
  parent.style.setProperty(CSS_ENGINE_PROBE_PROPERTY, CSS_ENGINE_PROBE_VALUE);
  const child = document.createElement("div");
  parent.appendChild(child);
  body.appendChild(parent);
  realCssEngine = getComputedStyle(child).getPropertyValue(CSS_ENGINE_PROBE_PROPERTY).trim() === CSS_ENGINE_PROBE_VALUE;
  parent.remove();
  return realCssEngine;
}
function _getMaxDivHeight() {
  if (maxDivHeight !== void 0) {
    return maxDivHeight;
  }
  if (!document.body) {
    return -1;
  }
  let res = 1e6;
  const testUpTo = _isBrowserFirefox() ? 6e6 : 1e9;
  const div = document.createElement("div");
  document.body.appendChild(div);
  while (true) {
    const test = res * 2;
    div.style.height = test + "px";
    if (test > testUpTo || div.clientHeight !== test) {
      break;
    } else {
      res = test;
    }
  }
  div.remove();
  maxDivHeight = res;
  return res;
}
function _getScrollbarWidth() {
  if (browserScrollbarWidth == null) {
    initScrollbarWidthAndVisibility();
  }
  return browserScrollbarWidth;
}
function initScrollbarWidthAndVisibility() {
  const body = document.body;
  const div = document.createElement("div");
  div.style.width = div.style.height = "100px";
  div.style.opacity = "0";
  div.style.overflow = "scroll";
  div.style.msOverflowStyle = "scrollbar";
  div.style.position = "absolute";
  body.appendChild(div);
  let width = div.offsetWidth - div.clientWidth;
  if (width === 0 && div.clientWidth === 0) {
    width = null;
  }
  if (div.parentNode) {
    div.remove();
  }
  if (width != null) {
    browserScrollbarWidth = width;
    invisibleScrollbar = width === 0;
  }
}
function _isInvisibleScrollbar() {
  if (invisibleScrollbar == null) {
    initScrollbarWidthAndVisibility();
  }
  return invisibleScrollbar;
}

// packages/ag-stack/src/core/baseDragService.ts
var activePointerDrags;
var handledDragEvents;
var PASSIVE_TRUE = { passive: true };
var PASSIVE_FALSE = { passive: false };
var addHandledDragEvent = (event) => {
  if (!handledDragEvents) {
    handledDragEvents = /* @__PURE__ */ new WeakSet();
  } else if (handledDragEvents.has(event)) {
    return false;
  }
  handledDragEvents.add(event);
  return true;
};
var BaseDragService = class extends AgBeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "dragSvc";
    this.dragging = false;
    this.drag = null;
    this.dragSources = [];
  }
  get startTarget() {
    return this.drag?.start.target ?? null;
  }
  /** True if there is at least one active pointer drag in any BaseDragService instance in the page */
  isPointer() {
    return !!activePointerDrags?.has(_getRootNode(this.beans));
  }
  hasPointerCapture() {
    const capture = this.drag?.pointerCapture;
    return !!(capture && this.beans.eRootDiv.hasPointerCapture?.(capture.pointerId));
  }
  destroy() {
    if (this.drag) {
      this.cancelDrag();
    }
    const dragSources = this.dragSources;
    for (const entry of dragSources) {
      destroyDragSourceEntry(entry);
    }
    dragSources.length = 0;
    super.destroy();
  }
  removeDragSource(params) {
    const dragSources = this.dragSources;
    for (let i = 0, len = dragSources.length; i < len; ++i) {
      const entry = dragSources[i];
      if (entry.params === params) {
        dragSources.splice(i, 1);
        destroyDragSourceEntry(entry);
        break;
      }
    }
  }
  addDragSource(params) {
    if (!this.isAlive()) {
      return;
    }
    const { eElement, includeTouch } = params;
    const handlers = [];
    let oldTouchAction;
    if (includeTouch) {
      const style = eElement.style;
      if (style) {
        oldTouchAction = style.touchAction;
        style.touchAction = "none";
      }
    }
    const dragSource = { handlers, params, oldTouchAction };
    this.dragSources.push(dragSource);
    const pointerDownListener = (event) => this.onPointerDown(params, event);
    const mouseListener = (event) => this.onMouseDown(params, event);
    addTempEventHandlers(
      handlers,
      [eElement, "pointerdown", pointerDownListener, PASSIVE_FALSE],
      [eElement, "mousedown", mouseListener]
    );
    const suppressTouch = this.gos.get("suppressTouch");
    if (includeTouch && !suppressTouch) {
      const touchListener = (touchEvent) => this.onTouchStart(params, touchEvent);
      addTempEventHandlers(handlers, [eElement, "touchstart", touchListener, PASSIVE_FALSE]);
    }
  }
  cancelDrag(eElement) {
    const drag = this.drag;
    eElement ?? (eElement = drag?.eElement);
    if (eElement) {
      this.eventSvc.dispatchEvent({ type: "dragCancelled", target: eElement });
    }
    drag?.params.onDragCancel?.();
    this.destroyDrag();
  }
  shouldPreventMouseEvent(mouseEvent) {
    const type = mouseEvent.type;
    const isMouseMove = type === "mousemove" || type === "pointermove";
    return isMouseMove && mouseEvent.cancelable && _isEventFromThisInstance(this.beans, mouseEvent) && !_isFocusableFormField(getEventTargetElement(mouseEvent));
  }
  initDrag(drag, ...handlers) {
    this.drag = drag;
    const beans = this.beans;
    const onScroll = (event) => this.onScroll(event);
    const keydownEvent = (ev) => this.onKeyDown(ev);
    const rootEl = _getRootNode(beans);
    const eDocument = _getDocument(beans);
    addTempEventHandlers(
      drag.handlers,
      [rootEl, "contextmenu", preventEventDefault],
      [rootEl, "keydown", keydownEvent],
      [eDocument, "scroll", onScroll, { capture: true }],
      [eDocument.defaultView || window, "scroll", onScroll],
      ...handlers
    );
  }
  destroyDrag() {
    this.dragging = false;
    const drag = this.drag;
    if (drag) {
      const rootEl = drag.rootEl;
      if (activePointerDrags?.get(rootEl) === drag) {
        activePointerDrags.delete(rootEl);
      }
      this.drag = null;
      releasePointerCapture(drag.pointerCapture);
      clearTempEventHandlers(drag.handlers);
    }
  }
  // Pointer Events path (preferred when supported)
  onPointerDown(params, pointerEvent) {
    if (this.isPointer()) {
      return;
    }
    const beans = this.beans;
    if (handledDragEvents?.has(pointerEvent)) {
      return;
    }
    const pointerType = pointerEvent.pointerType;
    if (pointerType === "touch") {
      if (beans.gos.get("suppressTouch") || !params.includeTouch) {
        return;
      }
      if (params.stopPropagationForTouch) {
        pointerEvent.stopPropagation();
      }
      if (_isFocusableFormField(getEventTargetElement(pointerEvent))) {
        return;
      }
    }
    if (!pointerEvent.isPrimary) {
      return;
    }
    if (pointerType === "mouse" && pointerEvent.button !== 0) {
      return;
    }
    this.destroyDrag();
    const rootEl = _getRootNode(beans);
    const eElement = params.eElement;
    const pointerId = pointerEvent.pointerId;
    const pointerDrag = new Dragging(rootEl, params, pointerEvent, pointerId);
    activePointerDrags ?? (activePointerDrags = /* @__PURE__ */ new WeakMap());
    activePointerDrags.set(rootEl, pointerDrag);
    const onPointerMove = (ev) => {
      if (ev.pointerId === pointerId) {
        this.onMouseOrPointerMove(ev);
      }
    };
    const onUp = (ev) => {
      if (ev.pointerId === pointerId) {
        this.onMouseOrPointerUp(ev);
      }
    };
    const onCancel = (ev) => {
      if (ev.pointerId === pointerId && addHandledDragEvent(ev)) {
        this.cancelDrag();
      }
    };
    const dragPreventEventDefault = (e) => this.draggingPreventDefault(e);
    this.initDrag(
      pointerDrag,
      [rootEl, "pointerup", onUp],
      [rootEl, "pointercancel", onCancel],
      [rootEl, "pointermove", onPointerMove, PASSIVE_FALSE],
      [rootEl, "touchmove", dragPreventEventDefault, PASSIVE_FALSE],
      [eElement, "mousemove", dragPreventEventDefault, PASSIVE_FALSE]
    );
    if (params.dragStartPixels === 0) {
      this.onMouseOrPointerMove(pointerEvent);
    } else {
      addHandledDragEvent(pointerEvent);
    }
  }
  // gets called whenever mouse down on any drag source
  onTouchStart(params, touchEvent) {
    const suppressTouch = this.gos.get("suppressTouch");
    if (suppressTouch || !params.includeTouch) {
      return;
    }
    if (!addHandledDragEvent(touchEvent)) {
      return;
    }
    if (_isFocusableFormField(getEventTargetElement(touchEvent))) {
      return;
    }
    if (params.stopPropagationForTouch) {
      touchEvent.stopPropagation();
    }
    if (this.isPointer()) {
      if (this.dragging) {
        preventEventDefault(touchEvent);
      }
      return;
    }
    this.destroyDrag();
    const beans = this.beans;
    const rootEl = _getRootNode(beans);
    const touchDrag = new Dragging(rootEl, params, touchEvent.touches[0]);
    const touchMoveEvent = (e) => this.onTouchMove(e);
    const touchEndEvent = (e) => this.onTouchUp(e);
    const touchCancelEvent = (e) => this.onTouchCancel(e);
    const dragPreventEventDefault = (e) => this.draggingPreventDefault(e);
    const rootNode = _getRootNode(beans);
    const target = touchEvent.target ?? params.eElement;
    this.initDrag(
      touchDrag,
      [target, "touchmove", touchMoveEvent, PASSIVE_TRUE],
      [target, "touchend", touchEndEvent, PASSIVE_TRUE],
      [target, "touchcancel", touchCancelEvent, PASSIVE_TRUE],
      [rootNode, "touchmove", dragPreventEventDefault, PASSIVE_FALSE],
      [rootNode, "touchend", touchEndEvent, PASSIVE_FALSE],
      [rootNode, "touchcancel", touchCancelEvent, PASSIVE_FALSE]
    );
    if (params.dragStartPixels === 0) {
      this.onMove(touchDrag.start);
    }
  }
  /** preventEventDefault on the event while dragging only and if the event is cancellable */
  draggingPreventDefault(e) {
    if (this.dragging) {
      preventEventDefault(e);
    }
  }
  // gets called whenever mouse down on any drag source
  onMouseDown(params, mouseEvent) {
    if (mouseEvent.button !== 0) {
      return;
    }
    if (handledDragEvents?.has(mouseEvent)) {
      return;
    }
    if (this.isPointer()) {
      return;
    }
    const beans = this.beans;
    this.destroyDrag();
    const mouseDrag = new Dragging(_getRootNode(beans), params, mouseEvent);
    const mouseMoveEvent = (event) => this.onMouseOrPointerMove(event);
    const mouseUpEvent = (event) => this.onMouseOrPointerUp(event);
    const target = _getRootNode(beans);
    this.initDrag(mouseDrag, [target, "mousemove", mouseMoveEvent], [target, "mouseup", mouseUpEvent]);
    if (params.dragStartPixels === 0) {
      this.onMouseOrPointerMove(mouseEvent);
    } else {
      addHandledDragEvent(mouseEvent);
    }
  }
  onScroll(event) {
    if (!addHandledDragEvent(event)) {
      return;
    }
    const drag = this.drag;
    const lastDrag = drag?.lastDrag;
    if (lastDrag && this.dragging) {
      drag.params?.onDragging?.(lastDrag);
    }
  }
  /** only gets called after a mouse down - as this is only added after mouseDown and is removed when mouseUp happens */
  onMouseOrPointerMove(mouseEvent) {
    if (!addHandledDragEvent(mouseEvent)) {
      return;
    }
    if (_isBrowserSafari()) {
      _getDocument(this.beans).getSelection()?.removeAllRanges();
    }
    if (this.shouldPreventMouseEvent(mouseEvent)) {
      preventEventDefault(mouseEvent);
    }
    this.onMove(mouseEvent);
  }
  onTouchCancel(touchEvent) {
    const drag = this.drag;
    if (!drag || !addHandledDragEvent(touchEvent)) {
      return;
    }
    if (!_getFirstActiveTouch(drag.start, touchEvent.changedTouches)) {
      return;
    }
    this.cancelDrag();
  }
  onTouchMove(touchEvent) {
    const drag = this.drag;
    if (!drag || !addHandledDragEvent(touchEvent)) {
      return;
    }
    const touch = _getFirstActiveTouch(drag.start, touchEvent.touches);
    if (touch) {
      this.onMove(touch);
      this.draggingPreventDefault(touchEvent);
    }
  }
  onMove(currentEvent) {
    const drag = this.drag;
    if (!drag) {
      return;
    }
    drag.lastDrag = currentEvent;
    const dragSource = drag.params;
    if (!this.dragging) {
      const start = drag.start;
      const dragStartPixels = dragSource.dragStartPixels;
      const requiredPixelDiff = dragStartPixels ?? 4;
      if (_areEventsNear(currentEvent, start, requiredPixelDiff)) {
        return;
      }
      this.dragging = true;
      if (dragSource.capturePointer) {
        drag.pointerCapture = capturePointer(this.beans.eRootDiv, currentEvent);
      }
      this.eventSvc.dispatchEvent({
        type: "dragStarted",
        target: dragSource.eElement
      });
      dragSource.onDragStart?.(start);
      if (this.drag !== drag) {
        return;
      }
      dragSource.onDragging?.(start);
      if (this.drag !== drag) {
        return;
      }
    }
    dragSource.onDragging?.(currentEvent);
  }
  onTouchUp(touchEvent) {
    const drag = this.drag;
    if (drag && addHandledDragEvent(touchEvent)) {
      this.onUp(_getFirstActiveTouch(drag.start, touchEvent.changedTouches));
    }
  }
  onMouseOrPointerUp(mouseEvent) {
    if (addHandledDragEvent(mouseEvent)) {
      this.onUp(mouseEvent);
    }
  }
  onUp(eventOrTouch) {
    const drag = this.drag;
    if (!drag) {
      return;
    }
    if (!eventOrTouch) {
      eventOrTouch = drag.lastDrag;
    }
    if (eventOrTouch && this.dragging) {
      this.dragging = false;
      drag.params.onDragStop?.(eventOrTouch);
      this.eventSvc.dispatchEvent({
        type: "dragStopped",
        target: drag.params.eElement
      });
    }
    this.destroyDrag();
  }
  // shared keydown handler to cancel current drag with ESC
  onKeyDown(event) {
    if (event.key === KeyCode.ESCAPE) {
      this.cancelDrag();
    }
  }
};
var destroyDragSourceEntry = (dragSource) => {
  clearTempEventHandlers(dragSource.handlers);
  const oldTouchAction = dragSource.oldTouchAction;
  if (oldTouchAction != null) {
    const style = dragSource.params.eElement.style;
    if (style) {
      style.touchAction = oldTouchAction;
    }
  }
};
var Dragging = class {
  constructor(rootEl, params, start, pointerId = null) {
    this.rootEl = rootEl;
    this.params = params;
    this.start = start;
    this.pointerId = pointerId;
    this.handlers = [];
    this.lastDrag = null;
    this.pointerCapture = null;
    this.eElement = params.eElement;
  }
};
var getEventTargetElement = (event) => {
  const target = event.target;
  return target instanceof Element ? target : null;
};

// packages/ag-stack/src/theming/themeUtils.ts
var kebabCase = (str) => str.replace(/[A-Z]|\d+/g, (m) => `-${m}`).toLowerCase();
var paramToVariableName = (paramName) => `--ag-${kebabCase(paramName)}`;
var paramToVariableExpression = (paramName) => `var(${paramToVariableName(paramName)})`;
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
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
var foregroundHeaderBackgroundMix = (mix) => ({
  ref: "foregroundColor",
  mix,
  onto: "headerBackgroundColor"
});
var backgroundColor = { ref: "backgroundColor" };
var foregroundColor = { ref: "foregroundColor" };
var accentColor = { ref: "accentColor" };

// packages/ag-stack/src/theming/shared/shared-css.ts
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

// packages/ag-stack/src/theming/themeTypeUtils.ts
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
var literalToCSS = (value) => {
  if (typeof value === "object" && value?.ref) {
    return paramToVariableExpression(value.ref);
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return false;
};
var colorValueToCss = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value && "ref" in value) {
    const colorExpr = paramToVariableExpression(value.ref);
    if (value.mix == null) {
      return colorExpr;
    }
    const backgroundExpr = value.onto ? paramToVariableExpression(value.onto) : "transparent";
    return `color-mix(in srgb, ${backgroundExpr}, ${colorExpr} ${clamp(value.mix * 100, 0, 100)}%)`;
  }
  return false;
};
var colorSchemeValueToCss = literalToCSS;
var lengthValueToCss = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return `${value}px`;
  }
  if (typeof value === "object" && value && "calc" in value) {
    const valueWithSpaces = value.calc.replace(/ ?[*/+] ?/g, " $& ");
    return `calc(${valueWithSpaces.replace(/-?\b[a-z][a-z0-9]*\b(?![-(])/gi, (p) => p[0] === "-" ? p : " " + paramToVariableExpression(p) + " ")})`;
  }
  if (typeof value === "object" && value && "ref" in value) {
    return paramToVariableExpression(value.ref);
  }
  return false;
};
var scaleValueToCss = literalToCSS;
var borderValueToCss = (value, param) => {
  if (typeof value === "string") {
    return value;
  }
  if (value === true) {
    return borderValueToCss({}, param);
  }
  if (value === false) {
    return param === "columnBorder" ? borderValueToCss({ color: "transparent" }, param) : "none";
  }
  if (typeof value === "object" && value && "ref" in value) {
    return paramToVariableExpression(value.ref);
  }
  return borderStyleValueToCss(value.style ?? "solid") + " " + lengthValueToCss(value.width ?? { ref: "borderWidth" }) + " " + colorValueToCss(value.color ?? { ref: "borderColor" });
};
var shadowValueParamsToCss = (value) => {
  return [
    lengthValueToCss(value.offsetX ?? 0),
    lengthValueToCss(value.offsetY ?? 0),
    lengthValueToCss(value.radius ?? 0),
    lengthValueToCss(value.spread ?? 0),
    colorValueToCss(value.color ?? { ref: "foregroundColor" }),
    ...value.inset ? ["inset"] : []
  ].join(" ");
};
var shadowValueToCss = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (value === false) {
    return "none";
  }
  if (typeof value === "object" && value && "ref" in value) {
    return paramToVariableExpression(value.ref);
  }
  if (Array.isArray(value)) {
    return value.map(shadowValueParamsToCss).join(", ");
  }
  return shadowValueParamsToCss(value);
};
var borderStyleValueToCss = literalToCSS;
var fontFamilyValueToCss = (value) => {
  if (typeof value === "string") {
    return value.includes(",") ? value : quoteUnsafeChars(value);
  }
  if (typeof value === "object" && value && "googleFont" in value) {
    return fontFamilyValueToCss(value.googleFont);
  }
  if (typeof value === "object" && value && "ref" in value) {
    return paramToVariableExpression(value.ref);
  }
  if (Array.isArray(value)) {
    return value.map((font) => {
      if (typeof font === "object" && "googleFont" in font) {
        font = font.googleFont;
      }
      return quoteUnsafeChars(font);
    }).join(", ");
  }
  return false;
};
var quoteUnsafeChars = (font) => (
  // don't quote var() expressions or quote safe identifier names, so that
  // people can specify fonts like sans-serif which are keywords not strings,
  // or var(--my-var)
  /^[\w-]+$|\w\(/.test(font) ? font : JSON.stringify(font)
);
var fontWeightValueToCss = literalToCSS;
var imageValueToCss = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value && "url" in value) {
    return `url(${JSON.stringify(value.url)})`;
  }
  if (typeof value === "object" && value && "svg" in value) {
    return imageValueToCss({ url: `data:image/svg+xml,${encodeURIComponent(value.svg)}` });
  }
  if (typeof value === "object" && value && "ref" in value) {
    return paramToVariableExpression(value.ref);
  }
  return false;
};
var durationValueToCss = (value, param, themeLogger) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    if (value >= 10) {
      themeLogger?.warn(104, { value, param });
    }
    return `${value}s`;
  }
  if (typeof value === "object" && value && "ref" in value) {
    return paramToVariableExpression(value.ref);
  }
  return false;
};
var paramValidators = {
  color: colorValueToCss,
  colorScheme: colorSchemeValueToCss,
  length: lengthValueToCss,
  scale: scaleValueToCss,
  border: borderValueToCss,
  borderStyle: borderStyleValueToCss,
  shadow: shadowValueToCss,
  image: imageValueToCss,
  fontFamily: fontFamilyValueToCss,
  fontWeight: fontWeightValueToCss,
  duration: durationValueToCss
};
var paramValueToCss = (param, value, themeLogger) => {
  const type = getParamType(param);
  return paramValidators[type](value, param, themeLogger);
};

// packages/ag-stack/src/theming/themeImpl.ts
var _asThemeImpl = (theme) => {
  if (!(theme instanceof ThemeImpl)) {
    throw new Error("theme is not an object created by createTheme");
  }
  return theme;
};
var createSharedTheme = (themeLogger, overridePrefix) => new ThemeImpl({ themeLogger, overridePrefix });
var ThemeImpl = class _ThemeImpl {
  constructor(params, parts = []) {
    this.params = params;
    this.parts = parts;
  }
  withPart(part) {
    if (typeof part === "function") {
      part = part();
    }
    if (!(part instanceof PartImpl)) {
      this.params.themeLogger.preInitErr(259, "Invalid part", { part });
      return this;
    }
    return new _ThemeImpl(this.params, [...this.parts, part]);
  }
  withoutPart(feature) {
    return this.withPart(createPart({ feature }));
  }
  withParams(params, mode = defaultModeName) {
    return this.withPart(
      createPart({
        modeParams: { [mode]: params }
      })
    );
  }
  _startUse({ styleContainer, cssLayer, nonce, loadThemeGoogleFonts, moduleCss }) {
    if (_isStyleInjectionDisabled()) {
      return;
    }
    uninstallLegacyCSS();
    _injectCoreAndModuleCSS(styleContainer, cssLayer, nonce, moduleCss);
    const googleFontsUsed = getGoogleFontsUsed(this);
    if (googleFontsUsed.length > 0) {
      for (const googleFont of googleFontsUsed) {
        if (loadThemeGoogleFonts) {
          loadGoogleFont(googleFont, nonce);
        }
      }
    }
    for (const part of this.parts) {
      part.use(styleContainer, cssLayer, nonce);
    }
  }
  _getCssClasses() {
    if (FORCE_LEGACY_THEMES) {
      return ["", "ag-theme-quartz"];
    }
    return this._cssClassCache ?? (this._cssClassCache = [
      this._getParamsClassName(true),
      deduplicatePartsByFeature(this.parts).map((part) => part.use(void 0, void 0, void 0)).filter(Boolean).concat(this._getParamsClassName()).join(" ")
    ]);
  }
  _getClassNamesId() {
    return this._classNamesId ?? (this._classNamesId = ++getInjectionState().paramsId);
  }
  _getParamsClassName(inherit = false) {
    return `ag-theme-${inherit ? "inherit" : "params"}-${this._getClassNamesId()}`;
  }
  _getModeParams() {
    let paramsCache = this._paramsCache;
    if (!paramsCache) {
      const mergedModeParams = {
        // NOTE: defining the default mode here is important, it ensures
        // that the default mode is first in iteration order, which puts
        // it first in outputted CSS, allowing other modes to override it
        [defaultModeName]: { ...sharedDefaults }
      };
      for (const part of deduplicatePartsByFeature(this.parts)) {
        for (const partMode of Object.keys(part.modeParams)) {
          const partParams = part.modeParams[partMode];
          if (partParams) {
            const mergedParams = mergedModeParams[partMode] ?? (mergedModeParams[partMode] = {});
            const partParamNames = /* @__PURE__ */ new Set();
            for (const partParamName of Object.keys(partParams)) {
              const partParamValue = partParams[partParamName];
              if (partParamValue !== void 0) {
                mergedParams[partParamName] = partParamValue;
                partParamNames.add(partParamName);
              }
            }
            if (partMode === defaultModeName) {
              for (const mergedMode of Object.keys(mergedModeParams)) {
                const mergedParams2 = mergedModeParams[mergedMode];
                if (mergedMode !== defaultModeName) {
                  for (const partParamName of partParamNames) {
                    delete mergedParams2[partParamName];
                  }
                }
              }
            }
          }
        }
      }
      this._paramsCache = paramsCache = mergedModeParams;
    }
    return paramsCache;
  }
  _getParamsCss() {
    if (!this._paramsCssCache) {
      let variablesCss = "";
      let inheritanceCss = "";
      const modeParams = this._getModeParams();
      const { overridePrefix, themeLogger } = this.params;
      const cssOverridePrefix = overridePrefix ? `--ag-${overridePrefix}-` : void 0;
      for (const mode of Object.keys(modeParams)) {
        const params = modeParams[mode];
        if (mode !== defaultModeName) {
          const escapedMode = typeof CSS === "object" ? CSS.escape(mode) : mode;
          const wrapPrefix = `:where(html[data-ag-theme-mode="${escapedMode}"],body[data-ag-theme-mode="${escapedMode}"],.ag-theme-mode[data-ag-theme-mode="${escapedMode}"]) & {
`;
          variablesCss += wrapPrefix;
          inheritanceCss += wrapPrefix;
        }
        for (const key of Object.keys(params).sort()) {
          const value = params[key];
          const cssValue = paramValueToCss(key, value, themeLogger);
          if (cssValue === false) {
            themeLogger.error(107, { key, value });
          } else {
            const cssName = paramToVariableName(key);
            const overrideName = cssOverridePrefix ? cssName.replace("--ag-", cssOverridePrefix) : cssName;
            const inheritedName = cssName.replace("--ag-", "--ag-inherited-");
            variablesCss += `	${cssName}: var(${inheritedName}, ${cssValue});
`;
            inheritanceCss += `	${inheritedName}: var(${overrideName});
`;
          }
        }
        if (mode !== defaultModeName) {
          variablesCss += "}\n";
          inheritanceCss += "}\n";
        }
      }
      let css = `:where(.${this._getParamsClassName()}) {
${variablesCss}}
`;
      css += `:where(.${this._getParamsClassName(true)}) {
${inheritanceCss}}
`;
      this._paramsCssCache = css;
    }
    return this._paramsCssCache;
  }
};
var deduplicatePartsByFeature = (parts) => {
  const lastPartByFeature = /* @__PURE__ */ new Map();
  for (const part of parts) {
    lastPartByFeature.set(part.feature, part);
  }
  const result = [];
  for (const part of parts) {
    if (!part.feature || lastPartByFeature.get(part.feature) === part) {
      result.push(part);
    }
  }
  return result;
};
var getGoogleFontsUsed = (theme) => {
  const googleFontsUsed = /* @__PURE__ */ new Set();
  const visitParamValue = (paramValue) => {
    if (Array.isArray(paramValue)) {
      paramValue.forEach(visitParamValue);
    } else {
      const googleFont = paramValue?.googleFont;
      if (typeof googleFont === "string") {
        googleFontsUsed.add(googleFont);
      }
    }
  };
  const allModeValues = Object.values(theme._getModeParams());
  const allValues = allModeValues.flatMap((mv) => Object.values(mv));
  allValues.forEach(visitParamValue);
  return Array.from(googleFontsUsed).sort();
};
var uninstalledLegacyCSS = false;
var uninstallLegacyCSS = () => {
  if (uninstalledLegacyCSS) {
    return;
  }
  uninstalledLegacyCSS = true;
  for (const style of Array.from(document.head.querySelectorAll('style[data-ag-scope="legacy"]'))) {
    style.remove();
  }
};
var loadGoogleFont = async (font, nonce) => {
  const css = `@import url('https://${googleFontsDomain}/css2?family=${encodeURIComponent(font)}:wght@100;200;300;400;500;600;700;800;900&display=swap');
`;
  _injectGlobalCSS(css, document.head, `googleFont:${font}`, void 0, 0, nonce);
};
var googleFontsDomain = "fonts.googleapis.com";

// packages/ag-stack/src/core/baseEnvironment.ts
var LIST_ITEM_HEIGHT = {
  changeKey: "listItemHeight",
  type: "length",
  defaultValue: 24
};
var BaseEnvironment = class extends AgBeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "environment";
    this.sizeEls = /* @__PURE__ */ new Map();
    this.lastKnownValues = /* @__PURE__ */ new Map();
    this.sizesMeasured = false;
    this.globalCSS = [];
  }
  wireBeans(beans) {
    this.eRootDiv = beans.eRootDiv;
  }
  postConstruct() {
    const { gos, eRootDiv } = this;
    gos.setInstanceDomData(eRootDiv);
    const themeStyleContainer = gos.get("themeStyleContainer");
    const hasShadowRootGlobal = typeof ShadowRoot !== "undefined";
    const isShadowRoot = hasShadowRootGlobal && eRootDiv.getRootNode() instanceof ShadowRoot;
    this.eStyleContainer = (typeof themeStyleContainer === "function" ? themeStyleContainer() : themeStyleContainer) ?? (isShadowRoot ? eRootDiv : document.head);
    if (!themeStyleContainer && !isShadowRoot && hasShadowRootGlobal) {
      warnOnAttachToShadowRoot(eRootDiv, this.shadowRootError.bind(this), this.addDestroyFunc.bind(this));
    }
    this.cssLayer = gos.get("themeCssLayer");
    this.styleNonce = gos.get("styleNonce");
    this.addManagedPropertyListener("theme", () => this.handleThemeChange());
    this.handleThemeChange();
    this.mutationObserver = new MutationObserver(() => {
      this.fireStylesChangedEvent("theme");
    });
    this.addDestroyFunc(() => this.mutationObserver.disconnect());
    this.initStyledRoot();
    this.getSizeEl(LIST_ITEM_HEIGHT);
    this.initVariables();
    this.addDestroyFunc(() => _unregisterInstanceUsingThemingAPI(this));
  }
  getStyledRootClasses(hasAncestorStyledRoot, legacyThemeClassesInherited) {
    const { theme } = this;
    const [inheritClass, applyClass] = theme ? theme._getCssClasses() : ["", this.useLegacyThemeClasses(legacyThemeClassesInherited)];
    const directionClass = this.gos.get("enableRtl") ? "ag-rtl" : "ag-ltr";
    if (hasAncestorStyledRoot) {
      return ["", "", directionClass];
    }
    return [inheritClass, applyClass, directionClass];
  }
  /**
   * Get legacy theme classes, setting up a mutation observer to watch for changes on first call.
   * When `legacyThemeClassesInherited` is set, returns '' instead of the classes while still
   * walking the ancestors to set up the observer.
   */
  useLegacyThemeClasses(legacyThemeClassesInherited) {
    const themeClasses = /* @__PURE__ */ new Set();
    this.mutationObserver.disconnect();
    let node = this.eRootDiv.parentElement;
    while (node) {
      if (!node.classList.contains("ag-styled-root")) {
        let isThemeEl = false;
        for (const cls of node.classList) {
          if (cls.startsWith("ag-theme-")) {
            isThemeEl = true;
            themeClasses.add(cls);
          }
        }
        if (isThemeEl) {
          this.mutationObserver.observe(node, {
            attributes: true,
            attributeFilter: ["class"]
          });
        }
      }
      node = node.parentElement;
    }
    return legacyThemeClassesInherited ? "" : [...themeClasses].join(" ");
  }
  onThemeChanged(handler) {
    const listener = (e) => {
      if (e.themeChanged) {
        handler();
      }
    };
    this.eventSvc.addListener("stylesChanged", listener);
    return () => this.eventSvc.removeListener("stylesChanged", listener);
  }
  addGlobalCSS(css, debugId) {
    if (this.theme) {
      _injectGlobalCSS(css, this.eStyleContainer, debugId, this.cssLayer, 0, this.styleNonce);
    } else {
      this.globalCSS.push([css, debugId]);
    }
  }
  getDefaultListItemHeight() {
    return this.getCSSVariablePixelValue(LIST_ITEM_HEIGHT);
  }
  getCSSVariablePixelValue(variable) {
    const cached = this.lastKnownValues.get(variable);
    if (cached != null) {
      return cached;
    }
    const measurement = this.measureSizeEl(variable);
    if (typeof measurement !== "number") {
      return variable.defaultValue;
    }
    this.lastKnownValues.set(variable, measurement);
    return measurement;
  }
  measureSizeEl(variable) {
    const sizeEl = this.getSizeEl(variable);
    if (sizeEl.offsetParent == null) {
      return "detached";
    }
    const newSize = sizeEl.offsetWidth - 1;
    if (newSize === NO_VALUE_SENTINEL) {
      return "no-styles";
    }
    this.sizesMeasured = true;
    if (newSize < 0) {
      return "no-length";
    }
    return newSize;
  }
  getMeasurementContainer() {
    let container = this.eMeasurementContainer;
    if (!container) {
      container = this.eMeasurementContainer = _createAgElement({ tag: "div", cls: "ag-measurement-container" });
      this.eRootDiv.appendChild(container);
      this.addDestroyFunc(() => container?.remove());
    }
    return container;
  }
  getSizeEl(variable) {
    let sizeEl = this.sizeEls.get(variable);
    if (sizeEl) {
      return sizeEl;
    }
    const container = this.getMeasurementContainer();
    sizeEl = _createAgElement({ tag: "div" });
    const cssName = this.setSizeElStyles(sizeEl, variable);
    container.appendChild(sizeEl);
    this.sizeEls.set(variable, sizeEl);
    const { type, noWarn } = variable;
    if (type !== "length" && type !== "border") {
      return sizeEl;
    }
    let lastMeasurement = this.measureSizeEl(variable);
    if (lastMeasurement === "no-styles" && !noWarn) {
      this.varError(cssName, variable.defaultValue);
    }
    const unsubscribe = _observeResize(this.beans, sizeEl, () => {
      const newMeasurement = this.measureSizeEl(variable);
      if (newMeasurement === "detached" || newMeasurement === "no-styles") {
        return;
      }
      this.lastKnownValues.set(variable, newMeasurement === "no-length" ? variable.defaultValue : newMeasurement);
      if (newMeasurement !== lastMeasurement) {
        lastMeasurement = newMeasurement;
        this.fireStylesChangedEvent(variable.changeKey);
      }
    });
    this.addDestroyFunc(() => unsubscribe());
    return sizeEl;
  }
  setSizeElStyles(sizeEl, variable) {
    const { changeKey, type } = variable;
    let cssName = paramToVariableName(changeKey);
    if (type === "border") {
      if (cssName.endsWith("-width")) {
        cssName = cssName.slice(0, -6);
      }
      sizeEl.className = "ag-measurement-element-border";
      sizeEl.style.paddingLeft = "1px";
      sizeEl.style.setProperty(
        "--ag-internal-measurement-border",
        `var(${cssName}, solid ${NO_VALUE_SENTINEL}px)`
      );
    } else {
      sizeEl.style.width = `calc(var(${cssName}, ${NO_VALUE_SENTINEL}px) + 1px)`;
    }
    return cssName;
  }
  handleThemeChange() {
    const { gos, theme: oldTheme } = this;
    const themeProperty = gos.get("theme");
    let newTheme;
    if (themeProperty === "legacy") {
      newTheme = void 0;
    } else {
      const themeOrDefault = themeProperty ?? this.getDefaultTheme();
      if (themeOrDefault instanceof ThemeImpl) {
        newTheme = themeOrDefault;
      } else {
        this.themeError(themeOrDefault);
      }
    }
    if (newTheme !== oldTheme) {
      this.handleNewTheme(newTheme);
    }
    this.postProcessThemeChange(newTheme, themeProperty);
  }
  handleNewTheme(newTheme) {
    const { gos, globalCSS } = this;
    const additionalCss = this.getAdditionalCss();
    if (newTheme) {
      _injectCoreAndModuleCSS(this.eStyleContainer, this.cssLayer, this.styleNonce, additionalCss);
      for (const [css, debugId] of globalCSS) {
        _injectGlobalCSS(css, this.eStyleContainer, debugId, this.cssLayer, 0, this.styleNonce);
      }
      globalCSS.length = 0;
    }
    this.theme = newTheme;
    newTheme?._startUse({
      loadThemeGoogleFonts: gos.get("loadThemeGoogleFonts"),
      styleContainer: this.eStyleContainer,
      cssLayer: this.cssLayer,
      nonce: this.styleNonce,
      moduleCss: additionalCss
    });
    _useParamsCss(
      this,
      newTheme?._getParamsCss() ?? null,
      newTheme?._getParamsClassName() ?? null,
      this.eStyleContainer,
      this.cssLayer,
      this.styleNonce
    );
    this.fireStylesChangedEvent("theme");
  }
  fireStylesChangedEvent(change) {
    this.eventSvc.dispatchEvent({
      type: "stylesChanged",
      [`${change}Changed`]: true
    });
  }
  // overridden by studio
  initStyledRoot() {
    const legacyThemeClassesInherited = true;
    this.addDestroyFunc(
      _initStyledRootFromInnerOfThreeElements(
        this,
        this.eRootDiv,
        void 0,
        this.beans.hasAncestorStyledRoot,
        legacyThemeClassesInherited
      )
    );
  }
};
var NO_VALUE_SENTINEL = 15538;
var warnOnAttachToShadowRoot = (el, errorCallback, onDestroy) => {
  let retries = 60;
  const interval = setInterval(() => {
    if (typeof ShadowRoot !== "undefined" && el.getRootNode() instanceof ShadowRoot) {
      errorCallback();
      clearInterval(interval);
    }
    if (el.isConnected || --retries < 0) {
      clearInterval(interval);
    }
  }, 1e3);
  onDestroy(() => clearInterval(interval));
};

// packages/ag-stack/src/core/baseRegistry.ts
var BaseRegistry = class extends AgBeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "registry";
  }
  registerDynamicBeans(dynamicBeans) {
    if (dynamicBeans) {
      this.dynamicBeans ?? (this.dynamicBeans = {});
      for (const name of Object.keys(dynamicBeans)) {
        this.dynamicBeans[name] = dynamicBeans[name];
      }
    }
  }
  createDynamicBean(name, mandatory, ...args) {
    if (!this.dynamicBeans) {
      throw this.createDynamicError(name, true);
    }
    const BeanClass = this.dynamicBeans[name];
    if (BeanClass == null) {
      if (mandatory) {
        throw this.createDynamicError(name, false);
      }
      return void 0;
    }
    return new BeanClass(...args);
  }
};

// packages/ag-stack/src/events/baseEventService.ts
var BaseEventService = class extends AgBeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "eventSvc";
    this.eventServiceType = "global";
    this.globalSvc = new LocalEventService();
  }
  addListener(eventType, listener, async) {
    this.globalSvc.addEventListener(eventType, listener, async);
  }
  removeListener(eventType, listener, async) {
    this.globalSvc.removeEventListener(eventType, listener, async);
  }
  addGlobalListener(listener, async = false) {
    this.globalSvc.addGlobalListener(listener, async);
  }
  removeGlobalListener(listener, async = false) {
    this.globalSvc.removeGlobalListener(listener, async);
  }
  dispatchEvent(event) {
    this.globalSvc.dispatchEvent(this.gos.addCommon(event));
  }
  dispatchEventOnce(event) {
    this.globalSvc.dispatchEventOnce(this.gos.addCommon(event));
  }
};

// packages/ag-stack/src/utils/focus.ts
var FOCUS_MANAGED_CLASS = "ag-focus-managed";
var keyboardModeActive = false;
var instanceCount = 0;
function addKeyboardModeEvents(doc) {
  if (instanceCount > 0) {
    return;
  }
  doc.addEventListener("keydown", toggleKeyboardMode);
  doc.addEventListener("mousedown", toggleKeyboardMode);
}
function removeKeyboardModeEvents(doc) {
  if (instanceCount > 0) {
    return;
  }
  doc.removeEventListener("keydown", toggleKeyboardMode);
  doc.removeEventListener("mousedown", toggleKeyboardMode);
}
function toggleKeyboardMode(event) {
  const isKeyboardActive = keyboardModeActive;
  const isKeyboardEvent = event.type === "keydown";
  if (isKeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
  }
  if (isKeyboardActive === isKeyboardEvent) {
    return;
  }
  keyboardModeActive = isKeyboardEvent;
}
function _registerKeyboardFocusEvents(beans) {
  const eDocument = _getDocument(beans);
  addKeyboardModeEvents(eDocument);
  instanceCount++;
  return () => {
    instanceCount--;
    removeKeyboardModeEvents(eDocument);
  };
}
function _isKeyboardMode() {
  return keyboardModeActive;
}
function _findFocusableElements(rootNode, exclude, onlyUnmanaged = false) {
  const focusableString = FOCUSABLE_SELECTOR;
  let excludeString = FOCUSABLE_EXCLUDE;
  if (exclude) {
    excludeString += ", " + exclude;
  }
  if (onlyUnmanaged) {
    excludeString += ', [tabindex="-1"]';
  }
  const nodes = Array.prototype.slice.apply(rootNode.querySelectorAll(focusableString)).filter((node) => {
    return _isVisible(node);
  });
  const excludeNodes = new Set(rootNode.querySelectorAll(excludeString));
  if (!excludeNodes.size) {
    return nodes;
  }
  return nodes.filter((element) => !excludeNodes.has(element));
}
function _focusInto(rootNode, up = false, onlyUnmanaged = false, excludeTabGuards = false) {
  const focusableElements = _findFocusableElements(
    rootNode,
    excludeTabGuards ? ".ag-tab-guard" : null,
    onlyUnmanaged
  );
  const toFocus = up ? _last(focusableElements) : focusableElements[0];
  if (toFocus) {
    toFocus.focus({ preventScroll: true });
    return true;
  }
  return false;
}
function _focusIntoTabbableFirst(rootNode, up = false, excludeTabGuards = false) {
  const candidates = _findFocusableElements(rootNode, excludeTabGuards ? ".ag-tab-guard" : null);
  const tabbable = candidates.filter((element) => element.tabIndex >= 0);
  const pool = tabbable.length ? tabbable : candidates.filter((element) => {
    const managedRoot = element.closest(`.${FOCUS_MANAGED_CLASS}`);
    return managedRoot !== null && rootNode.contains(managedRoot);
  });
  const toFocus = up ? _last(pool) : pool[0];
  if (toFocus) {
    toFocus.focus({ preventScroll: true });
    return true;
  }
  return false;
}
function _findNextFocusableElement(params) {
  const { beans, rootNode, onlyManaged, onlyUnmanaged, backwards } = params;
  const activeEl = _getActiveDomElement(beans);
  let focusable = _findFocusableElements(rootNode, onlyManaged ? ':not([tabindex="-1"])' : null);
  if (onlyUnmanaged) {
    focusable = focusable.filter((el) => el === activeEl || _getTabIndex(el) !== "-1");
  }
  const activeIndex = onlyManaged ? focusable.findIndex((el) => el.contains(activeEl)) : focusable.indexOf(activeEl);
  const nextIndex = activeIndex + (backwards ? -1 : 1);
  if (nextIndex < 0 || nextIndex >= focusable.length) {
    return null;
  }
  return focusable[nextIndex];
}
function _findTabbableParent(node, limit = 5) {
  let counter = 0;
  while (node && _getTabIndex(node) === null && ++counter <= limit) {
    node = node.parentElement;
  }
  if (_getTabIndex(node) === null) {
    return null;
  }
  return node;
}
function _scrollHorizontallyToShow(target) {
  let container = target;
  while (container && !_canScrollHorizontally(container)) {
    const parentEl = container.parentElement;
    container = parentEl?.className.startsWith("ag-") ? parentEl : null;
  }
  if (!container) {
    return;
  }
  if (target === _findFocusableElements(container, null, true)[0]) {
    container.scrollLeft = 0;
  }
  const c = container.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  if (t.left < c.left) {
    container.scrollLeft -= c.left - t.left;
  } else if (t.right > c.right) {
    container.scrollLeft += t.right - c.right;
  }
}
function _canScrollHorizontally(el) {
  const overflowX = getComputedStyle(el).overflowX;
  return overflowX === "auto" || overflowX === "scroll";
}

// packages/ag-stack/src/focus/agManagedFocusFeature.ts
var AgManagedFocusFeature = class extends AgBeanStub {
  constructor(eFocusable, stopPropagationCallbacks = {
    isStopPropagation: () => false,
    stopPropagation: () => {
    }
  }, callbacks = {}) {
    super();
    this.eFocusable = eFocusable;
    this.stopPropagationCallbacks = stopPropagationCallbacks;
    this.callbacks = callbacks;
    this.callbacks = {
      shouldStopEventPropagation: () => false,
      onTabKeyDown: (e) => {
        if (e.defaultPrevented) {
          return;
        }
        const nextRoot = _findNextFocusableElement({
          beans: this.beans,
          rootNode: this.eFocusable,
          backwards: e.shiftKey
        });
        if (!nextRoot) {
          return;
        }
        nextRoot.focus();
        e.preventDefault();
      },
      ...callbacks
    };
  }
  postConstruct() {
    const {
      eFocusable,
      callbacks: { onFocusIn, onFocusOut }
    } = this;
    eFocusable.classList.add(FOCUS_MANAGED_CLASS);
    this.addKeyDownListeners(eFocusable);
    if (onFocusIn) {
      this.addManagedElementListeners(eFocusable, { focusin: onFocusIn });
    }
    if (onFocusOut) {
      this.addManagedElementListeners(eFocusable, { focusout: onFocusOut });
    }
  }
  addKeyDownListeners(eGui) {
    this.addManagedElementListeners(eGui, {
      keydown: (e) => {
        if (e.defaultPrevented || this.stopPropagationCallbacks.isStopPropagation(e)) {
          return;
        }
        const { callbacks } = this;
        if (callbacks.shouldStopEventPropagation(e)) {
          this.stopPropagationCallbacks.stopPropagation(e);
          return;
        }
        if (e.key === KeyCode.TAB) {
          callbacks.onTabKeyDown(e);
        } else if (callbacks.handleKeyDown) {
          callbacks.handleKeyDown(e);
        }
      }
    });
  }
};

// packages/ag-stack/src/focus/tabGuardCtrl.ts
var TabGuardClassNames = {
  TAB_GUARD: "ag-tab-guard",
  TAB_GUARD_TOP: "ag-tab-guard-top",
  TAB_GUARD_BOTTOM: "ag-tab-guard-bottom"
};
var AgTabGuardCtrl = class extends AgBeanStub {
  constructor(params, stopPropagationCallbacks) {
    super();
    this.stopPropagationCallbacks = stopPropagationCallbacks;
    this.skipTabGuardFocus = false;
    this.forcingFocusOut = false;
    this.lastFocusedElementInside = null;
    // Used when `isFocusableContainer` enabled
    this.allowFocus = false;
    const {
      comp,
      eTopGuard,
      eBottomGuard,
      focusTrapActive,
      forceFocusOutWhenTabGuardsAreEmpty,
      isFocusableContainer,
      focusInnerElement,
      onFocusIn,
      onFocusOut,
      onGuardFocusedFromInside,
      shouldStopEventPropagation,
      onTabKeyDown,
      handleKeyDown,
      isEmpty,
      eFocusableElement
    } = params;
    this.comp = comp;
    this.eTopGuard = eTopGuard;
    this.eBottomGuard = eBottomGuard;
    this.providedFocusInnerElement = focusInnerElement;
    this.eFocusableElement = eFocusableElement;
    this.focusTrapActive = !!focusTrapActive;
    this.forceFocusOutWhenTabGuardsAreEmpty = !!forceFocusOutWhenTabGuardsAreEmpty;
    this.isFocusableContainer = !!isFocusableContainer;
    this.providedFocusIn = onFocusIn;
    this.providedFocusOut = onFocusOut;
    this.providedOnGuardFocusedFromInside = onGuardFocusedFromInside;
    this.providedShouldStopEventPropagation = shouldStopEventPropagation;
    this.providedOnTabKeyDown = onTabKeyDown;
    this.providedHandleKeyDown = handleKeyDown;
    this.providedIsEmpty = isEmpty;
  }
  postConstruct() {
    this.createManagedBean(
      new AgManagedFocusFeature(this.eFocusableElement, this.stopPropagationCallbacks, {
        shouldStopEventPropagation: () => this.shouldStopEventPropagation(),
        onTabKeyDown: (e) => this.onTabKeyDown(e),
        handleKeyDown: (e) => this.handleKeyDown(e),
        onFocusIn: (e) => this.onFocusIn(e),
        onFocusOut: (e) => this.onFocusOut(e)
      })
    );
    this.activateTabGuards();
    for (const guard of [this.eTopGuard, this.eBottomGuard]) {
      this.addManagedElementListeners(guard, { focus: this.onFocus.bind(this) });
    }
  }
  handleKeyDown(e) {
    if (this.providedHandleKeyDown) {
      this.providedHandleKeyDown(e);
    }
  }
  tabGuardsAreActive() {
    return !!this.eTopGuard && this.eTopGuard.hasAttribute("tabIndex");
  }
  shouldStopEventPropagation() {
    if (this.providedShouldStopEventPropagation) {
      return this.providedShouldStopEventPropagation();
    }
    return false;
  }
  activateTabGuards() {
    if (this.forcingFocusOut) {
      return;
    }
    const tabIndex = this.gos.get("tabIndex");
    this.comp.setTabIndex(tabIndex.toString());
  }
  deactivateTabGuards() {
    this.comp.setTabIndex();
  }
  onFocus(e) {
    if (this.isFocusableContainer && !this.eFocusableElement.contains(e.relatedTarget)) {
      if (!this.allowFocus) {
        this.findNextElementOutsideAndFocus(e.target === this.eBottomGuard);
        return;
      }
    }
    if (this.skipTabGuardFocus) {
      this.skipTabGuardFocus = false;
      return;
    }
    if (this.forceFocusOutWhenTabGuardsAreEmpty) {
      const isEmpty = this.providedIsEmpty ? this.providedIsEmpty() : _findFocusableElements(this.eFocusableElement, ".ag-tab-guard").length === 0;
      if (isEmpty) {
        this.findNextElementOutsideAndFocus(e.target === this.eBottomGuard);
        return;
      }
    }
    if (this.isFocusableContainer && this.eFocusableElement.contains(e.relatedTarget)) {
      const fromBottom2 = e.target === this.eBottomGuard;
      const focusHandled = this.providedOnGuardFocusedFromInside?.(fromBottom2);
      if (focusHandled === true && _getDocument(this.beans).activeElement === e.target) {
        const relatedTarget = e.relatedTarget;
        const focusTarget = relatedTarget.classList.contains(TabGuardClassNames.TAB_GUARD) ? this.lastFocusedElementInside : relatedTarget;
        focusTarget?.focus();
      } else if (focusHandled === false) {
        this.findNextElementOutsideAndFocus(!fromBottom2);
      }
      return;
    }
    const fromBottom = e.target === this.eBottomGuard;
    const hasFocusedInnerElement = this.providedFocusInnerElement ? this.providedFocusInnerElement(fromBottom) : this.focusInnerElement(fromBottom);
    if (!hasFocusedInnerElement && this.forceFocusOutWhenTabGuardsAreEmpty) {
      this.findNextElementOutsideAndFocus(e.target === this.eBottomGuard);
    }
  }
  findNextElementOutsideAndFocus(up, excludeElements) {
    const eDocument = _getDocument(this.beans);
    const focusableEls = _findFocusableElements(eDocument.body, null, true).filter((element) => element.tabIndex >= 0).map((element, domIndex) => ({ element, domIndex })).sort((a, b) => {
      const tabIndexA = a.element.tabIndex || Number.MAX_SAFE_INTEGER;
      const tabIndexB = b.element.tabIndex || Number.MAX_SAFE_INTEGER;
      return tabIndexA - tabIndexB || a.domIndex - b.domIndex;
    }).map(({ element }) => element);
    const tabGuard = up ? this.eTopGuard : this.eBottomGuard;
    const index = focusableEls.indexOf(tabGuard);
    if (index === -1) {
      return false;
    }
    const step = up ? -1 : 1;
    for (let currentIndex = index + step; currentIndex >= 0 && currentIndex < focusableEls.length; currentIndex += step) {
      const focusTarget = focusableEls[currentIndex];
      if (!excludeElements?.some((excludeElement) => excludeElement.contains(focusTarget))) {
        focusTarget.focus();
        return true;
      }
    }
    return false;
  }
  onFocusIn(e) {
    if (this.focusTrapActive || this.forcingFocusOut) {
      return;
    }
    const target = e.target;
    if (!target.classList.contains(TabGuardClassNames.TAB_GUARD)) {
      this.lastFocusedElementInside = target;
    }
    if (this.providedFocusIn) {
      this.providedFocusIn(e);
    }
    if (!this.isFocusableContainer) {
      this.deactivateTabGuards();
    }
  }
  onFocusOut(e) {
    if (this.focusTrapActive) {
      return;
    }
    if (this.providedFocusOut) {
      this.providedFocusOut(e);
    }
    if (!this.eFocusableElement.contains(e.relatedTarget)) {
      this.activateTabGuards();
    }
  }
  onTabKeyDown(e) {
    if (this.providedOnTabKeyDown) {
      this.providedOnTabKeyDown(e);
      return;
    }
    if (this.focusTrapActive) {
      return;
    }
    if (e.defaultPrevented) {
      return;
    }
    const tabGuardsAreActive = this.tabGuardsAreActive();
    if (tabGuardsAreActive) {
      this.deactivateTabGuards();
    }
    const nextRoot = this.getNextFocusableElement(e.shiftKey);
    if (tabGuardsAreActive) {
      setTimeout(() => this.activateTabGuards(), 0);
    }
    if (!nextRoot) {
      return;
    }
    nextRoot.focus();
    e.preventDefault();
  }
  focusInnerElement(fromBottom = false) {
    const focusable = _findFocusableElements(this.eFocusableElement);
    if (this.tabGuardsAreActive()) {
      focusable.splice(0, 1);
      focusable.splice(-1, 1);
    }
    if (!focusable.length) {
      return false;
    }
    focusable[fromBottom ? focusable.length - 1 : 0].focus({ preventScroll: true });
    return true;
  }
  getNextFocusableElement(backwards) {
    return _findNextFocusableElement({ beans: this.beans, rootNode: this.eFocusableElement, backwards });
  }
  forceFocusOutOfContainer(up = false) {
    if (this.forcingFocusOut) {
      return;
    }
    const tabGuardToFocus = up ? this.eTopGuard : this.eBottomGuard;
    this.activateTabGuards();
    this.skipTabGuardFocus = true;
    this.forcingFocusOut = true;
    tabGuardToFocus.focus();
    window.setTimeout(() => {
      this.forcingFocusOut = false;
      this.activateTabGuards();
    });
  }
  focusNextElementOutsideContainer(up, excludeElements) {
    return this.findNextElementOutsideAndFocus(up, excludeElements);
  }
  isTabGuard(element, bottom) {
    return element === this.eTopGuard && !bottom || element === this.eBottomGuard && (bottom ?? true);
  }
  setAllowFocus(allowFocus) {
    this.allowFocus = allowFocus;
  }
};

// packages/ag-stack/src/focus/agTabGuardFeature.ts
var AgTabGuardFeature = class extends AgBeanStub {
  constructor(comp, stopPropagationCallbacks) {
    super();
    this.comp = comp;
    this.stopPropagationCallbacks = stopPropagationCallbacks;
  }
  initialiseTabGuard(params) {
    this.eTopGuard = this.createTabGuard("top");
    this.eBottomGuard = this.createTabGuard("bottom");
    this.eFocusableElement = this.comp.getFocusableElement();
    const { eTopGuard, eBottomGuard, eFocusableElement, stopPropagationCallbacks } = this;
    const tabGuards = [eTopGuard, eBottomGuard];
    const compProxy = {
      setTabIndex: (tabIndex) => {
        for (const tabGuard of tabGuards) {
          if (tabIndex == null) {
            tabGuard.removeAttribute("tabindex");
          } else {
            tabGuard.setAttribute("tabindex", tabIndex);
          }
        }
      }
    };
    this.addTabGuards(eTopGuard, eBottomGuard);
    const {
      focusTrapActive = false,
      onFocusIn,
      onFocusOut,
      onGuardFocusedFromInside,
      focusInnerElement,
      handleKeyDown,
      onTabKeyDown,
      shouldStopEventPropagation,
      isEmpty,
      forceFocusOutWhenTabGuardsAreEmpty,
      isFocusableContainer
    } = params;
    this.tabGuardCtrl = this.createManagedBean(
      new AgTabGuardCtrl(
        {
          comp: compProxy,
          focusTrapActive,
          eTopGuard,
          eBottomGuard,
          eFocusableElement,
          onFocusIn,
          onFocusOut,
          onGuardFocusedFromInside,
          focusInnerElement,
          handleKeyDown,
          onTabKeyDown,
          shouldStopEventPropagation,
          isEmpty,
          forceFocusOutWhenTabGuardsAreEmpty,
          isFocusableContainer
        },
        stopPropagationCallbacks
      )
    );
  }
  getTabGuardCtrl() {
    return this.tabGuardCtrl;
  }
  createTabGuard(side) {
    const tabGuard = _getDocument(this.beans).createElement("div");
    const cls = side === "top" ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;
    tabGuard.classList.add(TabGuardClassNames.TAB_GUARD, cls);
    _setAriaRole(tabGuard, "presentation");
    return tabGuard;
  }
  addTabGuards(topTabGuard, bottomTabGuard) {
    const eFocusableElement = this.eFocusableElement;
    eFocusableElement.prepend(topTabGuard);
    eFocusableElement.append(bottomTabGuard);
  }
  removeAllChildrenExceptTabGuards() {
    const tabGuards = [this.eTopGuard, this.eBottomGuard];
    _clearElement(this.comp.getFocusableElement());
    this.addTabGuards(...tabGuards);
  }
  forceFocusOutOfContainer(up = false) {
    this.tabGuardCtrl.forceFocusOutOfContainer(up);
  }
  focusNextElementOutsideContainer(up, excludeElements) {
    return this.tabGuardCtrl.focusNextElementOutsideContainer(up, excludeElements);
  }
  appendChild(appendChild, newChild, container) {
    if (!_isNodeOrElement(newChild)) {
      newChild = newChild.getGui();
    }
    const { eBottomGuard: bottomTabGuard } = this;
    if (bottomTabGuard) {
      bottomTabGuard.before(newChild);
    } else {
      appendChild(newChild, container);
    }
  }
  destroy() {
    const { eTopGuard, eBottomGuard } = this;
    _removeFromParent(eTopGuard);
    _removeFromParent(eBottomGuard);
    super.destroy();
  }
};

// packages/ag-stack/src/focus/agTabGuardComp.ts
var AgTabGuardComp = class extends AgComponentStub {
  initialiseTabGuard(params, stopPropagationCallbacks) {
    this.tabGuardFeature = this.createManagedBean(new AgTabGuardFeature(this, stopPropagationCallbacks));
    this.tabGuardFeature.initialiseTabGuard(params);
  }
  forceFocusOutOfContainer(up = false) {
    this.tabGuardFeature.forceFocusOutOfContainer(up);
  }
  focusNextElementOutsideContainer(up, excludeElements) {
    return this.tabGuardFeature.focusNextElementOutsideContainer(up, excludeElements);
  }
  appendChild(newChild, container) {
    this.tabGuardFeature.appendChild(super.appendChild.bind(this), newChild, container);
  }
};

// packages/ag-stack/src/popup/agPopupComponent.ts
var AgPopupComponent = class extends AgComponentStub {
  isPopup() {
    return true;
  }
  setParentComponent(container) {
    container.addCss("ag-has-popup");
    super.setParentComponent(container);
  }
  destroy() {
    const parentComp = this.parentComponent;
    const hasParent = parentComp?.isAlive();
    if (hasParent) {
      parentComp.getGui().classList.remove("ag-has-popup");
    }
    super.destroy();
  }
};

// packages/ag-stack/src/popup/popupPositionUtils.ts
var MIRRORED_ANCHORS = {
  tl: "tr",
  tr: "tl",
  l: "r",
  r: "l",
  bl: "br",
  br: "bl"
};
function getRectSize(rect) {
  return {
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };
}
function fitsWithinBounds(position, targetSize, boundsSize) {
  return position.x >= 0 && position.y >= 0 && position.x + targetSize.width <= boundsSize.width && position.y + targetSize.height <= boundsSize.height;
}
function toRelativeRect(rect, parentRect) {
  return {
    top: rect.top - parentRect.top,
    left: rect.left - parentRect.left,
    right: rect.right - parentRect.left,
    bottom: rect.bottom - parentRect.top
  };
}
function computeAlignedPosition(referenceRect, targetSize, alignment, gap = 0) {
  const [targetAnchor, refAnchor] = alignment.split("-");
  const ref = getAnchorPoint(referenceRect, refAnchor);
  const offset = getAnchorOffset(targetSize, targetAnchor);
  const gapDir = getGapDirection(targetAnchor, refAnchor);
  return {
    x: ref.x - offset.x + gapDir.dx * gap,
    y: ref.y - offset.y + gapDir.dy * gap
  };
}
function findBestPlacement(referenceRect, targetSize, parentSize, placements, gapOrOptions = 0) {
  const { gap, enableRtl, mirrorPlacementsInRtl } = normaliseFindBestPlacementOptions(gapOrOptions);
  const effectivePlacements = getEffectivePlacements(placements, enableRtl, mirrorPlacementsInRtl);
  const { width, height } = targetSize;
  const maxX = Math.max(parentSize.width - width, 0);
  const maxY = Math.max(parentSize.height - height, 0);
  for (const alignment of effectivePlacements) {
    const pos = computeAlignedPosition(referenceRect, targetSize, alignment, gap);
    const clampedX = Math.min(Math.max(pos.x, 0), maxX);
    const clampedY = Math.min(Math.max(pos.y, 0), maxY);
    const noOverlap = clampedX + width <= referenceRect.left || clampedX >= referenceRect.right || clampedY + height <= referenceRect.top || clampedY >= referenceRect.bottom;
    if (noOverlap) {
      return { x: clampedX, y: clampedY };
    }
  }
  const fallback = computeAlignedPosition(referenceRect, targetSize, effectivePlacements[0], gap);
  return {
    x: Math.min(Math.max(fallback.x, 0), maxX),
    y: Math.min(Math.max(fallback.y, 0), maxY)
  };
}
function getEffectivePlacements(placements, enableRtl = false, mirrorPlacementsInRtl = true) {
  if (!enableRtl || !mirrorPlacementsInRtl) {
    return placements;
  }
  return placements.map(mirrorAlignment);
}
function getAnchorPoint(rect, anchor) {
  const cx = (rect.left + rect.right) / 2;
  const cy = (rect.top + rect.bottom) / 2;
  switch (anchor) {
    case "tl":
      return { x: rect.left, y: rect.top };
    case "tc":
      return { x: cx, y: rect.top };
    case "tr":
      return { x: rect.right, y: rect.top };
    case "l":
      return { x: rect.left, y: cy };
    case "c":
      return { x: cx, y: cy };
    case "r":
      return { x: rect.right, y: cy };
    case "bl":
      return { x: rect.left, y: rect.bottom };
    case "bc":
      return { x: cx, y: rect.bottom };
    case "br":
      return { x: rect.right, y: rect.bottom };
  }
}
function getAnchorOffset(size, anchor) {
  return getAnchorPoint({ top: 0, left: 0, right: size.width, bottom: size.height }, anchor);
}
function getGapDirection(targetAnchor, refAnchor) {
  const th = anchorH(targetAnchor);
  const rh = anchorH(refAnchor);
  const tv = anchorV(targetAnchor);
  const rv = anchorV(refAnchor);
  return {
    dx: Math.sign(rh - th),
    dy: Math.sign(rv - tv)
  };
}
function normaliseFindBestPlacementOptions(gapOrOptions) {
  if (typeof gapOrOptions === "number") {
    return {
      gap: gapOrOptions,
      enableRtl: false,
      mirrorPlacementsInRtl: true
    };
  }
  return {
    gap: gapOrOptions.gap ?? 0,
    enableRtl: gapOrOptions.enableRtl ?? false,
    mirrorPlacementsInRtl: gapOrOptions.mirrorPlacementsInRtl ?? true
  };
}
function mirrorAlignment(alignment) {
  const [targetAnchor, referenceAnchor] = alignment.split("-");
  return `${mirrorAnchor(targetAnchor)}-${mirrorAnchor(referenceAnchor)}`;
}
function mirrorAnchor(anchor) {
  return MIRRORED_ANCHORS[anchor] ?? anchor;
}
function anchorH(anchor) {
  const ch = anchor.length === 2 ? anchor[1] : anchor;
  if (ch === "l") {
    return -1;
  }
  if (ch === "r") {
    return 1;
  }
  return 0;
}
function anchorV(anchor) {
  if (anchor.length === 1) {
    return 0;
  }
  if (anchor.startsWith("t")) {
    return -1;
  }
  if (anchor.startsWith("b")) {
    return 1;
  }
  return 0;
}

// packages/ag-stack/src/popup/basePopupService.ts
var instanceIdSeq = 0;
var WAIT_FOR_POPUP_CONTENT_RESIZE = 200;
var BasePopupService = class extends AgBeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "popupSvc";
    this.popupList = [];
  }
  getPopupParent() {
    const ePopupParent = this.gos.get("popupParent");
    if (ePopupParent) {
      return ePopupParent;
    }
    return this.getDefaultPopupParent();
  }
  positionPopupUnderMouseEvent(params) {
    const { ePopup, nudgeX, nudgeY, skipObserver } = params;
    this.positionPopup({
      ePopup,
      nudgeX,
      nudgeY,
      keepWithinBounds: true,
      skipObserver,
      updatePosition: () => this.calculatePointerAlign(params.mouseEvent),
      postProcessCallback: () => this.callPostProcessPopup(params.additionalParams, params.type, params.ePopup, null, params.mouseEvent)
    });
  }
  calculatePointerAlign(e) {
    const parentRect = this.getParentRect();
    return {
      x: e.clientX - parentRect.left,
      y: e.clientY - parentRect.top
    };
  }
  positionPopupByComponent(params) {
    const {
      ePopup,
      nudgeX,
      nudgeY,
      keepWithinBounds,
      eventSource,
      alignSide = "left",
      position = "over",
      type
    } = params;
    const sourceRect = eventSource.getBoundingClientRect();
    const parentRect = this.getParentRect();
    this.setAlignedTo(eventSource, ePopup);
    const updatePosition = () => {
      const relativeRect = toRelativeRect(sourceRect, parentRect);
      const targetSize = { width: ePopup.offsetWidth, height: ePopup.offsetHeight };
      const right = alignSide === "right";
      if (position === "over") {
        this.setAlignedStyles(ePopup, "over");
        return computeAlignedPosition(relativeRect, targetSize, right ? "tr-tr" : "tl-tl");
      }
      this.setAlignedStyles(ePopup, "under");
      const side = this.shouldRenderUnderOrAbove(ePopup, sourceRect, parentRect, params.nudgeY || 0);
      if (side === "under") {
        return computeAlignedPosition(relativeRect, targetSize, right ? "tr-br" : "tl-bl");
      }
      const pos = computeAlignedPosition(relativeRect, targetSize, right ? "br-tr" : "bl-tl");
      pos.y -= (nudgeY || 0) * 2;
      return pos;
    };
    this.positionPopup({
      ePopup,
      nudgeX,
      nudgeY,
      keepWithinBounds,
      updatePosition,
      postProcessCallback: () => this.callPostProcessPopup(params.additionalParams, type, ePopup, eventSource, null)
    });
  }
  positionPopupForMenu(params) {
    const { eventSource, ePopup, event } = params;
    const sourceRect = eventSource.getBoundingClientRect();
    const parentRect = this.getParentRect();
    this.setAlignedTo(eventSource, ePopup);
    let minWidthSet = false;
    const updatePosition = () => {
      const relativeRect = toRelativeRect(sourceRect, parentRect);
      const y = this.keepXYWithinBounds(ePopup, relativeRect.top, 0 /* Vertical */);
      const minWidth = ePopup.clientWidth > 0 ? ePopup.clientWidth : 200;
      if (!minWidthSet) {
        ePopup.style.minWidth = `${minWidth}px`;
        minWidthSet = true;
      }
      const widthOfParent = parentRect.right - parentRect.left;
      const maxX = widthOfParent - minWidth;
      const targetSize = { width: minWidth, height: ePopup.offsetHeight };
      const rightX = computeAlignedPosition(relativeRect, targetSize, "tl-tr").x - 2;
      const leftX = computeAlignedPosition(relativeRect, targetSize, "tr-tl").x;
      let x;
      if (this.gos.get("enableRtl")) {
        x = leftX;
        if (x < 0) {
          x = rightX;
          this.setAlignedStyles(ePopup, "left");
        }
        if (x > maxX) {
          x = 0;
          this.setAlignedStyles(ePopup, "right");
        }
      } else {
        x = rightX;
        if (x > maxX) {
          x = leftX;
          this.setAlignedStyles(ePopup, "right");
        }
        if (x < 0) {
          x = 0;
          this.setAlignedStyles(ePopup, "left");
        }
      }
      return { x, y };
    };
    this.positionPopup({
      ePopup,
      keepWithinBounds: true,
      updatePosition,
      postProcessCallback: () => this.callPostProcessPopup(
        params.additionalParams,
        "subMenu",
        ePopup,
        eventSource,
        event instanceof KeyboardEvent ? void 0 : event
      )
    });
  }
  shouldRenderUnderOrAbove(ePopup, targetCompRect, parentRect, nudgeY) {
    const spaceAvailableUnder = parentRect.bottom - targetCompRect.bottom;
    const spaceAvailableAbove = targetCompRect.top - parentRect.top;
    const spaceRequired = ePopup.offsetHeight + nudgeY;
    if (spaceAvailableUnder > spaceRequired) {
      return "under";
    }
    if (spaceAvailableAbove > spaceRequired || spaceAvailableAbove > spaceAvailableUnder) {
      return "above";
    }
    return "under";
  }
  setAlignedStyles(ePopup, positioned) {
    const popupIdx = this.getPopupIndex(ePopup);
    if (popupIdx === -1) {
      return;
    }
    const popup = this.popupList[popupIdx];
    const { alignedToElement } = popup;
    if (!alignedToElement) {
      return;
    }
    const positions = ["right", "left", "over", "above", "under"];
    for (const position of positions) {
      alignedToElement.classList.remove(`ag-has-popup-positioned-${position}`);
      ePopup.classList.remove(`ag-popup-positioned-${position}`);
    }
    if (!positioned) {
      return;
    }
    alignedToElement.classList.add(`ag-has-popup-positioned-${positioned}`);
    ePopup.classList.add(`ag-popup-positioned-${positioned}`);
  }
  setAlignedTo(eventSource, ePopup) {
    const popupIdx = this.getPopupIndex(ePopup);
    if (popupIdx !== -1) {
      const popup = this.popupList[popupIdx];
      popup.alignedToElement = eventSource;
    }
  }
  positionPopup(params) {
    const { ePopup, keepWithinBounds, nudgeX, nudgeY, skipObserver, updatePosition } = params;
    const lastSize = { width: 0, height: 0 };
    const updatePopupPosition = (fromResizeObserver = false) => {
      let { x, y } = updatePosition();
      if (fromResizeObserver && ePopup.clientWidth === lastSize.width && ePopup.clientHeight === lastSize.height) {
        return;
      }
      lastSize.width = ePopup.clientWidth;
      lastSize.height = ePopup.clientHeight;
      if (nudgeX) {
        x += nudgeX;
      }
      if (nudgeY) {
        y += nudgeY;
      }
      if (keepWithinBounds) {
        x = this.keepXYWithinBounds(ePopup, x, 1 /* Horizontal */);
        y = this.keepXYWithinBounds(ePopup, y, 0 /* Vertical */);
      }
      ePopup.style.left = `${x}px`;
      ePopup.style.top = `${y}px`;
      if (params.postProcessCallback) {
        params.postProcessCallback();
      }
    };
    updatePopupPosition();
    if (!skipObserver) {
      const resizeObserverDestroyFunc = _observeResize(this.beans, ePopup, () => updatePopupPosition(true));
      setTimeout(() => resizeObserverDestroyFunc(), WAIT_FOR_POPUP_CONTENT_RESIZE);
    }
  }
  getParentRect() {
    const eDocument = _getDocument(this.beans);
    let popupParent = this.getPopupParent();
    if (popupParent === eDocument.body) {
      popupParent = eDocument.documentElement;
    } else if (getComputedStyle(popupParent).position === "static") {
      popupParent = popupParent.offsetParent;
    }
    return _getElementRectWithOffset(popupParent);
  }
  keepXYWithinBounds(ePopup, position, direction) {
    const isVertical = direction === 0 /* Vertical */;
    const sizeProperty = isVertical ? "clientHeight" : "clientWidth";
    const anchorProperty = isVertical ? "top" : "left";
    const offsetProperty = isVertical ? "height" : "width";
    const scrollPositionProperty = isVertical ? "scrollTop" : "scrollLeft";
    const eDocument = _getDocument(this.beans);
    const docElement = eDocument.documentElement;
    const popupParent = this.getPopupParent();
    const popupRect = ePopup.getBoundingClientRect();
    const parentRect = popupParent.getBoundingClientRect();
    const documentRect = eDocument.documentElement.getBoundingClientRect();
    const isBody = popupParent === eDocument.body;
    const offsetSize = Math.ceil(popupRect[offsetProperty]);
    const getSize = isVertical ? _getAbsoluteHeight : _getAbsoluteWidth;
    let sizeOfParent = isBody ? getSize(docElement) + docElement[scrollPositionProperty] : popupParent[sizeProperty];
    if (isBody) {
      sizeOfParent -= Math.abs(documentRect[anchorProperty] - parentRect[anchorProperty]);
    }
    const max = sizeOfParent - offsetSize;
    return Math.min(Math.max(position, 0), Math.max(max, 0));
  }
  addPopup(params) {
    const { eChild, ariaLabel, ariaOwns, alwaysOnTop, positionCallback, anchorToElement } = params;
    const pos = this.getPopupIndex(eChild);
    if (pos !== -1) {
      const popup = this.popupList[pos];
      return { hideFunc: popup.hideFunc };
    }
    this.initialisePopupPosition(eChild);
    eChild.classList.add("ag-popup-child");
    if (!eChild.hasAttribute("role")) {
      _setAriaRole(eChild, "dialog");
    }
    if (ariaLabel) {
      _setAriaLabel(eChild, ariaLabel);
    } else if (ariaOwns) {
      eChild.id || (eChild.id = `popup-component-${instanceIdSeq}`);
      _setAriaOwns(ariaOwns, eChild.id);
    }
    const wrapperEl = _createAgElement({ tag: "div", cls: "ag-popup" });
    wrapperEl.appendChild(eChild);
    const disconnect = _initStyledRoot(this.beans.environment, this.getPopupParent(), wrapperEl);
    if (alwaysOnTop) {
      this.setAlwaysOnTop(eChild, true);
    } else {
      this.bringPopupToFront(eChild);
    }
    const removeListeners = this.addEventListenersToPopup({ ...params, wrapperEl, disconnect });
    if (positionCallback) {
      positionCallback();
    }
    this.addPopupToPopupList(eChild, removeListeners, anchorToElement);
    return {
      hideFunc: removeListeners
    };
  }
  initialisePopupPosition(element) {
    const ePopupParent = this.getPopupParent();
    const ePopupParentRect = ePopupParent.getBoundingClientRect();
    if (!_exists(element.style.top)) {
      element.style.top = `${ePopupParentRect.top * -1}px`;
    }
    if (!_exists(element.style.left)) {
      element.style.left = `${ePopupParentRect.left * -1}px`;
    }
  }
  addEventListenersToPopup(params) {
    const beans = this.beans;
    const eDocument = _getDocument(beans);
    const {
      wrapperEl,
      eChild: popupEl,
      closedCallback,
      afterGuiAttached,
      closeOnEsc,
      modal,
      ariaOwns,
      eventSourceToIgnore
    } = params;
    let popupHidden = false;
    const hidePopupOnKeyboardEvent = (event) => {
      if (!wrapperEl.contains(_getActiveDomElement(beans))) {
        return;
      }
      const key = event.key;
      if (key === KeyCode.ESCAPE && !this.isStopPropagation(event)) {
        removeListeners({ keyboardEvent: event });
      }
    };
    const hidePopupOnMouseEvent = (event) => removeListeners({ mouseEvent: event });
    const hidePopupOnTouchEvent = (event) => removeListeners({ touchEvent: event });
    const removeListeners = (popupParams = {}) => {
      const { mouseEvent, touchEvent, keyboardEvent, forceHide } = popupParams;
      const pointerEvent = mouseEvent ?? touchEvent;
      const isSourceDismissalEvent = mouseEvent?.type === "mousedown" && mouseEvent.button === 0 || touchEvent?.type === "touchstart";
      if (!forceHide && // we don't hide popup if the event was on the child, or any
      // children of this child
      (this.isEventFromCurrentPopup({ mouseEvent, touchEvent }, popupEl) || !!eventSourceToIgnore && isSourceDismissalEvent && !!pointerEvent && _isElementInEventPath(eventSourceToIgnore, pointerEvent) || // this method should only be called once. the client can have different
      // paths, each one wanting to close, so this method may be called multiple times.
      popupHidden)) {
        return;
      }
      popupHidden = true;
      params.disconnect();
      eDocument.removeEventListener("keydown", hidePopupOnKeyboardEvent);
      eDocument.removeEventListener("mousedown", hidePopupOnMouseEvent);
      eDocument.removeEventListener("touchstart", hidePopupOnTouchEvent);
      eDocument.removeEventListener("contextmenu", hidePopupOnMouseEvent);
      this.eventSvc.removeListener("dragStarted", hidePopupOnMouseEvent);
      if (closedCallback) {
        closedCallback(mouseEvent || touchEvent || keyboardEvent);
      }
      this.removePopupFromPopupList(popupEl, ariaOwns);
    };
    if (afterGuiAttached) {
      afterGuiAttached({ hidePopup: removeListeners });
    }
    window.setTimeout(() => {
      if (closeOnEsc) {
        eDocument.addEventListener("keydown", hidePopupOnKeyboardEvent);
      }
      if (modal) {
        eDocument.addEventListener("mousedown", hidePopupOnMouseEvent);
        this.eventSvc.addListener("dragStarted", hidePopupOnMouseEvent);
        eDocument.addEventListener("touchstart", hidePopupOnTouchEvent);
        eDocument.addEventListener("contextmenu", hidePopupOnMouseEvent);
      }
    }, 0);
    return removeListeners;
  }
  addPopupToPopupList(element, removeListeners, anchorToElement) {
    this.popupList.push({
      element,
      hideFunc: removeListeners,
      instanceId: instanceIdSeq,
      isAnchored: !!anchorToElement
    });
    if (anchorToElement) {
      this.setPopupPositionRelatedToElement(element, anchorToElement);
    }
    instanceIdSeq = instanceIdSeq + 1;
  }
  getPopupIndex(el) {
    return this.popupList.findIndex((p) => p.element === el);
  }
  setPopupPositionRelatedToElement(popupEl, relativeElement) {
    const popupIndex = this.getPopupIndex(popupEl);
    if (popupIndex === -1) {
      return;
    }
    const popup = this.popupList[popupIndex];
    if (popup.stopAnchoringPromise) {
      popup.stopAnchoringPromise.then((destroyFunc) => destroyFunc?.());
    }
    popup.stopAnchoringPromise = void 0;
    popup.isAnchored = false;
    if (!relativeElement) {
      return;
    }
    const destroyPositionTracker = this.keepPopupPositionedRelativeTo({
      element: relativeElement,
      ePopup: popupEl,
      hidePopup: popup.hideFunc
    });
    popup.stopAnchoringPromise = destroyPositionTracker;
    popup.isAnchored = true;
    return destroyPositionTracker;
  }
  removePopupFromPopupList(element, ariaOwns) {
    this.setAlignedStyles(element, null);
    this.setPopupPositionRelatedToElement(element, null);
    if (ariaOwns) {
      _setAriaOwns(ariaOwns, null);
    }
    this.popupList = this.popupList.filter((p) => p.element !== element);
  }
  keepPopupPositionedRelativeTo(params) {
    const eParent = this.getPopupParent();
    const parentRect = eParent.getBoundingClientRect();
    const { element, ePopup } = params;
    const sourceRect = element.getBoundingClientRect();
    const extractFromPixelValue = (pxSize) => Number.parseInt(pxSize.substring(0, pxSize.length - 1), 10);
    const createPosition = (prop, direction) => {
      const initialDiff = parentRect[prop] - sourceRect[prop];
      const initial = extractFromPixelValue(ePopup.style[prop]);
      return {
        initialDiff,
        lastDiff: initialDiff,
        initial,
        last: initial,
        direction
      };
    };
    const topPosition = createPosition("top", 0 /* Vertical */);
    const leftPosition = createPosition("left", 1 /* Horizontal */);
    const fwOverrides = this.beans.frameworkOverrides;
    return new AgPromise((resolve) => {
      fwOverrides.wrapIncoming(() => {
        _wrapInterval(() => {
          const pRect = eParent.getBoundingClientRect();
          const sRect = element.getBoundingClientRect();
          const elementNotInDom = sRect.top == 0 && sRect.left == 0 && sRect.height == 0 && sRect.width == 0;
          if (elementNotInDom) {
            params.hidePopup();
            return;
          }
          const calculateNewPosition = (position, prop) => {
            const current = extractFromPixelValue(ePopup.style[prop]);
            if (position.last !== current) {
              position.initial = current;
              position.last = current;
            }
            const currentDiff = pRect[prop] - sRect[prop];
            if (currentDiff != position.lastDiff) {
              const newValue = this.keepXYWithinBounds(
                ePopup,
                position.initial + position.initialDiff - currentDiff,
                position.direction
              );
              ePopup.style[prop] = `${newValue}px`;
              position.last = newValue;
            }
            position.lastDiff = currentDiff;
          };
          calculateNewPosition(topPosition, "top");
          calculateNewPosition(leftPosition, "left");
        }, 200).then((intervalId) => {
          const result = () => {
            if (intervalId != null) {
              window.clearInterval(intervalId);
            }
          };
          resolve(result);
        });
      }, "popupPositioning");
    });
  }
  isEventFromCurrentPopup(params, target) {
    const { mouseEvent, touchEvent } = params;
    const event = mouseEvent ? mouseEvent : touchEvent;
    if (!event) {
      return false;
    }
    const indexOfThisChild = this.getPopupIndex(target);
    if (indexOfThisChild === -1) {
      return false;
    }
    for (let i = indexOfThisChild; i < this.popupList.length; i++) {
      const popup = this.popupList[i];
      if (_isElementInEventPath(popup.element, event)) {
        return true;
      }
    }
    return this.isElementWithinCustomPopup(event.target);
  }
  isElementWithinCustomPopup(el) {
    const eDocument = _getDocument(this.beans);
    while (el && el !== eDocument.body) {
      if (el.classList.contains("ag-custom-component-popup") || el.parentElement === null) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }
  getWrapper(ePopup) {
    while (!ePopup.classList.contains("ag-popup") && ePopup.parentElement) {
      ePopup = ePopup.parentElement;
    }
    return ePopup.classList.contains("ag-popup") ? ePopup : null;
  }
  getPopupRoot(ePopup) {
    const parent = this.getPopupParent();
    let popupRoot = ePopup;
    while (popupRoot.parentElement && popupRoot.parentElement !== parent) {
      popupRoot = popupRoot.parentElement;
    }
    return popupRoot;
  }
  setAlwaysOnTop(ePopup, alwaysOnTop) {
    const eWrapper = this.getWrapper(ePopup);
    if (!eWrapper) {
      return;
    }
    eWrapper.classList.toggle("ag-always-on-top", !!alwaysOnTop);
    if (alwaysOnTop) {
      this.bringPopupToFront(eWrapper);
    }
  }
  /** @returns true if moved */
  bringPopupToFront(ePopup) {
    const parent = this.getPopupParent();
    const popupList = Array.prototype.slice.call(parent.querySelectorAll(".ag-popup"));
    const popupLen = popupList.length;
    const eWrapper = this.getWrapper(ePopup);
    if (!eWrapper || popupLen <= 1 || !parent.contains(ePopup)) {
      return;
    }
    const standardPopupList = [];
    const alwaysOnTopList = [];
    for (const popup of popupList) {
      if (popup === eWrapper) {
        continue;
      }
      if (popup.classList.contains("ag-always-on-top")) {
        alwaysOnTopList.push(popup);
      } else {
        standardPopupList.push(popup);
      }
    }
    const innerElsScrollMap = [];
    const onTopLength = alwaysOnTopList.length;
    const isPopupAlwaysOnTop = eWrapper.classList.contains("ag-always-on-top");
    const shouldBeLast = isPopupAlwaysOnTop || !onTopLength;
    const targetList = shouldBeLast ? [...standardPopupList, ...alwaysOnTopList, eWrapper] : [...standardPopupList, eWrapper, ...alwaysOnTopList];
    for (let i = 0; i <= popupLen; i++) {
      const currentPopup = targetList[i];
      if (popupList[i] === targetList[i] || currentPopup === eWrapper) {
        continue;
      }
      const innerEls = currentPopup.querySelectorAll("div");
      for (const el of innerEls) {
        if (el.scrollTop !== 0) {
          innerElsScrollMap.push([el, el.scrollTop]);
        }
      }
      if (i === 0) {
        parent.prepend(this.getPopupRoot(currentPopup));
      } else {
        this.getPopupRoot(targetList[i - 1]).after(this.getPopupRoot(currentPopup));
      }
    }
    while (innerElsScrollMap.length) {
      const currentEl = innerElsScrollMap.pop();
      currentEl[0].scrollTop = currentEl[1];
    }
  }
};

// packages/ag-stack/src/rendering/agPositionableFeature.ts
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
var AgPositionableFeature = class extends AgBeanStub {
  constructor(element, config) {
    super();
    this.element = element;
    this.dragStartPosition = {
      x: 0,
      y: 0
    };
    this.position = {
      x: 0,
      y: 0
    };
    this.lastSize = {
      width: -1,
      height: -1
    };
    this.positioned = false;
    this.resizersAdded = false;
    this.resizeListeners = [];
    this.boundaryEl = null;
    this.isResizing = false;
    this.isMoving = false;
    this.resizable = {};
    this.movable = false;
    this.currentResizer = null;
    this.config = { popup: false, ...config };
  }
  wireBeans(beans) {
    this.popupSvc = beans.popupSvc;
    this.dragSvc = beans.dragSvc;
  }
  center(postProcessCallback) {
    const { clientHeight, clientWidth } = this.offsetParent;
    const x = clientWidth / 2 - this.getWidth() / 2;
    const y = clientHeight / 2 - this.getHeight() / 2;
    this.offsetElement(x, y, postProcessCallback);
  }
  initialisePosition(postProcessCallback) {
    if (this.positioned) {
      return;
    }
    const { centered, forcePopupParentAsOffsetParent, minWidth, width, minHeight, height, x, y } = this.config;
    if (!this.offsetParent) {
      this.setOffsetParent();
    }
    let computedMinHeight = 0;
    let computedMinWidth = 0;
    const isElementVisible = _isVisible(this.element);
    if (isElementVisible) {
      const boundaryEl = this.findBoundaryElement();
      const offsetParentComputedStyles = window.getComputedStyle(boundaryEl);
      if (offsetParentComputedStyles.minWidth != null) {
        const paddingWidth = boundaryEl.offsetWidth - this.element.offsetWidth;
        computedMinWidth = Number.parseInt(offsetParentComputedStyles.minWidth, 10) - paddingWidth;
      }
      if (offsetParentComputedStyles.minHeight != null) {
        const paddingHeight = boundaryEl.offsetHeight - this.element.offsetHeight;
        computedMinHeight = Number.parseInt(offsetParentComputedStyles.minHeight, 10) - paddingHeight;
      }
    }
    this.minHeight = minHeight || computedMinHeight;
    this.minWidth = minWidth || computedMinWidth;
    if (width) {
      this.setWidth(width);
    }
    if (height) {
      this.setHeight(height);
    }
    if (!width || !height) {
      this.refreshSize();
    }
    if (centered) {
      this.center(postProcessCallback);
    } else if (x || y) {
      this.offsetElement(x, y, postProcessCallback);
    } else if (isElementVisible && forcePopupParentAsOffsetParent) {
      let boundaryEl = this.boundaryEl;
      let initialisedDuringPositioning = true;
      if (!boundaryEl) {
        boundaryEl = this.findBoundaryElement();
        initialisedDuringPositioning = false;
      }
      if (boundaryEl) {
        const top = Number.parseFloat(boundaryEl.style.top);
        const left = Number.parseFloat(boundaryEl.style.left);
        if (initialisedDuringPositioning) {
          this.offsetElement(Number.isNaN(left) ? 0 : left, Number.isNaN(top) ? 0 : top, postProcessCallback);
        } else {
          this.setPosition(left, top);
        }
      }
    }
    this.positioned = !!this.offsetParent;
  }
  isPositioned() {
    return this.positioned;
  }
  getPosition() {
    return this.position;
  }
  setMovable(movable, moveElement) {
    if (!this.config.popup || movable === this.movable) {
      return;
    }
    this.movable = movable;
    const params = this.moveElementDragListener || {
      eElement: moveElement,
      onDragStart: this.onMoveStart.bind(this),
      onDragging: this.onMove.bind(this),
      onDragStop: this.onMoveEnd.bind(this)
    };
    if (movable) {
      this.dragSvc?.addDragSource(params);
      this.moveElementDragListener = params;
    } else {
      this.dragSvc?.removeDragSource(params);
      this.moveElementDragListener = void 0;
    }
  }
  setResizable(resizable) {
    this.clearResizeListeners();
    if (resizable) {
      this.addResizers();
    } else {
      this.removeResizers();
    }
    if (typeof resizable === "boolean") {
      if (resizable === false) {
        return;
      }
      resizable = {
        topLeft: resizable,
        top: resizable,
        topRight: resizable,
        right: resizable,
        bottomRight: resizable,
        bottom: resizable,
        bottomLeft: resizable,
        left: resizable
      };
    }
    for (const side of Object.keys(resizable)) {
      const isSideResizable = !!resizable[side];
      const resizerEl = this.getResizerElement(side);
      const params = {
        dragStartPixels: 0,
        eElement: resizerEl,
        onDragStart: (e) => this.onResizeStart(e, side),
        onDragging: this.onResize.bind(this),
        onDragStop: (e) => this.onResizeEnd(e, side)
      };
      if (isSideResizable || !this.isAlive() && !isSideResizable) {
        if (isSideResizable) {
          this.dragSvc?.addDragSource(params);
          this.resizeListeners.push(params);
          resizerEl.style.pointerEvents = "all";
        } else {
          resizerEl.style.pointerEvents = "none";
        }
        this.resizable[side] = isSideResizable;
      }
    }
  }
  removeSizeFromEl() {
    this.element.style.removeProperty("height");
    this.element.style.removeProperty("width");
    this.element.style.removeProperty("flex");
  }
  restoreLastSize() {
    this.element.style.flex = "0 0 auto";
    const { height, width } = this.lastSize;
    if (width !== -1) {
      this.element.style.width = `${width}px`;
    }
    if (height !== -1) {
      this.element.style.height = `${height}px`;
    }
  }
  getHeight() {
    return this.element.offsetHeight;
  }
  setHeight(height) {
    const { popup } = this.config;
    const eGui = this.element;
    let isPercent = false;
    if (typeof height === "string" && height.includes("%")) {
      _setFixedHeight(eGui, height);
      height = _getAbsoluteHeight(eGui);
      isPercent = true;
    } else {
      height = Math.max(this.minHeight, height);
      if (this.positioned) {
        const availableHeight = this.getAvailableHeight();
        if (availableHeight && height > availableHeight) {
          height = availableHeight;
        }
      }
    }
    if (eGui.style.height !== "" && this.getHeight() === height) {
      return;
    }
    if (isPercent) {
      eGui.style.maxHeight = "unset";
      eGui.style.minHeight = "unset";
    } else if (popup) {
      _setFixedHeight(eGui, height);
    } else {
      eGui.style.height = `${height}px`;
      eGui.style.flex = "0 0 auto";
      this.lastSize.height = typeof height === "number" ? height : Number.parseFloat(height);
    }
  }
  getAvailableHeight() {
    const { popup, forcePopupParentAsOffsetParent } = this.config;
    if (!this.positioned) {
      this.initialisePosition();
    }
    const { clientHeight } = this.offsetParent;
    if (!clientHeight) {
      return null;
    }
    const elRect = this.element.getBoundingClientRect();
    const offsetParentRect = this.offsetParent.getBoundingClientRect();
    const yPosition = popup ? this.position.y : elRect.top;
    const parentTop = popup ? 0 : offsetParentRect.top;
    let additionalHeight = 0;
    if (forcePopupParentAsOffsetParent) {
      const parentEl = this.element.parentElement;
      if (parentEl) {
        const { bottom } = parentEl.getBoundingClientRect();
        additionalHeight = bottom - elRect.bottom;
      }
    }
    const availableHeight = clientHeight + parentTop - yPosition - additionalHeight;
    return availableHeight;
  }
  getWidth() {
    return this.element.offsetWidth;
  }
  setWidth(width) {
    const eGui = this.element;
    const { popup } = this.config;
    let isPercent = false;
    if (typeof width === "string" && width.includes("%")) {
      _setFixedWidth(eGui, width);
      width = _getAbsoluteWidth(eGui);
      isPercent = true;
    } else if (this.positioned) {
      width = Math.max(this.minWidth, width);
      const { clientWidth } = this.offsetParent;
      const xPosition = popup ? this.position.x : this.element.getBoundingClientRect().left;
      if (clientWidth && width + xPosition > clientWidth) {
        width = clientWidth - xPosition;
      }
    }
    if (this.getWidth() === width) {
      return;
    }
    if (isPercent) {
      eGui.style.maxWidth = "unset";
      eGui.style.minWidth = "unset";
    } else if (this.config.popup) {
      _setFixedWidth(eGui, width);
    } else {
      eGui.style.width = `${width}px`;
      eGui.style.flex = " unset";
      this.lastSize.width = typeof width === "number" ? width : Number.parseFloat(width);
    }
  }
  offsetElement(x = 0, y = 0, postProcessCallback) {
    const { forcePopupParentAsOffsetParent } = this.config;
    const ePopup = forcePopupParentAsOffsetParent ? this.boundaryEl : this.element;
    if (!ePopup) {
      return;
    }
    this.popupSvc?.positionPopup({
      ePopup,
      keepWithinBounds: true,
      skipObserver: this.movable || this.isResizable(),
      updatePosition: () => ({ x, y }),
      postProcessCallback
    });
    this.setPosition(Number.parseFloat(ePopup.style.left), Number.parseFloat(ePopup.style.top));
  }
  constrainSizeToAvailableHeight(constrain) {
    if (!this.config.forcePopupParentAsOffsetParent) {
      return;
    }
    const applyMaxHeightToElement = () => {
      const availableHeight = this.getAvailableHeight();
      this.element.style.setProperty("max-height", `${availableHeight}px`);
    };
    if (constrain && this.popupSvc) {
      this.resizeObserverSubscriber?.();
      this.resizeObserverSubscriber = _observeResize(
        this.beans,
        this.popupSvc?.getPopupParent(),
        applyMaxHeightToElement
      );
    } else {
      this.element.style.removeProperty("max-height");
      if (this.resizeObserverSubscriber) {
        this.resizeObserverSubscriber();
        this.resizeObserverSubscriber = void 0;
      }
    }
  }
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
  updateDragStartPosition(x, y) {
    this.dragStartPosition = { x, y };
  }
  calculateMouseMovement(params) {
    const { e, isLeft, isTop, anywhereWithin, topBuffer } = params;
    const xDiff = e.clientX - this.dragStartPosition.x;
    const yDiff = e.clientY - this.dragStartPosition.y;
    const movementX = this.shouldSkipX(e, !!isLeft, !!anywhereWithin, xDiff) ? 0 : xDiff;
    const movementY = this.shouldSkipY(e, !!isTop, topBuffer, yDiff) ? 0 : yDiff;
    return { movementX, movementY };
  }
  shouldSkipX(e, isLeft, anywhereWithin, diff) {
    const elRect = this.element.getBoundingClientRect();
    const parentRect = this.offsetParent.getBoundingClientRect();
    const boundaryElRect = this.boundaryEl.getBoundingClientRect();
    const xPosition = this.config.popup ? this.position.x : elRect.left;
    let skipX = xPosition <= 0 && parentRect.left >= e.clientX || parentRect.right <= e.clientX && parentRect.right <= boundaryElRect.right;
    if (skipX) {
      return true;
    }
    if (isLeft) {
      skipX = // skip if we are moving to the left and the cursor
      // is positioned to the right of the left side anchor
      diff < 0 && e.clientX > xPosition + parentRect.left || // skip if we are moving to the right and the cursor
      // is positioned to the left of the dialog
      diff > 0 && e.clientX < xPosition + parentRect.left;
    } else if (anywhereWithin) {
      skipX = diff < 0 && e.clientX > boundaryElRect.right || diff > 0 && e.clientX < xPosition + parentRect.left;
    } else {
      skipX = // if the movement is bound to the right side of the dialog
      // we skip if we are moving to the left and the cursor
      // is to the right of the dialog
      diff < 0 && e.clientX > boundaryElRect.right || // or skip if we are moving to the right and the cursor
      // is to the left of the right side anchor
      diff > 0 && e.clientX < boundaryElRect.right;
    }
    return skipX;
  }
  shouldSkipY(e, isTop, topBuffer = 0, diff) {
    const elRect = this.element.getBoundingClientRect();
    const parentRect = this.offsetParent.getBoundingClientRect();
    const boundaryElRect = this.boundaryEl.getBoundingClientRect();
    const yPosition = this.config.popup ? this.position.y : elRect.top;
    let skipY = yPosition <= 0 && parentRect.top >= e.clientY || parentRect.bottom <= e.clientY && parentRect.bottom <= boundaryElRect.bottom;
    if (skipY) {
      return true;
    }
    if (isTop) {
      skipY = // skip if we are moving to towards top and the cursor is
      // below the top anchor + topBuffer
      // note: topBuffer is used when moving the dialog using the title bar
      diff < 0 && e.clientY > yPosition + parentRect.top + topBuffer || // skip if we are moving to the bottom and the cursor is
      // above the top anchor
      diff > 0 && e.clientY < yPosition + parentRect.top;
    } else {
      skipY = // skip if we are moving towards the top and the cursor
      // is below the bottom anchor
      diff < 0 && e.clientY > boundaryElRect.bottom || // skip if we are moving towards the bottom and the cursor
      // is above the bottom anchor
      diff > 0 && e.clientY < boundaryElRect.bottom;
    }
    return skipY;
  }
  createResizeMap() {
    const getElement = (ref) => ({
      element: this.element.querySelector(`[data-ref=${ref}Resizer]`)
    });
    this.resizerMap = {
      topLeft: getElement("eTopLeft"),
      top: getElement("eTop"),
      topRight: getElement("eTopRight"),
      right: getElement("eRight"),
      bottomRight: getElement("eBottomRight"),
      bottom: getElement("eBottom"),
      bottomLeft: getElement("eBottomLeft"),
      left: getElement("eLeft")
    };
  }
  addResizers() {
    if (this.resizersAdded) {
      return;
    }
    const eGui = this.element;
    if (!eGui) {
      return;
    }
    eGui.appendChild(_createAgElement(RESIZE_TEMPLATE));
    this.createResizeMap();
    this.resizersAdded = true;
  }
  removeResizers() {
    this.resizerMap = void 0;
    const resizerEl = this.element.querySelector(`.${RESIZE_CONTAINER_STYLE}`);
    resizerEl?.remove();
    this.resizersAdded = false;
  }
  getResizerElement(side) {
    return this.resizerMap[side].element;
  }
  onResizeStart(e, side) {
    this.boundaryEl = this.findBoundaryElement();
    if (!this.positioned) {
      this.initialisePosition();
    }
    this.currentResizer = {
      isTop: !!side.match(/top/i),
      isRight: !!side.match(/right/i),
      isBottom: !!side.match(/bottom/i),
      isLeft: !!side.match(/left/i)
    };
    this.element.classList.add("ag-resizing");
    this.resizerMap[side].element.classList.add("ag-active");
    const { popup, forcePopupParentAsOffsetParent } = this.config;
    if (!popup && !forcePopupParentAsOffsetParent) {
      this.applySizeToSiblings(this.currentResizer.isBottom || this.currentResizer.isTop);
    }
    this.isResizing = true;
    this.updateDragStartPosition(e.clientX, e.clientY);
  }
  getSiblings() {
    const element = this.element;
    const parent = element.parentElement;
    if (!parent) {
      return null;
    }
    return Array.prototype.slice.call(parent.children).filter((el) => !el.classList.contains("ag-hidden"));
  }
  getMinSizeOfSiblings() {
    const siblings = this.getSiblings() || [];
    let height = 0;
    let width = 0;
    for (const currentEl of siblings) {
      const isFlex = !!currentEl.style.flex && currentEl.style.flex !== "0 0 auto";
      if (currentEl === this.element) {
        continue;
      }
      let nextHeight = this.minHeight || 0;
      let nextWidth = this.minWidth || 0;
      if (isFlex) {
        const computedStyle = window.getComputedStyle(currentEl);
        if (computedStyle.minHeight) {
          nextHeight = Number.parseInt(computedStyle.minHeight, 10);
        }
        if (computedStyle.minWidth) {
          nextWidth = Number.parseInt(computedStyle.minWidth, 10);
        }
      } else {
        nextHeight = currentEl.offsetHeight;
        nextWidth = currentEl.offsetWidth;
      }
      height += nextHeight;
      width += nextWidth;
    }
    return { height, width };
  }
  applySizeToSiblings(vertical) {
    let containerToFlex = null;
    const siblings = this.getSiblings();
    if (!siblings) {
      return;
    }
    for (let i = 0; i < siblings.length; i++) {
      const el = siblings[i];
      if (el === containerToFlex) {
        continue;
      }
      if (vertical) {
        el.style.height = `${el.offsetHeight}px`;
      } else {
        el.style.width = `${el.offsetWidth}px`;
      }
      el.style.flex = "0 0 auto";
      if (el === this.element) {
        containerToFlex = siblings[i + 1];
      }
    }
    if (containerToFlex) {
      containerToFlex.style.removeProperty("height");
      containerToFlex.style.removeProperty("min-height");
      containerToFlex.style.removeProperty("max-height");
      containerToFlex.style.flex = "1 1 auto";
    }
  }
  isResizable() {
    return Object.values(this.resizable).some((value) => value);
  }
  onResize(e) {
    if (!this.isResizing || !this.currentResizer) {
      return;
    }
    const { popup, forcePopupParentAsOffsetParent } = this.config;
    const { isTop, isRight, isBottom, isLeft } = this.currentResizer;
    const isHorizontal = isRight || isLeft;
    const isVertical = isBottom || isTop;
    const { movementX, movementY } = this.calculateMouseMovement({ e, isLeft, isTop });
    const xPosition = this.position.x;
    const yPosition = this.position.y;
    let offsetLeft = 0;
    let offsetTop = 0;
    if (isHorizontal && movementX) {
      const direction = isLeft ? -1 : 1;
      const oldWidth = this.getWidth();
      const newWidth = oldWidth + movementX * direction;
      let skipWidth = false;
      if (isLeft) {
        offsetLeft = oldWidth - newWidth;
        if (xPosition + offsetLeft <= 0 || newWidth <= this.minWidth) {
          skipWidth = true;
          offsetLeft = 0;
        }
      }
      if (!skipWidth) {
        this.setWidth(newWidth);
      }
    }
    if (isVertical && movementY) {
      const direction = isTop ? -1 : 1;
      const oldHeight = this.getHeight();
      const newHeight = oldHeight + movementY * direction;
      let skipHeight = false;
      if (isTop) {
        offsetTop = oldHeight - newHeight;
        if (yPosition + offsetTop <= 0 || newHeight <= this.minHeight) {
          skipHeight = true;
          offsetTop = 0;
        }
      } else if (
        // do not let the size of all siblings be higher than the parent container
        !this.config.popup && !this.config.forcePopupParentAsOffsetParent && oldHeight < newHeight && this.getMinSizeOfSiblings().height + newHeight > this.element.parentElement.offsetHeight
      ) {
        skipHeight = true;
      }
      if (!skipHeight) {
        this.setHeight(newHeight);
      }
    }
    this.updateDragStartPosition(e.clientX, e.clientY);
    if ((popup || forcePopupParentAsOffsetParent) && offsetLeft || offsetTop) {
      this.offsetElement(xPosition + offsetLeft, yPosition + offsetTop);
    }
  }
  onResizeEnd(e, side) {
    this.isResizing = false;
    this.currentResizer = null;
    this.boundaryEl = null;
    this.element.classList.remove("ag-resizing");
    this.resizerMap[side].element.classList.remove("ag-active");
    this.dispatchLocalEvent({ type: "resize" });
  }
  refreshSize() {
    const eGui = this.element;
    if (this.config.popup) {
      if (!this.config.width) {
        this.setWidth(eGui.offsetWidth);
      }
      if (!this.config.height) {
        this.setHeight(eGui.offsetHeight);
      }
    }
  }
  onMoveStart(e) {
    this.boundaryEl = this.findBoundaryElement();
    if (!this.positioned) {
      this.initialisePosition();
    }
    this.isMoving = true;
    this.element.classList.add("ag-moving");
    this.updateDragStartPosition(e.clientX, e.clientY);
  }
  onMove(e) {
    if (!this.isMoving) {
      return;
    }
    const { x, y } = this.position;
    let topBuffer;
    if (this.config.calculateTopBuffer) {
      topBuffer = this.config.calculateTopBuffer();
    }
    const { movementX, movementY } = this.calculateMouseMovement({
      e,
      isTop: true,
      anywhereWithin: true,
      topBuffer
    });
    this.offsetElement(x + movementX, y + movementY);
    this.updateDragStartPosition(e.clientX, e.clientY);
  }
  onMoveEnd() {
    this.isMoving = false;
    this.boundaryEl = null;
    this.element.classList.remove("ag-moving");
  }
  setOffsetParent() {
    if (this.config.forcePopupParentAsOffsetParent && this.popupSvc) {
      this.offsetParent = this.popupSvc.getPopupParent();
    } else {
      this.offsetParent = this.element.offsetParent;
    }
  }
  findBoundaryElement() {
    let el = this.element;
    while (el) {
      if (window.getComputedStyle(el).position !== "static") {
        return el;
      }
      el = el.parentElement;
    }
    return this.element;
  }
  clearResizeListeners() {
    while (this.resizeListeners.length) {
      const params = this.resizeListeners.pop();
      this.dragSvc?.removeDragSource(params);
    }
  }
  destroy() {
    super.destroy();
    if (this.moveElementDragListener) {
      this.dragSvc?.removeDragSource(this.moveElementDragListener);
    }
    this.constrainSizeToAvailableHeight(false);
    this.clearResizeListeners();
    this.removeResizers();
  }
};

// packages/ag-stack/src/rendering/autoScrollService.ts
var AutoScrollService = class {
  constructor(params) {
    this.tickingInterval = null;
    this.onScrollCallback = null;
    this.scrollContainer = params.scrollContainer;
    this.scrollHorizontally = params.scrollAxis.includes("x");
    this.scrollVertically = params.scrollAxis.includes("y");
    this.scrollByTick = params.scrollByTick ?? 20;
    if (params.onScrollCallback) {
      this.onScrollCallback = params.onScrollCallback;
    }
    if (this.scrollVertically) {
      this.getVerticalPosition = params.getVerticalPosition;
      this.setVerticalPosition = params.setVerticalPosition;
    }
    if (this.scrollHorizontally) {
      this.getHorizontalPosition = params.getHorizontalPosition;
      this.setHorizontalPosition = params.setHorizontalPosition;
    }
    this.shouldSkipVerticalScroll = params.shouldSkipVerticalScroll || (() => false);
    this.shouldSkipHorizontalScroll = params.shouldSkipHorizontalScroll || (() => false);
    this.getTopOffset = params.getTopOffset || (() => 0);
    this.getBottomOffset = params.getBottomOffset || (() => 0);
  }
  /** True while auto-scrolling */
  get scrolling() {
    return this.tickingInterval !== null;
  }
  check(mouseEvent, forceSkipVerticalScroll = false) {
    const skipVerticalScroll = !this.scrollVertically || forceSkipVerticalScroll || this.shouldSkipVerticalScroll();
    const skipHorizontalScroll = !this.scrollHorizontally || this.shouldSkipHorizontalScroll();
    if (skipVerticalScroll && skipHorizontalScroll) {
      return;
    }
    const rect = this.scrollContainer.getBoundingClientRect();
    const scrollTick = this.scrollByTick;
    const topOffset = this.getTopOffset();
    const bottomOffset = this.getBottomOffset();
    this.tickLeft = !skipHorizontalScroll && mouseEvent.clientX < rect.left + scrollTick;
    this.tickRight = !skipHorizontalScroll && mouseEvent.clientX > rect.right - scrollTick;
    this.tickUp = !skipVerticalScroll && mouseEvent.clientY < rect.top + topOffset + scrollTick;
    this.tickDown = !skipVerticalScroll && mouseEvent.clientY > rect.bottom - bottomOffset - scrollTick;
    if (this.tickLeft || this.tickRight || this.tickUp || this.tickDown) {
      this.ensureTickingStarted();
    } else {
      this.ensureCleared();
    }
  }
  ensureTickingStarted() {
    if (this.tickingInterval === null) {
      this.tickingInterval = window.setInterval(this.doTick.bind(this), 100);
      this.tickCount = 0;
    }
  }
  doTick() {
    this.tickCount++;
    const tickAmount = this.tickCount > 20 ? 200 : this.tickCount > 10 ? 80 : 40;
    if (this.scrollVertically) {
      const vScrollPosition = this.getVerticalPosition();
      if (this.tickUp) {
        this.setVerticalPosition(vScrollPosition - tickAmount);
      }
      if (this.tickDown) {
        this.setVerticalPosition(vScrollPosition + tickAmount);
      }
    }
    if (this.scrollHorizontally) {
      const hScrollPosition = this.getHorizontalPosition();
      if (this.tickLeft) {
        this.setHorizontalPosition(hScrollPosition - tickAmount);
      }
      if (this.tickRight) {
        this.setHorizontalPosition(hScrollPosition + tickAmount);
      }
    }
    if (this.onScrollCallback) {
      this.onScrollCallback();
    }
  }
  ensureCleared() {
    if (this.tickingInterval) {
      window.clearInterval(this.tickingInterval);
      this.tickingInterval = null;
    }
  }
};

// packages/ag-stack/src/tooltip/agTooltipFeature.ts
var AgTooltipFeature = class extends AgBeanStub {
  constructor(ctrl, beans) {
    super();
    this.ctrl = ctrl;
    this.getLatestTooltip = () => {
      this.updateTooltipText();
      return this.tooltip;
    };
    if (beans) {
      this.beans = beans;
    }
  }
  postConstruct() {
    this.refreshTooltip();
  }
  /**
   *
   * @param tooltip The tooltip value
   * @param allowEmptyString Set it to true to allow the title to be set to `''`. This is necessary
   * when the browser adds a default tooltip the element and the tooltip service will be displayed
   * next to a browser tooltip causing confusion.
   */
  setBrowserTooltip(tooltip, allowEmptyString) {
    const name = "title";
    const eGui = this.ctrl.getGui();
    if (!eGui) {
      return;
    }
    if (tooltip != null && (tooltip != "" || allowEmptyString)) {
      eGui.setAttribute(name, tooltip);
    } else {
      eGui.removeAttribute(name);
    }
  }
  updateTooltipText() {
    const { getTooltipValue } = this.ctrl;
    if (getTooltipValue) {
      this.tooltip = getTooltipValue();
    }
  }
  createTooltipFeatureIfNeeded() {
    if (this.tooltipManager == null) {
      const tooltipManager = this.beans.registry.createDynamicBean("tooltipStateManager", true, this.ctrl, this.getLatestTooltip);
      if (tooltipManager) {
        this.tooltipManager = this.createBean(tooltipManager, this.beans.context);
      }
    }
  }
  attemptToShowTooltip() {
    this.tooltipManager?.prepareToShowTooltip();
  }
  attemptToHideTooltip() {
    this.tooltipManager?.hideTooltip();
  }
  setTooltipAndRefresh(tooltip) {
    this.tooltip = tooltip;
    this.refreshTooltip();
  }
  refreshTooltip(clearWithEmptyString) {
    this.browserTooltips = this.beans.gos.get("enableBrowserTooltips");
    const tooltipManager = this.tooltipManager;
    if (tooltipManager?.isShowing()) {
      tooltipManager.hideTooltip(true);
    }
    if (this.browserTooltips) {
      this.updateTooltipText();
      this.setBrowserTooltip(this.tooltip);
      this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
    } else {
      this.setBrowserTooltip(clearWithEmptyString ? "" : null, clearWithEmptyString);
      this.createTooltipFeatureIfNeeded();
    }
  }
  destroy() {
    this.setBrowserTooltip(null);
    this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
    super.destroy();
  }
};

// packages/ag-stack/src/tooltip/baseTooltipStateManager.ts
var SHOW_SWITCH_TOOLTIP_DIFF = 1e3;
var FADE_OUT_TOOLTIP_TIMEOUT = 1e3;
var INTERACTIVE_HIDE_DELAY = 100;
var sharedStateByGrid = /* @__PURE__ */ new WeakMap();
var tooltipIdSequence = 0;
var BaseTooltipStateManager = class extends AgBeanStub {
  constructor(tooltipCtrl, getTooltipValue) {
    super();
    this.tooltipCtrl = tooltipCtrl;
    this.getTooltipValue = getTooltipValue;
    this.interactionEnabled = false;
    this.isInteractingWithTooltip = false;
    this.state = 0 /* NOTHING */;
    // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
    // async we could request two tooltips before the first instance returns, in which case we should
    // disregard the second instance.
    this.tooltipInstanceCount = 0;
    this.tooltipMouseTrack = false;
    this.showEventDispatched = false;
  }
  wireBeans(beans) {
    this.popupSvc = beans.popupSvc;
  }
  getPopupPositionParams() {
    return void 0;
  }
  postConstruct() {
    let sharedState = sharedStateByGrid.get(this.gos);
    if (!sharedState) {
      sharedState = {};
      sharedStateByGrid.set(this.gos, sharedState);
    }
    this.sharedState = sharedState;
    if (this.gos.get("tooltipInteraction")) {
      this.interactionEnabled = true;
    }
    this.tooltipTrigger = this.getTooltipTrigger();
    this.tooltipMouseTrack = this.gos.get("tooltipMouseTrack");
    const el = this.tooltipCtrl.getGui();
    if (this.tooltipTrigger === 0 /* HOVER */) {
      this.addManagedListeners(el, {
        mouseenter: this.onMouseEnter.bind(this),
        mouseleave: this.onMouseLeave.bind(this)
      });
    }
    if (this.tooltipTrigger === 1 /* FOCUS */) {
      this.addManagedListeners(el, {
        focusin: this.onFocusIn.bind(this),
        focusout: this.onFocusOut.bind(this)
      });
    }
    if (this.interactionEnabled && this.tooltipTrigger !== 1 /* FOCUS */) {
      this.addManagedListeners(el, { focusout: this.onFocusOut.bind(this) });
    }
    if (this.interactionEnabled) {
      this.addManagedListeners(el, { keydown: this.onInteractiveSourceKeyDown.bind(this) });
    }
    this.addManagedListeners(el, { mousemove: this.onMouseMove.bind(this) });
    if (!this.interactionEnabled) {
      this.addManagedListeners(el, {
        mousedown: this.onMouseDown.bind(this),
        keydown: this.onKeyDown.bind(this)
      });
    }
  }
  getTooltipDelay(type) {
    const delay = this.tooltipCtrl[`getTooltip${type}DelayOverride`]?.() ?? this.gos.get(`tooltip${type}Delay`);
    return Math.max(0, delay);
  }
  destroy() {
    this.hideTooltip(true);
    super.destroy();
  }
  getTooltipTrigger() {
    const trigger = this.gos.get("tooltipTrigger");
    if (!trigger || trigger === "hover") {
      return 0 /* HOVER */;
    }
    return 1 /* FOCUS */;
  }
  /** True only once a tooltip is on screen — a show still waiting out its delay is not showing. */
  isShowing() {
    return this.state === 2 /* SHOWING */;
  }
  onMouseEnter(e) {
    if (this.interactionEnabled && this.interactiveTooltipTimeoutId) {
      this.unlockService();
      this.startHideTimeout();
    }
    const fromTouch = e.sourceCapabilities?.firesTouchEvents;
    if (_isIOSUserAgent() || fromTouch) {
      return;
    }
    if (this.isLocked()) {
      this.showTooltipTimeoutId = window.setTimeout(() => {
        this.prepareToShowTooltip(e);
      }, INTERACTIVE_HIDE_DELAY);
    } else {
      this.prepareToShowTooltip(e);
    }
  }
  onMouseMove(e) {
    if (this.lastMouseEvent) {
      this.lastMouseEvent = e;
    }
    if (this.tooltipMouseTrack && this.state === 2 /* SHOWING */ && this.tooltipComp) {
      this.positionTooltip();
    }
  }
  onMouseDown() {
    this.setToDoNothing();
  }
  onMouseLeave() {
    if (this.interactionEnabled && this.state === 2 /* SHOWING */) {
      this.lockService();
    } else {
      this.setToDoNothing();
    }
  }
  onFocusIn() {
    if (this.tooltipCtrl.shouldDisplayTooltipOnFocus?.() !== false) {
      this.prepareToShowTooltip();
    }
  }
  onFocusOut(e) {
    const relatedTarget = e.relatedTarget;
    const parentCompGui = this.tooltipCtrl.getGui();
    const tooltipGui = this.tooltipComp?.getGui();
    if (this.isInteractingWithTooltip || parentCompGui.contains(relatedTarget) || this.interactionEnabled && tooltipGui?.contains(relatedTarget)) {
      return;
    }
    this.setToDoNothing();
  }
  onKeyDown() {
    if (this.isInteractingWithTooltip) {
      this.isInteractingWithTooltip = false;
    }
    this.setToDoNothing();
  }
  prepareToShowTooltip(mouseEvent, showDelayOverride) {
    if (this.state != 0 /* NOTHING */ || this.isLocked()) {
      return;
    }
    let delay = showDelayOverride == null ? 0 : Math.max(0, showDelayOverride);
    if (mouseEvent && showDelayOverride == null) {
      delay = this.isLastTooltipHiddenRecently() ? this.getTooltipDelay("SwitchShow") : this.getTooltipDelay("Show");
    }
    this.lastMouseEvent = mouseEvent || null;
    this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
    this.state = 1 /* WAITING_TO_SHOW */;
  }
  canShowTooltip() {
    const value = this.getTooltipValue();
    return _exists(value) && (!this.tooltipCtrl.shouldDisplayTooltip || this.tooltipCtrl.shouldDisplayTooltip());
  }
  isLastTooltipHiddenRecently() {
    const now = Date.now();
    const then = this.sharedState.lastHideTime;
    return then != null && now - then < SHOW_SWITCH_TOOLTIP_DIFF;
  }
  setToDoNothing(fromHideTooltip) {
    if (!fromHideTooltip && this.state === 2 /* SHOWING */) {
      this.hideTooltip();
    }
    if (this.onBodyScrollEventCallback) {
      this.onBodyScrollEventCallback();
      this.onBodyScrollEventCallback = void 0;
    }
    this.clearEventHandlers();
    if (this.onDocumentKeyDownCallback) {
      this.onDocumentKeyDownCallback();
      this.onDocumentKeyDownCallback = void 0;
    }
    if (this.onDocumentTouchStartCallback) {
      this.onDocumentTouchStartCallback();
      this.onDocumentTouchStartCallback = void 0;
    }
    this.clearTimeouts();
    this.state = 0 /* NOTHING */;
    this.lastMouseEvent = null;
  }
  showTooltip() {
    const value = this.getTooltipValue();
    const ctrl = this.tooltipCtrl;
    if (!_exists(value) || ctrl.shouldDisplayTooltip && !ctrl.shouldDisplayTooltip()) {
      this.setToDoNothing();
      return;
    }
    const params = this.gos.addCommon({
      location: ctrl.getLocation?.() ?? "UNKNOWN",
      value,
      hideTooltipCallback: () => this.hideTooltip(true),
      ...ctrl.getAdditionalParams?.()
    });
    this.state = 2 /* SHOWING */;
    this.tooltipInstanceCount++;
    const callback = this.newTooltipComponentCallback.bind(this, this.tooltipInstanceCount);
    this.createTooltipComp(params, callback);
  }
  hideTooltip(forceHide) {
    if (!forceHide && this.isInteractingWithTooltip) {
      return;
    }
    if (this.tooltipComp) {
      this.destroyTooltipComp();
      this.sharedState.lastHideTime = Date.now();
    }
    if (this.showEventDispatched) {
      this.showEventDispatched = false;
      this.eventSvc.dispatchEvent({
        type: "tooltipHide",
        parentGui: this.tooltipCtrl.getGui()
      });
    }
    if (forceHide) {
      this.isInteractingWithTooltip = false;
    }
    this.setToDoNothing(true);
  }
  newTooltipComponentCallback(tooltipInstanceCopy, tooltipComp) {
    const compNoLongerNeeded = this.state !== 2 /* SHOWING */ || this.tooltipInstanceCount !== tooltipInstanceCopy;
    if (compNoLongerNeeded) {
      this.destroyBean(tooltipComp);
      return;
    }
    const eGui = tooltipComp.getGui();
    this.tooltipComp = tooltipComp;
    if (!eGui.classList.contains("ag-tooltip")) {
      eGui.classList.add("ag-tooltip-custom");
    }
    if (this.tooltipTrigger === 0 /* HOVER */) {
      eGui.classList.add("ag-tooltip-animate");
    }
    if (this.interactionEnabled) {
      eGui.classList.add("ag-tooltip-interactive");
    }
    if (!eGui.hasAttribute("role")) {
      _setAriaRole(eGui, this.interactionEnabled ? "dialog" : "tooltip");
    }
    this.connectAriaDescription(eGui);
    const translate = this.getLocaleTextFunc();
    const addPopupRes = this.popupSvc?.addPopup({
      eChild: eGui,
      ...this.interactionEnabled ? { ariaLabel: translate("ariaLabelTooltip", "Tooltip") } : { ariaOwns: this.tooltipCtrl.getGui() }
    });
    if (addPopupRes) {
      this.tooltipPopupDestroyFunc = addPopupRes.hideFunc;
    }
    this.positionTooltip();
    if (this.tooltipTrigger === 1 /* FOCUS */) {
      const listener = () => this.hideTooltip(true);
      [this.onBodyScrollEventCallback] = this.addManagedEventListeners({
        bodyScroll: listener
      });
      this.setEventHandlers(listener);
    }
    if (this.interactionEnabled) {
      [this.tooltipMouseEnterListener, this.tooltipMouseLeaveListener] = this.addManagedElementListeners(eGui, {
        mouseenter: this.onTooltipMouseEnter.bind(this),
        mouseleave: this.onTooltipMouseLeave.bind(this)
      });
      [this.onDocumentKeyDownCallback] = this.addManagedElementListeners(_getDocument(this.beans), {
        keydown: (event) => {
          if (event) {
            this.onDocumentKeyDown(event, eGui);
          }
        }
      });
      [this.tooltipFocusInListener, this.tooltipFocusOutListener] = this.addManagedElementListeners(eGui, {
        focusin: this.onTooltipFocusIn.bind(this),
        focusout: this.onTooltipFocusOut.bind(this)
      });
    }
    [this.onDocumentTouchStartCallback] = this.addManagedElementListeners(_getDocument(this.beans), {
      touchstart: (event) => {
        if (event && !eGui.contains(event.target)) {
          this.hideTooltip(true);
        }
      }
    });
    this.showEventDispatched = true;
    this.eventSvc.dispatchEvent({
      type: "tooltipShow",
      tooltipGui: eGui,
      parentGui: this.tooltipCtrl.getGui()
    });
    this.startHideTimeout();
  }
  connectAriaDescription(eGui) {
    eGui.id || (eGui.id = `ag-tooltip-${++tooltipIdSequence}`);
    const id = eGui.id;
    const source = this.tooltipCtrl.getGui();
    const describedBy = source.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
    if (!describedBy.includes(id)) {
      source.setAttribute("aria-describedby", [...describedBy, id].join(" "));
    }
    this.describedById = id;
    this.describedBySource = source;
  }
  disconnectAriaDescription() {
    const id = this.describedById;
    const source = this.describedBySource;
    if (!id || !source) {
      return;
    }
    this.describedById = void 0;
    this.describedBySource = void 0;
    const describedBy = source.getAttribute("aria-describedby")?.split(/\s+/).filter((value) => value && value !== id);
    if (describedBy?.length) {
      source.setAttribute("aria-describedby", describedBy.join(" "));
    } else {
      source.removeAttribute("aria-describedby");
    }
  }
  onDocumentKeyDown(event, eGui) {
    const source = this.tooltipCtrl.getGui();
    if (event.key === "Escape") {
      const eventTarget = event.target;
      const returnFocus = eGui.contains(eventTarget);
      const consumeEvent = returnFocus || source.contains(eventTarget);
      if (consumeEvent) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (returnFocus && source.isConnected) {
        source.focus({ preventScroll: true });
      }
      this.hideTooltip(true);
      return;
    }
    if (event.key === "Tab" && source.contains(event.target)) {
      const focusableElements = _findFocusableElements(eGui);
      const target = event.shiftKey ? focusableElements.at(-1) : focusableElements[0];
      if (target) {
        event.preventDefault();
        this.isInteractingWithTooltip = true;
        target.focus();
        return;
      }
    }
    if (!eGui.contains(event.target)) {
      this.onKeyDown();
    }
  }
  onInteractiveSourceKeyDown(event) {
    if (this.state !== 2 /* SHOWING */ || !this.tooltipComp) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.hideTooltip(true);
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const focusableElements = _findFocusableElements(this.tooltipComp.getGui());
    const target = event.shiftKey ? focusableElements.at(-1) : focusableElements[0];
    if (target) {
      event.preventDefault();
      event.stopPropagation();
      this.isInteractingWithTooltip = true;
      target.focus();
    }
  }
  onTooltipMouseEnter() {
    this.isInteractingWithTooltip = true;
    this.unlockService();
  }
  onTooltipMouseLeave() {
    if (this.isTooltipFocused()) {
      return;
    }
    this.isInteractingWithTooltip = false;
    this.lockService();
  }
  onTooltipFocusIn() {
    this.isInteractingWithTooltip = true;
  }
  isTooltipFocused() {
    const tooltipGui = this.tooltipComp?.getGui();
    const activeEl = _getActiveDomElement(this.beans);
    return !!tooltipGui && tooltipGui.contains(activeEl);
  }
  onTooltipFocusOut(e) {
    const parentGui = this.tooltipCtrl.getGui();
    const tooltipGui = this.tooltipComp?.getGui();
    const relatedTarget = e.relatedTarget;
    if (this.isTooltipFocused() || tooltipGui?.contains(relatedTarget)) {
      return;
    }
    this.isInteractingWithTooltip = false;
    if (parentGui.contains(relatedTarget)) {
      this.startHideTimeout();
    } else {
      this.hideTooltip();
    }
  }
  positionTooltip() {
    const params = {
      type: "tooltip",
      ePopup: this.tooltipComp.getGui(),
      nudgeY: 18,
      skipObserver: this.tooltipMouseTrack,
      additionalParams: this.getPopupPositionParams()
    };
    if (this.lastMouseEvent) {
      this.popupSvc?.positionPopupUnderMouseEvent({
        ...params,
        mouseEvent: this.lastMouseEvent
      });
    } else {
      this.popupSvc?.positionPopupByComponent({
        ...params,
        eventSource: this.tooltipCtrl.getGui(),
        position: "under",
        keepWithinBounds: true,
        nudgeY: 5
      });
    }
  }
  destroyTooltipComp() {
    this.disconnectAriaDescription();
    const eGui = this.tooltipComp.getGui();
    eGui.classList.remove("ag-tooltip-interactive");
    eGui.classList.add("ag-tooltip-hiding");
    const tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
    const tooltipComp = this.tooltipComp;
    const delay = this.tooltipTrigger === 0 /* HOVER */ ? FADE_OUT_TOOLTIP_TIMEOUT : 0;
    window.setTimeout(() => {
      tooltipPopupDestroyFunc?.();
      this.destroyBean(tooltipComp);
    }, delay);
    this.clearTooltipListeners();
    this.tooltipPopupDestroyFunc = void 0;
    this.tooltipComp = void 0;
  }
  clearTooltipListeners() {
    for (const listener of [
      this.tooltipMouseEnterListener,
      this.tooltipMouseLeaveListener,
      this.tooltipFocusInListener,
      this.tooltipFocusOutListener
    ]) {
      if (listener) {
        listener();
      }
    }
    this.tooltipMouseEnterListener = this.tooltipMouseLeaveListener = this.tooltipFocusInListener = this.tooltipFocusOutListener = null;
  }
  lockService() {
    this.sharedState.lockOwner = this;
    this.interactiveTooltipTimeoutId = window.setTimeout(() => {
      this.unlockService();
      this.setToDoNothing();
    }, INTERACTIVE_HIDE_DELAY);
  }
  unlockService() {
    if (this.sharedState.lockOwner === this) {
      this.sharedState.lockOwner = void 0;
    }
    this.clearInteractiveTimeout();
  }
  startHideTimeout() {
    this.clearHideTimeout();
    this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.getTooltipDelay("Hide"));
  }
  clearShowTimeout() {
    if (!this.showTooltipTimeoutId) {
      return;
    }
    window.clearTimeout(this.showTooltipTimeoutId);
    this.showTooltipTimeoutId = void 0;
  }
  clearHideTimeout() {
    if (!this.hideTooltipTimeoutId) {
      return;
    }
    window.clearTimeout(this.hideTooltipTimeoutId);
    this.hideTooltipTimeoutId = void 0;
  }
  clearInteractiveTimeout() {
    if (!this.interactiveTooltipTimeoutId) {
      return;
    }
    window.clearTimeout(this.interactiveTooltipTimeoutId);
    this.interactiveTooltipTimeoutId = void 0;
    if (this.sharedState.lockOwner === this) {
      this.sharedState.lockOwner = void 0;
    }
  }
  clearTimeouts() {
    this.clearShowTimeout();
    this.clearHideTimeout();
    this.clearInteractiveTimeout();
  }
  isLocked() {
    return this.sharedState.lockOwner != null;
  }
};

// packages/ag-stack/src/tooltip/agHighlightTooltipFeature.ts
var AgHighlightTooltipFeature = class extends AgTooltipFeature {
  constructor(ctrl, highlightTracker, beans) {
    super(ctrl, beans);
    this.highlightTracker = highlightTracker;
    this.onHighlight = this.onHighlight.bind(this);
  }
  postConstruct() {
    super.postConstruct();
    this.wireHighlightListeners();
  }
  wireHighlightListeners() {
    this.addManagedPropertyListener("tooltipTrigger", ({ currentValue }) => {
      this.setTooltipMode(currentValue);
    });
    this.setTooltipMode(this.gos.get("tooltipTrigger"));
    this.highlightTracker.addEventListener("itemHighlighted", this.onHighlight);
  }
  onHighlight(event) {
    if (this.tooltipMode !== 1 /* FOCUS */) {
      return;
    }
    if (event.highlighted) {
      this.attemptToShowTooltip();
    } else {
      this.attemptToHideTooltip();
    }
  }
  setTooltipMode(tooltipTriggerMode = "focus") {
    this.tooltipMode = tooltipTriggerMode === "focus" ? 1 /* FOCUS */ : 0 /* HOVER */;
  }
  destroy() {
    this.highlightTracker.removeEventListener("itemHighlighted", this.onHighlight);
    super.destroy();
  }
};

// packages/ag-stack/src/utils/string.ts
var reUnescapedHtml = /[&<>"']/g;
var HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function _toString(toEscape) {
  return toEscape?.toString().toString() ?? null;
}
function _escapeString(toEscape) {
  return _toString(toEscape)?.replace(reUnescapedHtml, (chr) => HTML_ESCAPES[chr]) ?? null;
}
function _isStringLargerThan(value, length, trim) {
  if (typeof value !== "string") {
    return false;
  }
  if (trim) {
    value = value.trim();
  }
  return typeof value === "string" && value.length > length;
}
function _isExpressionString(value) {
  return _isStringLargerThan(value, 1) && value.codePointAt(0) === 61;
}
function _camelCaseToHumanText(camelCase) {
  if (!camelCase || camelCase == null) {
    return null;
  }
  const rex = /([a-z])([A-Z])/g;
  const rexCaps = /([A-Z]+)([A-Z])([a-z])/g;
  const words = camelCase.replace(rex, "$1 $2").replace(rexCaps, "$1 $2$3").replace(/\./g, " ").split(" ");
  return words.map((word) => word.substring(0, 1).toUpperCase() + (word.length > 1 ? word.substring(1, word.length) : "")).join(" ");
}

// packages/ag-stack/src/tooltip/agTooltipComponent.ts
var AgTooltipComponent = class extends AgPopupComponent {
  constructor() {
    super({ tag: "div", cls: "ag-tooltip" });
  }
  // will need to type params
  init(params) {
    const { value } = params;
    const eGui = this.getGui();
    eGui.textContent = _toString(value);
    const locationKebabCase = params.location.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
    eGui.classList.add(`ag-${locationKebabCase}-tooltip`);
  }
};

// packages/ag-stack/src/utils/bigInt.ts
var _parseBigIntOrNull = (value) => {
  if (typeof value === "bigint") {
    return value;
  }
  let trimmed;
  if (typeof value === "number") {
    trimmed = value;
  } else if (typeof value === "string") {
    trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }
    if (trimmed.endsWith("n")) {
      trimmed = trimmed.slice(0, -1);
    }
    if (!/^[+-]?\d+$/.test(trimmed)) {
      return null;
    }
  }
  if (trimmed == null) {
    return null;
  }
  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
};

// packages/ag-stack/src/utils/date.ts
var DATE_TIME_SEPARATOR = "T";
var DATE_TIME_SEPARATOR_REGEXP = new RegExp(`[${DATE_TIME_SEPARATOR} ]`);
var DATE_TIME_REGEXP = new RegExp(
  `^\\d{4}-\\d{2}-\\d{2}([${DATE_TIME_SEPARATOR} ]\\d{2}:\\d{2}(:\\d{2})?(\\.\\d+)?(Z|[+-]\\d{2}(:?\\d{2})?)?)?$`
);
function _padStartWidthZeros(value, totalStringSize) {
  return value.toString().padStart(totalStringSize, "0");
}
function _serialiseDate(date, includeTime = true, separator = DATE_TIME_SEPARATOR) {
  if (!date) {
    return null;
  }
  let serialised = [
    _padStartWidthZeros(date.getFullYear(), 4),
    _padStartWidthZeros(date.getMonth() + 1, 2),
    _padStartWidthZeros(date.getDate(), 2)
  ].join("-");
  if (includeTime) {
    serialised += separator + [date.getHours(), date.getMinutes(), date.getSeconds()].map((part) => _padStartWidthZeros(part, 2)).join(":");
  }
  return serialised;
}
function _getDateParts(d, includeTime = true) {
  if (!d) {
    return null;
  }
  if (includeTime) {
    return [
      String(d.getFullYear()),
      String(d.getMonth() + 1),
      _padStartWidthZeros(d.getDate(), 2),
      _padStartWidthZeros(d.getHours(), 2),
      `:${_padStartWidthZeros(d.getMinutes(), 2)}`,
      `:${_padStartWidthZeros(d.getSeconds(), 2)}`
    ];
  }
  return [d.getFullYear(), d.getMonth() + 1, _padStartWidthZeros(d.getDate(), 2)].map(String);
}
var calculateOrdinal = (value) => {
  if (value > 3 && value < 21) {
    return "th";
  }
  const remainder = value % 10;
  switch (remainder) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
  }
  return "th";
};
var MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function _dateToFormattedString(date, format) {
  if (format == null) {
    return _serialiseDate(date, false);
  }
  const fullYear = _padStartWidthZeros(date.getFullYear(), 4);
  const replace = {
    YYYY: () => fullYear.slice(fullYear.length - 4, fullYear.length),
    YY: () => fullYear.slice(fullYear.length - 2, fullYear.length),
    Y: () => `${date.getFullYear()}`,
    MMMM: () => MONTHS[date.getMonth()],
    MMM: () => MONTHS[date.getMonth()].slice(0, 3),
    MM: () => _padStartWidthZeros(date.getMonth() + 1, 2),
    Mo: () => `${date.getMonth() + 1}${calculateOrdinal(date.getMonth() + 1)}`,
    M: () => `${date.getMonth() + 1}`,
    Do: () => `${date.getDate()}${calculateOrdinal(date.getDate())}`,
    DD: () => _padStartWidthZeros(date.getDate(), 2),
    D: () => `${date.getDate()}`,
    dddd: () => DAYS[date.getDay()],
    ddd: () => DAYS[date.getDay()].slice(0, 3),
    dd: () => DAYS[date.getDay()].slice(0, 2),
    do: () => `${date.getDay()}${calculateOrdinal(date.getDay())}`,
    d: () => `${date.getDay()}`
  };
  const regexp = new RegExp(Object.keys(replace).join("|"), "g");
  return format.replace(regexp, (match) => {
    if (match in replace) {
      return replace[match]();
    }
    return match;
  });
}
function _isValidDate(value, bailIfInvalidTime = false) {
  return !!_parseDateTimeFromString(value, bailIfInvalidTime);
}
function _isValidDateTime(value) {
  return _isValidDate(value, true);
}
function _parseDateTimeFromString(value, bailIfInvalidTime = false, skipValidation) {
  if (!value) {
    return null;
  }
  if (!skipValidation && !DATE_TIME_REGEXP.test(value)) {
    return null;
  }
  const [dateStr, timeStr] = value.split(DATE_TIME_SEPARATOR_REGEXP);
  if (!dateStr) {
    return null;
  }
  const fields = dateStr.split("-").map((f) => Number.parseInt(f, 10));
  if (fields.filter((f) => !isNaN(f)).length !== 3) {
    return null;
  }
  const [year, month, day] = fields;
  const date = new Date(year, month - 1, day);
  if (year >= 0 && year < 100) {
    date.setFullYear(year, month - 1, day);
  }
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  if (!timeStr && bailIfInvalidTime) {
    return null;
  }
  if (!timeStr || timeStr === "00:00:00") {
    return date;
  }
  const [hours, minutes, seconds] = timeStr.split(":").map((part) => Number.parseInt(part, 10));
  if (hours >= 0 && hours < 24) {
    date.setHours(hours);
  } else if (bailIfInvalidTime) {
    return null;
  }
  if (minutes >= 0 && minutes < 60) {
    date.setMinutes(minutes);
  } else if (bailIfInvalidTime) {
    return null;
  }
  if (seconds >= 0 && seconds < 60) {
    date.setSeconds(seconds);
  } else if (bailIfInvalidTime) {
    return null;
  }
  return date;
}

// packages/ag-stack/src/utils/download.ts
function _downloadFile(fileName, content) {
  const win = document.defaultView ?? window;
  if (!win) {
    return;
  }
  const element = document.createElement("a");
  const url = win.URL.createObjectURL(content);
  element.setAttribute("href", url);
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);
  element.dispatchEvent(
    new MouseEvent("click", {
      bubbles: false,
      cancelable: true,
      view: win
    })
  );
  element.remove();
  win.setTimeout(() => {
    win.URL.revokeObjectURL(url);
  }, 0);
}

// packages/ag-stack/src/utils/fuzzyMatch.ts
function _fuzzySuggestions(params) {
  const { inputValue, allSuggestions, hideIrrelevant, maxSuggestions } = params;
  let thisSuggestions = (allSuggestions ?? []).map(
    (text, idx) => ({
      value: text,
      relevance: _getLevenshteinSimilarityDistance(inputValue, text),
      idx
    })
  );
  thisSuggestions.sort((a, b) => a.relevance - b.relevance);
  if (hideIrrelevant) {
    thisSuggestions = thisSuggestions.filter(
      (suggestion) => suggestion.relevance < Math.max(suggestion.value.length, inputValue.length)
    );
  }
  if (maxSuggestions != null && maxSuggestions > 0) {
    thisSuggestions = thisSuggestions.slice(0, maxSuggestions);
  }
  const values = [];
  const indices = [];
  for (const suggestion of thisSuggestions) {
    values.push(suggestion.value);
    indices.push(suggestion.idx);
  }
  return { values, indices };
}
function _getLevenshteinSimilarityDistance(source, target) {
  const sourceLength = source.length;
  const targetLength = target.length;
  if (targetLength === 0) {
    return sourceLength ? sourceLength : 0;
  }
  let inputLower = source.toLocaleLowerCase();
  let targetLower = target.toLocaleLowerCase();
  let swapTmp;
  if (sourceLength > 0) {
    const substringPos = targetLower.indexOf(inputLower);
    if (substringPos >= 0) {
      return substringPos * 0.01;
    }
  }
  if (source.length < target.length) {
    swapTmp = targetLower;
    targetLower = inputLower;
    inputLower = swapTmp;
    swapTmp = target;
    target = source;
    source = swapTmp;
  }
  let previousRow = new Uint16Array(targetLength + 1);
  let currentRow = new Uint16Array(targetLength + 1);
  for (let j = 0; j <= targetLength; j++) {
    previousRow[j] = j;
  }
  let secondaryScore = 0;
  const earlyMatchLimit = sourceLength / 2 - 10;
  for (let i = 1; i <= sourceLength; i++) {
    const inputChar = source[i - 1];
    const inputCharLower = inputLower[i - 1];
    currentRow[0] = i;
    for (let j = 1; j <= targetLength; j++) {
      const targetChar = target[j - 1];
      const targetCharLower = targetLower[j - 1];
      if (inputCharLower !== targetCharLower) {
        const insertCost = currentRow[j - 1];
        const deleteCost = previousRow[j];
        const replaceCost = previousRow[j - 1];
        let cost = insertCost < deleteCost ? insertCost : deleteCost;
        if (replaceCost < cost) {
          cost = replaceCost;
        }
        currentRow[j] = cost + 1 | 0;
        continue;
      }
      secondaryScore++;
      if (inputChar === targetChar) {
        secondaryScore++;
      }
      if (i > 1 && j > 1) {
        const prevSourceChar = source[i - 2];
        const prevSourceCharLower = inputLower[i - 2];
        const prevTargetChar = target[j - 2];
        const prevTargetCharLower = targetLower[j - 2];
        if (prevSourceCharLower === prevTargetCharLower) {
          secondaryScore++;
          if (prevSourceChar === prevTargetChar) {
            secondaryScore++;
          }
        }
      }
      if (i < earlyMatchLimit) {
        secondaryScore++;
      }
      currentRow[j] = previousRow[j - 1];
    }
    swapTmp = previousRow;
    previousRow = currentRow;
    currentRow = swapTmp;
  }
  return previousRow[targetLength] / (secondaryScore + 1);
}

// packages/ag-stack/src/utils/keyboard.ts
function _isEventFromPrintableCharacter(event) {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }
  const printableCharacter = event.key?.length === 1;
  return printableCharacter;
}

// packages/ag-stack/src/utils/value.ts
function _getValueUsingDotField(data, field) {
  const fields = field.split(".");
  let currentObject = data;
  for (let i = 0; i < fields.length; i++) {
    if (currentObject == null) {
      return void 0;
    }
    currentObject = currentObject[fields[i]];
  }
  return currentObject;
}
export {
  AgBeanStub,
  AgComponentStub,
  AgContext,
  AgHighlightTooltipFeature,
  AgManagedFocusFeature,
  AgPopupComponent,
  AgPositionableFeature,
  AgPromise,
  AgTabGuardComp,
  AgTabGuardCtrl,
  AgTabGuardFeature,
  AgTooltipComponent,
  AgTooltipFeature,
  AutoScrollService,
  BaseAriaAnnouncementService,
  BaseDragAndDropService,
  BaseDragService,
  BaseEnvironment,
  BaseEventService,
  BasePopupService,
  BaseRegistry,
  BaseTooltipStateManager,
  CssClassManager,
  Direction,
  FAST_TEST_TIMINGS,
  FOCUS_MANAGED_CLASS,
  KeyCode,
  LocalEventService,
  MONTHS,
  RefPlaceholder,
  TabGuardClassNames,
  ThemeImpl,
  _addOrRemoveAttribute,
  _addStylesToElement,
  _anchorElementToMouseMoveEvent,
  _areEqual,
  _areEventsNear,
  _asThemeImpl,
  _batchCall,
  _camelCaseToHumanText,
  _clearElement,
  computeAlignedPosition as _computeAlignedPosition,
  _createAgElement,
  _createStyledRootElements,
  _dateToFormattedString,
  _debounce,
  _defaultComparator,
  _doOnce,
  _downloadFile,
  _ensureDomOrder,
  _escapeString,
  _exists,
  findBestPlacement as _findBestPlacement,
  _findFocusableElements,
  _findNextFocusableElement,
  _findTabbableParent,
  fitsWithinBounds as _fitsWithinBounds,
  _flatten,
  _focusInto,
  _focusIntoTabbableFirst,
  _formatSize,
  _fuzzySuggestions,
  _getAbsoluteHeight,
  _getAbsoluteWidth,
  _getActiveDomElement,
  _getAriaCheckboxStateName,
  _getAriaLabel,
  _getAriaPosInSet,
  _getDateParts,
  _getDocument,
  getEffectivePlacements as _getEffectivePlacements,
  _getFirstActiveTouch,
  _getInnerHeight,
  _getInnerWidth,
  _getLocaleTextFromFunc,
  _getLocaleTextFromMap,
  _getLocaleTextFunc,
  _getMaxDivHeight,
  _getOwn,
  _getPageBody,
  getRectSize as _getRectSize,
  _getRootNode,
  _getScrollLeft,
  _getScrollbarWidth,
  _getTabIndex,
  _getValueUsingDotField,
  _getVerticalPaddingAndBorder,
  _getWindow,
  _hasOwn,
  _indexMap,
  _initDetachedStyledRoot,
  _initStyledRoot,
  _initStyledRootFromInnerOfThreeElements,
  _isBrowserFirefox,
  _isBrowserSafari,
  _isComponent,
  _isElementChildOfClass,
  _isElementInEventPath,
  _isElementOverflowingCallback,
  _isEventFromPrintableCharacter,
  _isEventFromThisInstance,
  _isEventSupported,
  _isExpressionString,
  _isFocusableFormField,
  _isHorizontalScrollShowing,
  _isIOSUserAgent,
  _isInDOM,
  _isInvisibleScrollbar,
  _isKeyboardMode,
  _isMacOsUserAgent,
  _isNodeOrElement,
  _isNothingFocused,
  _isPromise,
  _isRealCssEngine,
  _isStringLargerThan,
  _isValidDate,
  _isValidDateTime,
  _isVisible,
  _jsonEquals,
  _last,
  _loadTemplate,
  _makeNull,
  _missing,
  _moveInArray,
  _normaliseQwertyAzerty,
  _observeIntersection,
  _observeResize,
  _parseBigIntOrNull,
  _parseDateTimeFromString,
  _placeCaretAtEnd,
  _pushToMapArray,
  _radioCssClass,
  _registerKeyboardFocusEvents,
  _removeAllFromArray,
  _removeAriaExpanded,
  _removeAriaSort,
  _removeFromArray,
  _removeFromParent,
  _requestAnimationFrame,
  _reuseArrayIfEqual,
  _scrollHorizontallyToShow,
  _serialiseDate,
  _setAriaActiveDescendant,
  _setAriaAutoComplete,
  _setAriaChecked,
  _setAriaColCount,
  _setAriaColIndex,
  _setAriaColSpan,
  _setAriaControls,
  _setAriaControlsAndLabel,
  _setAriaDescribedBy,
  _setAriaDisabled,
  _setAriaExpanded,
  _setAriaHasPopup,
  _setAriaHidden,
  _setAriaInvalid,
  _setAriaLabel,
  _setAriaLabelledBy,
  _setAriaLevel,
  _setAriaLive,
  _setAriaMultiSelectable,
  _setAriaOrientation,
  _setAriaPosInSet,
  _setAriaRole,
  _setAriaRowCount,
  _setAriaRowIndex,
  _setAriaRowSpan,
  _setAriaSelected,
  _setAriaSetSize,
  _setAriaSort,
  _setDisabled,
  _setDisplayed,
  _setDomChildOrder,
  _setElementWidth,
  _setFixedHeight,
  _setFixedWidth,
  _setScrollLeft,
  _setStyleInjectionEnabledForTesting,
  _setVisible,
  _symmetricDiff,
  _throttle,
  toRelativeRect as _toRelativeRect,
  _toString,
  _toStringOrNull,
  _translate,
  _waitUntil,
  accentColor,
  accentMix,
  addTempEventHandlers,
  backgroundColor,
  clearTempEventHandlers,
  colorValueToCss,
  createPart,
  createSharedTheme,
  defaultFontFamily,
  defaultLightColorSchemeParams,
  fontFamilyValueToCss,
  fontWeightValueToCss,
  foregroundBackgroundMix,
  foregroundColor,
  foregroundHeaderBackgroundMix,
  foregroundMix,
  getParamType,
  imageValueToCss,
  paramToVariableName,
  paramValueToCss,
  preventEventDefault,
  sharedDefaults
};
