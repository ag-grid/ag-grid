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

// enterprise-modules/master-detail/src/main.ts
var main_exports = {};
__export(main_exports, {
  MasterDetailModule: () => MasterDetailModule
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/master-detail/src/masterDetailModule.ts
var import_core4 = require("@ag-grid-community/core");
var import_core5 = require("@ag-grid-enterprise/core");

// enterprise-modules/master-detail/src/masterDetail/detailCellRenderer.ts
var import_core2 = require("@ag-grid-community/core");

// enterprise-modules/master-detail/src/masterDetail/detailCellRendererCtrl.ts
var import_core = require("@ag-grid-community/core");
var DetailCellRendererCtrl = class extends import_core.BeanStub {
  constructor() {
    super(...arguments);
    this.loadRowDataVersion = 0;
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
    this.rowPositionUtils = beans.rowPositionUtils;
    this.environment = beans.environment;
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
    this.addManagedEventListeners({ fullWidthRowFocused: this.onFullWidthRowFocused.bind(this) });
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
      (0, import_core._warnOnce)(
        "invalid cellRendererParams.refreshStrategy = '" + providedStrategy + "' supplied, defaulting to refreshStrategy = 'rows'."
      );
    }
    this.refreshStrategy = "rows";
  }
  addThemeToDetailGrid() {
    for (const themeClass of this.environment.getThemeClasses()) {
      this.comp.addOrRemoveDetailGridCssClass(themeClass, true);
    }
  }
  createDetailGrid() {
    if ((0, import_core._missing)(this.params.detailGridOptions)) {
      (0, import_core._warnOnce)(
        "could not find detail grid options for master detail, please set gridOptions.detailCellRendererParams.detailGridOptions"
      );
      return;
    }
    const autoHeight = this.gos.get("detailRowAutoHeight");
    const gridOptions = { ...this.params.detailGridOptions };
    if (autoHeight) {
      gridOptions.domLayout = "autoHeight";
    }
    this.comp.setDetailGrid(gridOptions);
  }
  registerDetailWithMaster(api) {
    const rowId = this.params.node.id;
    const masterGridApi = this.params.api;
    const gridInfo = {
      id: rowId,
      api
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
    this.loadRowDataVersion++;
    const versionThisCall = this.loadRowDataVersion;
    if (this.params.detailGridOptions?.rowModelType === "serverSide") {
      const node = this.params.node;
      node.detailGridInfo?.api?.refreshServerSide({ purge: true });
      return;
    }
    const userFunc = this.params.getDetailRowData;
    if (!userFunc) {
      (0, import_core._warnOnce)(
        "could not find getDetailRowData for master / detail, please set gridOptions.detailCellRendererParams.getDetailRowData"
      );
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

// enterprise-modules/master-detail/src/masterDetail/detailCellRenderer.ts
var DetailCellRenderer = class extends import_core2.Component {
  constructor() {
    super(...arguments);
    this.eDetailGrid = import_core2.RefPlaceholder;
  }
  wireBeans(beans) {
    this.context = beans.context;
  }
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
      this.setTemplate(
        /* html*/
        `<div class="ag-details-row"></div>`
      );
      return;
    }
    const setDefaultTemplate = () => {
      this.setTemplate(
        /* html */
        `<div class="ag-details-row" role="gridcell">
                <div data-ref="eDetailGrid" class="ag-details-grid" role="presentation"></div>
            </div>`
      );
    };
    if ((0, import_core2._missing)(this.params.template)) {
      setDefaultTemplate();
    } else {
      if (typeof this.params.template === "string") {
        this.setTemplate(this.params.template, []);
      } else if (typeof this.params.template === "function") {
        const templateFunc = this.params.template;
        const template = templateFunc(this.params);
        this.setTemplate(template, []);
      } else {
        (0, import_core2._warnOnce)("detailCellRendererParams.template should be function or string");
        setDefaultTemplate();
      }
    }
    if (this.eDetailGrid == null) {
      (0, import_core2._warnOnce)(
        'Reference to eDetailGrid was missing from the details template. Please add data-ref="eDetailGrid" to the template.'
      );
    }
  }
  setDetailGrid(gridOptions) {
    if (!this.eDetailGrid) {
      return;
    }
    const agGridReact = this.context.getBean("agGridReact");
    const agGridReactCloned = agGridReact ? (0, import_core2._cloneObject)(agGridReact) : void 0;
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
    this.ctrl.registerDetailWithMaster(api);
    this.addDestroyFunc(() => {
      api?.destroy();
    });
  }
  setRowData(rowData) {
    this.detailApi && this.detailApi.setGridOption("rowData", rowData);
  }
};

// enterprise-modules/master-detail/src/masterDetail/detailGridApiService.ts
var import_core3 = require("@ag-grid-community/core");
var DetailGridApiService = class extends import_core3.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "detailGridApiService";
    this.detailGridInfoMap = {};
  }
  addDetailGridInfo(id, gridInfo) {
    this.detailGridInfoMap[id] = gridInfo;
  }
  removeDetailGridInfo(id) {
    delete this.detailGridInfoMap[id];
  }
  getDetailGridInfo(id) {
    return this.detailGridInfoMap[id];
  }
  forEachDetailGridInfo(callback) {
    let index = 0;
    (0, import_core3._iterateObject)(this.detailGridInfoMap, (id, gridInfo) => {
      if ((0, import_core3._exists)(gridInfo)) {
        callback(gridInfo, index);
        index++;
      }
    });
  }
  destroy() {
    this.detailGridInfoMap = {};
    super.destroy();
  }
};

// enterprise-modules/master-detail/src/masterDetail/masterDetailApi.ts
function addDetailGridInfo(beans, id, gridInfo) {
  beans.detailGridApiService?.addDetailGridInfo(id, gridInfo);
}
function removeDetailGridInfo(beans, id) {
  beans.detailGridApiService?.removeDetailGridInfo(id);
}
function getDetailGridInfo(beans, id) {
  return beans.detailGridApiService?.getDetailGridInfo(id);
}
function forEachDetailGridInfo(beans, callback) {
  beans.detailGridApiService?.forEachDetailGridInfo(callback);
}

// enterprise-modules/master-detail/src/version.ts
var VERSION = "32.0.0";

// enterprise-modules/master-detail/src/masterDetailModule.ts
var MasterDetailCoreModule = {
  version: VERSION,
  moduleName: `${import_core4.ModuleNames.MasterDetailModule}-core`,
  userComponents: [
    {
      name: "agGroupRowRenderer",
      classImp: import_core5.GroupCellRenderer
    },
    {
      name: "agGroupCellRenderer",
      classImp: import_core5.GroupCellRenderer
    },
    { name: "agDetailCellRenderer", classImp: DetailCellRenderer }
  ],
  controllers: [
    { name: "detailCellRenderer", classImp: DetailCellRendererCtrl },
    { name: "groupCellRendererCtrl", classImp: import_core5.GroupCellRendererCtrl }
  ],
  dependantModules: [import_core5.EnterpriseCoreModule]
};
var MasterDetailApiModule = {
  version: VERSION,
  moduleName: `${import_core4.ModuleNames.MasterDetailModule}-api`,
  beans: [DetailGridApiService],
  apiFunctions: {
    addDetailGridInfo,
    removeDetailGridInfo,
    getDetailGridInfo,
    forEachDetailGridInfo
  },
  dependantModules: [MasterDetailCoreModule]
};
var MasterDetailModule = {
  version: VERSION,
  moduleName: import_core4.ModuleNames.MasterDetailModule,
  dependantModules: [MasterDetailCoreModule]
};
//# sourceMappingURL=main.cjs.js.map
