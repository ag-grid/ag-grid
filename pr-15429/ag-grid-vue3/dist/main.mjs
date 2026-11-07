var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { defineComponent, h, createVNode, render, isRef, isReactive, isProxy, toRaw, mergeModels, useTemplateRef, shallowRef, toRefs, watch, useModel, getCurrentInstance, onMounted, markRaw, onUnmounted, createElementBlock, openBlock, mergeDefaults } from "vue";
import { _errorForGrid, _errorWithoutAttribution, BaseComponentWrapper, _warnForGrid, VanillaFrameworkOverrides, _GET_SHALLOW_GRID_OPTIONS, _GET_ALL_GRID_OPTIONS, _processOnChange, _registerModule, RowApiModule, _combineAttributesAndGridOptions, _PUBLIC_EVENT_HANDLERS_MAP, createGrid, ALWAYS_SYNC_GLOBAL_EVENTS } from "ag-grid-community";
const SLOT_ELIGIBLE_PROPERTY_NAMES = /* @__PURE__ */ new Set(["cellRenderer"]);
const _VueComponentFactory = class _VueComponentFactory {
  // hasOwnProperty guards against the internal slots object's prototype (e.g. `toString`,
  // `constructor`) being mistaken for a real slot.
  static hasSlot(parent, name) {
    return !!parent.slots && Object.prototype.hasOwnProperty.call(parent.slots, name) && typeof parent.slots[name] === "function";
  }
  static getOrCreateCache(cache, parent) {
    let parentCache = cache.get(parent);
    if (!parentCache) {
      parentCache = /* @__PURE__ */ new Map();
      cache.set(parent, parentCache);
    }
    return parentCache;
  }
  static getComponentDefinition(component, parent, gridId, propertyName) {
    let componentDefinition;
    if (typeof component === "string") {
      componentDefinition = propertyName != null && SLOT_ELIGIBLE_PROPERTY_NAMES.has(propertyName) && this.hasSlot(parent, component) ? this.getSlotComponentDefinition(parent, component) : this.searchForComponentInstance(parent, component, 10, false, gridId);
    } else {
      componentDefinition = { extends: defineComponent({ ...component }) };
    }
    if (!componentDefinition) {
      if (gridId) {
        _errorForGrid(gridId, 114, { component });
      } else {
        _errorWithoutAttribution(114, { component });
      }
    }
    if (componentDefinition.extends) {
      if (componentDefinition.extends.setup) {
        componentDefinition.setup = componentDefinition.extends.setup;
      }
      componentDefinition.extends.props = this.addParamsToProps(componentDefinition.extends.props);
    } else {
      componentDefinition.props = this.addParamsToProps(componentDefinition.props);
    }
    return componentDefinition;
  }
  static getSlotComponentDefinition(parent, slotName) {
    const parentCache = this.getOrCreateCache(this.slotComponentCache, parent);
    let componentDefinition = parentCache.get(slotName);
    if (!componentDefinition) {
      componentDefinition = defineComponent({
        props: { params: { type: Object, required: true } },
        setup(props) {
          return () => {
            var _a, _b;
            const rendered = (_b = (_a = parent.slots)[slotName]) == null ? void 0 : _b.call(_a, props.params);
            let nodes;
            if (Array.isArray(rendered)) {
              nodes = rendered;
            } else {
              nodes = rendered != null ? [rendered] : [];
            }
            const [only] = nodes;
            const isSingleElementNode = nodes.length === 1 && typeof only.type === "string";
            return isSingleElementNode ? only : h("span", nodes);
          };
        }
      });
      parentCache.set(slotName, componentDefinition);
    }
    return componentDefinition;
  }
  static addParamsToProps(props) {
    if (!props || Array.isArray(props) && props.indexOf("params") === -1) {
      props = ["params", ...props ? props : []];
    } else if (typeof props === "object" && !props.params) {
      props["params"] = {
        type: Object
      };
    }
    return props;
  }
  static createAndMountComponent(component, params, parent, provides, gridId, propertyName) {
    const componentDefinition = _VueComponentFactory.getComponentDefinition(component, parent, gridId, propertyName);
    if (!componentDefinition) {
      return;
    }
    const { vNode, destroy, el } = this.mount(
      componentDefinition,
      { params: Object.freeze(params) },
      parent,
      provides || {}
    );
    return {
      componentInstance: vNode.component.proxy,
      element: el,
      destroy
    };
  }
  static mount(component, props, parent, provides) {
    let vNode = createVNode(component, props);
    vNode.appContext = { ...parent.appContext, provides };
    let el = document.createDocumentFragment();
    render(vNode, el);
    const destroy = () => {
      if (el) {
        render(null, el);
      }
      el = null;
      vNode = null;
    };
    return { vNode, destroy, el };
  }
  static searchForComponentInstance(parent, component, maxDepth = 10, suppressError = false, gridId) {
    const parentCache = this.componentCache.get(parent);
    if (parentCache) {
      const cached = parentCache.get(component);
      if (cached !== void 0) {
        return cached;
      }
    }
    let componentInstance = null;
    let depth = 0;
    let currentParent = parent.parent;
    while (!componentInstance && currentParent && currentParent.components && ++depth < maxDepth) {
      if (currentParent.components && currentParent.components[component]) {
        componentInstance = currentParent.components[component];
      }
      currentParent = currentParent.parent;
    }
    depth = 0;
    currentParent = parent.parent;
    while (!componentInstance && currentParent && currentParent.$options && ++depth < maxDepth) {
      const currentParentAsThis = currentParent;
      if (currentParentAsThis.$options && currentParentAsThis.$options.components && currentParentAsThis.$options.components[component]) {
        componentInstance = currentParentAsThis.$options.components[component];
      } else if (currentParentAsThis[component]) {
        componentInstance = currentParentAsThis[component];
      }
      currentParent = currentParent.parent;
    }
    depth = 0;
    currentParent = parent.parent;
    while (!componentInstance && currentParent && ++depth < maxDepth) {
      if (currentParent.exposed) {
        const currentParentAsThis = currentParent;
        if (currentParentAsThis.exposed && currentParentAsThis.exposed[component]) {
          componentInstance = currentParentAsThis.exposed[component];
        } else if (currentParentAsThis[component]) {
          componentInstance = currentParentAsThis[component];
        }
      }
      currentParent = currentParent.parent;
    }
    if (!componentInstance) {
      const components = parent.appContext.components;
      if (components && components[component]) {
        componentInstance = components[component];
      }
    }
    if (!componentInstance && !suppressError) {
      if (gridId) {
        _errorForGrid(gridId, 114, { component });
      } else {
        _errorWithoutAttribution(114, { component });
      }
      return null;
    }
    if (componentInstance) {
      this.getOrCreateCache(this.componentCache, parent).set(component, componentInstance);
    }
    return componentInstance;
  }
};
// WeakMap avoids repeat component tree traversals and allows GC of parent components
__publicField(_VueComponentFactory, "componentCache", /* @__PURE__ */ new WeakMap());
// Separate from componentCache: a name can resolve to a slot on one lookup and, if that slot
// is later removed, to a registered component on the next — the two must not collide.
__publicField(_VueComponentFactory, "slotComponentCache", /* @__PURE__ */ new WeakMap());
let VueComponentFactory = _VueComponentFactory;
class VueFrameworkComponentWrapper extends BaseComponentWrapper {
  constructor(parent, provides) {
    super();
    __publicField(this, "parent");
    __publicField(this, "provides");
    this.parent = parent;
    this.provides = provides;
  }
  createWrapper(component, componentType) {
    const that = this;
    const propertyName = componentType == null ? void 0 : componentType.name;
    class DynamicComponent extends VueComponent {
      init(params) {
        super.init(params);
      }
      hasMethod(name) {
        var _a, _b;
        const componentInstance = wrapper.getFrameworkComponentInstance();
        if (!componentInstance[name]) {
          return ((_a = componentInstance.$.exposed) == null ? void 0 : _a[name]) != null || ((_b = componentInstance.exposed) == null ? void 0 : _b[name]) != null || componentInstance.$.setupState[name] != null;
        } else {
          return true;
        }
      }
      callMethod(name, args) {
        var _a, _b;
        const componentInstance = this.getFrameworkComponentInstance();
        const frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
        if (frameworkComponentInstance[name]) {
          return frameworkComponentInstance[name].apply(componentInstance, args);
        } else {
          const fn = ((_a = componentInstance.$.exposed) == null ? void 0 : _a[name]) || ((_b = componentInstance.exposed) == null ? void 0 : _b[name]) || componentInstance.$.setupState[name];
          return fn == null ? void 0 : fn.apply(componentInstance, args);
        }
      }
      addMethod(name, callback) {
        wrapper[name] = callback;
      }
      processMethod(methodName, args) {
        if (methodName === "refresh") {
          this.getFrameworkComponentInstance().params = Object.freeze(args[0]);
        }
        if (this.hasMethod(methodName)) {
          return this.callMethod(methodName, args);
        }
        return methodName === "refresh";
      }
      createComponent(params) {
        return that.createComponent(component, params, propertyName);
      }
    }
    const wrapper = new DynamicComponent();
    return wrapper;
  }
  createComponent(component, params, propertyName) {
    return VueComponentFactory.createAndMountComponent(
      component,
      params,
      this.parent,
      this.provides,
      this.gridId,
      propertyName
    );
  }
  createMethodProxy(wrapper, methodName, mandatory) {
    const gridId = this.gridId;
    return function() {
      if (wrapper.hasMethod(methodName)) {
        return wrapper.callMethod(methodName, arguments);
      }
      if (mandatory) {
        _warnForGrid(gridId, 233, { methodName });
      }
      return null;
    };
  }
  destroy() {
    this.parent = null;
  }
}
class VueComponent {
  constructor() {
    __publicField(this, "componentInstance");
    __publicField(this, "element");
    __publicField(this, "unmount");
  }
  getGui() {
    return this.element;
  }
  destroy() {
    var _a;
    if (this.getFrameworkComponentInstance() && typeof this.getFrameworkComponentInstance().destroy === "function") {
      this.getFrameworkComponentInstance().destroy();
    }
    (_a = this.unmount) == null ? void 0 : _a.call(this);
  }
  getFrameworkComponentInstance() {
    return this.componentInstance;
  }
  init(params) {
    const { componentInstance, element, destroy: unmount } = this.createComponent(params);
    this.componentInstance = componentInstance;
    this.unmount = unmount;
    this.element = element.firstElementChild ?? element;
  }
}
class VueFrameworkOverrides extends VanillaFrameworkOverrides {
  constructor(parent) {
    super("vue");
    __publicField(this, "parent");
    this.parent = parent;
  }
  /*
   * vue components are specified in the "components" part of the vue component - as such we need a way to determine
   * if a given component is within that context - this method provides this
   * Note: This is only really used/necessary with cellRendererSelectors
   */
  frameworkComponent(name, components, propertyName) {
    const slotEligible = propertyName === "cellRenderer";
    if (slotEligible && VueComponentFactory.hasSlot(this.parent, name)) {
      return name;
    }
    let result = VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true) ? name : null;
    if (!result && components && components[name]) {
      const indirectName = components[name];
      result = slotEligible && VueComponentFactory.hasSlot(this.parent, indirectName) || VueComponentFactory.searchForComponentInstance(this.parent, indirectName, 10, true) ? indirectName : null;
    }
    return result;
  }
  isFrameworkComponent(comp) {
    return comp !== null && typeof comp === "object" && !Array.isArray(comp);
  }
}
function getProps() {
  return {
    gridOptions: {},
    modules: [],
    // @START_DEFAULTS@
    toolbar: void 0,
    statusBar: void 0,
    sideBar: void 0,
    suppressContextMenu: void 0,
    preventDefaultOnContextMenu: void 0,
    allowContextMenuWithControlKey: void 0,
    columnMenu: void 0,
    suppressMenuHide: void 0,
    enableBrowserTooltips: void 0,
    tooltipTrigger: void 0,
    tooltipShowDelay: void 0,
    tooltipSwitchShowDelay: void 0,
    tooltipHideDelay: void 0,
    tooltipMouseTrack: void 0,
    tooltipShowMode: void 0,
    tooltipInteraction: void 0,
    popupParent: void 0,
    copyHeadersToClipboard: void 0,
    copyGroupHeadersToClipboard: void 0,
    clipboardDelimiter: void 0,
    suppressCopyRowsToClipboard: void 0,
    suppressCopySingleCellRanges: void 0,
    suppressLastEmptyLineOnPaste: void 0,
    suppressClipboardPaste: void 0,
    suppressClipboardApi: void 0,
    suppressCutToClipboard: void 0,
    columnDefs: void 0,
    defaultColDef: void 0,
    defaultColGroupDef: void 0,
    columnTypes: void 0,
    dataTypeDefinitions: void 0,
    calculatedColumns: void 0,
    columnHeaderEdit: void 0,
    maintainColumnOrder: void 0,
    enableStrictPivotColumnOrder: void 0,
    suppressFieldDotNotation: void 0,
    headerHeight: void 0,
    groupHeaderHeight: void 0,
    floatingFiltersHeight: void 0,
    pivotHeaderHeight: void 0,
    pivotGroupHeaderHeight: void 0,
    hidePaddedHeaderRows: void 0,
    allowDragFromColumnsToolPanel: void 0,
    suppressMovableColumns: void 0,
    suppressColumnMoveAnimation: void 0,
    suppressMoveWhenColumnDragging: void 0,
    suppressDragLeaveHidesColumns: void 0,
    suppressGroupChangesColumnVisibility: void 0,
    suppressMakeColumnVisibleAfterUnGroup: void 0,
    suppressRowGroupHidesColumns: void 0,
    colResizeDefault: void 0,
    suppressAutoSize: void 0,
    autoSizePadding: void 0,
    skipHeaderOnAutoSize: void 0,
    autoSizeStrategy: void 0,
    animateColumnResizing: void 0,
    components: void 0,
    editType: void 0,
    suppressStartEditOnTab: void 0,
    getFullRowEditValidationErrors: void 0,
    invalidEditValueMode: void 0,
    singleClickEdit: void 0,
    suppressClickEdit: void 0,
    readOnlyEdit: void 0,
    stopEditingWhenCellsLoseFocus: void 0,
    enterNavigatesVertically: void 0,
    enterNavigatesVerticallyAfterEdit: void 0,
    enableCellEditingOnBackspace: void 0,
    undoRedoCellEditing: void 0,
    undoRedoCellEditingLimit: void 0,
    defaultCsvExportParams: void 0,
    suppressCsvExport: void 0,
    defaultExcelExportParams: void 0,
    suppressExcelExport: void 0,
    defaultPdfExportParams: void 0,
    suppressPdfExport: void 0,
    excelStyles: void 0,
    findSearchValue: void 0,
    findOptions: void 0,
    quickFilterText: void 0,
    cacheQuickFilter: void 0,
    includeHiddenColumnsInQuickFilter: void 0,
    quickFilterParser: void 0,
    quickFilterMatcher: void 0,
    applyQuickFilterBeforePivotOrAgg: void 0,
    excludeChildrenWhenTreeDataFiltering: void 0,
    enableAdvancedFilter: void 0,
    alwaysPassFilter: void 0,
    includeHiddenColumnsInAdvancedFilter: void 0,
    advancedFilterParent: void 0,
    advancedFilterBuilderParams: void 0,
    advancedFilterParams: void 0,
    suppressAdvancedFilterEval: void 0,
    suppressSetFilterByDefault: void 0,
    enableFilterHandlers: void 0,
    filterHandlers: void 0,
    enableCharts: void 0,
    includeHiddenColumnsInCharts: void 0,
    chartThemes: void 0,
    customChartThemes: void 0,
    chartThemeOverrides: void 0,
    chartToolPanelsDef: void 0,
    chartMenuItems: void 0,
    loadingCellRenderer: void 0,
    loadingCellRendererParams: void 0,
    loadingCellRendererSelector: void 0,
    localeText: void 0,
    masterDetail: void 0,
    keepDetailRows: void 0,
    keepDetailRowsCount: void 0,
    detailCellRenderer: void 0,
    detailCellRendererParams: void 0,
    detailRowHeight: void 0,
    detailRowAutoHeight: void 0,
    context: void 0,
    alignedGrids: void 0,
    tabIndex: void 0,
    suppressInputClearButton: void 0,
    enableInputAutoComplete: void 0,
    rowBuffer: void 0,
    valueCache: void 0,
    valueCacheNeverExpires: void 0,
    enableCellExpressions: void 0,
    suppressTouch: void 0,
    suppressFocusAfterRefresh: void 0,
    suppressBrowserResizeObserver: void 0,
    suppressPropertyNamesCheck: void 0,
    suppressChangeDetection: void 0,
    debug: void 0,
    loading: void 0,
    loadingRows: void 0,
    overlayLoadingTemplate: void 0,
    loadingOverlayComponent: void 0,
    loadingOverlayComponentParams: void 0,
    suppressLoadingOverlay: void 0,
    overlayNoRowsTemplate: void 0,
    noRowsOverlayComponent: void 0,
    noRowsOverlayComponentParams: void 0,
    suppressNoRowsOverlay: void 0,
    suppressOverlays: void 0,
    overlayComponent: void 0,
    overlayComponentParams: void 0,
    overlayComponentSelector: void 0,
    activeOverlay: void 0,
    activeOverlayParams: void 0,
    processFileInput: void 0,
    pagination: void 0,
    paginationPageSize: void 0,
    paginationPageSizeSelector: void 0,
    paginationAutoPageSize: void 0,
    paginateChildRows: void 0,
    suppressPaginationPanel: void 0,
    paginationPanels: void 0,
    pivotMode: void 0,
    pivotPanelShow: void 0,
    pivotMaxGeneratedColumns: void 0,
    pivotDefaultExpanded: void 0,
    pivotColumnGroupTotals: void 0,
    pivotRowTotals: void 0,
    pivotSuppressAutoColumn: void 0,
    suppressExpandablePivotGroups: void 0,
    functionsReadOnly: void 0,
    aggFuncs: void 0,
    formulaDataSource: void 0,
    notesDataSource: void 0,
    noteTrigger: void 0,
    noteShowDelay: void 0,
    noteHideDelay: void 0,
    formulaFuncs: void 0,
    suppressAggFuncInHeader: void 0,
    alwaysAggregateAtRootLevel: void 0,
    aggregateOnlyChangedColumns: void 0,
    suppressAggFilteredOnly: void 0,
    removePivotHeaderRowWhenSingleValueColumn: void 0,
    animateRows: void 0,
    cellFlashDuration: void 0,
    cellFadeDuration: void 0,
    allowShowChangeAfterFilter: void 0,
    domLayout: void 0,
    ensureDomOrder: void 0,
    enableCellSpan: void 0,
    enableRtl: void 0,
    suppressColumnVirtualisation: void 0,
    suppressMaxRenderedRowRestriction: void 0,
    suppressRowVirtualisation: void 0,
    rowDragManaged: void 0,
    refreshAfterGroupEdit: void 0,
    rowDragInsertDelay: void 0,
    suppressRowDrag: void 0,
    suppressMoveWhenRowDragging: void 0,
    rowDragEntireRow: void 0,
    rowDragMultiRow: void 0,
    rowDragText: void 0,
    dragAndDropImageComponent: void 0,
    dragAndDropImageComponentParams: void 0,
    fullWidthCellRenderer: void 0,
    fullWidthCellRendererParams: void 0,
    embedFullWidthRows: void 0,
    groupDisplayType: void 0,
    groupDefaultExpanded: void 0,
    masterDefaultExpanded: void 0,
    autoGroupColumnDef: void 0,
    groupMaintainOrder: void 0,
    groupSelectsChildren: void 0,
    groupLockGroupColumns: void 0,
    groupAggFiltering: void 0,
    groupTotalRow: void 0,
    grandTotalRow: void 0,
    suppressStickyTotalRow: void 0,
    groupSuppressBlankHeader: void 0,
    groupSelectsFiltered: void 0,
    showOpenedGroup: void 0,
    groupHideParentOfSingleChild: void 0,
    groupRemoveSingleChildren: void 0,
    groupRemoveLowestSingleChildren: void 0,
    groupHideOpenParents: void 0,
    groupHideColumnsUntilExpanded: void 0,
    groupAllowUnbalanced: void 0,
    rowGroupPanelShow: void 0,
    groupRowRenderer: void 0,
    groupRowRendererParams: void 0,
    treeData: void 0,
    treeDataChildrenField: void 0,
    treeDataParentIdField: void 0,
    rowGroupPanelSuppressSort: void 0,
    pivotPanelSuppressSort: void 0,
    suppressGroupRowsSticky: void 0,
    stickyRowsMaxViewportRatio: void 0,
    groupHierarchyConfig: void 0,
    pinnedTopRowData: void 0,
    pinnedBottomRowData: void 0,
    enableRowPinning: void 0,
    isRowPinnable: void 0,
    isRowPinned: void 0,
    rowModelType: void 0,
    rowData: void 0,
    asyncTransactionWaitMillis: void 0,
    suppressModelUpdateAfterUpdateTransaction: void 0,
    datasource: void 0,
    cacheOverflowSize: void 0,
    infiniteInitialRowCount: void 0,
    serverSideInitialRowCount: void 0,
    suppressServerSideFullWidthLoadingRow: void 0,
    cacheBlockSize: void 0,
    maxBlocksInCache: void 0,
    maxConcurrentDatasourceRequests: void 0,
    blockLoadDebounceMillis: void 0,
    purgeClosedRowNodes: void 0,
    serverSideDatasource: void 0,
    serverSideSortAllLevels: void 0,
    serverSideEnableClientSideSort: void 0,
    serverSideOnlyRefreshFilteredGroups: void 0,
    serverSidePivotResultFieldSeparator: void 0,
    viewportDatasource: void 0,
    viewportRowModelPageSize: void 0,
    viewportRowModelBufferSize: void 0,
    alwaysShowHorizontalScroll: void 0,
    alwaysShowVerticalScroll: void 0,
    debounceVerticalScrollbar: void 0,
    suppressHorizontalScroll: void 0,
    suppressScrollOnNewData: void 0,
    suppressScrollWhenPopupsAreOpen: void 0,
    suppressAnimationFrame: void 0,
    suppressMiddleClickScrolls: void 0,
    suppressPreventDefaultOnMouseWheel: void 0,
    scrollbarWidth: void 0,
    rowSelection: void 0,
    cellSelection: void 0,
    rowMultiSelectWithClick: void 0,
    suppressRowDeselection: void 0,
    suppressRowClickSelection: void 0,
    suppressCellFocus: void 0,
    suppressHeaderFocus: void 0,
    selectionColumnDef: void 0,
    rowNumbers: void 0,
    suppressMultiRangeSelection: void 0,
    enableCellTextSelection: void 0,
    enableRangeSelection: void 0,
    enableRangeHandle: void 0,
    enableFillHandle: void 0,
    fillHandleDirection: void 0,
    suppressClearOnFillReduction: void 0,
    sortingOrder: void 0,
    accentedSort: void 0,
    unSortIcon: void 0,
    suppressMultiSort: void 0,
    alwaysMultiSort: void 0,
    multiSortKey: void 0,
    suppressMaintainUnsortedOrder: void 0,
    icons: void 0,
    rowHeight: void 0,
    rowStyle: void 0,
    rowClass: void 0,
    rowClassRules: void 0,
    suppressRowHoverHighlight: void 0,
    suppressRowTransform: void 0,
    suppressContentVisibilityAuto: void 0,
    enableContentVisibilityAuto: void 0,
    contentVisibilityAutoDelay: void 0,
    columnHoverHighlight: void 0,
    gridId: void 0,
    deltaSort: void 0,
    treeDataDisplayType: void 0,
    enableGroupEdit: void 0,
    initialState: void 0,
    theme: void 0,
    loadThemeGoogleFonts: void 0,
    themeCssLayer: void 0,
    styleNonce: void 0,
    themeStyleContainer: void 0,
    getContextMenuItems: void 0,
    getMainMenuItems: void 0,
    getColumnMenuItems: void 0,
    postProcessPopup: void 0,
    processUnpinnedColumns: void 0,
    processCellForClipboard: void 0,
    processHeaderForClipboard: void 0,
    processGroupHeaderForClipboard: void 0,
    processCellFromClipboard: void 0,
    sendToClipboard: void 0,
    processDataFromClipboard: void 0,
    isExternalFilterPresent: void 0,
    doesExternalFilterPass: void 0,
    getChartToolbarItems: void 0,
    createChartContainer: void 0,
    focusGridInnerElement: void 0,
    navigateToNextHeader: void 0,
    tabToNextHeader: void 0,
    navigateToNextCell: void 0,
    tabToNextCell: void 0,
    tabToNextGridContainer: void 0,
    getLocaleText: void 0,
    getDocument: void 0,
    paginationNumberFormatter: void 0,
    getGroupRowAgg: void 0,
    isGroupOpenByDefault: void 0,
    isMasterOpenByDefault: void 0,
    ssrmExpandAllAffectsAllRows: void 0,
    initialGroupOrderComparator: void 0,
    processPivotResultColDef: void 0,
    processPivotResultColGroupDef: void 0,
    getDataPath: void 0,
    getChildCount: void 0,
    getServerSideGroupLevelParams: void 0,
    isServerSideGroupOpenByDefault: void 0,
    isApplyServerSideTransaction: void 0,
    isServerSideGroup: void 0,
    getServerSideGroupKey: void 0,
    getBusinessKeyForNode: void 0,
    getRowId: void 0,
    resetRowDataOnUpdate: void 0,
    autoGenerateColumnDefs: void 0,
    processAutoGeneratedColumnDefs: void 0,
    processRowPostCreate: void 0,
    isRowSelectable: void 0,
    isRowMaster: void 0,
    fillOperation: void 0,
    postSortRows: void 0,
    getRowStyle: void 0,
    getRowClass: void 0,
    getRowHeight: void 0,
    isFullWidthRow: void 0,
    isRowValidDropPosition: void 0,
    // @END_DEFAULTS@
    // @START_EVENT_PROPS@
    "onColumn-everything-changed": void 0,
    "onNew-columns-loaded": void 0,
    "onColumn-pivot-mode-changed": void 0,
    "onPivot-max-columns-exceeded": void 0,
    "onColumn-row-group-changed": void 0,
    "onExpand-or-collapse-all": void 0,
    "onColumn-pivot-changed": void 0,
    "onGrid-columns-changed": void 0,
    "onColumn-value-changed": void 0,
    "onColumn-moved": void 0,
    "onColumn-visible": void 0,
    "onColumn-pinned": void 0,
    "onColumn-header-name-changed": void 0,
    "onColumn-group-opened": void 0,
    "onColumn-resized": void 0,
    "onDisplayed-columns-changed": void 0,
    "onVirtual-columns-changed": void 0,
    "onColumn-header-mouse-over": void 0,
    "onColumn-header-mouse-leave": void 0,
    "onColumn-header-clicked": void 0,
    "onColumn-header-context-menu": void 0,
    "onAsync-transactions-flushed": void 0,
    "onRow-group-opened": void 0,
    "onRow-data-updated": void 0,
    "onPinned-row-data-changed": void 0,
    "onPinned-rows-changed": void 0,
    "onRange-selection-changed": void 0,
    "onCell-selection-changed": void 0,
    "onChart-created": void 0,
    "onChart-range-selection-changed": void 0,
    "onChart-options-changed": void 0,
    "onChart-destroyed": void 0,
    "onTool-panel-visible-changed": void 0,
    "onTool-panel-size-changed": void 0,
    "onModel-updated": void 0,
    "onCut-start": void 0,
    "onCut-end": void 0,
    "onPaste-start": void 0,
    "onPaste-end": void 0,
    "onCalculated-column-created": void 0,
    "onCalculated-column-expression-changed": void 0,
    "onCalculated-column-removed": void 0,
    "onCalculated-column-validation-state-changed": void 0,
    "onFill-start": void 0,
    "onFill-end": void 0,
    "onCell-selection-delete-start": void 0,
    "onCell-selection-delete-end": void 0,
    "onRange-delete-start": void 0,
    "onRange-delete-end": void 0,
    "onUndo-started": void 0,
    "onUndo-ended": void 0,
    "onRedo-started": void 0,
    "onRedo-ended": void 0,
    "onCell-clicked": void 0,
    "onCell-double-clicked": void 0,
    "onCell-mouse-down": void 0,
    "onCell-context-menu": void 0,
    "onCell-value-changed": void 0,
    "onCell-edit-request": void 0,
    "onRow-value-changed": void 0,
    "onHeader-focused": void 0,
    "onCell-focused": void 0,
    "onRow-selected": void 0,
    "onSelection-changed": void 0,
    "onTooltip-show": void 0,
    "onTooltip-hide": void 0,
    "onCell-key-down": void 0,
    "onCell-mouse-over": void 0,
    "onCell-mouse-out": void 0,
    "onFilter-changed": void 0,
    "onFilter-modified": void 0,
    "onFilter-ui-changed": void 0,
    "onFilter-opened": void 0,
    "onFloating-filter-ui-changed": void 0,
    "onAdvanced-filter-builder-visible-changed": void 0,
    "onSort-changed": void 0,
    "onVirtual-row-removed": void 0,
    "onRow-clicked": void 0,
    "onRow-double-clicked": void 0,
    "onGrid-ready": void 0,
    "onGrid-pre-destroyed": void 0,
    "onGrid-size-changed": void 0,
    "onViewport-changed": void 0,
    "onFirst-data-rendered": void 0,
    "onDrag-started": void 0,
    "onDrag-stopped": void 0,
    "onDrag-cancelled": void 0,
    "onRow-editing-started": void 0,
    "onRow-editing-stopped": void 0,
    "onCell-editing-started": void 0,
    "onCell-editing-stopped": void 0,
    "onBody-scroll": void 0,
    "onBody-scroll-end": void 0,
    "onPagination-changed": void 0,
    "onComponent-state-changed": void 0,
    "onStore-refreshed": void 0,
    "onState-updated": void 0,
    "onColumn-menu-visible-changed": void 0,
    "onContext-menu-visible-changed": void 0,
    "onRow-drag-enter": void 0,
    "onRow-drag-move": void 0,
    "onRow-drag-leave": void 0,
    "onRow-drag-end": void 0,
    "onRow-drag-cancel": void 0,
    "onFind-changed": void 0,
    "onRow-resize-started": void 0,
    "onRow-resize-ended": void 0,
    "onColumns-reset": void 0,
    "onBulk-editing-started": void 0,
    "onBulk-editing-stopped": void 0,
    "onBatch-editing-started": void 0,
    "onBatch-editing-stopped": void 0,
    "onIssue-raised": void 0
    // @END_EVENT_PROPS@
  };
}
const debounce = (func, delay) => {
  let timeout;
  const debounced = () => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(func, delay);
  };
  debounced.cancel = () => {
    window.clearTimeout(timeout);
  };
  return debounced;
};
function isInputClass(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return false;
  }
  const proto = Object.getPrototypeOf(input);
  return proto !== null && proto !== Object.prototype;
}
function deepToRaw(sourceObj) {
  if (sourceObj === null || sourceObj === void 0 || typeof sourceObj !== "object") {
    return sourceObj;
  }
  const seen = /* @__PURE__ */ new WeakSet();
  const objectIterator = (input) => {
    if (input === null || input === void 0 || typeof input !== "object") {
      return input;
    }
    if (isRef(input)) {
      return objectIterator(input.value);
    }
    if (isReactive(input) || isProxy(input)) {
      return objectIterator(toRaw(input));
    }
    if (isInputClass(input)) {
      return toRaw(input);
    }
    if (Array.isArray(input)) {
      let needsCopy = false;
      for (let i = 0; i < input.length; i++) {
        const item = input[i];
        if (item !== null && typeof item === "object") {
          if (isRef(item) || isReactive(item) || isProxy(item)) {
            needsCopy = true;
            break;
          }
          needsCopy = true;
          break;
        }
      }
      return needsCopy ? input.map((item) => objectIterator(item)) : input;
    }
    if (seen.has(input)) {
      return input;
    }
    seen.add(input);
    const keys = Object.keys(input);
    const result = {};
    for (let i = 0; i < keys.length; i++) {
      result[keys[i]] = objectIterator(input[keys[i]]);
    }
    return result;
  };
  return objectIterator(sourceObj);
}
const _hoisted_1 = { ref: "root" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AgGridVue",
  props: /* @__PURE__ */ mergeModels(/* @__PURE__ */ mergeDefaults({
    gridOptions: {},
    modules: {},
    toolbar: {},
    statusBar: {},
    sideBar: { type: [Object, String, Array, Boolean, null] },
    suppressContextMenu: { type: Boolean },
    preventDefaultOnContextMenu: { type: Boolean },
    allowContextMenuWithControlKey: { type: Boolean },
    columnMenu: {},
    suppressMenuHide: { type: Boolean },
    enableBrowserTooltips: { type: Boolean },
    tooltipTrigger: {},
    tooltipShowDelay: {},
    tooltipSwitchShowDelay: {},
    tooltipHideDelay: {},
    tooltipMouseTrack: { type: Boolean },
    tooltipShowMode: {},
    tooltipInteraction: { type: Boolean },
    popupParent: {},
    copyHeadersToClipboard: { type: Boolean },
    copyGroupHeadersToClipboard: { type: Boolean },
    clipboardDelimiter: {},
    suppressCopyRowsToClipboard: { type: Boolean },
    suppressCopySingleCellRanges: { type: Boolean },
    suppressLastEmptyLineOnPaste: { type: Boolean },
    suppressClipboardPaste: { type: Boolean },
    suppressClipboardApi: { type: Boolean },
    suppressCutToClipboard: { type: Boolean },
    columnDefs: {},
    defaultColDef: {},
    defaultColGroupDef: {},
    columnTypes: {},
    dataTypeDefinitions: {},
    calculatedColumns: { type: [Boolean, Object] },
    columnHeaderEdit: {},
    maintainColumnOrder: { type: Boolean },
    enableStrictPivotColumnOrder: { type: Boolean },
    suppressFieldDotNotation: { type: Boolean },
    headerHeight: {},
    groupHeaderHeight: {},
    floatingFiltersHeight: {},
    pivotHeaderHeight: {},
    pivotGroupHeaderHeight: {},
    hidePaddedHeaderRows: { type: Boolean },
    allowDragFromColumnsToolPanel: { type: Boolean },
    suppressMovableColumns: { type: Boolean },
    suppressColumnMoveAnimation: { type: Boolean },
    suppressMoveWhenColumnDragging: { type: Boolean },
    suppressDragLeaveHidesColumns: { type: Boolean },
    suppressGroupChangesColumnVisibility: { type: [Boolean, String] },
    suppressMakeColumnVisibleAfterUnGroup: { type: Boolean },
    suppressRowGroupHidesColumns: { type: Boolean },
    colResizeDefault: {},
    suppressAutoSize: { type: Boolean },
    autoSizePadding: {},
    skipHeaderOnAutoSize: { type: Boolean },
    autoSizeStrategy: {},
    animateColumnResizing: { type: Boolean },
    components: {},
    editType: {},
    suppressStartEditOnTab: { type: Boolean },
    getFullRowEditValidationErrors: { type: Function },
    invalidEditValueMode: {},
    singleClickEdit: { type: Boolean },
    suppressClickEdit: { type: Boolean },
    readOnlyEdit: { type: Boolean },
    stopEditingWhenCellsLoseFocus: { type: Boolean },
    enterNavigatesVertically: { type: Boolean },
    enterNavigatesVerticallyAfterEdit: { type: Boolean },
    enableCellEditingOnBackspace: { type: Boolean },
    undoRedoCellEditing: { type: Boolean },
    undoRedoCellEditingLimit: {},
    defaultCsvExportParams: {},
    suppressCsvExport: { type: Boolean },
    defaultExcelExportParams: {},
    suppressExcelExport: { type: Boolean },
    defaultPdfExportParams: {},
    suppressPdfExport: { type: Boolean },
    excelStyles: {},
    findSearchValue: {},
    findOptions: {},
    quickFilterText: {},
    cacheQuickFilter: { type: Boolean },
    includeHiddenColumnsInQuickFilter: { type: Boolean },
    quickFilterParser: { type: Function },
    quickFilterMatcher: { type: Function },
    applyQuickFilterBeforePivotOrAgg: { type: Boolean },
    excludeChildrenWhenTreeDataFiltering: { type: Boolean },
    enableAdvancedFilter: { type: Boolean },
    alwaysPassFilter: { type: Function },
    includeHiddenColumnsInAdvancedFilter: { type: Boolean },
    advancedFilterParent: {},
    advancedFilterBuilderParams: {},
    advancedFilterParams: {},
    suppressAdvancedFilterEval: { type: Boolean },
    suppressSetFilterByDefault: { type: Boolean },
    enableFilterHandlers: { type: Boolean },
    filterHandlers: {},
    enableCharts: { type: Boolean },
    includeHiddenColumnsInCharts: { type: Boolean },
    chartThemes: {},
    customChartThemes: {},
    chartThemeOverrides: {},
    chartToolPanelsDef: {},
    chartMenuItems: { type: [Array, Function] },
    loadingCellRenderer: {},
    loadingCellRendererParams: {},
    loadingCellRendererSelector: { type: Function },
    localeText: {},
    masterDetail: { type: Boolean },
    keepDetailRows: { type: Boolean },
    keepDetailRowsCount: {},
    detailCellRenderer: {},
    detailCellRendererParams: {},
    detailRowHeight: {},
    detailRowAutoHeight: { type: Boolean },
    context: {},
    alignedGrids: { type: [Array, Function] },
    tabIndex: {},
    suppressInputClearButton: { type: Boolean },
    enableInputAutoComplete: { type: Boolean },
    rowBuffer: {},
    valueCache: { type: Boolean },
    valueCacheNeverExpires: { type: Boolean },
    enableCellExpressions: { type: Boolean },
    suppressTouch: { type: Boolean },
    suppressFocusAfterRefresh: { type: Boolean },
    suppressBrowserResizeObserver: { type: Boolean },
    suppressPropertyNamesCheck: { type: Boolean },
    suppressChangeDetection: { type: Boolean },
    debug: { type: Boolean },
    loading: { type: Boolean },
    loadingRows: { type: [Boolean, Object] },
    overlayLoadingTemplate: {},
    loadingOverlayComponent: {},
    loadingOverlayComponentParams: {},
    suppressLoadingOverlay: { type: Boolean },
    overlayNoRowsTemplate: {},
    noRowsOverlayComponent: {},
    noRowsOverlayComponentParams: {},
    suppressNoRowsOverlay: { type: Boolean },
    suppressOverlays: {},
    overlayComponent: {},
    overlayComponentParams: {},
    overlayComponentSelector: { type: Function },
    activeOverlay: {},
    activeOverlayParams: {},
    processFileInput: { type: Function },
    pagination: { type: Boolean },
    paginationPageSize: {},
    paginationPageSizeSelector: { type: [Array, Boolean] },
    paginationAutoPageSize: { type: Boolean },
    paginateChildRows: { type: Boolean },
    suppressPaginationPanel: { type: Boolean },
    paginationPanels: {},
    pivotMode: { type: Boolean },
    pivotPanelShow: {},
    pivotMaxGeneratedColumns: {},
    pivotDefaultExpanded: {},
    pivotColumnGroupTotals: {},
    pivotRowTotals: {},
    pivotSuppressAutoColumn: { type: Boolean },
    suppressExpandablePivotGroups: { type: Boolean },
    functionsReadOnly: { type: Boolean },
    aggFuncs: {},
    formulaDataSource: {},
    notesDataSource: {},
    noteTrigger: {},
    noteShowDelay: {},
    noteHideDelay: {},
    formulaFuncs: {},
    suppressAggFuncInHeader: { type: Boolean },
    alwaysAggregateAtRootLevel: { type: Boolean },
    aggregateOnlyChangedColumns: { type: Boolean },
    suppressAggFilteredOnly: { type: Boolean },
    removePivotHeaderRowWhenSingleValueColumn: { type: Boolean },
    animateRows: { type: Boolean },
    cellFlashDuration: {},
    cellFadeDuration: {},
    allowShowChangeAfterFilter: { type: Boolean },
    domLayout: {},
    ensureDomOrder: { type: Boolean },
    enableCellSpan: { type: Boolean },
    enableRtl: { type: Boolean },
    suppressColumnVirtualisation: { type: Boolean },
    suppressMaxRenderedRowRestriction: { type: Boolean },
    suppressRowVirtualisation: { type: Boolean },
    rowDragManaged: { type: Boolean },
    refreshAfterGroupEdit: { type: Boolean },
    rowDragInsertDelay: {},
    suppressRowDrag: { type: Boolean },
    suppressMoveWhenRowDragging: { type: Boolean },
    rowDragEntireRow: { type: Boolean },
    rowDragMultiRow: { type: Boolean },
    rowDragText: { type: Function },
    dragAndDropImageComponent: {},
    dragAndDropImageComponentParams: {},
    fullWidthCellRenderer: {},
    fullWidthCellRendererParams: {},
    embedFullWidthRows: { type: Boolean },
    groupDisplayType: {},
    groupDefaultExpanded: {},
    masterDefaultExpanded: {},
    autoGroupColumnDef: {},
    groupMaintainOrder: { type: Boolean },
    groupSelectsChildren: { type: Boolean },
    groupLockGroupColumns: {},
    groupAggFiltering: { type: [Boolean, Function] },
    groupTotalRow: { type: [String, Function] },
    grandTotalRow: {},
    suppressStickyTotalRow: { type: [Boolean, String] },
    groupSuppressBlankHeader: { type: Boolean },
    groupSelectsFiltered: { type: Boolean },
    showOpenedGroup: { type: Boolean },
    groupHideParentOfSingleChild: { type: [Boolean, String] },
    groupRemoveSingleChildren: { type: Boolean },
    groupRemoveLowestSingleChildren: { type: Boolean },
    groupHideOpenParents: { type: Boolean },
    groupHideColumnsUntilExpanded: { type: Boolean },
    groupAllowUnbalanced: { type: Boolean },
    rowGroupPanelShow: {},
    groupRowRenderer: {},
    groupRowRendererParams: {},
    treeData: { type: Boolean },
    treeDataChildrenField: {},
    treeDataParentIdField: {},
    rowGroupPanelSuppressSort: { type: Boolean },
    pivotPanelSuppressSort: { type: Boolean },
    suppressGroupRowsSticky: { type: Boolean },
    stickyRowsMaxViewportRatio: {},
    groupHierarchyConfig: {},
    pinnedTopRowData: {},
    pinnedBottomRowData: {},
    enableRowPinning: { type: [Boolean, String] },
    isRowPinnable: { type: Function },
    isRowPinned: { type: Function },
    rowModelType: {},
    rowData: {},
    asyncTransactionWaitMillis: {},
    suppressModelUpdateAfterUpdateTransaction: { type: Boolean },
    datasource: {},
    cacheOverflowSize: {},
    infiniteInitialRowCount: {},
    serverSideInitialRowCount: {},
    suppressServerSideFullWidthLoadingRow: { type: Boolean },
    cacheBlockSize: {},
    maxBlocksInCache: {},
    maxConcurrentDatasourceRequests: {},
    blockLoadDebounceMillis: {},
    purgeClosedRowNodes: { type: Boolean },
    serverSideDatasource: {},
    serverSideSortAllLevels: { type: Boolean },
    serverSideEnableClientSideSort: { type: Boolean },
    serverSideOnlyRefreshFilteredGroups: { type: Boolean },
    serverSidePivotResultFieldSeparator: {},
    viewportDatasource: {},
    viewportRowModelPageSize: {},
    viewportRowModelBufferSize: {},
    alwaysShowHorizontalScroll: { type: Boolean },
    alwaysShowVerticalScroll: { type: Boolean },
    debounceVerticalScrollbar: { type: Boolean },
    suppressHorizontalScroll: { type: Boolean },
    suppressScrollOnNewData: { type: Boolean },
    suppressScrollWhenPopupsAreOpen: { type: Boolean },
    suppressAnimationFrame: { type: Boolean },
    suppressMiddleClickScrolls: { type: Boolean },
    suppressPreventDefaultOnMouseWheel: { type: Boolean },
    scrollbarWidth: {},
    rowSelection: {},
    cellSelection: { type: [Boolean, Object] },
    rowMultiSelectWithClick: { type: Boolean },
    suppressRowDeselection: { type: Boolean },
    suppressRowClickSelection: { type: Boolean },
    suppressCellFocus: { type: Boolean },
    suppressHeaderFocus: { type: Boolean },
    selectionColumnDef: {},
    rowNumbers: { type: [Boolean, Object] },
    suppressMultiRangeSelection: { type: Boolean },
    enableCellTextSelection: { type: Boolean },
    enableRangeSelection: { type: Boolean },
    enableRangeHandle: { type: Boolean },
    enableFillHandle: { type: Boolean },
    fillHandleDirection: {},
    suppressClearOnFillReduction: { type: Boolean },
    sortingOrder: {},
    accentedSort: { type: Boolean },
    unSortIcon: { type: Boolean },
    suppressMultiSort: { type: Boolean },
    alwaysMultiSort: { type: Boolean },
    multiSortKey: {},
    suppressMaintainUnsortedOrder: { type: Boolean },
    icons: {},
    rowHeight: {},
    rowStyle: {},
    rowClass: {},
    rowClassRules: {},
    suppressRowHoverHighlight: { type: Boolean },
    suppressRowTransform: { type: Boolean },
    suppressContentVisibilityAuto: { type: Boolean },
    enableContentVisibilityAuto: { type: Boolean },
    contentVisibilityAutoDelay: {},
    columnHoverHighlight: { type: Boolean },
    gridId: {},
    deltaSort: { type: Boolean },
    treeDataDisplayType: {},
    enableGroupEdit: { type: Boolean },
    initialState: {},
    theme: {},
    loadThemeGoogleFonts: { type: Boolean },
    themeCssLayer: {},
    styleNonce: {},
    themeStyleContainer: { type: Function },
    getContextMenuItems: { type: Function },
    getMainMenuItems: { type: Function },
    getColumnMenuItems: { type: Function },
    postProcessPopup: { type: Function },
    processUnpinnedColumns: { type: Function },
    processCellForClipboard: { type: Function },
    processHeaderForClipboard: { type: Function },
    processGroupHeaderForClipboard: { type: Function },
    processCellFromClipboard: { type: Function },
    sendToClipboard: { type: Function },
    processDataFromClipboard: { type: Function },
    isExternalFilterPresent: { type: Function },
    doesExternalFilterPass: { type: Function },
    getChartToolbarItems: { type: Function },
    createChartContainer: { type: Function },
    focusGridInnerElement: { type: Function },
    navigateToNextHeader: { type: Function },
    tabToNextHeader: { type: Function },
    navigateToNextCell: { type: Function },
    tabToNextCell: { type: Function },
    tabToNextGridContainer: { type: Function },
    getLocaleText: { type: Function },
    getDocument: { type: Function },
    paginationNumberFormatter: { type: Function },
    getGroupRowAgg: { type: Function },
    isGroupOpenByDefault: { type: Function },
    isMasterOpenByDefault: { type: Function },
    ssrmExpandAllAffectsAllRows: { type: Boolean },
    initialGroupOrderComparator: { type: Function },
    processPivotResultColDef: { type: Function },
    processPivotResultColGroupDef: { type: Function },
    getDataPath: { type: Function },
    getChildCount: { type: Function },
    getServerSideGroupLevelParams: { type: Function },
    isServerSideGroupOpenByDefault: { type: Function },
    isApplyServerSideTransaction: { type: Function },
    isServerSideGroup: { type: Function },
    getServerSideGroupKey: { type: Function },
    getBusinessKeyForNode: { type: Function },
    getRowId: { type: Function },
    resetRowDataOnUpdate: { type: Boolean },
    autoGenerateColumnDefs: { type: [Boolean, Object] },
    processAutoGeneratedColumnDefs: { type: Function },
    processRowPostCreate: { type: Function },
    isRowSelectable: { type: Function },
    isRowMaster: { type: Function },
    fillOperation: { type: Function },
    postSortRows: { type: Function },
    getRowStyle: { type: Function },
    getRowClass: { type: Function },
    getRowHeight: { type: Function },
    isFullWidthRow: { type: Function },
    isRowValidDropPosition: { type: Function },
    "onTool-panel-visible-changed": {},
    "onTool-panel-size-changed": {},
    "onColumn-menu-visible-changed": {},
    "onContext-menu-visible-changed": {},
    "onCut-start": {},
    "onCut-end": {},
    "onPaste-start": {},
    "onPaste-end": {},
    "onCalculated-column-created": {},
    "onCalculated-column-expression-changed": {},
    "onCalculated-column-removed": {},
    "onCalculated-column-validation-state-changed": {},
    "onColumn-visible": {},
    "onColumn-pinned": {},
    "onColumn-header-name-changed": {},
    "onColumn-resized": {},
    "onColumn-moved": {},
    "onColumn-value-changed": {},
    "onColumn-pivot-mode-changed": {},
    "onColumn-pivot-changed": {},
    "onColumn-group-opened": {},
    "onNew-columns-loaded": {},
    "onGrid-columns-changed": {},
    "onDisplayed-columns-changed": {},
    "onVirtual-columns-changed": {},
    "onColumn-everything-changed": {},
    "onColumns-reset": {},
    "onColumn-header-mouse-over": {},
    "onColumn-header-mouse-leave": {},
    "onColumn-header-clicked": {},
    "onColumn-header-context-menu": {},
    "onComponent-state-changed": {},
    "onCell-value-changed": {},
    "onCell-edit-request": {},
    "onRow-value-changed": {},
    "onCell-editing-started": {},
    "onCell-editing-stopped": {},
    "onRow-editing-started": {},
    "onRow-editing-stopped": {},
    "onBulk-editing-started": {},
    "onBulk-editing-stopped": {},
    "onBatch-editing-started": {},
    "onBatch-editing-stopped": {},
    "onUndo-started": {},
    "onUndo-ended": {},
    "onRedo-started": {},
    "onRedo-ended": {},
    "onCell-selection-delete-start": {},
    "onCell-selection-delete-end": {},
    "onRange-delete-start": {},
    "onRange-delete-end": {},
    "onFill-start": {},
    "onFill-end": {},
    "onFilter-opened": {},
    "onFilter-changed": {},
    "onFilter-modified": {},
    "onFilter-ui-changed": {},
    "onFloating-filter-ui-changed": {},
    "onAdvanced-filter-builder-visible-changed": {},
    "onFind-changed": {},
    "onChart-created": {},
    "onChart-range-selection-changed": {},
    "onChart-options-changed": {},
    "onChart-destroyed": {},
    "onCell-key-down": {},
    "onGrid-ready": {},
    "onGrid-pre-destroyed": {},
    "onFirst-data-rendered": {},
    "onGrid-size-changed": {},
    "onModel-updated": {},
    "onVirtual-row-removed": {},
    "onViewport-changed": {},
    "onBody-scroll": {},
    "onBody-scroll-end": {},
    "onDrag-started": {},
    "onDrag-stopped": {},
    "onDrag-cancelled": {},
    "onState-updated": {},
    "onIssue-raised": {},
    "onPagination-changed": {},
    "onRow-drag-enter": {},
    "onRow-drag-move": {},
    "onRow-drag-leave": {},
    "onRow-drag-end": {},
    "onRow-drag-cancel": {},
    "onRow-resize-started": {},
    "onRow-resize-ended": {},
    "onColumn-row-group-changed": {},
    "onRow-group-opened": {},
    "onExpand-or-collapse-all": {},
    "onPivot-max-columns-exceeded": {},
    "onPinned-row-data-changed": {},
    "onPinned-rows-changed": {},
    "onRow-data-updated": {},
    "onAsync-transactions-flushed": {},
    "onStore-refreshed": {},
    "onHeader-focused": {},
    "onCell-clicked": {},
    "onCell-double-clicked": {},
    "onCell-focused": {},
    "onCell-mouse-over": {},
    "onCell-mouse-out": {},
    "onCell-mouse-down": {},
    "onRow-clicked": {},
    "onRow-double-clicked": {},
    "onRow-selected": {},
    "onSelection-changed": {},
    "onCell-context-menu": {},
    "onRange-selection-changed": {},
    "onCell-selection-changed": {},
    "onTooltip-show": {},
    "onTooltip-hide": {},
    "onSort-changed": {}
  }, getProps()), {
    "modelValue": {},
    "modelModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["update:modelValue"], ["update:modelValue"]),
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const rootRef = useTemplateRef("root");
    const api = shallowRef(void 0);
    const gridCreated = shallowRef(false);
    const isDestroyed = shallowRef(false);
    const gridReadyFired = shallowRef(false);
    let batchChanges = {};
    let batchScheduled = false;
    const propsAsRefs = toRefs(props);
    const shallowOptions = new Set(_GET_SHALLOW_GRID_OPTIONS());
    _GET_ALL_GRID_OPTIONS().filter((propertyName) => propertyName != "gridOptions").forEach((propertyName) => {
      const propRef = propsAsRefs[propertyName];
      if (!propRef) return;
      watch(
        propRef,
        (newValue, oldValue) => {
          if (propertyName === "rowData" && !emittingRowData.value || propertyName !== "rowData") {
            processChanges(propertyName, newValue);
          }
          if (propertyName === "rowData") {
            emittingRowData.value = false;
          }
        },
        shallowOptions.has(propertyName) ? void 0 : { deep: true }
      );
    });
    const ROW_DATA_EVENTS = /* @__PURE__ */ new Set(["rowDataUpdated", "cellValueChanged", "rowValueChanged"]);
    const rowDataModel = useModel(__props, "modelValue");
    const rowDataUpdating = shallowRef(false);
    const emittingRowData = shallowRef(false);
    const emits = __emit;
    watch(
      rowDataModel,
      (newValue, oldValue) => {
        if (gridCreated.value) {
          if (!emittingRowData.value) {
            rowDataUpdating.value = true;
            processChanges("rowData", deepToRaw(newValue), deepToRaw(oldValue));
          }
          emittingRowData.value = false;
        }
      },
      { deep: true }
    );
    const emitRowModel = debounce(() => {
      emittingRowData.value = true;
      emits("update:modelValue", getRowData());
    }, 10);
    const thisInstance = getCurrentInstance();
    const updateModelIfUsed = (eventType) => {
      var _a, _b;
      if (gridReadyFired.value && ROW_DATA_EVENTS.has(eventType)) {
        if ((_b = (_a = thisInstance == null ? void 0 : thisInstance.vnode) == null ? void 0 : _a.props) == null ? void 0 : _b["onUpdate:modelValue"]) {
          emitRowModel();
        }
      }
    };
    const getRowDataBasedOnBindings = () => {
      return rowDataModel.value || props.rowData || props.gridOptions.rowData;
    };
    const getRowData = () => {
      const rowData = [];
      api == null ? void 0 : api.value.forEachLeafNode((rowNode) => {
        rowData.push(rowNode.data);
      });
      return rowData;
    };
    const globalEventListenerFactory = (restrictToSyncOnly) => {
      return (eventType) => {
        if (isDestroyed.value) {
          return;
        }
        if (eventType === "gridReady") {
          gridReadyFired.value = true;
        }
        const alwaysSync = ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
        if (alwaysSync && !restrictToSyncOnly || !alwaysSync && restrictToSyncOnly) {
          return;
        }
        if (ROW_DATA_EVENTS.has(eventType)) {
          if (!rowDataUpdating.value && gridCreated.value) {
            updateModelIfUsed(eventType);
          }
          rowDataUpdating.value = false;
        }
      };
    };
    const processChanges = (propertyName, currentValue, _previousValue) => {
      if (gridCreated.value) {
        let value = currentValue;
        if (propertyName === "rowData" && value != void 0) {
          value = deepToRaw(value);
        }
        batchChanges[propertyName] = value;
        if (!batchScheduled) {
          batchScheduled = true;
          queueMicrotask(() => {
            batchScheduled = false;
            if (!isDestroyed.value && api.value) {
              _processOnChange(batchChanges, api.value);
            }
            batchChanges = {};
          });
        }
      }
    };
    const getProvides = () => {
      return Object.create(getCurrentInstance().provides);
    };
    onMounted(() => {
      _registerModule(RowApiModule, void 0);
      const frameworkComponentWrapper = new VueFrameworkComponentWrapper(getCurrentInstance(), getProvides());
      const gridParams = {
        globalListener: globalEventListenerFactory(),
        globalSyncListener: globalEventListenerFactory(true),
        frameworkOverrides: new VueFrameworkOverrides(getCurrentInstance()),
        providedBeanInstances: {
          frameworkCompWrapper: frameworkComponentWrapper
        },
        modules: props.modules
      };
      const gridOptions = markRaw(
        _combineAttributesAndGridOptions(deepToRaw(props.gridOptions), props, [
          ..._GET_ALL_GRID_OPTIONS(),
          // we could have replaced it with GRID_OPTIONS_VALIDATORS().allProperties,
          // but that prevents tree shaking of validation code in Vue
          ...Object.values(_PUBLIC_EVENT_HANDLERS_MAP)
        ])
      );
      const rowData = getRowDataBasedOnBindings();
      if (rowData !== void 0) {
        rowDataUpdating.value = true;
        gridOptions.rowData = deepToRaw(rowData);
      }
      api.value = createGrid(rootRef.value, gridOptions, gridParams);
      gridCreated.value = true;
    });
    onUnmounted(() => {
      var _a;
      if (gridCreated.value) {
        emitRowModel.cancel();
        (_a = api == null ? void 0 : api.value) == null ? void 0 : _a.destroy();
        isDestroyed.value = true;
      }
    });
    __expose({
      api
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, null, 512);
    };
  }
});
export {
  _sfc_main as AgGridVue
};
