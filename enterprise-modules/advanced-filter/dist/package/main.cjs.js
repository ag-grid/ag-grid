var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

// enterprise-modules/advanced-filter/src/main.ts
var main_exports = {};
__export(main_exports, {
  AdvancedFilterModule: () => AdvancedFilterModule
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/advanced-filter/src/advancedFilterModule.ts
var import_core16 = require("@ag-grid-community/core");
var import_core17 = require("@ag-grid-enterprise/core");

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterComp.ts
var import_core13 = require("@ag-grid-community/core");

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterCtrl.ts
var import_core12 = require("@ag-grid-community/core");

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterHeaderComp.ts
var import_core = require("@ag-grid-community/core");
var AdvancedFilterHeaderComp = class extends import_core.Component {
  constructor(enabled) {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-header" role="row">
            </div>`
    );
    this.enabled = enabled;
  }
  postConstruct() {
    this.setupAdvancedFilter(this.enabled);
    this.addDestroyFunc(() => this.destroyBean(this.eAdvancedFilter));
    this.addManagedListener(this.eventService, import_core.Events.EVENT_GRID_COLUMNS_CHANGED, () => this.onGridColumnsChanged());
    this.addGuiEventListener("keydown", (event) => this.onKeyDown(event));
    this.addGuiEventListener("focusout", (event) => {
      if (!this.getFocusableElement().contains(event.relatedTarget)) {
        this.focusService.clearAdvancedFilterColumn();
      }
    });
  }
  getFocusableElement() {
    var _a, _b;
    return (_b = (_a = this.eAdvancedFilter) == null ? void 0 : _a.getGui()) != null ? _b : this.getGui();
  }
  setEnabled(enabled) {
    if (enabled === this.enabled) {
      return;
    }
    this.setupAdvancedFilter(enabled);
  }
  refresh() {
    var _a;
    (_a = this.eAdvancedFilter) == null ? void 0 : _a.refresh();
  }
  getHeight() {
    return this.height;
  }
  setInputDisabled(disabled) {
    var _a;
    (_a = this.eAdvancedFilter) == null ? void 0 : _a.setInputDisabled(disabled);
  }
  setupAdvancedFilter(enabled) {
    const eGui = this.getGui();
    if (enabled) {
      this.eAdvancedFilter = this.createBean(new AdvancedFilterComp());
      const eAdvancedFilterGui = this.eAdvancedFilter.getGui();
      this.eAdvancedFilter.addCssClass("ag-advanced-filter-header-cell");
      this.height = this.columnModel.getFloatingFiltersHeight();
      const height = `${this.height}px`;
      eGui.style.height = height;
      eGui.style.minHeight = height;
      this.setAriaRowIndex();
      import_core._.setAriaRole(eAdvancedFilterGui, "gridcell");
      import_core._.setAriaColIndex(eAdvancedFilterGui, 1);
      this.setAriaColumnCount(eAdvancedFilterGui);
      eGui.appendChild(eAdvancedFilterGui);
    } else {
      import_core._.clearElement(eGui);
      this.destroyBean(this.eAdvancedFilter);
      this.height = 0;
    }
    import_core._.setDisplayed(eGui, enabled);
    this.enabled = enabled;
  }
  setAriaColumnCount(eAdvancedFilterGui) {
    import_core._.setAriaColSpan(eAdvancedFilterGui, this.columnModel.getAllGridColumns().length);
  }
  setAriaRowIndex() {
    import_core._.setAriaRowIndex(this.getGui(), this.headerNavigationService.getHeaderRowCount());
  }
  onGridColumnsChanged() {
    if (!this.eAdvancedFilter) {
      return;
    }
    this.setAriaColumnCount(this.eAdvancedFilter.getGui());
    this.setAriaRowIndex();
  }
  onKeyDown(event) {
    switch (event.key) {
      case import_core.KeyCode.ENTER: {
        if (this.hasFocus()) {
          if (this.focusService.focusInto(this.getFocusableElement())) {
            event.preventDefault();
          }
        }
        break;
      }
      case import_core.KeyCode.ESCAPE:
        if (!this.hasFocus()) {
          this.getFocusableElement().focus();
        }
        break;
      case import_core.KeyCode.UP:
        this.navigateUpDown(true, event);
        break;
      case import_core.KeyCode.DOWN:
        this.navigateUpDown(false, event);
        break;
      case import_core.KeyCode.TAB:
        if (this.hasFocus()) {
          this.navigateLeftRight(event);
        } else {
          const nextFocusableEl = this.focusService.findNextFocusableElement(this.getFocusableElement(), null, event.shiftKey);
          if (nextFocusableEl) {
            event.preventDefault();
            nextFocusableEl.focus();
          } else {
            this.navigateLeftRight(event);
          }
        }
        break;
    }
  }
  navigateUpDown(backwards, event) {
    if (this.hasFocus()) {
      if (this.focusService.focusNextFromAdvancedFilter(backwards)) {
        event.preventDefault();
      }
      ;
    }
  }
  navigateLeftRight(event) {
    if (event.shiftKey ? this.focusService.focusLastHeader() : this.focusService.focusNextFromAdvancedFilter(false, true)) {
      event.preventDefault();
    }
  }
  hasFocus() {
    return this.gos.getActiveDomElement() === this.getFocusableElement();
  }
};
__decorateClass([
  (0, import_core.Autowired)("columnModel")
], AdvancedFilterHeaderComp.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core.Autowired)("focusService")
], AdvancedFilterHeaderComp.prototype, "focusService", 2);
__decorateClass([
  (0, import_core.Autowired)("headerNavigationService")
], AdvancedFilterHeaderComp.prototype, "headerNavigationService", 2);
__decorateClass([
  import_core.PostConstruct
], AdvancedFilterHeaderComp.prototype, "postConstruct", 1);

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderComp.ts
var import_core11 = require("@ag-grid-community/core");

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemComp.ts
var import_core9 = require("@ag-grid-community/core");

// enterprise-modules/advanced-filter/src/advancedFilter/builder/addDropdownComp.ts
var import_core2 = require("@ag-grid-community/core");
var AddDropdownComp = class extends import_core2.AgRichSelect {
  constructor(params) {
    super(__spreadProps(__spreadValues({}, params), {
      template: (
        /* html */
        `
                <div class="ag-picker-field" role="presentation">
                    <div ref="eLabel"></div>
                    <div ref="eWrapper" class="ag-wrapper ag-picker-collapsed">
                        <div ref="eDisplayField" class="ag-picker-field-display"></div>
                        <ag-input-text-field ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                        <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                    </div>
                </div>`
      )
    }));
    this.params = params;
  }
  showPicker() {
    setTimeout(() => super.showPicker());
  }
  hidePicker() {
    setTimeout(() => super.hidePicker());
  }
  postConstruct() {
    super.postConstruct();
    const { wrapperClassName, ariaLabel } = this.params;
    import_core2._.setDisplayed(this.eDisplayField, false);
    if (wrapperClassName) {
      this.eWrapper.classList.add(wrapperClassName);
    }
    import_core2._.setAriaLabelledBy(this.eWrapper, "");
    import_core2._.setAriaLabel(this.eWrapper, ariaLabel);
  }
  onEnterKeyDown(event) {
    import_core2._.stopPropagationForAgGrid(event);
    if (this.isPickerDisplayed) {
      super.onEnterKeyDown(event);
    } else {
      event.preventDefault();
      this.showPicker();
    }
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderDragFeature.ts
var import_core3 = require("@ag-grid-community/core");
var _AdvancedFilterBuilderDragFeature = class _AdvancedFilterBuilderDragFeature extends import_core3.BeanStub {
  constructor(comp, virtualList) {
    super();
    this.comp = comp;
    this.virtualList = virtualList;
  }
  postConstruct() {
    this.createManagedBean(new import_core3.VirtualListDragFeature(
      this.comp,
      this.virtualList,
      {
        dragSourceType: import_core3.DragSourceType.AdvancedFilterBuilder,
        listItemDragStartEvent: _AdvancedFilterBuilderDragFeature.EVENT_DRAG_STARTED,
        listItemDragEndEvent: _AdvancedFilterBuilderDragFeature.EVENT_DRAG_ENDED,
        eventSource: this,
        getCurrentDragValue: (listItemDragStartEvent) => this.getCurrentDragValue(listItemDragStartEvent),
        isMoveBlocked: () => false,
        getNumRows: (comp) => comp.getNumItems(),
        moveItem: (currentDragValue, lastHoveredListItem) => this.moveItem(currentDragValue, lastHoveredListItem)
      }
    ));
  }
  getCurrentDragValue(listItemDragStartEvent) {
    return listItemDragStartEvent.item;
  }
  moveItem(currentDragValue, lastHoveredListItem) {
    this.comp.moveItem(currentDragValue, lastHoveredListItem);
  }
};
_AdvancedFilterBuilderDragFeature.EVENT_DRAG_STARTED = "advancedFilterBuilderDragStarted";
_AdvancedFilterBuilderDragFeature.EVENT_DRAG_ENDED = "advancedFilterBuilderDragEnded";
__decorateClass([
  import_core3.PostConstruct
], _AdvancedFilterBuilderDragFeature.prototype, "postConstruct", 1);
var AdvancedFilterBuilderDragFeature = _AdvancedFilterBuilderDragFeature;

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemNavigationFeature.ts
var import_core4 = require("@ag-grid-community/core");
var AdvancedFilterBuilderItemNavigationFeature = class extends import_core4.BeanStub {
  constructor(eGui, focusWrapper, eFocusableComp) {
    super();
    this.eGui = eGui;
    this.focusWrapper = focusWrapper;
    this.eFocusableComp = eFocusableComp;
  }
  postConstruct() {
    this.addManagedListener(this.eGui, "keydown", (event) => {
      switch (event.key) {
        case import_core4.KeyCode.TAB:
          if (!event.defaultPrevented) {
            import_core4._.stopPropagationForAgGrid(event);
          }
          break;
        case import_core4.KeyCode.UP:
        case import_core4.KeyCode.DOWN:
          import_core4._.stopPropagationForAgGrid(event);
          break;
        case import_core4.KeyCode.ESCAPE:
          if (import_core4._.isStopPropagationForAgGrid(event)) {
            return;
          }
          if (this.eGui.contains(this.gos.getActiveDomElement())) {
            event.preventDefault();
            import_core4._.stopPropagationForAgGrid(event);
            this.focusWrapper.focus();
          }
          break;
      }
    });
    this.addManagedListener(this.focusWrapper, "keydown", (event) => {
      switch (event.key) {
        case import_core4.KeyCode.ENTER:
          if (import_core4._.isStopPropagationForAgGrid(event)) {
            return;
          }
          if (this.gos.getActiveDomElement() === this.focusWrapper) {
            event.preventDefault();
            import_core4._.stopPropagationForAgGrid(event);
            this.eFocusableComp.getFocusableElement().focus();
          }
          break;
      }
    });
    this.addManagedListener(this.focusWrapper, "focusin", () => {
      this.focusWrapper.classList.add("ag-advanced-filter-builder-virtual-list-item-highlight");
    });
    this.addManagedListener(this.focusWrapper, "focusout", (event) => {
      if (!this.focusWrapper.contains(event.relatedTarget)) {
        this.focusWrapper.classList.remove("ag-advanced-filter-builder-virtual-list-item-highlight");
      }
    });
  }
};
__decorateClass([
  import_core4.PostConstruct
], AdvancedFilterBuilderItemNavigationFeature.prototype, "postConstruct", 1);

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderUtils.ts
function getAdvancedFilterBuilderAddButtonParams(translate, maxPickerWidth) {
  return {
    pickerAriaLabelKey: "ariaLabelAdvancedFilterBuilderAddField",
    pickerAriaLabelValue: "Advanced Filter Builder Add Field",
    pickerType: "ag-list",
    valueList: [{
      key: "condition",
      displayValue: translate("advancedFilterBuilderAddCondition")
    }, {
      key: "join",
      displayValue: translate("advancedFilterBuilderAddJoin")
    }],
    valueFormatter: (value) => {
      var _a;
      return value == null ? null : (_a = value.displayValue) != null ? _a : value.key;
    },
    pickerIcon: "advancedFilterBuilderAdd",
    maxPickerWidth: `${maxPickerWidth != null ? maxPickerWidth : 120}px`,
    wrapperClassName: "ag-advanced-filter-builder-item-button",
    ariaLabel: translate("advancedFilterBuilderAddButtonTooltip")
  };
}

// enterprise-modules/advanced-filter/src/advancedFilter/builder/conditionPillWrapperComp.ts
var import_core5 = require("@ag-grid-community/core");

// enterprise-modules/advanced-filter/src/advancedFilter/builder/iAdvancedFilterBuilder.ts
var AdvancedFilterBuilderEvents = class {
};
AdvancedFilterBuilderEvents.EVENT_ADDED = "advancedFilterBuilderAdded";
AdvancedFilterBuilderEvents.EVENT_MOVED = "advancedFilterBuilderMoved";
AdvancedFilterBuilderEvents.EVENT_REMOVED = "advancedFilterBuilderRemoved";
AdvancedFilterBuilderEvents.EVENT_VALUE_CHANGED = "advancedFilterBuilderValueChanged";
AdvancedFilterBuilderEvents.EVENT_VALID_CHANGED = "advancedFilterBuilderValidChanged";

// enterprise-modules/advanced-filter/src/advancedFilter/builder/conditionPillWrapperComp.ts
var ConditionPillWrapperComp = class extends import_core5.Component {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-item-condition" role="presentation"></div>
        `
    );
    this.validationMessage = null;
  }
  init(params) {
    const { item, createPill } = params;
    this.item = item;
    this.createPill = createPill;
    this.filterModel = item.filterModel;
    this.setupColumnCondition(this.filterModel);
    this.validate();
    this.addDestroyFunc(() => this.destroyBeans([this.eColumnPill, this.eOperatorPill, this.eOperandPill]));
  }
  getDragName() {
    return this.filterModel.colId ? this.advancedFilterExpressionService.parseColumnFilterModel(this.filterModel) : this.getDefaultColumnDisplayValue();
  }
  getAriaLabel() {
    return `${this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderFilterItem")} ${this.getDragName()}`;
  }
  getValidationMessage() {
    return this.validationMessage;
  }
  getFocusableElement() {
    return this.eColumnPill.getFocusableElement();
  }
  setupColumnCondition(filterModel) {
    var _a;
    const columnDetails = this.advancedFilterExpressionService.getColumnDetails(filterModel.colId);
    this.baseCellDataType = columnDetails.baseCellDataType;
    this.column = columnDetails.column;
    this.numOperands = this.getNumOperands(this.getOperatorKey());
    this.eColumnPill = this.createPill({
      key: this.getColumnKey(),
      displayValue: (_a = this.getColumnDisplayValue()) != null ? _a : this.getDefaultColumnDisplayValue(),
      cssClass: "ag-advanced-filter-builder-column-pill",
      isSelect: true,
      getEditorParams: () => ({ values: this.advancedFilterExpressionService.getColumnAutocompleteEntries() }),
      update: (key) => this.setColumnKey(key),
      pickerAriaLabelKey: "ariaLabelAdvancedFilterBuilderColumnSelectField",
      pickerAriaLabelValue: "Advanced Filter Builder Column Select Field",
      ariaLabel: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderColumn")
    });
    this.getGui().appendChild(this.eColumnPill.getGui());
    if (import_core5._.exists(this.getColumnKey())) {
      this.createOperatorPill();
      if (this.hasOperand()) {
        this.createOperandPill();
      }
    }
  }
  createOperatorPill() {
    var _a;
    this.eOperatorPill = this.createPill({
      key: this.getOperatorKey(),
      displayValue: (_a = this.getOperatorDisplayValue()) != null ? _a : this.getDefaultOptionSelectValue(),
      cssClass: "ag-advanced-filter-builder-option-pill",
      isSelect: true,
      getEditorParams: () => ({ values: this.getOperatorAutocompleteEntries() }),
      update: (key) => this.setOperatorKey(key),
      pickerAriaLabelKey: "ariaLabelAdvancedFilterBuilderOptionSelectField",
      pickerAriaLabelValue: "Advanced Filter Builder Option Select Field",
      ariaLabel: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderOption")
    });
    this.eColumnPill.getGui().insertAdjacentElement("afterend", this.eOperatorPill.getGui());
  }
  createOperandPill() {
    var _a;
    const key = (_a = this.getOperandDisplayValue()) != null ? _a : "";
    this.eOperandPill = this.createPill({
      key,
      displayValue: key,
      baseCellDataType: this.baseCellDataType,
      cssClass: "ag-advanced-filter-builder-value-pill",
      isSelect: false,
      update: (key2) => this.setOperand(key2),
      ariaLabel: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderValue")
    });
    this.getGui().appendChild(this.eOperandPill.getGui());
  }
  getColumnKey() {
    return this.filterModel.colId;
  }
  getColumnDisplayValue() {
    return this.advancedFilterExpressionService.getColumnDisplayValue(this.filterModel);
  }
  getOperatorKey() {
    return this.filterModel.type;
  }
  getOperatorDisplayValue() {
    return this.advancedFilterExpressionService.getOperatorDisplayValue(this.filterModel);
  }
  getOperandDisplayValue() {
    return this.advancedFilterExpressionService.getOperandDisplayValue(this.filterModel, true);
  }
  hasOperand() {
    return this.numOperands > 0;
  }
  getOperatorAutocompleteEntries() {
    return this.column ? this.advancedFilterExpressionService.getOperatorAutocompleteEntries(
      this.column,
      this.baseCellDataType
    ) : [];
  }
  setColumnKey(colId) {
    if (!this.eOperatorPill) {
      this.createOperatorPill();
    }
    const newColumnDetails = this.advancedFilterExpressionService.getColumnDetails(colId);
    this.column = newColumnDetails.column;
    const newBaseCellDataType = newColumnDetails.baseCellDataType;
    if (this.baseCellDataType !== newBaseCellDataType) {
      this.baseCellDataType = newBaseCellDataType;
      this.setOperatorKey(void 0);
      if (this.eOperatorPill) {
        import_core5._.removeFromParent(this.eOperatorPill.getGui());
        this.destroyBean(this.eOperatorPill);
        this.createOperatorPill();
      }
      this.validate();
    }
    this.filterModel.colId = colId;
    this.filterModel.filterType = this.baseCellDataType;
  }
  setOperatorKey(operator) {
    const newNumOperands = this.getNumOperands(operator);
    if (newNumOperands !== this.numOperands) {
      this.numOperands = newNumOperands;
      if (newNumOperands === 0) {
        this.destroyOperandPill();
      } else {
        this.createOperandPill();
        if (this.baseCellDataType !== "number") {
          this.setOperand("");
        }
      }
    }
    this.filterModel.type = operator;
    this.validate();
  }
  setOperand(operand) {
    var _a;
    let parsedOperand = operand;
    if (this.column) {
      parsedOperand = (_a = this.advancedFilterExpressionService.getOperandModelValue(operand, this.baseCellDataType, this.column)) != null ? _a : "";
    }
    this.filterModel.filter = parsedOperand;
    this.validate();
  }
  getNumOperands(operator) {
    var _a, _b;
    return (_b = (_a = this.advancedFilterExpressionService.getExpressionOperator(this.baseCellDataType, operator)) == null ? void 0 : _a.numOperands) != null ? _b : 0;
  }
  destroyOperandPill() {
    delete this.filterModel.filter;
    this.getGui().removeChild(this.eOperandPill.getGui());
    this.destroyBean(this.eOperandPill);
    this.eOperandPill = void 0;
  }
  validate() {
    let validationMessage = null;
    if (!import_core5._.exists(this.getColumnKey())) {
      validationMessage = this.advancedFilterExpressionService.translate("advancedFilterBuilderValidationSelectColumn");
    } else if (!import_core5._.exists(this.getOperatorKey())) {
      validationMessage = this.advancedFilterExpressionService.translate("advancedFilterBuilderValidationSelectOption");
    } else if (this.numOperands > 0 && !import_core5._.exists(this.getOperandDisplayValue())) {
      validationMessage = this.advancedFilterExpressionService.translate("advancedFilterBuilderValidationEnterValue");
    }
    this.item.valid = !validationMessage;
    if (validationMessage !== this.validationMessage) {
      this.validationMessage = validationMessage;
      this.dispatchEvent({
        type: AdvancedFilterBuilderEvents.EVENT_VALID_CHANGED
      });
    }
  }
  getDefaultColumnDisplayValue() {
    return this.advancedFilterExpressionService.translate("advancedFilterBuilderSelectColumn");
  }
  getDefaultOptionSelectValue() {
    return this.advancedFilterExpressionService.translate("advancedFilterBuilderSelectOption");
  }
};
__decorateClass([
  (0, import_core5.Autowired)("advancedFilterExpressionService")
], ConditionPillWrapperComp.prototype, "advancedFilterExpressionService", 2);
__decorateClass([
  (0, import_core5.Autowired)("valueService")
], ConditionPillWrapperComp.prototype, "valueService", 2);

// enterprise-modules/advanced-filter/src/advancedFilter/builder/inputPillComp.ts
var import_core6 = require("@ag-grid-community/core");
var InputPillComp = class extends import_core6.Component {
  constructor(params) {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-pill-wrapper" role="presentation">
                <div ref="ePill" class="ag-advanced-filter-builder-pill" role="button">
                    <span ref="eLabel" class="ag-advanced-filter-builder-pill-display"></span>
                </div>
            </div>
        `
    );
    this.params = params;
    this.value = params.value;
  }
  postConstruct() {
    const { cssClass, ariaLabel } = this.params;
    this.ePill.classList.add(cssClass);
    this.activateTabIndex([this.ePill]);
    this.eLabel.id = `${this.getCompId()}`;
    import_core6._.setAriaDescribedBy(this.ePill, this.eLabel.id);
    import_core6._.setAriaLabel(this.ePill, ariaLabel);
    this.renderValue();
    this.addManagedListener(this.ePill, "click", (event) => {
      event.preventDefault();
      this.showEditor();
    });
    this.addManagedListener(this.ePill, "keydown", (event) => {
      switch (event.key) {
        case import_core6.KeyCode.ENTER:
          event.preventDefault();
          import_core6._.stopPropagationForAgGrid(event);
          this.showEditor();
          break;
      }
    });
    this.addDestroyFunc(() => this.destroyBean(this.eEditor));
  }
  getFocusableElement() {
    return this.ePill;
  }
  showEditor() {
    if (this.eEditor) {
      return;
    }
    import_core6._.setDisplayed(this.ePill, false);
    this.eEditor = this.createEditorComp(this.params.type);
    this.eEditor.setValue(this.value);
    const eEditorGui = this.eEditor.getGui();
    this.eEditor.addManagedListener(eEditorGui, "keydown", (event) => {
      switch (event.key) {
        case import_core6.KeyCode.ENTER:
          event.preventDefault();
          import_core6._.stopPropagationForAgGrid(event);
          this.updateValue(true);
          break;
        case import_core6.KeyCode.ESCAPE:
          event.preventDefault();
          import_core6._.stopPropagationForAgGrid(event);
          this.hideEditor(true);
          break;
      }
    });
    this.eEditor.addManagedListener(eEditorGui, "focusout", () => {
      this.updateValue(false);
    });
    this.getGui().appendChild(eEditorGui);
    this.eEditor.getFocusableElement().focus();
  }
  createEditorComp(type) {
    let comp;
    switch (type) {
      case "text":
        comp = new import_core6.AgInputTextField();
        break;
      case "number":
        comp = new import_core6.AgInputNumberField();
        break;
      case "date":
        comp = new import_core6.AgInputDateField();
        break;
    }
    return this.createBean(comp);
  }
  hideEditor(keepFocus) {
    const { eEditor } = this;
    if (!eEditor) {
      return;
    }
    this.eEditor = void 0;
    this.getGui().removeChild(eEditor.getGui());
    this.destroyBean(eEditor);
    import_core6._.setDisplayed(this.ePill, true);
    if (keepFocus) {
      this.ePill.focus();
    }
  }
  renderValue() {
    let value;
    this.eLabel.classList.remove(
      "ag-advanced-filter-builder-value-empty",
      "ag-advanced-filter-builder-value-number",
      "ag-advanced-filter-builder-value-text"
    );
    if (!import_core6._.exists(this.value)) {
      value = this.advancedFilterExpressionService.translate("advancedFilterBuilderEnterValue");
      this.eLabel.classList.add("ag-advanced-filter-builder-value-empty");
    } else if (this.params.type === "number") {
      value = this.value;
      this.eLabel.classList.add("ag-advanced-filter-builder-value-number");
    } else {
      value = `"${this.value}"`;
      this.eLabel.classList.add("ag-advanced-filter-builder-value-text");
    }
    this.eLabel.innerText = value;
  }
  updateValue(keepFocus) {
    var _a;
    if (!this.eEditor) {
      return;
    }
    const value = (_a = this.eEditor.getValue()) != null ? _a : "";
    this.dispatchEvent({
      type: import_core6.Events.EVENT_FIELD_VALUE_CHANGED,
      value
    });
    this.value = value;
    this.renderValue();
    this.hideEditor(keepFocus);
  }
};
__decorateClass([
  (0, import_core6.RefSelector)("ePill")
], InputPillComp.prototype, "ePill", 2);
__decorateClass([
  (0, import_core6.RefSelector)("eLabel")
], InputPillComp.prototype, "eLabel", 2);
__decorateClass([
  (0, import_core6.Autowired)("advancedFilterExpressionService")
], InputPillComp.prototype, "advancedFilterExpressionService", 2);
__decorateClass([
  import_core6.PostConstruct
], InputPillComp.prototype, "postConstruct", 1);

// enterprise-modules/advanced-filter/src/advancedFilter/builder/joinPillWrapperComp.ts
var import_core7 = require("@ag-grid-community/core");
var JoinPillWrapperComp = class extends import_core7.Component {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-item-condition" role="presentation"></div>
        `
    );
  }
  init(params) {
    const { item, createPill } = params;
    const filterModel = item.filterModel;
    this.filterModel = filterModel;
    this.ePill = createPill({
      key: filterModel.type,
      displayValue: this.advancedFilterExpressionService.parseJoinOperator(filterModel),
      cssClass: "ag-advanced-filter-builder-join-pill",
      isSelect: true,
      getEditorParams: () => ({ values: this.advancedFilterExpressionService.getJoinOperatorAutocompleteEntries() }),
      update: (key) => filterModel.type = key,
      pickerAriaLabelKey: "ariaLabelAdvancedFilterBuilderJoinSelectField",
      pickerAriaLabelValue: "Advanced Filter Builder Join Operator Select Field",
      ariaLabel: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderJoinOperator")
    });
    this.getGui().appendChild(this.ePill.getGui());
    this.addDestroyFunc(() => this.destroyBean(this.ePill));
  }
  getDragName() {
    return this.advancedFilterExpressionService.parseJoinOperator(this.filterModel);
  }
  getAriaLabel() {
    return `${this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderGroupItem")} ${this.getDragName()}`;
  }
  getValidationMessage() {
    return null;
  }
  getFocusableElement() {
    return this.ePill.getFocusableElement();
  }
};
__decorateClass([
  (0, import_core7.Autowired)("advancedFilterExpressionService")
], JoinPillWrapperComp.prototype, "advancedFilterExpressionService", 2);

// enterprise-modules/advanced-filter/src/advancedFilter/builder/selectPillComp.ts
var import_core8 = require("@ag-grid-community/core");
var SelectPillComp = class extends import_core8.AgRichSelect {
  constructor(params) {
    super(__spreadProps(__spreadValues({}, params), {
      template: (
        /* html */
        `
                <div class="ag-picker-field ag-advanced-filter-builder-pill-wrapper" role="presentation">
                    <div ref="eLabel"></div>
                    <div ref="eWrapper" class="ag-wrapper ag-advanced-filter-builder-pill ag-picker-collapsed">
                        <div ref="eDisplayField" class="ag-picker-field-display ag-advanced-filter-builder-pill-display"></div>
                        <ag-input-text-field ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                        <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                    </div>
                </div>`
      )
    }));
    this.params = params;
  }
  getFocusableElement() {
    return this.eWrapper;
  }
  showPicker() {
    setTimeout(() => super.showPicker());
  }
  hidePicker() {
    setTimeout(() => super.hidePicker());
  }
  postConstruct() {
    super.postConstruct();
    const { wrapperClassName, ariaLabel } = this.params;
    this.eWrapper.classList.add(wrapperClassName);
    import_core8._.setAriaLabelledBy(this.eWrapper, "");
    import_core8._.setAriaLabel(this.eWrapper, ariaLabel);
  }
  createPickerComponent() {
    var _a;
    if (!this.values) {
      const { values } = this.params.getEditorParams();
      this.values = values;
      const key = this.value.key;
      const value = (_a = values.find((value2) => value2.key === key)) != null ? _a : {
        key,
        displayValue: this.value.displayValue
      };
      this.value = value;
    }
    return super.createPickerComponent();
  }
  onEnterKeyDown(event) {
    import_core8._.stopPropagationForAgGrid(event);
    if (this.isPickerDisplayed) {
      super.onEnterKeyDown(event);
    } else {
      event.preventDefault();
      this.showPicker();
    }
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemComp.ts
var AdvancedFilterBuilderItemComp = class extends import_core9.TabGuardComp {
  constructor(item, dragFeature, focusWrapper) {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-item-wrapper" role="presentation">
                <div ref="eItem" class="ag-advanced-filter-builder-item" role="presentation">
                    <div ref="eTreeLines" class="ag-advanced-filter-builder-item-tree-lines" aria-hidden="true"></div>
                    <span ref="eDragHandle" class="ag-drag-handle" aria-hidden="true"></span>
                    <span ref="eValidation" class="ag-advanced-filter-builder-item-button ag-advanced-filter-builder-invalid" aria-hidden="true"></span>
                </div>
                <div ref="eButtons" class="ag-advanced-filter-builder-item-buttons">
                    <span ref="eMoveUpButton" class="ag-advanced-filter-builder-item-button" role="button"></span>
                    <span ref="eMoveDownButton" class="ag-advanced-filter-builder-item-button" role="button"></span>
                    <div ref="eAddButton" role="presentation"></div>
                    <span ref="eRemoveButton" class="ag-advanced-filter-builder-item-button" role="button"></span>
                </div>
            </div>
        `
    );
    this.item = item;
    this.dragFeature = dragFeature;
    this.focusWrapper = focusWrapper;
    this.moveUpDisabled = false;
    this.moveDownDisabled = false;
  }
  postConstruct() {
    const { filterModel, level, showMove } = this.item;
    const isJoin = filterModel.filterType === "join";
    this.ePillWrapper = this.createManagedBean(isJoin ? new JoinPillWrapperComp() : new ConditionPillWrapperComp());
    this.ePillWrapper.init({ item: this.item, createPill: (params) => this.createPill(params) });
    this.eDragHandle.insertAdjacentElement("afterend", this.ePillWrapper.getGui());
    if (level === 0) {
      const eTreeLine = document.createElement("div");
      eTreeLine.classList.add("ag-advanced-filter-builder-item-tree-line-vertical-bottom");
      eTreeLine.classList.add("ag-advanced-filter-builder-item-tree-line-root");
      this.eTreeLines.appendChild(eTreeLine);
      import_core9._.setDisplayed(this.eDragHandle, false);
      import_core9._.setDisplayed(this.eButtons, false);
      import_core9._.setAriaExpanded(this.focusWrapper, true);
    } else {
      this.setupTreeLines(level);
      this.eDragHandle.appendChild(import_core9._.createIconNoSpan("advancedFilterBuilderDrag", this.gos));
      this.setupValidation();
      this.setupMoveButtons(showMove);
      this.setupAddButton();
      this.setupRemoveButton();
      this.setupDragging();
      this.updateAriaExpanded();
    }
    import_core9._.setAriaLevel(this.focusWrapper, level + 1);
    this.initialiseTabGuard({});
    this.createManagedBean(new AdvancedFilterBuilderItemNavigationFeature(
      this.getGui(),
      this.focusWrapper,
      this.ePillWrapper
    ));
    this.updateAriaLabel();
    this.addManagedListener(this.ePillWrapper, AdvancedFilterBuilderEvents.EVENT_VALUE_CHANGED, () => this.dispatchEvent({
      type: AdvancedFilterBuilderEvents.EVENT_VALUE_CHANGED
    }));
    this.addManagedListener(this.ePillWrapper, AdvancedFilterBuilderEvents.EVENT_VALID_CHANGED, () => this.updateValidity());
  }
  setState(params) {
    const { level } = this.item;
    if (level === 0) {
      return;
    }
    const { showMove } = this.item;
    const { disableMoveUp, disableMoveDown, treeLines, showStartTreeLine } = params;
    this.updateTreeLines(treeLines, showStartTreeLine);
    this.updateAriaExpanded();
    if (showMove) {
      this.moveUpDisabled = !!disableMoveUp;
      this.moveDownDisabled = !!disableMoveDown;
      this.eMoveUpButton.classList.toggle("ag-advanced-filter-builder-item-button-disabled", disableMoveUp);
      this.eMoveDownButton.classList.toggle("ag-advanced-filter-builder-item-button-disabled", disableMoveDown);
      import_core9._.setAriaDisabled(this.eMoveUpButton, !!disableMoveUp);
      import_core9._.setAriaDisabled(this.eMoveDownButton, !!disableMoveDown);
      this.moveUpTooltipFeature.refreshToolTip();
      this.moveDownTooltipFeature.refreshToolTip();
    }
  }
  focusMoveButton(backwards) {
    (backwards ? this.eMoveUpButton : this.eMoveDownButton).focus();
  }
  afterAdd() {
    this.ePillWrapper.getFocusableElement().focus();
  }
  setupTreeLines(level) {
    for (let i = 0; i < level; i++) {
      const eTreeLine = document.createElement("div");
      this.eTreeLines.appendChild(eTreeLine);
    }
  }
  updateTreeLines(treeLines, showStartTreeLine) {
    const lastTreeLineIndex = treeLines.length - 1;
    const { children } = this.eTreeLines;
    for (let i = 0; i < lastTreeLineIndex; i++) {
      const eTreeLine2 = children.item(i);
      if (eTreeLine2) {
        eTreeLine2.classList.toggle("ag-advanced-filter-builder-item-tree-line-vertical", !treeLines[i]);
      }
    }
    const eTreeLine = children.item(lastTreeLineIndex);
    if (eTreeLine) {
      eTreeLine.classList.add("ag-advanced-filter-builder-item-tree-line-horizontal");
      const isLastChild = treeLines[lastTreeLineIndex];
      eTreeLine.classList.toggle("ag-advanced-filter-builder-item-tree-line-vertical-top", isLastChild);
      eTreeLine.classList.toggle("ag-advanced-filter-builder-item-tree-line-vertical", !isLastChild);
    }
    this.eDragHandle.classList.toggle("ag-advanced-filter-builder-item-tree-line-vertical-bottom", showStartTreeLine);
  }
  setupValidation() {
    this.eValidation.appendChild(import_core9._.createIconNoSpan("advancedFilterBuilderInvalid", this.gos));
    this.validationTooltipFeature = this.createManagedBean(new import_core9.TooltipFeature({
      getGui: () => this.eValidation,
      getLocation: () => "advancedFilter",
      getTooltipValue: () => this.ePillWrapper.getValidationMessage(),
      getTooltipShowDelayOverride: () => 1e3
    }));
    this.updateValidity();
  }
  setupAddButton() {
    var _a;
    const addButtonParams = getAdvancedFilterBuilderAddButtonParams(
      (key) => this.advancedFilterExpressionService.translate(key),
      (_a = this.gos.get("advancedFilterBuilderParams")) == null ? void 0 : _a.addSelectWidth
    );
    const eAddButton = this.createManagedBean(new AddDropdownComp(addButtonParams));
    this.addManagedListener(
      eAddButton,
      import_core9.Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
      ({ value }) => this.dispatchEvent({
        type: AdvancedFilterBuilderEvents.EVENT_ADDED,
        item: this.item,
        isJoin: value.key === "join"
      })
    );
    this.eAddButton.appendChild(eAddButton.getGui());
    this.createManagedBean(new import_core9.TooltipFeature({
      getGui: () => this.eAddButton,
      getLocation: () => "advancedFilter",
      getTooltipValue: () => this.advancedFilterExpressionService.translate("advancedFilterBuilderAddButtonTooltip")
    }));
  }
  setupRemoveButton() {
    this.eRemoveButton.appendChild(import_core9._.createIconNoSpan("advancedFilterBuilderRemove", this.gos));
    this.addManagedListener(this.eRemoveButton, "click", () => this.removeItem());
    this.addManagedListener(this.eRemoveButton, "keydown", (event) => {
      switch (event.key) {
        case import_core9.KeyCode.ENTER:
          event.preventDefault();
          import_core9._.stopPropagationForAgGrid(event);
          this.removeItem();
          break;
      }
    });
    this.createManagedBean(new import_core9.TooltipFeature({
      getGui: () => this.eRemoveButton,
      getLocation: () => "advancedFilter",
      getTooltipValue: () => this.advancedFilterExpressionService.translate("advancedFilterBuilderRemoveButtonTooltip")
    }));
    import_core9._.setAriaLabel(this.eRemoveButton, this.advancedFilterExpressionService.translate("advancedFilterBuilderRemoveButtonTooltip"));
    this.activateTabIndex([this.eRemoveButton]);
  }
  setupMoveButtons(showMove) {
    if (showMove) {
      this.eMoveUpButton.appendChild(import_core9._.createIconNoSpan("advancedFilterBuilderMoveUp", this.gos));
      this.addManagedListener(this.eMoveUpButton, "click", () => this.moveItem(true));
      this.addManagedListener(this.eMoveUpButton, "keydown", (event) => {
        switch (event.key) {
          case import_core9.KeyCode.ENTER:
            event.preventDefault();
            import_core9._.stopPropagationForAgGrid(event);
            this.moveItem(true);
            break;
        }
      });
      this.moveUpTooltipFeature = this.createManagedBean(new import_core9.TooltipFeature({
        getGui: () => this.eMoveUpButton,
        getLocation: () => "advancedFilter",
        getTooltipValue: () => this.moveUpDisabled ? null : this.advancedFilterExpressionService.translate("advancedFilterBuilderMoveUpButtonTooltip")
      }));
      import_core9._.setAriaLabel(this.eMoveUpButton, this.advancedFilterExpressionService.translate("advancedFilterBuilderMoveUpButtonTooltip"));
      this.eMoveDownButton.appendChild(import_core9._.createIconNoSpan("advancedFilterBuilderMoveDown", this.gos));
      this.addManagedListener(this.eMoveDownButton, "click", () => this.moveItem(false));
      this.addManagedListener(this.eMoveDownButton, "keydown", (event) => {
        switch (event.key) {
          case import_core9.KeyCode.ENTER:
            event.preventDefault();
            import_core9._.stopPropagationForAgGrid(event);
            this.moveItem(false);
            break;
        }
      });
      this.moveDownTooltipFeature = this.createManagedBean(new import_core9.TooltipFeature({
        getGui: () => this.eMoveDownButton,
        getLocation: () => "advancedFilter",
        getTooltipValue: () => this.moveDownDisabled ? null : this.advancedFilterExpressionService.translate("advancedFilterBuilderMoveDownButtonTooltip")
      }));
      import_core9._.setAriaLabel(this.eMoveDownButton, this.advancedFilterExpressionService.translate("advancedFilterBuilderMoveDownButtonTooltip"));
      this.activateTabIndex([this.eMoveUpButton, this.eMoveDownButton]);
    } else {
      import_core9._.setDisplayed(this.eMoveUpButton, false);
      import_core9._.setDisplayed(this.eMoveDownButton, false);
    }
  }
  updateValidity() {
    import_core9._.setVisible(this.eValidation, !this.item.valid);
    this.validationTooltipFeature.refreshToolTip();
    this.updateAriaLabel();
  }
  createPill(params) {
    var _a, _b;
    const { key, displayValue, cssClass, update, ariaLabel } = params;
    const onUpdated = (key2) => {
      if (key2 == null) {
        return;
      }
      update(key2);
      this.dispatchEvent({
        type: AdvancedFilterBuilderEvents.EVENT_VALUE_CHANGED
      });
    };
    if (params.isSelect) {
      const { getEditorParams, pickerAriaLabelKey, pickerAriaLabelValue } = params;
      const advancedFilterBuilderParams = this.gos.get("advancedFilterBuilderParams");
      const minPickerWidth = `${(_a = advancedFilterBuilderParams == null ? void 0 : advancedFilterBuilderParams.pillSelectMinWidth) != null ? _a : 140}px`;
      const maxPickerWidth = `${(_b = advancedFilterBuilderParams == null ? void 0 : advancedFilterBuilderParams.pillSelectMaxWidth) != null ? _b : 200}px`;
      const comp = this.createBean(new SelectPillComp({
        pickerAriaLabelKey,
        pickerAriaLabelValue,
        pickerType: "ag-list",
        value: {
          key,
          displayValue
        },
        valueFormatter: (value) => {
          var _a2;
          return value == null ? null : (_a2 = value.displayValue) != null ? _a2 : value.key;
        },
        variableWidth: true,
        minPickerWidth,
        maxPickerWidth,
        getEditorParams,
        wrapperClassName: cssClass,
        ariaLabel
      }));
      this.addManagedListener(
        comp,
        import_core9.Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
        ({ value }) => onUpdated(value == null ? void 0 : value.key)
      );
      return comp;
    } else {
      const comp = this.createBean(new InputPillComp({
        value: displayValue,
        cssClass,
        type: this.getInputType(params.baseCellDataType),
        ariaLabel
      }));
      this.addManagedListener(
        comp,
        import_core9.Events.EVENT_FIELD_VALUE_CHANGED,
        ({ value }) => onUpdated(value)
      );
      return comp;
    }
  }
  getInputType(baseCellDataType) {
    switch (baseCellDataType) {
      case "text":
      case "object":
      case "boolean":
        return "text";
      case "number":
        return "number";
      case "date":
      case "dateString":
        return "date";
    }
  }
  setupDragging() {
    const dragSource = {
      type: import_core9.DragSourceType.AdvancedFilterBuilder,
      eElement: this.eDragHandle,
      dragItemName: () => this.ePillWrapper.getDragName(),
      getDefaultIconName: () => import_core9.DragAndDropService.ICON_NOT_ALLOWED,
      getDragItem: () => ({}),
      onDragStarted: () => this.dragFeature.dispatchEvent({
        type: AdvancedFilterBuilderDragFeature.EVENT_DRAG_STARTED,
        item: this.item
      }),
      onDragStopped: () => this.dragFeature.dispatchEvent({
        type: AdvancedFilterBuilderDragFeature.EVENT_DRAG_ENDED
      })
    };
    this.dragAndDropService.addDragSource(dragSource, true);
    this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
  }
  updateAriaLabel() {
    const wrapperLabel = this.ePillWrapper.getAriaLabel();
    const level = `${this.item.level + 1}`;
    const validationMessage = this.ePillWrapper.getValidationMessage();
    let ariaLabel;
    if (validationMessage) {
      ariaLabel = this.advancedFilterExpressionService.translate(
        "ariaAdvancedFilterBuilderItemValidation",
        [wrapperLabel, level, validationMessage]
      );
    } else {
      ariaLabel = this.advancedFilterExpressionService.translate(
        "ariaAdvancedFilterBuilderItem",
        [wrapperLabel, level]
      );
    }
    import_core9._.setAriaLabel(this.focusWrapper, ariaLabel);
  }
  updateAriaExpanded() {
    import_core9._.removeAriaExpanded(this.focusWrapper);
    const { filterModel } = this.item;
    if ((filterModel == null ? void 0 : filterModel.filterType) === "join" && filterModel.conditions.length) {
      import_core9._.setAriaExpanded(this.focusWrapper, true);
    }
  }
  removeItem() {
    this.dispatchEvent({
      type: AdvancedFilterBuilderEvents.EVENT_REMOVED,
      item: this.item
    });
  }
  moveItem(backwards) {
    this.dispatchEvent({
      type: AdvancedFilterBuilderEvents.EVENT_MOVED,
      item: this.item,
      backwards
    });
  }
};
__decorateClass([
  (0, import_core9.RefSelector)("eTreeLines")
], AdvancedFilterBuilderItemComp.prototype, "eTreeLines", 2);
__decorateClass([
  (0, import_core9.RefSelector)("eDragHandle")
], AdvancedFilterBuilderItemComp.prototype, "eDragHandle", 2);
__decorateClass([
  (0, import_core9.RefSelector)("eItem")
], AdvancedFilterBuilderItemComp.prototype, "eItem", 2);
__decorateClass([
  (0, import_core9.RefSelector)("eButtons")
], AdvancedFilterBuilderItemComp.prototype, "eButtons", 2);
__decorateClass([
  (0, import_core9.RefSelector)("eValidation")
], AdvancedFilterBuilderItemComp.prototype, "eValidation", 2);
__decorateClass([
  (0, import_core9.RefSelector)("eMoveUpButton")
], AdvancedFilterBuilderItemComp.prototype, "eMoveUpButton", 2);
__decorateClass([
  (0, import_core9.RefSelector)("eMoveDownButton")
], AdvancedFilterBuilderItemComp.prototype, "eMoveDownButton", 2);
__decorateClass([
  (0, import_core9.RefSelector)("eAddButton")
], AdvancedFilterBuilderItemComp.prototype, "eAddButton", 2);
__decorateClass([
  (0, import_core9.RefSelector)("eRemoveButton")
], AdvancedFilterBuilderItemComp.prototype, "eRemoveButton", 2);
__decorateClass([
  (0, import_core9.Autowired)("beans")
], AdvancedFilterBuilderItemComp.prototype, "beans", 2);
__decorateClass([
  (0, import_core9.Autowired)("dragAndDropService")
], AdvancedFilterBuilderItemComp.prototype, "dragAndDropService", 2);
__decorateClass([
  (0, import_core9.Autowired)("advancedFilterExpressionService")
], AdvancedFilterBuilderItemComp.prototype, "advancedFilterExpressionService", 2);
__decorateClass([
  import_core9.PostConstruct
], AdvancedFilterBuilderItemComp.prototype, "postConstruct", 1);

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemAddComp.ts
var import_core10 = require("@ag-grid-community/core");
var AdvancedFilterBuilderItemAddComp = class extends import_core10.Component {
  constructor(item, focusWrapper) {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-item-wrapper" role="presentation">
                <div ref="eItem" class="ag-advanced-filter-builder-item" role="presentation">
                    <div class="ag-advanced-filter-builder-item-tree-lines" aria-hidden="true">
                        <div class="ag-advanced-filter-builder-item-tree-line-vertical-top ag-advanced-filter-builder-item-tree-line-horizontal"></div>
                    </div>
                </div>
            </div>
        `
    );
    this.item = item;
    this.focusWrapper = focusWrapper;
  }
  postConstruct() {
    var _a;
    import_core10._.setAriaLevel(this.focusWrapper, 2);
    const addButtonParams = getAdvancedFilterBuilderAddButtonParams(
      (key) => this.advancedFilterExpressionService.translate(key),
      (_a = this.gos.get("advancedFilterBuilderParams")) == null ? void 0 : _a.addSelectWidth
    );
    const eAddButton = this.createManagedBean(new AddDropdownComp(addButtonParams));
    this.addManagedListener(eAddButton, import_core10.Events.EVENT_FIELD_PICKER_VALUE_SELECTED, ({ value }) => {
      this.dispatchEvent({
        type: AdvancedFilterBuilderEvents.EVENT_ADDED,
        item: this.item,
        isJoin: value.key === "join"
      });
    });
    this.eItem.appendChild(eAddButton.getGui());
    this.createManagedBean(new import_core10.TooltipFeature({
      getGui: () => eAddButton.getGui(),
      getLocation: () => "advancedFilter",
      getTooltipValue: () => this.advancedFilterExpressionService.translate("advancedFilterBuilderAddButtonTooltip")
    }));
    this.createManagedBean(new AdvancedFilterBuilderItemNavigationFeature(
      this.getGui(),
      this.focusWrapper,
      eAddButton
    ));
    import_core10._.setAriaLabel(
      this.focusWrapper,
      this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderItem", [
        this.advancedFilterExpressionService.translate("advancedFilterBuilderAddButtonTooltip"),
        `${this.item.level + 1}`
      ])
    );
  }
  afterAdd() {
  }
};
__decorateClass([
  (0, import_core10.Autowired)("beans")
], AdvancedFilterBuilderItemAddComp.prototype, "beans", 2);
__decorateClass([
  (0, import_core10.Autowired)("advancedFilterExpressionService")
], AdvancedFilterBuilderItemAddComp.prototype, "advancedFilterExpressionService", 2);
__decorateClass([
  (0, import_core10.RefSelector)("eItem")
], AdvancedFilterBuilderItemAddComp.prototype, "eItem", 2);
__decorateClass([
  import_core10.PostConstruct
], AdvancedFilterBuilderItemAddComp.prototype, "postConstruct", 1);

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderComp.ts
var AdvancedFilterBuilderComp = class extends import_core11.Component {
  constructor() {
    super(
      /* html */
      `
            <div role="presentation" class="ag-advanced-filter-builder" tabindex="-1">
                <div role="presentation" class="ag-advanced-filter-builder-list" ref="eList"></div>
                <div role="presentation" class="ag-advanced-filter-builder-button-panel">
                    <button class="ag-button ag-standard-button ag-advanced-filter-builder-apply-button" ref="eApplyFilterButton"></button>
                    <button class="ag-button ag-standard-button ag-advanced-filter-builder-cancel-button" ref="eCancelFilterButton"></button>
                </div>
            </div>`
    );
    this.validationMessage = null;
  }
  postConstruct() {
    var _a;
    const { showMoveButtons } = (_a = this.gos.get("advancedFilterBuilderParams")) != null ? _a : {};
    this.showMove = !!showMoveButtons;
    this.addManagedPropertyListener("advancedFilterBuilderParams", ({ currentValue }) => {
      this.showMove = !!(currentValue == null ? void 0 : currentValue.showMoveButtons);
      this.refreshList(false);
    });
    this.filterModel = this.setupFilterModel();
    this.setupVirtualList();
    this.dragFeature = this.createManagedBean(new AdvancedFilterBuilderDragFeature(this, this.virtualList));
    this.setupButtons();
  }
  refresh() {
    let indexToFocus = this.virtualList.getLastFocusedRow();
    this.setupFilterModel();
    this.validateItems();
    this.refreshList(false);
    if (indexToFocus != null) {
      if (!this.virtualList.getComponentAt(indexToFocus)) {
        indexToFocus = 0;
      }
      this.virtualList.focusRow(indexToFocus);
    }
  }
  getNumItems() {
    return this.items.length;
  }
  moveItem(item, destination) {
    if (!destination || !item) {
      return;
    }
    this.moveItemToIndex(item, destination.rowIndex, destination.position);
  }
  afterGuiAttached() {
    this.virtualList.focusRow(0);
  }
  setupVirtualList() {
    this.virtualList = this.createManagedBean(new import_core11.VirtualList({
      cssIdentifier: "advanced-filter-builder",
      ariaRole: "tree",
      listName: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderList")
    }));
    this.virtualList.setComponentCreator(this.createItemComponent.bind(this));
    this.virtualList.setComponentUpdater(this.updateItemComponent.bind(this));
    this.virtualList.setRowHeight(40);
    this.eList.appendChild(this.virtualList.getGui());
    this.virtualList.setModel({
      getRowCount: () => this.items.length,
      getRow: (index) => this.items[index],
      areRowsEqual: (oldRow, newRow) => oldRow === newRow
    });
    this.buildList();
    this.virtualList.refresh();
  }
  setupButtons() {
    this.eApplyFilterButton.innerText = this.advancedFilterExpressionService.translate("advancedFilterBuilderApply");
    this.activateTabIndex([this.eApplyFilterButton]);
    this.addManagedListener(this.eApplyFilterButton, "click", () => {
      this.advancedFilterService.setModel(this.filterModel);
      this.filterManager.onFilterChanged({ source: "advancedFilter" });
      this.close();
    });
    this.validationTooltipFeature = this.createManagedBean(new import_core11.TooltipFeature({
      getGui: () => this.eApplyFilterButton,
      getLocation: () => "advancedFilter",
      getTooltipValue: () => this.validationMessage,
      getTooltipShowDelayOverride: () => 1e3
    }));
    this.validate();
    this.addManagedListener(
      this.eApplyFilterButton,
      "mouseenter",
      () => this.addOrRemoveCssClass("ag-advanced-filter-builder-validation", true)
    );
    this.addManagedListener(
      this.eApplyFilterButton,
      "mouseleave",
      () => this.addOrRemoveCssClass("ag-advanced-filter-builder-validation", false)
    );
    this.eCancelFilterButton.innerText = this.advancedFilterExpressionService.translate("advancedFilterBuilderCancel");
    this.activateTabIndex([this.eCancelFilterButton]);
    this.addManagedListener(this.eCancelFilterButton, "click", () => this.close());
  }
  removeItemFromParent(item) {
    const sourceParentIndex = item.parent.conditions.indexOf(item.filterModel);
    item.parent.conditions.splice(sourceParentIndex, 1);
    return sourceParentIndex;
  }
  moveItemToIndex(item, destinationRowIndex, destinationPosition) {
    var _a;
    const destinationItem = this.items[destinationRowIndex];
    const destinationIsParent = ((_a = destinationItem.filterModel) == null ? void 0 : _a.filterType) === "join" && destinationPosition === "bottom";
    const destinationParent = destinationIsParent ? destinationItem.filterModel : destinationItem.parent;
    if (!destinationParent) {
      return;
    }
    if (this.isChildOrSelf(destinationParent, item.filterModel) || destinationItem === item) {
      return;
    }
    this.removeItemFromParent(item);
    let destinationParentIndex;
    if (destinationIsParent) {
      destinationParentIndex = 0;
    } else {
      destinationParentIndex = destinationParent.conditions.indexOf(destinationItem.filterModel);
      if (destinationParentIndex === -1) {
        destinationParentIndex = destinationParent.conditions.length;
      } else if (destinationPosition === "bottom") {
        destinationParentIndex += 1;
      }
    }
    destinationParent.conditions.splice(destinationParentIndex, 0, item.filterModel);
    this.refreshList(false);
  }
  isChildOrSelf(modelToCheck, potentialParentModel) {
    return modelToCheck === potentialParentModel || potentialParentModel.filterType === "join" && potentialParentModel.conditions.some((condition) => this.isChildOrSelf(modelToCheck, condition));
  }
  setupFilterModel() {
    const filterModel = this.formatFilterModel(this.advancedFilterService.getModel());
    this.stringifiedModel = JSON.stringify(filterModel);
    return filterModel;
  }
  formatFilterModel(filterModel) {
    filterModel = filterModel != null ? filterModel : {
      filterType: "join",
      type: "AND",
      conditions: []
    };
    if (filterModel.filterType !== "join") {
      filterModel = {
        filterType: "join",
        type: "AND",
        conditions: [filterModel]
      };
    }
    return filterModel;
  }
  buildList() {
    const parseFilterModel = (filterModel, items, level, parent) => {
      items.push({ filterModel, level, parent, valid: true, showMove: this.showMove });
      if (filterModel.filterType === "join") {
        filterModel.conditions.forEach((childFilterModel) => parseFilterModel(childFilterModel, items, level + 1, filterModel));
        if (level === 0) {
          items.push({ filterModel: null, level: level + 1, parent: filterModel, valid: true });
        }
      }
    };
    this.items = [];
    parseFilterModel(this.filterModel, this.items, 0);
  }
  refreshList(softRefresh) {
    if (!softRefresh) {
      const invalidModels = [];
      this.items.forEach((item) => {
        if (!item.valid) {
          invalidModels.push(item.filterModel);
        }
      });
      this.buildList();
      if (invalidModels.length) {
        this.items.forEach((item) => {
          if (item.filterModel && invalidModels.includes(item.filterModel)) {
            item.valid = false;
          }
        });
      }
    }
    this.virtualList.refresh(softRefresh);
    this.validate();
  }
  updateItemComponent(item, comp) {
    const index = this.items.indexOf(item);
    const populateTreeLines = (filterModel2, treeLines2) => {
      const parentItem = this.items.find((itemToCheck) => itemToCheck.filterModel === filterModel2);
      const parentFilterModel = parentItem == null ? void 0 : parentItem.parent;
      if (parentFilterModel) {
        const { conditions } = parentFilterModel;
        populateTreeLines(parentFilterModel, treeLines2);
        treeLines2.push(conditions[conditions.length - 1] === filterModel2);
      }
    };
    const treeLines = [];
    const { filterModel } = item;
    if (filterModel) {
      populateTreeLines(filterModel, treeLines);
      treeLines[0] = false;
    }
    const showStartTreeLine = (filterModel == null ? void 0 : filterModel.filterType) === "join" && !!filterModel.conditions.length;
    comp.setState({
      disableMoveUp: index === 1,
      disableMoveDown: !this.canMoveDown(item, index),
      treeLines,
      showStartTreeLine
    });
  }
  createItemComponent(item, focusWrapper) {
    const itemComp = this.createBean(item.filterModel ? new AdvancedFilterBuilderItemComp(item, this.dragFeature, focusWrapper) : new AdvancedFilterBuilderItemAddComp(item, focusWrapper));
    itemComp.addManagedListener(
      itemComp,
      AdvancedFilterBuilderEvents.EVENT_REMOVED,
      ({ item: item2 }) => this.removeItem(item2)
    );
    itemComp.addManagedListener(
      itemComp,
      AdvancedFilterBuilderEvents.EVENT_VALUE_CHANGED,
      () => this.validate()
    );
    itemComp.addManagedListener(
      itemComp,
      AdvancedFilterBuilderEvents.EVENT_ADDED,
      ({ item: item2, isJoin }) => this.addItem(item2, isJoin)
    );
    itemComp.addManagedListener(
      itemComp,
      AdvancedFilterBuilderEvents.EVENT_MOVED,
      ({ item: item2, backwards }) => this.moveItemUpDown(item2, backwards)
    );
    if (itemComp instanceof AdvancedFilterBuilderItemComp) {
      this.updateItemComponent(item, itemComp);
    }
    return itemComp;
  }
  addItem(item, isJoin) {
    var _a;
    const { parent: itemParent, level, filterModel: itemFilterModel } = item;
    const itemIsJoin = (itemFilterModel == null ? void 0 : itemFilterModel.filterType) === "join";
    const filterModel = isJoin ? {
      filterType: "join",
      type: "AND",
      conditions: []
    } : {};
    const parent = itemIsJoin ? itemFilterModel : itemParent;
    let insertIndex = itemIsJoin ? 0 : parent.conditions.indexOf(itemFilterModel);
    if (insertIndex >= 0) {
      if (!itemIsJoin) {
        insertIndex += 1;
      }
      parent.conditions.splice(insertIndex, 0, filterModel);
    } else {
      parent.conditions.push(filterModel);
    }
    let index = this.items.indexOf(item);
    const softRefresh = index >= 0;
    if (softRefresh) {
      if (item.filterModel) {
        index++;
      }
      const newItems = [{
        filterModel,
        level: itemIsJoin ? level + 1 : level,
        parent,
        valid: isJoin,
        showMove: this.showMove
      }];
      this.items.splice(index, 0, ...newItems);
    }
    this.refreshList(softRefresh);
    if (softRefresh) {
      (_a = this.virtualList.getComponentAt(index)) == null ? void 0 : _a.afterAdd();
    }
  }
  removeItem(item) {
    var _a;
    const parent = item.parent;
    const { filterModel } = item;
    const parentIndex = parent.conditions.indexOf(filterModel);
    parent.conditions.splice(parentIndex, 1);
    const isJoin = ((_a = item.filterModel) == null ? void 0 : _a.filterType) === "join";
    const index = this.items.indexOf(item);
    const softRefresh = !isJoin && index >= 0;
    if (softRefresh) {
      this.items.splice(index, 1);
    }
    this.refreshList(softRefresh);
    if (index >= 0) {
      this.virtualList.focusRow(index);
    }
  }
  moveItemUpDown(item, backwards) {
    const itemIndex = this.items.indexOf(item);
    const destinationIndex = backwards ? itemIndex - 1 : itemIndex + 1;
    if (destinationIndex === 0 || !backwards && !this.canMoveDown(item, itemIndex)) {
      return;
    }
    const destinationItem = this.items[destinationIndex];
    const indexInParent = this.removeItemFromParent(item);
    const { level, filterModel, parent } = item;
    const { level: destinationLevel, filterModel: destinationFilterModel, parent: destinationParent } = destinationItem;
    if (backwards) {
      if (destinationLevel === level && destinationFilterModel.filterType === "join") {
        destinationFilterModel.conditions.push(filterModel);
      } else if (destinationLevel <= level) {
        const destinationIndex2 = destinationParent.conditions.indexOf(destinationFilterModel);
        destinationParent.conditions.splice(destinationIndex2, 0, filterModel);
      } else {
        const newParentItem = parent.conditions[indexInParent - 1];
        newParentItem.conditions.push(filterModel);
      }
    } else {
      if (destinationLevel === level) {
        if (destinationFilterModel.filterType === "join") {
          destinationFilterModel.conditions.splice(0, 0, filterModel);
        } else {
          const destinationIndex2 = destinationParent.conditions.indexOf(destinationFilterModel);
          destinationParent.conditions.splice(destinationIndex2 + 1, 0, filterModel);
        }
      } else {
        if (indexInParent < parent.conditions.length) {
          parent.conditions.splice(indexInParent + 1, 0, filterModel);
        } else {
          const parentItem = this.items.find((itemToCheck) => itemToCheck.filterModel === parent);
          const destinationIndex2 = parentItem.parent.conditions.indexOf(parentItem.filterModel) + 1;
          parentItem.parent.conditions.splice(destinationIndex2, 0, filterModel);
        }
      }
    }
    this.refreshList(false);
    const newIndex = this.items.findIndex(({ filterModel: filterModelToCheck }) => filterModelToCheck === filterModel);
    if (newIndex >= 0) {
      const comp = this.virtualList.getComponentAt(newIndex);
      if (comp instanceof AdvancedFilterBuilderItemComp) {
        comp.focusMoveButton(backwards);
      }
    }
  }
  canMoveDown(item, index) {
    return !(item.level === 1 && index === this.items.length - 2 || item.level === 1 && item.parent.conditions[item.parent.conditions.length - 1] === item.filterModel);
  }
  close() {
    this.advancedFilterService.getCtrl().toggleFilterBuilder("ui");
  }
  validate() {
    let disableApply = !this.items.every(({ valid }) => valid);
    if (!disableApply) {
      disableApply = JSON.stringify(this.filterModel) === this.stringifiedModel;
      if (disableApply) {
        this.validationMessage = this.advancedFilterExpressionService.translate("advancedFilterBuilderValidationAlreadyApplied");
      } else {
        this.validationMessage = null;
      }
    } else {
      this.validationMessage = this.advancedFilterExpressionService.translate("advancedFilterBuilderValidationIncomplete");
    }
    import_core11._.setDisabled(this.eApplyFilterButton, disableApply);
    this.validationTooltipFeature.refreshToolTip();
  }
  validateItems() {
    const clearOperator = (filterModel) => {
      filterModel.type = void 0;
    };
    const clearOperand = (filterModel) => {
      delete filterModel.filter;
    };
    this.items.forEach((item) => {
      if (!item.valid || !item.filterModel || item.filterModel.filterType === "join") {
        return;
      }
      const { filterModel } = item;
      const { colId } = filterModel;
      const hasColumn = this.advancedFilterExpressionService.getColumnAutocompleteEntries().find(({ key }) => key === colId);
      const columnDetails = this.advancedFilterExpressionService.getColumnDetails(filterModel.colId);
      if (!hasColumn || !columnDetails.column) {
        item.valid = false;
        filterModel.colId = void 0;
        clearOperator(filterModel);
        clearOperand(filterModel);
        return;
      }
      const operatorForType = this.advancedFilterExpressionService.getDataTypeExpressionOperator(columnDetails.baseCellDataType);
      const operator = operatorForType.operators[filterModel.type];
      if (!operator) {
        item.valid = false;
        clearOperator(filterModel);
        clearOperand(filterModel);
        return;
      }
      if (operator.numOperands > 0 && !import_core11._.exists(filterModel.filter)) {
        item.valid = false;
        return;
      }
    });
  }
};
__decorateClass([
  (0, import_core11.RefSelector)("eList")
], AdvancedFilterBuilderComp.prototype, "eList", 2);
__decorateClass([
  (0, import_core11.RefSelector)("eApplyFilterButton")
], AdvancedFilterBuilderComp.prototype, "eApplyFilterButton", 2);
__decorateClass([
  (0, import_core11.RefSelector)("eCancelFilterButton")
], AdvancedFilterBuilderComp.prototype, "eCancelFilterButton", 2);
__decorateClass([
  (0, import_core11.Autowired)("filterManager")
], AdvancedFilterBuilderComp.prototype, "filterManager", 2);
__decorateClass([
  (0, import_core11.Autowired)("advancedFilterService")
], AdvancedFilterBuilderComp.prototype, "advancedFilterService", 2);
__decorateClass([
  (0, import_core11.Autowired)("advancedFilterExpressionService")
], AdvancedFilterBuilderComp.prototype, "advancedFilterExpressionService", 2);
__decorateClass([
  (0, import_core11.Autowired)("beans")
], AdvancedFilterBuilderComp.prototype, "beans", 2);
__decorateClass([
  import_core11.PostConstruct
], AdvancedFilterBuilderComp.prototype, "postConstruct", 1);

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterCtrl.ts
var _AdvancedFilterCtrl = class _AdvancedFilterCtrl extends import_core12.BeanStub {
  constructor(enabled) {
    super();
    this.enabled = enabled;
  }
  postConstruct() {
    this.hasAdvancedFilterParent = !!this.gos.get("advancedFilterParent");
    this.ctrlsService.whenReady(() => this.setAdvancedFilterComp());
    this.addManagedListener(
      this.eventService,
      import_core12.Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
      ({ enabled }) => this.onEnabledChanged(enabled)
    );
    this.addManagedPropertyListener("advancedFilterParent", () => this.updateComps());
    this.addDestroyFunc(() => {
      this.destroyAdvancedFilterComp();
      this.destroyBean(this.eBuilderComp);
      if (this.eBuilderDialog && this.eBuilderDialog.isAlive()) {
        this.destroyBean(this.eBuilderDialog);
      }
    });
  }
  setupHeaderComp(eCompToInsertBefore) {
    this.eHeaderComp = this.createManagedBean(new AdvancedFilterHeaderComp(this.enabled && !this.hasAdvancedFilterParent));
    eCompToInsertBefore.insertAdjacentElement("beforebegin", this.eHeaderComp.getGui());
  }
  focusHeaderComp() {
    if (this.eHeaderComp) {
      this.eHeaderComp.getFocusableElement().focus();
      return true;
    }
    return false;
  }
  refreshComp() {
    var _a, _b;
    (_a = this.eFilterComp) == null ? void 0 : _a.refresh();
    (_b = this.eHeaderComp) == null ? void 0 : _b.refresh();
  }
  refreshBuilderComp() {
    var _a;
    (_a = this.eBuilderComp) == null ? void 0 : _a.refresh();
  }
  getHeaderHeight() {
    var _a, _b;
    return (_b = (_a = this.eHeaderComp) == null ? void 0 : _a.getHeight()) != null ? _b : 0;
  }
  setInputDisabled(disabled) {
    var _a, _b;
    (_a = this.eFilterComp) == null ? void 0 : _a.setInputDisabled(disabled);
    (_b = this.eHeaderComp) == null ? void 0 : _b.setInputDisabled(disabled);
  }
  toggleFilterBuilder(source, force) {
    if (force && this.eBuilderDialog || force === false && !this.eBuilderDialog) {
      return;
    }
    if (this.eBuilderDialog) {
      this.builderDestroySource = source;
      this.destroyBean(this.eBuilderDialog);
      return;
    }
    this.setInputDisabled(true);
    const { width, height, minWidth } = this.getBuilderDialogSize();
    this.eBuilderComp = this.createBean(new AdvancedFilterBuilderComp());
    this.eBuilderDialog = this.createBean(new import_core12.AgDialog({
      title: this.advancedFilterExpressionService.translate("advancedFilterBuilderTitle"),
      component: this.eBuilderComp,
      width,
      height,
      resizable: true,
      movable: true,
      maximizable: true,
      centered: true,
      closable: true,
      minWidth,
      afterGuiAttached: () => {
        var _a;
        return (_a = this.eBuilderComp) == null ? void 0 : _a.afterGuiAttached();
      }
    }));
    this.dispatchFilterBuilderVisibleChangedEvent(source, true);
    this.eBuilderDialog.addEventListener(import_core12.AgDialog.EVENT_DESTROYED, () => {
      var _a;
      this.destroyBean(this.eBuilderComp);
      this.eBuilderComp = void 0;
      this.eBuilderDialog = void 0;
      this.setInputDisabled(false);
      this.dispatchEvent({
        type: _AdvancedFilterCtrl.EVENT_BUILDER_CLOSED
      });
      this.dispatchFilterBuilderVisibleChangedEvent((_a = this.builderDestroySource) != null ? _a : "ui", false);
      this.builderDestroySource = void 0;
    });
  }
  dispatchFilterBuilderVisibleChangedEvent(source, visible) {
    const event = {
      type: import_core12.Events.EVENT_ADVANCED_FILTER_BUILDER_VISIBLE_CHANGED,
      source,
      visible
    };
    this.eventService.dispatchEvent(event);
  }
  getBuilderDialogSize() {
    var _a, _b;
    const minWidth = (_b = (_a = this.gos.get("advancedFilterBuilderParams")) == null ? void 0 : _a.minWidth) != null ? _b : 500;
    const popupParent = this.popupService.getPopupParent();
    const maxWidth = Math.round(import_core12._.getAbsoluteWidth(popupParent)) - 2;
    const maxHeight = Math.round(import_core12._.getAbsoluteHeight(popupParent) * 0.75) - 2;
    const width = Math.min(Math.max(600, minWidth), maxWidth);
    const height = Math.min(600, maxHeight);
    return { width, height, minWidth };
  }
  onEnabledChanged(enabled) {
    this.enabled = enabled;
    this.updateComps();
  }
  updateComps() {
    this.setAdvancedFilterComp();
    this.setHeaderCompEnabled();
    this.eventService.dispatchEvent({
      type: import_core12.Events.EVENT_HEADER_HEIGHT_CHANGED
    });
  }
  setAdvancedFilterComp() {
    this.destroyAdvancedFilterComp();
    if (!this.enabled) {
      return;
    }
    const advancedFilterParent = this.gos.get("advancedFilterParent");
    this.hasAdvancedFilterParent = !!advancedFilterParent;
    if (advancedFilterParent) {
      const eAdvancedFilterComp = this.createBean(new AdvancedFilterComp());
      const eAdvancedFilterCompGui = eAdvancedFilterComp.getGui();
      const { allThemes } = this.environment.getTheme();
      if (allThemes.length) {
        eAdvancedFilterCompGui.classList.add(...allThemes);
      }
      eAdvancedFilterCompGui.classList.add(this.gos.get("enableRtl") ? "ag-rtl" : "ag-ltr");
      advancedFilterParent.appendChild(eAdvancedFilterCompGui);
      this.eFilterComp = eAdvancedFilterComp;
    }
  }
  setHeaderCompEnabled() {
    var _a;
    (_a = this.eHeaderComp) == null ? void 0 : _a.setEnabled(this.enabled && !this.hasAdvancedFilterParent);
  }
  destroyAdvancedFilterComp() {
    if (this.eFilterComp) {
      import_core12._.removeFromParent(this.eFilterComp.getGui());
      this.destroyBean(this.eFilterComp);
    }
  }
};
_AdvancedFilterCtrl.EVENT_BUILDER_CLOSED = "advancedFilterBuilderClosed";
__decorateClass([
  (0, import_core12.Autowired)("focusService")
], _AdvancedFilterCtrl.prototype, "focusService", 2);
__decorateClass([
  (0, import_core12.Autowired)("ctrlsService")
], _AdvancedFilterCtrl.prototype, "ctrlsService", 2);
__decorateClass([
  (0, import_core12.Autowired)("popupService")
], _AdvancedFilterCtrl.prototype, "popupService", 2);
__decorateClass([
  (0, import_core12.Autowired)("advancedFilterExpressionService")
], _AdvancedFilterCtrl.prototype, "advancedFilterExpressionService", 2);
__decorateClass([
  import_core12.PostConstruct
], _AdvancedFilterCtrl.prototype, "postConstruct", 1);
var AdvancedFilterCtrl = _AdvancedFilterCtrl;

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterComp.ts
var AdvancedFilterComp = class extends import_core13.Component {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-advanced-filter" role="presentation" tabindex="-1">
                <ag-autocomplete ref="eAutocomplete"></ag-autocomplete>
                <button class="ag-button ag-standard-button ag-advanced-filter-apply-button" ref="eApplyFilterButton"></button>
                <button class="ag-advanced-filter-builder-button" ref="eBuilderFilterButton">
                    <span ref="eBuilderFilterButtonIcon" aria-hidden="true"></span>
                    <span class="ag-advanced-filter-builder-button-label" ref="eBuilderFilterButtonLabel"></span>
                </button>
            </div>`
    );
    this.expressionParser = null;
    this.isApplyDisabled = true;
    this.builderOpen = false;
  }
  postConstruct() {
    this.eAutocomplete.setListGenerator((_value, position) => this.generateAutocompleteListParams(position)).setValidator(() => this.validateValue()).setForceLastSelection((lastSelection, searchString) => this.forceLastSelection(lastSelection, searchString)).setInputAriaLabel(this.advancedFilterExpressionService.translate("ariaAdvancedFilterInput")).setListAriaLabel(this.advancedFilterExpressionService.translate("ariaLabelAdvancedFilterAutocomplete"));
    this.refresh();
    this.addManagedListener(
      this.eAutocomplete,
      import_core13.AgAutocomplete.EVENT_VALUE_CHANGED,
      ({ value }) => this.onValueChanged(value)
    );
    this.addManagedListener(
      this.eAutocomplete,
      import_core13.AgAutocomplete.EVENT_VALUE_CONFIRMED,
      ({ isValid }) => this.onValueConfirmed(isValid)
    );
    this.addManagedListener(
      this.eAutocomplete,
      import_core13.AgAutocomplete.EVENT_OPTION_SELECTED,
      ({ position, updateEntry, autocompleteType }) => this.onOptionSelected(position, updateEntry, autocompleteType)
    );
    this.addManagedListener(
      this.eAutocomplete,
      import_core13.AgAutocomplete.EVENT_VALID_CHANGED,
      ({ isValid, validationMessage }) => this.onValidChanged(isValid, validationMessage)
    );
    this.setupApplyButton();
    this.setupBuilderButton();
  }
  refresh() {
    const expression = this.advancedFilterService.getExpressionDisplayValue();
    this.eAutocomplete.setValue({ value: expression != null ? expression : "", position: expression == null ? void 0 : expression.length, updateListOnlyIfOpen: true });
  }
  setInputDisabled(disabled) {
    this.eAutocomplete.setInputDisabled(disabled);
    import_core13._.setDisabled(this.eApplyFilterButton, disabled || this.isApplyDisabled);
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "advancedFilter";
    return res;
  }
  setupApplyButton() {
    this.eApplyFilterButton.innerText = this.advancedFilterExpressionService.translate("advancedFilterApply");
    this.activateTabIndex([this.eApplyFilterButton]);
    this.addManagedListener(this.eApplyFilterButton, "click", () => this.onValueConfirmed(this.eAutocomplete.isValid()));
    import_core13._.setDisabled(this.eApplyFilterButton, this.isApplyDisabled);
  }
  setupBuilderButton() {
    this.eBuilderFilterButtonIcon.appendChild(import_core13._.createIconNoSpan("advancedFilterBuilder", this.gos));
    this.eBuilderFilterButtonLabel.innerText = this.advancedFilterExpressionService.translate("advancedFilterBuilder");
    this.activateTabIndex([this.eBuilderFilterButton]);
    this.addManagedListener(this.eBuilderFilterButton, "click", () => this.openBuilder());
    this.addManagedListener(this.advancedFilterService.getCtrl(), AdvancedFilterCtrl.EVENT_BUILDER_CLOSED, () => this.closeBuilder());
  }
  onValueChanged(value) {
    var _a;
    value = import_core13._.makeNull(value);
    this.advancedFilterService.setExpressionDisplayValue(value);
    this.expressionParser = this.advancedFilterService.createExpressionParser(value);
    const updatedExpression = (_a = this.expressionParser) == null ? void 0 : _a.parseExpression();
    if (updatedExpression && updatedExpression !== value) {
      this.eAutocomplete.setValue({ value: updatedExpression, silent: true, restoreFocus: true });
    }
  }
  onValueConfirmed(isValid) {
    if (!isValid || this.isApplyDisabled) {
      return;
    }
    import_core13._.setDisabled(this.eApplyFilterButton, true);
    this.advancedFilterService.applyExpression();
    this.filterManager.onFilterChanged({ source: "advancedFilter" });
  }
  onOptionSelected(position, updateEntry, type) {
    const { updatedValue, updatedPosition, hideAutocomplete } = this.updateExpression(position, updateEntry, type);
    this.eAutocomplete.setValue({
      value: updatedValue,
      position: updatedPosition,
      updateListOnlyIfOpen: hideAutocomplete,
      restoreFocus: true
    });
  }
  validateValue() {
    var _a, _b, _c;
    return ((_a = this.expressionParser) == null ? void 0 : _a.isValid()) ? null : (_c = (_b = this.expressionParser) == null ? void 0 : _b.getValidationMessage()) != null ? _c : null;
  }
  onValidChanged(isValid, validationMessage) {
    this.isApplyDisabled = !isValid || this.advancedFilterService.isCurrentExpressionApplied();
    import_core13._.setDisabled(this.eApplyFilterButton, this.isApplyDisabled);
    this.setTooltip({
      newTooltipText: validationMessage,
      showDelayOverride: 1e3
    });
  }
  generateAutocompleteListParams(position) {
    return this.expressionParser ? this.expressionParser.getAutocompleteListParams(position) : this.advancedFilterExpressionService.getDefaultAutocompleteListParams("");
  }
  updateExpression(position, updateEntry, type) {
    var _a, _b;
    this.advancedFilterExpressionService.updateAutocompleteCache(updateEntry, type);
    return (_b = (_a = this.expressionParser) == null ? void 0 : _a.updateExpression(position, updateEntry, type)) != null ? _b : this.advancedFilterService.getDefaultExpression(updateEntry);
  }
  forceLastSelection({ key, displayValue }, searchString) {
    return !!searchString.toLocaleLowerCase().match(`^${(displayValue != null ? displayValue : key).toLocaleLowerCase()}\\s*$`);
  }
  openBuilder() {
    if (this.builderOpen) {
      return;
    }
    this.builderOpen = true;
    import_core13._.setDisabled(this.eBuilderFilterButton, true);
    this.advancedFilterService.getCtrl().toggleFilterBuilder("ui");
  }
  closeBuilder() {
    if (!this.builderOpen) {
      return;
    }
    this.builderOpen = false;
    import_core13._.setDisabled(this.eBuilderFilterButton, false);
    this.eBuilderFilterButton.focus();
  }
};
__decorateClass([
  (0, import_core13.RefSelector)("eAutocomplete")
], AdvancedFilterComp.prototype, "eAutocomplete", 2);
__decorateClass([
  (0, import_core13.RefSelector)("eApplyFilterButton")
], AdvancedFilterComp.prototype, "eApplyFilterButton", 2);
__decorateClass([
  (0, import_core13.RefSelector)("eBuilderFilterButton")
], AdvancedFilterComp.prototype, "eBuilderFilterButton", 2);
__decorateClass([
  (0, import_core13.RefSelector)("eBuilderFilterButtonIcon")
], AdvancedFilterComp.prototype, "eBuilderFilterButtonIcon", 2);
__decorateClass([
  (0, import_core13.RefSelector)("eBuilderFilterButtonLabel")
], AdvancedFilterComp.prototype, "eBuilderFilterButtonLabel", 2);
__decorateClass([
  (0, import_core13.Autowired)("advancedFilterService")
], AdvancedFilterComp.prototype, "advancedFilterService", 2);
__decorateClass([
  (0, import_core13.Autowired)("advancedFilterExpressionService")
], AdvancedFilterComp.prototype, "advancedFilterExpressionService", 2);
__decorateClass([
  (0, import_core13.Autowired)("filterManager")
], AdvancedFilterComp.prototype, "filterManager", 2);
__decorateClass([
  import_core13.PostConstruct
], AdvancedFilterComp.prototype, "postConstruct", 1);

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterExpressionService.ts
var import_core14 = require("@ag-grid-community/core");

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterLocaleText.ts
var ADVANCED_FILTER_LOCALE_TEXT = {
  ariaAdvancedFilterBuilderItem: (variableValues) => `${variableValues[0]}. Level ${variableValues[1]}. Press ENTER to edit.`,
  ariaAdvancedFilterBuilderItemValidation: (variableValues) => `${variableValues[0]}. Level ${variableValues[1]}. ${variableValues[2]} Press ENTER to edit.`,
  ariaAdvancedFilterBuilderList: "Advanced Filter Builder List",
  ariaAdvancedFilterBuilderFilterItem: "Filter Condition",
  ariaAdvancedFilterBuilderGroupItem: "Filter Group",
  ariaAdvancedFilterBuilderColumn: "Column",
  ariaAdvancedFilterBuilderOption: "Option",
  ariaAdvancedFilterBuilderValue: "Value",
  ariaAdvancedFilterBuilderJoinOperator: "Join Operator",
  ariaAdvancedFilterInput: "Advanced Filter Input",
  ariaLabelAdvancedFilterAutocomplete: "Advanced Filter Autocomplete",
  advancedFilterContains: "contains",
  advancedFilterNotContains: "does not contain",
  advancedFilterTextEquals: "equals",
  advancedFilterTextNotEqual: "does not equal",
  advancedFilterStartsWith: "begins with",
  advancedFilterEndsWith: "ends with",
  advancedFilterBlank: "is blank",
  advancedFilterNotBlank: "is not blank",
  advancedFilterEquals: "=",
  advancedFilterNotEqual: "!=",
  advancedFilterGreaterThan: ">",
  advancedFilterGreaterThanOrEqual: ">=",
  advancedFilterLessThan: "<",
  advancedFilterLessThanOrEqual: "<=",
  advancedFilterTrue: "is true",
  advancedFilterFalse: "is false",
  advancedFilterAnd: "AND",
  advancedFilterOr: "OR",
  advancedFilterApply: "Apply",
  advancedFilterBuilder: "Builder",
  advancedFilterValidationMissingColumn: "Column is missing",
  advancedFilterValidationMissingOption: "Option is missing",
  advancedFilterValidationMissingValue: "Value is missing",
  advancedFilterValidationInvalidColumn: "Column not found",
  advancedFilterValidationInvalidOption: "Option not found",
  advancedFilterValidationMissingQuote: "Value is missing an end quote",
  advancedFilterValidationNotANumber: "Value is not a number",
  advancedFilterValidationInvalidDate: "Value is not a valid date",
  advancedFilterValidationMissingCondition: "Condition is missing",
  advancedFilterValidationJoinOperatorMismatch: "Join operators within a condition must be the same",
  advancedFilterValidationInvalidJoinOperator: "Join operator not found",
  advancedFilterValidationMissingEndBracket: "Missing end bracket",
  advancedFilterValidationExtraEndBracket: "Too many end brackets",
  advancedFilterValidationMessage: (variableValues) => `Expression has an error. ${variableValues[0]} - ${variableValues[1]}.`,
  advancedFilterValidationMessageAtEnd: (variableValues) => `Expression has an error. ${variableValues[0]} at end of expression.`,
  advancedFilterBuilderTitle: "Advanced Filter",
  advancedFilterBuilderApply: "Apply",
  advancedFilterBuilderCancel: "Cancel",
  advancedFilterBuilderAddButtonTooltip: "Add Filter or Group",
  advancedFilterBuilderRemoveButtonTooltip: "Remove",
  advancedFilterBuilderMoveUpButtonTooltip: "Move Up",
  advancedFilterBuilderMoveDownButtonTooltip: "Move Down",
  advancedFilterBuilderAddJoin: "Add Group",
  advancedFilterBuilderAddCondition: "Add Filter",
  advancedFilterBuilderSelectColumn: "Select a column",
  advancedFilterBuilderSelectOption: "Select an option",
  advancedFilterBuilderEnterValue: "Enter a value...",
  advancedFilterBuilderValidationAlreadyApplied: "Current filter already applied.",
  advancedFilterBuilderValidationIncomplete: "Not all conditions are complete.",
  advancedFilterBuilderValidationSelectColumn: "Must select a column.",
  advancedFilterBuilderValidationSelectOption: "Must select an option.",
  advancedFilterBuilderValidationEnterValue: "Must enter a value."
};

// enterprise-modules/advanced-filter/src/advancedFilter/filterExpressionUtils.ts
function getSearchString(value, position, endPosition) {
  if (!value) {
    return "";
  }
  const numChars = endPosition - position;
  return numChars ? value.slice(0, value.length - numChars) : value;
}
function updateExpression(expression, startPosition, endPosition, updatedValuePart, appendSpace, appendQuote, empty) {
  const secondPartStartPosition = endPosition + (!expression.length || empty ? 0 : 1);
  let positionOffset = 0;
  if (appendSpace) {
    if (expression[secondPartStartPosition] === " ") {
      positionOffset = 1;
    } else {
      updatedValuePart += " ";
      if (appendQuote) {
        updatedValuePart += `"`;
      }
    }
  }
  const updatedValue = expression.slice(0, startPosition) + updatedValuePart + expression.slice(secondPartStartPosition);
  return { updatedValue, updatedPosition: startPosition + updatedValuePart.length + positionOffset };
}
function findStartPosition(expression, position, endPosition) {
  let startPosition = position;
  while (startPosition < endPosition) {
    const char = expression[startPosition];
    if (char !== " ") {
      break;
    }
    startPosition++;
  }
  return startPosition;
}
function findEndPosition(expression, position, includeCloseBracket, isStartPositionUnknown) {
  let endPosition = position;
  let isEmpty = false;
  while (endPosition < expression.length) {
    const char = expression[endPosition];
    if (char === "(") {
      if (isStartPositionUnknown && expression[endPosition - 1] === " ") {
        isEmpty = true;
      } else {
        endPosition = endPosition - 1;
      }
      break;
    } else if (char === " " || includeCloseBracket && char === ")") {
      endPosition = endPosition - 1;
      break;
    }
    endPosition++;
  }
  return { endPosition, isEmpty };
}
function checkAndUpdateExpression(params, userValue, displayValue, endPosition) {
  if (displayValue !== userValue) {
    params.expression = updateExpression(
      params.expression,
      endPosition - userValue.length + 1,
      endPosition,
      displayValue
    ).updatedValue;
  }
}
function escapeQuotes(value) {
  return value.replace(/(['"])/, "\\$1");
}

// enterprise-modules/advanced-filter/src/advancedFilter/colFilterExpressionParser.ts
var ColumnParser = class {
  constructor(params, startPosition) {
    this.params = params;
    this.startPosition = startPosition;
    this.type = "column";
    this.valid = true;
    this.hasStartChar = false;
    this.hasEndChar = false;
    this.colName = "";
  }
  parse(char, position) {
    if (char === ColFilterExpressionParser.COL_START_CHAR && !this.colName) {
      this.hasStartChar = true;
    } else if (char === ColFilterExpressionParser.COL_END_CHAR && this.hasStartChar) {
      const isMatch = this.parseColumn(false, position);
      if (isMatch) {
        this.hasEndChar = true;
        return false;
      } else {
        this.colName += char;
      }
    } else {
      this.colName += char;
    }
    return void 0;
  }
  getDisplayValue() {
    return (this.hasStartChar ? ColFilterExpressionParser.COL_START_CHAR : "") + this.colName + (this.hasEndChar ? ColFilterExpressionParser.COL_END_CHAR : "");
  }
  getColId() {
    return this.colId;
  }
  complete(position) {
    this.parseColumn(true, position);
  }
  getValidationError() {
    var _a;
    return this.valid ? null : {
      message: this.params.advancedFilterExpressionService.translate("advancedFilterValidationInvalidColumn"),
      startPosition: this.startPosition,
      endPosition: (_a = this.endPosition) != null ? _a : this.params.expression.length - 1
    };
  }
  parseColumn(fromComplete, endPosition) {
    var _a;
    this.endPosition = endPosition;
    const colValue = this.params.advancedFilterExpressionService.getColId(this.colName);
    if (colValue && this.hasStartChar) {
      this.colId = colValue.colId;
      checkAndUpdateExpression(this.params, this.colName, colValue.columnName, endPosition - 1);
      this.colName = colValue.columnName;
      this.column = this.params.columnModel.getPrimaryColumn(this.colId);
      if (this.column) {
        this.baseCellDataType = (_a = this.params.dataTypeService.getBaseDataType(this.column)) != null ? _a : "text";
        return true;
      }
    }
    if (fromComplete) {
      this.valid = false;
    }
    this.baseCellDataType = "text";
    return false;
  }
};
var OperatorParser = class {
  constructor(params, startPosition, baseCellDataType) {
    this.params = params;
    this.startPosition = startPosition;
    this.baseCellDataType = baseCellDataType;
    this.type = "operator";
    this.valid = true;
    this.expectedNumOperands = 0;
    this.operator = "";
  }
  parse(char, position) {
    if (char === " " || char === ")") {
      const isMatch = this.parseOperator(false, position - 1);
      if (isMatch) {
        return true;
      } else {
        this.operator += char;
      }
    } else {
      this.operator += char;
    }
    return void 0;
  }
  complete(position) {
    this.parseOperator(true, position);
  }
  getValidationError() {
    var _a;
    return this.valid ? null : {
      message: this.params.advancedFilterExpressionService.translate("advancedFilterValidationInvalidOption"),
      startPosition: this.startPosition,
      endPosition: (_a = this.endPosition) != null ? _a : this.params.expression.length - 1
    };
  }
  getDisplayValue() {
    return this.operator;
  }
  getOperatorKey() {
    return this.parsedOperator;
  }
  parseOperator(fromComplete, endPosition) {
    const operatorForType = this.params.advancedFilterExpressionService.getDataTypeExpressionOperator(this.baseCellDataType);
    const parsedOperator = operatorForType.findOperator(this.operator);
    this.endPosition = endPosition;
    if (parsedOperator) {
      this.parsedOperator = parsedOperator;
      const operator = operatorForType.operators[parsedOperator];
      this.expectedNumOperands = operator.numOperands;
      const operatorDisplayValue = operator.displayValue;
      checkAndUpdateExpression(this.params, this.operator, operatorDisplayValue, endPosition);
      this.operator = operatorDisplayValue;
      return true;
    }
    const isPartialMatch = parsedOperator === null;
    if (fromComplete || !isPartialMatch) {
      this.valid = false;
    }
    return false;
  }
};
var OperandParser = class {
  constructor(params, startPosition, baseCellDataType, column) {
    this.params = params;
    this.startPosition = startPosition;
    this.baseCellDataType = baseCellDataType;
    this.column = column;
    this.type = "operand";
    this.valid = true;
    this.operand = "";
    this.validationMessage = null;
  }
  parse(char, position) {
    if (char === " ") {
      if (this.quotes) {
        this.operand += char;
      } else {
        this.parseOperand(false, position);
        return true;
      }
    } else if (char === ")") {
      if (this.baseCellDataType === "number" || !this.quotes) {
        this.parseOperand(false, position - 1);
        return true;
      } else {
        this.operand += char;
      }
    } else if (!this.operand && !this.quotes && (char === `'` || char === `"`)) {
      this.quotes = char;
    } else if (this.quotes && char === this.quotes) {
      this.parseOperand(false, position);
      return false;
    } else {
      this.operand += char;
    }
    return void 0;
  }
  complete(position) {
    this.parseOperand(true, position);
  }
  getValidationError() {
    var _a;
    return this.validationMessage ? {
      message: this.validationMessage,
      startPosition: this.startPosition,
      endPosition: (_a = this.endPosition) != null ? _a : this.params.expression.length - 1
    } : null;
  }
  getRawValue() {
    return this.operand;
  }
  getModelValue() {
    return this.modelValue;
  }
  parseOperand(fromComplete, position) {
    const { advancedFilterExpressionService } = this.params;
    this.endPosition = position;
    this.modelValue = this.operand;
    if (fromComplete && this.quotes) {
      this.valid = false;
      this.validationMessage = advancedFilterExpressionService.translate("advancedFilterValidationMissingQuote");
    } else if (this.modelValue === "") {
      this.valid = false;
      this.validationMessage = advancedFilterExpressionService.translate("advancedFilterValidationMissingValue");
    } else {
      const modelValue = advancedFilterExpressionService.getOperandModelValue(this.operand, this.baseCellDataType, this.column);
      if (modelValue != null) {
        this.modelValue = modelValue;
      }
      switch (this.baseCellDataType) {
        case "number":
          if (this.quotes || isNaN(this.modelValue)) {
            this.valid = false;
            this.validationMessage = advancedFilterExpressionService.translate("advancedFilterValidationNotANumber");
          }
          break;
        case "date":
        case "dateString":
          if (modelValue == null) {
            this.valid = false;
            this.validationMessage = advancedFilterExpressionService.translate("advancedFilterValidationInvalidDate");
          }
          break;
      }
    }
  }
};
var ColFilterExpressionParser = class {
  constructor(params, startPosition) {
    this.params = params;
    this.startPosition = startPosition;
    this.isAwaiting = true;
  }
  parseExpression() {
    var _a, _b;
    let i = this.startPosition;
    const { expression } = this.params;
    while (i < expression.length) {
      const char = expression[i];
      if (char === " " && this.isAwaiting) {
      } else {
        this.isAwaiting = false;
        if (!this.parser) {
          let parser;
          if (!this.columnParser) {
            this.columnParser = new ColumnParser(this.params, i);
            parser = this.columnParser;
          } else if (!this.operatorParser) {
            this.operatorParser = new OperatorParser(this.params, i, this.columnParser.baseCellDataType);
            parser = this.operatorParser;
          } else {
            this.operandParser = new OperandParser(this.params, i, this.columnParser.baseCellDataType, this.columnParser.column);
            parser = this.operandParser;
          }
          this.parser = parser;
        }
        const hasCompletedOnPrevChar = this.parser.parse(char, i);
        if (hasCompletedOnPrevChar != null) {
          if (this.isComplete()) {
            return this.returnEndPosition(hasCompletedOnPrevChar ? i - 1 : i, true);
          }
          this.parser = void 0;
          this.isAwaiting = true;
        }
      }
      i++;
    }
    (_b = (_a = this.parser) == null ? void 0 : _a.complete) == null ? void 0 : _b.call(_a, i - 1);
    return this.returnEndPosition(i);
  }
  isValid() {
    return this.isComplete() && this.columnParser.valid && this.operatorParser.valid && (!this.operandParser || this.operandParser.valid);
  }
  getValidationError() {
    var _a, _b, _c, _d, _e;
    const validationError = (_e = (_c = (_a = this.columnParser) == null ? void 0 : _a.getValidationError()) != null ? _c : (_b = this.operatorParser) == null ? void 0 : _b.getValidationError()) != null ? _e : (_d = this.operandParser) == null ? void 0 : _d.getValidationError();
    if (validationError) {
      return validationError;
    }
    const endPosition = this.params.expression.length;
    let translateKey;
    if (!this.columnParser) {
      translateKey = "advancedFilterValidationMissingColumn";
    } else if (!this.operatorParser) {
      translateKey = "advancedFilterValidationMissingOption";
    } else if (this.operatorParser.expectedNumOperands && !this.operandParser) {
      translateKey = "advancedFilterValidationMissingValue";
    }
    if (translateKey) {
      return {
        message: this.params.advancedFilterExpressionService.translate(translateKey),
        startPosition: endPosition,
        endPosition
      };
    }
    return null;
  }
  getFunctionString(params) {
    return this.getFunctionCommon(params, (operandIndex, operatorIndex, colId, evaluatorParamsIndex) => {
      const escapedColId = escapeQuotes(colId);
      const operand = operandIndex == null ? "" : `, params.operands[${operandIndex}]`;
      return `params.operators[${operatorIndex}].evaluator(expressionProxy.getValue('${escapedColId}', node), node, params.evaluatorParams[${evaluatorParamsIndex}]${operand})`;
    });
  }
  getFunctionParsed(params) {
    return this.getFunctionCommon(params, (operandIndex, operatorIndex, colId, evaluatorParamsIndex) => {
      return (expressionProxy, node, p) => p.operators[operatorIndex].evaluator(
        expressionProxy.getValue(colId, node),
        node,
        p.evaluatorParams[evaluatorParamsIndex],
        operandIndex == null ? void 0 : p.operands[operandIndex]
      );
    });
  }
  getAutocompleteListParams(position) {
    if (this.isColumnPosition(position)) {
      return this.getColumnAutocompleteListParams(position);
    }
    if (this.isOperatorPosition(position)) {
      return this.getOperatorAutocompleteListParams(position);
    }
    if (this.isBeyondEndPosition(position)) {
      return void 0;
    }
    return { enabled: false };
  }
  updateExpression(position, updateEntry, type) {
    var _a, _b, _c, _d, _e;
    const { expression } = this.params;
    if (this.isColumnPosition(position)) {
      return updateExpression(
        this.params.expression,
        this.startPosition,
        ((_a = this.columnParser) == null ? void 0 : _a.getColId()) ? this.columnParser.endPosition : findEndPosition(expression, position).endPosition,
        this.params.advancedFilterExpressionService.getColumnValue(updateEntry),
        true
      );
    } else if (this.isOperatorPosition(position)) {
      const baseCellDataType = this.getBaseCellDataTypeFromOperatorAutocompleteType(type);
      const hasOperand = this.hasOperand(baseCellDataType, updateEntry.key);
      const doesOperandNeedQuotes = hasOperand && this.doesOperandNeedQuotes(baseCellDataType);
      let update;
      if (((_b = this.operatorParser) == null ? void 0 : _b.startPosition) != null && position < this.operatorParser.startPosition) {
        update = updateExpression(
          expression,
          position,
          position,
          (_c = updateEntry.displayValue) != null ? _c : updateEntry.key,
          hasOperand,
          doesOperandNeedQuotes
        );
      } else {
        let endPosition;
        let empty = false;
        if ((_d = this.operatorParser) == null ? void 0 : _d.getOperatorKey()) {
          endPosition = this.operatorParser.endPosition;
        } else {
          const { endPosition: calculatedEndPosition, isEmpty } = findEndPosition(expression, position, true, true);
          endPosition = calculatedEndPosition;
          empty = isEmpty;
        }
        update = updateExpression(
          expression,
          findStartPosition(expression, this.columnParser.endPosition + 1, endPosition),
          endPosition,
          (_e = updateEntry.displayValue) != null ? _e : updateEntry.key,
          hasOperand,
          doesOperandNeedQuotes,
          empty
        );
      }
      return __spreadProps(__spreadValues({}, update), { hideAutocomplete: !hasOperand });
    }
    return null;
  }
  getModel() {
    const colId = this.columnParser.getColId();
    const model = {
      filterType: this.columnParser.baseCellDataType,
      colId,
      type: this.operatorParser.getOperatorKey()
    };
    if (this.operatorParser.expectedNumOperands) {
      model.filter = this.operandParser.getModelValue();
    }
    return model;
  }
  getFunctionCommon(params, processFunc) {
    var _a, _b;
    const colId = this.columnParser.getColId();
    const operator = (_a = this.operatorParser) == null ? void 0 : _a.getOperatorKey();
    const { operators, evaluatorParams, operands } = params;
    const operatorForColumn = this.params.advancedFilterExpressionService.getExpressionOperator(this.columnParser.baseCellDataType, operator);
    const operatorIndex = this.addToListAndGetIndex(operators, operatorForColumn);
    const evaluatorParamsForColumn = this.params.advancedFilterExpressionService.getExpressionEvaluatorParams(colId);
    const evaluatorParamsIndex = this.addToListAndGetIndex(evaluatorParams, evaluatorParamsForColumn);
    const operandIndex = ((_b = this.operatorParser) == null ? void 0 : _b.expectedNumOperands) === 0 ? void 0 : this.addToListAndGetIndex(operands, this.getOperandValue());
    return processFunc(operandIndex, operatorIndex, colId, evaluatorParamsIndex);
  }
  getOperandValue() {
    let operand = this.operandParser.getRawValue();
    const { baseCellDataType, column } = this.columnParser;
    switch (baseCellDataType) {
      case "number":
        operand = Number(operand);
        break;
      case "date":
      case "dateString":
        operand = this.params.valueService.parseValue(column, null, operand, void 0);
        break;
    }
    if (baseCellDataType === "dateString") {
      return this.params.dataTypeService.getDateParserFunction(column)(operand);
    }
    return operand;
  }
  isComplete() {
    return !!(this.operatorParser && (!this.operatorParser.expectedNumOperands || this.operatorParser.expectedNumOperands && this.operandParser));
  }
  isColumnPosition(position) {
    return !this.columnParser || this.columnParser.endPosition == null || position <= this.columnParser.endPosition + 1;
  }
  isOperatorPosition(position) {
    return !this.operatorParser || this.operatorParser.endPosition == null || position <= this.operatorParser.endPosition + 1;
  }
  isBeyondEndPosition(position) {
    return this.isComplete() && this.endPosition != null && position > this.endPosition + 1 && this.endPosition + 1 < this.params.expression.length;
  }
  returnEndPosition(returnPosition, treatAsEnd) {
    this.endPosition = treatAsEnd ? returnPosition : returnPosition - 1;
    return returnPosition;
  }
  getColumnAutocompleteListParams(position) {
    return this.params.advancedFilterExpressionService.generateAutocompleteListParams(
      this.params.advancedFilterExpressionService.getColumnAutocompleteEntries(),
      "column",
      this.getColumnSearchString(position)
    );
  }
  getColumnSearchString(position) {
    var _a, _b, _c, _d, _e;
    const columnName = (_b = (_a = this.columnParser) == null ? void 0 : _a.getDisplayValue()) != null ? _b : "";
    const searchString = getSearchString(
      columnName,
      position,
      ((_c = this.columnParser) == null ? void 0 : _c.endPosition) == null ? this.params.expression.length : this.columnParser.endPosition + 1
    );
    const containsStartChar = ((_d = this.columnParser) == null ? void 0 : _d.hasStartChar) && searchString.length > 0;
    const containsEndChar = ((_e = this.columnParser) == null ? void 0 : _e.hasEndChar) && searchString.length === columnName.length + 2;
    if (containsStartChar) {
      return searchString.slice(1, containsEndChar ? -1 : void 0);
    }
    return searchString;
  }
  getOperatorAutocompleteListParams(position) {
    var _a, _b, _c, _d, _e;
    const column = (_a = this.columnParser) == null ? void 0 : _a.column;
    if (!column) {
      return { enabled: false };
    }
    const baseCellDataType = this.columnParser.baseCellDataType;
    const searchString = ((_b = this.operatorParser) == null ? void 0 : _b.startPosition) != null && position < this.operatorParser.startPosition ? "" : getSearchString(
      (_d = (_c = this.operatorParser) == null ? void 0 : _c.getDisplayValue()) != null ? _d : "",
      position,
      ((_e = this.operatorParser) == null ? void 0 : _e.endPosition) == null ? this.params.expression.length : this.operatorParser.endPosition + 1
    );
    return this.params.advancedFilterExpressionService.generateAutocompleteListParams(
      this.params.advancedFilterExpressionService.getOperatorAutocompleteEntries(column, baseCellDataType),
      `operator-${baseCellDataType}`,
      searchString
    );
  }
  getBaseCellDataTypeFromOperatorAutocompleteType(type) {
    return type == null ? void 0 : type.replace("operator-", "");
  }
  hasOperand(baseCellDataType, operator) {
    var _a, _b;
    return !baseCellDataType || !operator || ((_b = (_a = this.params.advancedFilterExpressionService.getExpressionOperator(baseCellDataType, operator)) == null ? void 0 : _a.numOperands) != null ? _b : 0) > 0;
  }
  doesOperandNeedQuotes(baseCellDataType) {
    return baseCellDataType !== "number";
  }
  addToListAndGetIndex(list, value) {
    const index = list.length;
    list.push(value);
    return index;
  }
};
ColFilterExpressionParser.COL_START_CHAR = "[";
ColFilterExpressionParser.COL_END_CHAR = "]";

// enterprise-modules/advanced-filter/src/advancedFilter/filterExpressionOperators.ts
function findMatch(searchValue, values, getDisplayValue) {
  let partialMatch = false;
  const searchValueLowerCase = searchValue.toLocaleLowerCase();
  const partialSearchValue = searchValueLowerCase + " ";
  const parsedValue = Object.entries(values).find(([_key, value]) => {
    const displayValueLowerCase = getDisplayValue(value).toLocaleLowerCase();
    if (displayValueLowerCase.startsWith(partialSearchValue)) {
      partialMatch = true;
    }
    return displayValueLowerCase === searchValueLowerCase;
  });
  if (parsedValue) {
    return parsedValue[0];
  } else if (partialMatch) {
    return null;
  } else {
    return void 0;
  }
}
function getEntries(operators, activeOperatorKeys) {
  const keys = activeOperatorKeys != null ? activeOperatorKeys : Object.keys(operators);
  return keys.map((key) => ({
    key,
    displayValue: operators[key].displayValue
  }));
}
var TextFilterExpressionOperators = class {
  constructor(params) {
    this.params = params;
    this.initOperators();
  }
  getEntries(activeOperators) {
    return getEntries(this.operators, activeOperators);
  }
  findOperator(displayValue) {
    return findMatch(displayValue, this.operators, ({ displayValue: displayValue2 }) => displayValue2);
  }
  initOperators() {
    const { translate } = this.params;
    this.operators = {
      contains: {
        displayValue: translate("advancedFilterContains"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, false, (v, o) => v.includes(o)),
        numOperands: 1
      },
      notContains: {
        displayValue: translate("advancedFilterNotContains"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, true, (v, o) => !v.includes(o)),
        numOperands: 1
      },
      equals: {
        displayValue: translate("advancedFilterTextEquals"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, false, (v, o) => v === o),
        numOperands: 1
      },
      notEqual: {
        displayValue: translate("advancedFilterTextNotEqual"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, true, (v, o) => v != o),
        numOperands: 1
      },
      startsWith: {
        displayValue: translate("advancedFilterStartsWith"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, false, (v, o) => v.startsWith(o)),
        numOperands: 1
      },
      endsWith: {
        displayValue: translate("advancedFilterEndsWith"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, false, (v, o) => v.endsWith(o)),
        numOperands: 1
      },
      blank: {
        displayValue: translate("advancedFilterBlank"),
        evaluator: (value) => value == null || typeof value === "string" && value.trim().length === 0,
        numOperands: 0
      },
      notBlank: {
        displayValue: translate("advancedFilterNotBlank"),
        evaluator: (value) => value != null && (typeof value !== "string" || value.trim().length > 0),
        numOperands: 0
      }
    };
  }
  evaluateExpression(value, node, params, operand, nullsMatch, expression) {
    if (value == null) {
      return nullsMatch;
    }
    return params.caseSensitive ? expression(params.valueConverter(value, node), operand) : expression(params.valueConverter(value, node).toLocaleLowerCase(), operand.toLocaleLowerCase());
  }
};
var ScalarFilterExpressionOperators = class {
  constructor(params) {
    this.params = params;
    this.initOperators();
  }
  getEntries(activeOperators) {
    return getEntries(this.operators, activeOperators);
  }
  findOperator(displayValue) {
    return findMatch(displayValue, this.operators, ({ displayValue: displayValue2 }) => displayValue2);
  }
  initOperators() {
    const { translate, equals } = this.params;
    this.operators = {
      equals: {
        displayValue: translate("advancedFilterEquals"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(value, node, params, operand1, !!params.includeBlanksInEquals, equals),
        numOperands: 1
      },
      notEqual: {
        displayValue: translate("advancedFilterNotEqual"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(value, node, params, operand1, !!params.includeBlanksInEquals, (v, o) => !equals(v, o)),
        numOperands: 1
      },
      greaterThan: {
        displayValue: translate("advancedFilterGreaterThan"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(value, node, params, operand1, !!params.includeBlanksInGreaterThan, (v, o) => v > o),
        numOperands: 1
      },
      greaterThanOrEqual: {
        displayValue: translate("advancedFilterGreaterThanOrEqual"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(value, node, params, operand1, !!params.includeBlanksInGreaterThan, (v, o) => v >= o),
        numOperands: 1
      },
      lessThan: {
        displayValue: translate("advancedFilterLessThan"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(value, node, params, operand1, !!params.includeBlanksInLessThan, (v, o) => v < o),
        numOperands: 1
      },
      lessThanOrEqual: {
        displayValue: translate("advancedFilterLessThanOrEqual"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(value, node, params, operand1, !!params.includeBlanksInLessThan, (v, o) => v <= o),
        numOperands: 1
      },
      blank: {
        displayValue: translate("advancedFilterBlank"),
        evaluator: (value) => value == null,
        numOperands: 0
      },
      notBlank: {
        displayValue: translate("advancedFilterNotBlank"),
        evaluator: (value) => value != null,
        numOperands: 0
      }
    };
  }
  evaluateSingleOperandExpression(value, node, params, operand, nullsMatch, expression) {
    if (value == null) {
      return nullsMatch;
    }
    return expression(params.valueConverter(value, node), operand);
  }
};
var BooleanFilterExpressionOperators = class {
  constructor(params) {
    this.params = params;
    this.initOperators();
  }
  getEntries(activeOperators) {
    return getEntries(this.operators, activeOperators);
  }
  findOperator(displayValue) {
    return findMatch(displayValue, this.operators, ({ displayValue: displayValue2 }) => displayValue2);
  }
  initOperators() {
    const { translate } = this.params;
    this.operators = {
      true: {
        displayValue: translate("advancedFilterTrue"),
        evaluator: (value) => !!value,
        numOperands: 0
      },
      false: {
        displayValue: translate("advancedFilterFalse"),
        evaluator: (value) => value === false,
        numOperands: 0
      },
      blank: {
        displayValue: translate("advancedFilterBlank"),
        evaluator: (value) => value == null,
        numOperands: 0
      },
      notBlank: {
        displayValue: translate("advancedFilterNotBlank"),
        evaluator: (value) => value != null,
        numOperands: 0
      }
    };
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterExpressionService.ts
var AdvancedFilterExpressionService = class extends import_core14.BeanStub {
  constructor() {
    super(...arguments);
    this.columnNameToIdMap = {};
    this.columnAutocompleteEntries = null;
    this.expressionEvaluatorParams = {};
  }
  postConstruct() {
    this.expressionJoinOperators = this.generateExpressionJoinOperators();
    this.expressionOperators = this.generateExpressionOperators();
  }
  parseJoinOperator(model) {
    var _a;
    const { type } = model;
    return (_a = this.expressionJoinOperators[type]) != null ? _a : type;
  }
  getColumnDisplayValue(model) {
    const { colId } = model;
    const columnEntries = this.getColumnAutocompleteEntries();
    const columnEntry = columnEntries.find(({ key }) => key === colId);
    let columnName;
    if (columnEntry) {
      columnName = columnEntry.displayValue;
      this.columnNameToIdMap[columnName.toLocaleUpperCase()] = { colId, columnName };
    } else {
      columnName = colId;
    }
    return columnName;
  }
  getOperatorDisplayValue(model) {
    var _a, _b;
    return (_b = (_a = this.getExpressionOperator(model.filterType, model.type)) == null ? void 0 : _a.displayValue) != null ? _b : model.type;
  }
  getOperandModelValue(operand, baseCellDataType, column) {
    var _a;
    switch (baseCellDataType) {
      case "number":
        return import_core14._.exists(operand) ? Number(operand) : null;
      case "date":
        return import_core14._.serialiseDate(this.valueService.parseValue(column, null, operand, void 0), false);
      case "dateString":
        const parsedDateString = this.valueService.parseValue(column, null, operand, void 0);
        return import_core14._.serialiseDate((_a = this.dataTypeService.getDateParserFunction(column)(parsedDateString)) != null ? _a : null, false);
    }
    return operand;
  }
  getOperandDisplayValue(model, skipFormatting) {
    var _a, _b;
    const { colId, filter } = model;
    const column = this.columnModel.getPrimaryColumn(colId);
    let operand = "";
    if (filter != null) {
      let operand1;
      switch (model.filterType) {
        case "number":
          operand1 = (_a = import_core14._.toStringOrNull(filter)) != null ? _a : "";
          break;
        case "date":
          const dateValue = import_core14._.parseDateTimeFromString(filter);
          operand1 = column ? this.valueService.formatValue(column, null, dateValue) : null;
          break;
        case "dateString":
          const dateStringDateValue = import_core14._.parseDateTimeFromString(filter);
          const dateStringStringValue = column ? this.dataTypeService.getDateFormatterFunction(column)(dateStringDateValue != null ? dateStringDateValue : void 0) : null;
          operand1 = column ? this.valueService.formatValue(column, null, dateStringStringValue) : null;
          break;
      }
      if (model.filterType !== "number") {
        operand1 = (_b = operand1 != null ? operand1 : import_core14._.toStringOrNull(filter)) != null ? _b : "";
        if (!skipFormatting) {
          operand1 = `"${operand1}"`;
        }
      }
      operand = skipFormatting ? operand1 : ` ${operand1}`;
    }
    return operand;
  }
  parseColumnFilterModel(model) {
    var _a, _b;
    const columnName = (_a = this.getColumnDisplayValue(model)) != null ? _a : "";
    const operator = (_b = this.getOperatorDisplayValue(model)) != null ? _b : "";
    const operands = this.getOperandDisplayValue(model);
    return `[${columnName}] ${operator}${operands}`;
  }
  updateAutocompleteCache(updateEntry, type) {
    if (type === "column") {
      const { key: colId, displayValue } = updateEntry;
      this.columnNameToIdMap[updateEntry.displayValue.toLocaleUpperCase()] = { colId, columnName: displayValue };
    }
  }
  translate(key, variableValues) {
    let defaultValue = ADVANCED_FILTER_LOCALE_TEXT[key];
    if (typeof defaultValue === "function") {
      defaultValue = defaultValue(variableValues);
    }
    return this.localeService.getLocaleTextFunc()(key, defaultValue, variableValues);
  }
  generateAutocompleteListParams(entries, type, searchString) {
    return {
      enabled: true,
      type,
      searchString,
      entries
    };
  }
  getColumnAutocompleteEntries() {
    var _a;
    if (this.columnAutocompleteEntries) {
      return this.columnAutocompleteEntries;
    }
    const columns = (_a = this.columnModel.getAllPrimaryColumns()) != null ? _a : [];
    const entries = [];
    const includeHiddenColumns = this.gos.get("includeHiddenColumnsInAdvancedFilter");
    columns.forEach((column) => {
      if (column.getColDef().filter && (includeHiddenColumns || column.isVisible() || column.isRowGroupActive())) {
        entries.push({
          key: column.getColId(),
          displayValue: this.columnModel.getDisplayNameForColumn(column, "advancedFilter")
        });
      }
    });
    entries.sort((a, b) => {
      var _a2, _b;
      const aValue = (_a2 = a.displayValue) != null ? _a2 : "";
      const bValue = (_b = b.displayValue) != null ? _b : "";
      if (aValue < bValue) {
        return -1;
      } else if (bValue > aValue) {
        return 1;
      }
      return 0;
    });
    return entries;
  }
  getOperatorAutocompleteEntries(column, baseCellDataType) {
    const activeOperators = this.getActiveOperators(column);
    return this.getDataTypeExpressionOperator(baseCellDataType).getEntries(activeOperators);
  }
  getJoinOperatorAutocompleteEntries() {
    return Object.entries(this.expressionJoinOperators).map(([key, displayValue]) => ({ key, displayValue }));
  }
  getDefaultAutocompleteListParams(searchString) {
    return this.generateAutocompleteListParams(this.getColumnAutocompleteEntries(), "column", searchString);
  }
  getDataTypeExpressionOperator(baseCellDataType) {
    return this.expressionOperators[baseCellDataType];
  }
  getExpressionOperator(baseCellDataType, operator) {
    var _a, _b;
    return (_b = (_a = this.getDataTypeExpressionOperator(baseCellDataType)) == null ? void 0 : _a.operators) == null ? void 0 : _b[operator];
  }
  getExpressionJoinOperators() {
    return this.expressionJoinOperators;
  }
  getColId(columnName) {
    const upperCaseColumnName = columnName.toLocaleUpperCase();
    const cachedColId = this.columnNameToIdMap[upperCaseColumnName];
    if (cachedColId) {
      return cachedColId;
    }
    const columnAutocompleteEntries = this.getColumnAutocompleteEntries();
    const colEntry = columnAutocompleteEntries.find(({ displayValue }) => displayValue.toLocaleUpperCase() === upperCaseColumnName);
    if (colEntry) {
      const { key: colId, displayValue } = colEntry;
      const colValue = { colId, columnName: displayValue };
      this.columnNameToIdMap[upperCaseColumnName] = colValue;
      return colValue;
    }
    return null;
  }
  getExpressionEvaluatorParams(colId) {
    let params = this.expressionEvaluatorParams[colId];
    if (params) {
      return params;
    }
    const column = this.columnModel.getPrimaryColumn(colId);
    if (!column) {
      return { valueConverter: (v) => v };
    }
    const baseCellDataType = this.dataTypeService.getBaseDataType(column);
    switch (baseCellDataType) {
      case "dateString":
        params = {
          valueConverter: this.dataTypeService.getDateParserFunction(column)
        };
        break;
      case "object":
        if (column.getColDef().filterValueGetter) {
          params = { valueConverter: (v) => v };
        } else {
          params = {
            valueConverter: (value, node) => {
              var _a;
              return (_a = this.valueService.formatValue(column, node, value)) != null ? _a : typeof value.toString === "function" ? value.toString() : "";
            }
          };
        }
        break;
      case "text":
      case void 0:
        params = { valueConverter: (v) => import_core14._.toStringOrNull(v) };
        break;
      default:
        params = { valueConverter: (v) => v };
        break;
    }
    const { filterParams } = column.getColDef();
    if (filterParams) {
      [
        "caseSensitive",
        "includeBlanksInEquals",
        "includeBlanksInLessThan",
        "includeBlanksInGreaterThan"
      ].forEach((param) => {
        const paramValue = filterParams[param];
        if (paramValue) {
          params[param] = paramValue;
        }
      });
    }
    this.expressionEvaluatorParams[colId] = params;
    return params;
  }
  getColumnDetails(colId) {
    var _a, _b;
    const column = (_a = this.columnModel.getPrimaryColumn(colId)) != null ? _a : void 0;
    const baseCellDataType = (_b = column ? this.dataTypeService.getBaseDataType(column) : void 0) != null ? _b : "text";
    return { column, baseCellDataType };
  }
  generateExpressionOperators() {
    const translate = (key, variableValues) => this.translate(key, variableValues);
    return {
      text: new TextFilterExpressionOperators({ translate }),
      boolean: new BooleanFilterExpressionOperators({ translate }),
      object: new TextFilterExpressionOperators({ translate }),
      number: new ScalarFilterExpressionOperators({ translate, equals: (v, o) => v === o }),
      date: new ScalarFilterExpressionOperators({ translate, equals: (v, o) => v.getTime() === o.getTime() }),
      dateString: new ScalarFilterExpressionOperators({ translate, equals: (v, o) => v.getTime() === o.getTime() })
    };
  }
  getColumnValue({ displayValue }) {
    return `${ColFilterExpressionParser.COL_START_CHAR}${displayValue}${ColFilterExpressionParser.COL_END_CHAR}`;
  }
  generateExpressionJoinOperators() {
    return {
      AND: this.translate("advancedFilterAnd"),
      OR: this.translate("advancedFilterOr")
    };
  }
  getActiveOperators(column) {
    var _a;
    const filterOptions = (_a = column.getColDef().filterParams) == null ? void 0 : _a.filterOptions;
    if (!filterOptions) {
      return void 0;
    }
    const isValid = filterOptions.every((filterOption) => typeof filterOption === "string");
    return isValid ? filterOptions : void 0;
  }
  resetColumnCaches() {
    this.columnAutocompleteEntries = null;
    this.columnNameToIdMap = {};
    this.expressionEvaluatorParams = {};
  }
};
__decorateClass([
  (0, import_core14.Autowired)("valueService")
], AdvancedFilterExpressionService.prototype, "valueService", 2);
__decorateClass([
  (0, import_core14.Autowired)("columnModel")
], AdvancedFilterExpressionService.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core14.Autowired)("dataTypeService")
], AdvancedFilterExpressionService.prototype, "dataTypeService", 2);
__decorateClass([
  import_core14.PostConstruct
], AdvancedFilterExpressionService.prototype, "postConstruct", 1);
AdvancedFilterExpressionService = __decorateClass([
  (0, import_core14.Bean)("advancedFilterExpressionService")
], AdvancedFilterExpressionService);

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterService.ts
var import_core15 = require("@ag-grid-community/core");

// enterprise-modules/advanced-filter/src/advancedFilter/joinFilterExpressionParser.ts
var OperatorParser2 = class {
  constructor(params) {
    this.params = params;
    this.operators = [];
    this.operatorStartPositions = [];
    this.operatorEndPositions = [];
    this.activeOperator = 0;
    this.validationError = null;
  }
  parseExpression(i) {
    this.operators.push("");
    this.operatorStartPositions.push(i);
    this.operatorEndPositions.push(void 0);
    const { expression } = this.params;
    while (i < expression.length) {
      const char = expression[i];
      if (char === " ") {
        const isComplete = this.parseOperator(i - 1);
        if (isComplete) {
          this.activeOperator++;
          return i - 1;
        } else {
          this.operators[this.activeOperator] += char;
        }
      } else {
        this.operators[this.activeOperator] += char;
      }
      i++;
    }
    this.parseOperator(i - 1);
    return i;
  }
  isValid() {
    return !this.validationError && (!this.operators.length || !!this.parsedOperator);
  }
  getValidationError() {
    return this.validationError;
  }
  getFunction() {
    return this.parsedOperator === "OR" ? "||" : "&&";
  }
  getModel() {
    return this.parsedOperator === "OR" ? "OR" : "AND";
  }
  getAutocompleteListParams(position, operatorIndex) {
    let searchString;
    if (operatorIndex == null) {
      searchString = "";
    } else {
      const operator = this.operators[operatorIndex];
      const operatorEndPosition = this.operatorEndPositions[operatorIndex];
      searchString = getSearchString(
        operator,
        position,
        operatorEndPosition == null ? this.params.expression.length : operatorEndPosition + 1
      );
    }
    let entries = this.params.advancedFilterExpressionService.getJoinOperatorAutocompleteEntries();
    if (operatorIndex || operatorIndex == null && this.activeOperator) {
      entries = entries.filter(({ key }) => key === this.parsedOperator);
    }
    return this.params.advancedFilterExpressionService.generateAutocompleteListParams(entries, "join", searchString);
  }
  updateExpression(position, updateEntry, operatorIndex) {
    var _a, _b;
    let { expression } = this.params;
    const updatedValuePart = (_a = updateEntry.displayValue) != null ? _a : updateEntry.key;
    if (operatorIndex === 0) {
      for (let i = this.operatorEndPositions.length - 1; i > 0; i--) {
        const operatorEndPosition = this.operatorEndPositions[i];
        if (operatorEndPosition == null) {
          continue;
        }
        expression = updateExpression(
          expression,
          this.operatorStartPositions[i],
          operatorEndPosition,
          updatedValuePart
        ).updatedValue;
      }
    }
    const startPosition = this.operatorStartPositions.length > operatorIndex ? this.operatorStartPositions[operatorIndex] : position;
    const endPosition = (_b = this.operatorEndPositions.length > operatorIndex ? this.operatorEndPositions[operatorIndex] : void 0) != null ? _b : findEndPosition(expression, position, true).endPosition;
    return updateExpression(
      expression,
      startPosition,
      endPosition,
      updatedValuePart,
      true
    );
  }
  getNumOperators() {
    return this.operators.length;
  }
  getLastOperatorEndPosition() {
    return this.operatorEndPositions[this.operatorEndPositions.length - 1];
  }
  parseOperator(endPosition) {
    const operator = this.operators.length > this.activeOperator ? this.operators[this.activeOperator] : "";
    const joinOperators = this.params.advancedFilterExpressionService.getExpressionJoinOperators();
    const parsedValue = findMatch(operator, joinOperators, (v) => v);
    if (parsedValue) {
      this.operatorEndPositions[this.activeOperator] = endPosition;
      const displayValue = joinOperators[parsedValue];
      if (this.activeOperator) {
        if (parsedValue !== this.parsedOperator) {
          if (!this.validationError) {
            this.validationError = {
              message: this.params.advancedFilterExpressionService.translate("advancedFilterValidationJoinOperatorMismatch"),
              startPosition: endPosition - operator.length + 1,
              endPosition
            };
          }
          return false;
        }
      } else {
        this.parsedOperator = parsedValue;
      }
      if (operator !== displayValue) {
        checkAndUpdateExpression(this.params, operator, displayValue, endPosition);
        this.operators[this.activeOperator] = displayValue;
      }
      return true;
    } else if (parsedValue === null) {
      return false;
    } else {
      if (!this.validationError) {
        this.validationError = {
          message: this.params.advancedFilterExpressionService.translate("advancedFilterValidationInvalidJoinOperator"),
          startPosition: endPosition - operator.length + 1,
          endPosition
        };
      }
      return true;
    }
  }
};
var JoinFilterExpressionParser = class _JoinFilterExpressionParser {
  constructor(params, startPosition) {
    this.params = params;
    this.startPosition = startPosition;
    this.expectingExpression = true;
    this.expectingOperator = false;
    this.expressionParsers = [];
    this.operatorParser = new OperatorParser2(this.params);
    this.missingEndBracket = false;
    this.extraEndBracket = false;
  }
  parseExpression() {
    let i = this.startPosition;
    const { expression } = this.params;
    while (i < expression.length) {
      const char = expression[i];
      if (char === "(" && !this.expectingOperator) {
        const nestedParser = new _JoinFilterExpressionParser(this.params, i + 1);
        i = nestedParser.parseExpression();
        this.expressionParsers.push(nestedParser);
        this.expectingExpression = false;
        this.expectingOperator = true;
      } else if (char === ")") {
        this.endPosition = i - 1;
        if (this.startPosition === 0) {
          this.extraEndBracket = true;
        }
        return i;
      } else if (char === " ") {
      } else if (this.expectingExpression) {
        const nestedParser = new ColFilterExpressionParser(this.params, i);
        i = nestedParser.parseExpression();
        this.expressionParsers.push(nestedParser);
        this.expectingExpression = false;
        this.expectingOperator = true;
      } else if (this.expectingOperator) {
        i = this.operatorParser.parseExpression(i);
        this.expectingOperator = false;
        this.expectingExpression = true;
      }
      i++;
    }
    if (this.startPosition > 0) {
      this.missingEndBracket = true;
    }
    return i;
  }
  isValid() {
    return !this.missingEndBracket && !this.extraEndBracket && this.expressionParsers.length === this.operatorParser.getNumOperators() + 1 && this.operatorParser.isValid() && this.expressionParsers.every((expressionParser) => expressionParser.isValid());
  }
  getValidationError() {
    const operatorError = this.operatorParser.getValidationError();
    for (let i = 0; i < this.expressionParsers.length; i++) {
      const expressionError = this.expressionParsers[i].getValidationError();
      if (expressionError) {
        return operatorError && operatorError.startPosition < expressionError.startPosition ? operatorError : expressionError;
      }
    }
    ;
    if (operatorError) {
      return operatorError;
    }
    if (this.extraEndBracket) {
      return {
        message: this.params.advancedFilterExpressionService.translate("advancedFilterValidationExtraEndBracket"),
        startPosition: this.endPosition + 1,
        endPosition: this.endPosition + 1
      };
    }
    let translateKey;
    if (this.expressionParsers.length === this.operatorParser.getNumOperators()) {
      translateKey = "advancedFilterValidationMissingCondition";
    } else if (this.missingEndBracket) {
      translateKey = "advancedFilterValidationMissingEndBracket";
    }
    if (translateKey) {
      return {
        message: this.params.advancedFilterExpressionService.translate(translateKey),
        startPosition: this.params.expression.length,
        endPosition: this.params.expression.length
      };
    }
    return null;
  }
  getFunctionString(params) {
    const hasMultipleExpressions = this.expressionParsers.length > 1;
    const expression = this.expressionParsers.map(
      (expressionParser) => expressionParser.getFunctionString(params)
    ).join(
      ` ${this.operatorParser.getFunction()} `
    );
    return hasMultipleExpressions ? `(${expression})` : expression;
  }
  getFunctionParsed(params) {
    const operator = this.operatorParser.getFunction();
    const funcs = this.expressionParsers.map((expressionParser) => expressionParser.getFunctionParsed(params));
    const arrayFunc = operator === "&&" ? "every" : "some";
    return (expressionProxy, node, p) => funcs[arrayFunc]((func) => func(expressionProxy, node, p));
  }
  getAutocompleteListParams(position) {
    if (this.endPosition != null && position > this.endPosition + 1) {
      return void 0;
    }
    if (!this.expressionParsers.length) {
      return this.getColumnAutocompleteListParams();
    }
    const expressionParserIndex = this.getExpressionParserIndex(position);
    if (expressionParserIndex == null) {
      if (this.params.expression[position] === "(") {
        return { enabled: false };
      }
      return this.getColumnAutocompleteListParams();
    }
    const expressionParser = this.expressionParsers[expressionParserIndex];
    const autocompleteType = expressionParser.getAutocompleteListParams(position);
    if (!autocompleteType) {
      if (expressionParserIndex < this.expressionParsers.length - 1) {
        return this.operatorParser.getAutocompleteListParams(position, expressionParserIndex);
      }
      if (this.expressionParsers.length === this.operatorParser.getNumOperators()) {
        const operatorEndPosition = this.operatorParser.getLastOperatorEndPosition();
        return operatorEndPosition == null || position <= operatorEndPosition + 1 ? this.operatorParser.getAutocompleteListParams(position, this.operatorParser.getNumOperators() - 1) : this.getColumnAutocompleteListParams();
      }
      if (this.params.expression[position - 1] === ")") {
        return { enabled: false };
      }
      return this.operatorParser.getAutocompleteListParams(position);
    }
    return autocompleteType;
  }
  updateExpression(position, updateEntry, type) {
    var _a;
    const expression = this.params.expression;
    const expressionParserIndex = this.getExpressionParserIndex(position);
    if (expressionParserIndex == null) {
      const updatedValuePart = type === "column" ? this.params.advancedFilterExpressionService.getColumnValue(updateEntry) : (_a = updateEntry.displayValue) != null ? _a : updateEntry.key;
      return updateExpression(expression, this.startPosition, this.startPosition, updatedValuePart, true);
    }
    const expressionParser = this.expressionParsers[expressionParserIndex];
    const updatedExpression = expressionParser.updateExpression(position, updateEntry, type);
    if (updatedExpression == null) {
      if (type === "column") {
        return updateExpression(
          expression,
          position,
          expression.length - 1,
          this.params.advancedFilterExpressionService.getColumnValue(updateEntry),
          true
        );
      } else if (this.endPosition != null && position > this.endPosition + 1) {
        return null;
      } else {
        return this.operatorParser.updateExpression(position, updateEntry, expressionParserIndex);
      }
    }
    return updatedExpression;
  }
  getModel() {
    if (this.expressionParsers.length > 1) {
      return {
        filterType: "join",
        type: this.operatorParser.getModel(),
        conditions: this.expressionParsers.map((parser) => parser.getModel())
      };
    } else {
      return this.expressionParsers[0].getModel();
    }
  }
  getColumnAutocompleteListParams() {
    return this.params.advancedFilterExpressionService.generateAutocompleteListParams(
      this.params.advancedFilterExpressionService.getColumnAutocompleteEntries(),
      "column",
      ""
    );
  }
  getExpressionParserIndex(position) {
    let expressionParserIndex;
    for (let i = 0; i < this.expressionParsers.length; i++) {
      const expressionParserToCheck = this.expressionParsers[i];
      if (expressionParserToCheck.startPosition > position) {
        break;
      }
      expressionParserIndex = i;
    }
    return expressionParserIndex;
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/filterExpressionParser.ts
var FilterExpressionParser = class {
  constructor(params) {
    this.params = params;
    this.valid = false;
  }
  parseExpression() {
    this.joinExpressionParser = new JoinFilterExpressionParser(this.params, 0);
    const i = this.joinExpressionParser.parseExpression();
    this.valid = i >= this.params.expression.length - 1 && this.joinExpressionParser.isValid();
    return this.params.expression;
  }
  isValid() {
    return this.valid;
  }
  getValidationMessage() {
    const error = this.joinExpressionParser.getValidationError();
    if (!error) {
      return null;
    }
    const { message, startPosition, endPosition } = error;
    return startPosition < this.params.expression.length ? this.params.advancedFilterExpressionService.translate("advancedFilterValidationMessage", [
      message,
      this.params.expression.slice(startPosition, endPosition + 1).trim()
    ]) : this.params.advancedFilterExpressionService.translate("advancedFilterValidationMessageAtEnd", [message]);
  }
  getFunctionString() {
    const params = this.createFunctionParams();
    return {
      functionString: `return ${this.joinExpressionParser.getFunctionString(params)};`,
      params
    };
  }
  getFunctionParsed() {
    const params = this.createFunctionParams();
    return {
      expressionFunction: this.joinExpressionParser.getFunctionParsed(params),
      params
    };
  }
  getAutocompleteListParams(position) {
    var _a;
    return (_a = this.joinExpressionParser.getAutocompleteListParams(position)) != null ? _a : { enabled: false };
  }
  updateExpression(position, updateEntry, type) {
    return this.joinExpressionParser.updateExpression(position, updateEntry, type);
  }
  getModel() {
    return this.isValid() ? this.joinExpressionParser.getModel() : null;
  }
  createFunctionParams() {
    return {
      operands: [],
      operators: [],
      evaluatorParams: []
    };
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterService.ts
var AdvancedFilterService = class extends import_core15.BeanStub {
  constructor() {
    super(...arguments);
    this.appliedExpression = null;
    /** The value displayed in the input, which may be invalid */
    this.expression = null;
    this.isValid = true;
  }
  postConstruct() {
    this.setEnabled(this.gos.get("enableAdvancedFilter"), true);
    this.ctrl = this.createManagedBean(new AdvancedFilterCtrl(this.enabled));
    this.expressionProxy = {
      getValue: (colId, node) => {
        const column = this.columnModel.getPrimaryColumn(colId);
        return column ? this.valueService.getValue(column, node, true) : void 0;
      }
    };
    this.addManagedPropertyListener("enableAdvancedFilter", (event) => this.setEnabled(!!event.currentValue));
    this.addManagedListener(
      this.eventService,
      import_core15.Events.EVENT_NEW_COLUMNS_LOADED,
      (event) => this.onNewColumnsLoaded(event)
    );
    this.addManagedPropertyListener("includeHiddenColumnsInAdvancedFilter", () => this.updateValidity());
  }
  isEnabled() {
    return this.enabled;
  }
  isFilterPresent() {
    return !!this.expressionFunction;
  }
  doesFilterPass(node) {
    return this.expressionFunction(this.expressionProxy, node, this.expressionParams);
  }
  getModel() {
    var _a;
    const expressionParser = this.createExpressionParser(this.appliedExpression);
    expressionParser == null ? void 0 : expressionParser.parseExpression();
    return (_a = expressionParser == null ? void 0 : expressionParser.getModel()) != null ? _a : null;
  }
  setModel(model) {
    const parseModel = (model2, isFirstParent) => {
      if (model2.filterType === "join") {
        const operator = this.advancedFilterExpressionService.parseJoinOperator(model2);
        const expression2 = model2.conditions.map((condition) => parseModel(condition)).filter((condition) => import_core15._.exists(condition)).join(` ${operator} `);
        return isFirstParent || model2.conditions.length <= 1 ? expression2 : `(${expression2})`;
      } else {
        return this.advancedFilterExpressionService.parseColumnFilterModel(model2);
      }
    };
    const expression = model ? parseModel(model, true) : null;
    this.setExpressionDisplayValue(expression);
    this.applyExpression();
    this.ctrl.refreshComp();
    this.ctrl.refreshBuilderComp();
  }
  getExpressionDisplayValue() {
    return this.expression;
  }
  setExpressionDisplayValue(expression) {
    this.expression = expression;
  }
  isCurrentExpressionApplied() {
    return this.appliedExpression === this.expression;
  }
  createExpressionParser(expression) {
    if (!expression) {
      return null;
    }
    return new FilterExpressionParser({
      expression,
      columnModel: this.columnModel,
      dataTypeService: this.dataTypeService,
      valueService: this.valueService,
      advancedFilterExpressionService: this.advancedFilterExpressionService
    });
  }
  getDefaultExpression(updateEntry) {
    const updatedValue = this.advancedFilterExpressionService.getColumnValue(updateEntry) + " ";
    return {
      updatedValue,
      updatedPosition: updatedValue.length
    };
  }
  isHeaderActive() {
    return !this.gos.get("advancedFilterParent");
  }
  getCtrl() {
    return this.ctrl;
  }
  setEnabled(enabled, silent) {
    const previousValue = this.enabled;
    const rowModelType = this.rowModel.getType();
    const isValidRowModel = rowModelType === "clientSide" || rowModelType === "serverSide";
    if (enabled && !rowModelType) {
      import_core15._.warnOnce("Advanced Filter is only supported with the Client-Side Row Model or Server-Side Row Model.");
    }
    this.enabled = enabled && isValidRowModel;
    if (!silent && this.enabled !== previousValue) {
      const event = {
        type: import_core15.Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
        enabled: this.enabled
      };
      this.eventService.dispatchEvent(event);
    }
  }
  applyExpression() {
    const expressionParser = this.createExpressionParser(this.expression);
    expressionParser == null ? void 0 : expressionParser.parseExpression();
    this.applyExpressionFromParser(expressionParser);
  }
  applyExpressionFromParser(expressionParser) {
    this.isValid = !expressionParser || expressionParser.isValid();
    if (!expressionParser || !this.isValid) {
      this.expressionFunction = null;
      this.expressionParams = null;
      this.appliedExpression = null;
      return;
    }
    const { expressionFunction, params } = this.getFunction(expressionParser);
    this.expressionFunction = expressionFunction;
    this.expressionParams = params;
    this.appliedExpression = this.expression;
  }
  getFunction(expressionParser) {
    if (this.gos.get("suppressAdvancedFilterEval")) {
      return expressionParser.getFunctionParsed();
    } else {
      const { functionString, params } = expressionParser.getFunctionString();
      return {
        expressionFunction: new Function("expressionProxy", "node", "params", functionString),
        params
      };
    }
  }
  updateValidity() {
    this.advancedFilterExpressionService.resetColumnCaches();
    const expressionParser = this.createExpressionParser(this.expression);
    expressionParser == null ? void 0 : expressionParser.parseExpression();
    const isValid = !expressionParser || expressionParser.isValid();
    const updatedValidity = isValid !== this.isValid;
    this.applyExpressionFromParser(expressionParser);
    this.ctrl.refreshComp();
    this.ctrl.refreshBuilderComp();
    return updatedValidity;
  }
  onNewColumnsLoaded(event) {
    if (event.source !== "gridInitializing" || !this.dataTypeService.isPendingInference()) {
      return;
    }
    this.ctrl.setInputDisabled(true);
    const destroyFunc = this.addManagedListener(this.eventService, import_core15.Events.EVENT_DATA_TYPES_INFERRED, () => {
      destroyFunc == null ? void 0 : destroyFunc();
      this.ctrl.setInputDisabled(false);
    });
  }
};
__decorateClass([
  (0, import_core15.Autowired)("valueService")
], AdvancedFilterService.prototype, "valueService", 2);
__decorateClass([
  (0, import_core15.Autowired)("columnModel")
], AdvancedFilterService.prototype, "columnModel", 2);
__decorateClass([
  (0, import_core15.Autowired)("dataTypeService")
], AdvancedFilterService.prototype, "dataTypeService", 2);
__decorateClass([
  (0, import_core15.Autowired)("rowModel")
], AdvancedFilterService.prototype, "rowModel", 2);
__decorateClass([
  (0, import_core15.Autowired)("advancedFilterExpressionService")
], AdvancedFilterService.prototype, "advancedFilterExpressionService", 2);
__decorateClass([
  import_core15.PostConstruct
], AdvancedFilterService.prototype, "postConstruct", 1);
AdvancedFilterService = __decorateClass([
  (0, import_core15.Bean)("advancedFilterService")
], AdvancedFilterService);

// enterprise-modules/advanced-filter/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/advanced-filter/src/advancedFilterModule.ts
var AdvancedFilterModule = {
  version: VERSION,
  moduleName: import_core16.ModuleNames.AdvancedFilterModule,
  beans: [AdvancedFilterService, AdvancedFilterExpressionService],
  agStackComponents: [
    { componentName: "agAdvancedFilter", componentClass: AdvancedFilterComp }
  ],
  dependantModules: [
    import_core17.EnterpriseCoreModule
  ]
};
