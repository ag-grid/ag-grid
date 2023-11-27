/**
          * @ag-grid-enterprise/rich-select - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v31.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var RichSelectCellEditor = /** @class */ (function (_super) {
    __extends(RichSelectCellEditor, _super);
    function RichSelectCellEditor() {
        return _super.call(this, /* html */ "<div class=\"ag-cell-edit-wrapper\"></div>") || this;
    }
    RichSelectCellEditor.prototype.init = function (params) {
        var _this = this;
        this.params = params;
        var cellStartedEdit = params.cellStartedEdit, cellHeight = params.cellHeight, values = params.values;
        if (core._.missing(values)) {
            console.warn('AG Grid: agRichSelectCellEditor requires cellEditorParams.values to be set');
        }
        var _a = this.buildRichSelectParams(), richSelectParams = _a.params, valuesPromise = _a.valuesPromise;
        this.richSelect = this.createManagedBean(new core.AgRichSelect(richSelectParams));
        this.richSelect.addCssClass('ag-cell-editor');
        this.appendChild(this.richSelect);
        if (valuesPromise) {
            valuesPromise.then(function (values) {
                _this.richSelect.setValueList({ valueList: values, refresh: true });
                var searchStringCallback = _this.getSearchStringCallback(values);
                if (searchStringCallback) {
                    _this.richSelect.setSearchStringCreator(searchStringCallback);
                }
            });
        }
        this.addManagedListener(this.richSelect, core.Events.EVENT_FIELD_PICKER_VALUE_SELECTED, this.onEditorPickerValueSelected.bind(this));
        this.addManagedListener(this.richSelect.getGui(), 'focusout', this.onEditorFocusOut.bind(this));
        this.focusAfterAttached = cellStartedEdit;
        if (core._.exists(cellHeight)) {
            this.richSelect.setRowHeight(cellHeight);
        }
    };
    RichSelectCellEditor.prototype.onEditorPickerValueSelected = function (e) {
        this.params.stopEditing(!e.fromEnterKey);
    };
    RichSelectCellEditor.prototype.onEditorFocusOut = function (e) {
        if (this.richSelect.getGui().contains(e.relatedTarget)) {
            return;
        }
        this.params.stopEditing(true);
    };
    RichSelectCellEditor.prototype.buildRichSelectParams = function () {
        var _a = this.params, cellRenderer = _a.cellRenderer, value = _a.value, values = _a.values, formatValue = _a.formatValue, searchDebounceDelay = _a.searchDebounceDelay, valueListGap = _a.valueListGap, valueListMaxHeight = _a.valueListMaxHeight, valueListMaxWidth = _a.valueListMaxWidth, allowTyping = _a.allowTyping, filterList = _a.filterList, searchType = _a.searchType, highlightMatch = _a.highlightMatch, valuePlaceholder = _a.valuePlaceholder, eventKey = _a.eventKey;
        var ret = {
            value: value,
            cellRenderer: cellRenderer,
            searchDebounceDelay: searchDebounceDelay,
            valueFormatter: formatValue,
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'virtual-list',
            pickerGap: valueListGap,
            allowTyping: allowTyping,
            filterList: filterList,
            searchType: searchType,
            highlightMatch: highlightMatch,
            maxPickerHeight: valueListMaxHeight,
            maxPickerWidth: valueListMaxWidth,
            placeholder: valuePlaceholder,
            initialInputValue: (eventKey === null || eventKey === void 0 ? void 0 : eventKey.length) === 1 ? eventKey : undefined
        };
        var valuesResult;
        var valuesPromise;
        if (typeof values === 'function') {
            valuesResult = values(this.params);
        }
        else {
            valuesResult = values !== null && values !== void 0 ? values : [];
        }
        if (Array.isArray(valuesResult)) {
            ret.valueList = valuesResult;
            ret.searchStringCreator = this.getSearchStringCallback(valuesResult);
        }
        else {
            valuesPromise = valuesResult;
        }
        return { params: ret, valuesPromise: valuesPromise };
    };
    RichSelectCellEditor.prototype.getSearchStringCallback = function (values) {
        var _this = this;
        var colDef = this.params.colDef;
        if (typeof values[0] !== 'object' || !colDef.keyCreator) {
            return;
        }
        return function (values) { return values.map(function (value) {
            var keyParams = {
                value: value,
                colDef: _this.params.colDef,
                column: _this.params.column,
                node: _this.params.node,
                data: _this.params.data,
                api: _this.gridOptionsService.api,
                columnApi: _this.gridOptionsService.columnApi,
                context: _this.gridOptionsService.context
            };
            return colDef.keyCreator(keyParams);
        }); };
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    RichSelectCellEditor.prototype.afterGuiAttached = function () {
        var _this = this;
        var _a = this, focusAfterAttached = _a.focusAfterAttached, params = _a.params;
        setTimeout(function () {
            if (!_this.isAlive()) {
                return;
            }
            if (focusAfterAttached) {
                var focusableEl = _this.richSelect.getFocusableElement();
                focusableEl.focus();
                var _a = _this.params, allowTyping = _a.allowTyping, eventKey_1 = _a.eventKey;
                if (allowTyping && (!eventKey_1 || eventKey_1.length !== 1)) {
                    focusableEl.select();
                }
            }
            _this.richSelect.showPicker();
            var eventKey = params.eventKey;
            if (eventKey) {
                if ((eventKey === null || eventKey === void 0 ? void 0 : eventKey.length) === 1) {
                    _this.richSelect.searchTextFromString(eventKey);
                }
            }
        });
    };
    RichSelectCellEditor.prototype.getValue = function () {
        return this.richSelect.getValue();
    };
    RichSelectCellEditor.prototype.isPopup = function () {
        return false;
    };
    return RichSelectCellEditor;
}(core.PopupComponent));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '31.0.0';

var RichSelectModule = {
    version: VERSION,
    moduleName: core.ModuleNames.RichSelectModule,
    beans: [],
    userComponents: [
        { componentName: 'agRichSelect', componentClass: RichSelectCellEditor },
        { componentName: 'agRichSelectCellEditor', componentClass: RichSelectCellEditor }
    ],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.RichSelectModule = RichSelectModule;
