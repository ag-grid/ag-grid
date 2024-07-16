var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/multi-filter/src/multiFilterModule.ts
import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/multi-filter/src/multiFilter/multiFilter.ts
import {
  ProvidedFilter,
  AgPromise,
  Autowired,
  AgGroupComponent,
  TabGuardComp,
  AgMenuItemComponent,
  AgMenuItemRenderer,
  PostConstruct,
  _,
  KeyCode
} from "@ag-grid-community/core";
var _MultiFilter = class _MultiFilter extends TabGuardComp {
  constructor() {
    super(
      /* html */
      `<div class="ag-multi-filter ag-menu-list-compact"></div>`
    );
    this.filterDefs = [];
    this.filters = [];
    this.guiDestroyFuncs = [];
    // this could be the accordion/sub menu element depending on the display type
    this.filterGuis = [];
    this.activeFilterIndices = [];
    this.lastActivatedMenuItem = null;
    this.afterFiltersReadyFuncs = [];
  }
  postConstruct() {
    this.initialiseTabGuard({
      onFocusIn: (e) => this.onFocusIn(e)
    });
  }
  static getFilterDefs(params) {
    const { filters } = params;
    return filters && filters.length > 0 ? filters : [{ filter: "agTextColumnFilter" }, { filter: "agSetColumnFilter" }];
  }
  init(params) {
    this.params = params;
    this.filterDefs = _MultiFilter.getFilterDefs(params);
    const { column, filterChangedCallback } = params;
    this.column = column;
    this.filterChangedCallback = filterChangedCallback;
    const filterPromises = [];
    this.filterDefs.forEach((filterDef, index) => {
      const filterPromise = this.createFilter(filterDef, index);
      if (filterPromise != null) {
        filterPromises.push(filterPromise);
      }
    });
    return new AgPromise((resolve) => {
      AgPromise.all(filterPromises).then((filters) => {
        this.filters = filters;
        this.refreshGui("columnMenu").then(() => {
          resolve();
        });
      });
    }).then(() => {
      this.afterFiltersReadyFuncs.forEach((f) => f());
      this.afterFiltersReadyFuncs.length = 0;
    });
  }
  refreshGui(container) {
    if (container === this.lastOpenedInContainer) {
      return AgPromise.resolve();
    }
    this.removeAllChildrenExceptTabGuards();
    this.destroyChildren();
    return AgPromise.all(this.filters.map((filter, index) => {
      const filterDef = this.filterDefs[index];
      const filterTitle = this.getFilterTitle(filter, filterDef);
      let filterGuiPromise;
      if (filterDef.display === "subMenu" && container !== "toolPanel") {
        filterGuiPromise = this.insertFilterMenu(filter, filterTitle).then((menuItem) => menuItem.getGui());
      } else if (filterDef.display === "subMenu" || filterDef.display === "accordion") {
        const group = this.insertFilterGroup(filter, filterTitle);
        filterGuiPromise = AgPromise.resolve(group.getGui());
      } else {
        filterGuiPromise = AgPromise.resolve(filter.getGui());
      }
      return filterGuiPromise;
    })).then((filterGuis) => {
      filterGuis.forEach((filterGui, index) => {
        if (index > 0) {
          this.appendChild(_.loadTemplate(
            /* html */
            `<div class="ag-filter-separator"></div>`
          ));
        }
        this.appendChild(filterGui);
      });
      this.filterGuis = filterGuis;
      this.lastOpenedInContainer = container;
    });
  }
  getFilterTitle(filter, filterDef) {
    if (filterDef.title != null) {
      return filterDef.title;
    }
    return filter instanceof ProvidedFilter ? filter.getFilterTitle() : "Filter";
  }
  destroyChildren() {
    this.guiDestroyFuncs.forEach((func) => func());
    this.guiDestroyFuncs.length = 0;
    this.filterGuis.length = 0;
  }
  insertFilterMenu(filter, name) {
    const menuItem = this.createBean(new AgMenuItemComponent());
    return menuItem.init({
      menuItemDef: {
        name,
        subMenu: [],
        cssClasses: ["ag-multi-filter-menu-item"],
        menuItem: AgMenuItemRenderer,
        menuItemParams: {
          cssClassPrefix: "ag-compact-menu-option",
          isCompact: true
        }
      },
      level: 0,
      isAnotherSubMenuOpen: () => false,
      childComponent: filter,
      contextParams: {
        column: null,
        node: null,
        value: null
      }
    }).then(() => {
      menuItem.setParentComponent(this);
      this.guiDestroyFuncs.push(() => this.destroyBean(menuItem));
      this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, (event) => {
        if (this.lastActivatedMenuItem && this.lastActivatedMenuItem !== event.menuItem) {
          this.lastActivatedMenuItem.deactivate();
        }
        this.lastActivatedMenuItem = event.menuItem;
      });
      const menuItemGui = menuItem.getGui();
      menuItem.addManagedListener(menuItemGui, "keydown", (e) => {
        const { key } = e;
        switch (key) {
          case KeyCode.UP:
          case KeyCode.RIGHT:
          case KeyCode.DOWN:
          case KeyCode.LEFT:
            e.preventDefault();
            if (key === KeyCode.RIGHT) {
              menuItem.openSubMenu(true);
            }
            break;
        }
      });
      menuItem.addManagedListener(menuItemGui, "focusin", () => menuItem.activate());
      menuItem.addManagedListener(menuItemGui, "focusout", () => {
        if (!menuItem.isSubMenuOpen() && !menuItem.isSubMenuOpening()) {
          menuItem.deactivate();
        }
      });
      return menuItem;
    });
  }
  insertFilterGroup(filter, title) {
    const group = this.createBean(new AgGroupComponent({
      title,
      cssIdentifier: "multi-filter"
    }));
    this.guiDestroyFuncs.push(() => this.destroyBean(group));
    group.addItem(filter.getGui());
    group.toggleGroupExpand(false);
    if (filter.afterGuiAttached) {
      group.addManagedListener(group, AgGroupComponent.EVENT_EXPANDED, () => filter.afterGuiAttached({
        container: this.lastOpenedInContainer,
        suppressFocus: true,
        hidePopup: this.hidePopup
      }));
    }
    return group;
  }
  isFilterActive() {
    return this.filters.some((filter) => filter.isFilterActive());
  }
  getLastActiveFilterIndex() {
    return this.activeFilterIndices.length > 0 ? this.activeFilterIndices[this.activeFilterIndices.length - 1] : null;
  }
  doesFilterPass(params, filterToSkip) {
    let rowPasses = true;
    this.filters.forEach((filter) => {
      if (!rowPasses || filter === filterToSkip || !filter.isFilterActive()) {
        return;
      }
      rowPasses = filter.doesFilterPass(params);
    });
    return rowPasses;
  }
  getFilterType() {
    return "multi";
  }
  getModelFromUi() {
    const model = {
      filterType: this.getFilterType(),
      filterModels: this.filters.map((filter) => {
        const providedFilter = filter;
        if (typeof providedFilter.getModelFromUi === "function") {
          return providedFilter.getModelFromUi();
        }
        return null;
      })
    };
    return model;
  }
  getModel() {
    if (!this.isFilterActive()) {
      return null;
    }
    const model = {
      filterType: this.getFilterType(),
      filterModels: this.filters.map((filter) => {
        if (filter.isFilterActive()) {
          return filter.getModel();
        }
        return null;
      })
    };
    return model;
  }
  setModel(model) {
    const setFilterModel = (filter, filterModel) => {
      return new AgPromise((resolve) => {
        const promise = filter.setModel(filterModel);
        promise ? promise.then(() => resolve()) : resolve();
      });
    };
    let promises = [];
    if (model == null) {
      promises = this.filters.map((filter, index) => {
        const res = setFilterModel(filter, null).then(() => {
          this.updateActiveList(index);
        });
        return res;
      });
    } else {
      this.filters.forEach((filter, index) => {
        const filterModel = model.filterModels.length > index ? model.filterModels[index] : null;
        const res = setFilterModel(filter, filterModel).then(() => {
          this.updateActiveList(index);
        });
        promises.push(res);
      });
    }
    return AgPromise.all(promises).then(() => {
    });
  }
  applyModel(source = "api") {
    let result = false;
    this.filters.forEach((filter) => {
      if (filter instanceof ProvidedFilter) {
        result = filter.applyModel(source) || result;
      }
    });
    return result;
  }
  getChildFilterInstance(index) {
    return this.filters[index];
  }
  afterGuiAttached(params) {
    let refreshPromise;
    if (params) {
      this.hidePopup = params.hidePopup;
      refreshPromise = this.refreshGui(params.container);
    } else {
      this.hidePopup = void 0;
      refreshPromise = AgPromise.resolve();
    }
    refreshPromise.then(() => {
      const { filterDefs } = this;
      let hasFocused = false;
      if (filterDefs) {
        _.forEachReverse(filterDefs, (filterDef, index) => {
          var _a;
          const isFirst = index === 0;
          const suppressFocus = !isFirst || filterDef.display !== "inline";
          const afterGuiAttachedParams = __spreadProps(__spreadValues({}, params != null ? params : {}), { suppressFocus });
          const filter = (_a = this.filters) == null ? void 0 : _a[index];
          if (filter) {
            this.executeFunctionIfExistsOnFilter(filter, "afterGuiAttached", afterGuiAttachedParams);
            if (isFirst) {
              hasFocused = true;
            }
          }
          if (isFirst && suppressFocus) {
            const filterGui = this.filterGuis[index];
            if (filterGui) {
              filterGui.focus();
              hasFocused = true;
            }
          }
        });
      }
      const eDocument = this.gos.getDocument();
      const activeEl = this.gos.getActiveDomElement();
      if (!hasFocused && (!activeEl || activeEl === eDocument.body || this.getGui().contains(activeEl))) {
        this.forceFocusOutOfContainer(true);
      }
    });
  }
  afterGuiDetached() {
    this.executeFunctionIfExists("afterGuiDetached");
  }
  onAnyFilterChanged() {
    this.executeFunctionIfExists("onAnyFilterChanged");
  }
  onNewRowsLoaded() {
    this.executeFunctionIfExists("onNewRowsLoaded");
  }
  destroy() {
    this.filters.forEach((filter) => this.destroyBean(filter));
    this.filters.length = 0;
    this.destroyChildren();
    this.hidePopup = void 0;
    super.destroy();
  }
  executeFunctionIfExists(name, ...params) {
    _.forEachReverse(this.filters, (filter) => {
      this.executeFunctionIfExistsOnFilter(filter, name, params);
    });
  }
  executeFunctionIfExistsOnFilter(filter, name, ...params) {
    const func = filter[name];
    if (typeof func === "function") {
      func.apply(filter, params);
    }
  }
  createFilter(filterDef, index) {
    const { filterModifiedCallback, doesRowPassOtherFilter } = this.params;
    let filterInstance;
    const filterParams = __spreadProps(__spreadValues({}, this.filterManager.createFilterParams(this.column, this.column.getColDef())), {
      filterModifiedCallback,
      filterChangedCallback: (additionalEventAttributes) => {
        this.executeWhenAllFiltersReady(() => this.filterChanged(index, additionalEventAttributes));
      },
      doesRowPassOtherFilter: (node) => doesRowPassOtherFilter(node) && this.doesFilterPass({ node, data: node.data }, filterInstance)
    });
    const compDetails = this.userComponentFactory.getFilterDetails(filterDef, filterParams, "agTextColumnFilter");
    if (!compDetails) {
      return null;
    }
    const filterPromise = compDetails.newAgStackInstance();
    if (filterPromise) {
      filterPromise.then((filter) => filterInstance = filter);
    }
    return filterPromise;
  }
  executeWhenAllFiltersReady(action) {
    if (this.filters && this.filters.length > 0) {
      action();
    } else {
      this.afterFiltersReadyFuncs.push(action);
    }
  }
  updateActiveList(index) {
    const changedFilter = this.filters[index];
    _.removeFromArray(this.activeFilterIndices, index);
    if (changedFilter.isFilterActive()) {
      this.activeFilterIndices.push(index);
    }
  }
  filterChanged(index, additionalEventAttributes) {
    this.updateActiveList(index);
    this.filterChangedCallback(additionalEventAttributes);
    const changedFilter = this.filters[index];
    this.filters.forEach((filter) => {
      if (filter === changedFilter) {
        return;
      }
      if (typeof filter.onAnyFilterChanged === "function") {
        filter.onAnyFilterChanged();
      }
    });
  }
  onFocusIn(e) {
    if (this.lastActivatedMenuItem != null && !this.lastActivatedMenuItem.getGui().contains(e.target)) {
      this.lastActivatedMenuItem.deactivate();
      this.lastActivatedMenuItem = null;
    }
  }
  getModelAsString(model) {
    var _a, _b, _c, _d;
    if (!this.filters || !((_a = model == null ? void 0 : model.filterModels) == null ? void 0 : _a.length)) {
      return "";
    }
    const lastActiveIndex = (_b = this.getLastActiveFilterIndex()) != null ? _b : 0;
    const activeFilter = this.filters[lastActiveIndex];
    return (_d = (_c = activeFilter.getModelAsString) == null ? void 0 : _c.call(activeFilter, model.filterModels[lastActiveIndex])) != null ? _d : "";
  }
};
__decorateClass([
  Autowired("filterManager")
], _MultiFilter.prototype, "filterManager", 2);
__decorateClass([
  Autowired("userComponentFactory")
], _MultiFilter.prototype, "userComponentFactory", 2);
__decorateClass([
  PostConstruct
], _MultiFilter.prototype, "postConstruct", 1);
var MultiFilter = _MultiFilter;

// enterprise-modules/multi-filter/src/multiFilter/multiFloatingFilter.ts
import {
  Component,
  _ as _2,
  Autowired as Autowired2,
  AgPromise as AgPromise2
} from "@ag-grid-community/core";
var MultiFloatingFilterComp = class extends Component {
  constructor() {
    super(
      /* html */
      `<div class="ag-multi-floating-filter ag-floating-filter-input"></div>`
    );
    this.floatingFilters = [];
    this.compDetailsList = [];
  }
  init(params) {
    this.params = params;
    const { compDetailsList } = this.getCompDetailsList(params);
    return this.setParams(compDetailsList);
  }
  setParams(compDetailsList) {
    const floatingFilterPromises = [];
    compDetailsList.forEach((compDetails) => {
      const floatingFilterPromise = compDetails == null ? void 0 : compDetails.newAgStackInstance();
      if (floatingFilterPromise != null) {
        this.compDetailsList.push(compDetails);
        floatingFilterPromises.push(floatingFilterPromise);
      }
    });
    return AgPromise2.all(floatingFilterPromises).then((floatingFilters) => {
      floatingFilters.forEach((floatingFilter, index) => {
        this.floatingFilters.push(floatingFilter);
        const gui = floatingFilter.getGui();
        this.appendChild(gui);
        if (index > 0) {
          _2.setDisplayed(gui, false);
        }
      });
    });
  }
  onParamsUpdated(params) {
    this.refresh(params);
  }
  refresh(params) {
    this.params = params;
    const { compDetailsList: newCompDetailsList, floatingFilterParamsList } = this.getCompDetailsList(params);
    const allFloatingFilterCompsUnchanged = newCompDetailsList.length === this.compDetailsList.length && newCompDetailsList.every((newCompDetails, index) => !this.filterManager.areFilterCompsDifferent(this.compDetailsList[index], newCompDetails));
    if (allFloatingFilterCompsUnchanged) {
      floatingFilterParamsList.forEach((floatingFilterParams, index) => {
        var _a;
        const floatingFilter = this.floatingFilters[index];
        let hasRefreshed = false;
        if (floatingFilter.refresh) {
          const result = floatingFilter.refresh(floatingFilterParams);
          if (result !== null) {
            hasRefreshed = true;
          }
        }
        if (!hasRefreshed) {
          (_a = floatingFilter.onParamsUpdated) == null ? void 0 : _a.call(floatingFilter, floatingFilterParams);
        }
      });
    } else {
      _2.clearElement(this.getGui());
      this.destroyBeans(this.floatingFilters);
      this.floatingFilters = [];
      this.compDetailsList = [];
      this.setParams(newCompDetailsList);
    }
  }
  getCompDetailsList(params) {
    const compDetailsList = [];
    const floatingFilterParamsList = [];
    const filterParams = params.filterParams;
    MultiFilter.getFilterDefs(filterParams).forEach((filterDef, index) => {
      const floatingFilterParams = __spreadProps(__spreadValues({}, params), {
        // set the parent filter instance for each floating filter to the relevant child filter instance
        parentFilterInstance: (callback) => {
          this.parentMultiFilterInstance((parent) => {
            const child = parent.getChildFilterInstance(index);
            if (child == null) {
              return;
            }
            callback(child);
          });
        }
      });
      _2.mergeDeep(floatingFilterParams.filterParams, filterDef.filterParams);
      const compDetails = this.getCompDetails(filterDef, floatingFilterParams);
      if (compDetails) {
        compDetailsList.push(compDetails);
        floatingFilterParamsList.push(floatingFilterParams);
      }
    });
    return { compDetailsList, floatingFilterParamsList };
  }
  onParentModelChanged(model, event) {
    if (event && event.afterFloatingFilter) {
      return;
    }
    this.parentMultiFilterInstance((parent) => {
      if (model == null) {
        this.floatingFilters.forEach((filter, i) => {
          filter.onParentModelChanged(null, event);
          _2.setDisplayed(filter.getGui(), i === 0);
        });
      } else {
        const lastActiveFloatingFilterIndex = parent.getLastActiveFilterIndex();
        this.floatingFilters.forEach((filter, i) => {
          const filterModel = model.filterModels.length > i ? model.filterModels[i] : null;
          filter.onParentModelChanged(filterModel, event);
          const shouldShow = lastActiveFloatingFilterIndex == null ? i === 0 : i === lastActiveFloatingFilterIndex;
          _2.setDisplayed(filter.getGui(), shouldShow);
        });
      }
    });
  }
  destroy() {
    this.destroyBeans(this.floatingFilters);
    this.floatingFilters.length = 0;
    super.destroy();
  }
  getCompDetails(filterDef, params) {
    var _a;
    let defaultComponentName = (_a = this.userComponentFactory.getDefaultFloatingFilterType(
      filterDef,
      () => this.filterManager.getDefaultFloatingFilter(this.params.column)
    )) != null ? _a : "agReadOnlyFloatingFilter";
    return this.userComponentFactory.getFloatingFilterCompDetails(filterDef, params, defaultComponentName);
  }
  parentMultiFilterInstance(cb) {
    this.params.parentFilterInstance((parent) => {
      if (!(parent instanceof MultiFilter)) {
        throw new Error("AG Grid - MultiFloatingFilterComp expects MultiFilter as its parent");
      }
      cb(parent);
    });
  }
};
__decorateClass([
  Autowired2("userComponentFactory")
], MultiFloatingFilterComp.prototype, "userComponentFactory", 2);
__decorateClass([
  Autowired2("filterManager")
], MultiFloatingFilterComp.prototype, "filterManager", 2);

// enterprise-modules/multi-filter/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/multi-filter/src/multiFilterModule.ts
var MultiFilterModule = {
  version: VERSION,
  moduleName: ModuleNames.MultiFilterModule,
  beans: [],
  userComponents: [
    { componentName: "agMultiColumnFilter", componentClass: MultiFilter },
    { componentName: "agMultiColumnFloatingFilter", componentClass: MultiFloatingFilterComp }
  ],
  dependantModules: [
    EnterpriseCoreModule
  ]
};
export {
  MultiFilter,
  MultiFilterModule
};
