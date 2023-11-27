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
import { KeyCode } from "../constants/keyCode";
import { Autowired } from "../context/context";
import { Events } from "../eventKeys";
import { setAriaActiveDescendant, setAriaControls, setAriaLabel } from "../utils/aria";
import { bindCellRendererToHtmlElement, clearElement, isVisible } from "../utils/dom";
import { stopPropagationForAgGrid } from "../utils/event";
import { debounce } from "../utils/function";
import { fuzzySuggestions } from "../utils/fuzzyMatch";
import { exists } from "../utils/generic";
import { isEventFromPrintableCharacter } from "../utils/keyboard";
import { escapeString } from "../utils/string";
import { AgPickerField } from "./agPickerField";
import { RichSelectRow } from "./agRichSelectRow";
import { RefSelector } from "./componentAnnotations";
import { VirtualList } from "./virtualList";
var TEMPLATE = /* html */ "\n    <div class=\"ag-picker-field\" role=\"presentation\">\n        <div ref=\"eLabel\"></div>\n            <div ref=\"eWrapper\" class=\"ag-wrapper ag-picker-field-wrapper ag-rich-select-value ag-picker-collapsed\">\n            <div ref=\"eDisplayField\" class=\"ag-picker-field-display\"></div>\n            <ag-input-text-field ref=\"eInput\" class=\"ag-rich-select-field-input\"></ag-input-text-field>\n            <div ref=\"eIcon\" class=\"ag-picker-field-icon\" aria-hidden=\"true\"></div>\n        </div>\n    </div>";
var AgRichSelect = /** @class */ (function (_super) {
    __extends(AgRichSelect, _super);
    function AgRichSelect(config) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, __assign(__assign({ pickerAriaLabelKey: 'ariaLabelRichSelectField', pickerAriaLabelValue: 'Rich Select Field', pickerType: 'ag-list', className: 'ag-rich-select', pickerIcon: 'smallDown', ariaRole: 'combobox', template: (_a = config === null || config === void 0 ? void 0 : config.template) !== null && _a !== void 0 ? _a : TEMPLATE, modalPicker: false }, config), { 
            // maxPickerHeight needs to be set after expanding `config`
            maxPickerHeight: (_b = config === null || config === void 0 ? void 0 : config.maxPickerHeight) !== null && _b !== void 0 ? _b : 'calc(var(--ag-row-height) * 6.5)' })) || this;
        _this.searchString = '';
        _this.highlightedItem = -1;
        _this.lastRowHovered = -1;
        _this.searchStringCreator = null;
        var _c = config || {}, cellRowHeight = _c.cellRowHeight, value = _c.value, valueList = _c.valueList, searchStringCreator = _c.searchStringCreator;
        if (cellRowHeight != null) {
            _this.cellRowHeight = cellRowHeight;
        }
        if (value !== undefined) {
            _this.value = value;
        }
        if (valueList != null) {
            _this.values = valueList;
        }
        if (searchStringCreator) {
            _this.searchStringCreator = searchStringCreator;
        }
        return _this;
    }
    AgRichSelect.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.createLoadingElement();
        this.createListComponent();
        var _a = this.config, allowTyping = _a.allowTyping, placeholder = _a.placeholder;
        if (allowTyping) {
            this.eInput
                .setAutoComplete(false)
                .setInputPlaceholder(placeholder);
            this.eDisplayField.classList.add('ag-hidden');
        }
        else {
            this.eInput.setDisplayed(false);
        }
        this.eWrapper.tabIndex = this.gridOptionsService.get('tabIndex');
        var _b = this.config.searchDebounceDelay, searchDebounceDelay = _b === void 0 ? 300 : _b;
        this.clearSearchString = debounce(this.clearSearchString, searchDebounceDelay);
        this.renderSelectedValue();
        if (allowTyping) {
            this.eInput.onValueChange(function (value) { return _this.searchTextFromString(value); });
            this.addManagedListener(this.eWrapper, 'focus', this.onWrapperFocus.bind(this));
        }
        this.addManagedListener(this.eWrapper, 'focusout', this.onWrapperFocusOut.bind(this));
    };
    AgRichSelect.prototype.createLoadingElement = function () {
        var eDocument = this.gridOptionsService.getDocument();
        var translate = this.localeService.getLocaleTextFunc();
        var el = eDocument.createElement('div');
        el.classList.add('ag-loading-text');
        el.innerText = translate('loadingOoo', 'Loading...');
        this.eLoading = el;
    };
    AgRichSelect.prototype.createListComponent = function () {
        var _this = this;
        this.listComponent = this.createBean(new VirtualList({ cssIdentifier: 'rich-select' }));
        this.listComponent.setComponentCreator(this.createRowComponent.bind(this));
        this.listComponent.setParentComponent(this);
        this.addManagedListener(this.listComponent, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, function (e) {
            _this.onListValueSelected(e.value, e.fromEnterKey);
        });
        var cellRowHeight = this.cellRowHeight;
        if (cellRowHeight) {
            this.listComponent.setRowHeight(cellRowHeight);
        }
        var eListGui = this.listComponent.getGui();
        var eListAriaEl = this.listComponent.getAriaElement();
        this.addManagedListener(eListGui, 'mousemove', this.onPickerMouseMove.bind(this));
        this.addManagedListener(eListGui, 'mousedown', function (e) { return e.preventDefault(); });
        eListGui.classList.add('ag-rich-select-list');
        var listId = "ag-rich-select-list-".concat(this.listComponent.getCompId());
        eListAriaEl.setAttribute('id', listId);
        var translate = this.localeService.getLocaleTextFunc();
        var ariaLabel = translate(this.config.pickerAriaLabelKey, this.config.pickerAriaLabelValue);
        setAriaLabel(eListAriaEl, ariaLabel);
        setAriaControls(this.eWrapper, eListAriaEl);
    };
    AgRichSelect.prototype.renderSelectedValue = function () {
        var _this = this;
        var _a = this, value = _a.value, eDisplayField = _a.eDisplayField, config = _a.config;
        var _b = this.config, allowTyping = _b.allowTyping, initialInputValue = _b.initialInputValue;
        var valueFormatted = this.config.valueFormatter ? this.config.valueFormatter(value) : value;
        if (allowTyping) {
            this.eInput.setValue(initialInputValue !== null && initialInputValue !== void 0 ? initialInputValue : valueFormatted);
            return;
        }
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
            clearElement(eDisplayField);
            bindCellRendererToHtmlElement(userCompDetailsPromise, eDisplayField);
            userCompDetailsPromise.then(function (renderer) {
                _this.addDestroyFunc(function () { return _this.getContext().destroyBean(renderer); });
            });
        }
        else {
            if (exists(this.value)) {
                eDisplayField.innerText = valueFormatted;
                eDisplayField.classList.remove('ag-display-as-placeholder');
            }
            else {
                var placeholder = config.placeholder;
                if (exists(placeholder)) {
                    eDisplayField.innerHTML = "".concat(escapeString(placeholder));
                    eDisplayField.classList.add('ag-display-as-placeholder');
                }
                else {
                    clearElement(eDisplayField);
                }
            }
        }
    };
    AgRichSelect.prototype.getCurrentValueIndex = function () {
        var _a = this, currentList = _a.currentList, value = _a.value;
        if (value == null) {
            return -1;
        }
        for (var i = 0; i < currentList.length; i++) {
            if (currentList[i] === value) {
                return i;
            }
        }
        return -1;
    };
    AgRichSelect.prototype.highlightFilterMatch = function () {
        var _this = this;
        var _a;
        (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.forEachRenderedRow(function (cmp, idx) {
            cmp.highlightString(_this.searchString);
        });
    };
    AgRichSelect.prototype.highlightSelectedValue = function (index) {
        var _this = this;
        var _a;
        if (index == null) {
            index = this.getCurrentValueIndex();
        }
        this.highlightedItem = index;
        (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.forEachRenderedRow(function (cmp, idx) {
            var highlighted = index === -1 ? false : _this.highlightedItem === idx;
            cmp.updateHighlighted(highlighted);
        });
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
        if (values) {
            this.setValueList({ valueList: values });
        }
        // do not create the picker every time to save state
        return this.listComponent;
    };
    AgRichSelect.prototype.setSearchStringCreator = function (searchStringFn) {
        this.searchStringCreator = searchStringFn;
    };
    AgRichSelect.prototype.setValueList = function (params) {
        var valueList = params.valueList, refresh = params.refresh;
        if (!this.listComponent) {
            return;
        }
        if (this.currentList === valueList) {
            return;
        }
        this.currentList = valueList;
        this.listComponent.setModel({
            getRowCount: function () { return valueList.length; },
            getRow: function (index) { return valueList[index]; }
        });
        if (refresh) {
            // if `values` is not present, it means the valuesList was set asynchronously
            if (!this.values) {
                this.values = valueList;
                if (this.isPickerDisplayed) {
                    this.showCurrentValueInPicker();
                }
            }
            else {
                this.listComponent.refresh();
            }
        }
    };
    AgRichSelect.prototype.showPicker = function () {
        _super.prototype.showPicker.call(this);
        this.showCurrentValueInPicker();
        this.displayOrHidePicker();
    };
    AgRichSelect.prototype.showCurrentValueInPicker = function () {
        var _a, _b;
        if (!this.listComponent) {
            return;
        }
        if (!this.currentList) {
            if (this.isPickerDisplayed && this.eLoading) {
                this.listComponent.appendChild(this.eLoading);
            }
            return;
        }
        if ((_a = this.eLoading) === null || _a === void 0 ? void 0 : _a.offsetParent) {
            (_b = this.eLoading.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(this.eLoading);
        }
        var currentValueIndex = this.getCurrentValueIndex();
        if (currentValueIndex !== -1) {
            // make sure the virtual list has been sized correctly
            this.listComponent.refresh();
            this.listComponent.ensureIndexVisible(currentValueIndex);
            // this second call to refresh is necessary to force scrolled elements
            // to be rendered with the correct index info.
            this.listComponent.refresh(true);
            this.highlightSelectedValue(currentValueIndex);
        }
        else {
            this.listComponent.refresh();
        }
    };
    AgRichSelect.prototype.beforeHidePicker = function () {
        this.highlightedItem = -1;
        _super.prototype.beforeHidePicker.call(this);
    };
    AgRichSelect.prototype.onWrapperFocus = function () {
        if (!this.eInput) {
            return;
        }
        var focusableEl = this.eInput.getFocusableElement();
        focusableEl.focus();
        focusableEl.select();
    };
    AgRichSelect.prototype.onWrapperFocusOut = function (e) {
        if (!this.eWrapper.contains(e.relatedTarget)) {
            this.hidePicker();
        }
    };
    AgRichSelect.prototype.buildSearchStringFromKeyboardEvent = function (searchKey) {
        var key = searchKey.key;
        if (key === KeyCode.BACKSPACE) {
            this.searchString = this.searchString.slice(0, -1);
            key = '';
        }
        else if (!isEventFromPrintableCharacter(searchKey)) {
            return;
        }
        searchKey.preventDefault();
        this.searchTextFromCharacter(key);
    };
    AgRichSelect.prototype.searchTextFromCharacter = function (char) {
        this.searchString += char;
        this.runSearch();
        this.clearSearchString();
    };
    AgRichSelect.prototype.searchTextFromString = function (str) {
        if (str == null) {
            str = '';
        }
        this.searchString = str;
        this.runSearch();
    };
    AgRichSelect.prototype.buildSearchStrings = function (values) {
        var _a = this.config.valueFormatter, valueFormatter = _a === void 0 ? (function (value) { return value; }) : _a;
        var searchStrings;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(function (v) { return valueFormatter(v); });
        }
        else if (typeof values[0] === 'object' && this.searchStringCreator) {
            searchStrings = this.searchStringCreator(values);
        }
        return searchStrings;
    };
    AgRichSelect.prototype.getSuggestionsAndFilteredValues = function (searchValue, valueList) {
        var _this = this;
        var suggestions = [];
        var filteredValues = [];
        if (!searchValue.length) {
            return { suggestions: suggestions, filteredValues: filteredValues };
        }
        ;
        var _a = this.config, _b = _a.searchType, searchType = _b === void 0 ? 'fuzzy' : _b, filterList = _a.filterList;
        if (searchType === 'fuzzy') {
            var fuzzySearchResult = fuzzySuggestions(this.searchString, valueList, true);
            suggestions = fuzzySearchResult.values;
            var indices = fuzzySearchResult.indices;
            if (filterList && indices.length) {
                for (var i = 0; i < indices.length; i++) {
                    filteredValues.push(this.values[indices[i]]);
                }
            }
        }
        else {
            suggestions = valueList.filter(function (val, idx) {
                var currentValue = val.toLocaleLowerCase();
                var valueToMatch = _this.searchString.toLocaleLowerCase();
                var isMatch = searchType === 'match' ? currentValue.startsWith(valueToMatch) : currentValue.indexOf(valueToMatch) !== -1;
                if (filterList && isMatch) {
                    filteredValues.push(_this.values[idx]);
                }
                return isMatch;
            });
        }
        return { suggestions: suggestions, filteredValues: filteredValues };
    };
    AgRichSelect.prototype.filterListModel = function (filteredValues) {
        var filterList = this.config.filterList;
        if (!filterList) {
            return;
        }
        this.setValueList({ valueList: filteredValues, refresh: true });
        this.alignPickerToComponent();
    };
    AgRichSelect.prototype.runSearch = function () {
        var _a, _b;
        var values = this.values;
        var searchStrings = this.buildSearchStrings(values);
        if (!searchStrings) {
            this.highlightSelectedValue(-1);
            return;
        }
        var _c = this.getSuggestionsAndFilteredValues(this.searchString, searchStrings), suggestions = _c.suggestions, filteredValues = _c.filteredValues;
        var _d = this.config, filterList = _d.filterList, highlightMatch = _d.highlightMatch, _e = _d.searchType, searchType = _e === void 0 ? 'fuzzy' : _e;
        var filterValueLen = filteredValues.length;
        var shouldFilter = !!(filterList && this.searchString !== '');
        this.filterListModel(shouldFilter ? filteredValues : values);
        if (suggestions.length) {
            var topSuggestionIndex = shouldFilter ? 0 : searchStrings.indexOf(suggestions[0]);
            this.selectListItem(topSuggestionIndex);
        }
        else {
            this.highlightSelectedValue(-1);
            if (!shouldFilter || filterValueLen) {
                (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.ensureIndexVisible(0);
            }
            else if (shouldFilter) {
                this.getAriaElement().removeAttribute('data-active-option');
                var eListAriaEl = (_b = this.listComponent) === null || _b === void 0 ? void 0 : _b.getAriaElement();
                if (eListAriaEl) {
                    setAriaActiveDescendant(eListAriaEl, null);
                }
            }
        }
        if (highlightMatch && searchType !== 'fuzzy') {
            this.highlightFilterMatch();
        }
        this.displayOrHidePicker();
    };
    AgRichSelect.prototype.displayOrHidePicker = function () {
        var _a;
        var eListGui = (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.getGui();
        eListGui === null || eListGui === void 0 ? void 0 : eListGui.classList.toggle('ag-hidden', this.currentList.length === 0);
    };
    AgRichSelect.prototype.clearSearchString = function () {
        this.searchString = '';
    };
    AgRichSelect.prototype.selectListItem = function (index, preventUnnecessaryScroll) {
        if (!this.isPickerDisplayed || !this.listComponent || index < 0 || index >= this.currentList.length) {
            return;
        }
        var wasScrolled = this.listComponent.ensureIndexVisible(index, !preventUnnecessaryScroll);
        if (wasScrolled && !preventUnnecessaryScroll) {
            this.listComponent.refresh(true);
        }
        this.highlightSelectedValue(index);
    };
    AgRichSelect.prototype.setValue = function (value, silent, fromPicker) {
        var index = this.currentList.indexOf(value);
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
        var row = new RichSelectRow(this.config, this.eWrapper);
        row.setParentComponent(this.listComponent);
        this.getContext().createBean(row);
        row.setState(value);
        var _a = this.config, highlightMatch = _a.highlightMatch, _b = _a.searchType, searchType = _b === void 0 ? 'fuzzy' : _b;
        if (highlightMatch && searchType !== 'fuzzy') {
            row.highlightString(this.searchString);
        }
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
        if (row !== -1 && row != this.lastRowHovered) {
            this.lastRowHovered = row;
            this.selectListItem(row, true);
        }
    };
    AgRichSelect.prototype.onNavigationKeyDown = function (event, key) {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        var isDown = key === KeyCode.DOWN;
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
        this.onListValueSelected(this.currentList[this.highlightedItem], true);
    };
    AgRichSelect.prototype.onTabKeyDown = function () {
        if (!this.isPickerDisplayed) {
            return;
        }
        this.setValue(this.currentList[this.highlightedItem], false, true);
    };
    AgRichSelect.prototype.onListValueSelected = function (value, fromEnterKey) {
        this.setValue(value, false, true);
        this.dispatchPickerEvent(value, fromEnterKey);
        this.hidePicker();
    };
    AgRichSelect.prototype.dispatchPickerEvent = function (value, fromEnterKey) {
        var event = {
            type: Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey: fromEnterKey,
            value: value
        };
        this.dispatchEvent(event);
    };
    AgRichSelect.prototype.getFocusableElement = function () {
        var allowTyping = this.config.allowTyping;
        if (allowTyping) {
            return this.eInput.getFocusableElement();
        }
        return _super.prototype.getFocusableElement.call(this);
    };
    AgRichSelect.prototype.onKeyDown = function (event) {
        var key = event.key;
        var allowTyping = this.config.allowTyping;
        switch (key) {
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                if (!allowTyping) {
                    event.preventDefault();
                }
                break;
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_DOWN:
                event.preventDefault();
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
            case KeyCode.ESCAPE:
                if (this.isPickerDisplayed) {
                    if (isVisible(this.listComponent.getGui())) {
                        event.preventDefault();
                        stopPropagationForAgGrid(event);
                    }
                    this.hidePicker();
                }
                break;
            case KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case KeyCode.TAB:
                this.onTabKeyDown();
                break;
            default:
                if (!allowTyping) {
                    this.buildSearchStringFromKeyboardEvent(event);
                }
        }
    };
    AgRichSelect.prototype.destroy = function () {
        if (this.listComponent) {
            this.destroyBean(this.listComponent);
            this.listComponent = undefined;
        }
        this.eLoading = undefined;
        _super.prototype.destroy.call(this);
    };
    __decorate([
        Autowired('userComponentFactory')
    ], AgRichSelect.prototype, "userComponentFactory", void 0);
    __decorate([
        RefSelector('eInput')
    ], AgRichSelect.prototype, "eInput", void 0);
    return AgRichSelect;
}(AgPickerField));
export { AgRichSelect };
