// packages/ag-grid-react/src/agGridReact.tsx
import React18, { Component } from "react";

// packages/ag-grid-react/src/reactUi/agGridReactUi.tsx
import {
  BaseComponentWrapper,
  GridCoreCreator,
  ModuleRegistry,
  VanillaFrameworkOverrides,
  _combineAttributesAndGridOptions,
  _processOnChange,
  _warnOnce as _warnOnce3
} from "ag-grid-community";
import React17, {
  forwardRef as forwardRef3,
  useCallback as useCallback15,
  useContext as useContext14,
  useEffect as useEffect9,
  useImperativeHandle as useImperativeHandle3,
  useMemo as useMemo12,
  useRef as useRef15,
  useState as useState16
} from "react";

// packages/ag-grid-react/src/reactUi/cellRenderer/groupCellRenderer.tsx
import { _escapeString } from "ag-grid-community";
import React2, {
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

// packages/ag-grid-react/src/reactUi/jsComp.tsx
var showJsComp = (compDetails, context, eParent, ref) => {
  const doNothing = !compDetails || compDetails.componentFromFramework || context.isDestroyed();
  if (doNothing) {
    return;
  }
  const promise = compDetails.newAgStackInstance();
  if (promise == null) {
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

// packages/ag-grid-react/src/reactUi/utils.tsx
import ReactDOM from "react-dom";
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
  const getMemoType = () => hasSymbol() ? Symbol.for("react.memo") : 60115;
  return typeof Component2 === "function" && !(Component2.prototype && Component2.prototype.isReactComponent) || typeof Component2 === "object" && Component2.$$typeof === getMemoType();
};
var createRootAndFlushSyncAvailable = ReactDOM.createRoot != null && ReactDOM.flushSync != null;
function isReact17Minus() {
  return !createRootAndFlushSyncAvailable;
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
  if (createRootAndFlushSyncAvailable && useFlushSync && !disableFlushSync) {
    ReactDOM.flushSync(fn);
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
  const { ctrlsFactory, context } = useContext(BeansContext);
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
  const [contractedCssClasses, setContractedCssClasses] = useState(() => new CssClasses("ag-hidden"));
  const [checkboxCssClasses, setCheckboxCssClasses] = useState(() => new CssClasses("ag-invisible"));
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
  const setRef2 = useCallback((ref2) => {
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
    const groupCellRendererCtrl = ctrlsFactory.getInstance("groupCellRendererCtrl");
    if (groupCellRendererCtrl) {
      ctrlRef.current = context.createBean(groupCellRendererCtrl);
      ctrlRef.current.init(
        compProxy,
        eGui.current,
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
  const useFwRenderer = innerCompDetails && innerCompDetails.componentFromFramework;
  const FwRenderer = useFwRenderer ? innerCompDetails.componentClass : void 0;
  const useValue = innerCompDetails == null && value != null;
  const escapedValue = _escapeString(value, true);
  return /* @__PURE__ */ React2.createElement(
    "span",
    {
      className,
      ref: setRef2,
      ...!props.colDef ? { role: ctrlRef.current?.getCellAriaRole() } : {}
    },
    /* @__PURE__ */ React2.createElement("span", { className: expandedClassName, ref: eExpandedRef }),
    /* @__PURE__ */ React2.createElement("span", { className: contractedClassName, ref: eContractedRef }),
    /* @__PURE__ */ React2.createElement("span", { className: checkboxClassName, ref: eCheckboxRef }),
    /* @__PURE__ */ React2.createElement("span", { className: "ag-group-value", ref: eValueRef }, useValue && /* @__PURE__ */ React2.createElement(React2.Fragment, null, escapedValue), useFwRenderer && /* @__PURE__ */ React2.createElement(FwRenderer, { ...innerCompDetails.params })),
    /* @__PURE__ */ React2.createElement("span", { className: "ag-group-child-count" }, childCount)
  );
});
var groupCellRenderer_default = GroupCellRenderer;

// packages/ag-grid-react/src/shared/customComp/customComponentWrapper.ts
import { AgPromise as AgPromise2 } from "ag-grid-community";

// packages/ag-grid-react/src/reactUi/customComp/customWrapperComp.tsx
import React3, { memo, useEffect, useState as useState2 } from "react";

// packages/ag-grid-react/src/shared/customComp/customContext.ts
import { createContext } from "react";
var CustomContext = createContext({
  setMethods: () => {
  }
});

// packages/ag-grid-react/src/reactUi/customComp/customWrapperComp.tsx
var CustomWrapperComp = (params) => {
  const { initialProps, addUpdateCallback, CustomComponentClass, setMethods } = params;
  const [props, setProps] = useState2(initialProps);
  useEffect(() => {
    addUpdateCallback((newProps) => setProps(newProps));
  }, []);
  return /* @__PURE__ */ React3.createElement(CustomContext.Provider, { value: { setMethods } }, /* @__PURE__ */ React3.createElement(CustomComponentClass, { ...props }));
};
var customWrapperComp_default = memo(CustomWrapperComp);

// packages/ag-grid-react/src/shared/reactComponent.ts
import { AgPromise, _warnOnce } from "ag-grid-community";
import { createElement } from "react";
import { createPortal } from "react-dom";

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
    params.reactContainer = eParentElement;
    return eParentElement;
  }
  addParentContainerStyleAndClasses() {
    if (!this.componentInstance) {
      return;
    }
    if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
      _warnOnce(
        'Since v31.1 "getReactContainerStyle" is deprecated. Apply styling directly to ".ag-react-container" if needed.'
      );
      Object.assign(this.eParentElement.style, this.componentInstance.getReactContainerStyle());
    }
    if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
      _warnOnce(
        'Since v31.1 "getReactContainerClasses" is deprecated. Apply styling directly to ".ag-react-container" if needed.'
      );
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
    this.params = params;
    this.createOrUpdatePortal(params);
    return new AgPromise((resolve) => this.createReactComponent(resolve));
  }
  createOrUpdatePortal(params) {
    if (!this.isStatelessComponent()) {
      this.ref = (element) => {
        this.componentInstance = element;
        this.addParentContainerStyleAndClasses();
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
    this.expectingNewMethods = true;
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
  setMethods(methods) {
    if (this.expectingNewMethods === false && this.providedMethods?.doesFilterPass !== methods?.doesFilterPass) {
      setTimeout(() => {
        this.sourceParams.filterChangedCallback();
      });
    }
    this.expectingNewMethods = false;
    super.setMethods(methods);
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
import { AgPromise as AgPromise3 } from "ag-grid-community";
function updateFloatingFilterParent(params, model) {
  params.parentFilterInstance((instance) => {
    (instance.setModel(model) || AgPromise3.resolve()).then(() => {
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

// packages/ag-grid-react/src/shared/customComp/util.ts
import { AgPromise as AgPromise4, _warnOnce as _warnOnce2 } from "ag-grid-community";
function getInstance(wrapperComponent, callback) {
  const promise = wrapperComponent?.getInstance?.() ?? AgPromise4.resolve(void 0);
  promise.then((comp) => callback(comp));
}
function warnReactiveCustomComponents() {
  _warnOnce2("As of v32, using custom components with `reactiveCustomComponents = false` is deprecated.");
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
        return;
      }
      window.setTimeout(() => {
        this.waitForInstance(reactComponent, resolve, startTime);
      });
    }
  }
};

// packages/ag-grid-react/src/reactUi/gridComp.tsx
import { GridCtrl } from "ag-grid-community";
import React16, { memo as memo14, useCallback as useCallback14, useEffect as useEffect8, useMemo as useMemo11, useRef as useRef14, useState as useState15 } from "react";

// packages/ag-grid-react/src/reactUi/gridBodyComp.tsx
import {
  CssClassManager as CssClassManager4,
  FakeHScrollComp,
  FakeVScrollComp,
  GridBodyCtrl,
  OverlayWrapperComponent,
  _setAriaColCount,
  _setAriaRowCount
} from "ag-grid-community";
import React14, { memo as memo12, useCallback as useCallback12, useContext as useContext12, useMemo as useMemo10, useRef as useRef12, useState as useState14 } from "react";

// packages/ag-grid-react/src/reactUi/header/gridHeaderComp.tsx
import { GridHeaderCtrl } from "ag-grid-community";
import React9, { memo as memo7, useCallback as useCallback7, useContext as useContext6, useMemo as useMemo6, useRef as useRef7, useState as useState8 } from "react";

// packages/ag-grid-react/src/reactUi/header/headerRowContainerComp.tsx
import { HeaderRowContainerCtrl } from "ag-grid-community";
import React8, { memo as memo6, useCallback as useCallback6, useContext as useContext5, useRef as useRef6, useState as useState7 } from "react";

// packages/ag-grid-react/src/reactUi/header/headerRowComp.tsx
import { HeaderRowType } from "ag-grid-community";
import React7, { memo as memo5, useCallback as useCallback5, useMemo as useMemo5, useRef as useRef5, useState as useState6 } from "react";

// packages/ag-grid-react/src/reactUi/header/headerCellComp.tsx
import { CssClassManager, _removeAriaSort, _setAriaSort } from "ag-grid-community";
import React4, { memo as memo2, useCallback as useCallback2, useContext as useContext2, useEffect as useEffect2, useLayoutEffect as useLayoutEffect2, useMemo as useMemo2, useRef as useRef2, useState as useState3 } from "react";
var HeaderCellComp = (props) => {
  const { ctrl } = props;
  const isAlive = ctrl.isAlive();
  const { context } = useContext2(BeansContext);
  const colId = isAlive ? ctrl.getColId() : void 0;
  const [userCompDetails, setUserCompDetails] = useState3();
  const eGui = useRef2(null);
  const eResize = useRef2(null);
  const eHeaderCompWrapper = useRef2(null);
  const userCompRef = useRef2();
  const cssClassManager = useRef2();
  if (isAlive && !cssClassManager.current) {
    cssClassManager.current = new CssClassManager(() => eGui.current);
  }
  const setRef2 = useCallback2((e) => {
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
          sort ? _setAriaSort(eGui.current, sort) : _removeAriaSort(eGui.current);
        }
      },
      setUserCompDetails: (compDetails) => setUserCompDetails(compDetails),
      getUserCompInstance: () => userCompRef.current || void 0
    };
    ctrl.setComp(compProxy, eGui.current, eResize.current, eHeaderCompWrapper.current);
    const selectAllGui = ctrl.getSelectAllGui();
    eResize.current?.insertAdjacentElement("afterend", selectAllGui);
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
  const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
  const UserCompClass = userCompDetails && userCompDetails.componentClass;
  return /* @__PURE__ */ React4.createElement("div", { ref: setRef2, className: "ag-header-cell", "col-id": colId, role: "columnheader" }, /* @__PURE__ */ React4.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }), /* @__PURE__ */ React4.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" }, reactUserComp && userCompStateless && /* @__PURE__ */ React4.createElement(UserCompClass, { ...userCompDetails.params }), reactUserComp && !userCompStateless && /* @__PURE__ */ React4.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompRef })));
};
var headerCellComp_default = memo2(HeaderCellComp);

// packages/ag-grid-react/src/reactUi/header/headerFilterCellComp.tsx
import { AgPromise as AgPromise5 } from "ag-grid-community";
import React5, { memo as memo3, useCallback as useCallback3, useContext as useContext3, useLayoutEffect as useLayoutEffect3, useMemo as useMemo3, useRef as useRef3, useState as useState4 } from "react";
var HeaderFilterCellComp = (props) => {
  const { context, gos } = useContext3(BeansContext);
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
  const eGui = useRef3(null);
  const eFloatingFilterBody = useRef3(null);
  const eButtonWrapper = useRef3(null);
  const eButtonShowMainFilter = useRef3(null);
  const userCompResolve = useRef3();
  const userCompPromise = useRef3();
  const userCompRef = (value) => {
    if (value == null) {
      return;
    }
    userCompResolve.current && userCompResolve.current(value);
  };
  const { ctrl } = props;
  const setRef2 = useCallback3((e) => {
    eGui.current = e;
    if (!eGui.current) {
      return;
    }
    userCompPromise.current = new AgPromise5((resolve) => {
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
      setMenuIcon: (eIcon) => eButtonShowMainFilter.current?.appendChild(eIcon)
    };
    ctrl.setComp(compProxy, eGui.current, eButtonShowMainFilter.current, eFloatingFilterBody.current);
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
  const floatingFilterCompProxy = useMemo3(() => {
    if (userCompDetails) {
      if (reactiveCustomComponents) {
        const compProxy = new FloatingFilterComponentProxy(
          userCompDetails.params,
          () => setRenderKey((prev) => prev + 1)
        );
        userCompRef(compProxy);
        return compProxy;
      } else if (userCompDetails.componentFromFramework) {
        warnReactiveCustomComponents();
      }
    }
    return void 0;
  }, [userCompDetails]);
  const floatingFilterProps = floatingFilterCompProxy?.getProps();
  const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
  const UserCompClass = userCompDetails && userCompDetails.componentClass;
  return /* @__PURE__ */ React5.createElement("div", { ref: setRef2, className, role: "gridcell" }, /* @__PURE__ */ React5.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" }, reactUserComp && !reactiveCustomComponents && /* @__PURE__ */ React5.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompStateless ? () => {
  } : userCompRef }), reactUserComp && reactiveCustomComponents && /* @__PURE__ */ React5.createElement(
    CustomContext.Provider,
    {
      value: {
        setMethods: (methods) => floatingFilterCompProxy.setMethods(methods)
      }
    },
    /* @__PURE__ */ React5.createElement(UserCompClass, { ...floatingFilterProps })
  )), /* @__PURE__ */ React5.createElement(
    "div",
    {
      ref: eButtonWrapper,
      "aria-hidden": buttonWrapperAriaHidden,
      className: buttonWrapperClassName,
      role: "presentation"
    },
    /* @__PURE__ */ React5.createElement(
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
import React6, { memo as memo4, useCallback as useCallback4, useContext as useContext4, useEffect as useEffect3, useLayoutEffect as useLayoutEffect4, useMemo as useMemo4, useRef as useRef4, useState as useState5 } from "react";
var HeaderGroupCellComp = (props) => {
  const { context } = useContext4(BeansContext);
  const { ctrl } = props;
  const [cssClasses, setCssClasses] = useState5(() => new CssClasses());
  const [cssResizableClasses, setResizableCssClasses] = useState5(() => new CssClasses());
  const [resizableAriaHidden, setResizableAriaHidden] = useState5("false");
  const [ariaExpanded, setAriaExpanded] = useState5();
  const [userCompDetails, setUserCompDetails] = useState5();
  const colId = useMemo4(() => ctrl.getColId(), []);
  const eGui = useRef4(null);
  const eResize = useRef4(null);
  const userCompRef = useRef4();
  const setRef2 = useCallback4((e) => {
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
  useLayoutEffect4(() => showJsComp(userCompDetails, context, eGui.current), [userCompDetails]);
  useEffect3(() => {
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
  const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
  const UserCompClass = userCompDetails && userCompDetails.componentClass;
  return /* @__PURE__ */ React6.createElement("div", { ref: setRef2, className, "col-id": colId, role: "columnheader", "aria-expanded": ariaExpanded }, reactUserComp && userCompStateless && /* @__PURE__ */ React6.createElement(UserCompClass, { ...userCompDetails.params }), reactUserComp && !userCompStateless && /* @__PURE__ */ React6.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompRef }), /* @__PURE__ */ React6.createElement("div", { ref: eResize, "aria-hidden": resizableAriaHidden, className: resizableClassName }));
};
var headerGroupCellComp_default = memo4(HeaderGroupCellComp);

// packages/ag-grid-react/src/reactUi/header/headerRowComp.tsx
var HeaderRowComp = (props) => {
  const { ctrl } = props;
  const { topOffset, rowHeight } = useMemo5(() => ctrl.getTopAndHeight(), []);
  const ariaRowIndex = ctrl.getAriaRowIndex();
  const className = ctrl.getHeaderRowClass();
  const [height, setHeight] = useState6(() => rowHeight + "px");
  const [top, setTop] = useState6(() => topOffset + "px");
  const cellCtrlsRef = useRef5(null);
  const prevCellCtrlsRef = useRef5(null);
  const [cellCtrls, setCellCtrls] = useState6(() => ctrl.getHeaderCtrls());
  const eGui = useRef5(null);
  const setRef2 = useCallback5((e) => {
    eGui.current = e;
    if (!e) {
      return;
    }
    const compProxy = {
      setHeight: (height2) => setHeight(height2),
      setTop: (top2) => setTop(top2),
      setHeaderCtrls: (ctrls, forceOrder, afterScroll) => {
        prevCellCtrlsRef.current = cellCtrlsRef.current;
        cellCtrlsRef.current = ctrls;
        const next = getNextValueIfDifferent(prevCellCtrlsRef.current, ctrls, forceOrder);
        if (next !== prevCellCtrlsRef.current) {
          agFlushSync(afterScroll, () => setCellCtrls(next));
        }
      },
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      }
    };
    ctrl.setComp(compProxy, false);
  }, []);
  const style = useMemo5(
    () => ({
      height,
      top
    }),
    [height, top]
  );
  const createCellJsx = useCallback5((cellCtrl) => {
    switch (ctrl.getType()) {
      case HeaderRowType.COLUMN_GROUP:
        return /* @__PURE__ */ React7.createElement(headerGroupCellComp_default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
      case HeaderRowType.FLOATING_FILTER:
        return /* @__PURE__ */ React7.createElement(headerFilterCellComp_default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
      default:
        return /* @__PURE__ */ React7.createElement(headerCellComp_default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
    }
  }, []);
  return /* @__PURE__ */ React7.createElement("div", { ref: setRef2, className, role: "row", style, "aria-rowindex": ariaRowIndex }, cellCtrls.map(createCellJsx));
};
var headerRowComp_default = memo5(HeaderRowComp);

// packages/ag-grid-react/src/reactUi/header/headerRowContainerComp.tsx
var HeaderRowContainerComp = (props) => {
  const [displayed, setDisplayed] = useState7(true);
  const [headerRowCtrls, setHeaderRowCtrls] = useState7([]);
  const { context } = useContext5(BeansContext);
  const eGui = useRef6(null);
  const eCenterContainer = useRef6(null);
  const headerRowCtrlRef = useRef6(null);
  const pinnedLeft = props.pinned === "left";
  const pinnedRight = props.pinned === "right";
  const centre = !pinnedLeft && !pinnedRight;
  const setRef2 = useCallback6((e) => {
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
    headerRowCtrlRef.current = context.createBean(new HeaderRowContainerCtrl(props.pinned));
    headerRowCtrlRef.current.setComp(compProxy, eGui.current);
  }, []);
  const className = !displayed ? "ag-hidden" : "";
  const insertRowsJsx = () => headerRowCtrls.map((ctrl) => /* @__PURE__ */ React8.createElement(headerRowComp_default, { ctrl, key: ctrl.getInstanceId() }));
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, pinnedLeft && /* @__PURE__ */ React8.createElement(
    "div",
    {
      ref: setRef2,
      className: "ag-pinned-left-header " + className,
      "aria-hidden": !displayed,
      role: "rowgroup"
    },
    insertRowsJsx()
  ), pinnedRight && /* @__PURE__ */ React8.createElement(
    "div",
    {
      ref: setRef2,
      className: "ag-pinned-right-header " + className,
      "aria-hidden": !displayed,
      role: "rowgroup"
    },
    insertRowsJsx()
  ), centre && /* @__PURE__ */ React8.createElement("div", { ref: setRef2, className: "ag-header-viewport " + className, role: "presentation" }, /* @__PURE__ */ React8.createElement("div", { ref: eCenterContainer, className: "ag-header-container", role: "rowgroup" }, insertRowsJsx())));
};
var headerRowContainerComp_default = memo6(HeaderRowContainerComp);

// packages/ag-grid-react/src/reactUi/header/gridHeaderComp.tsx
var GridHeaderComp = () => {
  const [cssClasses, setCssClasses] = useState8(() => new CssClasses());
  const [height, setHeight] = useState8();
  const { context } = useContext6(BeansContext);
  const eGui = useRef7(null);
  const gridCtrlRef = useRef7(null);
  const setRef2 = useCallback7((e) => {
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
    gridCtrlRef.current = context.createBean(new GridHeaderCtrl());
    gridCtrlRef.current.setComp(compProxy, eGui.current, eGui.current);
  }, []);
  const className = useMemo6(() => {
    const res = cssClasses.toString();
    return "ag-header " + res;
  }, [cssClasses]);
  const style = useMemo6(
    () => ({
      height,
      minHeight: height
    }),
    [height]
  );
  return /* @__PURE__ */ React9.createElement("div", { ref: setRef2, className, style, role: "presentation" }, /* @__PURE__ */ React9.createElement(headerRowContainerComp_default, { pinned: "left" }), /* @__PURE__ */ React9.createElement(headerRowContainerComp_default, { pinned: null }), /* @__PURE__ */ React9.createElement(headerRowContainerComp_default, { pinned: "right" }));
};
var gridHeaderComp_default = memo7(GridHeaderComp);

// packages/ag-grid-react/src/reactUi/reactComment.tsx
import { useEffect as useEffect4 } from "react";
var useReactCommentEffect = (comment, eForCommentRef) => {
  useEffect4(() => {
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
import { RowContainerCtrl, _getRowContainerOptions } from "ag-grid-community";
import React13, { memo as memo11, useCallback as useCallback11, useContext as useContext11, useMemo as useMemo9, useRef as useRef11, useState as useState13 } from "react";

// packages/ag-grid-react/src/reactUi/rows/rowComp.tsx
import { CssClassManager as CssClassManager3 } from "ag-grid-community";
import React12, { memo as memo10, useCallback as useCallback10, useContext as useContext10, useEffect as useEffect7, useLayoutEffect as useLayoutEffect6, useMemo as useMemo8, useRef as useRef10, useState as useState12 } from "react";

// packages/ag-grid-react/src/reactUi/cells/cellComp.tsx
import { CssClassManager as CssClassManager2, _removeFromParent } from "ag-grid-community";
import React11, { memo as memo9, useCallback as useCallback9, useContext as useContext9, useLayoutEffect as useLayoutEffect5, useMemo as useMemo7, useRef as useRef9, useState as useState11 } from "react";

// packages/ag-grid-react/src/shared/customComp/cellEditorComponentProxy.ts
import { AgPromise as AgPromise6 } from "ag-grid-community";
var CellEditorComponentProxy = class {
  constructor(cellEditorParams, refreshProps) {
    this.cellEditorParams = cellEditorParams;
    this.refreshProps = refreshProps;
    this.instanceCreated = new AgPromise6((resolve) => {
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
    return ["isCancelBeforeStart", "isCancelAfterEnd", "focusIn", "focusOut", "afterGuiAttached"];
  }
  updateValue(value) {
    this.value = value;
    this.refreshProps();
  }
};

// packages/ag-grid-react/src/reactUi/cells/popupEditorComp.tsx
import React10, { memo as memo8, useContext as useContext7, useState as useState10 } from "react";
import { createPortal as createPortal2 } from "react-dom";

// packages/ag-grid-react/src/reactUi/useEffectOnce.tsx
import { useEffect as useEffect5, useRef as useRef8, useState as useState9 } from "react";
var useEffectOnce = (effect) => {
  const effectFn = useRef8(effect);
  const destroyFn = useRef8();
  const effectCalled = useRef8(false);
  const rendered = useRef8(false);
  const [, setVal] = useState9(0);
  if (effectCalled.current) {
    rendered.current = true;
  }
  useEffect5(() => {
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
  const [popupEditorWrapper, setPopupEditorWrapper] = useState10();
  const { context, popupService, localeService, gos, editService } = useContext7(BeansContext);
  useEffectOnce(() => {
    const { editDetails, cellCtrl, eParentCell } = props;
    const { compDetails } = editDetails;
    const useModelPopup = gos.get("stopEditingWhenCellsLoseFocus");
    const wrapper = context.createBean(editService.createPopupEditorWrapper(compDetails.params));
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
  return /* @__PURE__ */ React10.createElement(React10.Fragment, null, popupEditorWrapper && props.wrappedContent && createPortal2(props.wrappedContent, popupEditorWrapper.getGui()));
};
var popupEditorComp_default = memo8(PopupEditorComp);

// packages/ag-grid-react/src/reactUi/cells/showJsRenderer.tsx
import { useCallback as useCallback8, useContext as useContext8, useEffect as useEffect6 } from "react";
var useJsCellRenderer = (showDetails, showTools, eCellValue, cellValueVersion, jsCellRendererRef, eGui) => {
  const { context } = useContext8(BeansContext);
  const destroyCellRenderer = useCallback8(() => {
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
  useEffect6(() => {
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
    if (promise == null) {
      return;
    }
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
  }, [showDetails, showTools, cellValueVersion]);
  useEffect6(() => {
    return destroyCellRenderer;
  }, []);
};
var showJsRenderer_default = useJsCellRenderer;

// packages/ag-grid-react/src/reactUi/cells/cellComp.tsx
var jsxEditorProxy = (editDetails, CellEditorClass, setRef2) => {
  const { compProxy } = editDetails;
  setRef2(compProxy);
  const props = compProxy.getProps();
  const isStateless = isComponentStateless(CellEditorClass);
  return /* @__PURE__ */ React11.createElement(
    CustomContext.Provider,
    {
      value: {
        setMethods: (methods) => compProxy.setMethods(methods)
      }
    },
    isStateless && /* @__PURE__ */ React11.createElement(CellEditorClass, { ...props }),
    !isStateless && /* @__PURE__ */ React11.createElement(CellEditorClass, { ...props, ref: (ref) => compProxy.setRef(ref) })
  );
};
var jsxEditor = (editDetails, CellEditorClass, setRef2) => {
  const newFormat = editDetails.compProxy;
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, !newFormat && /* @__PURE__ */ React11.createElement(CellEditorClass, { ...editDetails.compDetails.params, ref: setRef2 }), newFormat && jsxEditorProxy(editDetails, CellEditorClass, setRef2));
};
var jsxEditValue = (editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui, cellCtrl, jsEditorComp) => {
  const compDetails = editDetails.compDetails;
  const CellEditorClass = compDetails.componentClass;
  const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
  const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
  const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, reactInlineEditor && jsxEditor(editDetails, CellEditorClass, setInlineCellEditorRef), reactPopupEditor && /* @__PURE__ */ React11.createElement(
    popupEditorComp_default,
    {
      editDetails,
      cellCtrl,
      eParentCell: eGui,
      wrappedContent: jsxEditor(editDetails, CellEditorClass, setPopupCellEditorRef)
    }
  ), jsPopupEditor && jsEditorComp && /* @__PURE__ */ React11.createElement(
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
  const valueForNoCellRenderer = value?.toString ? value.toString() : value;
  const bodyJsxFunc = () => /* @__PURE__ */ React11.createElement(React11.Fragment, null, noCellRenderer && /* @__PURE__ */ React11.createElement(React11.Fragment, null, valueForNoCellRenderer), reactCellRenderer && !reactCellRendererStateless && /* @__PURE__ */ React11.createElement(CellRendererClass, { ...compDetails.params, key, ref: cellRendererRef }), reactCellRenderer && reactCellRendererStateless && /* @__PURE__ */ React11.createElement(CellRendererClass, { ...compDetails.params, key }));
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, showCellWrapper ? /* @__PURE__ */ React11.createElement("span", { role: "presentation", id: `cell-${parentId}`, className: "ag-cell-value", ref: setECellValue }, bodyJsxFunc()) : bodyJsxFunc());
};
var CellComp = (props) => {
  const { context } = useContext9(BeansContext);
  const { cellCtrl, printLayout, editingRow } = props;
  const tabIndex = cellCtrl.getTabIndex();
  const colId = cellCtrl.getColumnIdSanitised();
  const cellInstanceId = cellCtrl.getInstanceId();
  const [renderDetails, setRenderDetails] = useState11(
    () => cellCtrl.isCellRenderer() ? void 0 : { compDetails: void 0, value: cellCtrl.getValueToDisplay(), force: false }
  );
  const [editDetails, setEditDetails] = useState11();
  const [renderKey, setRenderKey] = useState11(1);
  const [userStyles, setUserStyles] = useState11();
  const [includeSelection, setIncludeSelection] = useState11(false);
  const [includeRowDrag, setIncludeRowDrag] = useState11(false);
  const [includeDndSource, setIncludeDndSource] = useState11(false);
  const [jsEditorComp, setJsEditorComp] = useState11();
  const forceWrapper = useMemo7(() => cellCtrl.isForceWrapper(), [cellCtrl]);
  const cellAriaRole = useMemo7(() => cellCtrl.getCellAriaRole(), [cellCtrl]);
  const eGui = useRef9(null);
  const cellRendererRef = useRef9(null);
  const jsCellRendererRef = useRef9();
  const cellEditorRef = useRef9();
  const eCellWrapper = useRef9();
  const cellWrapperDestroyFuncs = useRef9([]);
  const eCellValue = useRef9();
  const [cellValueVersion, setCellValueVersion] = useState11(0);
  const setCellValueRef = useCallback9((ref) => {
    eCellValue.current = ref;
    setCellValueVersion((v) => v + 1);
  }, []);
  const showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag);
  const showCellWrapper = forceWrapper || showTools;
  const setCellEditorRef = useCallback9(
    (popup, cellEditor) => {
      cellEditorRef.current = cellEditor;
      if (cellEditor) {
        const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
        if (editingCancelledByUserComp) {
          setTimeout(() => {
            cellCtrl.stopEditing(true);
            cellCtrl.focusCell(true);
          });
        }
      }
    },
    [cellCtrl]
  );
  const setPopupCellEditorRef = useCallback9(
    (cellRenderer) => setCellEditorRef(true, cellRenderer),
    [setCellEditorRef]
  );
  const setInlineCellEditorRef = useCallback9(
    (cellRenderer) => setCellEditorRef(false, cellRenderer),
    [setCellEditorRef]
  );
  const cssClassManager = useRef9();
  if (!cssClassManager.current) {
    cssClassManager.current = new CssClassManager2(() => eGui.current);
  }
  showJsRenderer_default(renderDetails, showCellWrapper, eCellValue.current, cellValueVersion, jsCellRendererRef, eGui);
  const lastRenderDetails = useRef9();
  useLayoutEffect5(() => {
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
  useLayoutEffect5(() => {
    const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
    if (!doingJsEditor) {
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
      setCellEditorRef(isPopup, cellEditor);
      if (!isPopup) {
        const parentEl = (forceWrapper ? eCellWrapper : eGui).current;
        parentEl?.appendChild(compGui);
        cellEditor.afterGuiAttached && cellEditor.afterGuiAttached();
      }
      setJsEditorComp(cellEditor);
    });
    return () => {
      cellEditorPromise.then((cellEditor) => {
        const compGui = cellEditor.getGui();
        context.destroyBean(cellEditor);
        setCellEditorRef(isPopup, void 0);
        setJsEditorComp(void 0);
        if (compGui && compGui.parentElement) {
          compGui.parentElement.removeChild(compGui);
        }
      });
    };
  }, [editDetails]);
  const setCellWrapperRef = useCallback9(
    (ref) => {
      eCellWrapper.current = ref;
      if (!eCellWrapper.current) {
        cellWrapperDestroyFuncs.current.forEach((f) => f());
        cellWrapperDestroyFuncs.current = [];
        return;
      }
      const addComp = (comp) => {
        if (comp) {
          const eGui2 = comp.getGui();
          eCellWrapper.current?.insertAdjacentElement("afterbegin", eGui2);
          cellWrapperDestroyFuncs.current.push(() => {
            context.destroyBean(comp);
            _removeFromParent(eGui2);
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
    },
    [cellCtrl, context, includeDndSource, includeRowDrag, includeSelection]
  );
  const setRef2 = useCallback9((ref) => {
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
          if (prev?.compDetails !== compDetails || prev?.value !== value || prev?.force !== force) {
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
            compProxy2 = new CellEditorComponentProxy(
              compDetails.params,
              () => setRenderKey((prev) => prev + 1)
            );
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
            if (editDetails2?.compProxy) {
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
  const reactCellRendererStateless = useMemo7(() => {
    const res = renderDetails && renderDetails.compDetails && renderDetails.compDetails.componentFromFramework && isComponentStateless(renderDetails.compDetails.componentClass);
    return !!res;
  }, [renderDetails]);
  useLayoutEffect5(() => {
    if (!eGui.current) {
      return;
    }
    cssClassManager.current.addOrRemoveCssClass("ag-cell-value", !showCellWrapper);
    cssClassManager.current.addOrRemoveCssClass("ag-cell-inline-editing", !!editDetails && !editDetails.popup);
    cssClassManager.current.addOrRemoveCssClass("ag-cell-popup-editing", !!editDetails && !!editDetails.popup);
    cssClassManager.current.addOrRemoveCssClass("ag-cell-not-inline-editing", !editDetails || !!editDetails.popup);
    cellCtrl.getRowCtrl()?.setInlineEditingCss(!!editDetails);
    if (cellCtrl.shouldRestoreFocus() && !cellCtrl.isEditing()) {
      eGui.current.focus({ preventScroll: true });
    }
  });
  const showContents = () => /* @__PURE__ */ React11.createElement(React11.Fragment, null, renderDetails != null && jsxShowValue(
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
  return /* @__PURE__ */ React11.createElement("div", { ref: setRef2, style: userStyles, tabIndex, role: cellAriaRole, "col-id": colId }, showCellWrapper ? /* @__PURE__ */ React11.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: setCellWrapperRef }, showContents()) : showContents());
};
var cellComp_default = memo9(CellComp);

// packages/ag-grid-react/src/reactUi/rows/rowComp.tsx
var RowComp = (params) => {
  const { context, gos } = useContext10(BeansContext);
  const { rowCtrl, containerType } = params;
  const tabIndex = rowCtrl.getTabIndex();
  const domOrderRef = useRef10(rowCtrl.getDomOrder());
  const isFullWidth = rowCtrl.isFullWidth();
  const isDisplayed = rowCtrl.getRowNode().displayed;
  const [rowIndex, setRowIndex] = useState12(() => isDisplayed ? rowCtrl.getRowIndex() : null);
  const [rowId, setRowId] = useState12(() => rowCtrl.getRowId());
  const [rowBusinessKey, setRowBusinessKey] = useState12(() => rowCtrl.getBusinessKey());
  const [userStyles, setUserStyles] = useState12(() => rowCtrl.getRowStyles());
  const cellCtrlsRef = useRef10(null);
  const prevCellCtrlsRef = useRef10(null);
  const [cellCtrls, setCellCtrls] = useState12(() => null);
  const [fullWidthCompDetails, setFullWidthCompDetails] = useState12();
  const [top, setTop] = useState12(
    () => isDisplayed ? rowCtrl.getInitialRowTop(containerType) : void 0
  );
  const [transform, setTransform] = useState12(
    () => isDisplayed ? rowCtrl.getInitialTransform(containerType) : void 0
  );
  const eGui = useRef10(null);
  const fullWidthCompRef = useRef10();
  const autoHeightSetup = useRef10(false);
  const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = useState12(0);
  useEffect7(() => {
    if (autoHeightSetup.current) {
      return;
    }
    if (!fullWidthCompDetails) {
      return;
    }
    if (autoHeightSetupAttempt > 10) {
      return;
    }
    const eChild = eGui.current?.firstChild;
    if (eChild) {
      rowCtrl.setupDetailRowAutoHeight(eChild);
      autoHeightSetup.current = true;
    } else {
      setAutoHeightSetupAttempt((prev) => prev + 1);
    }
  }, [fullWidthCompDetails, autoHeightSetupAttempt]);
  const cssClassManager = useRef10();
  if (!cssClassManager.current) {
    cssClassManager.current = new CssClassManager3(() => eGui.current);
  }
  const setRef2 = useCallback10((e) => {
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
        prevCellCtrlsRef.current = cellCtrlsRef.current;
        cellCtrlsRef.current = next;
        const nextCells = getNextValueIfDifferent(prevCellCtrlsRef.current, next, domOrderRef.current);
        if (nextCells !== prevCellCtrlsRef.current) {
          agFlushSync(useFlushSync, () => setCellCtrls(nextCells));
        }
      },
      showFullWidth: (compDetails) => setFullWidthCompDetails(compDetails),
      getFullWidthCellRenderer: () => fullWidthCompRef.current,
      refreshFullWidth: (getUpdatedParams) => {
        if (canRefreshFullWidthRef.current) {
          setFullWidthCompDetails((prevFullWidthCompDetails) => ({
            ...prevFullWidthCompDetails,
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
  useLayoutEffect6(
    () => showJsComp(fullWidthCompDetails, context, eGui.current, fullWidthCompRef),
    [fullWidthCompDetails]
  );
  const rowStyles = useMemo8(() => {
    const res = { top, transform };
    Object.assign(res, userStyles);
    return res;
  }, [top, transform, userStyles]);
  const showFullWidthFramework = isFullWidth && fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
  const showCells = !isFullWidth && cellCtrls != null;
  const reactFullWidthCellRendererStateless = useMemo8(() => {
    const res = fullWidthCompDetails?.componentFromFramework && isComponentStateless(fullWidthCompDetails.componentClass);
    return !!res;
  }, [fullWidthCompDetails]);
  const canRefreshFullWidthRef = useRef10(false);
  useEffect7(() => {
    canRefreshFullWidthRef.current = reactFullWidthCellRendererStateless && !!fullWidthCompDetails && !!gos.get("reactiveCustomComponents");
  }, [reactFullWidthCellRendererStateless, fullWidthCompDetails]);
  const showCellsJsx = () => cellCtrls?.map((cellCtrl) => /* @__PURE__ */ React12.createElement(
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
    return /* @__PURE__ */ React12.createElement(React12.Fragment, null, reactFullWidthCellRendererStateless && /* @__PURE__ */ React12.createElement(FullWidthComp, { ...fullWidthCompDetails.params }), !reactFullWidthCellRendererStateless && /* @__PURE__ */ React12.createElement(FullWidthComp, { ...fullWidthCompDetails.params, ref: fullWidthCompRef }));
  };
  return /* @__PURE__ */ React12.createElement(
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
var rowComp_default = memo10(RowComp);

// packages/ag-grid-react/src/reactUi/rows/rowContainerComp.tsx
var RowContainerComp = (params) => {
  const { context } = useContext11(BeansContext);
  const { name } = params;
  const containerOptions = useMemo9(() => _getRowContainerOptions(name), [name]);
  const eViewport = useRef11(null);
  const eContainer = useRef11(null);
  const rowCtrlsRef = useRef11([]);
  const prevRowCtrlsRef = useRef11([]);
  const [rowCtrlsOrdered, setRowCtrlsOrdered] = useState13(() => []);
  const domOrderRef = useRef11(false);
  const rowContainerCtrlRef = useRef11();
  const viewportClasses = useMemo9(() => classesList(containerOptions.viewport), [containerOptions]);
  const containerClasses = useMemo9(() => classesList(containerOptions.container), [containerOptions]);
  const isCenter = containerOptions.type === "center";
  const topLevelRef = isCenter ? eViewport : eContainer;
  reactComment_default(" AG Row Container " + name + " ", topLevelRef);
  const areElementsReady = useCallback11(() => {
    if (isCenter) {
      return eViewport.current != null && eContainer.current != null;
    }
    return eContainer.current != null;
  }, []);
  const areElementsRemoved = useCallback11(() => {
    if (isCenter) {
      return eViewport.current == null && eContainer.current == null;
    }
    return eContainer.current == null;
  }, []);
  const setRef2 = useCallback11(() => {
    if (areElementsRemoved()) {
      context.destroyBean(rowContainerCtrlRef.current);
      rowContainerCtrlRef.current = null;
    }
    if (areElementsReady()) {
      const updateRowCtrlsOrdered = (useFlushSync) => {
        const next = getNextValueIfDifferent(
          prevRowCtrlsRef.current,
          rowCtrlsRef.current,
          domOrderRef.current
        );
        if (next !== prevRowCtrlsRef.current) {
          prevRowCtrlsRef.current = next;
          agFlushSync(useFlushSync, () => setRowCtrlsOrdered(next));
        }
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
        },
        setOffsetTop: (offset) => {
          if (eContainer.current) {
            eContainer.current.style.transform = `translateY(${offset})`;
          }
        }
      };
      rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(name));
      rowContainerCtrlRef.current.setComp(compProxy, eContainer.current, eViewport.current);
    }
  }, [areElementsReady, areElementsRemoved]);
  const setContainerRef = useCallback11(
    (e) => {
      eContainer.current = e;
      setRef2();
    },
    [setRef2]
  );
  const setViewportRef = useCallback11(
    (e) => {
      eViewport.current = e;
      setRef2();
    },
    [setRef2]
  );
  const buildContainer = () => /* @__PURE__ */ React13.createElement("div", { className: containerClasses, ref: setContainerRef, role: "rowgroup" }, rowCtrlsOrdered.map((rowCtrl) => /* @__PURE__ */ React13.createElement(
    rowComp_default,
    {
      rowCtrl,
      containerType: containerOptions.type,
      key: rowCtrl.getInstanceId()
    }
  )));
  return /* @__PURE__ */ React13.createElement(React13.Fragment, null, isCenter ? /* @__PURE__ */ React13.createElement("div", { className: viewportClasses, ref: setViewportRef, role: "presentation" }, buildContainer()) : buildContainer());
};
var rowContainerComp_default = memo11(RowContainerComp);

// packages/ag-grid-react/src/reactUi/gridBodyComp.tsx
var GridBodyComp = () => {
  const { context, resizeObserverService } = useContext12(BeansContext);
  const [rowAnimationClass, setRowAnimationClass] = useState14("");
  const [topHeight, setTopHeight] = useState14(0);
  const [bottomHeight, setBottomHeight] = useState14(0);
  const [stickyTopHeight, setStickyTopHeight] = useState14("0px");
  const [stickyTopTop, setStickyTopTop] = useState14("0px");
  const [stickyTopWidth, setStickyTopWidth] = useState14("100%");
  const [stickyBottomHeight, setStickyBottomHeight] = useState14("0px");
  const [stickyBottomBottom, setStickyBottomBottom] = useState14("0px");
  const [stickyBottomWidth, setStickyBottomWidth] = useState14("100%");
  const [topDisplay, setTopDisplay] = useState14("");
  const [bottomDisplay, setBottomDisplay] = useState14("");
  const [forceVerticalScrollClass, setForceVerticalScrollClass] = useState14(null);
  const [topAndBottomOverflowY, setTopAndBottomOverflowY] = useState14("");
  const [cellSelectableCss, setCellSelectableCss] = useState14(null);
  const [layoutClass, setLayoutClass] = useState14("ag-layout-normal");
  const cssClassManager = useRef12();
  if (!cssClassManager.current) {
    cssClassManager.current = new CssClassManager4(() => eRoot.current);
  }
  const eRoot = useRef12(null);
  const eTop = useRef12(null);
  const eStickyTop = useRef12(null);
  const eStickyBottom = useRef12(null);
  const eBody = useRef12(null);
  const eBodyViewport = useRef12(null);
  const eBottom = useRef12(null);
  const beansToDestroy = useRef12([]);
  const destroyFuncs = useRef12([]);
  reactComment_default(" AG Grid Body ", eRoot);
  reactComment_default(" AG Pinned Top ", eTop);
  reactComment_default(" AG Sticky Top ", eStickyTop);
  reactComment_default(" AG Middle ", eBodyViewport);
  reactComment_default(" AG Pinned Bottom ", eBottom);
  const setRef2 = useCallback12((e) => {
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
    const attachToDom = (eParent, eChild) => {
      eParent.appendChild(eChild);
      destroyFuncs.current.push(() => eParent.removeChild(eChild));
    };
    const newComp = (compClass) => {
      const comp = context.createBean(new compClass());
      beansToDestroy.current.push(comp);
      return comp;
    };
    const addComp = (eParent, compClass, comment) => {
      attachToDom(eParent, document.createComment(comment));
      attachToDom(eParent, newComp(compClass).getGui());
    };
    addComp(eRoot.current, FakeHScrollComp, " AG Fake Horizontal Scroll ");
    addComp(eRoot.current, OverlayWrapperComponent, " AG Overlay Wrapper ");
    if (eBody.current) {
      addComp(eBody.current, FakeVScrollComp, " AG Fake Vertical Scroll ");
    }
    const compProxy = {
      setRowAnimationCssOnBodyViewport: setRowAnimationClass,
      setColumnCount: (count) => {
        if (eRoot.current) {
          _setAriaColCount(eRoot.current, count);
        }
      },
      setRowCount: (count) => {
        if (eRoot.current) {
          _setAriaRowCount(eRoot.current, count);
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
      },
      setStickyBottomHeight,
      setStickyBottomBottom,
      setStickyBottomWidth
    };
    const ctrl = context.createBean(new GridBodyCtrl());
    beansToDestroy.current.push(ctrl);
    ctrl.setComp(
      compProxy,
      eRoot.current,
      eBodyViewport.current,
      eTop.current,
      eBottom.current,
      eStickyTop.current,
      eStickyBottom.current
    );
  }, []);
  const rootClasses = useMemo10(() => classesList("ag-root", "ag-unselectable", layoutClass), [layoutClass]);
  const bodyViewportClasses = useMemo10(
    () => classesList(
      "ag-body-viewport",
      rowAnimationClass,
      layoutClass,
      forceVerticalScrollClass,
      cellSelectableCss
    ),
    [rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss]
  );
  const bodyClasses = useMemo10(() => classesList("ag-body", layoutClass), [layoutClass]);
  const topClasses = useMemo10(() => classesList("ag-floating-top", cellSelectableCss), [cellSelectableCss]);
  const stickyTopClasses = useMemo10(() => classesList("ag-sticky-top", cellSelectableCss), [cellSelectableCss]);
  const stickyBottomClasses = useMemo10(() => classesList("ag-sticky-bottom", cellSelectableCss), [cellSelectableCss]);
  const bottomClasses = useMemo10(() => classesList("ag-floating-bottom", cellSelectableCss), [cellSelectableCss]);
  const topStyle = useMemo10(
    () => ({
      height: topHeight,
      minHeight: topHeight,
      display: topDisplay,
      overflowY: topAndBottomOverflowY
    }),
    [topHeight, topDisplay, topAndBottomOverflowY]
  );
  const stickyTopStyle = useMemo10(
    () => ({
      height: stickyTopHeight,
      top: stickyTopTop,
      width: stickyTopWidth
    }),
    [stickyTopHeight, stickyTopTop, stickyTopWidth]
  );
  const stickyBottomStyle = useMemo10(
    () => ({
      height: stickyBottomHeight,
      bottom: stickyBottomBottom,
      width: stickyBottomWidth
    }),
    [stickyBottomHeight, stickyBottomBottom, stickyBottomWidth]
  );
  const bottomStyle = useMemo10(
    () => ({
      height: bottomHeight,
      minHeight: bottomHeight,
      display: bottomDisplay,
      overflowY: topAndBottomOverflowY
    }),
    [bottomHeight, bottomDisplay, topAndBottomOverflowY]
  );
  const createRowContainer = (container) => /* @__PURE__ */ React14.createElement(rowContainerComp_default, { name: container, key: `${container}-container` });
  const createSection = ({
    section,
    children,
    className,
    style
  }) => /* @__PURE__ */ React14.createElement("div", { ref: section, className, role: "presentation", style }, children.map(createRowContainer));
  return /* @__PURE__ */ React14.createElement("div", { ref: setRef2, className: rootClasses, role: "treegrid" }, /* @__PURE__ */ React14.createElement(gridHeaderComp_default, null), createSection({
    section: eTop,
    className: topClasses,
    style: topStyle,
    children: ["topLeft", "topCenter", "topRight", "topFullWidth"]
  }), /* @__PURE__ */ React14.createElement("div", { className: bodyClasses, ref: eBody, role: "presentation" }, createSection({
    section: eBodyViewport,
    className: bodyViewportClasses,
    children: ["left", "center", "right", "fullWidth"]
  })), createSection({
    section: eStickyTop,
    className: stickyTopClasses,
    style: stickyTopStyle,
    children: ["stickyTopLeft", "stickyTopCenter", "stickyTopRight", "stickyTopFullWidth"]
  }), createSection({
    section: eStickyBottom,
    className: stickyBottomClasses,
    style: stickyBottomStyle,
    children: ["stickyBottomLeft", "stickyBottomCenter", "stickyBottomRight", "stickyBottomFullWidth"]
  }), createSection({
    section: eBottom,
    className: bottomClasses,
    style: bottomStyle,
    children: ["bottomLeft", "bottomCenter", "bottomRight", "bottomFullWidth"]
  }));
};
var gridBodyComp_default = memo12(GridBodyComp);

// packages/ag-grid-react/src/reactUi/tabGuardComp.tsx
import { TabGuardClassNames, TabGuardCtrl } from "ag-grid-community";
import React15, { forwardRef as forwardRef2, memo as memo13, useCallback as useCallback13, useContext as useContext13, useImperativeHandle as useImperativeHandle2, useRef as useRef13 } from "react";
var TabGuardCompRef = (props, forwardRef4) => {
  const { children, eFocusableElement, onTabKeyDown, gridCtrl, forceFocusOutWhenTabGuardsAreEmpty } = props;
  const { context } = useContext13(BeansContext);
  const topTabGuardRef = useRef13(null);
  const bottomTabGuardRef = useRef13(null);
  const tabGuardCtrlRef = useRef13();
  const setTabIndex = (value) => {
    const processedValue = value == null ? void 0 : parseInt(value, 10).toString();
    [topTabGuardRef, bottomTabGuardRef].forEach((tabGuard) => {
      if (processedValue === void 0) {
        tabGuard.current?.removeAttribute("tabindex");
      } else {
        tabGuard.current?.setAttribute("tabindex", processedValue);
      }
    });
  };
  useImperativeHandle2(forwardRef4, () => ({
    forceFocusOutOfContainer(up) {
      tabGuardCtrlRef.current?.forceFocusOutOfContainer(up);
    }
  }));
  const setupCtrl = useCallback13(() => {
    if (!topTabGuardRef.current && !bottomTabGuardRef.current) {
      context.destroyBean(tabGuardCtrlRef.current);
      tabGuardCtrlRef.current = null;
      return;
    }
    if (topTabGuardRef.current && bottomTabGuardRef.current) {
      const compProxy = {
        setTabIndex
      };
      tabGuardCtrlRef.current = context.createBean(
        new TabGuardCtrl({
          comp: compProxy,
          eTopGuard: topTabGuardRef.current,
          eBottomGuard: bottomTabGuardRef.current,
          eFocusableElement,
          onTabKeyDown,
          forceFocusOutWhenTabGuardsAreEmpty,
          focusInnerElement: (fromBottom) => gridCtrl.focusInnerElement(fromBottom)
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
    return /* @__PURE__ */ React15.createElement(
      "div",
      {
        className: `${TabGuardClassNames.TAB_GUARD} ${className}`,
        role: "presentation",
        ref: side === "top" ? setTopRef : setBottomRef
      }
    );
  };
  return /* @__PURE__ */ React15.createElement(React15.Fragment, null, createTabGuard("top"), children, createTabGuard("bottom"));
};
var TabGuardComp = forwardRef2(TabGuardCompRef);
var tabGuardComp_default = memo13(TabGuardComp);

// packages/ag-grid-react/src/reactUi/gridComp.tsx
var GridComp = ({ context }) => {
  const [rtlClass, setRtlClass] = useState15("");
  const [layoutClass, setLayoutClass] = useState15("");
  const [cursor, setCursor] = useState15(null);
  const [userSelect, setUserSelect] = useState15(null);
  const [initialised, setInitialised] = useState15(false);
  const [tabGuardReady, setTabGuardReady] = useState15();
  const gridCtrlRef = useRef14(null);
  const eRootWrapperRef = useRef14(null);
  const tabGuardRef = useRef14();
  const [eGridBodyParent, setGridBodyParent] = useState15(null);
  const focusInnerElementRef = useRef14(() => void 0);
  const paginationCompRef = useRef14();
  const focusableContainersRef = useRef14([]);
  const onTabKeyDown = useCallback14(() => void 0, []);
  const beans = useMemo11(() => {
    if (context.isDestroyed()) {
      return null;
    }
    return context.getBeans();
  }, [context]);
  reactComment_default(" AG Grid ", eRootWrapperRef);
  const setRef2 = useCallback14((e) => {
    eRootWrapperRef.current = e;
    if (!eRootWrapperRef.current) {
      context.destroyBean(gridCtrlRef.current);
      gridCtrlRef.current = null;
      return;
    }
    if (context.isDestroyed()) {
      return;
    }
    gridCtrlRef.current = context.createBean(new GridCtrl());
    const gridCtrl = gridCtrlRef.current;
    focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);
    const compProxy = {
      destroyGridUi: () => {
      },
      // do nothing, as framework users destroy grid by removing the comp
      setRtlClass,
      forceFocusOutOfContainer: (up) => {
        if (!up && paginationCompRef.current?.isDisplayed()) {
          paginationCompRef.current.forceFocusOutOfContainer(up);
          return;
        }
        tabGuardRef.current?.forceFocusOutOfContainer(up);
      },
      updateLayoutClasses: setLayoutClass,
      getFocusableContainers: () => {
        const comps = [];
        const gridBodyCompEl = eRootWrapperRef.current?.querySelector(".ag-root");
        if (gridBodyCompEl) {
          comps.push({ getGui: () => gridBodyCompEl });
        }
        focusableContainersRef.current.forEach((comp) => {
          if (comp.isDisplayed()) {
            comps.push(comp);
          }
        });
        return comps;
      },
      setCursor,
      setUserSelect
    };
    gridCtrl.setComp(compProxy, eRootWrapperRef.current, eRootWrapperRef.current);
    setInitialised(true);
  }, []);
  useEffect8(() => {
    if (!tabGuardReady || !beans || !gridCtrlRef.current || !eGridBodyParent || !eRootWrapperRef.current) {
      return;
    }
    const gridCtrl = gridCtrlRef.current;
    const beansToDestroy = [];
    const {
      watermarkSelector,
      paginationSelector,
      sideBarSelector,
      statusBarSelector,
      gridHeaderDropZonesSelector
    } = gridCtrl.getOptionalSelectors();
    const additionalEls = [];
    const eRootWrapper = eRootWrapperRef.current;
    if (gridHeaderDropZonesSelector) {
      const headerDropZonesComp = context.createBean(new gridHeaderDropZonesSelector.component());
      const eGui = headerDropZonesComp.getGui();
      eRootWrapper.insertAdjacentElement("afterbegin", eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(headerDropZonesComp);
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
    const addComponentToDom = (component) => {
      const comp = context.createBean(new component());
      const eGui = comp.getGui();
      eRootWrapper.insertAdjacentElement("beforeend", eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(comp);
      return comp;
    };
    if (statusBarSelector) {
      addComponentToDom(statusBarSelector.component);
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
      additionalEls.forEach((el) => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });
    };
  }, [tabGuardReady, eGridBodyParent, beans]);
  const rootWrapperClasses = useMemo11(
    () => classesList("ag-root-wrapper", rtlClass, layoutClass),
    [rtlClass, layoutClass]
  );
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
  return /* @__PURE__ */ React16.createElement("div", { ref: setRef2, className: rootWrapperClasses, style: topStyle, role: "presentation" }, /* @__PURE__ */ React16.createElement("div", { className: rootWrapperBodyClasses, ref: setGridBodyParent, role: "presentation" }, initialised && eGridBodyParent && beans && /* @__PURE__ */ React16.createElement(BeansContext.Provider, { value: beans }, /* @__PURE__ */ React16.createElement(
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
    /* @__PURE__ */ React16.createElement(gridBodyComp_default, null)
  ))));
};
var gridComp_default = memo14(GridComp);

// packages/ag-grid-react/src/reactUi/renderStatusService.tsx
import { BeanStub } from "ag-grid-community";
var RenderStatusService = class extends BeanStub {
  wireBeans(beans) {
    this.ctrlsService = beans.ctrlsService;
  }
  areHeaderCellsRendered() {
    return this.ctrlsService.getHeaderRowContainerCtrls().every((container) => container.getAllCtrls().every((ctrl) => ctrl.areCellsRendered()));
  }
};

// packages/ag-grid-react/src/reactUi/agGridReactUi.tsx
var AgGridReactUi = (props) => {
  const apiRef = useRef15();
  const eGui = useRef15(null);
  const portalManager = useRef15(null);
  const destroyFuncs = useRef15([]);
  const whenReadyFuncs = useRef15([]);
  const prevProps = useRef15(props);
  const frameworkOverridesRef = useRef15();
  const ready = useRef15(false);
  const [context, setContext] = useState16(void 0);
  const [, setPortalRefresher] = useState16(0);
  const setRef2 = useCallback15((e) => {
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
        portalManager.current?.destroy();
        portalManager.current = null;
      });
    }
    const mergedGridOps = _combineAttributesAndGridOptions(props.gridOptions, props);
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
    const frameworkOverrides = isReact17Minus() ? new React17MinusFrameworkOverrides(processQueuedUpdates) : new ReactFrameworkOverrides();
    frameworkOverridesRef.current = frameworkOverrides;
    const renderStatusService = new RenderStatusService();
    const gridParams = {
      providedBeanInstances: {
        frameworkComponentWrapper: new ReactFrameworkComponentWrapper(
          portalManager.current,
          mergedGridOps.reactiveCustomComponents ?? true
        ),
        renderStatusService
      },
      modules,
      frameworkOverrides
    };
    const createUiCallback = (context2) => {
      setContext(context2);
      context2.createBean(renderStatusService);
      destroyFuncs.current.push(() => {
        context2.destroy();
      });
      const ctrlsService = context2.getBean("ctrlsService");
      ctrlsService.whenReady(() => {
        if (context2.isDestroyed()) {
          return;
        }
        const api = apiRef.current;
        if (api) {
          if (props.setGridApi) {
            props.setGridApi(api);
          }
        }
      });
    };
    const acceptChangesCallback = (context2) => {
      const ctrlsService = context2.getBean("ctrlsService");
      ctrlsService.whenReady(() => {
        whenReadyFuncs.current.forEach((f) => f());
        whenReadyFuncs.current.length = 0;
        ready.current = true;
      });
    };
    const gridCoreCreator = new GridCoreCreator();
    apiRef.current = gridCoreCreator.create(
      eGui.current,
      mergedGridOps,
      createUiCallback,
      acceptChangesCallback,
      gridParams
    );
  }, []);
  const style = useMemo12(() => {
    return {
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
  useEffect9(() => {
    const changes = extractGridPropertyChanges(prevProps.current, props);
    prevProps.current = props;
    processWhenReady(() => {
      if (apiRef.current) {
        _processOnChange(changes, apiRef.current);
      }
    });
  }, [props]);
  return /* @__PURE__ */ React17.createElement("div", { style, className: props.className, ref: setRef2 }, context && !context.isDestroyed() ? /* @__PURE__ */ React17.createElement(gridComp_default, { context }) : null, portalManager.current?.getPortals() ?? null);
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
var ReactFrameworkComponentWrapper = class extends BaseComponentWrapper {
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
          case "cellRenderer":
            return CellRendererComponentWrapper;
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
        case "cellRenderer":
          warnReactiveCustomComponents();
          break;
      }
    }
    const suppressFallbackMethods = !componentType.cellRenderer && componentType.propertyName !== "toolPanel";
    return new ReactComponent(UserReactComponent, this.parent, componentType, suppressFallbackMethods);
  }
};
var DetailCellRenderer = forwardRef3((props, ref) => {
  const { ctrlsFactory, context, gos, resizeObserverService, rowModel } = useContext14(BeansContext);
  const [cssClasses, setCssClasses] = useState16(() => new CssClasses());
  const [gridCssClasses, setGridCssClasses] = useState16(() => new CssClasses());
  const [detailGridOptions, setDetailGridOptions] = useState16();
  const [detailRowData, setDetailRowData] = useState16();
  const ctrlRef = useRef15();
  const eGuiRef = useRef15(null);
  const resizeObserverDestroyFunc = useRef15();
  const parentModules = useMemo12(() => ModuleRegistry.__getGridRegisteredModules(props.api.getGridId()), [props]);
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
    _warnOnce3(
      "detailCellRendererParams.template is not supported by AG Grid React. To change the template, provide a Custom Detail Cell Renderer. See https://ag-grid.com/react-data-grid/master-detail-custom-detail/"
    );
  }
  const setRef2 = useCallback15((e) => {
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
    if (gos.get("detailRowAutoHeight")) {
      const checkRowSizeFunc = () => {
        if (eGuiRef.current == null) {
          return;
        }
        const clientHeight = eGuiRef.current.clientHeight;
        if (clientHeight != null && clientHeight > 0) {
          const updateRowHeightFunc = () => {
            props.node.setRowHeight(clientHeight);
            if (rowModel.getType() === "clientSide") {
              rowModel.onRowHeightChanged();
            } else if (rowModel.getType() === "serverSide") {
              rowModel.onRowHeightChanged();
            }
          };
          setTimeout(updateRowHeightFunc, 0);
        }
      };
      resizeObserverDestroyFunc.current = resizeObserverService.observeResize(eGuiRef.current, checkRowSizeFunc);
      checkRowSizeFunc();
    }
  }, []);
  const setGridApi = useCallback15((api) => {
    ctrlRef.current?.registerDetailWithMaster(api);
  }, []);
  return /* @__PURE__ */ React17.createElement("div", { className: topClassName, ref: setRef2 }, detailGridOptions && /* @__PURE__ */ React17.createElement(
    AgGridReactUi,
    {
      className: gridClassName,
      ...detailGridOptions,
      modules: parentModules,
      rowData: detailRowData,
      setGridApi
    }
  ));
});
var ReactFrameworkOverrides = class extends VanillaFrameworkOverrides {
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
  shouldQueueUpdates() {
    return false;
  }
  getLockOnRefreshError() {
    return ` This error can also occur if using 'ReactDOM.render' instead of 'createRoot'. If so, please upgrade to 'createRoot'.`;
  }
};
var React17MinusFrameworkOverrides = class extends ReactFrameworkOverrides {
  constructor(processQueuedUpdates) {
    super();
    this.processQueuedUpdates = processQueuedUpdates;
    this.queueUpdates = false;
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
  getLockOnRefreshError() {
    return "";
  }
};

// packages/ag-grid-react/src/agGridReact.tsx
var AgGridReact = class extends Component {
  constructor() {
    super(...arguments);
    this.apiListeners = [];
    this.setGridApi = (api) => {
      this.api = api;
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
    return /* @__PURE__ */ React18.createElement(AgGridReactUi, { ...this.props, setGridApi: this.setGridApi });
  }
};

// packages/ag-grid-react/src/shared/customComp/interfaces.ts
import { useContext as useContext15 } from "react";
function useGridCustomComponent(methods) {
  const { setMethods } = useContext15(CustomContext);
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
export {
  AgGridReact,
  CustomContext as CustomComponentContext,
  getInstance,
  useGridCellEditor,
  useGridDate,
  useGridFilter,
  useGridFloatingFilter,
  useGridMenuItem,
  warnReactiveCustomComponents
};
