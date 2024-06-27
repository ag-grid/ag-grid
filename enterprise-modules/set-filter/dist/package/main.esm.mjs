// enterprise-modules/set-filter/src/setFilterModule.ts
import { ModuleNames, _ColumnFilterModule, _FloatingFilterModule } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/set-filter/src/setFilter/setFilter.ts
import {
  AgInputTextFieldSelector,
  AgPromise as AgPromise3,
  GROUP_AUTO_COLUMN_ID,
  KeyCode,
  ProvidedFilter,
  RefPlaceholder as RefPlaceholder2,
  _areEqual,
  _last,
  _makeNull as _makeNull3,
  _setDisplayed as _setDisplayed2,
  _toStringOrNull as _toStringOrNull3,
  _warnOnce as _warnOnce4
} from "@ag-grid-community/core";
import { VirtualList } from "@ag-grid-enterprise/core";

// enterprise-modules/set-filter/src/setFilter/iSetDisplayValueModel.ts
var SetFilterDisplayValue = class {
};
SetFilterDisplayValue.SELECT_ALL = "__AG_SELECT_ALL__";
SetFilterDisplayValue.ADD_SELECTION_TO_FILTER = "__AG_ADD_SELECTION_TO_FILTER__";

// enterprise-modules/set-filter/src/setFilter/localeText.ts
var DEFAULT_LOCALE_TEXT = {
  loadingOoo: "Loading...",
  blanks: "(Blanks)",
  searchOoo: "Search...",
  selectAll: "(Select All)",
  selectAllSearchResults: "(Select All Search Results)",
  addCurrentSelectionToFilter: "Add current selection to filter",
  noMatches: "No matches."
};

// enterprise-modules/set-filter/src/setFilter/setFilterListItem.ts
import {
  AgCheckboxSelector,
  Component,
  RefPlaceholder,
  _createIcon,
  _setAriaChecked,
  _setAriaDescribedBy,
  _setAriaExpanded,
  _setAriaLabel,
  _setAriaLabelledBy,
  _setAriaLevel,
  _setDisplayed,
  _toStringOrNull,
  _warnOnce
} from "@ag-grid-community/core";
var SetFilterListItem = class extends Component {
  constructor(params) {
    super(
      params.isGroup ? (
        /* html */
        `
            <div class="ag-set-filter-item" aria-hidden="true">
                <span class="ag-set-filter-group-icons">
                    <span class="ag-set-filter-group-closed-icon" data-ref="eGroupClosedIcon"></span>
                    <span class="ag-set-filter-group-opened-icon" data-ref="eGroupOpenedIcon"></span>
                    <span class="ag-set-filter-group-indeterminate-icon" data-ref="eGroupIndeterminateIcon"></span>
                </span>
                <ag-checkbox data-ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
            </div>`
      ) : (
        /* html */
        `
            <div class="ag-set-filter-item">
                <ag-checkbox data-ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
            </div>`
      ),
      [AgCheckboxSelector]
    );
    this.eCheckbox = RefPlaceholder;
    this.eGroupOpenedIcon = RefPlaceholder;
    this.eGroupClosedIcon = RefPlaceholder;
    this.eGroupIndeterminateIcon = RefPlaceholder;
    this.focusWrapper = params.focusWrapper;
    this.value = params.value;
    this.params = params.params;
    this.translate = params.translate;
    this.valueFormatter = params.valueFormatter;
    this.item = params.item;
    this.isSelected = params.isSelected;
    this.isTree = params.isTree;
    this.depth = params.depth ?? 0;
    this.isGroup = params.isGroup;
    this.groupsExist = params.groupsExist;
    this.isExpanded = params.isExpanded;
    this.hasIndeterminateExpandState = params.hasIndeterminateExpandState;
  }
  wireBeans(beans) {
    this.valueService = beans.valueService;
    this.userComponentFactory = beans.userComponentFactory;
  }
  postConstruct() {
    this.addDestroyFunc(() => this.destroyCellRendererComponent?.());
    this.render();
    this.eCheckbox.setLabelEllipsis(true).setValue(this.isSelected, true).setDisabled(!!this.params.readOnly).getInputElement().setAttribute("tabindex", "-1");
    this.refreshVariableAriaLabels();
    if (this.isTree) {
      if (this.depth > 0) {
        this.addCssClass("ag-set-filter-indent-" + this.depth);
        this.getGui().style.setProperty("--ag-indentation-level", String(this.depth));
      }
      if (this.isGroup) {
        this.setupExpansion();
      } else {
        if (this.groupsExist) {
          this.addCssClass("ag-set-filter-add-group-indent");
        }
      }
      _setAriaLevel(this.getAriaElement(), this.depth + 1);
    }
    this.refreshAriaChecked();
    if (this.params.readOnly) {
      return;
    }
    this.eCheckbox.onValueChange((value) => this.onCheckboxChanged(!!value));
  }
  getFocusableElement() {
    return this.focusWrapper;
  }
  setupExpansion() {
    this.eGroupClosedIcon.appendChild(_createIcon("setFilterGroupClosed", this.gos, null));
    this.eGroupOpenedIcon.appendChild(_createIcon("setFilterGroupOpen", this.gos, null));
    const listener = this.onExpandOrContractClicked.bind(this);
    this.addManagedElementListeners(this.eGroupClosedIcon, { click: listener });
    this.addManagedElementListeners(this.eGroupOpenedIcon, { click: listener });
    if (this.hasIndeterminateExpandState) {
      this.eGroupIndeterminateIcon.appendChild(_createIcon("setFilterGroupIndeterminate", this.gos, null));
      this.addManagedElementListeners(this.eGroupIndeterminateIcon, {
        click: listener
      });
    }
    this.setExpandedIcons();
    this.refreshAriaExpanded();
  }
  onExpandOrContractClicked() {
    this.setExpanded(!this.isExpanded);
  }
  setExpanded(isExpanded, silent) {
    if (this.isGroup && isExpanded !== this.isExpanded) {
      this.isExpanded = isExpanded;
      const event = {
        type: "expandedChanged",
        isExpanded: !!isExpanded,
        item: this.item
      };
      if (!silent) {
        this.dispatchLocalEvent(event);
      }
      this.setExpandedIcons();
      this.refreshAriaExpanded();
    }
  }
  setExpandedIcons() {
    _setDisplayed(
      this.eGroupClosedIcon,
      this.hasIndeterminateExpandState ? this.isExpanded === false : !this.isExpanded
    );
    _setDisplayed(this.eGroupOpenedIcon, this.isExpanded === true);
    if (this.hasIndeterminateExpandState) {
      _setDisplayed(this.eGroupIndeterminateIcon, this.isExpanded === void 0);
    }
  }
  onCheckboxChanged(isSelected) {
    this.isSelected = isSelected;
    const event = {
      type: "selectionChanged",
      isSelected,
      item: this.item
    };
    this.dispatchLocalEvent(event);
    this.refreshVariableAriaLabels();
    this.refreshAriaChecked();
  }
  toggleSelected() {
    if (this.params.readOnly) {
      return;
    }
    this.setSelected(!this.isSelected);
  }
  setSelected(isSelected, silent) {
    this.isSelected = isSelected;
    this.eCheckbox.setValue(isSelected, silent);
    this.refreshAriaChecked();
  }
  refreshVariableAriaLabels() {
    if (!this.isTree) {
      return;
    }
    const translate = this.localeService.getLocaleTextFunc();
    const checkboxValue = this.eCheckbox.getValue();
    const state = checkboxValue === void 0 ? translate("ariaIndeterminate", "indeterminate") : checkboxValue ? translate("ariaVisible", "visible") : translate("ariaHidden", "hidden");
    const visibilityLabel = translate("ariaToggleVisibility", "Press SPACE to toggle visibility");
    _setAriaLabelledBy(this.eCheckbox.getInputElement(), void 0);
    this.eCheckbox.setInputAriaLabel(`${visibilityLabel} (${state})`);
  }
  setupFixedAriaLabels(value) {
    if (!this.isTree) {
      return;
    }
    const translate = this.localeService.getLocaleTextFunc();
    const itemLabel = translate("ariaFilterValue", "Filter Value");
    const ariaEl = this.getAriaElement();
    _setAriaLabel(ariaEl, `${value} ${itemLabel}`);
    _setAriaDescribedBy(ariaEl, this.eCheckbox.getInputElement().id);
  }
  refreshAriaChecked() {
    const ariaEl = this.getAriaElement();
    _setAriaChecked(ariaEl, this.eCheckbox.getValue());
  }
  refreshAriaExpanded() {
    _setAriaExpanded(this.getAriaElement(), !!this.isExpanded);
  }
  refresh(item, isSelected, isExpanded) {
    this.item = item;
    if (isSelected !== this.isSelected) {
      this.setSelected(isSelected, true);
    }
    this.setExpanded(isExpanded, true);
    if (this.valueFunction) {
      const value = this.valueFunction();
      this.setTooltipAndCellRendererParams(value, value);
      if (!this.cellRendererComponent) {
        this.renderCellWithoutCellRenderer();
      }
    }
    if (this.cellRendererComponent) {
      const success = this.cellRendererComponent.refresh?.(this.cellRendererParams);
      if (!success) {
        const oldComponent = this.cellRendererComponent;
        this.renderCell();
        this.destroyBean(oldComponent);
      }
    }
  }
  render() {
    const {
      params: { column }
    } = this;
    let { value } = this;
    let formattedValue = null;
    if (typeof value === "function") {
      this.valueFunction = value;
      formattedValue = this.valueFunction();
      value = formattedValue;
    } else if (this.isTree) {
      formattedValue = _toStringOrNull(value);
    } else {
      formattedValue = this.getFormattedValue(column, value);
    }
    this.setTooltipAndCellRendererParams(value, formattedValue);
    this.renderCell();
  }
  setTooltipAndCellRendererParams(value, formattedValue) {
    const isTooltipWhenTruncated = this.gos.get("tooltipShowMode") === "whenTruncated";
    if (this.params.showTooltips && (!isTooltipWhenTruncated || !this.params.cellRenderer)) {
      const newTooltipText = formattedValue != null ? formattedValue : _toStringOrNull(value);
      let shouldDisplayTooltip;
      if (isTooltipWhenTruncated) {
        shouldDisplayTooltip = () => {
          const el = this.eCheckbox.getGui().querySelector(".ag-label");
          if (!el) {
            return true;
          }
          return el.scrollWidth > el.clientWidth;
        };
      }
      this.setTooltip({
        newTooltipText,
        location: "setFilterValue",
        getColDef: () => this.params.colDef,
        getColumn: () => this.params.column,
        shouldDisplayTooltip
      });
    }
    this.cellRendererParams = this.gos.addGridCommonParams({
      value,
      valueFormatted: formattedValue,
      colDef: this.params.colDef,
      column: this.params.column,
      setTooltip: (value2, shouldDisplayTooltip) => {
        this.setTooltip({
          newTooltipText: value2,
          getColDef: () => this.params.colDef,
          getColumn: () => this.params.column,
          location: "setFilterValue",
          shouldDisplayTooltip
        });
      }
    });
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "setFilterValue";
    res.colDef = this.getComponentHolder();
    if (this.isTree) {
      res.level = this.depth;
    }
    return res;
  }
  getFormattedValue(column, value) {
    return this.valueService.formatValue(column, null, value, this.valueFormatter, false);
  }
  renderCell() {
    const compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(
      this.params,
      this.cellRendererParams
    );
    const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : void 0;
    if (cellRendererPromise == null) {
      this.renderCellWithoutCellRenderer();
      return;
    }
    cellRendererPromise.then((component) => {
      if (component) {
        this.cellRendererComponent = component;
        this.eCheckbox.setLabel(component.getGui());
        this.destroyCellRendererComponent = () => this.destroyBean(component);
      }
    });
  }
  renderCellWithoutCellRenderer() {
    let valueToRender = (this.cellRendererParams.valueFormatted == null ? this.cellRendererParams.value : this.cellRendererParams.valueFormatted) ?? this.translate("blanks");
    if (typeof valueToRender !== "string") {
      _warnOnce(
        `Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects. See ${this.getFrameworkOverrides().getDocLink("filter-set-filter-list/#filter-value-types")}`
      );
      valueToRender = "";
    }
    this.eCheckbox.setLabel(valueToRender);
    this.setupFixedAriaLabels(valueToRender);
  }
  getComponentHolder() {
    return this.params.column.getColDef();
  }
};

// enterprise-modules/set-filter/src/setFilter/setFilterModelFormatter.ts
var SetFilterModelFormatter = class {
  getModelAsString(model, setFilter) {
    const { values } = model || setFilter.getModel() || {};
    const valueModel = setFilter.getValueModel();
    if (values == null || valueModel == null) {
      return "";
    }
    const availableKeys = values.filter((v) => valueModel.isKeyAvailable(v));
    const numValues = availableKeys.length;
    const formattedValues = availableKeys.slice(0, 10).map((key) => setFilter.getFormattedValue(key));
    return `(${numValues}) ${formattedValues.join(",")}${numValues > 10 ? ",..." : ""}`;
  }
};

// enterprise-modules/set-filter/src/setFilter/setValueModel.ts
import {
  AgPromise as AgPromise2,
  LocalEventService,
  _defaultComparator,
  _errorOnce,
  _exists,
  _makeNull as _makeNull2,
  _warnOnce as _warnOnce3
} from "@ag-grid-community/core";

// enterprise-modules/set-filter/src/clientSideValueExtractor.ts
import { AgPromise, _makeNull, _toStringOrNull as _toStringOrNull2 } from "@ag-grid-community/core";
var ClientSideValuesExtractor = class {
  constructor(rowModel, filterParams, createKey, caseFormat, funcColsService, valueService, treeDataOrGrouping, treeData, getDataPath, groupAllowUnbalanced, addManagedEventListeners) {
    this.rowModel = rowModel;
    this.filterParams = filterParams;
    this.createKey = createKey;
    this.caseFormat = caseFormat;
    this.funcColsService = funcColsService;
    this.valueService = valueService;
    this.treeDataOrGrouping = treeDataOrGrouping;
    this.treeData = treeData;
    this.getDataPath = getDataPath;
    this.groupAllowUnbalanced = groupAllowUnbalanced;
    this.addManagedEventListeners = addManagedEventListeners;
  }
  extractUniqueValuesAsync(predicate, existingValues) {
    return new AgPromise((resolve) => {
      if (this.rowModel.isRowDataLoaded()) {
        resolve(this.extractUniqueValues(predicate, existingValues));
      } else {
        const [destroyFunc] = this.addManagedEventListeners({
          rowCountReady: () => {
            destroyFunc?.();
            resolve(this.extractUniqueValues(predicate, existingValues));
          }
        });
      }
    });
  }
  extractUniqueValues(predicate, existingValues) {
    const values = /* @__PURE__ */ new Map();
    const existingFormattedKeys = this.extractExistingFormattedKeys(existingValues);
    const formattedKeys = /* @__PURE__ */ new Set();
    const treeData = this.treeData && !!this.getDataPath;
    const groupedCols = this.funcColsService.getRowGroupColumns();
    const addValue = (unformattedKey, value) => {
      const formattedKey = this.caseFormat(unformattedKey);
      if (!formattedKeys.has(formattedKey)) {
        formattedKeys.add(formattedKey);
        let keyToAdd = unformattedKey;
        let valueToAdd = _makeNull(value);
        const existingUnformattedKey = existingFormattedKeys?.get(formattedKey);
        if (existingUnformattedKey != null) {
          keyToAdd = existingUnformattedKey;
          valueToAdd = existingValues.get(existingUnformattedKey);
        }
        values.set(keyToAdd, valueToAdd);
      }
    };
    this.rowModel.forEachLeafNode((node) => {
      if (!node.data || !predicate(node)) {
        return;
      }
      if (this.treeDataOrGrouping) {
        this.addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue);
        return;
      }
      const value = this.getValue(node);
      if (value != null && Array.isArray(value)) {
        value.forEach((x) => {
          addValue(this.createKey(x, node), x);
        });
        if (value.length === 0) {
          addValue(null, null);
        }
      } else {
        addValue(this.createKey(value, node), value);
      }
    });
    return values;
  }
  addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue) {
    let dataPath;
    if (treeData) {
      if (node.childrenAfterGroup?.length) {
        return;
      }
      dataPath = this.getDataPath(node.data);
    } else {
      dataPath = groupedCols.map((groupCol) => this.valueService.getKeyForNode(groupCol, node));
      dataPath.push(this.getValue(node));
    }
    if (dataPath) {
      dataPath = dataPath.map((treeKey) => _toStringOrNull2(_makeNull(treeKey)));
    }
    if (!treeData && this.groupAllowUnbalanced && dataPath?.some((treeKey) => treeKey == null)) {
      dataPath = dataPath.filter((treeKey) => treeKey != null);
    }
    addValue(this.createKey(dataPath), dataPath);
  }
  getValue(node) {
    return this.filterParams.getValue(node);
  }
  extractExistingFormattedKeys(existingValues) {
    if (!existingValues) {
      return null;
    }
    const existingFormattedKeys = /* @__PURE__ */ new Map();
    existingValues.forEach((_value, key) => {
      existingFormattedKeys.set(this.caseFormat(key), key);
    });
    return existingFormattedKeys;
  }
};

// enterprise-modules/set-filter/src/setFilter/filteringKeys.ts
var SetValueModelFilteringKeys = class {
  constructor({ caseFormat }) {
    // To make the filtering fast, we store the keys in a Set rather than using the default array.
    this.filteringKeys = null;
    // This attribute contains keys that are actually used for filtering.
    // These keys take into account case sensitivity:
    // - When filtering is case-insensitive, all filtering keys are converted to upper case and stored here.
    // - When filtering is case-sensitive, this is the same as filteringKeys.
    this.filteringKeysCaseFormatted = null;
    this.hasNoAppliedFilteringKeys = false;
    this.caseFormat = caseFormat;
  }
  allFilteringKeys() {
    return this.filteringKeys;
  }
  allFilteringKeysCaseFormatted() {
    return this.filteringKeysCaseFormatted;
  }
  noAppliedFilteringKeys() {
    return this.hasNoAppliedFilteringKeys;
  }
  setFilteringKeys(filteringKeys) {
    this.filteringKeys = new Set(filteringKeys);
    this.hasNoAppliedFilteringKeys = !this.filteringKeys || this.filteringKeys.size === 0;
    this.filteringKeysCaseFormatted = /* @__PURE__ */ new Set();
    this.filteringKeys.forEach((key) => this.filteringKeysCaseFormatted.add(this.caseFormat(key)));
  }
  addFilteringKey(key) {
    if (this.filteringKeys == null) {
      this.filteringKeys = /* @__PURE__ */ new Set();
      this.filteringKeysCaseFormatted = /* @__PURE__ */ new Set();
    }
    this.filteringKeys.add(key);
    this.filteringKeysCaseFormatted.add(this.caseFormat(key));
    if (this.hasNoAppliedFilteringKeys) {
      this.hasNoAppliedFilteringKeys = false;
    }
  }
  hasCaseFormattedFilteringKey(key) {
    return this.filteringKeysCaseFormatted.has(this.caseFormat(key));
  }
  hasFilteringKey(key) {
    return this.filteringKeys.has(key);
  }
  reset() {
    this.filteringKeys = null;
    this.filteringKeysCaseFormatted = null;
    this.hasNoAppliedFilteringKeys = false;
  }
};

// enterprise-modules/set-filter/src/setFilter/flatSetDisplayValueModel.ts
var FlatSetDisplayValueModel = class {
  constructor(valueService, valueFormatter, formatter, column) {
    this.valueService = valueService;
    this.valueFormatter = valueFormatter;
    this.formatter = formatter;
    this.column = column;
    /** All keys that are currently displayed, after the mini-filter has been applied. */
    this.displayedKeys = [];
  }
  updateDisplayedValuesToAllAvailable(_getValue, _allKeys, availableKeys) {
    this.displayedKeys = Array.from(availableKeys);
  }
  updateDisplayedValuesToMatchMiniFilter(getValue, _allKeys, availableKeys, matchesFilter, nullMatchesFilter) {
    this.displayedKeys = [];
    for (const key of availableKeys) {
      if (key == null) {
        if (nullMatchesFilter) {
          this.displayedKeys.push(key);
        }
      } else {
        const value = getValue(key);
        const valueFormatterValue = this.valueService.formatValue(
          this.column,
          null,
          value,
          this.valueFormatter,
          false
        );
        const textFormatterValue = this.formatter(valueFormatterValue);
        if (matchesFilter(textFormatterValue)) {
          this.displayedKeys.push(key);
        }
      }
    }
  }
  getDisplayedValueCount() {
    return this.displayedKeys.length;
  }
  getDisplayedItem(index) {
    return this.displayedKeys[index];
  }
  getSelectAllItem() {
    return SetFilterDisplayValue.SELECT_ALL;
  }
  getAddSelectionToFilterItem() {
    return SetFilterDisplayValue.ADD_SELECTION_TO_FILTER;
  }
  getDisplayedKeys() {
    return this.displayedKeys;
  }
  forEachDisplayedKey(func) {
    this.displayedKeys.forEach(func);
  }
  someDisplayedKey(func) {
    return this.displayedKeys.some(func);
  }
  hasGroups() {
    return false;
  }
  refresh() {
  }
};

// enterprise-modules/set-filter/src/setFilter/treeSetDisplayValueModel.ts
import { _warnOnce as _warnOnce2 } from "@ag-grid-community/core";
var DATE_TREE_LIST_PATH_GETTER = (date) => date ? [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())] : null;
var TreeSetDisplayValueModel = class {
  constructor(formatter, treeListPathGetter, treeListFormatter, treeDataOrGrouping) {
    this.formatter = formatter;
    this.treeListPathGetter = treeListPathGetter;
    this.treeListFormatter = treeListFormatter;
    this.treeDataOrGrouping = treeDataOrGrouping;
    /** all displayed items in a tree structure */
    this.allDisplayedItemsTree = [];
    /** all displayed items flattened and filtered */
    this.activeDisplayedItemsFlat = [];
    this.selectAllItem = {
      depth: 0,
      filterPasses: true,
      available: true,
      treeKey: SetFilterDisplayValue.SELECT_ALL,
      children: this.allDisplayedItemsTree,
      expanded: true,
      key: SetFilterDisplayValue.SELECT_ALL,
      parentTreeKeys: []
    };
    this.addSelectionToFilterItem = {
      depth: 0,
      filterPasses: true,
      available: true,
      treeKey: SetFilterDisplayValue.ADD_SELECTION_TO_FILTER,
      expanded: true,
      key: SetFilterDisplayValue.ADD_SELECTION_TO_FILTER,
      parentTreeKeys: []
    };
  }
  updateDisplayedValuesToAllAvailable(getValue, allKeys, availableKeys, source) {
    if (source === "reload") {
      this.generateItemTree(getValue, allKeys, availableKeys);
    } else if (source === "otherFilter") {
      this.updateAvailable(availableKeys);
      this.updateExpandAll();
    } else if (source === "miniFilter") {
      this.resetFilter();
      this.updateExpandAll();
    }
    this.flattenItems();
  }
  updateDisplayedValuesToMatchMiniFilter(getValue, allKeys, availableKeys, matchesFilter, nullMatchesFilter, source) {
    if (source === "reload") {
      this.generateItemTree(getValue, allKeys, availableKeys);
    } else if (source === "otherFilter") {
      this.updateAvailable(availableKeys);
    }
    this.updateFilter(matchesFilter, nullMatchesFilter);
    this.updateExpandAll();
    this.flattenItems();
  }
  generateItemTree(getValue, allKeys, availableKeys) {
    this.allDisplayedItemsTree = [];
    this.groupsExist = false;
    const treeListPathGetter = this.getTreeListPathGetter(getValue, availableKeys);
    for (const key of allKeys) {
      const value = getValue(key);
      const dataPath = treeListPathGetter(value) ?? [null];
      if (dataPath.length > 1) {
        this.groupsExist = true;
      }
      const available = availableKeys.has(key);
      let children = this.allDisplayedItemsTree;
      let item;
      let parentTreeKeys = [];
      dataPath.forEach((treeKey, depth) => {
        if (!children) {
          children = [];
          item.children = children;
        }
        item = children.find((child) => child.treeKey?.toUpperCase() === treeKey?.toUpperCase());
        if (!item) {
          item = { treeKey, depth, filterPasses: true, expanded: false, available, parentTreeKeys };
          if (depth === dataPath.length - 1) {
            item.key = key;
          }
          children.push(item);
        }
        children = item.children;
        parentTreeKeys = [...parentTreeKeys, treeKey];
      });
    }
    this.updateAvailable(availableKeys);
    this.selectAllItem.children = this.allDisplayedItemsTree;
    this.selectAllItem.expanded = false;
  }
  getTreeListPathGetter(getValue, availableKeys) {
    if (this.treeListPathGetter) {
      return this.treeListPathGetter;
    }
    if (this.treeDataOrGrouping) {
      return (value) => value;
    }
    let isDate = false;
    for (const availableKey of availableKeys) {
      const value = getValue(availableKey);
      if (value instanceof Date) {
        isDate = true;
        break;
      } else if (value != null) {
        break;
      }
    }
    if (isDate) {
      return DATE_TREE_LIST_PATH_GETTER;
    }
    _warnOnce2(
      "property treeList=true for Set Filter params, but you did not provide a treeListPathGetter or values of type Date."
    );
    return (value) => [String(value)];
  }
  flattenItems() {
    this.activeDisplayedItemsFlat = [];
    const recursivelyFlattenDisplayedItems = (items) => {
      items.forEach((item) => {
        if (!item.filterPasses || !item.available) {
          return;
        }
        this.activeDisplayedItemsFlat.push(item);
        if (item.children && item.expanded) {
          recursivelyFlattenDisplayedItems(item.children);
        }
      });
    };
    recursivelyFlattenDisplayedItems(this.allDisplayedItemsTree);
  }
  resetFilter() {
    const recursiveFilterReset = (item) => {
      if (item.children) {
        item.children.forEach((child) => {
          recursiveFilterReset(child);
        });
      }
      item.filterPasses = true;
    };
    this.allDisplayedItemsTree.forEach((item) => recursiveFilterReset(item));
  }
  updateFilter(matchesFilter, nullMatchesFilter) {
    const passesFilter = (item) => {
      if (!item.available) {
        return false;
      }
      if (item.treeKey == null) {
        return nullMatchesFilter;
      }
      return matchesFilter(
        this.formatter(
          this.treeListFormatter ? this.treeListFormatter(item.treeKey, item.depth, item.parentTreeKeys) : item.treeKey
        )
      );
    };
    this.allDisplayedItemsTree.forEach(
      (item) => this.recursiveItemCheck(item, false, passesFilter, "filterPasses")
    );
  }
  getDisplayedValueCount() {
    return this.activeDisplayedItemsFlat.length;
  }
  getDisplayedItem(index) {
    return this.activeDisplayedItemsFlat[index];
  }
  getSelectAllItem() {
    return this.selectAllItem;
  }
  getAddSelectionToFilterItem() {
    return this.addSelectionToFilterItem;
  }
  getDisplayedKeys() {
    const displayedKeys = [];
    this.forEachDisplayedKey((key) => displayedKeys.push(key));
    return displayedKeys;
  }
  forEachDisplayedKey(func) {
    const recursiveForEachItem = (item, topParentExpanded) => {
      if (item.children) {
        if (!item.expanded || !topParentExpanded) {
          item.children.forEach((child) => {
            if (child.filterPasses) {
              recursiveForEachItem(child, false);
            }
          });
        }
      } else {
        func(item.key);
      }
    };
    this.activeDisplayedItemsFlat.forEach((item) => recursiveForEachItem(item, true));
  }
  someDisplayedKey(func) {
    const recursiveSomeItem = (item, topParentExpanded) => {
      if (item.children) {
        if (!item.expanded || !topParentExpanded) {
          return item.children.some((child) => {
            if (child.filterPasses) {
              return recursiveSomeItem(child, false);
            }
            return false;
          });
        }
      } else {
        return func(item.key);
      }
      return false;
    };
    return this.activeDisplayedItemsFlat.some((item) => recursiveSomeItem(item, true));
  }
  hasGroups() {
    return this.groupsExist;
  }
  refresh() {
    this.updateExpandAll();
    this.flattenItems();
  }
  updateExpandAll() {
    const recursiveExpansionCheck = (items, someTrue, someFalse) => {
      for (const item2 of items) {
        if (!item2.filterPasses || !item2.available || !item2.children) {
          continue;
        }
        someTrue = someTrue || !!item2.expanded;
        someFalse = someFalse || !item2.expanded;
        if (someTrue && someFalse) {
          return void 0;
        }
        const childExpanded = recursiveExpansionCheck(item2.children, someTrue, someFalse);
        if (childExpanded === void 0) {
          return void 0;
        } else if (childExpanded) {
          someTrue = true;
        } else {
          someFalse = true;
        }
      }
      return someTrue && someFalse ? void 0 : someTrue;
    };
    const item = this.getSelectAllItem();
    item.expanded = recursiveExpansionCheck(item.children, false, false);
  }
  recursiveItemCheck(item, parentPasses, checkFunction, itemProp) {
    let atLeastOneChildPassed = false;
    if (item.children) {
      item.children.forEach((child) => {
        const childPasses = this.recursiveItemCheck(
          child,
          parentPasses || checkFunction(item),
          checkFunction,
          itemProp
        );
        atLeastOneChildPassed = atLeastOneChildPassed || childPasses;
      });
    }
    const itemPasses = parentPasses || atLeastOneChildPassed || checkFunction(item);
    item[itemProp] = itemPasses;
    return itemPasses;
  }
  updateAvailable(availableKeys) {
    const isAvailable = (item) => availableKeys.has(item.key);
    this.allDisplayedItemsTree.forEach((item) => this.recursiveItemCheck(item, false, isAvailable, "available"));
  }
};

// enterprise-modules/set-filter/src/setFilter/setValueModel.ts
var SetValueModel = class {
  constructor(params) {
    this.localEventService = new LocalEventService();
    this.miniFilterText = null;
    /** When true, in excelMode = 'windows', it adds previously selected filter items to newly checked filter selection */
    this.addCurrentSelectionToFilter = false;
    /** Values provided to the filter for use. */
    this.providedValues = null;
    /** All possible values for the filter, sorted if required. */
    this.allValues = /* @__PURE__ */ new Map();
    /** Remaining keys when filters from other columns have been applied. */
    this.availableKeys = /* @__PURE__ */ new Set();
    /** Keys that have been selected for this filter. */
    this.selectedKeys = /* @__PURE__ */ new Set();
    this.initialised = false;
    const {
      usingComplexObjects,
      funcColsService,
      valueService,
      treeDataTreeList,
      groupingTreeList,
      filterParams,
      gos,
      valueFormatter,
      addManagedEventListeners
    } = params;
    const {
      column,
      colDef,
      textFormatter,
      doesRowPassOtherFilter,
      suppressSorting,
      comparator,
      rowModel,
      values,
      caseSensitive,
      treeList,
      treeListPathGetter,
      treeListFormatter
    } = filterParams;
    this.filterParams = filterParams;
    this.gos = gos;
    this.setIsLoading = params.setIsLoading;
    this.translate = params.translate;
    this.caseFormat = params.caseFormat;
    this.createKey = params.createKey;
    this.usingComplexObjects = !!params.usingComplexObjects;
    this.formatter = textFormatter ?? ((value) => value ?? null);
    this.doesRowPassOtherFilters = doesRowPassOtherFilter;
    this.suppressSorting = suppressSorting || false;
    this.filteringKeys = new SetValueModelFilteringKeys({ caseFormat: this.caseFormat });
    const keyComparator = comparator ?? colDef.comparator;
    const treeDataOrGrouping = !!treeDataTreeList || !!groupingTreeList;
    this.compareByValue = !!(usingComplexObjects && keyComparator || treeDataOrGrouping || treeList && !treeListPathGetter);
    if (treeDataOrGrouping && !keyComparator) {
      this.entryComparator = this.createTreeDataOrGroupingComparator();
    } else if (treeList && !treeListPathGetter && !keyComparator) {
      this.entryComparator = ([_aKey, aValue], [_bKey, bValue]) => _defaultComparator(aValue, bValue);
    } else {
      this.entryComparator = ([_aKey, aValue], [_bKey, bValue]) => keyComparator(aValue, bValue);
    }
    this.keyComparator = keyComparator ?? _defaultComparator;
    this.caseSensitive = !!caseSensitive;
    const getDataPath = gos.get("getDataPath");
    const groupAllowUnbalanced = gos.get("groupAllowUnbalanced");
    if (rowModel.getType() === "clientSide") {
      this.clientSideValuesExtractor = new ClientSideValuesExtractor(
        rowModel,
        this.filterParams,
        this.createKey,
        this.caseFormat,
        funcColsService,
        valueService,
        treeDataOrGrouping,
        !!treeDataTreeList,
        getDataPath,
        groupAllowUnbalanced,
        addManagedEventListeners
      );
    }
    if (values == null) {
      this.valuesType = 2 /* TAKEN_FROM_GRID_VALUES */;
    } else {
      this.valuesType = Array.isArray(values) ? 0 /* PROVIDED_LIST */ : 1 /* PROVIDED_CALLBACK */;
      this.providedValues = values;
    }
    this.displayValueModel = treeList ? new TreeSetDisplayValueModel(
      this.formatter,
      treeListPathGetter,
      treeListFormatter,
      treeDataTreeList || groupingTreeList
    ) : new FlatSetDisplayValueModel(
      valueService,
      valueFormatter,
      this.formatter,
      column
    );
    this.updateAllValues().then((updatedKeys) => this.resetSelectionState(updatedKeys || []));
  }
  addEventListener(eventType, listener, async) {
    this.localEventService.addEventListener(eventType, listener, async);
  }
  removeEventListener(eventType, listener, async) {
    this.localEventService.removeEventListener(eventType, listener, async);
  }
  updateOnParamsChange(filterParams) {
    return new AgPromise2((resolve) => {
      const { values, textFormatter, suppressSorting } = filterParams;
      const currentProvidedValues = this.providedValues;
      const currentSuppressSorting = this.suppressSorting;
      this.filterParams = filterParams;
      this.formatter = textFormatter ?? ((value) => value ?? null);
      this.suppressSorting = suppressSorting || false;
      this.providedValues = values ?? null;
      if (this.providedValues !== currentProvidedValues || this.suppressSorting !== currentSuppressSorting) {
        if (!values || values.length === 0) {
          this.valuesType = 2 /* TAKEN_FROM_GRID_VALUES */;
          this.providedValues = null;
        } else {
          this.valuesType = Array.isArray(values) ? 0 /* PROVIDED_LIST */ : 1 /* PROVIDED_CALLBACK */;
        }
        const currentModel = this.getModel();
        this.updateAllValues().then(() => {
          this.setModel(currentModel).then(() => resolve());
        });
      } else {
        resolve();
      }
    });
  }
  /**
   * Re-fetches the values used in the filter from the value source.
   * If keepSelection is false, the filter selection will be reset to everything selected,
   * otherwise the current selection will be preserved.
   */
  refreshValues() {
    return new AgPromise2((resolve) => {
      this.allValuesPromise.then(() => {
        const currentModel = this.getModel();
        this.updateAllValues();
        this.setModel(currentModel).then(() => resolve());
      });
    });
  }
  /**
   * Overrides the current values being used for the set filter.
   * If keepSelection is false, the filter selection will be reset to everything selected,
   * otherwise the current selection will be preserved.
   */
  overrideValues(valuesToUse) {
    return new AgPromise2((resolve) => {
      this.allValuesPromise.then(() => {
        this.valuesType = 0 /* PROVIDED_LIST */;
        this.providedValues = valuesToUse;
        this.refreshValues().then(() => resolve());
      });
    });
  }
  /** @return has anything been updated */
  refreshAfterAnyFilterChanged() {
    if (this.showAvailableOnly()) {
      return this.allValuesPromise.then((keys) => {
        this.updateAvailableKeys(keys ?? [], "otherFilter");
        return true;
      });
    }
    return AgPromise2.resolve(false);
  }
  isInitialised() {
    return this.initialised;
  }
  updateAllValues() {
    this.allValuesPromise = new AgPromise2((resolve) => {
      switch (this.valuesType) {
        case 2 /* TAKEN_FROM_GRID_VALUES */:
          this.getValuesFromRowsAsync(false).then((values) => resolve(this.processAllValues(values)));
          break;
        case 0 /* PROVIDED_LIST */: {
          resolve(
            this.processAllValues(
              this.uniqueValues(this.validateProvidedValues(this.providedValues))
            )
          );
          break;
        }
        case 1 /* PROVIDED_CALLBACK */: {
          this.setIsLoading(true);
          const callback = this.providedValues;
          const { column, colDef } = this.filterParams;
          const params = this.gos.addGridCommonParams({
            success: (values) => {
              this.setIsLoading(false);
              resolve(this.processAllValues(this.uniqueValues(this.validateProvidedValues(values))));
            },
            colDef,
            column
          });
          window.setTimeout(() => callback(params), 0);
          break;
        }
        default:
          throw new Error("Unrecognised valuesType");
      }
    });
    this.allValuesPromise.then((values) => this.updateAvailableKeys(values || [], "reload")).then(() => this.initialised = true);
    return this.allValuesPromise;
  }
  processAllValues(values) {
    const sortedKeys = this.sortKeys(values);
    this.allValues = values ?? /* @__PURE__ */ new Map();
    return sortedKeys;
  }
  validateProvidedValues(values) {
    if (this.usingComplexObjects && values?.length) {
      const firstValue = values[0];
      if (firstValue && typeof firstValue !== "object" && typeof firstValue !== "function") {
        const firstKey = this.createKey(firstValue);
        if (firstKey == null) {
          _warnOnce3(
            "Set Filter Key Creator is returning null for provided values and provided values are primitives. Please provide complex objects. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types"
          );
        } else {
          _warnOnce3(
            "Set Filter has a Key Creator, but provided values are primitives. Did you mean to provide complex objects?"
          );
        }
      }
    }
    return values;
  }
  setValuesType(value) {
    this.valuesType = value;
  }
  getValuesType() {
    return this.valuesType;
  }
  isKeyAvailable(key) {
    return this.availableKeys.has(key);
  }
  showAvailableOnly() {
    return this.valuesType === 2 /* TAKEN_FROM_GRID_VALUES */;
  }
  updateAvailableKeys(allKeys, source) {
    const availableKeys = this.showAvailableOnly() ? this.sortKeys(this.getValuesFromRows(true)) : allKeys;
    this.availableKeys = new Set(availableKeys);
    this.localEventService.dispatchEvent({ type: "availableValuesChanged" });
    this.updateDisplayedValues(source, allKeys);
  }
  sortKeys(nullableValues) {
    const values = nullableValues ?? /* @__PURE__ */ new Map();
    if (this.suppressSorting) {
      return Array.from(values.keys());
    }
    let sortedKeys;
    if (this.compareByValue) {
      sortedKeys = Array.from(values.entries()).sort(this.entryComparator).map(([key]) => key);
    } else {
      sortedKeys = Array.from(values.keys()).sort(this.keyComparator);
    }
    if (this.filterParams.excelMode && values.has(null)) {
      sortedKeys = sortedKeys.filter((v) => v != null);
      sortedKeys.push(null);
    }
    return sortedKeys;
  }
  getParamsForValuesFromRows(removeUnavailableValues = false) {
    if (!this.clientSideValuesExtractor) {
      _errorOnce(
        "Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values"
      );
      return null;
    }
    const predicate = (node) => !removeUnavailableValues || this.doesRowPassOtherFilters(node);
    const existingValues = removeUnavailableValues && !this.caseSensitive ? this.allValues : void 0;
    return { predicate, existingValues };
  }
  getValuesFromRows(removeUnavailableValues = false) {
    const params = this.getParamsForValuesFromRows(removeUnavailableValues);
    if (!params) {
      return null;
    }
    return this.clientSideValuesExtractor.extractUniqueValues(params.predicate, params.existingValues);
  }
  getValuesFromRowsAsync(removeUnavailableValues = false) {
    const params = this.getParamsForValuesFromRows(removeUnavailableValues);
    if (!params) {
      return AgPromise2.resolve(null);
    }
    return this.clientSideValuesExtractor.extractUniqueValuesAsync(params.predicate, params.existingValues);
  }
  /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
  setMiniFilter(value) {
    value = _makeNull2(value);
    if (this.miniFilterText === value) {
      return false;
    }
    if (value === null) {
      this.setAddCurrentSelectionToFilter(false);
    }
    this.miniFilterText = value;
    this.updateDisplayedValues("miniFilter");
    return true;
  }
  getMiniFilter() {
    return this.miniFilterText;
  }
  updateDisplayedValues(source, allKeys) {
    if (source === "expansion") {
      this.displayValueModel.refresh();
      return;
    }
    if (this.miniFilterText == null) {
      this.displayValueModel.updateDisplayedValuesToAllAvailable(
        (key) => this.getValue(key),
        allKeys,
        this.availableKeys,
        source
      );
      return;
    }
    const formattedFilterText = this.caseFormat(this.formatter(this.miniFilterText) || "");
    const matchesFilter = (valueToCheck) => valueToCheck != null && this.caseFormat(valueToCheck).indexOf(formattedFilterText) >= 0;
    const nullMatchesFilter = !!this.filterParams.excelMode && matchesFilter(this.translate("blanks"));
    this.displayValueModel.updateDisplayedValuesToMatchMiniFilter(
      (key) => this.getValue(key),
      allKeys,
      this.availableKeys,
      matchesFilter,
      nullMatchesFilter,
      source
    );
  }
  getDisplayedValueCount() {
    return this.displayValueModel.getDisplayedValueCount();
  }
  getDisplayedItem(index) {
    return this.displayValueModel.getDisplayedItem(index);
  }
  getSelectAllItem() {
    return this.displayValueModel.getSelectAllItem();
  }
  getAddSelectionToFilterItem() {
    return this.displayValueModel.getAddSelectionToFilterItem();
  }
  hasSelections() {
    return this.filterParams.defaultToNothingSelected ? this.selectedKeys.size > 0 : this.allValues.size !== this.selectedKeys.size;
  }
  getKeys() {
    return Array.from(this.allValues.keys());
  }
  getValues() {
    return Array.from(this.allValues.values());
  }
  getValue(key) {
    return this.allValues.get(key);
  }
  setAddCurrentSelectionToFilter(value) {
    this.addCurrentSelectionToFilter = value;
  }
  isInWindowsExcelMode() {
    return this.filterParams.excelMode === "windows";
  }
  isAddCurrentSelectionToFilterChecked() {
    return this.isInWindowsExcelMode() && this.addCurrentSelectionToFilter;
  }
  showAddCurrentSelectionToFilter() {
    return this.isInWindowsExcelMode() && _exists(this.miniFilterText) && this.miniFilterText.length > 0;
  }
  selectAllMatchingMiniFilter(clearExistingSelection = false) {
    if (this.miniFilterText == null) {
      this.selectedKeys = new Set(this.allValues.keys());
    } else {
      if (clearExistingSelection) {
        this.selectedKeys.clear();
      }
      this.displayValueModel.forEachDisplayedKey((key) => this.selectedKeys.add(key));
    }
  }
  deselectAllMatchingMiniFilter() {
    if (this.miniFilterText == null) {
      this.selectedKeys.clear();
    } else {
      this.displayValueModel.forEachDisplayedKey((key) => this.selectedKeys.delete(key));
    }
  }
  selectKey(key) {
    this.selectedKeys.add(key);
  }
  deselectKey(key) {
    if (this.filterParams.excelMode && this.isEverythingVisibleSelected()) {
      this.resetSelectionState(this.displayValueModel.getDisplayedKeys());
    }
    this.selectedKeys.delete(key);
  }
  isKeySelected(key) {
    return this.selectedKeys.has(key);
  }
  isEverythingVisibleSelected() {
    return !this.displayValueModel.someDisplayedKey((it) => !this.isKeySelected(it));
  }
  isNothingVisibleSelected() {
    return !this.displayValueModel.someDisplayedKey((it) => this.isKeySelected(it));
  }
  getModel() {
    if (!this.hasSelections()) {
      return null;
    }
    const filteringKeys = this.isAddCurrentSelectionToFilterChecked() ? this.filteringKeys.allFilteringKeys() : null;
    if (filteringKeys && filteringKeys.size > 0) {
      if (this.selectedKeys) {
        const modelKeys = /* @__PURE__ */ new Set([
          ...Array.from(filteringKeys),
          ...Array.from(this.selectedKeys).filter((key) => !filteringKeys.has(key))
        ]);
        return Array.from(modelKeys);
      }
      return Array.from(filteringKeys);
    }
    return Array.from(this.selectedKeys);
  }
  setModel(model) {
    return this.allValuesPromise.then((keys) => {
      if (model == null) {
        this.resetSelectionState(keys ?? []);
      } else {
        this.selectedKeys.clear();
        const existingFormattedKeys = /* @__PURE__ */ new Map();
        this.allValues.forEach((_value, key) => {
          existingFormattedKeys.set(this.caseFormat(key), key);
        });
        model.forEach((unformattedKey) => {
          const formattedKey = this.caseFormat(_makeNull2(unformattedKey));
          const existingUnformattedKey = existingFormattedKeys.get(formattedKey);
          if (existingUnformattedKey !== void 0) {
            this.selectKey(existingUnformattedKey);
          }
        });
      }
    });
  }
  uniqueValues(values) {
    const uniqueValues = /* @__PURE__ */ new Map();
    const formattedKeys = /* @__PURE__ */ new Set();
    (values ?? []).forEach((value) => {
      const valueToUse = _makeNull2(value);
      const unformattedKey = this.createKey(valueToUse);
      const formattedKey = this.caseFormat(unformattedKey);
      if (!formattedKeys.has(formattedKey)) {
        formattedKeys.add(formattedKey);
        uniqueValues.set(unformattedKey, valueToUse);
      }
    });
    return uniqueValues;
  }
  resetSelectionState(keys) {
    if (this.filterParams.defaultToNothingSelected) {
      this.selectedKeys.clear();
    } else {
      this.selectedKeys = new Set(keys);
    }
  }
  hasGroups() {
    return this.displayValueModel.hasGroups();
  }
  createTreeDataOrGroupingComparator() {
    return ([_aKey, aValue], [_bKey, bValue]) => {
      if (aValue == null) {
        return bValue == null ? 0 : -1;
      } else if (bValue == null) {
        return 1;
      }
      for (let i = 0; i < aValue.length; i++) {
        if (i >= bValue.length) {
          return 1;
        }
        const diff = _defaultComparator(aValue[i], bValue[i]);
        if (diff !== 0) {
          return diff;
        }
      }
      return 0;
    };
  }
  setAppliedModelKeys(appliedModelKeys) {
    this.filteringKeys.setFilteringKeys(appliedModelKeys);
  }
  addToAppliedModelKeys(appliedModelKey) {
    this.filteringKeys.addFilteringKey(appliedModelKey);
  }
  getAppliedModelKeys() {
    return this.filteringKeys.allFilteringKeys();
  }
  getCaseFormattedAppliedModelKeys() {
    return this.filteringKeys.allFilteringKeysCaseFormatted();
  }
  hasAppliedModelKey(appliedModelKey) {
    return this.filteringKeys.hasCaseFormattedFilteringKey(appliedModelKey);
  }
  hasAnyAppliedModelKey() {
    return !this.filteringKeys.noAppliedFilteringKeys();
  }
};

// enterprise-modules/set-filter/src/setFilter/setFilter.ts
var SetFilter = class extends ProvidedFilter {
  constructor() {
    super("setFilter");
    this.eMiniFilter = RefPlaceholder2;
    this.eFilterLoading = RefPlaceholder2;
    this.eSetFilterList = RefPlaceholder2;
    this.eFilterNoMatches = RefPlaceholder2;
    this.valueModel = null;
    this.setFilterParams = null;
    this.virtualList = null;
    this.caseSensitive = false;
    this.treeDataTreeList = false;
    this.groupingTreeList = false;
    this.hardRefreshVirtualList = false;
    this.noValueFormatterSupplied = false;
    this.filterModelFormatter = new SetFilterModelFormatter();
    this.updateSetFilterOnParamsChange = (newParams) => {
      this.setFilterParams = newParams;
      this.caseSensitive = !!newParams.caseSensitive;
      const keyCreator = newParams.keyCreator ?? newParams.colDef.keyCreator;
      this.setValueFormatter(newParams.valueFormatter, keyCreator, !!newParams.treeList, !!newParams.colDef.refData);
      const isGroupCol = newParams.column.getId().startsWith(GROUP_AUTO_COLUMN_ID);
      this.treeDataTreeList = this.gos.get("treeData") && !!newParams.treeList && isGroupCol;
      this.getDataPath = this.gos.get("getDataPath");
      this.groupingTreeList = !!this.funcColsService.getRowGroupColumns().length && !!newParams.treeList && isGroupCol;
      this.createKey = this.generateCreateKey(keyCreator, this.treeDataTreeList || this.groupingTreeList);
    };
  }
  wireBeans(beans) {
    super.wireBeans(beans);
    this.funcColsService = beans.funcColsService;
    this.valueService = beans.valueService;
    this.dataTypeService = beans.dataTypeService;
  }
  postConstruct() {
    super.postConstruct();
  }
  // unlike the simple filters, nothing in the set filter UI shows/hides.
  // maybe this method belongs in abstractSimpleFilter???
  updateUiVisibility() {
  }
  createBodyTemplate() {
    return (
      /* html */
      `
            <div class="ag-set-filter">
                <div data-ref="eFilterLoading" class="ag-filter-loading ag-hidden">${this.translateForSetFilter("loadingOoo")}</div>
                <ag-input-text-field class="ag-mini-filter" data-ref="eMiniFilter"></ag-input-text-field>
                <div data-ref="eFilterNoMatches" class="ag-filter-no-matches ag-hidden">${this.translateForSetFilter("noMatches")}</div>
                <div data-ref="eSetFilterList" class="ag-set-filter-list" role="presentation"></div>
            </div>`
    );
  }
  getAgComponents() {
    return [AgInputTextFieldSelector];
  }
  handleKeyDown(e) {
    super.handleKeyDown(e);
    if (e.defaultPrevented) {
      return;
    }
    switch (e.key) {
      case KeyCode.SPACE:
        this.handleKeySpace(e);
        break;
      case KeyCode.ENTER:
        this.handleKeyEnter(e);
        break;
      case KeyCode.LEFT:
        this.handleKeyLeft(e);
        break;
      case KeyCode.RIGHT:
        this.handleKeyRight(e);
        break;
    }
  }
  handleKeySpace(e) {
    this.getComponentForKeyEvent(e)?.toggleSelected();
  }
  handleKeyEnter(e) {
    if (!this.setFilterParams) {
      return;
    }
    const { excelMode, readOnly } = this.setFilterParams || {};
    if (!excelMode || !!readOnly) {
      return;
    }
    e.preventDefault();
    this.onBtApply(false, false, e);
    if (this.setFilterParams.excelMode === "mac") {
      this.eMiniFilter.getInputElement().select();
    }
  }
  handleKeyLeft(e) {
    this.getComponentForKeyEvent(e)?.setExpanded(false);
  }
  handleKeyRight(e) {
    this.getComponentForKeyEvent(e)?.setExpanded(true);
  }
  getComponentForKeyEvent(e) {
    if (!this.eSetFilterList.contains(this.gos.getActiveDomElement()) || !this.virtualList) {
      return;
    }
    const currentItem = this.virtualList.getLastFocusedRow();
    if (currentItem == null) {
      return;
    }
    const component = this.virtualList.getComponentAt(currentItem);
    if (component == null) {
      return;
    }
    e.preventDefault();
    const { readOnly } = this.setFilterParams ?? {};
    if (readOnly) {
      return;
    }
    return component;
  }
  getCssIdentifier() {
    return "set-filter";
  }
  setModel(model) {
    if (model == null && this.valueModel?.getModel() == null) {
      this.setMiniFilter(null);
      return AgPromise3.resolve();
    }
    return super.setModel(model);
  }
  refresh(params) {
    this.applyExcelModeOptions(params);
    if (!super.refresh(params)) {
      return false;
    }
    const paramsThatForceReload = [
      "treeList",
      "treeListFormatter",
      "treeListPathGetter",
      "caseSensitive",
      "comparator",
      "suppressSelectAll",
      "excelMode"
    ];
    if (paramsThatForceReload.some((param) => params[param] !== this.setFilterParams?.[param])) {
      return false;
    }
    if (this.haveColDefParamsChanged(params)) {
      return false;
    }
    super.updateParams(params);
    this.updateSetFilterOnParamsChange(params);
    this.updateMiniFilter();
    if (params.cellRenderer !== this.setFilterParams?.cellRenderer || params.valueFormatter !== this.setFilterParams?.valueFormatter) {
      this.checkAndRefreshVirtualList();
    }
    this.valueModel?.updateOnParamsChange(params).then(() => {
      if (this.valueModel?.hasSelections()) {
        this.refreshFilterValues();
      }
    });
    return true;
  }
  haveColDefParamsChanged(params) {
    const { colDef, keyCreator } = params;
    const { colDef: existingColDef, keyCreator: existingKeyCreator } = this.setFilterParams ?? {};
    const processedKeyCreator = keyCreator ?? colDef.keyCreator;
    return colDef.filterValueGetter !== existingColDef?.filterValueGetter || processedKeyCreator !== (existingKeyCreator ?? existingColDef?.keyCreator) || !!this.dataTypeService && this.dataTypeService.getFormatValue(colDef.cellDataType) === processedKeyCreator && colDef.valueFormatter !== existingColDef?.valueFormatter;
  }
  setModelAndRefresh(values) {
    return this.valueModel ? this.valueModel.setModel(values).then(() => this.checkAndRefreshVirtualList()) : AgPromise3.resolve();
  }
  resetUiToDefaults() {
    this.setMiniFilter(null);
    return this.setModelAndRefresh(null);
  }
  setModelIntoUi(model) {
    this.setMiniFilter(null);
    const values = model == null ? null : model.values;
    return this.setModelAndRefresh(values);
  }
  getModelFromUi() {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const values = this.valueModel.getModel();
    if (!values) {
      return null;
    }
    return { values, filterType: this.getFilterType() };
  }
  getFilterType() {
    return "set";
  }
  getValueModel() {
    return this.valueModel;
  }
  areModelsEqual(a, b) {
    if (a == null && b == null) {
      return true;
    }
    return a != null && b != null && _areEqual(a.values, b.values);
  }
  setParams(params) {
    this.applyExcelModeOptions(params);
    super.setParams(params);
    this.updateSetFilterOnParamsChange(params);
    const keyCreator = params.keyCreator ?? params.colDef.keyCreator;
    this.valueModel = new SetValueModel({
      filterParams: params,
      setIsLoading: (loading) => this.setIsLoading(loading),
      translate: (key) => this.translateForSetFilter(key),
      caseFormat: (v) => this.caseFormat(v),
      createKey: this.createKey,
      valueFormatter: this.valueFormatter,
      usingComplexObjects: !!keyCreator,
      gos: this.gos,
      funcColsService: this.funcColsService,
      valueService: this.valueService,
      treeDataTreeList: this.treeDataTreeList,
      groupingTreeList: this.groupingTreeList,
      addManagedEventListeners: (handlers) => this.addManagedEventListeners(handlers)
    });
    this.initialiseFilterBodyUi();
    this.addEventListenersForDataChanges();
  }
  onAddCurrentSelectionToFilterChange(newValue) {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    this.valueModel.setAddCurrentSelectionToFilter(newValue);
  }
  setValueFormatter(providedValueFormatter, keyCreator, treeList, isRefData) {
    let valueFormatter = providedValueFormatter;
    if (!valueFormatter) {
      if (keyCreator && !treeList) {
        throw new Error("AG Grid: Must supply a Value Formatter in Set Filter params when using a Key Creator");
      }
      this.noValueFormatterSupplied = true;
      if (!isRefData) {
        valueFormatter = (params) => _toStringOrNull3(params.value);
      }
    }
    this.valueFormatter = valueFormatter;
  }
  generateCreateKey(keyCreator, treeDataOrGrouping) {
    if (treeDataOrGrouping && !keyCreator) {
      throw new Error(
        "AG Grid: Must supply a Key Creator in Set Filter params when `treeList = true` on a group column, and Tree Data or Row Grouping is enabled."
      );
    }
    if (keyCreator) {
      return (value, node = null) => {
        const params = this.getKeyCreatorParams(value, node);
        return _makeNull3(keyCreator(params));
      };
    }
    return (value) => _makeNull3(_toStringOrNull3(value));
  }
  getFormattedValue(key) {
    let value = this.valueModel.getValue(key);
    if (this.noValueFormatterSupplied && (this.treeDataTreeList || this.groupingTreeList) && Array.isArray(value)) {
      value = _last(value);
    }
    const formattedValue = this.valueService.formatValue(
      this.setFilterParams.column,
      null,
      value,
      this.valueFormatter,
      false
    );
    return (formattedValue == null ? _toStringOrNull3(value) : formattedValue) ?? this.translateForSetFilter("blanks");
  }
  applyExcelModeOptions(params) {
    if (params.excelMode === "windows") {
      if (!params.buttons) {
        params.buttons = ["apply", "cancel"];
      }
      if (params.closeOnApply == null) {
        params.closeOnApply = true;
      }
    } else if (params.excelMode === "mac") {
      if (!params.buttons) {
        params.buttons = ["reset"];
      }
      if (params.applyMiniFilterWhileTyping == null) {
        params.applyMiniFilterWhileTyping = true;
      }
      if (params.debounceMs == null) {
        params.debounceMs = 500;
      }
    }
    if (params.excelMode && params.defaultToNothingSelected) {
      params.defaultToNothingSelected = false;
      _warnOnce4(
        'The Set Filter Parameter "defaultToNothingSelected" value was ignored because it does not work when "excelMode" is used.'
      );
    }
  }
  addEventListenersForDataChanges() {
    if (!this.isValuesTakenFromGrid()) {
      return;
    }
    this.addManagedEventListeners({
      cellValueChanged: (event) => {
        if (this.setFilterParams && event.column === this.setFilterParams.column) {
          this.syncAfterDataChange();
        }
      }
    });
    this.addManagedPropertyListeners(["treeData", "getDataPath", "groupAllowUnbalanced"], () => {
      this.syncAfterDataChange();
    });
  }
  syncAfterDataChange() {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const promise = this.valueModel.refreshValues();
    return promise.then(() => {
      this.checkAndRefreshVirtualList();
      this.onBtApply(false, true);
    });
  }
  setIsLoading(isLoading) {
    _setDisplayed2(this.eFilterLoading, isLoading);
    if (!isLoading) {
      this.hardRefreshVirtualList = true;
    }
  }
  initialiseFilterBodyUi() {
    this.initVirtualList();
    this.initMiniFilter();
  }
  initVirtualList() {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const translate = this.localeService.getLocaleTextFunc();
    const filterListName = translate("ariaFilterList", "Filter List");
    const isTree = !!this.setFilterParams.treeList;
    const virtualList = this.virtualList = this.createBean(
      new VirtualList({
        cssIdentifier: "filter",
        ariaRole: isTree ? "tree" : "listbox",
        listName: filterListName
      })
    );
    const eSetFilterList = this.eSetFilterList;
    if (isTree) {
      eSetFilterList.classList.add("ag-set-filter-tree-list");
    }
    if (eSetFilterList) {
      eSetFilterList.appendChild(virtualList.getGui());
    }
    const { cellHeight } = this.setFilterParams;
    if (cellHeight != null) {
      virtualList.setRowHeight(cellHeight);
    }
    const componentCreator = (item, listItemElement) => this.createSetListItem(item, isTree, listItemElement);
    virtualList.setComponentCreator(componentCreator);
    const componentUpdater = (item, component) => this.updateSetListItem(item, component);
    virtualList.setComponentUpdater(componentUpdater);
    let model;
    if (this.setFilterParams.suppressSelectAll) {
      model = new ModelWrapper(this.valueModel);
    } else {
      model = new ModelWrapperWithSelectAll(this.valueModel, () => this.isSelectAllSelected());
    }
    if (isTree) {
      model = new TreeModelWrapper(model);
    }
    virtualList.setModel(model);
  }
  getSelectAllLabel() {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const key = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ? "selectAll" : "selectAllSearchResults";
    return this.translateForSetFilter(key);
  }
  getAddSelectionToFilterLabel() {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    return this.translateForSetFilter("addCurrentSelectionToFilter");
  }
  createSetListItem(item, isTree, focusWrapper) {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const groupsExist = this.valueModel.hasGroups();
    const { isSelected, isExpanded } = this.isSelectedExpanded(item);
    const { value, depth, isGroup, hasIndeterminateExpandState, selectedListener, expandedListener } = this.newSetListItemAttributes(item);
    const itemParams = {
      focusWrapper,
      value,
      params: this.setFilterParams,
      translate: (translateKey) => this.translateForSetFilter(translateKey),
      valueFormatter: this.valueFormatter,
      item,
      isSelected,
      isTree,
      depth,
      groupsExist,
      isGroup,
      isExpanded,
      hasIndeterminateExpandState
    };
    const listItem = this.createBean(new SetFilterListItem(itemParams));
    listItem.addEventListener("selectionChanged", selectedListener);
    if (expandedListener) {
      listItem.addEventListener("expandedChanged", expandedListener);
    }
    return listItem;
  }
  newSetTreeItemAttributes(item) {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const groupsExist = this.valueModel.hasGroups();
    if (item.key === SetFilterDisplayValue.SELECT_ALL) {
      return {
        value: () => this.getSelectAllLabel(),
        isGroup: groupsExist,
        depth: item.depth,
        hasIndeterminateExpandState: true,
        selectedListener: (e) => this.onSelectAll(e.isSelected),
        expandedListener: (e) => this.onExpandAll(e.item, e.isExpanded)
      };
    }
    if (item.key === SetFilterDisplayValue.ADD_SELECTION_TO_FILTER) {
      return {
        value: () => this.getAddSelectionToFilterLabel(),
        depth: item.depth,
        isGroup: false,
        hasIndeterminateExpandState: false,
        selectedListener: (e) => {
          this.onAddCurrentSelectionToFilterChange(e.isSelected);
        }
      };
    }
    if (item.children) {
      return {
        value: this.setFilterParams.treeListFormatter?.(item.treeKey, item.depth, item.parentTreeKeys) ?? item.treeKey,
        depth: item.depth,
        isGroup: true,
        selectedListener: (e) => this.onGroupItemSelected(e.item, e.isSelected),
        expandedListener: (e) => this.onExpandedChanged(e.item, e.isExpanded)
      };
    }
    return {
      value: this.setFilterParams.treeListFormatter?.(item.treeKey, item.depth, item.parentTreeKeys) ?? item.treeKey,
      depth: item.depth,
      selectedListener: (e) => this.onItemSelected(e.item.key, e.isSelected)
    };
  }
  newSetListItemAttributes(item) {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    if (this.isSetFilterModelTreeItem(item)) {
      return this.newSetTreeItemAttributes(item);
    }
    if (item === SetFilterDisplayValue.SELECT_ALL) {
      return {
        value: () => this.getSelectAllLabel(),
        selectedListener: (e) => this.onSelectAll(e.isSelected)
      };
    }
    if (item === SetFilterDisplayValue.ADD_SELECTION_TO_FILTER) {
      return {
        value: () => this.getAddSelectionToFilterLabel(),
        selectedListener: (e) => {
          this.onAddCurrentSelectionToFilterChange(e.isSelected);
        }
      };
    }
    return {
      value: this.valueModel.getValue(item),
      selectedListener: (e) => this.onItemSelected(e.item, e.isSelected)
    };
  }
  updateSetListItem(item, component) {
    const { isSelected, isExpanded } = this.isSelectedExpanded(item);
    component.refresh(item, isSelected, isExpanded);
  }
  isSelectedExpanded(item) {
    let isSelected;
    let isExpanded;
    if (this.isSetFilterModelTreeItem(item)) {
      isExpanded = item.expanded;
      if (item.key === SetFilterDisplayValue.SELECT_ALL) {
        isSelected = this.isSelectAllSelected();
      } else if (item.key === SetFilterDisplayValue.ADD_SELECTION_TO_FILTER) {
        isSelected = this.valueModel.isAddCurrentSelectionToFilterChecked();
      } else if (item.children) {
        isSelected = this.areAllChildrenSelected(item);
      } else {
        isSelected = this.valueModel.isKeySelected(item.key);
      }
    } else {
      if (item === SetFilterDisplayValue.SELECT_ALL) {
        isSelected = this.isSelectAllSelected();
      } else if (item === SetFilterDisplayValue.ADD_SELECTION_TO_FILTER) {
        isSelected = this.valueModel.isAddCurrentSelectionToFilterChecked();
      } else {
        isSelected = this.valueModel.isKeySelected(item);
      }
    }
    return { isSelected, isExpanded };
  }
  isSetFilterModelTreeItem(item) {
    return item?.treeKey !== void 0;
  }
  initMiniFilter() {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const { eMiniFilter, localeService } = this;
    const translate = localeService.getLocaleTextFunc();
    eMiniFilter.setDisplayed(!this.setFilterParams.suppressMiniFilter);
    eMiniFilter.setValue(this.valueModel.getMiniFilter());
    eMiniFilter.onValueChange(() => this.onMiniFilterInput());
    eMiniFilter.setInputAriaLabel(translate("ariaSearchFilterValues", "Search filter values"));
    this.addManagedElementListeners(eMiniFilter.getInputElement(), {
      keydown: (e) => this.onMiniFilterKeyDown(e)
    });
  }
  updateMiniFilter() {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const { eMiniFilter } = this;
    if (eMiniFilter.isDisplayed() !== !this.setFilterParams.suppressMiniFilter) {
      eMiniFilter.setDisplayed(!this.setFilterParams.suppressMiniFilter);
    }
    const miniFilterValue = this.valueModel.getMiniFilter();
    if (eMiniFilter.getValue() !== miniFilterValue) {
      eMiniFilter.setValue(miniFilterValue);
    }
  }
  // we need to have the GUI attached before we can draw the virtual rows, as the
  // virtual row logic needs info about the GUI state
  afterGuiAttached(params) {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    super.afterGuiAttached(params);
    this.resetExpansion();
    this.refreshVirtualList();
    const { eMiniFilter } = this;
    eMiniFilter.setInputPlaceholder(this.translateForSetFilter("searchOoo"));
    if (!params || !params.suppressFocus) {
      eMiniFilter.getFocusableElement().focus();
    }
  }
  afterGuiDetached() {
    super.afterGuiDetached();
    if (this.setFilterParams?.excelMode) {
      this.resetMiniFilter();
    }
    const appliedModel = this.getModel();
    if (this.setFilterParams?.excelMode || !this.areModelsEqual(appliedModel, this.getModelFromUi())) {
      this.resetUiToActiveModel(appliedModel);
      this.showOrHideResults();
    }
  }
  applyModel(source = "api") {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    if (this.setFilterParams.excelMode && source !== "rowDataUpdated" && this.valueModel.isEverythingVisibleSelected()) {
      this.valueModel.selectAllMatchingMiniFilter();
    }
    const shouldKeepCurrentSelection = this.valueModel.showAddCurrentSelectionToFilter() && this.valueModel.isAddCurrentSelectionToFilterChecked();
    if (shouldKeepCurrentSelection && !this.getModel()) {
      return false;
    }
    const result = super.applyModel(source);
    const appliedModel = this.getModel();
    if (appliedModel) {
      if (!shouldKeepCurrentSelection) {
        this.valueModel.setAppliedModelKeys(/* @__PURE__ */ new Set());
      }
      appliedModel.values.forEach((key) => {
        this.valueModel.addToAppliedModelKeys(key);
      });
    } else {
      if (!shouldKeepCurrentSelection) {
        this.valueModel.setAppliedModelKeys(null);
      }
    }
    return result;
  }
  isModelValid(model) {
    return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
  }
  doesFilterPass(params) {
    if (!this.setFilterParams || !this.valueModel || !this.valueModel.getCaseFormattedAppliedModelKeys()) {
      return true;
    }
    if (!this.valueModel.hasAnyAppliedModelKey()) {
      return false;
    }
    const { node, data } = params;
    if (this.treeDataTreeList) {
      return this.doesFilterPassForTreeData(node, data);
    }
    if (this.groupingTreeList) {
      return this.doesFilterPassForGrouping(node);
    }
    const value = this.getValueFromNode(node);
    if (value != null && Array.isArray(value)) {
      if (value.length === 0) {
        return this.valueModel.hasAppliedModelKey(null);
      }
      return value.some((v) => this.isInAppliedModel(this.createKey(v, node)));
    }
    return this.isInAppliedModel(this.createKey(value, node));
  }
  doesFilterPassForTreeData(node, data) {
    if (node.childrenAfterGroup?.length) {
      return false;
    }
    return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(this.getDataPath(data))));
  }
  doesFilterPassForGrouping(node) {
    const dataPath = this.funcColsService.getRowGroupColumns().map((groupCol) => this.valueService.getKeyForNode(groupCol, node));
    dataPath.push(this.getValueFromNode(node));
    return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(dataPath)));
  }
  checkMakeNullDataPath(dataPath) {
    if (dataPath) {
      dataPath = dataPath.map((treeKey) => _toStringOrNull3(_makeNull3(treeKey)));
    }
    if (dataPath?.some((treeKey) => treeKey == null)) {
      if (this.gos.get("groupAllowUnbalanced") && _last(dataPath) != null) {
        return dataPath.filter((treeKey) => treeKey != null);
      }
      return null;
    }
    return dataPath;
  }
  isInAppliedModel(key) {
    return this.valueModel.hasAppliedModelKey(key);
  }
  getValueFromNode(node) {
    return this.setFilterParams.getValue(node);
  }
  getKeyCreatorParams(value, node = null) {
    return {
      value,
      colDef: this.setFilterParams.colDef,
      column: this.setFilterParams.column,
      node,
      data: node?.data,
      api: this.setFilterParams.api,
      context: this.setFilterParams.context
    };
  }
  onNewRowsLoaded() {
    if (!this.isValuesTakenFromGrid()) {
      return;
    }
    this.syncAfterDataChange();
  }
  isValuesTakenFromGrid() {
    if (!this.valueModel) {
      return false;
    }
    const valuesType = this.valueModel.getValuesType();
    return valuesType === 2 /* TAKEN_FROM_GRID_VALUES */;
  }
  //noinspection JSUnusedGlobalSymbols
  /**
   * Public method provided so the user can change the value of the filter once
   * the filter has been already started
   * @param values The values to use.
   */
  setFilterValues(values) {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    this.valueModel.overrideValues(values).then(() => {
      this.checkAndRefreshVirtualList();
      this.onUiChanged();
    });
  }
  //noinspection JSUnusedGlobalSymbols
  /**
   * Public method provided so the user can reset the values of the filter once that it has started.
   */
  resetFilterValues() {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    this.valueModel.setValuesType(2 /* TAKEN_FROM_GRID_VALUES */);
    this.syncAfterDataChange();
  }
  refreshFilterValues() {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    if (!this.valueModel.isInitialised()) {
      return;
    }
    this.valueModel.refreshValues().then(() => {
      this.checkAndRefreshVirtualList();
      this.onUiChanged();
    });
  }
  onAnyFilterChanged() {
    setTimeout(() => {
      if (!this.isAlive()) {
        return;
      }
      if (!this.valueModel) {
        throw new Error("Value model has not been created.");
      }
      this.valueModel.refreshAfterAnyFilterChanged().then((refresh) => {
        if (refresh) {
          this.checkAndRefreshVirtualList();
          this.showOrHideResults();
        }
      });
    }, 0);
  }
  onMiniFilterInput() {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    if (!this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
      return;
    }
    const { applyMiniFilterWhileTyping, readOnly } = this.setFilterParams || {};
    if (!readOnly && applyMiniFilterWhileTyping) {
      this.filterOnAllVisibleValues(false);
    } else {
      this.updateUiAfterMiniFilterChange();
    }
  }
  updateUiAfterMiniFilterChange() {
    if (!this.setFilterParams) {
      throw new Error("Set filter params have not been provided.");
    }
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const { excelMode, readOnly } = this.setFilterParams || {};
    if (excelMode == null || !!readOnly) {
      this.checkAndRefreshVirtualList();
    } else if (this.valueModel.getMiniFilter() == null) {
      this.resetUiToActiveModel(this.getModel());
    } else {
      this.valueModel.selectAllMatchingMiniFilter(true);
      this.checkAndRefreshVirtualList();
      this.onUiChanged();
    }
    this.showOrHideResults();
  }
  showOrHideResults() {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    const hideResults = this.valueModel.getMiniFilter() != null && this.valueModel.getDisplayedValueCount() < 1;
    _setDisplayed2(this.eFilterNoMatches, hideResults);
    _setDisplayed2(this.eSetFilterList, !hideResults);
  }
  resetMiniFilter() {
    this.eMiniFilter.setValue(null, true);
    this.valueModel?.setMiniFilter(null);
  }
  resetUiToActiveModel(currentModel, afterUiUpdatedFunc) {
    this.setModelAndRefresh(currentModel == null ? null : currentModel.values).then(() => {
      this.onUiChanged(false, "prevent");
      afterUiUpdatedFunc?.();
    });
  }
  handleCancelEnd(e) {
    this.setMiniFilter(null);
    super.handleCancelEnd(e);
  }
  onMiniFilterKeyDown(e) {
    const { excelMode, readOnly } = this.setFilterParams || {};
    if (e.key === KeyCode.ENTER && !excelMode && !readOnly) {
      this.filterOnAllVisibleValues();
    }
  }
  filterOnAllVisibleValues(applyImmediately = true) {
    const { readOnly } = this.setFilterParams || {};
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    if (readOnly) {
      throw new Error("Unable to filter in readOnly mode.");
    }
    this.valueModel.selectAllMatchingMiniFilter(true);
    this.checkAndRefreshVirtualList();
    this.onUiChanged(false, applyImmediately ? "immediately" : "debounce");
    this.showOrHideResults();
  }
  focusRowIfAlive(rowIndex) {
    if (rowIndex == null) {
      return;
    }
    window.setTimeout(() => {
      if (!this.virtualList) {
        throw new Error("Virtual list has not been created.");
      }
      if (this.isAlive()) {
        this.virtualList.focusRow(rowIndex);
      }
    }, 0);
  }
  onSelectAll(isSelected) {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    if (!this.virtualList) {
      throw new Error("Virtual list has not been created.");
    }
    if (isSelected) {
      this.valueModel.selectAllMatchingMiniFilter();
    } else {
      this.valueModel.deselectAllMatchingMiniFilter();
    }
    this.refreshAfterSelection();
  }
  onGroupItemSelected(item, isSelected) {
    const recursiveGroupSelection = (i) => {
      if (i.children) {
        i.children.forEach((childItem) => recursiveGroupSelection(childItem));
      } else {
        this.selectItem(i.key, isSelected);
      }
    };
    recursiveGroupSelection(item);
    this.refreshAfterSelection();
  }
  onItemSelected(key, isSelected) {
    if (!this.valueModel) {
      throw new Error("Value model has not been created.");
    }
    if (!this.virtualList) {
      throw new Error("Virtual list has not been created.");
    }
    this.selectItem(key, isSelected);
    this.refreshAfterSelection();
  }
  selectItem(key, isSelected) {
    if (isSelected) {
      this.valueModel.selectKey(key);
    } else {
      this.valueModel.deselectKey(key);
    }
  }
  onExpandAll(item, isExpanded) {
    const recursiveExpansion = (i) => {
      if (i.filterPasses && i.available && i.children) {
        i.children.forEach((childItem) => recursiveExpansion(childItem));
        i.expanded = isExpanded;
      }
    };
    recursiveExpansion(item);
    this.refreshAfterExpansion();
  }
  onExpandedChanged(item, isExpanded) {
    item.expanded = isExpanded;
    this.refreshAfterExpansion();
  }
  refreshAfterExpansion() {
    const focusedRow = this.virtualList.getLastFocusedRow();
    this.valueModel.updateDisplayedValues("expansion");
    this.checkAndRefreshVirtualList();
    this.focusRowIfAlive(focusedRow);
  }
  refreshAfterSelection() {
    const focusedRow = this.virtualList.getLastFocusedRow();
    this.checkAndRefreshVirtualList();
    this.onUiChanged();
    this.focusRowIfAlive(focusedRow);
  }
  setMiniFilter(newMiniFilter) {
    this.eMiniFilter.setValue(newMiniFilter);
    this.onMiniFilterInput();
  }
  getMiniFilter() {
    return this.valueModel ? this.valueModel.getMiniFilter() : null;
  }
  checkAndRefreshVirtualList() {
    if (!this.virtualList) {
      throw new Error("Virtual list has not been created.");
    }
    this.virtualList.refresh(!this.hardRefreshVirtualList);
    if (this.hardRefreshVirtualList) {
      this.hardRefreshVirtualList = false;
    }
  }
  getFilterKeys() {
    return this.valueModel ? this.valueModel.getKeys() : [];
  }
  getFilterValues() {
    return this.valueModel ? this.valueModel.getValues() : [];
  }
  getValues() {
    return this.getFilterKeys();
  }
  refreshVirtualList() {
    if (this.setFilterParams && this.setFilterParams.refreshValuesOnOpen) {
      this.refreshFilterValues();
    } else {
      this.checkAndRefreshVirtualList();
    }
  }
  translateForSetFilter(key) {
    const translate = this.localeService.getLocaleTextFunc();
    return translate(key, DEFAULT_LOCALE_TEXT[key]);
  }
  isSelectAllSelected() {
    if (!this.setFilterParams || !this.valueModel) {
      return false;
    }
    if (!this.setFilterParams.defaultToNothingSelected) {
      if (this.valueModel.hasSelections() && this.valueModel.isNothingVisibleSelected()) {
        return false;
      }
      if (this.valueModel.isEverythingVisibleSelected()) {
        return true;
      }
    } else {
      if (this.valueModel.hasSelections() && this.valueModel.isEverythingVisibleSelected()) {
        return true;
      }
      if (this.valueModel.isNothingVisibleSelected()) {
        return false;
      }
    }
    return void 0;
  }
  areAllChildrenSelected(item) {
    const recursiveChildSelectionCheck = (i) => {
      if (i.children) {
        let someTrue = false;
        let someFalse = false;
        const mixed = i.children.some((child) => {
          if (!child.filterPasses || !child.available) {
            return false;
          }
          const childSelected = recursiveChildSelectionCheck(child);
          if (childSelected === void 0) {
            return true;
          }
          if (childSelected) {
            someTrue = true;
          } else {
            someFalse = true;
          }
          return someTrue && someFalse;
        });
        return mixed ? void 0 : someTrue;
      } else {
        return this.valueModel.isKeySelected(i.key);
      }
    };
    if (!this.setFilterParams.defaultToNothingSelected) {
      return recursiveChildSelectionCheck(item);
    } else {
      return this.valueModel.hasSelections() && recursiveChildSelectionCheck(item);
    }
  }
  destroy() {
    if (this.virtualList != null) {
      this.virtualList.destroy();
      this.virtualList = null;
    }
    super.destroy();
  }
  caseFormat(valueToFormat) {
    if (valueToFormat == null || typeof valueToFormat !== "string") {
      return valueToFormat;
    }
    return this.caseSensitive ? valueToFormat : valueToFormat.toUpperCase();
  }
  resetExpansion() {
    if (!this.setFilterParams?.treeList) {
      return;
    }
    const selectAllItem = this.valueModel?.getSelectAllItem();
    if (this.isSetFilterModelTreeItem(selectAllItem)) {
      const recursiveCollapse = (i) => {
        if (i.children) {
          i.children.forEach((childItem) => recursiveCollapse(childItem));
          i.expanded = false;
        }
      };
      recursiveCollapse(selectAllItem);
      this.valueModel.updateDisplayedValues("expansion");
    }
  }
  getModelAsString(model) {
    return this.filterModelFormatter.getModelAsString(model, this);
  }
  getPositionableElement() {
    return this.eSetFilterList;
  }
};
var ModelWrapper = class {
  constructor(model) {
    this.model = model;
  }
  getRowCount() {
    return this.model.getDisplayedValueCount();
  }
  getRow(index) {
    return this.model.getDisplayedItem(index);
  }
  areRowsEqual(oldRow, newRow) {
    return oldRow === newRow;
  }
};
var ModelWrapperWithSelectAll = class {
  constructor(model, isSelectAllSelected) {
    this.model = model;
    this.isSelectAllSelected = isSelectAllSelected;
  }
  getRowCount() {
    const showAddCurrentSelectionToFilter = this.model.showAddCurrentSelectionToFilter();
    const outboundItems = showAddCurrentSelectionToFilter ? 2 : 1;
    return this.model.getDisplayedValueCount() + outboundItems;
  }
  getRow(index) {
    if (index === 0) {
      return this.model.getSelectAllItem();
    }
    const showAddCurrentSelectionToFilter = this.model.showAddCurrentSelectionToFilter();
    const outboundItems = showAddCurrentSelectionToFilter ? 2 : 1;
    if (index === 1 && showAddCurrentSelectionToFilter) {
      return this.model.getAddSelectionToFilterItem();
    }
    return this.model.getDisplayedItem(index - outboundItems);
  }
  areRowsEqual(oldRow, newRow) {
    return oldRow === newRow;
  }
};
var TreeModelWrapper = class {
  constructor(model) {
    this.model = model;
  }
  getRowCount() {
    return this.model.getRowCount();
  }
  getRow(index) {
    return this.model.getRow(index);
  }
  areRowsEqual(oldRow, newRow) {
    if (oldRow == null && newRow == null) {
      return true;
    }
    return oldRow != null && newRow != null && oldRow.treeKey === newRow.treeKey && oldRow.depth === newRow.depth;
  }
};

// enterprise-modules/set-filter/src/setFilter/setFloatingFilter.ts
import { AgInputTextFieldSelector as AgInputTextFieldSelector2, Component as Component2, RefPlaceholder as RefPlaceholder3 } from "@ag-grid-community/core";
var SetFloatingFilterComp = class extends Component2 {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-floating-filter-input ag-set-floating-filter-input" role="presentation">
                <ag-input-text-field data-ref="eFloatingFilterText"></ag-input-text-field>
            </div>`,
      [AgInputTextFieldSelector2]
    );
    this.eFloatingFilterText = RefPlaceholder3;
    this.availableValuesListenerAdded = false;
    this.filterModelFormatter = new SetFilterModelFormatter();
  }
  wireBeans(beans) {
    this.columnNameService = beans.columnNameService;
  }
  // this is a user component, and IComponent has "public destroy()" as part of the interface.
  // so we need to override destroy() just to make the method public.
  destroy() {
    super.destroy();
  }
  init(params) {
    this.params = params;
    this.eFloatingFilterText.setDisabled(true).addGuiEventListener("click", () => this.params.showParentFilter());
    this.setParams(params);
  }
  setParams(params) {
    const displayName = this.columnNameService.getDisplayNameForColumn(params.column, "header", true);
    const translate = this.localeService.getLocaleTextFunc();
    this.eFloatingFilterText.setInputAriaLabel(`${displayName} ${translate("ariaFilterInput", "Filter Input")}`);
  }
  onParamsUpdated(params) {
    this.refresh(params);
  }
  refresh(params) {
    this.params = params;
    this.setParams(params);
  }
  onParentModelChanged(parentModel) {
    this.updateFloatingFilterText(parentModel);
  }
  parentSetFilterInstance(cb) {
    this.params.parentFilterInstance((filter) => {
      if (!(filter instanceof SetFilter)) {
        throw new Error("AG Grid - SetFloatingFilter expects SetFilter as its parent");
      }
      cb(filter);
    });
  }
  addAvailableValuesListener() {
    this.parentSetFilterInstance((setFilter) => {
      const setValueModel = setFilter.getValueModel();
      if (!setValueModel) {
        return;
      }
      this.addManagedListeners(setValueModel, { availableValuesChanged: () => this.updateFloatingFilterText() });
    });
    this.availableValuesListenerAdded = true;
  }
  updateFloatingFilterText(parentModel) {
    if (!this.availableValuesListenerAdded) {
      this.addAvailableValuesListener();
    }
    this.parentSetFilterInstance((setFilter) => {
      this.eFloatingFilterText.setValue(this.filterModelFormatter.getModelAsString(parentModel, setFilter));
    });
  }
};

// enterprise-modules/set-filter/src/version.ts
var VERSION = "32.0.0";

// enterprise-modules/set-filter/src/setFilterModule.ts
var SetFilterCoreModule = {
  version: VERSION,
  moduleName: `${ModuleNames.SetFilterModule}-core`,
  userComponents: [{ name: "agSetColumnFilter", classImp: SetFilter }],
  dependantModules: [EnterpriseCoreModule, _ColumnFilterModule]
};
var SetFloatingFilterModule = {
  version: VERSION,
  moduleName: "@ag-grid-enterprise/set-floating-filter",
  userComponents: [{ name: "agSetColumnFloatingFilter", classImp: SetFloatingFilterComp }],
  dependantModules: [SetFilterCoreModule, _FloatingFilterModule]
};
var SetFilterModule = {
  version: VERSION,
  moduleName: ModuleNames.SetFilterModule,
  dependantModules: [SetFilterCoreModule, SetFloatingFilterModule]
};
export {
  SetFilter,
  SetFilterModule
};
//# sourceMappingURL=main.esm.mjs.map
