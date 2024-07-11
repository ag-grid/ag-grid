// enterprise-modules/status-bar/src/statusBarModule.ts
import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/status-bar/src/statusBar/providedPanels/aggregationComp.ts
import {
  Component as Component2,
  RefPlaceholder as RefPlaceholder2,
  _exists,
  _formatNumberTwoDecimalPlacesAndCommas,
  _missing,
  _missingOrEmpty,
  _warnOnce
} from "@ag-grid-community/core";

// enterprise-modules/status-bar/src/statusBar/providedPanels/agNameValue.ts
import { Component, RefPlaceholder } from "@ag-grid-community/core";
var AgNameValue = class extends Component {
  constructor() {
    super(
      /* html */
      `<div class="ag-status-name-value">
            <span data-ref="eLabel"></span>:&nbsp;
            <span data-ref="eValue" class="ag-status-name-value-value"></span>
        </div>`
    );
    this.eLabel = RefPlaceholder;
    this.eValue = RefPlaceholder;
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
var AgNameValueSelector = {
  selector: "AG-NAME-VALUE",
  component: AgNameValue
};

// enterprise-modules/status-bar/src/statusBar/providedPanels/aggregationComp.ts
var AggregationComp = class extends Component2 {
  constructor() {
    super(
      /* html */
      `<div class="ag-status-panel ag-status-panel-aggregations">
            <ag-name-value data-ref="avgAggregationComp"></ag-name-value>
            <ag-name-value data-ref="countAggregationComp"></ag-name-value>
            <ag-name-value data-ref="minAggregationComp"></ag-name-value>
            <ag-name-value data-ref="maxAggregationComp"></ag-name-value>
            <ag-name-value data-ref="sumAggregationComp"></ag-name-value>
        </div>`,
      [AgNameValueSelector]
    );
    this.sumAggregationComp = RefPlaceholder2;
    this.countAggregationComp = RefPlaceholder2;
    this.minAggregationComp = RefPlaceholder2;
    this.maxAggregationComp = RefPlaceholder2;
    this.avgAggregationComp = RefPlaceholder2;
  }
  wireBeans(beans) {
    this.valueService = beans.valueService;
    this.cellNavigationService = beans.cellNavigationService;
    this.rowModel = beans.rowModel;
    this.cellPositionUtils = beans.cellPositionUtils;
    this.rowPositionUtils = beans.rowPositionUtils;
    this.rangeService = beans.rangeService;
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
  postConstruct() {
    if (!this.isValidRowModel()) {
      _warnOnce(`agAggregationComponent should only be used with the client and server side row model.`);
      return;
    }
    this.avgAggregationComp.setLabel("avg", "Average");
    this.countAggregationComp.setLabel("count", "Count");
    this.minAggregationComp.setLabel("min", "Min");
    this.maxAggregationComp.setLabel("max", "Max");
    this.sumAggregationComp.setLabel("sum", "Sum");
    this.addManagedEventListeners({
      rangeSelectionChanged: this.onRangeSelectionChanged.bind(this),
      modelUpdated: this.onRangeSelectionChanged.bind(this)
    });
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
    const statusBarValueComponent = this.getAllowedAggregationValueComponent(aggFuncName);
    if (_exists(statusBarValueComponent) && statusBarValueComponent) {
      const localeTextFunc = this.localeService.getLocaleTextFunc();
      const thousandSeparator = localeTextFunc("thousandSeparator", ",");
      const decimalSeparator = localeTextFunc("decimalSeparator", ".");
      statusBarValueComponent.setValue(
        _formatNumberTwoDecimalPlacesAndCommas(value, thousandSeparator, decimalSeparator)
      );
      statusBarValueComponent.setDisplayed(visible);
    } else {
      this.getAggregationValueComponent(aggFuncName)?.setDisplayed(false);
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
    const cellRanges = this.rangeService?.getCellRanges();
    let sum = 0;
    let count = 0;
    let numberCount = 0;
    let min = null;
    let max = null;
    const cellsSoFar = {};
    if (cellRanges && !_missingOrEmpty(cellRanges) && this.rangeService) {
      for (let i = 0; i < cellRanges.length; i++) {
        const cellRange = cellRanges[i];
        let currentRow = this.rangeService.getRangeStartRow(cellRange);
        const lastRow = this.rangeService.getRangeEndRow(cellRange);
        while (true) {
          const finishedAllRows = _missing(currentRow) || !currentRow || this.rowPositionUtils.before(lastRow, currentRow);
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
            if (_missing(rowNode)) {
              return;
            }
            let value = this.valueService.getValue(col, rowNode);
            if (_missing(value) || value === "") {
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

// enterprise-modules/status-bar/src/statusBar/providedPanels/filteredRowsComp.ts
import { _formatNumberCommas, _warnOnce as _warnOnce2 } from "@ag-grid-community/core";
var FilteredRowsComp = class extends AgNameValue {
  wireBeans(beans) {
    this.rowModel = beans.rowModel;
  }
  postConstruct() {
    this.setLabel("filteredRows", "Filtered");
    if (this.rowModel.getType() !== "clientSide") {
      _warnOnce2(`agFilteredRowCountComponent should only be used with the client side row model.`);
      return;
    }
    this.addCssClass("ag-status-panel");
    this.addCssClass("ag-status-panel-filtered-row-count");
    this.setDisplayed(true);
    const listener = this.onDataChanged.bind(this);
    this.addManagedEventListeners({ modelUpdated: listener });
    listener();
  }
  onDataChanged() {
    const totalRowCountValue = this.getTotalRowCountValue();
    const filteredRowCountValue = this.getFilteredRowCountValue();
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const thousandSeparator = localeTextFunc("thousandSeparator", ",");
    const decimalSeparator = localeTextFunc("decimalSeparator", ".");
    this.setValue(_formatNumberCommas(filteredRowCountValue, thousandSeparator, decimalSeparator));
    this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
  }
  getTotalRowCountValue() {
    let totalRowCount = 0;
    this.rowModel.forEachNode(() => totalRowCount += 1);
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

// enterprise-modules/status-bar/src/statusBar/providedPanels/selectedRowsComp.ts
import { _formatNumberCommas as _formatNumberCommas2, _warnOnce as _warnOnce3 } from "@ag-grid-community/core";
var SelectedRowsComp = class extends AgNameValue {
  wireBeans(beans) {
    this.rowModel = beans.rowModel;
    this.selectionService = beans.selectionService;
  }
  postConstruct() {
    if (!this.isValidRowModel()) {
      _warnOnce3(`agSelectedRowCountComponent should only be used with the client and server side row model.`);
      return;
    }
    this.setLabel("selectedRows", "Selected");
    this.addCssClass("ag-status-panel");
    this.addCssClass("ag-status-panel-selected-row-count");
    this.onRowSelectionChanged();
    const eventListener = this.onRowSelectionChanged.bind(this);
    this.addManagedEventListeners({ modelUpdated: eventListener, selectionChanged: eventListener });
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
    this.setValue(_formatNumberCommas2(selectedRowCount, thousandSeparator, decimalSeparator));
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

// enterprise-modules/status-bar/src/statusBar/providedPanels/totalAndFilteredRowsComp.ts
import { _formatNumberCommas as _formatNumberCommas3, _warnOnce as _warnOnce4 } from "@ag-grid-community/core";
var TotalAndFilteredRowsComp = class extends AgNameValue {
  wireBeans(beans) {
    this.rowModel = beans.rowModel;
  }
  postConstruct() {
    if (this.rowModel.getType() !== "clientSide") {
      _warnOnce4(`agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
      return;
    }
    this.setLabel("totalAndFilteredRows", "Rows");
    this.addCssClass("ag-status-panel");
    this.addCssClass("ag-status-panel-total-and-filtered-row-count");
    this.setDisplayed(true);
    this.addManagedEventListeners({ modelUpdated: this.onDataChanged.bind(this) });
    this.onDataChanged();
  }
  onDataChanged() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const thousandSeparator = localeTextFunc("thousandSeparator", ",");
    const decimalSeparator = localeTextFunc("decimalSeparator", ".");
    const rowCount = _formatNumberCommas3(this.getFilteredRowCountValue(), thousandSeparator, decimalSeparator);
    const totalRowCount = _formatNumberCommas3(this.getTotalRowCount(), thousandSeparator, decimalSeparator);
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

// enterprise-modules/status-bar/src/statusBar/providedPanels/totalRowsComp.ts
import { _formatNumberCommas as _formatNumberCommas4, _warnOnce as _warnOnce5 } from "@ag-grid-community/core";
var TotalRowsComp = class extends AgNameValue {
  wireBeans(beans) {
    this.rowModel = beans.rowModel;
  }
  postConstruct() {
    this.setLabel("totalRows", "Total Rows");
    if (this.rowModel.getType() !== "clientSide") {
      _warnOnce5("agTotalRowCountComponent should only be used with the client side row model.");
      return;
    }
    this.addCssClass("ag-status-panel");
    this.addCssClass("ag-status-panel-total-row-count");
    this.setDisplayed(true);
    this.addManagedEventListeners({ modelUpdated: this.onDataChanged.bind(this) });
    this.onDataChanged();
  }
  onDataChanged() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const thousandSeparator = localeTextFunc("thousandSeparator", ",");
    const decimalSeparator = localeTextFunc("decimalSeparator", ".");
    this.setValue(_formatNumberCommas4(this.getRowCountValue(), thousandSeparator, decimalSeparator));
  }
  getRowCountValue() {
    let totalRowCount = 0;
    this.rowModel.forEachLeafNode(() => totalRowCount += 1);
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

// enterprise-modules/status-bar/src/statusBar/statusBarApi.ts
import { _unwrapUserComp } from "@ag-grid-community/core";
function getStatusPanel(beans, key) {
  const comp = beans.statusBarService.getStatusPanel(key);
  return _unwrapUserComp(comp);
}

// enterprise-modules/status-bar/src/statusBar/statusBarService.ts
import { BeanStub } from "@ag-grid-community/core";

// enterprise-modules/status-bar/src/statusBar/agStatusBar.ts
import { AgPromise, Component as Component3, RefPlaceholder as RefPlaceholder3, _removeFromParent } from "@ag-grid-community/core";
var AgStatusBar = class extends Component3 {
  constructor() {
    super(
      /* html */
      `<div class="ag-status-bar">
            <div data-ref="eStatusBarLeft" class="ag-status-bar-left" role="status"></div>
            <div data-ref="eStatusBarCenter" class="ag-status-bar-center" role="status"></div>
            <div data-ref="eStatusBarRight" class="ag-status-bar-right" role="status"></div>
        </div>`
    );
    this.updateQueued = false;
    this.panelsPromise = AgPromise.resolve();
    this.eStatusBarLeft = RefPlaceholder3;
    this.eStatusBarCenter = RefPlaceholder3;
    this.eStatusBarRight = RefPlaceholder3;
    this.compDestroyFunctions = {};
  }
  wireBeans(beans) {
    this.userComponentFactory = beans.userComponentFactory;
    this.statusBarService = beans.statusBarService;
  }
  postConstruct() {
    this.processStatusPanels(/* @__PURE__ */ new Map());
    this.addManagedPropertyListeners(["statusBar"], this.handleStatusBarChanged.bind(this));
  }
  processStatusPanels(existingStatusPanelsToReuse) {
    const statusPanels = this.gos.get("statusBar")?.statusPanels;
    if (statusPanels) {
      const leftStatusPanelComponents = statusPanels.filter(
        (componentConfig) => componentConfig.align === "left"
      );
      const centerStatusPanelComponents = statusPanels.filter(
        (componentConfig) => componentConfig.align === "center"
      );
      const rightStatusPanelComponents = statusPanels.filter(
        (componentConfig) => !componentConfig.align || componentConfig.align === "right"
      );
      this.panelsPromise = AgPromise.all([
        this.createAndRenderComponents(
          leftStatusPanelComponents,
          this.eStatusBarLeft,
          existingStatusPanelsToReuse
        ),
        this.createAndRenderComponents(
          centerStatusPanelComponents,
          this.eStatusBarCenter,
          existingStatusPanelsToReuse
        ),
        this.createAndRenderComponents(
          rightStatusPanelComponents,
          this.eStatusBarRight,
          existingStatusPanelsToReuse
        )
      ]);
    } else {
      this.setDisplayed(false);
    }
  }
  handleStatusBarChanged() {
    if (this.updateQueued) {
      return;
    }
    this.updateQueued = true;
    this.panelsPromise.then(() => {
      this.updateStatusBar();
      this.updateQueued = false;
    });
  }
  updateStatusBar() {
    const statusPanels = this.gos.get("statusBar")?.statusPanels;
    const validStatusBarPanelsProvided = Array.isArray(statusPanels) && statusPanels.length > 0;
    this.setDisplayed(validStatusBarPanelsProvided);
    const existingStatusPanelsToReuse = /* @__PURE__ */ new Map();
    if (validStatusBarPanelsProvided) {
      statusPanels.forEach((statusPanelConfig) => {
        const key = statusPanelConfig.key ?? statusPanelConfig.statusPanel;
        const existingStatusPanel = this.statusBarService.getStatusPanel(key);
        if (existingStatusPanel?.refresh) {
          const newParams = this.gos.addGridCommonParams(statusPanelConfig.statusPanelParams ?? {});
          const hasRefreshed = existingStatusPanel.refresh(newParams);
          if (hasRefreshed) {
            existingStatusPanelsToReuse.set(key, existingStatusPanel);
            delete this.compDestroyFunctions[key];
            _removeFromParent(existingStatusPanel.getGui());
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
  destroy() {
    this.destroyComponents();
    super.destroy();
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
        if (promise == null) {
          return;
        }
      }
      componentDetails.push({
        key,
        promise
      });
    });
    return AgPromise.all(componentDetails.map((details) => details.promise)).then(() => {
      componentDetails.forEach((componentDetail) => {
        componentDetail.promise.then((component) => {
          const destroyFunc = () => {
            this.destroyBean(component);
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
var AgStatusBarSelector = {
  selector: "AG-STATUS-BAR",
  component: AgStatusBar
};

// enterprise-modules/status-bar/src/statusBar/statusBarService.ts
var StatusBarService = class extends BeanStub {
  // tslint:disable-next-line
  constructor() {
    super();
    this.beanName = "statusBarService";
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
  getStatusPanelSelector() {
    return AgStatusBarSelector;
  }
  destroy() {
    this.unregisterAllComponents();
    super.destroy();
  }
};

// enterprise-modules/status-bar/src/version.ts
var VERSION = "32.0.0";

// enterprise-modules/status-bar/src/statusBarModule.ts
var StatusBarCoreModule = {
  version: VERSION,
  moduleName: `${ModuleNames.StatusBarModule}-core`,
  beans: [StatusBarService],
  userComponents: [
    { name: "agAggregationComponent", classImp: AggregationComp },
    { name: "agSelectedRowCountComponent", classImp: SelectedRowsComp },
    { name: "agTotalRowCountComponent", classImp: TotalRowsComp },
    { name: "agFilteredRowCountComponent", classImp: FilteredRowsComp },
    { name: "agTotalAndFilteredRowCountComponent", classImp: TotalAndFilteredRowsComp }
  ],
  dependantModules: [EnterpriseCoreModule]
};
var StatusBarApiModule = {
  version: VERSION,
  moduleName: `${ModuleNames.StatusBarModule}-api`,
  apiFunctions: {
    getStatusPanel
  },
  dependantModules: [StatusBarCoreModule]
};
var StatusBarModule = {
  version: VERSION,
  moduleName: ModuleNames.StatusBarModule,
  dependantModules: [StatusBarCoreModule, StatusBarApiModule]
};
export {
  StatusBarModule
};
