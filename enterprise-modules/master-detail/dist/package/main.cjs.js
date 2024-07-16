var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/master-detail/src/main.ts
var main_exports = {};
__export(main_exports, {
  MasterDetailModule: () => MasterDetailModule
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/master-detail/src/masterDetailModule.ts
var import_core3 = require("@ag-grid-community/core");
var import_core4 = require("@ag-grid-enterprise/core");

// enterprise-modules/master-detail/src/masterDetail/detailCellRenderer.ts
var import_core2 = require("@ag-grid-community/core");

// enterprise-modules/master-detail/src/masterDetail/detailCellRendererCtrl.ts
var import_core = require("@ag-grid-community/core");
var DetailCellRendererCtrl = class extends import_core.BeanStub {
  constructor() {
    super(...arguments);
    this.loadRowDataVersion = 0;
  }
  init(comp, params) {
    this.params = params;
    this.comp = comp;
    const doNothingBecauseInsidePinnedSection = params.pinned != null;
    if (doNothingBecauseInsidePinnedSection) {
      return;
    }
    this.setAutoHeightClasses();
    this.setupRefreshStrategy();
    this.addThemeToDetailGrid();
    this.createDetailGrid();
    this.loadRowData();
    this.addManagedListener(this.eventService, import_core.Events.EVENT_FULL_WIDTH_ROW_FOCUSED, this.onFullWidthRowFocused.bind(this));
  }
  onFullWidthRowFocused(e) {
    const params = this.params;
    const row = { rowIndex: params.node.rowIndex, rowPinned: params.node.rowPinned };
    const eventRow = { rowIndex: e.rowIndex, rowPinned: e.rowPinned };
    const isSameRow = this.rowPositionUtils.sameRow(row, eventRow);
    if (!isSameRow) {
      return;
    }
    this.focusService.focusInto(this.comp.getGui(), e.fromBelow);
  }
  setAutoHeightClasses() {
    const autoHeight = this.gos.get("detailRowAutoHeight");
    const parentClass = autoHeight ? "ag-details-row-auto-height" : "ag-details-row-fixed-height";
    const detailClass = autoHeight ? "ag-details-grid-auto-height" : "ag-details-grid-fixed-height";
    this.comp.addOrRemoveCssClass(parentClass, true);
    this.comp.addOrRemoveDetailGridCssClass(detailClass, true);
  }
  setupRefreshStrategy() {
    const providedStrategy = this.params.refreshStrategy;
    const validSelection = providedStrategy == "everything" || providedStrategy == "nothing" || providedStrategy == "rows";
    if (validSelection) {
      this.refreshStrategy = providedStrategy;
      return;
    }
    if (providedStrategy != null) {
      console.warn("AG Grid: invalid cellRendererParams.refreshStrategy = '" + providedStrategy + "' supplied, defaulting to refreshStrategy = 'rows'.");
    }
    this.refreshStrategy = "rows";
  }
  addThemeToDetailGrid() {
    const { theme } = this.environment.getTheme();
    if (theme) {
      this.comp.addOrRemoveDetailGridCssClass(theme, true);
    }
  }
  createDetailGrid() {
    if (import_core._.missing(this.params.detailGridOptions)) {
      console.warn("AG Grid: could not find detail grid options for master detail, please set gridOptions.detailCellRendererParams.detailGridOptions");
      return;
    }
    const autoHeight = this.gos.get("detailRowAutoHeight");
    const gridOptions = __spreadValues({}, this.params.detailGridOptions);
    if (autoHeight) {
      gridOptions.domLayout = "autoHeight";
    }
    this.comp.setDetailGrid(gridOptions);
  }
  registerDetailWithMaster(api, columnApi) {
    const rowId = this.params.node.id;
    const masterGridApi = this.params.api;
    const gridInfo = {
      id: rowId,
      api,
      columnApi
    };
    const rowNode = this.params.node;
    if (masterGridApi.isDestroyed()) {
      return;
    }
    masterGridApi.addDetailGridInfo(rowId, gridInfo);
    rowNode.detailGridInfo = gridInfo;
    this.addDestroyFunc(() => {
      if (rowNode.detailGridInfo !== gridInfo) {
        return;
      }
      if (!masterGridApi.isDestroyed()) {
        masterGridApi.removeDetailGridInfo(rowId);
      }
      rowNode.detailGridInfo = null;
    });
  }
  loadRowData() {
    var _a, _b, _c;
    this.loadRowDataVersion++;
    const versionThisCall = this.loadRowDataVersion;
    if (((_a = this.params.detailGridOptions) == null ? void 0 : _a.rowModelType) === "serverSide") {
      const node = this.params.node;
      (_c = (_b = node.detailGridInfo) == null ? void 0 : _b.api) == null ? void 0 : _c.refreshServerSide({ purge: true });
      return;
    }
    const userFunc = this.params.getDetailRowData;
    if (!userFunc) {
      console.warn("AG Grid: could not find getDetailRowData for master / detail, please set gridOptions.detailCellRendererParams.getDetailRowData");
      return;
    }
    const successCallback = (rowData) => {
      const mostRecentCall = this.loadRowDataVersion === versionThisCall;
      if (mostRecentCall) {
        this.comp.setRowData(rowData);
      }
    };
    const funcParams = {
      node: this.params.node,
      // we take data from node, rather than params.data
      // as the data could have been updated with new instance
      data: this.params.node.data,
      successCallback,
      context: this.gos.getGridCommonParams().context
    };
    userFunc(funcParams);
  }
  refresh() {
    const GET_GRID_TO_REFRESH = false;
    const GET_GRID_TO_DO_NOTHING = true;
    switch (this.refreshStrategy) {
      case "nothing":
        return GET_GRID_TO_DO_NOTHING;
      case "everything":
        return GET_GRID_TO_REFRESH;
    }
    this.loadRowData();
    return GET_GRID_TO_DO_NOTHING;
  }
};
__decorateClass([
  (0, import_core.Autowired)("rowPositionUtils")
], DetailCellRendererCtrl.prototype, "rowPositionUtils", 2);
__decorateClass([
  (0, import_core.Autowired)("focusService")
], DetailCellRendererCtrl.prototype, "focusService", 2);

// enterprise-modules/master-detail/src/masterDetail/detailCellRenderer.ts
var _DetailCellRenderer = class _DetailCellRenderer extends import_core2.Component {
  init(params) {
    this.params = params;
    this.selectAndSetTemplate();
    const compProxy = {
      addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
      addOrRemoveDetailGridCssClass: (cssClassName, on) => this.eDetailGrid.classList.toggle(cssClassName, on),
      setDetailGrid: (gridOptions) => this.setDetailGrid(gridOptions),
      setRowData: (rowData) => this.setRowData(rowData),
      getGui: () => this.eDetailGrid
    };
    this.ctrl = this.createManagedBean(new DetailCellRendererCtrl());
    this.ctrl.init(compProxy, params);
  }
  refresh() {
    return this.ctrl && this.ctrl.refresh();
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
  selectAndSetTemplate() {
    if (this.params.pinned) {
      this.setTemplate('<div class="ag-details-row"></div>');
      return;
    }
    const setDefaultTemplate = () => {
      this.setTemplate(_DetailCellRenderer.TEMPLATE);
    };
    if (import_core2._.missing(this.params.template)) {
      setDefaultTemplate();
    } else {
      if (typeof this.params.template === "string") {
        this.setTemplate(this.params.template);
      } else if (typeof this.params.template === "function") {
        const templateFunc = this.params.template;
        const template = templateFunc(this.params);
        this.setTemplate(template);
      } else {
        console.warn("AG Grid: detailCellRendererParams.template should be function or string");
        setDefaultTemplate();
      }
    }
    if (this.eDetailGrid == null) {
      console.warn('AG Grid: reference to eDetailGrid was missing from the details template. Please add ref="eDetailGrid" to the template.');
    }
  }
  setDetailGrid(gridOptions) {
    if (!this.eDetailGrid) {
      return;
    }
    const agGridReact = this.context.getBean("agGridReact");
    const agGridReactCloned = agGridReact ? import_core2._.cloneObject(agGridReact) : void 0;
    const frameworkComponentWrapper = this.context.getBean("frameworkComponentWrapper");
    const frameworkOverrides = this.getFrameworkOverrides();
    const api = (0, import_core2.createGrid)(this.eDetailGrid, gridOptions, {
      frameworkOverrides,
      providedBeanInstances: {
        agGridReact: agGridReactCloned,
        frameworkComponentWrapper
      },
      modules: import_core2.ModuleRegistry.__getGridRegisteredModules(this.params.api.getGridId())
    });
    this.detailApi = api;
    this.ctrl.registerDetailWithMaster(api, new import_core2.ColumnApi(api));
    this.addDestroyFunc(() => {
      api == null ? void 0 : api.destroy();
    });
  }
  setRowData(rowData) {
    this.detailApi && this.detailApi.setGridOption("rowData", rowData);
  }
};
_DetailCellRenderer.TEMPLATE = /* html */
`<div class="ag-details-row" role="gridcell">
            <div ref="eDetailGrid" class="ag-details-grid" role="presentation"></div>
        </div>`;
__decorateClass([
  (0, import_core2.RefSelector)("eDetailGrid")
], _DetailCellRenderer.prototype, "eDetailGrid", 2);
var DetailCellRenderer = _DetailCellRenderer;

// enterprise-modules/master-detail/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/master-detail/src/masterDetailModule.ts
var MasterDetailModule = {
  version: VERSION,
  moduleName: import_core3.ModuleNames.MasterDetailModule,
  beans: [],
  userComponents: [
    { componentName: "agDetailCellRenderer", componentClass: DetailCellRenderer }
  ],
  controllers: [
    { controllerName: "detailCellRenderer", controllerClass: DetailCellRendererCtrl }
  ],
  dependantModules: [
    import_core4.EnterpriseCoreModule
  ]
};
