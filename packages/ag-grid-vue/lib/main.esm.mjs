var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// packages/ag-grid-vue/src/AgGridVue.ts
import { Component, Prop, Vue as Vue2 } from "vue-property-decorator";
import { Bean as Bean2, ComponentUtil as ComponentUtil2, createGrid, ALWAYS_SYNC_GLOBAL_EVENTS } from "ag-grid-community";

// packages/ag-grid-vue/src/VueFrameworkComponentWrapper.ts
import { BaseComponentWrapper, Bean } from "ag-grid-community";

// packages/ag-grid-vue/src/VueComponentFactory.ts
import Vue from "vue";
var VueComponentFactory = class {
  static getComponentType(parent, component) {
    if (typeof component === "string") {
      const componentInstance = this.searchForComponentInstance(parent, component);
      if (!componentInstance) {
        console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
        return null;
      }
      return Vue.extend(componentInstance);
    } else {
      return component;
    }
  }
  static createAndMountComponent(params, componentType, parent) {
    const details = {
      data: {
        params: Object.freeze(params)
      },
      parent
    };
    if (parent.componentDependencies) {
      parent.componentDependencies.forEach(
        (dependency) => details[dependency] = parent[dependency]
      );
    }
    const component = new componentType(details);
    component.$mount();
    return component;
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
    if (!componentInstance && !suppressError) {
      console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
      return null;
    }
    return componentInstance;
  }
};

// packages/ag-grid-vue/src/VueFrameworkComponentWrapper.ts
var VueFrameworkComponentWrapper = class extends BaseComponentWrapper {
  constructor(parent) {
    super();
    this.parent = parent;
  }
  createWrapper(component) {
    const that = this;
    class DynamicComponent extends VueComponent {
      init(params) {
        super.init(params);
      }
      hasMethod(name) {
        return wrapper.getFrameworkComponentInstance()[name] != null;
      }
      callMethod(name, args) {
        const componentInstance = this.getFrameworkComponentInstance();
        const frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
        return frameworkComponentInstance[name].apply(componentInstance, args);
      }
      addMethod(name, callback) {
        wrapper[name] = callback;
      }
      overrideProcessing(methodName) {
        return that.parent.autoParamsRefresh && methodName === "refresh";
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
    const componentType = VueComponentFactory.getComponentType(this.parent, component);
    if (!componentType) {
      return;
    }
    return VueComponentFactory.createAndMountComponent(params, componentType, this.parent);
  }
  createMethodProxy(wrapper, methodName, mandatory) {
    return function() {
      if (wrapper.overrideProcessing(methodName)) {
        return wrapper.processMethod(methodName, arguments);
      }
      if (wrapper.hasMethod(methodName)) {
        return wrapper.callMethod(methodName, arguments);
      }
      if (mandatory) {
        console.warn("AG Grid: Framework component is missing the method " + methodName + "()");
      }
      return null;
    };
  }
  destroy() {
    this.parent = null;
  }
};
VueFrameworkComponentWrapper = __decorateClass([
  Bean("frameworkComponentWrapper")
], VueFrameworkComponentWrapper);
var VueComponent = class {
  getGui() {
    return this.component.$el;
  }
  destroy() {
    if (this.getFrameworkComponentInstance() && typeof this.getFrameworkComponentInstance().destroy === "function") {
      this.getFrameworkComponentInstance().destroy();
    }
    this.component.$destroy();
  }
  getFrameworkComponentInstance() {
    return this.component;
  }
  init(params) {
    this.component = this.createComponent(params);
  }
};

// packages/ag-grid-vue/src/Utils.ts
import { ComponentUtil } from "ag-grid-community";
var getAgGridProperties = () => {
  const props2 = {
    gridOptions: {
      default() {
        return {};
      }
    },
    rowDataModel: void 0
  };
  const SHALLOW_CHECK_PROPERTIES = ["context", "popupParent"];
  const DEEP_CHECK_PROPERTIES = ComponentUtil.ALL_PROPERTIES.filter((propertyName) => !SHALLOW_CHECK_PROPERTIES.includes(propertyName));
  const createPropsObject = (properties, component) => {
    const newProps = {};
    properties.forEach((propertyName) => {
      if (component[propertyName] === ComponentUtil.VUE_OMITTED_PROPERTY) {
        return;
      }
      newProps[propertyName] = component[propertyName];
    });
    return newProps;
  };
  const processPropsObject = (prev, current, component) => {
    if (!component.gridCreated || !component.api) {
      return;
    }
    const changes = {};
    Object.entries(current).forEach(([key, value]) => {
      if (prev[key] === value) {
        return;
      }
      changes[key] = value;
    });
    ComponentUtil.processOnChange(changes, component.api);
  };
  const computed2 = {
    props() {
      return createPropsObject(DEEP_CHECK_PROPERTIES, this);
    },
    shallowProps() {
      return createPropsObject(SHALLOW_CHECK_PROPERTIES, this);
    }
  };
  const watch2 = {
    rowDataModel(currentValue, previousValue) {
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
      ComponentUtil.processOnChange({ rowData: currentValue }, this.api);
    },
    props: {
      handler(currentValue, previousValue) {
        processPropsObject(previousValue, currentValue, this);
      },
      deep: true
    },
    // these props may be cyclic, so we don't deep check them.
    shallowProps: {
      handler(currentValue, previousValue) {
        processPropsObject(previousValue, currentValue, this);
      },
      deep: false
    }
  };
  ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
    props2[propertyName] = {
      default: ComponentUtil.VUE_OMITTED_PROPERTY
    };
  });
  const model2 = {
    prop: "rowDataModel",
    event: "data-model-changed"
  };
  return [props2, computed2, watch2, model2];
};

// packages/ag-grid-vue/src/VueFrameworkOverrides.ts
import { VanillaFrameworkOverrides } from "ag-grid-community";
var VueFrameworkOverrides = class extends VanillaFrameworkOverrides {
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
    let foundInstance = !!VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true);
    let result = foundInstance ? name : null;
    if (!result && components && components[name]) {
      const indirectName = components[name];
      foundInstance = !!VueComponentFactory.searchForComponentInstance(this.parent, indirectName, 10, true);
      result = foundInstance ? indirectName : null;
    }
    return result;
  }
  isFrameworkComponent(comp) {
    return typeof comp === "object";
  }
};

// packages/ag-grid-vue/src/AgGridVue.ts
var [props, computed, watch, model] = getAgGridProperties();
var AgGridVue = class extends Vue2 {
  constructor() {
    super(...arguments);
    this.gridCreated = false;
    this.isDestroyed = false;
    this.gridReadyFired = false;
    this.api = void 0;
    this.emitRowModel = null;
  }
  static kebabProperty(property) {
    return property.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
  // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
  render(h) {
    return h("div");
  }
  // It forces events defined in ALWAYS_SYNC_GLOBAL_EVENTS to be fired synchronously.
  // This is required for events such as GridPreDestroyed.
  // Other events are fired can be fired asynchronously or synchronously depending on config.
  globalEventListenerFactory(restrictToSyncOnly) {
    return (eventType, event) => {
      if (this.isDestroyed) {
        return;
      }
      if (eventType === "gridReady") {
        this.gridReadyFired = true;
      }
      const alwaysSync = ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
      if (alwaysSync && !restrictToSyncOnly || !alwaysSync && restrictToSyncOnly) {
        return;
      }
      this.updateModelIfUsed(eventType);
      const kebabName = AgGridVue.kebabProperty(eventType);
      if (this.$listeners[kebabName]) {
        this.$emit(kebabName, event);
      } else if (this.$listeners[eventType]) {
        this.$emit(eventType, event);
      }
    };
  }
  // noinspection JSUnusedGlobalSymbols
  mounted() {
    this.emitRowModel = this.debounce(() => {
      this.$emit("data-model-changed", Object.freeze(this.getRowData()));
    }, 20);
    const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
    const gridOptions = ComponentUtil2.combineAttributesAndGridOptions(this.gridOptions, this);
    this.checkForBindingConflicts();
    const rowData = this.getRowDataBasedOnBindings();
    if (rowData !== ComponentUtil2.VUE_OMITTED_PROPERTY) {
      gridOptions.rowData = rowData;
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
    this.api = createGrid(this.$el, gridOptions, gridParams);
    this.gridCreated = true;
  }
  // noinspection JSUnusedGlobalSymbols
  destroyed() {
    var _a;
    if (this.gridCreated) {
      (_a = this.api) == null ? void 0 : _a.destroy();
      this.isDestroyed = true;
    }
  }
  checkForBindingConflicts() {
    const thisAsAny = this;
    if ((thisAsAny.rowData || this.gridOptions.rowData) && thisAsAny.rowDataModel) {
      console.warn("AG Grid: Using both rowData and rowDataModel. rowData will be ignored.");
    }
  }
  getRowData() {
    var _a;
    const rowData = [];
    (_a = this.api) == null ? void 0 : _a.forEachNode((rowNode) => {
      rowData.push(rowNode.data);
    });
    return rowData;
  }
  updateModelIfUsed(eventType) {
    if (this.gridReadyFired && this.$listeners["data-model-changed"] && AgGridVue.ROW_DATA_EVENTS.has(eventType)) {
      if (this.emitRowModel) {
        this.emitRowModel();
      }
    }
  }
  getRowDataBasedOnBindings() {
    const thisAsAny = this;
    const rowDataModel = thisAsAny.rowDataModel;
    return rowDataModel ? rowDataModel : thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
  }
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
};
AgGridVue.ROW_DATA_EVENTS = /* @__PURE__ */ new Set(["rowDataUpdated", "cellValueChanged", "rowValueChanged"]);
__decorateClass([
  Prop(Boolean)
], AgGridVue.prototype, "autoParamsRefresh", 2);
__decorateClass([
  Prop({ default: () => [] })
], AgGridVue.prototype, "componentDependencies", 2);
__decorateClass([
  Prop({ default: () => [] })
], AgGridVue.prototype, "modules", 2);
AgGridVue = __decorateClass([
  Bean2("agGridVue"),
  Component({
    props,
    computed,
    watch,
    model
  })
], AgGridVue);
export {
  AgGridVue
};
