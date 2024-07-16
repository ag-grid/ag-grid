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

// enterprise-modules/status-bar/src/statusBarModule.ts
import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/status-bar/src/statusBar/statusBarService.ts
import { Bean, BeanStub } from "@ag-grid-community/core";
var StatusBarService = class extends BeanStub {
  // tslint:disable-next-line
  constructor() {
    super();
    this.allComponents = /* @__PURE__ */ new Map();
  }
  registerStatusPanel(key, component) {
    this.allComponents.set(key, component);
  }
  unregisterStatusPanel(key) {
    this.allComponents.delete(key);
  }
  unregisterAllComponents() {
    this.allComponents.clear();
  }
  getStatusPanel(key) {
    return this.allComponents.get(key);
  }
  destroy() {
    this.unregisterAllComponents();
    super.destroy();
  }
};
StatusBarService = __decorateClass([
  Bean("statusBarService")
], StatusBarService);

// enterprise-modules/status-bar/src/statusBar/statusBar.ts
import {
  Autowired,
  Component,
  PostConstruct,
  PreDestroy,
  AgPromise,
  RefSelector,
  _
} from "@ag-grid-community/core";
var _StatusBar = class _StatusBar extends Component {
  constructor() {
    super(_StatusBar.TEMPLATE);
    this.compDestroyFunctions = {};
  }
  postConstruct() {
    this.processStatusPanels(/* @__PURE__ */ new Map());
    this.addManagedPropertyListeners(["statusBar"], this.handleStatusBarChanged.bind(this));
  }
  processStatusPanels(existingStatusPanelsToReuse) {
    var _a;
    const statusPanels = (_a = this.gos.get("statusBar")) == null ? void 0 : _a.statusPanels;
    if (statusPanels) {
      const leftStatusPanelComponents = statusPanels.filter((componentConfig) => componentConfig.align === "left");
      this.createAndRenderComponents(leftStatusPanelComponents, this.eStatusBarLeft, existingStatusPanelsToReuse);
      const centerStatusPanelComponents = statusPanels.filter((componentConfig) => componentConfig.align === "center");
      this.createAndRenderComponents(centerStatusPanelComponents, this.eStatusBarCenter, existingStatusPanelsToReuse);
      const rightStatusPanelComponents = statusPanels.filter((componentConfig) => !componentConfig.align || componentConfig.align === "right");
      this.createAndRenderComponents(rightStatusPanelComponents, this.eStatusBarRight, existingStatusPanelsToReuse);
    } else {
      this.setDisplayed(false);
    }
  }
  handleStatusBarChanged() {
    var _a;
    const statusPanels = (_a = this.gos.get("statusBar")) == null ? void 0 : _a.statusPanels;
    const validStatusBarPanelsProvided = Array.isArray(statusPanels) && statusPanels.length > 0;
    this.setDisplayed(validStatusBarPanelsProvided);
    const existingStatusPanelsToReuse = /* @__PURE__ */ new Map();
    if (validStatusBarPanelsProvided) {
      statusPanels.forEach((statusPanelConfig) => {
        var _a2, _b;
        const key = (_a2 = statusPanelConfig.key) != null ? _a2 : statusPanelConfig.statusPanel;
        const existingStatusPanel = this.statusBarService.getStatusPanel(key);
        if (existingStatusPanel == null ? void 0 : existingStatusPanel.refresh) {
          const newParams = this.gos.addGridCommonParams((_b = statusPanelConfig.statusPanelParams) != null ? _b : {});
          const hasRefreshed = existingStatusPanel.refresh(newParams);
          if (hasRefreshed) {
            existingStatusPanelsToReuse.set(key, existingStatusPanel);
            delete this.compDestroyFunctions[key];
            _.removeFromParent(existingStatusPanel.getGui());
          }
        }
      });
    }
    this.resetStatusBar();
    if (validStatusBarPanelsProvided) {
      this.processStatusPanels(existingStatusPanelsToReuse);
    }
  }
  resetStatusBar() {
    this.eStatusBarLeft.innerHTML = "";
    this.eStatusBarCenter.innerHTML = "";
    this.eStatusBarRight.innerHTML = "";
    this.destroyComponents();
    this.statusBarService.unregisterAllComponents();
  }
  destroyComponents() {
    Object.values(this.compDestroyFunctions).forEach((func) => func());
    this.compDestroyFunctions = {};
  }
  createAndRenderComponents(statusBarComponents, ePanelComponent, existingStatusPanelsToReuse) {
    const componentDetails = [];
    statusBarComponents.forEach((componentConfig) => {
      const key = componentConfig.key || componentConfig.statusPanel;
      const existingStatusPanel = existingStatusPanelsToReuse.get(key);
      let promise;
      if (existingStatusPanel) {
        promise = AgPromise.resolve(existingStatusPanel);
      } else {
        const params = {};
        const compDetails = this.userComponentFactory.getStatusPanelCompDetails(componentConfig, params);
        promise = compDetails.newAgStackInstance();
        if (!promise) {
          return;
        }
      }
      componentDetails.push({
        key,
        promise
      });
    });
    AgPromise.all(componentDetails.map((details) => details.promise)).then(() => {
      componentDetails.forEach((componentDetail) => {
        componentDetail.promise.then((component) => {
          const destroyFunc = () => {
            this.getContext().destroyBean(component);
          };
          if (this.isAlive()) {
            this.statusBarService.registerStatusPanel(componentDetail.key, component);
            ePanelComponent.appendChild(component.getGui());
            this.compDestroyFunctions[componentDetail.key] = destroyFunc;
          } else {
            destroyFunc();
          }
        });
      });
    });
  }
};
_StatusBar.TEMPLATE = /* html */
`<div class="ag-status-bar">
            <div ref="eStatusBarLeft" class="ag-status-bar-left" role="status"></div>
            <div ref="eStatusBarCenter" class="ag-status-bar-center" role="status"></div>
            <div ref="eStatusBarRight" class="ag-status-bar-right" role="status"></div>
        </div>`;
__decorateClass([
  Autowired("userComponentFactory")
], _StatusBar.prototype, "userComponentFactory", 2);
__decorateClass([
  Autowired("statusBarService")
], _StatusBar.prototype, "statusBarService", 2);
__decorateClass([
  RefSelector("eStatusBarLeft")
], _StatusBar.prototype, "eStatusBarLeft", 2);
__decorateClass([
  RefSelector("eStatusBarCenter")
], _StatusBar.prototype, "eStatusBarCenter", 2);
__decorateClass([
  RefSelector("eStatusBarRight")
], _StatusBar.prototype, "eStatusBarRight", 2);
__decorateClass([
  PostConstruct
], _StatusBar.prototype, "postConstruct", 1);
__decorateClass([
  PreDestroy
], _StatusBar.prototype, "destroyComponents", 1);
var StatusBar = _StatusBar;

// enterprise-modules/status-bar/src/statusBar/providedPanels/nameValueComp.ts
import { Component as Component2, RefSelector as RefSelector2 } from "@ag-grid-community/core";
var _NameValueComp = class _NameValueComp extends Component2 {
  constructor() {
    super(_NameValueComp.TEMPLATE);
  }
  setLabel(key, defaultValue) {
    this.setDisplayed(false);
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
  }
  setValue(value) {
    this.eValue.innerHTML = value;
  }
};
_NameValueComp.TEMPLATE = /* html */
`<div class="ag-status-name-value">
            <span ref="eLabel"></span>:&nbsp;
            <span ref="eValue" class="ag-status-name-value-value"></span>
        </div>`;
__decorateClass([
  RefSelector2("eLabel")
], _NameValueComp.prototype, "eLabel", 2);
__decorateClass([
  RefSelector2("eValue")
], _NameValueComp.prototype, "eValue", 2);
var NameValueComp = _NameValueComp;

// enterprise-modules/status-bar/src/statusBar/providedPanels/totalAndFilteredRowsComp.ts
import {
  Autowired as Autowired2,
  Events,
  PostConstruct as PostConstruct2,
  _ as _2
} from "@ag-grid-community/core";
var TotalAndFilteredRowsComp = class extends NameValueComp {
  postConstruct() {
    if (this.rowModel.getType() !== "clientSide") {
      _2.warnOnce(`agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
      return;
    }
    this.setLabel("totalAndFilteredRows", "Rows");
    this.addCssClass("ag-status-panel");
    this.addCssClass("ag-status-panel-total-and-filtered-row-count");
    this.setDisplayed(true);
    this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
    this.onDataChanged();
  }
  onDataChanged() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const thousandSeparator = localeTextFunc("thousandSeparator", ",");
    const decimalSeparator = localeTextFunc("decimalSeparator", ".");
    const rowCount = _2.formatNumberCommas(this.getFilteredRowCountValue(), thousandSeparator, decimalSeparator);
    const totalRowCount = _2.formatNumberCommas(this.getTotalRowCount(), thousandSeparator, decimalSeparator);
    if (rowCount === totalRowCount) {
      this.setValue(rowCount);
    } else {
      const localeTextFunc2 = this.localeService.getLocaleTextFunc();
      this.setValue(`${rowCount} ${localeTextFunc2("of", "of")} ${totalRowCount}`);
    }
  }
  getFilteredRowCountValue() {
    let filteredRowCount = 0;
    this.rowModel.forEachNodeAfterFilter((node) => {
      if (!node.group) {
        filteredRowCount++;
      }
    });
    return filteredRowCount;
  }
  getTotalRowCount() {
    let totalRowCount = 0;
    this.rowModel.forEachNode((node) => {
      if (!node.group) {
        totalRowCount++;
      }
    });
    return totalRowCount;
  }
  init() {
  }
  refresh() {
    return true;
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
};
__decorateClass([
  Autowired2("rowModel")
], TotalAndFilteredRowsComp.prototype, "rowModel", 2);
__decorateClass([
  PostConstruct2
], TotalAndFilteredRowsComp.prototype, "postConstruct", 1);

// enterprise-modules/status-bar/src/statusBar/providedPanels/filteredRowsComp.ts
import {
  Autowired as Autowired3,
  Events as Events2,
  PostConstruct as PostConstruct3,
  _ as _3
} from "@ag-grid-community/core";
var FilteredRowsComp = class extends NameValueComp {
  postConstruct() {
    this.setLabel("filteredRows", "Filtered");
    if (this.rowModel.getType() !== "clientSide") {
      _3.warnOnce(`agFilteredRowCountComponent should only be used with the client side row model.`);
      return;
    }
    this.addCssClass("ag-status-panel");
    this.addCssClass("ag-status-panel-filtered-row-count");
    this.setDisplayed(true);
    const listener = this.onDataChanged.bind(this);
    this.addManagedListener(this.eventService, Events2.EVENT_MODEL_UPDATED, listener);
    listener();
  }
  onDataChanged() {
    const totalRowCountValue = this.getTotalRowCountValue();
    const filteredRowCountValue = this.getFilteredRowCountValue();
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const thousandSeparator = localeTextFunc("thousandSeparator", ",");
    const decimalSeparator = localeTextFunc("decimalSeparator", ".");
    this.setValue(_3.formatNumberCommas(filteredRowCountValue, thousandSeparator, decimalSeparator));
    this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
  }
  getTotalRowCountValue() {
    let totalRowCount = 0;
    this.rowModel.forEachNode((node) => totalRowCount += 1);
    return totalRowCount;
  }
  getFilteredRowCountValue() {
    let filteredRowCount = 0;
    this.rowModel.forEachNodeAfterFilter((node) => {
      if (!node.group) {
        filteredRowCount += 1;
      }
    });
    return filteredRowCount;
  }
  init() {
  }
  refresh() {
    return true;
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
};
__decorateClass([
  Autowired3("rowModel")
], FilteredRowsComp.prototype, "rowModel", 2);
__decorateClass([
  PostConstruct3
], FilteredRowsComp.prototype, "postConstruct", 1);

// enterprise-modules/status-bar/src/statusBar/providedPanels/totalRowsComp.ts
import { Autowired as Autowired4, Events as Events3, PostConstruct as PostConstruct4, _ as _4 } from "@ag-grid-community/core";
var TotalRowsComp = class extends NameValueComp {
  postConstruct() {
    this.setLabel("totalRows", "Total Rows");
    if (this.rowModel.getType() !== "clientSide") {
      _4.warnOnce("agTotalRowCountComponent should only be used with the client side row model.");
      return;
    }
    this.addCssClass("ag-status-panel");
    this.addCssClass("ag-status-panel-total-row-count");
    this.setDisplayed(true);
    this.addManagedListener(this.eventService, Events3.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
    this.onDataChanged();
  }
  onDataChanged() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const thousandSeparator = localeTextFunc("thousandSeparator", ",");
    const decimalSeparator = localeTextFunc("decimalSeparator", ".");
    this.setValue(_4.formatNumberCommas(this.getRowCountValue(), thousandSeparator, decimalSeparator));
  }
  getRowCountValue() {
    let totalRowCount = 0;
    this.rowModel.forEachLeafNode((node) => totalRowCount += 1);
    return totalRowCount;
  }
  init() {
  }
  refresh() {
    return true;
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
};
__decorateClass([
  Autowired4("rowModel")
], TotalRowsComp.prototype, "rowModel", 2);
__decorateClass([
  PostConstruct4
], TotalRowsComp.prototype, "postConstruct", 1);

// enterprise-modules/status-bar/src/statusBar/providedPanels/selectedRowsComp.ts
import { Autowired as Autowired5, Events as Events4, PostConstruct as PostConstruct5, _ as _5 } from "@ag-grid-community/core";
var SelectedRowsComp = class extends NameValueComp {
  postConstruct() {
    if (!this.isValidRowModel()) {
      console.warn(`AG Grid: agSelectedRowCountComponent should only be used with the client and server side row model.`);
      return;
    }
    this.setLabel("selectedRows", "Selected");
    this.addCssClass("ag-status-panel");
    this.addCssClass("ag-status-panel-selected-row-count");
    this.onRowSelectionChanged();
    const eventListener = this.onRowSelectionChanged.bind(this);
    this.addManagedListener(this.eventService, Events4.EVENT_MODEL_UPDATED, eventListener);
    this.addManagedListener(this.eventService, Events4.EVENT_SELECTION_CHANGED, eventListener);
  }
  isValidRowModel() {
    const rowModelType = this.rowModel.getType();
    return rowModelType === "clientSide" || rowModelType === "serverSide";
  }
  onRowSelectionChanged() {
    const selectedRowCount = this.selectionService.getSelectionCount();
    if (selectedRowCount < 0) {
      this.setValue("?");
      this.setDisplayed(true);
      return;
    }
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const thousandSeparator = localeTextFunc("thousandSeparator", ",");
    const decimalSeparator = localeTextFunc("decimalSeparator", ".");
    this.setValue(_5.formatNumberCommas(selectedRowCount, thousandSeparator, decimalSeparator));
    this.setDisplayed(selectedRowCount > 0);
  }
  init() {
  }
  refresh() {
    return true;
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
};
__decorateClass([
  Autowired5("rowModel")
], SelectedRowsComp.prototype, "rowModel", 2);
__decorateClass([
  Autowired5("selectionService")
], SelectedRowsComp.prototype, "selectionService", 2);
__decorateClass([
  PostConstruct5
], SelectedRowsComp.prototype, "postConstruct", 1);

// enterprise-modules/status-bar/src/statusBar/providedPanels/aggregationComp.ts
import {
  Autowired as Autowired6,
  Component as Component3,
  Events as Events5,
  PostConstruct as PostConstruct6,
  RefSelector as RefSelector3,
  _ as _6,
  Optional
} from "@ag-grid-community/core";
var _AggregationComp = class _AggregationComp extends Component3 {
  constructor() {
    super(_AggregationComp.TEMPLATE);
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
  postConstruct() {
    if (!this.isValidRowModel()) {
      console.warn(`AG Grid: agAggregationComponent should only be used with the client and server side row model.`);
      return;
    }
    this.avgAggregationComp.setLabel("avg", "Average");
    this.countAggregationComp.setLabel("count", "Count");
    this.minAggregationComp.setLabel("min", "Min");
    this.maxAggregationComp.setLabel("max", "Max");
    this.sumAggregationComp.setLabel("sum", "Sum");
    this.addManagedListener(this.eventService, Events5.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
    this.addManagedListener(this.eventService, Events5.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
  }
  isValidRowModel() {
    const rowModelType = this.rowModel.getType();
    return rowModelType === "clientSide" || rowModelType === "serverSide";
  }
  init(params) {
    this.params = params;
  }
  refresh(params) {
    this.params = params;
    this.onRangeSelectionChanged();
    return true;
  }
  setAggregationComponentValue(aggFuncName, value, visible) {
    var _a;
    const statusBarValueComponent = this.getAllowedAggregationValueComponent(aggFuncName);
    if (_6.exists(statusBarValueComponent) && statusBarValueComponent) {
      const localeTextFunc = this.localeService.getLocaleTextFunc();
      const thousandSeparator = localeTextFunc("thousandSeparator", ",");
      const decimalSeparator = localeTextFunc("decimalSeparator", ".");
      statusBarValueComponent.setValue(_6.formatNumberTwoDecimalPlacesAndCommas(value, thousandSeparator, decimalSeparator));
      statusBarValueComponent.setDisplayed(visible);
    } else {
      (_a = this.getAggregationValueComponent(aggFuncName)) == null ? void 0 : _a.setDisplayed(false);
    }
  }
  getAllowedAggregationValueComponent(aggFuncName) {
    const { aggFuncs } = this.params;
    if (!aggFuncs || aggFuncs.includes(aggFuncName)) {
      return this.getAggregationValueComponent(aggFuncName);
    }
    return null;
  }
  getAggregationValueComponent(aggFuncName) {
    const refComponentName = `${aggFuncName}AggregationComp`;
    return this[refComponentName];
  }
  onRangeSelectionChanged() {
    var _a;
    const cellRanges = (_a = this.rangeService) == null ? void 0 : _a.getCellRanges();
    let sum = 0;
    let count = 0;
    let numberCount = 0;
    let min = null;
    let max = null;
    const cellsSoFar = {};
    if (cellRanges && !_6.missingOrEmpty(cellRanges) && this.rangeService) {
      for (let i = 0; i < cellRanges.length; i++) {
        const cellRange = cellRanges[i];
        let currentRow = this.rangeService.getRangeStartRow(cellRange);
        const lastRow = this.rangeService.getRangeEndRow(cellRange);
        while (true) {
          const finishedAllRows = _6.missing(currentRow) || !currentRow || this.rowPositionUtils.before(lastRow, currentRow);
          if (finishedAllRows || !currentRow || !cellRange.columns) {
            break;
          }
          cellRange.columns.forEach((col) => {
            if (currentRow === null) {
              return;
            }
            const cellId = this.cellPositionUtils.createId({
              rowPinned: currentRow.rowPinned,
              column: col,
              rowIndex: currentRow.rowIndex
            });
            if (cellsSoFar[cellId]) {
              return;
            }
            cellsSoFar[cellId] = true;
            const rowNode = this.rowPositionUtils.getRowNode(currentRow);
            if (_6.missing(rowNode)) {
              return;
            }
            let value = this.valueService.getValue(col, rowNode);
            if (_6.missing(value) || value === "") {
              return;
            }
            count++;
            if (typeof value === "object" && "value" in value) {
              value = value.value;
              if (value === "") {
                return;
              }
            }
            if (typeof value === "string") {
              value = Number(value);
            }
            if (typeof value === "number" && !isNaN(value)) {
              sum += value;
              if (max === null || value > max) {
                max = value;
              }
              if (min === null || value < min) {
                min = value;
              }
              numberCount++;
            }
          });
          currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
      }
      ;
    }
    const gotResult = count > 1;
    const gotNumberResult = numberCount > 1;
    this.setAggregationComponentValue("count", count, gotResult);
    this.setAggregationComponentValue("sum", sum, gotNumberResult);
    this.setAggregationComponentValue("min", min, gotNumberResult);
    this.setAggregationComponentValue("max", max, gotNumberResult);
    this.setAggregationComponentValue("avg", sum / numberCount, gotNumberResult);
  }
};
_AggregationComp.TEMPLATE = /* html */
`<div class="ag-status-panel ag-status-panel-aggregations">
            <ag-name-value ref="avgAggregationComp"></ag-name-value>
            <ag-name-value ref="countAggregationComp"></ag-name-value>
            <ag-name-value ref="minAggregationComp"></ag-name-value>
            <ag-name-value ref="maxAggregationComp"></ag-name-value>
            <ag-name-value ref="sumAggregationComp"></ag-name-value>
        </div>`;
__decorateClass([
  Optional("rangeService")
], _AggregationComp.prototype, "rangeService", 2);
__decorateClass([
  Autowired6("valueService")
], _AggregationComp.prototype, "valueService", 2);
__decorateClass([
  Autowired6("cellNavigationService")
], _AggregationComp.prototype, "cellNavigationService", 2);
__decorateClass([
  Autowired6("rowModel")
], _AggregationComp.prototype, "rowModel", 2);
__decorateClass([
  Autowired6("cellPositionUtils")
], _AggregationComp.prototype, "cellPositionUtils", 2);
__decorateClass([
  Autowired6("rowPositionUtils")
], _AggregationComp.prototype, "rowPositionUtils", 2);
__decorateClass([
  RefSelector3("sumAggregationComp")
], _AggregationComp.prototype, "sumAggregationComp", 2);
__decorateClass([
  RefSelector3("countAggregationComp")
], _AggregationComp.prototype, "countAggregationComp", 2);
__decorateClass([
  RefSelector3("minAggregationComp")
], _AggregationComp.prototype, "minAggregationComp", 2);
__decorateClass([
  RefSelector3("maxAggregationComp")
], _AggregationComp.prototype, "maxAggregationComp", 2);
__decorateClass([
  RefSelector3("avgAggregationComp")
], _AggregationComp.prototype, "avgAggregationComp", 2);
__decorateClass([
  PostConstruct6
], _AggregationComp.prototype, "postConstruct", 1);
var AggregationComp = _AggregationComp;

// enterprise-modules/status-bar/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/status-bar/src/statusBarModule.ts
var StatusBarModule = {
  version: VERSION,
  moduleName: ModuleNames.StatusBarModule,
  beans: [StatusBarService],
  agStackComponents: [
    { componentName: "AgStatusBar", componentClass: StatusBar },
    { componentName: "AgNameValue", componentClass: NameValueComp }
  ],
  userComponents: [
    { componentName: "agAggregationComponent", componentClass: AggregationComp },
    { componentName: "agSelectedRowCountComponent", componentClass: SelectedRowsComp },
    { componentName: "agTotalRowCountComponent", componentClass: TotalRowsComp },
    { componentName: "agFilteredRowCountComponent", componentClass: FilteredRowsComp },
    { componentName: "agTotalAndFilteredRowCountComponent", componentClass: TotalAndFilteredRowsComp }
  ],
  dependantModules: [
    EnterpriseCoreModule
  ]
};
export {
  StatusBarModule
};
