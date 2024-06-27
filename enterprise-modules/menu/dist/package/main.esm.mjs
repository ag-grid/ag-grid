// enterprise-modules/menu/src/menuModule.ts
import { ModuleNames as ModuleNames5, _CommunityMenuApiModule } from "@ag-grid-community/core";
import { AgMenuItemRenderer, EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/menu/src/menu/chartMenuItemMapper.ts
import { BeanStub, ModuleNames, ModuleRegistry, _createIconNoSpan, _warnOnce } from "@ag-grid-community/core";
var ChartMenuItemMapper = class _ChartMenuItemMapper extends BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "chartMenuItemMapper";
  }
  wireBeans(beans) {
    this.chartService = beans.chartService;
  }
  getChartItems(key) {
    if (!this.chartService) {
      ModuleRegistry.__assertRegistered(
        ModuleNames.GridChartsModule,
        `the Context Menu key "${key}"`,
        this.gridId
      );
      return void 0;
    }
    const builder = key === "pivotChart" ? new PivotMenuItemMapper(this.gos, this.chartService, this.localeService) : new RangeMenuItemMapper(this.gos, this.chartService, this.localeService);
    const isEnterprise = this.chartService.isEnterprise();
    let topLevelMenuItem = builder.getMenuItem();
    if (topLevelMenuItem && topLevelMenuItem.subMenu && !isEnterprise) {
      const filterEnterpriseItems = (m) => ({
        ...m,
        subMenu: m.subMenu?.filter((menu) => !menu._enterprise).map((menu) => filterEnterpriseItems(menu))
      });
      topLevelMenuItem = filterEnterpriseItems(topLevelMenuItem);
    }
    const chartGroupsDef = this.gos.get("chartToolPanelsDef")?.settingsPanel?.chartGroupsDef;
    if (chartGroupsDef) {
      topLevelMenuItem = _ChartMenuItemMapper.filterAndOrderChartMenu(
        topLevelMenuItem,
        chartGroupsDef,
        builder.getConfigLookup()
      );
    }
    return this.cleanInternals(topLevelMenuItem);
  }
  // Remove our internal _key and _enterprise properties so this does not leak out of the class on the menu items.
  cleanInternals(menuItem) {
    if (!menuItem) {
      return menuItem;
    }
    const removeKeys = (m) => {
      delete m?._key;
      delete m?._enterprise;
      m?.subMenu?.forEach((s) => removeKeys(s));
      return m;
    };
    return removeKeys(menuItem);
  }
  static buildLookup(menuItem) {
    const itemLookup = {};
    const addItem = (item) => {
      itemLookup[item._key] = item;
      if (item.subMenu) {
        item.subMenu.forEach((s) => addItem(s));
      }
    };
    addItem(menuItem);
    return itemLookup;
  }
  /**
   * Make the MenuItem match the charts provided and their ordering on the ChartGroupsDef config object as provided by the user.
   */
  static filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, configLookup) {
    const menuItemLookup = this.buildLookup(topLevelMenuItem);
    const orderedAndFiltered = { ...topLevelMenuItem, subMenu: [] };
    Object.entries(chartGroupsDef).forEach(([group, chartTypes]) => {
      const chartConfigGroup = configLookup[group];
      if (chartConfigGroup === null)
        return;
      if (chartConfigGroup == void 0) {
        _warnOnce(`invalid chartGroupsDef config '${group}'`);
        return void 0;
      }
      const menuItem = menuItemLookup[chartConfigGroup._key];
      if (menuItem) {
        if (menuItem.subMenu) {
          const subMenus = chartTypes.map((chartType) => {
            const itemKey = chartConfigGroup[chartType];
            if (itemKey == void 0) {
              _warnOnce(`invalid chartGroupsDef config '${group}.${chartType}'`);
              return void 0;
            }
            return menuItemLookup[itemKey];
          }).filter((s) => s !== void 0);
          if (subMenus.length > 0) {
            menuItem.subMenu = subMenus;
            orderedAndFiltered.subMenu?.push(menuItem);
          }
        } else {
          orderedAndFiltered.subMenu?.push(menuItem);
        }
      }
    });
    if (orderedAndFiltered.subMenu?.length == 0) {
      return void 0;
    }
    return orderedAndFiltered;
  }
};
var PivotMenuItemMapper = class {
  constructor(gos, chartService, localeService) {
    this.gos = gos;
    this.chartService = chartService;
    this.localeService = localeService;
  }
  getMenuItem() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const getMenuItem = (localeKey, defaultText, chartType, key, enterprise = false) => {
      return {
        name: localeTextFunc(localeKey, defaultText),
        action: () => this.chartService.createPivotChart({ chartType }),
        _key: key,
        _enterprise: enterprise
      };
    };
    return {
      name: localeTextFunc("pivotChart", "Pivot Chart"),
      _key: "pivotChart",
      subMenu: [
        {
          _key: "pivotColumnChart",
          name: localeTextFunc("columnChart", "Column"),
          subMenu: [
            getMenuItem("groupedColumn", "Grouped&lrm;", "groupedColumn", "pivotGroupedColumn"),
            getMenuItem("stackedColumn", "Stacked&lrm;", "stackedColumn", "pivotStackedColumn"),
            getMenuItem(
              "normalizedColumn",
              "100% Stacked&lrm;",
              "normalizedColumn",
              "pivotNormalizedColumn"
            )
          ]
        },
        {
          _key: "pivotBarChart",
          name: localeTextFunc("barChart", "Bar"),
          subMenu: [
            getMenuItem("groupedBar", "Grouped&lrm;", "groupedBar", "pivotGroupedBar"),
            getMenuItem("stackedBar", "Stacked&lrm;", "stackedBar", "pivotStackedBar"),
            getMenuItem("normalizedBar", "100% Stacked&lrm;", "normalizedBar", "pivotNormalizedBar")
          ]
        },
        {
          _key: "pivotPieChart",
          name: localeTextFunc("pieChart", "Pie"),
          subMenu: [
            getMenuItem("pie", "Pie&lrm;", "pie", "pivotPie"),
            getMenuItem("donut", "Donut&lrm;", "donut", "pivotDonut")
          ]
        },
        getMenuItem("line", "Line&lrm;", "line", "pivotLineChart"),
        {
          _key: "pivotXYChart",
          name: localeTextFunc("xyChart", "X Y (Scatter)"),
          subMenu: [
            getMenuItem("scatter", "Scatter&lrm;", "scatter", "pivotScatter"),
            getMenuItem("bubble", "Bubble&lrm;", "bubble", "pivotBubble")
          ]
        },
        {
          _key: "pivotAreaChart",
          name: localeTextFunc("areaChart", "Area"),
          subMenu: [
            getMenuItem("area", "Area&lrm;", "area", "pivotArea"),
            getMenuItem("stackedArea", "Stacked&lrm;", "stackedArea", "pivotStackedArea"),
            getMenuItem("normalizedArea", "100% Stacked&lrm;", "normalizedArea", "pivotNormalizedArea")
          ]
        },
        {
          _key: "pivotStatisticalChart",
          _enterprise: false,
          // histogram chart is available in both community and enterprise distributions
          name: localeTextFunc("statisticalChart", "Statistical"),
          subMenu: [getMenuItem("histogramChart", "Histogram&lrm;", "histogram", "pivotHistogram", false)]
        },
        {
          _key: "pivotHierarchicalChart",
          _enterprise: true,
          name: localeTextFunc("hierarchicalChart", "Hierarchical"),
          subMenu: [
            getMenuItem("treemapChart", "Treemap&lrm;", "treemap", "pivotTreemap", true),
            getMenuItem("sunburstChart", "Sunburst&lrm;", "sunburst", "pivotSunburst", true)
          ]
        },
        {
          _key: "pivotCombinationChart",
          name: localeTextFunc("combinationChart", "Combination"),
          subMenu: [
            getMenuItem("columnLineCombo", "Column & Line&lrm;", "columnLineCombo", "pivotColumnLineCombo"),
            getMenuItem("AreaColumnCombo", "Area & Column&lrm;", "areaColumnCombo", "pivotAreaColumnCombo")
          ]
        }
      ],
      icon: _createIconNoSpan("chart", this.gos, void 0)
    };
  }
  getConfigLookup() {
    return {
      columnGroup: {
        _key: "pivotColumnChart",
        column: "pivotGroupedColumn",
        stackedColumn: "pivotStackedColumn",
        normalizedColumn: "pivotNormalizedColumn"
      },
      barGroup: {
        _key: "pivotBarChart",
        bar: "pivotGroupedBar",
        stackedBar: "pivotStackedBar",
        normalizedBar: "pivotNormalizedBar"
      },
      pieGroup: {
        _key: "pivotPieChart",
        pie: "pivotPie",
        donut: "pivotDonut",
        doughnut: "pivotDonut"
      },
      lineGroup: {
        _key: "pivotLineChart",
        line: "pivotLineChart"
      },
      scatterGroup: {
        _key: "pivotXYChart",
        bubble: "pivotBubble",
        scatter: "pivotScatter"
      },
      areaGroup: {
        _key: "pivotAreaChart",
        area: "pivotArea",
        stackedArea: "pivotStackedArea",
        normalizedArea: "pivotNormalizedArea"
      },
      combinationGroup: {
        _key: "pivotCombinationChart",
        columnLineCombo: "pivotColumnLineCombo",
        areaColumnCombo: "pivotAreaColumnCombo",
        customCombo: null
        // Not currently supported
      },
      hierarchicalGroup: {
        _key: "pivotHierarchicalChart",
        treemap: "pivotTreemap",
        sunburst: "pivotSunburst"
      },
      statisticalGroup: {
        _key: "pivotStatisticalChart",
        histogram: "pivotHistogram",
        // Some statistical charts do not currently support pivot mode
        rangeBar: null,
        rangeArea: null,
        boxPlot: null
      },
      // Polar charts do not support pivot mode
      polarGroup: null,
      // Specialized charts do not currently support pivot mode
      specializedGroup: null
    };
  }
};
var RangeMenuItemMapper = class {
  constructor(gos, chartService, localeService) {
    this.gos = gos;
    this.chartService = chartService;
    this.localeService = localeService;
  }
  getMenuItem() {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const getMenuItem = (localeKey, defaultText, chartType, key, enterprise = false) => {
      return {
        name: localeTextFunc(localeKey, defaultText),
        action: () => this.chartService.createChartFromCurrentRange(chartType),
        _key: key,
        _enterprise: enterprise
      };
    };
    return {
      name: localeTextFunc("chartRange", "Chart Range"),
      _key: "chartRange",
      subMenu: [
        {
          name: localeTextFunc("columnChart", "Column"),
          subMenu: [
            getMenuItem("groupedColumn", "Grouped&lrm;", "groupedColumn", "rangeGroupedColumn"),
            getMenuItem("stackedColumn", "Stacked&lrm;", "stackedColumn", "rangeStackedColumn"),
            getMenuItem(
              "normalizedColumn",
              "100% Stacked&lrm;",
              "normalizedColumn",
              "rangeNormalizedColumn"
            )
          ],
          _key: "rangeColumnChart"
        },
        {
          name: localeTextFunc("barChart", "Bar"),
          subMenu: [
            getMenuItem("groupedBar", "Grouped&lrm;", "groupedBar", "rangeGroupedBar"),
            getMenuItem("stackedBar", "Stacked&lrm;", "stackedBar", "rangeStackedBar"),
            getMenuItem("normalizedBar", "100% Stacked&lrm;", "normalizedBar", "rangeNormalizedBar")
          ],
          _key: "rangeBarChart"
        },
        {
          name: localeTextFunc("pieChart", "Pie"),
          subMenu: [
            getMenuItem("pie", "Pie&lrm;", "pie", "rangePie"),
            getMenuItem("donut", "Donut&lrm;", "donut", "rangeDonut")
          ],
          _key: "rangePieChart"
        },
        getMenuItem("line", "Line&lrm;", "line", "rangeLineChart"),
        {
          name: localeTextFunc("xyChart", "X Y (Scatter)"),
          subMenu: [
            getMenuItem("scatter", "Scatter&lrm;", "scatter", "rangeScatter"),
            getMenuItem("bubble", "Bubble&lrm;", "bubble", "rangeBubble")
          ],
          _key: "rangeXYChart"
        },
        {
          name: localeTextFunc("areaChart", "Area"),
          subMenu: [
            getMenuItem("area", "Area&lrm;", "area", "rangeArea"),
            getMenuItem("stackedArea", "Stacked&lrm;", "stackedArea", "rangeStackedArea"),
            getMenuItem("normalizedArea", "100% Stacked&lrm;", "normalizedArea", "rangeNormalizedArea")
          ],
          _key: "rangeAreaChart"
        },
        {
          name: localeTextFunc("polarChart", "Polar"),
          subMenu: [
            getMenuItem("radarLine", "Radar Line&lrm;", "radarLine", "rangeRadarLine"),
            getMenuItem("radarArea", "Radar Area&lrm;", "radarArea", "rangeRadarArea"),
            getMenuItem("nightingale", "Nightingale&lrm;", "nightingale", "rangeNightingale"),
            getMenuItem("radialColumn", "Radial Column&lrm;", "radialColumn", "rangeRadialColumn"),
            getMenuItem("radialBar", "Radial Bar&lrm;", "radialBar", "rangeRadialBar")
          ],
          _key: "rangePolarChart",
          _enterprise: true
        },
        {
          name: localeTextFunc("statisticalChart", "Statistical"),
          subMenu: [
            getMenuItem("boxPlot", "Box Plot&lrm;", "boxPlot", "rangeBoxPlot", true),
            getMenuItem("histogramChart", "Histogram&lrm;", "histogram", "rangeHistogram", false),
            getMenuItem("rangeBar", "Range Bar&lrm;", "rangeBar", "rangeRangeBar", true),
            getMenuItem("rangeArea", "Range Area&lrm;", "rangeArea", "rangeRangeArea", true)
          ],
          _key: "rangeStatisticalChart",
          _enterprise: false
          // histogram chart is available in both community and enterprise distributions
        },
        {
          name: localeTextFunc("hierarchicalChart", "Hierarchical"),
          subMenu: [
            getMenuItem("treemap", "Treemap&lrm;", "treemap", "rangeTreemap"),
            getMenuItem("sunburst", "Sunburst&lrm;", "sunburst", "rangeSunburst")
          ],
          _key: "rangeHierarchicalChart",
          _enterprise: true
        },
        {
          name: localeTextFunc("specializedChart", "Specialized"),
          subMenu: [
            getMenuItem("heatmap", "Heatmap&lrm;", "heatmap", "rangeHeatmap"),
            getMenuItem("waterfall", "Waterfall&lrm;", "waterfall", "rangeWaterfall")
          ],
          _key: "rangeSpecializedChart",
          _enterprise: true
        },
        {
          name: localeTextFunc("combinationChart", "Combination"),
          subMenu: [
            getMenuItem("columnLineCombo", "Column & Line&lrm;", "columnLineCombo", "rangeColumnLineCombo"),
            getMenuItem("AreaColumnCombo", "Area & Column&lrm;", "areaColumnCombo", "rangeAreaColumnCombo")
          ],
          _key: "rangeCombinationChart"
        }
      ],
      icon: _createIconNoSpan("chart", this.gos, void 0)
    };
  }
  getConfigLookup() {
    return {
      columnGroup: {
        _key: "rangeColumnChart",
        column: "rangeGroupedColumn",
        stackedColumn: "rangeStackedColumn",
        normalizedColumn: "rangeNormalizedColumn"
      },
      barGroup: {
        _key: "rangeBarChart",
        bar: "rangeGroupedBar",
        stackedBar: "rangeStackedBar",
        normalizedBar: "rangeNormalizedBar"
      },
      pieGroup: {
        _key: "rangePieChart",
        pie: "rangePie",
        donut: "rangeDonut",
        doughnut: "rangeDonut"
      },
      lineGroup: {
        _key: "rangeLineChart",
        line: "rangeLineChart"
      },
      scatterGroup: {
        _key: "rangeXYChart",
        bubble: "rangeBubble",
        scatter: "rangeScatter"
      },
      areaGroup: {
        _key: "rangeAreaChart",
        area: "rangeArea",
        stackedArea: "rangeStackedArea",
        normalizedArea: "rangeNormalizedArea"
      },
      polarGroup: {
        _key: "rangePolarChart",
        radarLine: "rangeRadarLine",
        radarArea: "rangeRadarArea",
        nightingale: "rangeNightingale",
        radialColumn: "rangeRadialColumn",
        radialBar: "rangeRadialBar"
      },
      statisticalGroup: {
        _key: "rangeStatisticalChart",
        boxPlot: "rangeBoxPlot",
        histogram: "rangeHistogram",
        rangeBar: "rangeRangeBar",
        rangeArea: "rangeRangeArea"
      },
      hierarchicalGroup: {
        _key: "rangeHierarchicalChart",
        treemap: "rangeTreemap",
        sunburst: "rangeSunburst"
      },
      specializedGroup: {
        _key: "rangeSpecializedChart",
        heatmap: "rangeHeatmap",
        waterfall: "rangeWaterfall"
      },
      combinationGroup: {
        _key: "rangeCombinationChart",
        columnLineCombo: "rangeColumnLineCombo",
        areaColumnCombo: "rangeAreaColumnCombo",
        customCombo: null
        // Not currently supported
      }
    };
  }
};

// enterprise-modules/menu/src/menu/columnChooserFactory.ts
import { BeanStub as BeanStub2 } from "@ag-grid-community/core";
import { AgPrimaryCols } from "@ag-grid-enterprise/column-tool-panel";
import { AgDialog } from "@ag-grid-enterprise/core";
var ColumnChooserFactory = class extends BeanStub2 {
  constructor() {
    super(...arguments);
    this.beanName = "columnChooserFactory";
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
    this.menuUtils = beans.menuUtils;
    this.visibleColsService = beans.visibleColsService;
  }
  createColumnSelectPanel(parent, column, draggable, params) {
    const columnSelectPanel = parent.createManagedBean(new AgPrimaryCols());
    const columnChooserParams = params ?? column?.getColDef().columnChooserParams ?? column?.getColDef().columnsMenuParams ?? {};
    const {
      contractColumnSelection,
      suppressColumnExpandAll,
      suppressColumnFilter,
      suppressColumnSelectAll,
      suppressSyncLayoutWithGrid,
      columnLayout
    } = columnChooserParams;
    columnSelectPanel.init(
      !!draggable,
      this.gos.addGridCommonParams({
        suppressColumnMove: false,
        suppressValues: false,
        suppressPivots: false,
        suppressRowGroups: false,
        suppressPivotMode: false,
        contractColumnSelection: !!contractColumnSelection,
        suppressColumnExpandAll: !!suppressColumnExpandAll,
        suppressColumnFilter: !!suppressColumnFilter,
        suppressColumnSelectAll: !!suppressColumnSelectAll,
        suppressSyncLayoutWithGrid: !!columnLayout || !!suppressSyncLayoutWithGrid,
        onStateUpdated: () => {
        }
      }),
      "columnMenu"
    );
    if (columnLayout) {
      columnSelectPanel.setColumnLayout(columnLayout);
    }
    return columnSelectPanel;
  }
  showColumnChooser({ column, chooserParams, eventSource }) {
    this.hideActiveColumnChooser();
    const columnSelectPanel = this.createColumnSelectPanel(this, column, true, chooserParams);
    const translate = this.localeService.getLocaleTextFunc();
    const columnIndex = this.visibleColsService.getAllCols().indexOf(column);
    const headerPosition = column ? this.focusService.getFocusedHeader() : null;
    this.activeColumnChooserDialog = this.createBean(
      new AgDialog({
        title: translate("chooseColumns", "Choose Columns"),
        component: columnSelectPanel,
        width: 300,
        height: 300,
        resizable: true,
        movable: true,
        centered: true,
        closable: true,
        afterGuiAttached: () => {
          this.focusService.findNextFocusableElement(columnSelectPanel.getGui())?.focus();
          this.dispatchVisibleChangedEvent(true, column);
        },
        closedCallback: (event) => {
          const eComp = this.activeColumnChooser.getGui();
          this.destroyBean(this.activeColumnChooser);
          this.activeColumnChooser = void 0;
          this.activeColumnChooserDialog = void 0;
          this.dispatchVisibleChangedEvent(false, column);
          if (column) {
            this.menuUtils.restoreFocusOnClose(
              { column, headerPosition, columnIndex, eventSource },
              eComp,
              event,
              true
            );
          }
        }
      })
    );
    this.activeColumnChooser = columnSelectPanel;
  }
  hideActiveColumnChooser() {
    if (this.activeColumnChooserDialog) {
      this.destroyBean(this.activeColumnChooserDialog);
    }
  }
  dispatchVisibleChangedEvent(visible, column) {
    const event = {
      type: "columnMenuVisibleChanged",
      visible,
      switchingTab: false,
      key: "columnChooser",
      column: column ?? null
    };
    this.eventService.dispatchEvent(event);
  }
};

// enterprise-modules/menu/src/menu/columnMenuFactory.ts
import { BeanStub as BeanStub3, _removeRepeatsFromArray } from "@ag-grid-community/core";
import { AgMenuList } from "@ag-grid-enterprise/core";
var MENU_ITEM_SEPARATOR = "separator";
var ColumnMenuFactory = class extends BeanStub3 {
  constructor() {
    super(...arguments);
    this.beanName = "columnMenuFactory";
  }
  wireBeans(beans) {
    this.menuItemMapper = beans.menuItemMapper;
    this.columnModel = beans.columnModel;
    this.funcColsService = beans.funcColsService;
    this.rowModel = beans.rowModel;
    this.menuService = beans.menuService;
  }
  createMenu(parent, column, sourceElement) {
    const menuList = parent.createManagedBean(
      new AgMenuList(0, {
        column: column ?? null,
        node: null,
        value: null
      })
    );
    const menuItems = this.getMenuItems(column);
    const menuItemsMapped = this.menuItemMapper.mapWithStockItems(
      menuItems,
      column ?? null,
      sourceElement,
      "columnMenu"
    );
    menuList.addMenuItems(menuItemsMapped);
    return menuList;
  }
  getMenuItems(column) {
    const defaultItems = this.getDefaultMenuOptions(column);
    let result;
    const columnMainMenuItems = column?.getColDef().mainMenuItems;
    if (Array.isArray(columnMainMenuItems)) {
      result = columnMainMenuItems;
    } else if (typeof columnMainMenuItems === "function") {
      result = columnMainMenuItems(
        this.gos.addGridCommonParams({
          column,
          defaultItems
        })
      );
    } else {
      const userFunc = this.gos.getCallback("getMainMenuItems");
      if (userFunc && column) {
        result = userFunc({
          column,
          defaultItems
        });
      } else {
        result = defaultItems;
      }
    }
    _removeRepeatsFromArray(result, MENU_ITEM_SEPARATOR);
    return result;
  }
  getDefaultMenuOptions(column) {
    const result = [];
    const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
    if (!column) {
      if (!isLegacyMenuEnabled) {
        result.push("columnChooser");
      }
      result.push("resetColumns");
      return result;
    }
    const allowPinning = !column.getColDef().lockPinned;
    const rowGroupCount = this.funcColsService.getRowGroupColumns().length;
    const doingGrouping = rowGroupCount > 0;
    const allowValue = column.isAllowValue();
    const allowRowGroup = column.isAllowRowGroup();
    const isPrimary = column.isPrimary();
    const pivotModeOn = this.columnModel.isPivotMode();
    const isInMemoryRowModel = this.rowModel.getType() === "clientSide";
    const usingTreeData = this.gos.get("treeData");
    const allowValueAgg = (
      // if primary, then only allow aggValue if grouping and it's a value columns
      isPrimary && doingGrouping && allowValue || // secondary columns can always have aggValue, as it means it's a pivot value column
      !isPrimary
    );
    if (!isLegacyMenuEnabled && column.isSortable()) {
      const sort = column.getSort();
      if (sort !== "asc") {
        result.push("sortAscending");
      }
      if (sort !== "desc") {
        result.push("sortDescending");
      }
      if (sort) {
        result.push("sortUnSort");
      }
      result.push(MENU_ITEM_SEPARATOR);
    }
    if (this.menuService.isFilterMenuItemEnabled(column)) {
      result.push("columnFilter");
      result.push(MENU_ITEM_SEPARATOR);
    }
    if (allowPinning) {
      result.push("pinSubMenu");
    }
    if (allowValueAgg) {
      result.push("valueAggSubMenu");
    }
    if (allowPinning || allowValueAgg) {
      result.push(MENU_ITEM_SEPARATOR);
    }
    result.push("autoSizeThis");
    result.push("autoSizeAll");
    result.push(MENU_ITEM_SEPARATOR);
    const showRowGroup = column.getColDef().showRowGroup;
    if (showRowGroup) {
      result.push("rowUnGroup");
    } else if (allowRowGroup && column.isPrimary()) {
      if (column.isRowGroupActive()) {
        const groupLocked = this.columnModel.isColGroupLocked(column);
        if (!groupLocked) {
          result.push("rowUnGroup");
        }
      } else {
        result.push("rowGroup");
      }
    }
    result.push(MENU_ITEM_SEPARATOR);
    if (!isLegacyMenuEnabled) {
      result.push("columnChooser");
    }
    result.push("resetColumns");
    const allowExpandAndContract = isInMemoryRowModel && (usingTreeData || rowGroupCount > (pivotModeOn ? 1 : 0));
    if (allowExpandAndContract) {
      result.push("expandAll");
      result.push("contractAll");
    }
    return result;
  }
};

// enterprise-modules/menu/src/menu/contextMenu.ts
import {
  BeanStub as BeanStub4,
  Component,
  ModuleNames as ModuleNames2,
  ModuleRegistry as ModuleRegistry2,
  _exists,
  _isIOSUserAgent,
  _missingOrEmpty
} from "@ag-grid-community/core";
import { AgMenuList as AgMenuList2 } from "@ag-grid-enterprise/core";
var CSS_MENU = "ag-menu";
var CSS_CONTEXT_MENU_OPEN = "ag-context-menu-open";
var ContextMenuFactory = class extends BeanStub4 {
  constructor() {
    super(...arguments);
    this.beanName = "contextMenuFactory";
  }
  wireBeans(beans) {
    this.popupService = beans.popupService;
    this.ctrlsService = beans.ctrlsService;
    this.columnModel = beans.columnModel;
    this.menuUtils = beans.menuUtils;
    this.rangeService = beans.rangeService;
  }
  hideActiveMenu() {
    this.destroyBean(this.activeMenu);
  }
  getMenuItems(node, column, value) {
    const defaultMenuOptions = [];
    if (_exists(node) && ModuleRegistry2.__isRegistered(ModuleNames2.ClipboardModule, this.gridId)) {
      if (column) {
        if (!this.gos.get("suppressCutToClipboard")) {
          defaultMenuOptions.push("cut");
        }
        defaultMenuOptions.push("copy", "copyWithHeaders", "copyWithGroupHeaders", "paste", "separator");
      }
    }
    if (this.gos.get("enableCharts") && ModuleRegistry2.__isRegistered(ModuleNames2.GridChartsModule, this.gridId)) {
      if (this.columnModel.isPivotMode()) {
        defaultMenuOptions.push("pivotChart");
      }
      if (this.rangeService && !this.rangeService.isEmpty()) {
        defaultMenuOptions.push("chartRange");
      }
    }
    if (_exists(node)) {
      const csvModuleMissing = !ModuleRegistry2.__isRegistered(ModuleNames2.CsvExportModule, this.gridId);
      const excelModuleMissing = !ModuleRegistry2.__isRegistered(ModuleNames2.ExcelExportModule, this.gridId);
      const suppressExcel = this.gos.get("suppressExcelExport") || excelModuleMissing;
      const suppressCsv = this.gos.get("suppressCsvExport") || csvModuleMissing;
      const onIPad = _isIOSUserAgent();
      const anyExport = !onIPad && (!suppressExcel || !suppressCsv);
      if (anyExport) {
        defaultMenuOptions.push("export");
      }
    }
    const defaultItems = defaultMenuOptions.length ? defaultMenuOptions : void 0;
    const columnContextMenuItems = column?.getColDef().contextMenuItems;
    if (Array.isArray(columnContextMenuItems)) {
      return columnContextMenuItems;
    }
    if (typeof columnContextMenuItems === "function") {
      return columnContextMenuItems(
        this.gos.addGridCommonParams({
          column,
          node,
          value,
          defaultItems
        })
      );
    }
    const userFunc = this.gos.getCallback("getContextMenuItems");
    if (userFunc) {
      return userFunc({ column, node, value, defaultItems });
    }
    return defaultMenuOptions;
  }
  onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement) {
    this.menuUtils.onContextMenu(
      mouseEvent,
      touchEvent,
      (eventOrTouch) => this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement)
    );
  }
  showMenu(node, column, value, mouseEvent, anchorToElement) {
    const menuItems = this.getMenuItems(node, column, value);
    const eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();
    if (menuItems === void 0 || _missingOrEmpty(menuItems)) {
      return false;
    }
    const menu = new ContextMenu(menuItems, column, node, value);
    this.createBean(menu);
    const eMenuGui = menu.getGui();
    const positionParams = {
      column,
      rowNode: node,
      type: "contextMenu",
      mouseEvent,
      ePopup: eMenuGui,
      // move one pixel away so that accidentally double clicking
      // won't show the browser's contextmenu
      nudgeY: 1
    };
    const translate = this.localeService.getLocaleTextFunc();
    const addPopupRes = this.popupService.addPopup({
      modal: true,
      eChild: eMenuGui,
      closeOnEsc: true,
      closedCallback: (e) => {
        eGridBodyGui.classList.remove(CSS_CONTEXT_MENU_OPEN);
        this.destroyBean(menu);
        this.dispatchVisibleChangedEvent(false, e === void 0 ? "api" : "ui");
      },
      click: mouseEvent,
      positionCallback: () => {
        const isRtl = this.gos.get("enableRtl");
        this.popupService.positionPopupUnderMouseEvent({
          ...positionParams,
          nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1
        });
      },
      // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
      anchorToElement,
      ariaLabel: translate("ariaLabelContextMenu", "Context Menu")
    });
    if (addPopupRes) {
      eGridBodyGui.classList.add(CSS_CONTEXT_MENU_OPEN);
      menu.afterGuiAttached({ container: "contextMenu", hidePopup: addPopupRes.hideFunc });
    }
    if (this.activeMenu) {
      this.hideActiveMenu();
    }
    this.activeMenu = menu;
    menu.addEventListener("destroyed", () => {
      if (this.activeMenu === menu) {
        this.activeMenu = null;
      }
    });
    if (addPopupRes) {
      menu.addEventListener(
        "closeMenu",
        (e) => addPopupRes.hideFunc({
          mouseEvent: e.mouseEvent ?? void 0,
          keyboardEvent: e.keyboardEvent ?? void 0,
          forceHide: true
        })
      );
    }
    const isApi = mouseEvent && mouseEvent instanceof MouseEvent && mouseEvent.type === "mousedown";
    this.dispatchVisibleChangedEvent(true, isApi ? "api" : "ui");
    return true;
  }
  dispatchVisibleChangedEvent(visible, source = "ui") {
    const displayedEvent = {
      type: "contextMenuVisibleChanged",
      visible,
      source
    };
    this.eventService.dispatchEvent(displayedEvent);
  }
};
var ContextMenu = class extends Component {
  constructor(menuItems, column, node, value) {
    super(
      /* html */
      `<div class="${CSS_MENU}" role="presentation"></div>`
    );
    this.menuItems = menuItems;
    this.column = column;
    this.node = node;
    this.value = value;
    this.menuList = null;
    this.focusedCell = null;
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
    this.menuItemMapper = beans.menuItemMapper;
    this.cellPositionUtils = beans.cellPositionUtils;
  }
  postConstruct() {
    const menuList = this.createManagedBean(
      new AgMenuList2(0, {
        column: this.column,
        node: this.node,
        value: this.value
      })
    );
    const menuItemsMapped = this.menuItemMapper.mapWithStockItems(
      this.menuItems,
      null,
      () => this.getGui(),
      "contextMenu"
    );
    menuList.addMenuItems(menuItemsMapped);
    this.appendChild(menuList);
    this.menuList = menuList;
    menuList.addEventListener("closeMenu", (e) => this.dispatchLocalEvent(e));
  }
  afterGuiAttached(params) {
    if (params.hidePopup) {
      this.addDestroyFunc(params.hidePopup);
    }
    this.focusedCell = this.focusService.getFocusedCell();
    if (this.menuList) {
      this.focusService.focusInto(this.menuList.getGui());
    }
  }
  restoreFocusedCell() {
    const currentFocusedCell = this.focusService.getFocusedCell();
    if (currentFocusedCell && this.focusedCell && this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)) {
      const { rowIndex, rowPinned, column } = this.focusedCell;
      const doc = this.gos.getDocument();
      const activeEl = this.gos.getActiveDomElement();
      if (!activeEl || activeEl === doc.body) {
        this.focusService.setFocusedCell({
          rowIndex,
          column,
          rowPinned,
          forceBrowserFocus: true,
          preventScrollOnBrowserFocus: !this.focusService.isKeyboardMode()
        });
      }
    }
  }
  destroy() {
    this.restoreFocusedCell();
    super.destroy();
  }
};

// enterprise-modules/menu/src/menu/enterpriseMenu.ts
import {
  AgPromise,
  BeanStub as BeanStub5,
  Component as Component2,
  FilterWrapperComp,
  ModuleNames as ModuleNames3,
  ModuleRegistry as ModuleRegistry3,
  RefPlaceholder,
  _createIconNoSpan as _createIconNoSpan2,
  _warnOnce as _warnOnce2
} from "@ag-grid-community/core";
import { TabbedLayout } from "@ag-grid-enterprise/core";
var TAB_FILTER = "filterMenuTab";
var TAB_GENERAL = "generalMenuTab";
var TAB_COLUMNS = "columnsMenuTab";
var TABS_DEFAULT = [TAB_GENERAL, TAB_FILTER, TAB_COLUMNS];
var EnterpriseMenuFactory = class extends BeanStub5 {
  constructor() {
    super(...arguments);
    this.beanName = "enterpriseMenuFactory";
  }
  wireBeans(beans) {
    this.popupService = beans.popupService;
    this.focusService = beans.focusService;
    this.ctrlsService = beans.ctrlsService;
    this.visibleColsService = beans.visibleColsService;
    this.filterManager = beans.filterManager;
    this.menuUtils = beans.menuUtils;
    this.menuService = beans.menuService;
  }
  hideActiveMenu() {
    this.destroyBean(this.activeMenu);
  }
  showMenuAfterMouseEvent(column, mouseEvent, containerType, filtersOnly) {
    const defaultTab = filtersOnly ? "filterMenuTab" : void 0;
    this.showMenu(
      column,
      (menu) => {
        const ePopup = menu.getGui();
        this.popupService.positionPopupUnderMouseEvent({
          type: containerType,
          column,
          mouseEvent,
          ePopup
        });
        if (defaultTab) {
          menu.showTab?.(defaultTab);
        }
        this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
      },
      containerType,
      defaultTab,
      void 0,
      mouseEvent.target
    );
  }
  showMenuAfterButtonClick(column, eventSource, containerType, filtersOnly) {
    let multiplier = -1;
    let alignSide = "left";
    if (this.gos.get("enableRtl")) {
      multiplier = 1;
      alignSide = "right";
    }
    const defaultTab = filtersOnly ? "filterMenuTab" : void 0;
    const restrictToTabs = defaultTab ? [defaultTab] : void 0;
    const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
    const nudgeX = (isLegacyMenuEnabled ? 9 : 4) * multiplier;
    const nudgeY = isLegacyMenuEnabled ? -23 : 4;
    this.showMenu(
      column,
      (menu) => {
        const ePopup = menu.getGui();
        this.popupService.positionPopupByComponent({
          type: containerType,
          column,
          eventSource,
          ePopup,
          alignSide,
          nudgeX,
          nudgeY,
          position: "under",
          keepWithinBounds: true
        });
        if (defaultTab) {
          menu.showTab?.(defaultTab);
        }
        this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
      },
      containerType,
      defaultTab,
      restrictToTabs,
      eventSource
    );
  }
  showMenu(column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
    const { menu, eMenuGui, anchorToElement, restoreFocusParams } = this.getMenuParams(
      column,
      restrictToTabs,
      eventSource
    );
    const closedFuncs = [];
    closedFuncs.push((e) => {
      const eComp = menu.getGui();
      this.destroyBean(menu);
      if (column) {
        column.setMenuVisible(false, "contextMenu");
        this.menuUtils.restoreFocusOnClose(restoreFocusParams, eComp, e);
      }
    });
    const translate = this.localeService.getLocaleTextFunc();
    this.popupService.addPopup({
      modal: true,
      eChild: eMenuGui,
      closeOnEsc: true,
      closedCallback: (e) => {
        closedFuncs.forEach((f) => f(e));
        this.dispatchVisibleChangedEvent(false, false, column, defaultTab);
      },
      afterGuiAttached: (params) => menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)),
      // if defaultTab is not present, positionCallback will be called
      // after `showTabBasedOnPreviousSelection` is called.
      positionCallback: defaultTab ? () => positionCallback(menu) : void 0,
      ariaLabel: translate("ariaLabelColumnMenu", "Column Menu")
    });
    if (!defaultTab) {
      menu.showTabBasedOnPreviousSelection?.();
      positionCallback(menu);
    }
    if (this.menuService.isColumnMenuAnchoringEnabled()) {
      const stopAnchoringPromise = this.popupService.setPopupPositionRelatedToElement(eMenuGui, anchorToElement);
      if (stopAnchoringPromise && column) {
        this.addStopAnchoring(stopAnchoringPromise, column, closedFuncs);
      }
    }
    menu.addEventListener("tabSelected", (event) => {
      this.dispatchVisibleChangedEvent(false, true, column);
      this.lastSelectedTab = event.key;
      this.dispatchVisibleChangedEvent(true, true, column);
    });
    column?.setMenuVisible(true, "contextMenu");
    this.activeMenu = menu;
    menu.addEventListener("destroyed", () => {
      if (this.activeMenu === menu) {
        this.activeMenu = null;
      }
    });
  }
  addStopAnchoring(stopAnchoringPromise, column, closedFuncsArr) {
    stopAnchoringPromise.then((stopAnchoringFunc) => {
      column.addEventListener("leftChanged", stopAnchoringFunc);
      column.addEventListener("visibleChanged", stopAnchoringFunc);
      closedFuncsArr.push(() => {
        column.removeEventListener("leftChanged", stopAnchoringFunc);
        column.removeEventListener("visibleChanged", stopAnchoringFunc);
      });
    });
  }
  getMenuParams(column, restrictToTabs, eventSource) {
    const restoreFocusParams = {
      column,
      headerPosition: this.focusService.getFocusedHeader(),
      columnIndex: this.visibleColsService.getAllCols().indexOf(column),
      eventSource
    };
    const menu = this.createMenu(column, restoreFocusParams, restrictToTabs, eventSource);
    return {
      menu,
      eMenuGui: menu.getGui(),
      anchorToElement: eventSource || this.ctrlsService.getGridBodyCtrl().getGui(),
      restoreFocusParams
    };
  }
  createMenu(column, restoreFocusParams, restrictToTabs, eventSource) {
    if (this.menuService.isLegacyMenuEnabled()) {
      return this.createBean(
        new TabbedColumnMenu(column, restoreFocusParams, this.lastSelectedTab, restrictToTabs, eventSource)
      );
    } else {
      return this.createBean(new ColumnContextMenu(column, restoreFocusParams, eventSource));
    }
  }
  dispatchVisibleChangedEvent(visible, switchingTab, column, defaultTab) {
    const event = {
      type: "columnMenuVisibleChanged",
      visible,
      switchingTab,
      key: this.lastSelectedTab ?? defaultTab ?? (this.menuService.isLegacyMenuEnabled() ? TAB_GENERAL : "columnMenu"),
      column: column ?? null
    };
    this.eventService.dispatchEvent(event);
  }
  isMenuEnabled(column) {
    if (!this.menuService.isLegacyMenuEnabled()) {
      return true;
    }
    const isFilterDisabled = !this.filterManager?.isFilterAllowed(column);
    const tabs = column.getColDef().menuTabs ?? TABS_DEFAULT;
    const numActiveTabs = isFilterDisabled && tabs.includes(TAB_FILTER) ? tabs.length - 1 : tabs.length;
    return numActiveTabs > 0;
  }
  showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent) {
    this.menuUtils.onContextMenu(mouseEvent, touchEvent, (eventOrTouch) => {
      this.showMenuAfterMouseEvent(column, eventOrTouch, "columnMenu");
      return true;
    });
  }
};
var TabbedColumnMenu = class extends BeanStub5 {
  constructor(column, restoreFocusParams, initialSelection, restrictTo, sourceElement) {
    super();
    this.column = column;
    this.restoreFocusParams = restoreFocusParams;
    this.initialSelection = initialSelection;
    this.restrictTo = restrictTo;
    this.sourceElement = sourceElement;
    this.tabFactories = {};
    this.includeChecks = {};
    this.tabFactories[TAB_GENERAL] = this.createMainPanel.bind(this);
    this.tabFactories[TAB_FILTER] = this.createFilterPanel.bind(this);
    this.tabFactories[TAB_COLUMNS] = this.createColumnsPanel.bind(this);
    this.includeChecks[TAB_GENERAL] = () => true;
    this.includeChecks[TAB_FILTER] = () => column ? !!this.filterManager?.isFilterAllowed(column) : false;
    this.includeChecks[TAB_COLUMNS] = () => true;
  }
  wireBeans(beans) {
    this.filterManager = beans.filterManager;
    this.columnChooserFactory = beans.columnChooserFactory;
    this.columnMenuFactory = beans.columnMenuFactory;
    this.menuUtils = beans.menuUtils;
  }
  postConstruct() {
    const tabs = this.getTabsToCreate().map((name) => this.createTab(name));
    this.tabbedLayout = new TabbedLayout({
      items: tabs,
      cssClass: "ag-menu",
      onActiveItemClicked: this.onHidePopup.bind(this),
      onItemClicked: this.onTabItemClicked.bind(this)
    });
    this.createBean(this.tabbedLayout);
    if (this.mainMenuList) {
      this.mainMenuList.setParentComponent(this.tabbedLayout);
    }
    this.addDestroyFunc(() => this.destroyBean(this.tabbedLayout));
  }
  getTabsToCreate() {
    if (this.restrictTo) {
      return this.restrictTo;
    }
    return (this.column?.getColDef().menuTabs ?? TABS_DEFAULT).filter((tabName) => this.isValidMenuTabItem(tabName)).filter((tabName) => this.isNotSuppressed(tabName)).filter((tabName) => this.isModuleLoaded(tabName));
  }
  isModuleLoaded(menuTabName) {
    if (menuTabName === TAB_COLUMNS) {
      return ModuleRegistry3.__isRegistered(ModuleNames3.ColumnsToolPanelModule, this.gridId);
    }
    return true;
  }
  isValidMenuTabItem(menuTabName) {
    let isValid = true;
    let itemsToConsider = TABS_DEFAULT;
    if (this.restrictTo != null) {
      isValid = this.restrictTo.indexOf(menuTabName) > -1;
      itemsToConsider = this.restrictTo;
    }
    isValid = isValid && TABS_DEFAULT.indexOf(menuTabName) > -1;
    if (!isValid) {
      _warnOnce2(
        `Trying to render an invalid menu item '${menuTabName}'. Check that your 'menuTabs' contains one of [${itemsToConsider}]`
      );
    }
    return isValid;
  }
  isNotSuppressed(menuTabName) {
    return this.includeChecks[menuTabName]();
  }
  createTab(name) {
    return this.tabFactories[name]();
  }
  showTabBasedOnPreviousSelection() {
    this.showTab(this.initialSelection);
  }
  showTab(toShow) {
    if (this.tabItemColumns && toShow === TAB_COLUMNS) {
      this.tabbedLayout.showItem(this.tabItemColumns);
    } else if (this.tabItemFilter && toShow === TAB_FILTER) {
      this.tabbedLayout.showItem(this.tabItemFilter);
    } else if (this.tabItemGeneral && toShow === TAB_GENERAL) {
      this.tabbedLayout.showItem(this.tabItemGeneral);
    } else {
      this.tabbedLayout.showFirstItem();
    }
  }
  onTabItemClicked(event) {
    let key = null;
    switch (event.item) {
      case this.tabItemColumns:
        key = TAB_COLUMNS;
        break;
      case this.tabItemFilter:
        key = TAB_FILTER;
        break;
      case this.tabItemGeneral:
        key = TAB_GENERAL;
        break;
    }
    if (key) {
      this.activateTab(key);
    }
  }
  activateTab(tab) {
    const ev = {
      type: "tabSelected",
      key: tab
    };
    this.dispatchLocalEvent(ev);
  }
  createMainPanel() {
    this.mainMenuList = this.columnMenuFactory.createMenu(
      this,
      this.column,
      () => this.sourceElement ?? this.getGui()
    );
    this.mainMenuList.addEventListener("closeMenu", this.onHidePopup.bind(this));
    this.tabItemGeneral = {
      title: _createIconNoSpan2("menu", this.gos, this.column),
      titleLabel: TAB_GENERAL.replace("MenuTab", ""),
      bodyPromise: AgPromise.resolve(this.mainMenuList.getGui()),
      name: TAB_GENERAL
    };
    return this.tabItemGeneral;
  }
  onHidePopup(event) {
    this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
  }
  createFilterPanel() {
    const comp = this.column ? this.createBean(new FilterWrapperComp(this.column, "COLUMN_MENU")) : null;
    this.filterComp = comp;
    if (!comp?.hasFilter()) {
      throw new Error("AG Grid - Unable to instantiate filter");
    }
    const afterAttachedCallback = (params) => comp.afterGuiAttached(params);
    const afterDetachedCallback = () => comp.afterGuiDetached();
    this.tabItemFilter = {
      title: _createIconNoSpan2("filter", this.gos, this.column),
      titleLabel: TAB_FILTER.replace("MenuTab", ""),
      bodyPromise: AgPromise.resolve(comp?.getGui()),
      afterAttachedCallback,
      afterDetachedCallback,
      name: TAB_FILTER
    };
    return this.tabItemFilter;
  }
  createColumnsPanel() {
    const eWrapperDiv = document.createElement("div");
    eWrapperDiv.classList.add("ag-menu-column-select-wrapper");
    const columnSelectPanel = this.columnChooserFactory.createColumnSelectPanel(this, this.column);
    const columnSelectPanelGui = columnSelectPanel.getGui();
    columnSelectPanelGui.classList.add("ag-menu-column-select");
    eWrapperDiv.appendChild(columnSelectPanelGui);
    this.tabItemColumns = {
      title: _createIconNoSpan2("columns", this.gos, this.column),
      //createColumnsIcon(),
      titleLabel: TAB_COLUMNS.replace("MenuTab", ""),
      bodyPromise: AgPromise.resolve(eWrapperDiv),
      name: TAB_COLUMNS
    };
    return this.tabItemColumns;
  }
  afterGuiAttached(params) {
    const { container, hidePopup } = params;
    this.tabbedLayout.setAfterAttachedParams({ container, hidePopup });
    if (hidePopup) {
      this.hidePopupFunc = hidePopup;
      this.addDestroyFunc(hidePopup);
    }
  }
  getGui() {
    return this.tabbedLayout.getGui();
  }
  destroy() {
    super.destroy();
    this.destroyBean(this.filterComp);
  }
};
var ColumnContextMenu = class extends Component2 {
  constructor(column, restoreFocusParams, sourceElement) {
    super(
      /* html */
      `
            <div data-ref="eColumnMenu" role="presentation" class="ag-menu ag-column-menu"></div>
        `
    );
    this.column = column;
    this.restoreFocusParams = restoreFocusParams;
    this.sourceElement = sourceElement;
    this.eColumnMenu = RefPlaceholder;
  }
  wireBeans(beans) {
    this.columnMenuFactory = beans.columnMenuFactory;
    this.menuUtils = beans.menuUtils;
    this.focusService = beans.focusService;
  }
  postConstruct() {
    this.mainMenuList = this.columnMenuFactory.createMenu(
      this,
      this.column,
      () => this.sourceElement ?? this.getGui()
    );
    this.mainMenuList.addEventListener("closeMenu", this.onHidePopup.bind(this));
    this.eColumnMenu.appendChild(this.mainMenuList.getGui());
  }
  onHidePopup(event) {
    this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
  }
  afterGuiAttached({ hidePopup }) {
    if (hidePopup) {
      this.hidePopupFunc = hidePopup;
      this.addDestroyFunc(hidePopup);
    }
    this.focusService.focusInto(this.mainMenuList.getGui());
  }
};

// enterprise-modules/menu/src/menu/menuApi.ts
function showContextMenu(beans, params) {
  const { rowNode, column, value, x, y } = params || {};
  let { x: clientX, y: clientY } = beans.menuService.getContextMenuPosition(rowNode, column);
  if (x != null) {
    clientX = x;
  }
  if (y != null) {
    clientY = y;
  }
  beans.menuService.showContextMenu({
    mouseEvent: new MouseEvent("mousedown", { clientX, clientY }),
    rowNode,
    column,
    value
  });
}
function showColumnChooser(beans, params) {
  beans.menuService.showColumnChooser({ chooserParams: params });
}
function hideColumnChooser(beans) {
  beans.menuService.hideColumnChooser();
}

// enterprise-modules/menu/src/menu/menuItemMapper.ts
import {
  BeanStub as BeanStub6,
  ModuleNames as ModuleNames4,
  ModuleRegistry as ModuleRegistry4,
  _createIconNoSpan as _createIconNoSpan3,
  _escapeString,
  _exists as _exists2,
  _warnOnce as _warnOnce3
} from "@ag-grid-community/core";
var MenuItemMapper = class extends BeanStub6 {
  constructor() {
    super(...arguments);
    this.beanName = "menuItemMapper";
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.columnNameService = beans.columnNameService;
    this.columnApplyStateService = beans.columnApplyStateService;
    this.funcColsService = beans.funcColsService;
    this.focusService = beans.focusService;
    this.rowPositionUtils = beans.rowPositionUtils;
    this.chartMenuItemMapper = beans.chartMenuItemMapper;
    this.menuService = beans.menuService;
    this.sortController = beans.sortController;
    this.columnAutosizeService = beans.columnAutosizeService;
    this.expansionService = beans.expansionService;
    this.clipboardService = beans.clipboardService;
    this.aggFuncService = beans.aggFuncService;
    this.csvCreator = beans.csvCreator;
    this.excelCreator = beans.excelCreator;
  }
  mapWithStockItems(originalList, column, sourceElement, source) {
    if (!originalList) {
      return [];
    }
    const resultList = [];
    originalList.forEach((menuItemOrString) => {
      let result;
      if (typeof menuItemOrString === "string") {
        result = this.getStockMenuItem(menuItemOrString, column, sourceElement, source);
      } else {
        result = { ...menuItemOrString };
      }
      if (!result) {
        return;
      }
      const resultDef = result;
      const { subMenu } = resultDef;
      if (subMenu && subMenu instanceof Array) {
        resultDef.subMenu = this.mapWithStockItems(subMenu, column, sourceElement, source);
      }
      if (result != null) {
        resultList.push(result);
      }
    });
    return resultList;
  }
  getStockMenuItem(key, column, sourceElement, source) {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    const skipHeaderOnAutoSize = this.gos.get("skipHeaderOnAutoSize");
    switch (key) {
      case "pinSubMenu":
        return {
          name: localeTextFunc("pinColumn", "Pin Column"),
          icon: _createIconNoSpan3("menuPin", this.gos, null),
          subMenu: ["clearPinned", "pinLeft", "pinRight"]
        };
      case "pinLeft":
        return {
          name: localeTextFunc("pinLeft", "Pin Left"),
          action: () => this.columnModel.setColsPinned([column], "left", source),
          checked: !!column && column.isPinnedLeft()
        };
      case "pinRight":
        return {
          name: localeTextFunc("pinRight", "Pin Right"),
          action: () => this.columnModel.setColsPinned([column], "right", source),
          checked: !!column && column.isPinnedRight()
        };
      case "clearPinned":
        return {
          name: localeTextFunc("noPin", "No Pin"),
          action: () => this.columnModel.setColsPinned([column], null, source),
          checked: !!column && !column.isPinned()
        };
      case "valueAggSubMenu":
        if (ModuleRegistry4.__assertRegistered(
          ModuleNames4.RowGroupingModule,
          "Aggregation from Menu",
          this.gridId
        )) {
          if (!column?.isPrimary() && !column?.getColDef().pivotValueColumn) {
            return null;
          }
          return {
            name: localeTextFunc("valueAggregation", "Value Aggregation"),
            icon: _createIconNoSpan3("menuValue", this.gos, null),
            subMenu: this.createAggregationSubMenu(column, this.aggFuncService)
          };
        } else {
          return null;
        }
      case "autoSizeThis":
        return {
          name: localeTextFunc("autosizeThisColumn", "Autosize This Column"),
          action: () => this.columnAutosizeService.autoSizeColumn(column, source, skipHeaderOnAutoSize)
        };
      case "autoSizeAll":
        return {
          name: localeTextFunc("autosizeAllColumns", "Autosize All Columns"),
          action: () => this.columnAutosizeService.autoSizeAllColumns(source, skipHeaderOnAutoSize)
        };
      case "rowGroup":
        return {
          name: localeTextFunc("groupBy", "Group by") + " " + _escapeString(this.columnNameService.getDisplayNameForColumn(column, "header")),
          disabled: this.gos.get("functionsReadOnly") || column?.isRowGroupActive() || !column?.getColDef().enableRowGroup,
          action: () => this.funcColsService.addRowGroupColumns([column], source),
          icon: _createIconNoSpan3("menuAddRowGroup", this.gos, null)
        };
      case "rowUnGroup": {
        const icon = _createIconNoSpan3("menuRemoveRowGroup", this.gos, null);
        const showRowGroup = column?.getColDef().showRowGroup;
        const lockedGroups = this.gos.get("groupLockGroupColumns");
        if (showRowGroup === true) {
          return {
            name: localeTextFunc("ungroupAll", "Un-Group All"),
            disabled: this.gos.get("functionsReadOnly") || lockedGroups === -1 || lockedGroups >= this.funcColsService.getRowGroupColumns().length,
            action: () => this.funcColsService.setRowGroupColumns(
              this.funcColsService.getRowGroupColumns().slice(0, lockedGroups),
              source
            ),
            icon
          };
        }
        if (typeof showRowGroup === "string") {
          const underlyingColumn = this.columnModel.getColDefCol(showRowGroup);
          const ungroupByName = underlyingColumn != null ? _escapeString(this.columnNameService.getDisplayNameForColumn(underlyingColumn, "header")) : showRowGroup;
          return {
            name: localeTextFunc("ungroupBy", "Un-Group by") + " " + ungroupByName,
            disabled: this.gos.get("functionsReadOnly") || underlyingColumn != null && this.columnModel.isColGroupLocked(underlyingColumn),
            action: () => this.funcColsService.removeRowGroupColumns([showRowGroup], source),
            icon
          };
        }
        return {
          name: localeTextFunc("ungroupBy", "Un-Group by") + " " + _escapeString(this.columnNameService.getDisplayNameForColumn(column, "header")),
          disabled: this.gos.get("functionsReadOnly") || !column?.isRowGroupActive() || !column?.getColDef().enableRowGroup || this.columnModel.isColGroupLocked(column),
          action: () => this.funcColsService.removeRowGroupColumns([column], source),
          icon
        };
      }
      case "resetColumns":
        return {
          name: localeTextFunc("resetColumns", "Reset Columns"),
          action: () => this.columnApplyStateService.resetColumnState(source)
        };
      case "expandAll":
        return {
          name: localeTextFunc("expandAll", "Expand All Row Groups"),
          action: () => this.expansionService.expandAll(true)
        };
      case "contractAll":
        return {
          name: localeTextFunc("collapseAll", "Collapse All Row Groups"),
          action: () => this.expansionService.expandAll(false)
        };
      case "copy":
        if (ModuleRegistry4.__assertRegistered(ModuleNames4.ClipboardModule, "Copy from Menu", this.gridId)) {
          return {
            name: localeTextFunc("copy", "Copy"),
            shortcut: localeTextFunc("ctrlC", "Ctrl+C"),
            icon: _createIconNoSpan3("clipboardCopy", this.gos, null),
            action: () => this.clipboardService.copyToClipboard()
          };
        } else {
          return null;
        }
      case "copyWithHeaders":
        if (ModuleRegistry4.__assertRegistered(
          ModuleNames4.ClipboardModule,
          "Copy with Headers from Menu",
          this.gridId
        )) {
          return {
            name: localeTextFunc("copyWithHeaders", "Copy with Headers"),
            // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
            icon: _createIconNoSpan3("clipboardCopy", this.gos, null),
            action: () => this.clipboardService.copyToClipboard({ includeHeaders: true })
          };
        } else {
          return null;
        }
      case "copyWithGroupHeaders":
        if (ModuleRegistry4.__assertRegistered(
          ModuleNames4.ClipboardModule,
          "Copy with Group Headers from Menu",
          this.gridId
        )) {
          return {
            name: localeTextFunc("copyWithGroupHeaders", "Copy with Group Headers"),
            // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
            icon: _createIconNoSpan3("clipboardCopy", this.gos, null),
            action: () => this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true })
          };
        } else {
          return null;
        }
      case "cut":
        if (ModuleRegistry4.__assertRegistered(ModuleNames4.ClipboardModule, "Cut from Menu", this.gridId)) {
          const focusedCell = this.focusService.getFocusedCell();
          const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
          const isEditable = rowNode ? focusedCell?.column.isCellEditable(rowNode) : false;
          return {
            name: localeTextFunc("cut", "Cut"),
            shortcut: localeTextFunc("ctrlX", "Ctrl+X"),
            icon: _createIconNoSpan3("clipboardCut", this.gos, null),
            disabled: !isEditable || this.gos.get("suppressCutToClipboard"),
            action: () => this.clipboardService.cutToClipboard(void 0, "contextMenu")
          };
        } else {
          return null;
        }
      case "paste":
        if (ModuleRegistry4.__assertRegistered(ModuleNames4.ClipboardModule, "Paste from Clipboard", this.gridId)) {
          return {
            name: localeTextFunc("paste", "Paste"),
            shortcut: localeTextFunc("ctrlV", "Ctrl+V"),
            disabled: true,
            icon: _createIconNoSpan3("clipboardPaste", this.gos, null),
            action: () => this.clipboardService.pasteFromClipboard()
          };
        } else {
          return null;
        }
      case "export": {
        const exportSubMenuItems = [];
        const csvModuleLoaded = ModuleRegistry4.__isRegistered(ModuleNames4.CsvExportModule, this.gridId);
        const excelModuleLoaded = ModuleRegistry4.__isRegistered(ModuleNames4.ExcelExportModule, this.gridId);
        if (!this.gos.get("suppressCsvExport") && csvModuleLoaded) {
          exportSubMenuItems.push("csvExport");
        }
        if (!this.gos.get("suppressExcelExport") && excelModuleLoaded) {
          exportSubMenuItems.push("excelExport");
        }
        return {
          name: localeTextFunc("export", "Export"),
          subMenu: exportSubMenuItems,
          icon: _createIconNoSpan3("save", this.gos, null)
        };
      }
      case "csvExport":
        return {
          name: localeTextFunc("csvExport", "CSV Export"),
          icon: _createIconNoSpan3("csvExport", this.gos, null),
          action: () => this.csvCreator?.exportDataAsCsv()
        };
      case "excelExport":
        return {
          name: localeTextFunc("excelExport", "Excel Export"),
          icon: _createIconNoSpan3("excelExport", this.gos, null),
          action: () => this.excelCreator?.exportDataAsExcel()
        };
      case "separator":
        return "separator";
      case "pivotChart":
      case "chartRange":
        return this.chartMenuItemMapper.getChartItems(key) ?? null;
      case "columnFilter":
        if (column) {
          return {
            name: localeTextFunc("columnFilter", "Column Filter"),
            icon: _createIconNoSpan3("filter", this.gos, null),
            action: () => this.menuService.showFilterMenu({
              column,
              buttonElement: sourceElement(),
              containerType: "columnFilter",
              positionBy: "button"
            })
          };
        } else {
          return null;
        }
      case "columnChooser":
        if (ModuleRegistry4.__isRegistered(ModuleNames4.ColumnsToolPanelModule, this.gridId)) {
          return {
            name: localeTextFunc("columnChooser", "Choose Columns"),
            icon: _createIconNoSpan3("columns", this.gos, null),
            action: () => this.menuService.showColumnChooser({ column, eventSource: sourceElement() })
          };
        } else {
          return null;
        }
      case "sortAscending":
        return {
          name: localeTextFunc("sortAscending", "Sort Ascending"),
          icon: _createIconNoSpan3("sortAscending", this.gos, null),
          action: () => this.sortController.setSortForColumn(column, "asc", false, source)
        };
      case "sortDescending":
        return {
          name: localeTextFunc("sortDescending", "Sort Descending"),
          icon: _createIconNoSpan3("sortDescending", this.gos, null),
          action: () => this.sortController.setSortForColumn(column, "desc", false, source)
        };
      case "sortUnSort":
        return {
          name: localeTextFunc("sortUnSort", "Clear Sort"),
          icon: _createIconNoSpan3("sortUnSort", this.gos, null),
          action: () => this.sortController.setSortForColumn(column, null, false, source)
        };
      default: {
        _warnOnce3(`unknown menu item type ${key}`);
        return null;
      }
    }
  }
  createAggregationSubMenu(column, aggFuncService) {
    const localeTextFunc = this.localeService.getLocaleTextFunc();
    let columnToUse;
    if (column.isPrimary()) {
      columnToUse = column;
    } else {
      const pivotValueColumn = column.getColDef().pivotValueColumn;
      columnToUse = _exists2(pivotValueColumn) ? pivotValueColumn : void 0;
    }
    const result = [];
    if (columnToUse) {
      const columnIsAlreadyAggValue = columnToUse.isValueActive();
      const funcNames = aggFuncService.getFuncNames(columnToUse);
      result.push({
        name: localeTextFunc("noAggregation", "None"),
        action: () => {
          this.funcColsService.removeValueColumns([columnToUse], "contextMenu");
          this.funcColsService.setColumnAggFunc(columnToUse, void 0, "contextMenu");
        },
        checked: !columnIsAlreadyAggValue
      });
      funcNames.forEach((funcName) => {
        result.push({
          name: localeTextFunc(funcName, aggFuncService.getDefaultFuncLabel(funcName)),
          action: () => {
            this.funcColsService.setColumnAggFunc(columnToUse, funcName, "contextMenu");
            this.funcColsService.addValueColumns([columnToUse], "contextMenu");
          },
          checked: columnIsAlreadyAggValue && columnToUse.getAggFunc() === funcName
        });
      });
    }
    return result;
  }
};

// enterprise-modules/menu/src/menu/menuUtils.ts
import { BeanStub as BeanStub7, _isVisible, _last } from "@ag-grid-community/core";
var MenuUtils = class extends BeanStub7 {
  constructor() {
    super(...arguments);
    this.beanName = "menuUtils";
  }
  wireBeans(beans) {
    this.focusService = beans.focusService;
    this.headerNavigationService = beans.headerNavigationService;
    this.visibleColsService = beans.visibleColsService;
  }
  restoreFocusOnClose(restoreFocusParams, eComp, e, restoreIfMouseEvent) {
    const { eventSource } = restoreFocusParams;
    const isKeyboardEvent = e instanceof KeyboardEvent;
    if (!restoreIfMouseEvent && !isKeyboardEvent || !eventSource) {
      return;
    }
    const eDocument = this.gos.getDocument();
    const activeEl = this.gos.getActiveDomElement();
    if (!eComp.contains(activeEl) && activeEl !== eDocument.body) {
      return;
    }
    this.focusHeaderCell(restoreFocusParams);
  }
  closePopupAndRestoreFocusOnSelect(hidePopupFunc, restoreFocusParams, event) {
    let keyboardEvent;
    if (event && event.keyboardEvent) {
      keyboardEvent = event.keyboardEvent;
    }
    hidePopupFunc(keyboardEvent && { keyboardEvent });
    const focusedCell = this.focusService.getFocusedCell();
    const eDocument = this.gos.getDocument();
    const activeEl = this.gos.getActiveDomElement();
    if (!activeEl || activeEl === eDocument.body) {
      if (focusedCell) {
        const { rowIndex, rowPinned, column } = focusedCell;
        this.focusService.setFocusedCell({
          rowIndex,
          column,
          rowPinned,
          forceBrowserFocus: true,
          preventScrollOnBrowserFocus: true
        });
      } else {
        this.focusHeaderCell(restoreFocusParams);
      }
    }
  }
  onContextMenu(mouseEvent, touchEvent, showMenuCallback) {
    if (!this.gos.get("allowContextMenuWithControlKey")) {
      if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
        return;
      }
    }
    if (mouseEvent) {
      this.blockMiddleClickScrollsIfNeeded(mouseEvent);
    }
    if (this.gos.get("suppressContextMenu")) {
      return;
    }
    const eventOrTouch = mouseEvent ?? touchEvent.touches[0];
    if (showMenuCallback(eventOrTouch)) {
      const event = mouseEvent ?? touchEvent;
      if (event && event.cancelable) {
        event.preventDefault();
      }
    }
  }
  focusHeaderCell(restoreFocusParams) {
    const { column, columnIndex, headerPosition, eventSource } = restoreFocusParams;
    const isColumnStillVisible = this.visibleColsService.getAllCols().some((col) => col === column);
    if (isColumnStillVisible && eventSource && _isVisible(eventSource)) {
      const focusableEl = this.focusService.findTabbableParent(eventSource);
      if (focusableEl) {
        if (column) {
          this.headerNavigationService.scrollToColumn(column);
        }
        focusableEl.focus();
      }
    } else if (headerPosition && columnIndex !== -1) {
      const allColumns = this.visibleColsService.getAllCols();
      const columnToFocus = allColumns[columnIndex] || _last(allColumns);
      if (columnToFocus) {
        this.focusService.focusHeaderPosition({
          headerPosition: {
            headerRowIndex: headerPosition.headerRowIndex,
            column: columnToFocus
          }
        });
      }
    }
  }
  blockMiddleClickScrollsIfNeeded(mouseEvent) {
    if (this.gos.get("suppressMiddleClickScrolls") && mouseEvent.which === 2) {
      mouseEvent.preventDefault();
    }
  }
};

// enterprise-modules/menu/src/version.ts
var VERSION = "32.0.0";

// enterprise-modules/menu/src/menuModule.ts
var MenuCoreModule = {
  version: VERSION,
  moduleName: `${ModuleNames5.MenuModule}-core`,
  beans: [
    EnterpriseMenuFactory,
    ContextMenuFactory,
    MenuItemMapper,
    ChartMenuItemMapper,
    ColumnChooserFactory,
    ColumnMenuFactory,
    MenuUtils
  ],
  dependantModules: [EnterpriseCoreModule],
  userComponents: [
    {
      name: "agMenuItem",
      classImp: AgMenuItemRenderer
    }
  ]
};
var MenuApiModule = {
  version: VERSION,
  moduleName: `${ModuleNames5.MenuModule}-api`,
  apiFunctions: {
    showContextMenu,
    showColumnChooser,
    hideColumnChooser
  },
  dependantModules: [MenuCoreModule, _CommunityMenuApiModule]
};
var MenuModule = {
  version: VERSION,
  moduleName: ModuleNames5.MenuModule,
  dependantModules: [MenuCoreModule, MenuApiModule]
};
export {
  MenuModule
};
//# sourceMappingURL=main.esm.mjs.map
