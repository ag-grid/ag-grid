"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/ag-grid-react/src/index.ts
var src_exports = {};
__export(src_exports, {
  AgGridReact: () => AgGridReact,
  ChangeDetectionStrategyType: () => ChangeDetectionStrategyType,
  getInstance: () => getInstance,
  useGridCellEditor: () => useGridCellEditor,
  useGridDate: () => useGridDate,
  useGridFilter: () => useGridFilter,
  useGridFloatingFilter: () => useGridFloatingFilter,
  useGridMenuItem: () => useGridMenuItem,
  warnReactiveCustomComponents: () => warnReactiveCustomComponents
});
module.exports = __toCommonJS(src_exports);

// packages/ag-grid-react/src/agGridReact.tsx
var import_react23 = __toESM(require("react"));

// packages/ag-grid-react/src/reactUi/agGridReactUi.tsx
var import_ag_grid_community19 = require("ag-grid-community");
var import_react22 = __toESM(require("react"));

// packages/ag-grid-react/src/shared/customComp/customComponentWrapper.ts
var import_ag_grid_community2 = require("ag-grid-community");

// packages/ag-grid-react/src/reactUi/customComp/customWrapperComp.tsx
var import_react2 = __toESM(require("react"));

// packages/ag-grid-react/src/shared/customComp/customContext.ts
var import_react = require("react");
var CustomContext = (0, import_react.createContext)({
  setMethods: () => {
  }
});

// packages/ag-grid-react/src/reactUi/customComp/customWrapperComp.tsx
var CustomWrapperComp = (params) => {
  const { initialProps, addUpdateCallback, CustomComponentClass, setMethods } = params;
  const [props, setProps] = (0, import_react2.useState)(initialProps);
  (0, import_react2.useEffect)(() => {
    addUpdateCallback((newProps) => setProps(newProps));
  }, []);
  return /* @__PURE__ */ import_react2.default.createElement(CustomContext.Provider, { value: { setMethods } }, /* @__PURE__ */ import_react2.default.createElement(CustomComponentClass, __spreadValues({}, props)));
};
var customWrapperComp_default = (0, import_react2.memo)(CustomWrapperComp);

// packages/ag-grid-react/src/shared/reactComponent.ts
var import_react3 = require("react");
var import_ag_grid_community = require("ag-grid-community");

// packages/ag-grid-react/src/shared/keyGenerator.ts
var counter = 0;
function generateNewKey() {
  return `agPortalKey_${++counter}`;
}

// packages/ag-grid-react/src/shared/reactComponent.ts
var import_react_dom = require("react-dom");
var import_server = require("react-dom/server");
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
    this.instanceCreated = this.isStatelessComponent() ? import_ag_grid_community.AgPromise.resolve(false) : new import_ag_grid_community.AgPromise((resolve) => {
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
    return this.portalManager.destroyPortal(this.portal);
  }
  createParentElement(params) {
    const componentWrappingElement = this.portalManager.getComponentWrappingElement();
    const eParentElement = document.createElement(componentWrappingElement || "div");
    eParentElement.classList.add("ag-react-container");
    params.reactContainer = eParentElement;
    return eParentElement;
  }
  addParentContainerStyleAndClasses() {
    if (!this.componentInstance) {
      return;
    }
    if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
      import_ag_grid_community._.warnOnce('Since v31.1 "getReactContainerStyle" is deprecated. Apply styling directly to ".ag-react-container" if needed.');
      Object.assign(this.eParentElement.style, this.componentInstance.getReactContainerStyle());
    }
    if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
      import_ag_grid_community._.warnOnce('Since v31.1 "getReactContainerClasses" is deprecated. Apply styling directly to ".ag-react-container" if needed.');
      const parentContainerClasses = this.componentInstance.getReactContainerClasses();
      parentContainerClasses.forEach((className) => this.eParentElement.classList.add(className));
    }
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
    return this.hasSymbol() ? Symbol.for("react.memo") : 60115;
  }
  hasSymbol() {
    return typeof Symbol === "function" && Symbol.for;
  }
  isStateless(Component3) {
    return typeof Component3 === "function" && !(Component3.prototype && Component3.prototype.isReactComponent) || typeof Component3 === "object" && Component3.$$typeof === this.getMemoType();
  }
  hasMethod(name) {
    const frameworkComponentInstance = this.getFrameworkComponentInstance();
    return !!frameworkComponentInstance && frameworkComponentInstance[name] != null || this.fallbackMethodAvailable(name);
  }
  callMethod(name, args) {
    const frameworkComponentInstance = this.getFrameworkComponentInstance();
    if (this.isStatelessComponent()) {
      return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
    } else if (!!!frameworkComponentInstance) {
      setTimeout(() => this.callMethod(name, args));
      return;
    }
    const method = frameworkComponentInstance[name];
    if (!!method) {
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
    this.params = params;
    this.createOrUpdatePortal(params);
    return new import_ag_grid_community.AgPromise((resolve) => this.createReactComponent(resolve));
  }
  createOrUpdatePortal(params) {
    if (!this.isStatelessComponent()) {
      params.ref = (element) => {
        var _a;
        this.componentInstance = element;
        this.addParentContainerStyleAndClasses();
        (_a = this.resolveInstanceCreated) == null ? void 0 : _a.call(this, true);
        this.resolveInstanceCreated = void 0;
      };
    }
    this.reactElement = this.createElement(this.reactComponent, __spreadProps(__spreadValues({}, params), { key: this.key }));
    this.portal = (0, import_react_dom.createPortal)(
      this.reactElement,
      this.eParentElement,
      this.portalKey
      // fixed deltaRowModeRefreshCompRenderer
    );
  }
  createElement(reactComponent, props) {
    return (0, import_react3.createElement)(reactComponent, props);
  }
  createReactComponent(resolve) {
    this.portalManager.mountReactPortal(this.portal, this, (value) => {
      resolve(value);
    });
  }
  isNullValue() {
    return this.valueRenderedIsNull(this.params);
  }
  rendered() {
    return this.isStatelessComponent() && this.statelessComponentRendered() || !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
  }
  valueRenderedIsNull(params) {
    if (!this.componentType.cellRenderer) {
      return false;
    }
    const originalConsoleError = console.error;
    try {
      console.error = () => {
      };
      const staticMarkup = (0, import_server.renderToStaticMarkup)((0, import_react3.createElement)(this.reactComponent, params));
      return staticMarkup === "";
    } catch (ignore) {
    } finally {
      console.error = originalConsoleError;
    }
    return false;
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
  optionalMethodNames.forEach((methodName) => {
    const providedMethod = providedMethods[methodName];
    if (providedMethod) {
      component[methodName] = providedMethod;
    }
  });
}
var CustomComponentWrapper = class extends ReactComponent {
  constructor() {
    super(...arguments);
    this.awaitUpdateCallback = new import_ag_grid_community2.AgPromise((resolve) => {
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
          return new import_ag_grid_community2.AgPromise((resolve) => {
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
    return __spreadProps(__spreadValues({}, this.sourceParams), {
      key: this.key,
      ref: this.ref
    });
  }
  refreshProps() {
    if (this.updateCallback) {
      return this.updateCallback();
    }
    return new import_ag_grid_community2.AgPromise((resolve) => this.awaitUpdateCallback.then(() => {
      this.updateCallback().then(() => resolve());
    }));
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

// packages/ag-grid-react/src/shared/customComp/filterComponentWrapper.ts
var FilterComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.model = null;
    this.onModelChange = (model) => this.updateModel(model);
    this.onUiChange = () => this.sourceParams.filterChangedCallback();
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
    this.model = model;
    return this.refreshProps();
  }
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
    return true;
  }
  getOptionalMethods() {
    return ["afterGuiAttached", "afterGuiDetached", "onNewRowsLoaded", "getModelAsString", "onAnyFilterChanged"];
  }
  updateModel(model) {
    this.setModel(model).then(() => this.sourceParams.filterChangedCallback());
  }
  getProps() {
    const props = super.getProps();
    props.model = this.model;
    props.onModelChange = this.onModelChange;
    props.onUiChange = this.onUiChange;
    delete props.filterChangedCallback;
    delete props.filterModifiedCallback;
    delete props.valueGetter;
    return props;
  }
};

// packages/ag-grid-react/src/shared/customComp/floatingFilterComponentProxy.ts
var import_ag_grid_community3 = require("ag-grid-community");
function updateFloatingFilterParent(params, model) {
  params.parentFilterInstance((instance) => {
    (instance.setModel(model) || import_ag_grid_community3.AgPromise.resolve()).then(() => {
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
    return __spreadProps(__spreadValues({}, this.floatingFilterParams), {
      model: this.model,
      onModelChange: this.onModelChange
    });
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

// packages/ag-grid-react/src/shared/customComp/loadingOverlayComponentWrapper.ts
var LoadingOverlayComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
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

// packages/ag-grid-react/src/shared/customComp/noRowsOverlayComponentWrapper.ts
var NoRowsOverlayComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
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
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
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

// packages/ag-grid-react/src/shared/portalManager.ts
var _PortalManager = class _PortalManager {
  constructor(refresher, wrappingElement, maxComponentCreationTimeMs) {
    this.destroyed = false;
    this.portals = [];
    this.hasPendingPortalUpdate = false;
    this.wrappingElement = wrappingElement ? wrappingElement : "div";
    this.refresher = refresher;
    this.maxComponentCreationTimeMs = maxComponentCreationTimeMs ? maxComponentCreationTimeMs : _PortalManager.MAX_COMPONENT_CREATION_TIME_IN_MS;
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
        if (reactComponent.isNullValue()) {
          resolve(reactComponent);
          return;
        }
        console.error(`AG Grid: React Component '${reactComponent.getReactComponentName()}' not created within ${this.maxComponentCreationTimeMs}ms.`);
        console.error("    If the component is using `forwardRef` but not `useImperativeHandle`, add the following: `useImperativeHandle(ref, () => ({}));`");
        return;
      }
      window.setTimeout(() => {
        this.waitForInstance(reactComponent, resolve, startTime);
      });
    }
  }
};
_PortalManager.MAX_COMPONENT_CREATION_TIME_IN_MS = 1e3;
var PortalManager = _PortalManager;

// packages/ag-grid-react/src/reactUi/beansContext.tsx
var import_react4 = __toESM(require("react"));
var BeansContext = import_react4.default.createContext({});

// packages/ag-grid-react/src/reactUi/utils.tsx
var import_react_dom2 = __toESM(require("react-dom"));
var classesList = (...list) => {
  const filtered = list.filter((s) => s != null && s !== "");
  return filtered.join(" ");
};
var CssClasses = class _CssClasses {
  constructor(...initialClasses) {
    this.classesMap = {};
    initialClasses.forEach((className) => {
      this.classesMap[className] = true;
    });
  }
  setClass(className, on) {
    const nothingHasChanged = !!this.classesMap[className] == on;
    if (nothingHasChanged) {
      return this;
    }
    const res = new _CssClasses();
    res.classesMap = __spreadValues({}, this.classesMap);
    res.classesMap[className] = on;
    return res;
  }
  toString() {
    const res = Object.keys(this.classesMap).filter((key) => this.classesMap[key]).join(" ");
    return res;
  }
};
var isComponentStateless = (Component3) => {
  const hasSymbol = () => typeof Symbol === "function" && Symbol.for;
  const getMemoType = () => hasSymbol() ? Symbol.for("react.memo") : 60115;
  return typeof Component3 === "function" && !(Component3.prototype && Component3.prototype.isReactComponent) || typeof Component3 === "object" && Component3.$$typeof === getMemoType();
};
var createRootAndFlushSyncAvailable = import_react_dom2.default.createRoot != null && import_react_dom2.default.flushSync != null;
var disableFlushSync = false;
function runWithoutFlushSync(func) {
  if (!disableFlushSync) {
    setTimeout(() => disableFlushSync = false, 0);
  }
  disableFlushSync = true;
  return func();
}
var agFlushSync = (useFlushSync, fn) => {
  if (createRootAndFlushSyncAvailable && useFlushSync && !disableFlushSync) {
    import_react_dom2.default.flushSync(fn);
  } else {
    fn();
  }
};
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
    nextMap.set(c.getInstanceId(), c);
  }
  for (let i = 0; i < prev.length; i++) {
    const c = prev[i];
    prevMap.set(c.getInstanceId(), c);
    if (nextMap.has(c.getInstanceId())) {
      oldValues.push(c);
    }
  }
  for (let i = 0; i < next.length; i++) {
    const c = next[i];
    const instanceId = c.getInstanceId();
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
  return [...oldValues, ...newValues];
}

// packages/ag-grid-react/src/reactUi/cellRenderer/groupCellRenderer.tsx
var import_ag_grid_community4 = require("ag-grid-community");
var import_react5 = __toESM(require("react"));

// packages/ag-grid-react/src/reactUi/jsComp.tsx
var showJsComp = (compDetails, context, eParent, ref) => {
  const doNothing = !compDetails || compDetails.componentFromFramework || context.isDestroyed();
  if (doNothing) {
    return;
  }
  const promise = compDetails.newAgStackInstance();
  if (!promise) {
    return;
  }
  let comp;
  let compGui;
  let destroyed = false;
  promise.then((c) => {
    if (destroyed) {
      context.destroyBean(c);
      return;
    }
    comp = c;
    compGui = comp.getGui();
    eParent.appendChild(compGui);
    setRef(ref, comp);
  });
  return () => {
    destroyed = true;
    if (!comp) {
      return;
    }
    if (compGui && compGui.parentElement) {
      compGui.parentElement.removeChild(compGui);
    }
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
var createSyncJsComp = (compDetails) => {
  const promise = compDetails.newAgStackInstance();
  if (!promise) {
    return;
  }
  return promise.resolveNow(null, (x) => x);
};

// packages/ag-grid-react/src/reactUi/cellRenderer/groupCellRenderer.tsx
var GroupCellRenderer = (0, import_react5.forwardRef)((props, ref) => {
  var _a;
  const context = (0, import_react5.useContext)(BeansContext).context;
  const eGui = (0, import_react5.useRef)(null);
  const eValueRef = (0, import_react5.useRef)(null);
  const eCheckboxRef = (0, import_react5.useRef)(null);
  const eExpandedRef = (0, import_react5.useRef)(null);
  const eContractedRef = (0, import_react5.useRef)(null);
  const ctrlRef = (0, import_react5.useRef)();
  const [innerCompDetails, setInnerCompDetails] = (0, import_react5.useState)();
  const [childCount, setChildCount] = (0, import_react5.useState)();
  const [value, setValue] = (0, import_react5.useState)();
  const [cssClasses, setCssClasses] = (0, import_react5.useState)(() => new CssClasses());
  const [expandedCssClasses, setExpandedCssClasses] = (0, import_react5.useState)(() => new CssClasses("ag-hidden"));
  const [contractedCssClasses, setContractedCssClasses] = (0, import_react5.useState)(() => new CssClasses("ag-hidden"));
  const [checkboxCssClasses, setCheckboxCssClasses] = (0, import_react5.useState)(() => new CssClasses("ag-invisible"));
  (0, import_react5.useImperativeHandle)(ref, () => {
    return {
      // force new instance when grid tries to refresh
      refresh() {
        return false;
      }
    };
  });
  (0, import_react5.useLayoutEffect)(() => {
    return showJsComp(innerCompDetails, context, eValueRef.current);
  }, [innerCompDetails]);
  const setRef2 = (0, import_react5.useCallback)((ref2) => {
    eGui.current = ref2;
    if (!eGui.current) {
      context.destroyBean(ctrlRef.current);
      ctrlRef.current = null;
      return;
    }
    const compProxy = {
      setInnerRenderer: (details, valueToDisplay) => {
        setInnerCompDetails(details);
        setValue(valueToDisplay);
      },
      setChildCount: (count) => setChildCount(count),
      addOrRemoveCssClass: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setContractedDisplayed: (displayed) => setContractedCssClasses((prev) => prev.setClass("ag-hidden", !displayed)),
      setExpandedDisplayed: (displayed) => setExpandedCssClasses((prev) => prev.setClass("ag-hidden", !displayed)),
      setCheckboxVisible: (visible) => setCheckboxCssClasses((prev) => prev.setClass("ag-invisible", !visible))
    };
    ctrlRef.current = context.createBean(new import_ag_grid_community4.GroupCellRendererCtrl());
    ctrlRef.current.init(compProxy, eGui.current, eCheckboxRef.current, eExpandedRef.current, eContractedRef.current, GroupCellRenderer, props);
  }, []);
  const className = (0, import_react5.useMemo)(() => `ag-cell-wrapper ${cssClasses.toString()}`, [cssClasses]);
  const expandedClassName = (0, import_react5.useMemo)(() => `ag-group-expanded ${expandedCssClasses.toString()}`, [expandedCssClasses]);
  const contractedClassName = (0, import_react5.useMemo)(() => `ag-group-contracted ${contractedCssClasses.toString()}`, [contractedCssClasses]);
  const checkboxClassName = (0, import_react5.useMemo)(() => `ag-group-checkbox ${checkboxCssClasses.toString()}`, [checkboxCssClasses]);
  const useFwRenderer = innerCompDetails && innerCompDetails.componentFromFramework;
  const FwRenderer = useFwRenderer ? innerCompDetails.componentClass : void 0;
  const useValue = innerCompDetails == null && value != null;
  const escapedValue = import_ag_grid_community4._.escapeString(value, true);
  return /* @__PURE__ */ import_react5.default.createElement("span", __spreadValues({ className, ref: setRef2 }, !props.colDef ? { role: (_a = ctrlRef.current) == null ? void 0 : _a.getCellAriaRole() } : {}), /* @__PURE__ */ import_react5.default.createElement("span", { className: expandedClassName, ref: eExpandedRef }), /* @__PURE__ */ import_react5.default.createElement("span", { className: contractedClassName, ref: eContractedRef }), /* @__PURE__ */ import_react5.default.createElement("span", { className: checkboxClassName, ref: eCheckboxRef }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "ag-group-value", ref: eValueRef }, useValue && /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, escapedValue), useFwRenderer && /* @__PURE__ */ import_react5.default.createElement(FwRenderer, __spreadValues({}, innerCompDetails.params))), /* @__PURE__ */ import_react5.default.createElement("span", { className: "ag-group-child-count" }, childCount));
});
var groupCellRenderer_default = GroupCellRenderer;

// packages/ag-grid-react/src/reactUi/gridComp.tsx
var import_ag_grid_community18 = require("ag-grid-community");
var import_react21 = __toESM(require("react"));

// packages/ag-grid-react/src/reactUi/gridBodyComp.tsx
var import_ag_grid_community16 = require("ag-grid-community");
var import_react19 = __toESM(require("react"));

// packages/ag-grid-react/src/reactUi/header/gridHeaderComp.tsx
var import_react11 = __toESM(require("react"));
var import_ag_grid_community10 = require("ag-grid-community");

// packages/ag-grid-react/src/reactUi/header/headerRowContainerComp.tsx
var import_react10 = __toESM(require("react"));
var import_ag_grid_community9 = require("ag-grid-community");

// packages/ag-grid-react/src/reactUi/header/headerRowComp.tsx
var import_ag_grid_community8 = require("ag-grid-community");
var import_react9 = __toESM(require("react"));

// packages/ag-grid-react/src/reactUi/header/headerCellComp.tsx
var import_react6 = __toESM(require("react"));
var import_ag_grid_community5 = require("ag-grid-community");
var HeaderCellComp = (props) => {
  const { ctrl } = props;
  const isAlive = ctrl.isAlive();
  const { context } = (0, import_react6.useContext)(BeansContext);
  const colId = isAlive ? ctrl.getColId() : void 0;
  const [userCompDetails, setUserCompDetails] = (0, import_react6.useState)();
  const eGui = (0, import_react6.useRef)(null);
  const eResize = (0, import_react6.useRef)(null);
  const eHeaderCompWrapper = (0, import_react6.useRef)(null);
  const userCompRef = (0, import_react6.useRef)();
  let cssClassManager = (0, import_react6.useRef)();
  if (isAlive && !cssClassManager.current) {
    cssClassManager.current = new import_ag_grid_community5.CssClassManager(() => eGui.current);
  }
  const setRef2 = (0, import_react6.useCallback)((e) => {
    var _a;
    eGui.current = e;
    if (!eGui.current || !isAlive) {
      return;
    }
    const compProxy = {
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      addOrRemoveCssClass: (name, on) => cssClassManager.current.addOrRemoveCssClass(name, on),
      setAriaSort: (sort) => {
        if (eGui.current) {
          sort ? import_ag_grid_community5._.setAriaSort(eGui.current, sort) : import_ag_grid_community5._.removeAriaSort(eGui.current);
        }
      },
      setUserCompDetails: (compDetails) => setUserCompDetails(compDetails),
      getUserCompInstance: () => userCompRef.current || void 0
    };
    ctrl.setComp(compProxy, eGui.current, eResize.current, eHeaderCompWrapper.current);
    const selectAllGui = ctrl.getSelectAllGui();
    (_a = eResize.current) == null ? void 0 : _a.insertAdjacentElement("afterend", selectAllGui);
  }, []);
  (0, import_react6.useLayoutEffect)(() => showJsComp(userCompDetails, context, eHeaderCompWrapper.current, userCompRef), [userCompDetails]);
  (0, import_react6.useEffect)(() => {
    ctrl.setDragSource(eGui.current);
  }, [userCompDetails]);
  const userCompStateless = (0, import_react6.useMemo)(() => {
    const res = (userCompDetails == null ? void 0 : userCompDetails.componentFromFramework) && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
  const UserCompClass = userCompDetails && userCompDetails.componentClass;
  return /* @__PURE__ */ import_react6.default.createElement(
    "div",
    {
      ref: setRef2,
      className: "ag-header-cell",
      "col-id": colId,
      role: "columnheader"
    },
    /* @__PURE__ */ import_react6.default.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }),
    /* @__PURE__ */ import_react6.default.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" }, reactUserComp && userCompStateless && /* @__PURE__ */ import_react6.default.createElement(UserCompClass, __spreadValues({}, userCompDetails.params)), reactUserComp && !userCompStateless && /* @__PURE__ */ import_react6.default.createElement(UserCompClass, __spreadProps(__spreadValues({}, userCompDetails.params), { ref: userCompRef })))
  );
};
var headerCellComp_default = (0, import_react6.memo)(HeaderCellComp);

// packages/ag-grid-react/src/reactUi/header/headerGroupCellComp.tsx
var import_react7 = __toESM(require("react"));
var HeaderGroupCellComp = (props) => {
  const { context } = (0, import_react7.useContext)(BeansContext);
  const { ctrl } = props;
  const [cssClasses, setCssClasses] = (0, import_react7.useState)(() => new CssClasses());
  const [cssResizableClasses, setResizableCssClasses] = (0, import_react7.useState)(() => new CssClasses());
  const [resizableAriaHidden, setResizableAriaHidden] = (0, import_react7.useState)("false");
  const [ariaExpanded, setAriaExpanded] = (0, import_react7.useState)();
  const [userCompDetails, setUserCompDetails] = (0, import_react7.useState)();
  const colId = (0, import_react7.useMemo)(() => ctrl.getColId(), []);
  const eGui = (0, import_react7.useRef)(null);
  const eResize = (0, import_react7.useRef)(null);
  const userCompRef = (0, import_react7.useRef)();
  const setRef2 = (0, import_react7.useCallback)((e) => {
    eGui.current = e;
    if (!eGui.current) {
      return;
    }
    const compProxy = {
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      addOrRemoveCssClass: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setUserCompDetails: (compDetails) => setUserCompDetails(compDetails),
      setResizableDisplayed: (displayed) => {
        setResizableCssClasses((prev) => prev.setClass("ag-hidden", !displayed));
        setResizableAriaHidden(!displayed ? "true" : "false");
      },
      setAriaExpanded: (expanded) => setAriaExpanded(expanded),
      getUserCompInstance: () => userCompRef.current || void 0
    };
    ctrl.setComp(compProxy, eGui.current, eResize.current);
  }, []);
  (0, import_react7.useLayoutEffect)(() => showJsComp(userCompDetails, context, eGui.current), [userCompDetails]);
  (0, import_react7.useEffect)(() => {
    if (eGui.current) {
      ctrl.setDragSource(eGui.current);
    }
  }, [userCompDetails]);
  const userCompStateless = (0, import_react7.useMemo)(() => {
    const res = (userCompDetails == null ? void 0 : userCompDetails.componentFromFramework) && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const className = (0, import_react7.useMemo)(() => "ag-header-group-cell " + cssClasses.toString(), [cssClasses]);
  const resizableClassName = (0, import_react7.useMemo)(() => "ag-header-cell-resize " + cssResizableClasses.toString(), [cssResizableClasses]);
  const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
  const UserCompClass = userCompDetails && userCompDetails.componentClass;
  return /* @__PURE__ */ import_react7.default.createElement(
    "div",
    {
      ref: setRef2,
      className,
      "col-id": colId,
      role: "columnheader",
      "aria-expanded": ariaExpanded
    },
    reactUserComp && userCompStateless && /* @__PURE__ */ import_react7.default.createElement(UserCompClass, __spreadValues({}, userCompDetails.params)),
    reactUserComp && !userCompStateless && /* @__PURE__ */ import_react7.default.createElement(UserCompClass, __spreadProps(__spreadValues({}, userCompDetails.params), { ref: userCompRef })),
    /* @__PURE__ */ import_react7.default.createElement("div", { ref: eResize, "aria-hidden": resizableAriaHidden, className: resizableClassName })
  );
};
var headerGroupCellComp_default = (0, import_react7.memo)(HeaderGroupCellComp);

// packages/ag-grid-react/src/reactUi/header/headerFilterCellComp.tsx
var import_react8 = __toESM(require("react"));
var import_ag_grid_community7 = require("ag-grid-community");

// packages/ag-grid-react/src/shared/customComp/util.ts
var import_ag_grid_community6 = require("ag-grid-community");
function getInstance(wrapperComponent, callback) {
  var _a, _b;
  const promise = (_b = (_a = wrapperComponent == null ? void 0 : wrapperComponent.getInstance) == null ? void 0 : _a.call(wrapperComponent)) != null ? _b : import_ag_grid_community6.AgPromise.resolve(void 0);
  promise.then((comp) => callback(comp));
}
function warnReactiveCustomComponents() {
  import_ag_grid_community6._.warnOnce("Using custom components without `reactiveCustomComponents = true` is deprecated.");
}

// packages/ag-grid-react/src/reactUi/header/headerFilterCellComp.tsx
var HeaderFilterCellComp = (props) => {
  const { context, gridOptionsService } = (0, import_react8.useContext)(BeansContext);
  const [cssClasses, setCssClasses] = (0, import_react8.useState)(() => new CssClasses("ag-header-cell", "ag-floating-filter"));
  const [cssBodyClasses, setBodyCssClasses] = (0, import_react8.useState)(() => new CssClasses());
  const [cssButtonWrapperClasses, setButtonWrapperCssClasses] = (0, import_react8.useState)(() => new CssClasses("ag-floating-filter-button", "ag-hidden"));
  const [buttonWrapperAriaHidden, setButtonWrapperAriaHidden] = (0, import_react8.useState)("false");
  const [userCompDetails, setUserCompDetails] = (0, import_react8.useState)();
  const [renderKey, setRenderKey] = (0, import_react8.useState)(1);
  const eGui = (0, import_react8.useRef)(null);
  const eFloatingFilterBody = (0, import_react8.useRef)(null);
  const eButtonWrapper = (0, import_react8.useRef)(null);
  const eButtonShowMainFilter = (0, import_react8.useRef)(null);
  const userCompResolve = (0, import_react8.useRef)();
  const userCompPromise = (0, import_react8.useRef)();
  const userCompRef = (value) => {
    if (value == null) {
      return;
    }
    userCompResolve.current && userCompResolve.current(value);
  };
  const { ctrl } = props;
  const setRef2 = (0, import_react8.useCallback)((e) => {
    eGui.current = e;
    if (!eGui.current) {
      return;
    }
    userCompPromise.current = new import_ag_grid_community7.AgPromise((resolve) => {
      userCompResolve.current = resolve;
    });
    const compProxy = {
      addOrRemoveCssClass: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
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
      setMenuIcon: (eIcon) => {
        var _a;
        return (_a = eButtonShowMainFilter.current) == null ? void 0 : _a.appendChild(eIcon);
      }
    };
    ctrl.setComp(compProxy, eGui.current, eButtonShowMainFilter.current, eFloatingFilterBody.current);
  }, []);
  (0, import_react8.useLayoutEffect)(() => showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompRef), [userCompDetails]);
  const className = (0, import_react8.useMemo)(() => cssClasses.toString(), [cssClasses]);
  const bodyClassName = (0, import_react8.useMemo)(() => cssBodyClasses.toString(), [cssBodyClasses]);
  const buttonWrapperClassName = (0, import_react8.useMemo)(() => cssButtonWrapperClasses.toString(), [cssButtonWrapperClasses]);
  const userCompStateless = (0, import_react8.useMemo)(() => {
    const res = userCompDetails && userCompDetails.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const reactiveCustomComponents = (0, import_react8.useMemo)(() => gridOptionsService.get("reactiveCustomComponents"), []);
  const floatingFilterCompProxy = (0, import_react8.useMemo)(() => {
    if (userCompDetails) {
      if (reactiveCustomComponents) {
        const compProxy = new FloatingFilterComponentProxy(userCompDetails.params, () => setRenderKey((prev) => prev + 1));
        userCompRef(compProxy);
        return compProxy;
      } else if (userCompDetails.componentFromFramework) {
        warnReactiveCustomComponents();
      }
    }
    return void 0;
  }, [userCompDetails]);
  const floatingFilterProps = floatingFilterCompProxy == null ? void 0 : floatingFilterCompProxy.getProps();
  const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
  const UserCompClass = userCompDetails && userCompDetails.componentClass;
  return /* @__PURE__ */ import_react8.default.createElement("div", { ref: setRef2, className, role: "gridcell" }, /* @__PURE__ */ import_react8.default.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" }, reactUserComp && !reactiveCustomComponents && /* @__PURE__ */ import_react8.default.createElement(UserCompClass, __spreadProps(__spreadValues({}, userCompDetails.params), { ref: userCompStateless ? () => {
  } : userCompRef })), reactUserComp && reactiveCustomComponents && /* @__PURE__ */ import_react8.default.createElement(CustomContext.Provider, { value: {
    setMethods: (methods) => floatingFilterCompProxy.setMethods(methods)
  } }, /* @__PURE__ */ import_react8.default.createElement(UserCompClass, __spreadValues({}, floatingFilterProps)))), /* @__PURE__ */ import_react8.default.createElement("div", { ref: eButtonWrapper, "aria-hidden": buttonWrapperAriaHidden, className: buttonWrapperClassName, role: "presentation" }, /* @__PURE__ */ import_react8.default.createElement("button", { ref: eButtonShowMainFilter, type: "button", className: "ag-button ag-floating-filter-button-button", tabIndex: -1 })));
};
var headerFilterCellComp_default = (0, import_react8.memo)(HeaderFilterCellComp);

// packages/ag-grid-react/src/reactUi/header/headerRowComp.tsx
var HeaderRowComp = (props) => {
  const { ctrl } = props;
  const { topOffset, rowHeight } = (0, import_react9.useMemo)(() => ctrl.getTopAndHeight(), []);
  const ariaRowIndex = ctrl.getAriaRowIndex();
  const className = ctrl.getHeaderRowClass();
  const [height, setHeight] = (0, import_react9.useState)(() => rowHeight + "px");
  const [top, setTop] = (0, import_react9.useState)(() => topOffset + "px");
  const [cellCtrls, setCellCtrls] = (0, import_react9.useState)(() => ctrl.getHeaderCtrls());
  const eGui = (0, import_react9.useRef)(null);
  const setRef2 = (0, import_react9.useCallback)((e) => {
    eGui.current = e;
    if (!e) {
      return;
    }
    const compProxy = {
      setHeight: (height2) => setHeight(height2),
      setTop: (top2) => setTop(top2),
      setHeaderCtrls: (ctrls, forceOrder, afterScroll) => {
        agFlushSync(afterScroll, () => {
          setCellCtrls((prev) => getNextValueIfDifferent(prev, ctrls, forceOrder));
        });
      },
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      }
    };
    ctrl.setComp(compProxy, false);
  }, []);
  const style = (0, import_react9.useMemo)(() => ({
    height,
    top
  }), [height, top]);
  const createCellJsx = (0, import_react9.useCallback)((cellCtrl) => {
    switch (ctrl.getType()) {
      case import_ag_grid_community8.HeaderRowType.COLUMN_GROUP:
        return /* @__PURE__ */ import_react9.default.createElement(headerGroupCellComp_default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
      case import_ag_grid_community8.HeaderRowType.FLOATING_FILTER:
        return /* @__PURE__ */ import_react9.default.createElement(headerFilterCellComp_default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
      default:
        return /* @__PURE__ */ import_react9.default.createElement(headerCellComp_default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
    }
  }, []);
  return /* @__PURE__ */ import_react9.default.createElement("div", { ref: setRef2, className, role: "row", style, "aria-rowindex": ariaRowIndex }, cellCtrls.map(createCellJsx));
};
var headerRowComp_default = (0, import_react9.memo)(HeaderRowComp);

// packages/ag-grid-react/src/reactUi/header/headerRowContainerComp.tsx
var HeaderRowContainerComp = (props) => {
  const [displayed, setDisplayed] = (0, import_react10.useState)(true);
  const [headerRowCtrls, setHeaderRowCtrls] = (0, import_react10.useState)([]);
  const { context } = (0, import_react10.useContext)(BeansContext);
  const eGui = (0, import_react10.useRef)(null);
  const eCenterContainer = (0, import_react10.useRef)(null);
  const headerRowCtrlRef = (0, import_react10.useRef)(null);
  const pinnedLeft = props.pinned === "left";
  const pinnedRight = props.pinned === "right";
  const centre = !pinnedLeft && !pinnedRight;
  const setRef2 = (0, import_react10.useCallback)((e) => {
    eGui.current = e;
    if (!eGui.current) {
      context.destroyBean(headerRowCtrlRef.current);
      headerRowCtrlRef.current = null;
      return;
    }
    const compProxy = {
      setDisplayed,
      setCtrls: (ctrls) => setHeaderRowCtrls(ctrls),
      // centre only
      setCenterWidth: (width) => {
        if (eCenterContainer.current) {
          eCenterContainer.current.style.width = width;
        }
      },
      setViewportScrollLeft: (left) => {
        if (eGui.current) {
          eGui.current.scrollLeft = left;
        }
      },
      // pinned only
      setPinnedContainerWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
          eGui.current.style.minWidth = width;
          eGui.current.style.maxWidth = width;
        }
      }
    };
    headerRowCtrlRef.current = context.createBean(new import_ag_grid_community9.HeaderRowContainerCtrl(props.pinned));
    headerRowCtrlRef.current.setComp(compProxy, eGui.current);
  }, []);
  const className = !displayed ? "ag-hidden" : "";
  const insertRowsJsx = () => headerRowCtrls.map((ctrl) => /* @__PURE__ */ import_react10.default.createElement(headerRowComp_default, { ctrl, key: ctrl.getInstanceId() }));
  return /* @__PURE__ */ import_react10.default.createElement(import_react10.default.Fragment, null, pinnedLeft && /* @__PURE__ */ import_react10.default.createElement("div", { ref: setRef2, className: "ag-pinned-left-header " + className, "aria-hidden": !displayed, role: "rowgroup" }, insertRowsJsx()), pinnedRight && /* @__PURE__ */ import_react10.default.createElement("div", { ref: setRef2, className: "ag-pinned-right-header " + className, "aria-hidden": !displayed, role: "rowgroup" }, insertRowsJsx()), centre && /* @__PURE__ */ import_react10.default.createElement("div", { ref: setRef2, className: "ag-header-viewport " + className, role: "presentation" }, /* @__PURE__ */ import_react10.default.createElement("div", { ref: eCenterContainer, className: "ag-header-container", role: "rowgroup" }, insertRowsJsx())));
};
var headerRowContainerComp_default = (0, import_react10.memo)(HeaderRowContainerComp);

// packages/ag-grid-react/src/reactUi/header/gridHeaderComp.tsx
var GridHeaderComp = () => {
  const [cssClasses, setCssClasses] = (0, import_react11.useState)(() => new CssClasses());
  const [height, setHeight] = (0, import_react11.useState)();
  const { context } = (0, import_react11.useContext)(BeansContext);
  const eGui = (0, import_react11.useRef)(null);
  const gridCtrlRef = (0, import_react11.useRef)(null);
  const setRef2 = (0, import_react11.useCallback)((e) => {
    eGui.current = e;
    if (!e) {
      context.destroyBean(gridCtrlRef.current);
      gridCtrlRef.current = null;
      return;
    }
    const compProxy = {
      addOrRemoveCssClass: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setHeightAndMinHeight: (height2) => setHeight(height2)
    };
    gridCtrlRef.current = context.createBean(new import_ag_grid_community10.GridHeaderCtrl());
    gridCtrlRef.current.setComp(compProxy, eGui.current, eGui.current);
  }, []);
  const className = (0, import_react11.useMemo)(() => {
    let res = cssClasses.toString();
    return "ag-header " + res;
  }, [cssClasses]);
  const style = (0, import_react11.useMemo)(() => ({
    height,
    minHeight: height
  }), [height]);
  return /* @__PURE__ */ import_react11.default.createElement("div", { ref: setRef2, className, style, role: "presentation" }, /* @__PURE__ */ import_react11.default.createElement(headerRowContainerComp_default, { pinned: "left" }), /* @__PURE__ */ import_react11.default.createElement(headerRowContainerComp_default, { pinned: null }), /* @__PURE__ */ import_react11.default.createElement(headerRowContainerComp_default, { pinned: "right" }));
};
var gridHeaderComp_default = (0, import_react11.memo)(GridHeaderComp);

// packages/ag-grid-react/src/reactUi/reactComment.tsx
var import_react12 = require("react");
var useReactCommentEffect = (comment, eForCommentRef) => {
  (0, import_react12.useEffect)(() => {
    const eForComment = eForCommentRef.current;
    if (eForComment) {
      const eParent = eForComment.parentElement;
      if (eParent) {
        const eComment = document.createComment(comment);
        eParent.insertBefore(eComment, eForComment);
        return () => {
          eParent.removeChild(eComment);
        };
      }
    }
  }, [comment]);
};
var reactComment_default = useReactCommentEffect;

// packages/ag-grid-react/src/reactUi/rows/rowContainerComp.tsx
var import_ag_grid_community15 = require("ag-grid-community");
var import_react18 = __toESM(require("react"));

// packages/ag-grid-react/src/reactUi/rows/rowComp.tsx
var import_react17 = __toESM(require("react"));
var import_ag_grid_community14 = require("ag-grid-community");

// packages/ag-grid-react/src/reactUi/cells/cellComp.tsx
var import_ag_grid_community13 = require("ag-grid-community");
var import_react16 = __toESM(require("react"));

// packages/ag-grid-react/src/reactUi/cells/popupEditorComp.tsx
var import_ag_grid_community11 = require("ag-grid-community");
var import_react14 = __toESM(require("react"));
var import_react_dom3 = require("react-dom");

// packages/ag-grid-react/src/reactUi/useEffectOnce.tsx
var import_react13 = require("react");
var useEffectOnce = (effect) => {
  const effectFn = (0, import_react13.useRef)(effect);
  const destroyFn = (0, import_react13.useRef)();
  const effectCalled = (0, import_react13.useRef)(false);
  const rendered = (0, import_react13.useRef)(false);
  const [, setVal] = (0, import_react13.useState)(0);
  if (effectCalled.current) {
    rendered.current = true;
  }
  (0, import_react13.useEffect)(() => {
    if (!effectCalled.current) {
      destroyFn.current = effectFn.current();
      effectCalled.current = true;
    }
    setVal((val) => val + 1);
    return () => {
      if (!rendered.current) {
        return;
      }
      if (destroyFn.current) {
        destroyFn.current();
      }
    };
  }, []);
};

// packages/ag-grid-react/src/reactUi/cells/popupEditorComp.tsx
var PopupEditorComp = (props) => {
  const [popupEditorWrapper, setPopupEditorWrapper] = (0, import_react14.useState)();
  const { context, popupService, localeService, gridOptionsService } = (0, import_react14.useContext)(BeansContext);
  useEffectOnce(() => {
    const { editDetails, cellCtrl, eParentCell } = props;
    const { compDetails } = editDetails;
    const useModelPopup = gridOptionsService.get("stopEditingWhenCellsLoseFocus");
    const wrapper = context.createBean(new import_ag_grid_community11.PopupEditorWrapper(compDetails.params));
    const ePopupGui = wrapper.getGui();
    if (props.jsChildComp) {
      const eChildGui = props.jsChildComp.getGui();
      if (eChildGui) {
        ePopupGui.appendChild(eChildGui);
      }
    }
    const positionParams = {
      column: cellCtrl.getColumn(),
      rowNode: cellCtrl.getRowNode(),
      type: "popupCellEditor",
      eventSource: eParentCell,
      ePopup: ePopupGui,
      position: editDetails.popupPosition,
      keepWithinBounds: true
    };
    const positionCallback = popupService.positionPopupByComponent.bind(popupService, positionParams);
    const translate = localeService.getLocaleTextFunc();
    const addPopupRes = popupService.addPopup({
      modal: useModelPopup,
      eChild: ePopupGui,
      closeOnEsc: true,
      closedCallback: () => {
        cellCtrl.onPopupEditorClosed();
      },
      anchorToElement: eParentCell,
      positionCallback,
      ariaLabel: translate("ariaLabelCellEditor", "Cell Editor")
    });
    const hideEditorPopup = addPopupRes ? addPopupRes.hideFunc : void 0;
    setPopupEditorWrapper(wrapper);
    props.jsChildComp && props.jsChildComp.afterGuiAttached && props.jsChildComp.afterGuiAttached();
    return () => {
      if (hideEditorPopup != null) {
        hideEditorPopup();
      }
      context.destroyBean(wrapper);
    };
  });
  return /* @__PURE__ */ import_react14.default.createElement(import_react14.default.Fragment, null, popupEditorWrapper && props.wrappedContent && (0, import_react_dom3.createPortal)(props.wrappedContent, popupEditorWrapper.getGui()));
};
var popupEditorComp_default = (0, import_react14.memo)(PopupEditorComp);

// packages/ag-grid-react/src/reactUi/cells/showJsRenderer.tsx
var import_react15 = require("react");
var useJsCellRenderer = (showDetails, showTools, eCellValue, cellValueVersion, jsCellRendererRef, eGui) => {
  const { context } = (0, import_react15.useContext)(BeansContext);
  const destroyCellRenderer = (0, import_react15.useCallback)(() => {
    const comp = jsCellRendererRef.current;
    if (!comp) {
      return;
    }
    const compGui = comp.getGui();
    if (compGui && compGui.parentElement) {
      compGui.parentElement.removeChild(compGui);
    }
    context.destroyBean(comp);
    jsCellRendererRef.current = void 0;
  }, []);
  (0, import_react15.useEffect)(() => {
    const showValue = showDetails != null;
    const jsCompDetails = showDetails && showDetails.compDetails && !showDetails.compDetails.componentFromFramework;
    const waitingForToolsSetup = showTools && eCellValue == null;
    const showComp = showValue && jsCompDetails && !waitingForToolsSetup;
    if (!showComp) {
      destroyCellRenderer();
      return;
    }
    const compDetails = showDetails.compDetails;
    if (jsCellRendererRef.current) {
      const comp2 = jsCellRendererRef.current;
      const attemptRefresh = comp2.refresh != null && showDetails.force == false;
      const refreshResult = attemptRefresh ? comp2.refresh(compDetails.params) : false;
      const refreshWorked = refreshResult === true || refreshResult === void 0;
      if (refreshWorked) {
        return;
      }
      destroyCellRenderer();
    }
    const promise = compDetails.newAgStackInstance();
    ;
    if (!promise) {
      return;
    }
    const comp = promise.resolveNow(null, (x) => x);
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
  }, [showDetails, showTools, cellValueVersion]);
  (0, import_react15.useEffect)(() => {
    return destroyCellRenderer;
  }, []);
};
var showJsRenderer_default = useJsCellRenderer;

// packages/ag-grid-react/src/shared/customComp/cellEditorComponentProxy.ts
var import_ag_grid_community12 = require("ag-grid-community");
var CellEditorComponentProxy = class {
  constructor(cellEditorParams, refreshProps) {
    this.cellEditorParams = cellEditorParams;
    this.refreshProps = refreshProps;
    this.instanceCreated = new import_ag_grid_community12.AgPromise((resolve) => {
      this.resolveInstanceCreated = resolve;
    });
    this.onValueChange = (value) => this.updateValue(value);
    this.value = cellEditorParams.value;
  }
  getProps() {
    return __spreadProps(__spreadValues({}, this.cellEditorParams), {
      initialValue: this.cellEditorParams.value,
      value: this.value,
      onValueChange: this.onValueChange
    });
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
    var _a;
    this.componentInstance = componentInstance;
    (_a = this.resolveInstanceCreated) == null ? void 0 : _a.call(this);
    this.resolveInstanceCreated = void 0;
  }
  getOptionalMethods() {
    return ["isPopup", "isCancelBeforeStart", "isCancelAfterEnd", "getPopupPosition", "focusIn", "focusOut", "afterGuiAttached"];
  }
  updateValue(value) {
    this.value = value;
    this.refreshProps();
  }
};

// packages/ag-grid-react/src/reactUi/cells/cellComp.tsx
var checkCellEditorDeprecations = (popup, cellEditor, cellCtrl) => {
  const col = cellCtrl.getColumn();
  if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
    const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using React, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid React cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as React needs to know this information BEFORE the component is created.`;
    import_ag_grid_community13._.doOnce(() => console.warn(msg), "jsEditorComp-isPopup-" + cellCtrl.getColumn().getColId());
  }
  if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition() != null) {
    const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using React, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid React cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as React needs to know this information BEFORE the component is created.`;
    import_ag_grid_community13._.doOnce(() => console.warn(msg), "jsEditorComp-getPopupPosition-" + cellCtrl.getColumn().getColId());
  }
};
var jsxEditorProxy = (editDetails, CellEditorClass, setRef2) => {
  const { compProxy } = editDetails;
  setRef2(compProxy);
  const props = compProxy.getProps();
  const isStateless = isComponentStateless(CellEditorClass);
  return /* @__PURE__ */ import_react16.default.createElement(CustomContext.Provider, { value: {
    setMethods: (methods) => compProxy.setMethods(methods)
  } }, isStateless && /* @__PURE__ */ import_react16.default.createElement(CellEditorClass, __spreadValues({}, props)), !isStateless && /* @__PURE__ */ import_react16.default.createElement(CellEditorClass, __spreadProps(__spreadValues({}, props), { ref: (ref) => compProxy.setRef(ref) })));
};
var jsxEditor = (editDetails, CellEditorClass, setRef2) => {
  const newFormat = editDetails.compProxy;
  return /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, !newFormat && /* @__PURE__ */ import_react16.default.createElement(CellEditorClass, __spreadProps(__spreadValues({}, editDetails.compDetails.params), { ref: setRef2 })), newFormat && jsxEditorProxy(editDetails, CellEditorClass, setRef2));
};
var jsxEditValue = (editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui, cellCtrl, jsEditorComp) => {
  const compDetails = editDetails.compDetails;
  const CellEditorClass = compDetails.componentClass;
  const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
  const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
  const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;
  return /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, reactInlineEditor && jsxEditor(editDetails, CellEditorClass, setInlineCellEditorRef), reactPopupEditor && /* @__PURE__ */ import_react16.default.createElement(
    popupEditorComp_default,
    {
      editDetails,
      cellCtrl,
      eParentCell: eGui,
      wrappedContent: jsxEditor(editDetails, CellEditorClass, setPopupCellEditorRef)
    }
  ), jsPopupEditor && jsEditorComp && /* @__PURE__ */ import_react16.default.createElement(
    popupEditorComp_default,
    {
      editDetails,
      cellCtrl,
      eParentCell: eGui,
      jsChildComp: jsEditorComp
    }
  ));
};
var jsxShowValue = (showDetails, key, parentId, cellRendererRef, showCellWrapper, reactCellRendererStateless, setECellValue) => {
  const { compDetails, value } = showDetails;
  const noCellRenderer = !compDetails;
  const reactCellRenderer = compDetails && compDetails.componentFromFramework;
  const CellRendererClass = compDetails && compDetails.componentClass;
  const valueForNoCellRenderer = (value == null ? void 0 : value.toString) ? value.toString() : value;
  const bodyJsxFunc = () => /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, noCellRenderer && /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, valueForNoCellRenderer), reactCellRenderer && !reactCellRendererStateless && /* @__PURE__ */ import_react16.default.createElement(CellRendererClass, __spreadProps(__spreadValues({}, compDetails.params), { key, ref: cellRendererRef })), reactCellRenderer && reactCellRendererStateless && /* @__PURE__ */ import_react16.default.createElement(CellRendererClass, __spreadProps(__spreadValues({}, compDetails.params), { key })));
  return /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, showCellWrapper ? /* @__PURE__ */ import_react16.default.createElement("span", { role: "presentation", id: `cell-${parentId}`, className: "ag-cell-value", ref: setECellValue }, bodyJsxFunc()) : bodyJsxFunc());
};
var CellComp = (props) => {
  const { context } = (0, import_react16.useContext)(BeansContext);
  const { cellCtrl, printLayout, editingRow } = props;
  const tabIndex = cellCtrl.getTabIndex();
  const colId = cellCtrl.getColumnIdSanitised();
  const cellInstanceId = cellCtrl.getInstanceId();
  const [renderDetails, setRenderDetails] = (0, import_react16.useState)(() => cellCtrl.isCellRenderer() ? void 0 : { compDetails: void 0, value: cellCtrl.getValueToDisplay(), force: false });
  const [editDetails, setEditDetails] = (0, import_react16.useState)();
  const [renderKey, setRenderKey] = (0, import_react16.useState)(1);
  const [userStyles, setUserStyles] = (0, import_react16.useState)();
  const [includeSelection, setIncludeSelection] = (0, import_react16.useState)(false);
  const [includeRowDrag, setIncludeRowDrag] = (0, import_react16.useState)(false);
  const [includeDndSource, setIncludeDndSource] = (0, import_react16.useState)(false);
  const [jsEditorComp, setJsEditorComp] = (0, import_react16.useState)();
  const forceWrapper = (0, import_react16.useMemo)(() => cellCtrl.isForceWrapper(), [cellCtrl]);
  const cellAriaRole = (0, import_react16.useMemo)(() => cellCtrl.getCellAriaRole(), [cellCtrl]);
  const eGui = (0, import_react16.useRef)(null);
  const cellRendererRef = (0, import_react16.useRef)(null);
  const jsCellRendererRef = (0, import_react16.useRef)();
  const cellEditorRef = (0, import_react16.useRef)();
  const eCellWrapper = (0, import_react16.useRef)();
  const cellWrapperDestroyFuncs = (0, import_react16.useRef)([]);
  const eCellValue = (0, import_react16.useRef)();
  const [cellValueVersion, setCellValueVersion] = (0, import_react16.useState)(0);
  const setCellValueRef = (0, import_react16.useCallback)((ref) => {
    eCellValue.current = ref;
    setCellValueVersion((v) => v + 1);
  }, []);
  const showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag);
  const showCellWrapper = forceWrapper || showTools;
  const setCellEditorRef = (0, import_react16.useCallback)((popup, cellEditor) => {
    cellEditorRef.current = cellEditor;
    if (cellEditor) {
      checkCellEditorDeprecations(popup, cellEditor, cellCtrl);
      const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
      if (editingCancelledByUserComp) {
        setTimeout(() => {
          cellCtrl.stopEditing(true);
          cellCtrl.focusCell(true);
        });
      }
    }
  }, [cellCtrl]);
  const setPopupCellEditorRef = (0, import_react16.useCallback)(
    (cellRenderer) => setCellEditorRef(true, cellRenderer),
    [setCellEditorRef]
  );
  const setInlineCellEditorRef = (0, import_react16.useCallback)(
    (cellRenderer) => setCellEditorRef(false, cellRenderer),
    [setCellEditorRef]
  );
  let cssClassManager = (0, import_react16.useRef)();
  if (!cssClassManager.current) {
    cssClassManager.current = new import_ag_grid_community13.CssClassManager(() => eGui.current);
  }
  showJsRenderer_default(renderDetails, showCellWrapper, eCellValue.current, cellValueVersion, jsCellRendererRef, eGui);
  const lastRenderDetails = (0, import_react16.useRef)();
  (0, import_react16.useLayoutEffect)(() => {
    const oldDetails = lastRenderDetails.current;
    const newDetails = renderDetails;
    lastRenderDetails.current = renderDetails;
    if (oldDetails == null || oldDetails.compDetails == null || newDetails == null || newDetails.compDetails == null) {
      return;
    }
    const oldCompDetails = oldDetails.compDetails;
    const newCompDetails = newDetails.compDetails;
    if (oldCompDetails.componentClass != newCompDetails.componentClass) {
      return;
    }
    if (cellRendererRef.current == null || cellRendererRef.current.refresh == null) {
      return;
    }
    const result = cellRendererRef.current.refresh(newCompDetails.params);
    if (result != true) {
      setRenderKey((prev) => prev + 1);
    }
  }, [renderDetails]);
  (0, import_react16.useLayoutEffect)(() => {
    const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
    if (!doingJsEditor) {
      return;
    }
    const compDetails = editDetails.compDetails;
    const isPopup = editDetails.popup === true;
    const cellEditor = createSyncJsComp(compDetails);
    if (!cellEditor) {
      return;
    }
    const compGui = cellEditor.getGui();
    setCellEditorRef(isPopup, cellEditor);
    if (!isPopup) {
      const parentEl = (forceWrapper ? eCellWrapper : eGui).current;
      parentEl == null ? void 0 : parentEl.appendChild(compGui);
      cellEditor.afterGuiAttached && cellEditor.afterGuiAttached();
    }
    setJsEditorComp(cellEditor);
    return () => {
      context.destroyBean(cellEditor);
      setCellEditorRef(isPopup, void 0);
      setJsEditorComp(void 0);
      if (compGui && compGui.parentElement) {
        compGui.parentElement.removeChild(compGui);
      }
    };
  }, [editDetails]);
  const setCellWrapperRef = (0, import_react16.useCallback)((ref) => {
    eCellWrapper.current = ref;
    if (!eCellWrapper.current) {
      cellWrapperDestroyFuncs.current.forEach((f) => f());
      cellWrapperDestroyFuncs.current = [];
      return;
    }
    const addComp = (comp) => {
      var _a;
      if (comp) {
        const eGui2 = comp.getGui();
        (_a = eCellWrapper.current) == null ? void 0 : _a.insertAdjacentElement("afterbegin", eGui2);
        cellWrapperDestroyFuncs.current.push(() => {
          context.destroyBean(comp);
          import_ag_grid_community13._.removeFromParent(eGui2);
        });
      }
      return comp;
    };
    if (includeSelection) {
      const checkboxSelectionComp = cellCtrl.createSelectionCheckbox();
      addComp(checkboxSelectionComp);
    }
    if (includeDndSource) {
      addComp(cellCtrl.createDndSource());
    }
    if (includeRowDrag) {
      addComp(cellCtrl.createRowDragComp());
    }
  }, [cellCtrl, context, includeDndSource, includeRowDrag, includeSelection]);
  const setRef2 = (0, import_react16.useCallback)((ref) => {
    eGui.current = ref;
    if (!eGui.current) {
      return;
    }
    if (!cellCtrl) {
      return;
    }
    const compProxy = {
      addOrRemoveCssClass: (name, on) => cssClassManager.current.addOrRemoveCssClass(name, on),
      setUserStyles: (styles) => setUserStyles(styles),
      getFocusableElement: () => eGui.current,
      setIncludeSelection: (include) => setIncludeSelection(include),
      setIncludeRowDrag: (include) => setIncludeRowDrag(include),
      setIncludeDndSource: (include) => setIncludeDndSource(include),
      getCellEditor: () => cellEditorRef.current || null,
      getCellRenderer: () => cellRendererRef.current ? cellRendererRef.current : jsCellRendererRef.current,
      getParentOfValue: () => eCellValue.current ? eCellValue.current : eCellWrapper.current ? eCellWrapper.current : eGui.current,
      setRenderDetails: (compDetails, value, force) => {
        setRenderDetails((prev) => {
          if ((prev == null ? void 0 : prev.compDetails) !== compDetails || (prev == null ? void 0 : prev.value) !== value || (prev == null ? void 0 : prev.force) !== force) {
            return {
              value,
              compDetails,
              force
            };
          } else {
            return prev;
          }
        });
      },
      setEditDetails: (compDetails, popup, popupPosition, reactiveCustomComponents) => {
        if (compDetails) {
          let compProxy2 = void 0;
          if (reactiveCustomComponents) {
            compProxy2 = new CellEditorComponentProxy(compDetails.params, () => setRenderKey((prev) => prev + 1));
          } else if (compDetails.componentFromFramework) {
            warnReactiveCustomComponents();
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
          setEditDetails((editDetails2) => {
            if (editDetails2 == null ? void 0 : editDetails2.compProxy) {
              cellEditorRef.current = void 0;
            }
            return void 0;
          });
        }
      }
    };
    const cellWrapperOrUndefined = eCellWrapper.current || void 0;
    cellCtrl.setComp(compProxy, eGui.current, cellWrapperOrUndefined, printLayout, editingRow);
  }, []);
  const reactCellRendererStateless = (0, import_react16.useMemo)(() => {
    const res = renderDetails && renderDetails.compDetails && renderDetails.compDetails.componentFromFramework && isComponentStateless(renderDetails.compDetails.componentClass);
    return !!res;
  }, [renderDetails]);
  (0, import_react16.useLayoutEffect)(() => {
    var _a;
    if (!eGui.current) {
      return;
    }
    cssClassManager.current.addOrRemoveCssClass("ag-cell-value", !showCellWrapper);
    cssClassManager.current.addOrRemoveCssClass("ag-cell-inline-editing", !!editDetails && !editDetails.popup);
    cssClassManager.current.addOrRemoveCssClass("ag-cell-popup-editing", !!editDetails && !!editDetails.popup);
    cssClassManager.current.addOrRemoveCssClass("ag-cell-not-inline-editing", !editDetails || !!editDetails.popup);
    (_a = cellCtrl.getRowCtrl()) == null ? void 0 : _a.setInlineEditingCss(!!editDetails);
    if (cellCtrl.shouldRestoreFocus() && !cellCtrl.isEditing()) {
      eGui.current.focus({ preventScroll: true });
    }
  });
  const showContents = () => /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, renderDetails != null && jsxShowValue(
    renderDetails,
    renderKey,
    cellInstanceId,
    cellRendererRef,
    showCellWrapper,
    reactCellRendererStateless,
    setCellValueRef
  ), editDetails != null && jsxEditValue(
    editDetails,
    setInlineCellEditorRef,
    setPopupCellEditorRef,
    eGui.current,
    cellCtrl,
    jsEditorComp
  ));
  return /* @__PURE__ */ import_react16.default.createElement(
    "div",
    {
      ref: setRef2,
      style: userStyles,
      tabIndex,
      role: cellAriaRole,
      "col-id": colId
    },
    showCellWrapper ? /* @__PURE__ */ import_react16.default.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: setCellWrapperRef }, showContents()) : showContents()
  );
};
var cellComp_default = (0, import_react16.memo)(CellComp);

// packages/ag-grid-react/src/reactUi/rows/rowComp.tsx
var RowComp = (params) => {
  const { context, gridOptionsService } = (0, import_react17.useContext)(BeansContext);
  const { rowCtrl, containerType } = params;
  const tabIndex = rowCtrl.getTabIndex();
  const domOrderRef = (0, import_react17.useRef)(rowCtrl.getDomOrder());
  const isFullWidth = rowCtrl.isFullWidth();
  const isDisplayed = rowCtrl.getRowNode().displayed;
  const [rowIndex, setRowIndex] = (0, import_react17.useState)(() => isDisplayed ? rowCtrl.getRowIndex() : null);
  const [rowId, setRowId] = (0, import_react17.useState)(() => rowCtrl.getRowId());
  const [rowBusinessKey, setRowBusinessKey] = (0, import_react17.useState)(() => rowCtrl.getBusinessKey());
  const [userStyles, setUserStyles] = (0, import_react17.useState)(() => rowCtrl.getRowStyles());
  const [cellCtrls, setCellCtrls] = (0, import_react17.useState)(() => null);
  const [fullWidthCompDetails, setFullWidthCompDetails] = (0, import_react17.useState)();
  const [top, setTop] = (0, import_react17.useState)(() => isDisplayed ? rowCtrl.getInitialRowTop(containerType) : void 0);
  const [transform, setTransform] = (0, import_react17.useState)(() => isDisplayed ? rowCtrl.getInitialTransform(containerType) : void 0);
  const eGui = (0, import_react17.useRef)(null);
  const fullWidthCompRef = (0, import_react17.useRef)();
  const autoHeightSetup = (0, import_react17.useRef)(false);
  const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = (0, import_react17.useState)(0);
  (0, import_react17.useEffect)(() => {
    var _a;
    if (autoHeightSetup.current) {
      return;
    }
    if (!fullWidthCompDetails) {
      return;
    }
    if (autoHeightSetupAttempt > 10) {
      return;
    }
    const eChild = (_a = eGui.current) == null ? void 0 : _a.firstChild;
    if (eChild) {
      rowCtrl.setupDetailRowAutoHeight(eChild);
      autoHeightSetup.current = true;
    } else {
      setAutoHeightSetupAttempt((prev) => prev + 1);
    }
  }, [fullWidthCompDetails, autoHeightSetupAttempt]);
  let cssClassManager = (0, import_react17.useRef)();
  if (!cssClassManager.current) {
    cssClassManager.current = new import_ag_grid_community14.CssClassManager(() => eGui.current);
  }
  const setRef2 = (0, import_react17.useCallback)((e) => {
    eGui.current = e;
    if (!eGui.current) {
      rowCtrl.unsetComp(containerType);
      return;
    }
    if (!rowCtrl.isAlive()) {
      return;
    }
    const compProxy = {
      // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
      // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
      setTop,
      setTransform,
      // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
      // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
      addOrRemoveCssClass: (name, on) => cssClassManager.current.addOrRemoveCssClass(name, on),
      setDomOrder: (domOrder) => domOrderRef.current = domOrder,
      setRowIndex,
      setRowId,
      setRowBusinessKey,
      setUserStyles,
      // if we don't maintain the order, then cols will be ripped out and into the dom
      // when cols reordered, which would stop the CSS transitions from working
      setCellCtrls: (next, useFlushSync) => {
        agFlushSync(useFlushSync, () => {
          setCellCtrls((prev) => getNextValueIfDifferent(prev, next, domOrderRef.current));
        });
      },
      showFullWidth: (compDetails) => setFullWidthCompDetails(compDetails),
      getFullWidthCellRenderer: () => fullWidthCompRef.current,
      refreshFullWidth: (getUpdatedParams) => {
        if (canRefreshFullWidthRef.current) {
          setFullWidthCompDetails((prevFullWidthCompDetails) => __spreadProps(__spreadValues({}, prevFullWidthCompDetails), {
            params: getUpdatedParams()
          }));
          return true;
        } else {
          if (!fullWidthCompRef.current || !fullWidthCompRef.current.refresh) {
            return false;
          }
          return fullWidthCompRef.current.refresh(getUpdatedParams());
        }
      }
    };
    rowCtrl.setComp(compProxy, eGui.current, containerType);
  }, []);
  (0, import_react17.useLayoutEffect)(() => showJsComp(fullWidthCompDetails, context, eGui.current, fullWidthCompRef), [fullWidthCompDetails]);
  const rowStyles = (0, import_react17.useMemo)(() => {
    const res = { top, transform };
    Object.assign(res, userStyles);
    return res;
  }, [top, transform, userStyles]);
  const showFullWidthFramework = isFullWidth && fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
  const showCells = !isFullWidth && cellCtrls != null;
  const reactFullWidthCellRendererStateless = (0, import_react17.useMemo)(() => {
    const res = (fullWidthCompDetails == null ? void 0 : fullWidthCompDetails.componentFromFramework) && isComponentStateless(fullWidthCompDetails.componentClass);
    return !!res;
  }, [fullWidthCompDetails]);
  const canRefreshFullWidthRef = (0, import_react17.useRef)(false);
  (0, import_react17.useEffect)(() => {
    canRefreshFullWidthRef.current = reactFullWidthCellRendererStateless && !!fullWidthCompDetails && !!gridOptionsService.get("reactiveCustomComponents");
  }, [reactFullWidthCellRendererStateless, fullWidthCompDetails]);
  const showCellsJsx = () => cellCtrls == null ? void 0 : cellCtrls.map((cellCtrl) => /* @__PURE__ */ import_react17.default.createElement(
    cellComp_default,
    {
      cellCtrl,
      editingRow: rowCtrl.isEditing(),
      printLayout: rowCtrl.isPrintLayout(),
      key: cellCtrl.getInstanceId()
    }
  ));
  const showFullWidthFrameworkJsx = () => {
    const FullWidthComp = fullWidthCompDetails.componentClass;
    return /* @__PURE__ */ import_react17.default.createElement(import_react17.default.Fragment, null, reactFullWidthCellRendererStateless && /* @__PURE__ */ import_react17.default.createElement(FullWidthComp, __spreadValues({}, fullWidthCompDetails.params)), !reactFullWidthCellRendererStateless && /* @__PURE__ */ import_react17.default.createElement(FullWidthComp, __spreadProps(__spreadValues({}, fullWidthCompDetails.params), { ref: fullWidthCompRef })));
  };
  return /* @__PURE__ */ import_react17.default.createElement(
    "div",
    {
      ref: setRef2,
      role: "row",
      style: rowStyles,
      "row-index": rowIndex,
      "row-id": rowId,
      "row-business-key": rowBusinessKey,
      tabIndex
    },
    showCells && showCellsJsx(),
    showFullWidthFramework && showFullWidthFrameworkJsx()
  );
};
var rowComp_default = (0, import_react17.memo)(RowComp);

// packages/ag-grid-react/src/reactUi/rows/rowContainerComp.tsx
var RowContainerComp = (params) => {
  const { context } = (0, import_react18.useContext)(BeansContext);
  const { name } = params;
  const containerType = (0, import_react18.useMemo)(() => (0, import_ag_grid_community15.getRowContainerTypeForName)(name), [name]);
  const eViewport = (0, import_react18.useRef)(null);
  const eContainer = (0, import_react18.useRef)(null);
  const rowCtrlsRef = (0, import_react18.useRef)([]);
  const [rowCtrlsOrdered, setRowCtrlsOrdered] = (0, import_react18.useState)(() => []);
  const domOrderRef = (0, import_react18.useRef)(false);
  const rowContainerCtrlRef = (0, import_react18.useRef)();
  const cssClasses = (0, import_react18.useMemo)(() => import_ag_grid_community15.RowContainerCtrl.getRowContainerCssClasses(name), [name]);
  const viewportClasses = (0, import_react18.useMemo)(() => classesList(cssClasses.viewport), [cssClasses]);
  const containerClasses = (0, import_react18.useMemo)(() => classesList(cssClasses.container), [cssClasses]);
  const centerTemplate = name === import_ag_grid_community15.RowContainerName.CENTER || name === import_ag_grid_community15.RowContainerName.TOP_CENTER || name === import_ag_grid_community15.RowContainerName.BOTTOM_CENTER || name === import_ag_grid_community15.RowContainerName.STICKY_TOP_CENTER;
  const topLevelRef = centerTemplate ? eViewport : eContainer;
  reactComment_default(" AG Row Container " + name + " ", topLevelRef);
  const areElementsReady = (0, import_react18.useCallback)(() => {
    if (centerTemplate) {
      return eViewport.current != null && eContainer.current != null;
    }
    return eContainer.current != null;
  }, []);
  const areElementsRemoved = (0, import_react18.useCallback)(() => {
    if (centerTemplate) {
      return eViewport.current == null && eContainer.current == null;
    }
    return eContainer.current == null;
  }, []);
  const setRef2 = (0, import_react18.useCallback)(() => {
    if (areElementsRemoved()) {
      context.destroyBean(rowContainerCtrlRef.current);
      rowContainerCtrlRef.current = null;
    }
    if (areElementsReady()) {
      const updateRowCtrlsOrdered = (useFlushSync) => {
        agFlushSync(useFlushSync, () => {
          setRowCtrlsOrdered((prev) => getNextValueIfDifferent(prev, rowCtrlsRef.current, domOrderRef.current));
        });
      };
      const compProxy = {
        setViewportHeight: (height) => {
          if (eViewport.current) {
            eViewport.current.style.height = height;
          }
        },
        setRowCtrls: ({ rowCtrls, useFlushSync }) => {
          const useFlush = !!useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
          rowCtrlsRef.current = rowCtrls;
          updateRowCtrlsOrdered(useFlush);
        },
        setDomOrder: (domOrder) => {
          if (domOrderRef.current != domOrder) {
            domOrderRef.current = domOrder;
            updateRowCtrlsOrdered(false);
          }
        },
        setContainerWidth: (width) => {
          if (eContainer.current) {
            eContainer.current.style.width = width;
          }
        }
      };
      rowContainerCtrlRef.current = context.createBean(new import_ag_grid_community15.RowContainerCtrl(name));
      rowContainerCtrlRef.current.setComp(compProxy, eContainer.current, eViewport.current);
    }
  }, [areElementsReady, areElementsRemoved]);
  const setContainerRef = (0, import_react18.useCallback)((e) => {
    eContainer.current = e;
    setRef2();
  }, [setRef2]);
  const setViewportRef = (0, import_react18.useCallback)((e) => {
    eViewport.current = e;
    setRef2();
  }, [setRef2]);
  const buildContainer = () => /* @__PURE__ */ import_react18.default.createElement(
    "div",
    {
      className: containerClasses,
      ref: setContainerRef,
      role: "rowgroup"
    },
    rowCtrlsOrdered.map(
      (rowCtrl) => /* @__PURE__ */ import_react18.default.createElement(rowComp_default, { rowCtrl, containerType, key: rowCtrl.getInstanceId() })
    )
  );
  return /* @__PURE__ */ import_react18.default.createElement(import_react18.default.Fragment, null, centerTemplate ? /* @__PURE__ */ import_react18.default.createElement("div", { className: viewportClasses, ref: setViewportRef, role: "presentation" }, buildContainer()) : buildContainer());
};
var rowContainerComp_default = (0, import_react18.memo)(RowContainerComp);

// packages/ag-grid-react/src/reactUi/gridBodyComp.tsx
var GridBodyComp = () => {
  const { context, agStackComponentsRegistry, resizeObserverService } = (0, import_react19.useContext)(BeansContext);
  const [rowAnimationClass, setRowAnimationClass] = (0, import_react19.useState)("");
  const [topHeight, setTopHeight] = (0, import_react19.useState)(0);
  const [bottomHeight, setBottomHeight] = (0, import_react19.useState)(0);
  const [stickyTopHeight, setStickyTopHeight] = (0, import_react19.useState)("0px");
  const [stickyTopTop, setStickyTopTop] = (0, import_react19.useState)("0px");
  const [stickyTopWidth, setStickyTopWidth] = (0, import_react19.useState)("100%");
  const [topDisplay, setTopDisplay] = (0, import_react19.useState)("");
  const [bottomDisplay, setBottomDisplay] = (0, import_react19.useState)("");
  const [forceVerticalScrollClass, setForceVerticalScrollClass] = (0, import_react19.useState)(null);
  const [topAndBottomOverflowY, setTopAndBottomOverflowY] = (0, import_react19.useState)("");
  const [cellSelectableCss, setCellSelectableCss] = (0, import_react19.useState)(null);
  const [layoutClass, setLayoutClass] = (0, import_react19.useState)("ag-layout-normal");
  let cssClassManager = (0, import_react19.useRef)();
  if (!cssClassManager.current) {
    cssClassManager.current = new import_ag_grid_community16.CssClassManager(() => eRoot.current);
  }
  const eRoot = (0, import_react19.useRef)(null);
  const eTop = (0, import_react19.useRef)(null);
  const eStickyTop = (0, import_react19.useRef)(null);
  const eBody = (0, import_react19.useRef)(null);
  const eBodyViewport = (0, import_react19.useRef)(null);
  const eBottom = (0, import_react19.useRef)(null);
  const beansToDestroy = (0, import_react19.useRef)([]);
  const destroyFuncs = (0, import_react19.useRef)([]);
  reactComment_default(" AG Grid Body ", eRoot);
  reactComment_default(" AG Pinned Top ", eTop);
  reactComment_default(" AG Sticky Top ", eStickyTop);
  reactComment_default(" AG Middle ", eBodyViewport);
  reactComment_default(" AG Pinned Bottom ", eBottom);
  const setRef2 = (0, import_react19.useCallback)((e) => {
    eRoot.current = e;
    if (!eRoot.current) {
      context.destroyBeans(beansToDestroy.current);
      destroyFuncs.current.forEach((f) => f());
      beansToDestroy.current = [];
      destroyFuncs.current = [];
      return;
    }
    if (!context) {
      return;
    }
    const newComp = (tag) => {
      const CompClass = agStackComponentsRegistry.getComponentClass(tag);
      const comp = context.createBean(new CompClass());
      beansToDestroy.current.push(comp);
      return comp;
    };
    const attachToDom = (eParent, eChild) => {
      eParent.appendChild(eChild);
      destroyFuncs.current.push(() => eParent.removeChild(eChild));
    };
    attachToDom(eRoot.current, document.createComment(" AG Fake Horizontal Scroll "));
    attachToDom(eRoot.current, newComp("AG-FAKE-HORIZONTAL-SCROLL").getGui());
    attachToDom(eRoot.current, document.createComment(" AG Overlay Wrapper "));
    attachToDom(eRoot.current, newComp("AG-OVERLAY-WRAPPER").getGui());
    if (eBody.current) {
      attachToDom(eBody.current, document.createComment(" AG Fake Vertical Scroll "));
      attachToDom(eBody.current, newComp("AG-FAKE-VERTICAL-SCROLL").getGui());
    }
    const compProxy = {
      setRowAnimationCssOnBodyViewport: setRowAnimationClass,
      setColumnCount: (count) => {
        if (eRoot.current) {
          import_ag_grid_community16._.setAriaColCount(eRoot.current, count);
        }
      },
      setRowCount: (count) => {
        if (eRoot.current) {
          import_ag_grid_community16._.setAriaRowCount(eRoot.current, count);
        }
      },
      setTopHeight,
      setBottomHeight,
      setStickyTopHeight,
      setStickyTopTop,
      setStickyTopWidth,
      setTopDisplay,
      setBottomDisplay,
      setColumnMovingCss: (cssClass, flag) => cssClassManager.current.addOrRemoveCssClass(cssClass, flag),
      updateLayoutClasses: setLayoutClass,
      setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
      setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
      setCellSelectableCss: (cssClass, flag) => setCellSelectableCss(flag ? cssClass : null),
      setBodyViewportWidth: (width) => {
        if (eBodyViewport.current) {
          eBodyViewport.current.style.width = width;
        }
      },
      registerBodyViewportResizeListener: (listener) => {
        if (eBodyViewport.current) {
          const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport.current, listener);
          destroyFuncs.current.push(() => unsubscribeFromResize());
        }
      }
    };
    const ctrl = context.createBean(new import_ag_grid_community16.GridBodyCtrl());
    beansToDestroy.current.push(ctrl);
    ctrl.setComp(
      compProxy,
      eRoot.current,
      eBodyViewport.current,
      eTop.current,
      eBottom.current,
      eStickyTop.current
    );
  }, []);
  const rootClasses = (0, import_react19.useMemo)(
    () => classesList("ag-root", "ag-unselectable", layoutClass),
    [layoutClass]
  );
  const bodyViewportClasses = (0, import_react19.useMemo)(
    () => classesList("ag-body-viewport", rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss),
    [rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss]
  );
  const bodyClasses = (0, import_react19.useMemo)(
    () => classesList("ag-body", layoutClass),
    [layoutClass]
  );
  const topClasses = (0, import_react19.useMemo)(
    () => classesList("ag-floating-top", cellSelectableCss),
    [cellSelectableCss]
  );
  const stickyTopClasses = (0, import_react19.useMemo)(
    () => classesList("ag-sticky-top", cellSelectableCss),
    [cellSelectableCss]
  );
  const bottomClasses = (0, import_react19.useMemo)(
    () => classesList("ag-floating-bottom", cellSelectableCss),
    [cellSelectableCss]
  );
  const topStyle = (0, import_react19.useMemo)(() => ({
    height: topHeight,
    minHeight: topHeight,
    display: topDisplay,
    overflowY: topAndBottomOverflowY
  }), [topHeight, topDisplay, topAndBottomOverflowY]);
  const stickyTopStyle = (0, import_react19.useMemo)(() => ({
    height: stickyTopHeight,
    top: stickyTopTop,
    width: stickyTopWidth
  }), [stickyTopHeight, stickyTopTop, stickyTopWidth]);
  const bottomStyle = (0, import_react19.useMemo)(() => ({
    height: bottomHeight,
    minHeight: bottomHeight,
    display: bottomDisplay,
    overflowY: topAndBottomOverflowY
  }), [bottomHeight, bottomDisplay, topAndBottomOverflowY]);
  const createRowContainer = (container) => /* @__PURE__ */ import_react19.default.createElement(rowContainerComp_default, { name: container, key: `${container}-container` });
  const createSection = ({
    section,
    children,
    className,
    style
  }) => /* @__PURE__ */ import_react19.default.createElement("div", { ref: section, className, role: "presentation", style }, children.map(createRowContainer));
  return /* @__PURE__ */ import_react19.default.createElement("div", { ref: setRef2, className: rootClasses, role: "treegrid" }, /* @__PURE__ */ import_react19.default.createElement(gridHeaderComp_default, null), createSection({ section: eTop, className: topClasses, style: topStyle, children: [
    import_ag_grid_community16.RowContainerName.TOP_LEFT,
    import_ag_grid_community16.RowContainerName.TOP_CENTER,
    import_ag_grid_community16.RowContainerName.TOP_RIGHT,
    import_ag_grid_community16.RowContainerName.TOP_FULL_WIDTH
  ] }), /* @__PURE__ */ import_react19.default.createElement("div", { className: bodyClasses, ref: eBody, role: "presentation" }, createSection({
    section: eBodyViewport,
    className: bodyViewportClasses,
    children: [
      import_ag_grid_community16.RowContainerName.LEFT,
      import_ag_grid_community16.RowContainerName.CENTER,
      import_ag_grid_community16.RowContainerName.RIGHT,
      import_ag_grid_community16.RowContainerName.FULL_WIDTH
    ]
  })), createSection({ section: eStickyTop, className: stickyTopClasses, style: stickyTopStyle, children: [
    import_ag_grid_community16.RowContainerName.STICKY_TOP_LEFT,
    import_ag_grid_community16.RowContainerName.STICKY_TOP_CENTER,
    import_ag_grid_community16.RowContainerName.STICKY_TOP_RIGHT,
    import_ag_grid_community16.RowContainerName.STICKY_TOP_FULL_WIDTH
  ] }), createSection({ section: eBottom, className: bottomClasses, style: bottomStyle, children: [
    import_ag_grid_community16.RowContainerName.BOTTOM_LEFT,
    import_ag_grid_community16.RowContainerName.BOTTOM_CENTER,
    import_ag_grid_community16.RowContainerName.BOTTOM_RIGHT,
    import_ag_grid_community16.RowContainerName.BOTTOM_FULL_WIDTH
  ] }));
};
var gridBodyComp_default = (0, import_react19.memo)(GridBodyComp);

// packages/ag-grid-react/src/reactUi/tabGuardComp.tsx
var import_react20 = __toESM(require("react"));
var import_ag_grid_community17 = require("ag-grid-community");
var TabGuardCompRef = (props, forwardRef4) => {
  const { children, eFocusableElement, onTabKeyDown, gridCtrl, forceFocusOutWhenTabGuardsAreEmpty } = props;
  const { context } = (0, import_react20.useContext)(BeansContext);
  const topTabGuardRef = (0, import_react20.useRef)(null);
  const bottomTabGuardRef = (0, import_react20.useRef)(null);
  const tabGuardCtrlRef = (0, import_react20.useRef)();
  const setTabIndex = (value) => {
    const processedValue = value == null ? void 0 : parseInt(value, 10).toString();
    [topTabGuardRef, bottomTabGuardRef].forEach((tabGuard) => {
      var _a, _b;
      if (processedValue === void 0) {
        (_a = tabGuard.current) == null ? void 0 : _a.removeAttribute("tabindex");
      } else {
        (_b = tabGuard.current) == null ? void 0 : _b.setAttribute("tabindex", processedValue);
      }
    });
  };
  (0, import_react20.useImperativeHandle)(forwardRef4, () => ({
    forceFocusOutOfContainer(up) {
      var _a;
      (_a = tabGuardCtrlRef.current) == null ? void 0 : _a.forceFocusOutOfContainer(up);
    }
  }));
  const setupCtrl = (0, import_react20.useCallback)(() => {
    if (!topTabGuardRef.current && !bottomTabGuardRef.current) {
      context.destroyBean(tabGuardCtrlRef.current);
      tabGuardCtrlRef.current = null;
      return;
    }
    if (topTabGuardRef.current && bottomTabGuardRef.current) {
      const compProxy = {
        setTabIndex
      };
      tabGuardCtrlRef.current = context.createBean(new import_ag_grid_community17.TabGuardCtrl({
        comp: compProxy,
        eTopGuard: topTabGuardRef.current,
        eBottomGuard: bottomTabGuardRef.current,
        eFocusableElement,
        onTabKeyDown,
        forceFocusOutWhenTabGuardsAreEmpty,
        focusInnerElement: (fromBottom) => gridCtrl.focusInnerElement(fromBottom)
      }));
    }
  }, []);
  const setTopRef = (0, import_react20.useCallback)((e) => {
    topTabGuardRef.current = e;
    setupCtrl();
  }, [setupCtrl]);
  const setBottomRef = (0, import_react20.useCallback)((e) => {
    bottomTabGuardRef.current = e;
    setupCtrl();
  }, [setupCtrl]);
  const createTabGuard = (side) => {
    const className = side === "top" ? import_ag_grid_community17.TabGuardClassNames.TAB_GUARD_TOP : import_ag_grid_community17.TabGuardClassNames.TAB_GUARD_BOTTOM;
    return /* @__PURE__ */ import_react20.default.createElement(
      "div",
      {
        className: `${import_ag_grid_community17.TabGuardClassNames.TAB_GUARD} ${className}`,
        role: "presentation",
        ref: side === "top" ? setTopRef : setBottomRef
      }
    );
  };
  return /* @__PURE__ */ import_react20.default.createElement(import_react20.default.Fragment, null, createTabGuard("top"), children, createTabGuard("bottom"));
};
var TabGuardComp = (0, import_react20.forwardRef)(TabGuardCompRef);
var tabGuardComp_default = (0, import_react20.memo)(TabGuardComp);

// packages/ag-grid-react/src/reactUi/gridComp.tsx
var GridComp = ({ context }) => {
  const [rtlClass, setRtlClass] = (0, import_react21.useState)("");
  const [keyboardFocusClass, setKeyboardFocusClass] = (0, import_react21.useState)("");
  const [layoutClass, setLayoutClass] = (0, import_react21.useState)("");
  const [cursor, setCursor] = (0, import_react21.useState)(null);
  const [userSelect, setUserSelect] = (0, import_react21.useState)(null);
  const [initialised, setInitialised] = (0, import_react21.useState)(false);
  const [tabGuardReady, setTabGuardReady] = (0, import_react21.useState)();
  const gridCtrlRef = (0, import_react21.useRef)(null);
  const eRootWrapperRef = (0, import_react21.useRef)(null);
  const tabGuardRef = (0, import_react21.useRef)();
  const [eGridBodyParent, setGridBodyParent] = (0, import_react21.useState)(null);
  const focusInnerElementRef = (0, import_react21.useRef)(() => void 0);
  const onTabKeyDown = (0, import_react21.useCallback)(() => void 0, []);
  const beans = (0, import_react21.useMemo)(() => {
    if (context.isDestroyed()) {
      return null;
    }
    return context.getBean("beans");
  }, [context]);
  reactComment_default(" AG Grid ", eRootWrapperRef);
  const setRef2 = (0, import_react21.useCallback)((e) => {
    eRootWrapperRef.current = e;
    if (!eRootWrapperRef.current) {
      context.destroyBean(gridCtrlRef.current);
      gridCtrlRef.current = null;
      return;
    }
    if (context.isDestroyed()) {
      return;
    }
    gridCtrlRef.current = context.createBean(new import_ag_grid_community18.GridCtrl());
    const gridCtrl = gridCtrlRef.current;
    focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);
    const compProxy = {
      destroyGridUi: () => {
      },
      // do nothing, as framework users destroy grid by removing the comp
      setRtlClass,
      forceFocusOutOfContainer: (up) => {
        var _a;
        (_a = tabGuardRef.current) == null ? void 0 : _a.forceFocusOutOfContainer(up);
      },
      updateLayoutClasses: setLayoutClass,
      getFocusableContainers: () => {
        var _a, _b;
        const els = [];
        const gridBodyCompEl = (_a = eRootWrapperRef.current) == null ? void 0 : _a.querySelector(".ag-root");
        const sideBarEl = (_b = eRootWrapperRef.current) == null ? void 0 : _b.querySelector(".ag-side-bar:not(.ag-hidden)");
        if (gridBodyCompEl) {
          els.push(gridBodyCompEl);
        }
        if (sideBarEl) {
          els.push(sideBarEl);
        }
        return els;
      },
      setCursor,
      setUserSelect
    };
    gridCtrl.setComp(compProxy, eRootWrapperRef.current, eRootWrapperRef.current);
    setInitialised(true);
  }, []);
  (0, import_react21.useEffect)(() => {
    if (!tabGuardReady || !beans || !gridCtrlRef.current || !eGridBodyParent || !eRootWrapperRef.current) {
      return;
    }
    const gridCtrl = gridCtrlRef.current;
    const beansToDestroy = [];
    const { agStackComponentsRegistry } = beans;
    const HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass("AG-GRID-HEADER-DROP-ZONES");
    const SideBarClass = agStackComponentsRegistry.getComponentClass("AG-SIDE-BAR");
    const StatusBarClass = agStackComponentsRegistry.getComponentClass("AG-STATUS-BAR");
    const WatermarkClass = agStackComponentsRegistry.getComponentClass("AG-WATERMARK");
    const PaginationClass = agStackComponentsRegistry.getComponentClass("AG-PAGINATION");
    const additionalEls = [];
    const eRootWrapper = eRootWrapperRef.current;
    if (gridCtrl.showDropZones() && HeaderDropZonesClass) {
      const headerDropZonesComp = context.createBean(new HeaderDropZonesClass());
      const eGui = headerDropZonesComp.getGui();
      eRootWrapper.insertAdjacentElement("afterbegin", eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(headerDropZonesComp);
    }
    if (gridCtrl.showSideBar() && SideBarClass) {
      const sideBarComp = context.createBean(new SideBarClass());
      const eGui = sideBarComp.getGui();
      const bottomTabGuard = eGridBodyParent.querySelector(".ag-tab-guard-bottom");
      if (bottomTabGuard) {
        bottomTabGuard.insertAdjacentElement("beforebegin", eGui);
        additionalEls.push(eGui);
      }
      beansToDestroy.push(sideBarComp);
    }
    if (gridCtrl.showStatusBar() && StatusBarClass) {
      const statusBarComp = context.createBean(new StatusBarClass());
      const eGui = statusBarComp.getGui();
      eRootWrapper.insertAdjacentElement("beforeend", eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(statusBarComp);
    }
    if (PaginationClass) {
      const paginationComp = context.createBean(new PaginationClass());
      const eGui = paginationComp.getGui();
      eRootWrapper.insertAdjacentElement("beforeend", eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(paginationComp);
    }
    if (gridCtrl.showWatermark() && WatermarkClass) {
      const watermarkComp = context.createBean(new WatermarkClass());
      const eGui = watermarkComp.getGui();
      eRootWrapper.insertAdjacentElement("beforeend", eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(watermarkComp);
    }
    return () => {
      context.destroyBeans(beansToDestroy);
      additionalEls.forEach((el) => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });
    };
  }, [tabGuardReady, eGridBodyParent, beans]);
  const rootWrapperClasses = (0, import_react21.useMemo)(() => classesList("ag-root-wrapper", rtlClass, keyboardFocusClass, layoutClass), [rtlClass, keyboardFocusClass, layoutClass]);
  const rootWrapperBodyClasses = (0, import_react21.useMemo)(() => classesList("ag-root-wrapper-body", "ag-focus-managed", layoutClass), [layoutClass]);
  const topStyle = (0, import_react21.useMemo)(() => ({
    userSelect: userSelect != null ? userSelect : "",
    WebkitUserSelect: userSelect != null ? userSelect : "",
    cursor: cursor != null ? cursor : ""
  }), [userSelect, cursor]);
  const setTabGuardCompRef = (0, import_react21.useCallback)((ref) => {
    tabGuardRef.current = ref;
    setTabGuardReady(ref !== null);
  }, []);
  return /* @__PURE__ */ import_react21.default.createElement("div", { ref: setRef2, className: rootWrapperClasses, style: topStyle, role: "presentation" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: rootWrapperBodyClasses, ref: setGridBodyParent, role: "presentation" }, initialised && eGridBodyParent && beans && /* @__PURE__ */ import_react21.default.createElement(BeansContext.Provider, { value: beans }, /* @__PURE__ */ import_react21.default.createElement(
    tabGuardComp_default,
    {
      ref: setTabGuardCompRef,
      eFocusableElement: eGridBodyParent,
      onTabKeyDown,
      gridCtrl: gridCtrlRef.current,
      forceFocusOutWhenTabGuardsAreEmpty: true
    },
    // we wait for initialised before rending the children, so GridComp has created and registered with it's
    // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
    // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
    // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
    // hangs the UI)
    /* @__PURE__ */ import_react21.default.createElement(gridBodyComp_default, null)
  ))));
};
var gridComp_default = (0, import_react21.memo)(GridComp);

// packages/ag-grid-react/src/reactUi/agGridReactUi.tsx
var AgGridReactUi = (props) => {
  var _a, _b;
  const apiRef = (0, import_react22.useRef)();
  const eGui = (0, import_react22.useRef)(null);
  const portalManager = (0, import_react22.useRef)(null);
  const destroyFuncs = (0, import_react22.useRef)([]);
  const whenReadyFuncs = (0, import_react22.useRef)([]);
  const prevProps = (0, import_react22.useRef)(props);
  const ready = (0, import_react22.useRef)(false);
  const [context, setContext] = (0, import_react22.useState)(void 0);
  const [, setPortalRefresher] = (0, import_react22.useState)(0);
  const setRef2 = (0, import_react22.useCallback)((e) => {
    eGui.current = e;
    if (!eGui.current) {
      destroyFuncs.current.forEach((f) => f());
      destroyFuncs.current.length = 0;
      return;
    }
    const modules = props.modules || [];
    if (!portalManager.current) {
      portalManager.current = new PortalManager(
        () => setPortalRefresher((prev) => prev + 1),
        props.componentWrappingElement,
        props.maxComponentCreationTimeMs
      );
      destroyFuncs.current.push(() => {
        var _a2;
        (_a2 = portalManager.current) == null ? void 0 : _a2.destroy();
        portalManager.current = null;
      });
    }
    const mergedGridOps = import_ag_grid_community19.ComponentUtil.combineAttributesAndGridOptions(props.gridOptions, props);
    const gridParams = {
      providedBeanInstances: {
        frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current, !!mergedGridOps.reactiveCustomComponents)
      },
      modules,
      frameworkOverrides: new ReactFrameworkOverrides()
    };
    const createUiCallback = (context2) => {
      setContext(context2);
      destroyFuncs.current.push(() => {
        context2.destroy();
      });
      const ctrlsService = context2.getBean(import_ag_grid_community19.CtrlsService.NAME);
      ctrlsService.whenReady(() => {
        if (context2.isDestroyed()) {
          return;
        }
        const api = apiRef.current;
        if (api) {
          if (props.setGridApi) {
            props.setGridApi(api, new import_ag_grid_community19.ColumnApi(api));
          }
        }
      });
    };
    const acceptChangesCallback = (context2) => {
      const ctrlsService = context2.getBean(import_ag_grid_community19.CtrlsService.NAME);
      ctrlsService.whenReady(() => {
        whenReadyFuncs.current.forEach((f) => f());
        whenReadyFuncs.current.length = 0;
        ready.current = true;
      });
    };
    const gridCoreCreator = new import_ag_grid_community19.GridCoreCreator();
    apiRef.current = gridCoreCreator.create(
      eGui.current,
      mergedGridOps,
      createUiCallback,
      acceptChangesCallback,
      gridParams
    );
  }, []);
  const style = (0, import_react22.useMemo)(() => {
    return __spreadValues({
      height: "100%"
    }, props.containerStyle || {});
  }, [props.containerStyle]);
  const processWhenReady = (0, import_react22.useCallback)((func) => {
    if (ready.current) {
      func();
    } else {
      whenReadyFuncs.current.push(func);
    }
  }, []);
  (0, import_react22.useEffect)(() => {
    const changes = extractGridPropertyChanges(prevProps.current, props);
    prevProps.current = props;
    processWhenReady(() => {
      if (apiRef.current) {
        import_ag_grid_community19.ComponentUtil.processOnChange(changes, apiRef.current);
      }
    });
  }, [props]);
  return /* @__PURE__ */ import_react22.default.createElement("div", { style, className: props.className, ref: setRef2 }, context && !context.isDestroyed() ? /* @__PURE__ */ import_react22.default.createElement(gridComp_default, { context }) : null, (_b = (_a = portalManager.current) == null ? void 0 : _a.getPortals()) != null ? _b : null);
};
function extractGridPropertyChanges(prevProps, nextProps) {
  const changes = {};
  Object.keys(nextProps).forEach((propKey) => {
    const propValue = nextProps[propKey];
    if (prevProps[propKey] !== propValue) {
      changes[propKey] = propValue;
    }
  });
  return changes;
}
var ReactFrameworkComponentWrapper = class extends import_ag_grid_community19.BaseComponentWrapper {
  constructor(parent, reactiveCustomComponents) {
    super();
    this.parent = parent;
    this.reactiveCustomComponents = reactiveCustomComponents;
  }
  createWrapper(UserReactComponent, componentType) {
    if (this.reactiveCustomComponents) {
      const getComponentClass = (propertyName) => {
        switch (propertyName) {
          case "filter":
            return FilterComponentWrapper;
          case "floatingFilterComponent":
            return FloatingFilterComponentWrapper;
          case "dateComponent":
            return DateComponentWrapper;
          case "loadingOverlayComponent":
            return LoadingOverlayComponentWrapper;
          case "noRowsOverlayComponent":
            return NoRowsOverlayComponentWrapper;
          case "statusPanel":
            return StatusPanelComponentWrapper;
          case "toolPanel":
            return ToolPanelComponentWrapper;
          case "menuItem":
            return MenuItemComponentWrapper;
        }
      };
      const ComponentClass = getComponentClass(componentType.propertyName);
      if (ComponentClass) {
        return new ComponentClass(UserReactComponent, this.parent, componentType);
      }
    } else {
      switch (componentType.propertyName) {
        case "filter":
        case "floatingFilterComponent":
        case "dateComponent":
        case "loadingOverlayComponent":
        case "noRowsOverlayComponent":
        case "statusPanel":
        case "toolPanel":
        case "menuItem":
          warnReactiveCustomComponents();
          break;
      }
    }
    const suppressFallbackMethods = !componentType.cellRenderer && componentType.propertyName !== "toolPanel";
    return new ReactComponent(UserReactComponent, this.parent, componentType, suppressFallbackMethods);
  }
};
var DetailCellRenderer = (0, import_react22.forwardRef)((props, ref) => {
  const { ctrlsFactory, context, gridOptionsService, resizeObserverService, clientSideRowModel, serverSideRowModel } = (0, import_react22.useContext)(BeansContext);
  const [cssClasses, setCssClasses] = (0, import_react22.useState)(() => new CssClasses());
  const [gridCssClasses, setGridCssClasses] = (0, import_react22.useState)(() => new CssClasses());
  const [detailGridOptions, setDetailGridOptions] = (0, import_react22.useState)();
  const [detailRowData, setDetailRowData] = (0, import_react22.useState)();
  const ctrlRef = (0, import_react22.useRef)();
  const eGuiRef = (0, import_react22.useRef)(null);
  const resizeObserverDestroyFunc = (0, import_react22.useRef)();
  const parentModules = (0, import_react22.useMemo)(() => import_ag_grid_community19.ModuleRegistry.__getGridRegisteredModules(props.api.getGridId()), [props]);
  const topClassName = (0, import_react22.useMemo)(() => cssClasses.toString() + " ag-details-row", [cssClasses]);
  const gridClassName = (0, import_react22.useMemo)(() => gridCssClasses.toString() + " ag-details-grid", [gridCssClasses]);
  if (ref) {
    (0, import_react22.useImperativeHandle)(ref, () => ({
      refresh() {
        var _a, _b;
        return (_b = (_a = ctrlRef.current) == null ? void 0 : _a.refresh()) != null ? _b : false;
      }
    }));
  }
  if (props.template) {
    import_ag_grid_community19._.warnOnce("detailCellRendererParams.template is not supported by AG Grid React. To change the template, provide a Custom Detail Cell Renderer. See https://ag-grid.com/react-data-grid/master-detail-custom-detail/");
  }
  const setRef2 = (0, import_react22.useCallback)((e) => {
    eGuiRef.current = e;
    if (!eGuiRef.current) {
      context.destroyBean(ctrlRef.current);
      if (resizeObserverDestroyFunc.current) {
        resizeObserverDestroyFunc.current();
      }
      return;
    }
    const compProxy = {
      addOrRemoveCssClass: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      addOrRemoveDetailGridCssClass: (name, on) => setGridCssClasses((prev) => prev.setClass(name, on)),
      setDetailGrid: (gridOptions) => setDetailGridOptions(gridOptions),
      setRowData: (rowData) => setDetailRowData(rowData),
      getGui: () => eGuiRef.current
    };
    const ctrl = ctrlsFactory.getInstance("detailCellRenderer");
    if (!ctrl) {
      return;
    }
    context.createBean(ctrl);
    ctrl.init(compProxy, props);
    ctrlRef.current = ctrl;
    if (gridOptionsService.get("detailRowAutoHeight")) {
      const checkRowSizeFunc = () => {
        if (eGuiRef.current == null) {
          return;
        }
        const clientHeight = eGuiRef.current.clientHeight;
        if (clientHeight != null && clientHeight > 0) {
          const updateRowHeightFunc = () => {
            props.node.setRowHeight(clientHeight);
            if (clientSideRowModel) {
              clientSideRowModel.onRowHeightChanged();
            } else if (serverSideRowModel) {
              serverSideRowModel.onRowHeightChanged();
            }
          };
          setTimeout(updateRowHeightFunc, 0);
        }
      };
      resizeObserverDestroyFunc.current = resizeObserverService.observeResize(eGuiRef.current, checkRowSizeFunc);
      checkRowSizeFunc();
    }
  }, []);
  const setGridApi = (0, import_react22.useCallback)((api, columnApi) => {
    var _a;
    (_a = ctrlRef.current) == null ? void 0 : _a.registerDetailWithMaster(api, columnApi);
  }, []);
  return /* @__PURE__ */ import_react22.default.createElement("div", { className: topClassName, ref: setRef2 }, detailGridOptions && /* @__PURE__ */ import_react22.default.createElement(AgGridReactUi, __spreadProps(__spreadValues({ className: gridClassName }, detailGridOptions), { modules: parentModules, rowData: detailRowData, setGridApi })));
});
var ReactFrameworkOverrides = class extends import_ag_grid_community19.VanillaFrameworkOverrides {
  constructor() {
    super("react");
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
    this.renderingEngine = "react";
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
};

// packages/ag-grid-react/src/agGridReact.tsx
var AgGridReact = class extends import_react23.Component {
  constructor() {
    super(...arguments);
    this.apiListeners = [];
    this.setGridApi = (api, columnApi) => {
      this.api = api;
      this.columnApi = columnApi;
      this.apiListeners.forEach((listener) => listener(api));
    };
  }
  registerApiListener(listener) {
    this.apiListeners.push(listener);
  }
  componentWillUnmount() {
    this.apiListeners.length = 0;
  }
  render() {
    return /* @__PURE__ */ import_react23.default.createElement(AgGridReactUi, __spreadProps(__spreadValues({}, this.props), { setGridApi: this.setGridApi }));
  }
};

// packages/ag-grid-react/src/shared/interfaces.ts
var ChangeDetectionStrategyType = /* @__PURE__ */ ((ChangeDetectionStrategyType2) => {
  ChangeDetectionStrategyType2["IdentityCheck"] = "IdentityCheck";
  ChangeDetectionStrategyType2["DeepValueCheck"] = "DeepValueCheck";
  ChangeDetectionStrategyType2["NoCheck"] = "NoCheck";
  return ChangeDetectionStrategyType2;
})(ChangeDetectionStrategyType || {});

// packages/ag-grid-react/src/shared/customComp/interfaces.ts
var import_react24 = require("react");
function useGridCustomComponent(methods) {
  const { setMethods } = (0, import_react24.useContext)(CustomContext);
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
function useGridFloatingFilter(callbacks) {
  useGridCustomComponent(callbacks);
}
function useGridMenuItem(callbacks) {
  useGridCustomComponent(callbacks);
}
