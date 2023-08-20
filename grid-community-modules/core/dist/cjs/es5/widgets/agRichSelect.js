"use strict";
var __extends = (this && this.__extends) || (function () {
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgRichSelect = void 0;
var keyCode_1 = require("../constants/keyCode");
var context_1 = require("../context/context");
var eventKeys_1 = require("../eventKeys");
var aria_1 = require("../utils/aria");
var dom_1 = require("../utils/dom");
var function_1 = require("../utils/function");
var fuzzyMatch_1 = require("../utils/fuzzyMatch");
var generic_1 = require("../utils/generic");
var keyboard_1 = require("../utils/keyboard");
var agPickerField_1 = require("./agPickerField");
var agRichSelectRow_1 = require("./agRichSelectRow");
var virtualList_1 = require("./virtualList");
var AgRichSelect = /** @class */ (function (_super) {
    __extends(AgRichSelect, _super);
    function AgRichSelect(config) {
        var _this = _super.call(this, __assign({ pickerAriaLabelKey: 'ariaLabelRichSelectField', pickerAriaLabelValue: 'Rich Select Field', pickerType: 'ag-list' }, config), 'ag-rich-select', 'smallDown', 'combobox') || this;
        _this.searchString = '';
        _this.highlightedItem = -1;
        var _a = config || {}, cellRowHeight = _a.cellRowHeight, value = _a.value, valueList = _a.valueList, searchDebounceDelay = _a.searchDebounceDelay;
        if (cellRowHeight) {
            _this.cellRowHeight = cellRowHeight;
        }
        if (value != null) {
            _this.value = value;
        }
        if (valueList != null) {
            _this.setValueList(valueList);
        }
        if (searchDebounceDelay != null) {
            _this.searchDebounceDelay = searchDebounceDelay;
        }
        return _this;
    }
    AgRichSelect.prototype.postConstruct = function () {
        var _a, _b;
        _super.prototype.postConstruct.call(this);
        this.createListComponent();
        this.eWrapper.tabIndex = (_a = this.gridOptionsService.getNum('tabIndex')) !== null && _a !== void 0 ? _a : 0;
        this.eWrapper.classList.add('ag-rich-select-value');
        var debounceDelay = (_b = this.searchDebounceDelay) !== null && _b !== void 0 ? _b : 300;
        this.clearSearchString = function_1.debounce(this.clearSearchString, debounceDelay);
        this.renderSelectedValue();
    };
    AgRichSelect.prototype.createListComponent = function () {
        var _this = this;
        this.listComponent = this.createManagedBean(new virtualList_1.VirtualList({ cssIdentifier: 'rich-select' }));
        this.listComponent.setComponentCreator(this.createRowComponent.bind(this));
        this.listComponent.setParentComponent(this);
        this.addManagedListener(this.listComponent, eventKeys_1.Events.EVENT_FIELD_PICKER_VALUE_SELECTED, function (e) {
            _this.onListValueSelected(e.value, e.fromEnterKey);
        });
        if (this.cellRowHeight) {
            this.listComponent.setRowHeight(this.cellRowHeight);
        }
        var eListGui = this.listComponent.getGui();
        var eListAriaEl = this.listComponent.getAriaElement();
        this.addManagedListener(eListGui, 'mousemove', this.onPickerMouseMove.bind(this));
        this.addManagedListener(eListGui, 'mousedown', function (e) { return e.preventDefault(); });
        eListGui.classList.add('ag-rich-select-list');
        var listId = "ag-rich-select-list-" + this.listComponent.getCompId();
        eListAriaEl.setAttribute('id', listId);
        aria_1.setAriaControls(this.eWrapper, eListAriaEl);
    };
    AgRichSelect.prototype.renderSelectedValue = function () {
        var _this = this;
        var _a = this, value = _a.value, eDisplayField = _a.eDisplayField, config = _a.config;
        var valueFormatted = this.config.valueFormatter ? this.config.valueFormatter(value) : value;
        var userCompDetails;
        if (config.cellRenderer) {
            userCompDetails = this.userComponentFactory.getCellRendererDetails(this.config, {
                value: value,
                valueFormatted: valueFormatted,
                api: this.gridOptionsService.api
            });
        }
        var userCompDetailsPromise;
        if (userCompDetails) {
            userCompDetailsPromise = userCompDetails.newAgStackInstance();
        }
        if (userCompDetailsPromise) {
            dom_1.clearElement(eDisplayField);
            dom_1.bindCellRendererToHtmlElement(userCompDetailsPromise, eDisplayField);
            userCompDetailsPromise.then(function (renderer) {
                _this.addDestroyFunc(function () { return _this.getContext().destroyBean(renderer); });
            });
        }
        else {
            if (generic_1.exists(this.value)) {
                eDisplayField.innerText = valueFormatted;
            }
            else {
                dom_1.clearElement(eDisplayField);
            }
        }
    };
    AgRichSelect.prototype.setValueList = function (valueList) {
        this.values = valueList;
        this.highlightSelectedValue();
    };
    AgRichSelect.prototype.getCurrentValueIndex = function () {
        var _a = this, values = _a.values, value = _a.value;
        if (value == null) {
            return -1;
        }
        for (var i = 0; i < values.length; i++) {
            if (values[i] === value) {
                return i;
            }
        }
        return -1;
    };
    AgRichSelect.prototype.highlightSelectedValue = function (index) {
        var _this = this;
        if (index == null) {
            index = this.getCurrentValueIndex();
        }
        if (index === -1) {
            return;
        }
        this.highlightedItem = index;
        if (this.listComponent) {
            this.listComponent.forEachRenderedRow(function (cmp, idx) {
                cmp.updateHighlighted(_this.highlightedItem === idx);
            });
        }
    };
    AgRichSelect.prototype.setRowHeight = function (height) {
        if (height !== this.cellRowHeight) {
            this.cellRowHeight = height;
        }
        if (this.listComponent) {
            this.listComponent.setRowHeight(height);
        }
    };
    AgRichSelect.prototype.createPickerComponent = function () {
        var values = this.values;
        this.listComponent.setModel({
            getRowCount: function () { return values.length; },
            getRow: function (index) { return values[index]; }
        });
        // do not create the picker every time to save state
        return this.listComponent;
    };
    AgRichSelect.prototype.showPicker = function () {
        var _a, _b, _c;
        _super.prototype.showPicker.call(this);
        var currentValueIndex = this.getCurrentValueIndex();
        if (currentValueIndex !== -1) {
            // make sure the virtual list has been sized correctly
            (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.refresh();
            (_b = this.listComponent) === null || _b === void 0 ? void 0 : _b.ensureIndexVisible(currentValueIndex);
            this.highlightSelectedValue(currentValueIndex);
        }
        else {
            (_c = this.listComponent) === null || _c === void 0 ? void 0 : _c.refresh();
        }
    };
    AgRichSelect.prototype.beforeHidePicker = function () {
        this.highlightedItem = -1;
        _super.prototype.beforeHidePicker.call(this);
    };
    AgRichSelect.prototype.searchText = function (searchKey) {
        if (typeof searchKey !== 'string') {
            var key = searchKey.key;
            if (key === keyCode_1.KeyCode.BACKSPACE) {
                this.searchString = this.searchString.slice(0, -1);
                key = '';
            }
            else if (!keyboard_1.isEventFromPrintableCharacter(searchKey)) {
                return;
            }
            searchKey.preventDefault();
            this.searchText(key);
            return;
        }
        this.searchString += searchKey;
        this.runSearch();
        this.clearSearchString();
    };
    AgRichSelect.prototype.runSearch = function () {
        var values = this.values;
        var searchStrings;
        var _a = this.config, _b = _a.valueFormatter, valueFormatter = _b === void 0 ? (function (value) { return value; }) : _b, searchStringCreator = _a.searchStringCreator;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(function (v) { return valueFormatter(v); });
        }
        else if (typeof values[0] === 'object' && searchStringCreator) {
            searchStrings = searchStringCreator(values);
        }
        if (!searchStrings) {
            return;
        }
        var topSuggestion = fuzzyMatch_1.fuzzySuggestions(this.searchString, searchStrings, true)[0];
        if (!topSuggestion) {
            return;
        }
        var topSuggestionIndex = searchStrings.indexOf(topSuggestion);
        this.selectListItem(topSuggestionIndex);
    };
    AgRichSelect.prototype.clearSearchString = function () {
        this.searchString = '';
    };
    AgRichSelect.prototype.selectListItem = function (index) {
        if (!this.isPickerDisplayed || !this.listComponent || index < 0 || index >= this.values.length) {
            return;
        }
        this.listComponent.ensureIndexVisible(index);
        this.highlightSelectedValue(index);
    };
    AgRichSelect.prototype.setValue = function (value, silent, fromPicker) {
        var index = this.values.indexOf(value);
        if (index === -1) {
            return this;
        }
        this.value = value;
        if (!fromPicker) {
            this.selectListItem(index);
        }
        this.renderSelectedValue();
        return _super.prototype.setValue.call(this, value, silent);
    };
    AgRichSelect.prototype.createRowComponent = function (value) {
        var row = new agRichSelectRow_1.RichSelectRow(this.config, this.eWrapper);
        row.setParentComponent(this.listComponent);
        this.getContext().createBean(row);
        row.setState(value, value === this.value);
        return row;
    };
    AgRichSelect.prototype.getRowForMouseEvent = function (e) {
        var listComponent = this.listComponent;
        if (!listComponent) {
            return -1;
        }
        var eGui = listComponent === null || listComponent === void 0 ? void 0 : listComponent.getGui();
        var rect = eGui.getBoundingClientRect();
        var scrollTop = listComponent.getScrollTop();
        var mouseY = e.clientY - rect.top + scrollTop;
        return Math.floor(mouseY / listComponent.getRowHeight());
    };
    AgRichSelect.prototype.onPickerMouseMove = function (e) {
        if (!this.listComponent) {
            return;
        }
        var row = this.getRowForMouseEvent(e);
        if (row !== -1) {
            this.selectListItem(row);
        }
    };
    AgRichSelect.prototype.onNavigationKeyDown = function (event, key) {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        var isDown = key === keyCode_1.KeyCode.DOWN;
        if (!this.isPickerDisplayed && isDown) {
            this.showPicker();
            return;
        }
        var oldIndex = this.highlightedItem;
        var diff = isDown ? 1 : -1;
        var newIndex = oldIndex === -1 ? 0 : oldIndex + diff;
        this.selectListItem(newIndex);
    };
    AgRichSelect.prototype.onEnterKeyDown = function (e) {
        if (!this.isPickerDisplayed) {
            return;
        }
        e.preventDefault();
        this.onListValueSelected(this.values[this.highlightedItem], true);
    };
    AgRichSelect.prototype.onListValueSelected = function (value, fromEnterKey) {
        this.setValue(value, false, true);
        this.dispatchPickerEvent(value, fromEnterKey);
        this.hidePicker();
    };
    AgRichSelect.prototype.dispatchPickerEvent = function (value, fromEnterKey) {
        var event = {
            type: eventKeys_1.Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey: fromEnterKey,
            value: value
        };
        this.dispatchEvent(event);
    };
    AgRichSelect.prototype.onKeyDown = function (event) {
        var key = event.key;
        switch (key) {
            case keyCode_1.KeyCode.LEFT:
            case keyCode_1.KeyCode.RIGHT:
                event.preventDefault();
                break;
            case keyCode_1.KeyCode.DOWN:
            case keyCode_1.KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
            case keyCode_1.KeyCode.ESCAPE:
                if (this.isPickerDisplayed) {
                    this.hidePicker();
                }
                break;
            case keyCode_1.KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            default:
                this.searchText(event);
        }
    };
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], AgRichSelect.prototype, "userComponentFactory", void 0);
    return AgRichSelect;
}(agPickerField_1.AgPickerField));
exports.AgRichSelect = AgRichSelect;
