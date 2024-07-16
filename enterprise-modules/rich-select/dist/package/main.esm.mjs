// enterprise-modules/rich-select/src/richSelectModule.ts
import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/rich-select/src/richSelect/richSelectCellEditor.ts
import {
  AgRichSelect,
  Events,
  PopupComponent,
  _
} from "@ag-grid-community/core";
var RichSelectCellEditor = class extends PopupComponent {
  constructor() {
    super(
      /* html */
      `<div class="ag-cell-edit-wrapper"></div>`
    );
  }
  init(params) {
    this.params = params;
    const { cellStartedEdit, cellHeight, values } = params;
    if (_.missing(values)) {
      console.warn("AG Grid: agRichSelectCellEditor requires cellEditorParams.values to be set");
    }
    const { params: richSelectParams, valuesPromise } = this.buildRichSelectParams();
    this.richSelect = this.createManagedBean(new AgRichSelect(richSelectParams));
    this.richSelect.addCssClass("ag-cell-editor");
    this.appendChild(this.richSelect);
    if (valuesPromise) {
      valuesPromise.then((values2) => {
        this.richSelect.setValueList({ valueList: values2, refresh: true });
        const searchStringCallback = this.getSearchStringCallback(values2);
        if (searchStringCallback) {
          this.richSelect.setSearchStringCreator(searchStringCallback);
        }
      });
    }
    this.addManagedListener(this.richSelect, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, this.onEditorPickerValueSelected.bind(this));
    this.addManagedListener(this.richSelect.getGui(), "focusout", this.onEditorFocusOut.bind(this));
    this.focusAfterAttached = cellStartedEdit;
    if (_.exists(cellHeight)) {
      this.richSelect.setRowHeight(cellHeight);
    }
  }
  onEditorPickerValueSelected(e) {
    this.params.stopEditing(!e.fromEnterKey);
  }
  onEditorFocusOut(e) {
    if (this.richSelect.getGui().contains(e.relatedTarget)) {
      return;
    }
    this.params.stopEditing(true);
  }
  buildRichSelectParams() {
    const {
      cellRenderer,
      value,
      values,
      formatValue,
      searchDebounceDelay,
      valueListGap,
      valueListMaxHeight,
      valueListMaxWidth,
      allowTyping,
      filterList,
      searchType,
      highlightMatch,
      valuePlaceholder,
      eventKey
    } = this.params;
    const ret = {
      value,
      cellRenderer,
      searchDebounceDelay,
      valueFormatter: formatValue,
      pickerAriaLabelKey: "ariaLabelRichSelectField",
      pickerAriaLabelValue: "Rich Select Field",
      pickerType: "virtual-list",
      pickerGap: valueListGap,
      allowTyping,
      filterList,
      searchType,
      highlightMatch,
      maxPickerHeight: valueListMaxHeight,
      maxPickerWidth: valueListMaxWidth,
      placeholder: valuePlaceholder,
      initialInputValue: (eventKey == null ? void 0 : eventKey.length) === 1 ? eventKey : void 0
    };
    let valuesResult;
    let valuesPromise;
    if (typeof values === "function") {
      valuesResult = values(this.params);
    } else {
      valuesResult = values != null ? values : [];
    }
    if (Array.isArray(valuesResult)) {
      ret.valueList = valuesResult;
      ret.searchStringCreator = this.getSearchStringCallback(valuesResult);
    } else {
      valuesPromise = valuesResult;
    }
    return { params: ret, valuesPromise };
  }
  getSearchStringCallback(values) {
    const { colDef } = this.params;
    if (typeof values[0] !== "object" || !colDef.keyCreator) {
      return;
    }
    return (values2) => values2.map((value) => {
      const keyParams = this.gos.addGridCommonParams({
        value,
        colDef: this.params.colDef,
        column: this.params.column,
        node: this.params.node,
        data: this.params.data
      });
      return colDef.keyCreator(keyParams);
    });
  }
  // we need to have the gui attached before we can draw the virtual rows, as the
  // virtual row logic needs info about the gui state
  afterGuiAttached() {
    const { focusAfterAttached, params } = this;
    setTimeout(() => {
      if (!this.isAlive()) {
        return;
      }
      if (focusAfterAttached) {
        const focusableEl = this.richSelect.getFocusableElement();
        focusableEl.focus();
        const { allowTyping, eventKey: eventKey2 } = this.params;
        if (allowTyping && (!eventKey2 || eventKey2.length !== 1)) {
          focusableEl.select();
        }
      }
      this.richSelect.showPicker();
      const { eventKey } = params;
      if (eventKey) {
        if ((eventKey == null ? void 0 : eventKey.length) === 1) {
          this.richSelect.searchTextFromString(eventKey);
        }
      }
    });
  }
  getValue() {
    return this.richSelect.getValue();
  }
  isPopup() {
    return false;
  }
};

// enterprise-modules/rich-select/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/rich-select/src/richSelectModule.ts
var RichSelectModule = {
  version: VERSION,
  moduleName: ModuleNames.RichSelectModule,
  beans: [],
  userComponents: [
    { componentName: "agRichSelect", componentClass: RichSelectCellEditor },
    { componentName: "agRichSelectCellEditor", componentClass: RichSelectCellEditor }
  ],
  dependantModules: [
    EnterpriseCoreModule
  ]
};
export {
  RichSelectModule
};
