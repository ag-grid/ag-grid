/**
          * @ag-grid-enterprise/rich-select - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v28.1.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RichSelectRow = /** @class */ (function (_super) {
    __extends$1(RichSelectRow, _super);
    function RichSelectRow(params) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-rich-select-row\" role=\"presentation\"></div>") || this;
        _this.params = params;
        return _this;
    }
    RichSelectRow.prototype.setState = function (value, valueFormatted, selected) {
        var rendererSuccessful = this.populateWithRenderer(value, valueFormatted);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, valueFormatted);
        }
        this.updateSelected(selected);
    };
    RichSelectRow.prototype.updateSelected = function (selected) {
        this.addOrRemoveCssClass('ag-rich-select-row-selected', selected);
    };
    RichSelectRow.prototype.populateWithoutRenderer = function (value, valueFormatted) {
        var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        var valueToRender = valueFormattedExits ? valueFormatted : value;
        if (core._.exists(valueToRender) && valueToRender !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = valueToRender.toString();
        }
        else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    };
    RichSelectRow.prototype.populateWithRenderer = function (value, valueFormatted) {
        var _this = this;
        // bad coder here - we are not populating all values of the cellRendererParams
        var params = {
            value: value,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi()
        };
        var compDetails = this.userComponentFactory.getCellRendererDetails(this.params, params);
        var cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise != null) {
            core._.bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        }
        else {
            this.getGui().innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        if (cellRendererPromise) {
            cellRendererPromise.then(function (childComponent) {
                _this.addDestroyFunc(function () {
                    _this.getContext().destroyBean(childComponent);
                });
            });
            return true;
        }
        return false;
    };
    __decorate$1([
        core.Autowired('userComponentFactory')
    ], RichSelectRow.prototype, "userComponentFactory", void 0);
    return RichSelectRow;
}(core.Component));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RichSelectCellEditor = /** @class */ (function (_super) {
    __extends(RichSelectCellEditor, _super);
    function RichSelectCellEditor() {
        var _this = _super.call(this, RichSelectCellEditor.TEMPLATE) || this;
        _this.selectionConfirmed = false;
        _this.searchString = '';
        return _this;
    }
    RichSelectCellEditor.prototype.init = function (params) {
        this.params = params;
        this.selectedValue = params.value;
        this.originalSelectedValue = params.value;
        this.focusAfterAttached = params.cellStartedEdit;
        var icon = core._.createIconNoSpan('smallDown', this.gridOptionsWrapper);
        icon.classList.add('ag-rich-select-value-icon');
        this.eValue.appendChild(icon);
        this.virtualList = this.getContext().createBean(new core.VirtualList('rich-select'));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());
        if (core._.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }
        this.renderSelectedValue();
        if (core._.missing(params.values)) {
            console.warn('AG Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        var values = params.values;
        this.virtualList.setModel({
            getRowCount: function () { return values.length; },
            getRow: function (index) { return values[index]; }
        });
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        var virtualListGui = this.virtualList.getGui();
        this.addManagedListener(virtualListGui, 'click', this.onClick.bind(this));
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));
        var debounceDelay = core._.exists(params.searchDebounceDelay) ? params.searchDebounceDelay : 300;
        this.clearSearchString = core._.debounce(this.clearSearchString, debounceDelay);
        if (core._.exists(params.charPress)) {
            this.searchText(params.charPress);
        }
    };
    RichSelectCellEditor.prototype.onKeyDown = function (event) {
        var key = event.key;
        event.preventDefault();
        switch (key) {
            case core.KeyCode.ENTER:
                this.onEnterKeyDown();
                break;
            case core.KeyCode.TAB:
                this.confirmSelection();
                break;
            case core.KeyCode.DOWN:
            case core.KeyCode.UP:
                this.onNavigationKeyPressed(event, key);
                break;
            default:
                this.searchText(event);
        }
    };
    RichSelectCellEditor.prototype.confirmSelection = function () {
        this.selectionConfirmed = true;
    };
    RichSelectCellEditor.prototype.onEnterKeyDown = function () {
        this.confirmSelection();
        this.params.stopEditing();
    };
    RichSelectCellEditor.prototype.onNavigationKeyPressed = function (event, key) {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        var oldIndex = this.params.values.indexOf(this.selectedValue);
        var newIndex = key === core.KeyCode.UP ? oldIndex - 1 : oldIndex + 1;
        if (newIndex >= 0 && newIndex < this.params.values.length) {
            var valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    };
    RichSelectCellEditor.prototype.searchText = function (key) {
        if (typeof key !== 'string') {
            var keyString = key.key;
            if (keyString === core.KeyCode.BACKSPACE) {
                this.searchString = this.searchString.slice(0, -1);
                keyString = '';
            }
            else if (!core._.isEventFromPrintableCharacter(key)) {
                return;
            }
            this.searchText(keyString);
            return;
        }
        this.searchString += key;
        this.runSearch();
        this.clearSearchString();
    };
    RichSelectCellEditor.prototype.runSearch = function () {
        var _this = this;
        var values = this.params.values;
        var searchStrings;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(String);
        }
        if (typeof values[0] === 'object' && this.params.colDef.keyCreator) {
            searchStrings = values.map(function (value) {
                var keyParams = {
                    value: value,
                    colDef: _this.params.colDef,
                    column: _this.params.column,
                    node: _this.params.node,
                    data: _this.params.data,
                    api: _this.gridOptionsWrapper.getApi(),
                    columnApi: _this.gridOptionsWrapper.getColumnApi(),
                    context: _this.gridOptionsWrapper.getContext()
                };
                return _this.params.colDef.keyCreator(keyParams);
            });
        }
        if (!searchStrings) {
            return;
        }
        var topSuggestion = core._.fuzzySuggestions(this.searchString, searchStrings, true, true)[0];
        if (!topSuggestion) {
            return;
        }
        var topSuggestionIndex = searchStrings.indexOf(topSuggestion);
        var topValue = values[topSuggestionIndex];
        this.setSelectedValue(topValue);
    };
    RichSelectCellEditor.prototype.clearSearchString = function () {
        this.searchString = '';
    };
    RichSelectCellEditor.prototype.renderSelectedValue = function () {
        var _this = this;
        var valueFormatted = this.params.formatValue(this.selectedValue);
        var eValue = this.eValue;
        var params = {
            value: this.selectedValue,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi()
        };
        var compDetails = this.userComponentFactory.getCellRendererDetails(this.params, params);
        var promise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (promise) {
            core._.bindCellRendererToHtmlElement(promise, eValue);
            promise.then(function (renderer) {
                _this.addDestroyFunc(function () { return _this.getContext().destroyBean(renderer); });
            });
        }
        else {
            if (core._.exists(this.selectedValue)) {
                eValue.innerHTML = valueFormatted;
            }
            else {
                core._.clearElement(eValue);
            }
        }
    };
    RichSelectCellEditor.prototype.setSelectedValue = function (value) {
        if (this.selectedValue === value) {
            return;
        }
        var index = this.params.values.indexOf(value);
        if (index === -1) {
            return;
        }
        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);
        this.virtualList.forEachRenderedRow(function (cmp, idx) {
            cmp.updateSelected(index === idx);
        });
        this.virtualList.focusRow(index);
    };
    RichSelectCellEditor.prototype.createRowComponent = function (value) {
        var valueFormatted = this.params.formatValue(value);
        var row = new RichSelectRow(this.params);
        this.getContext().createBean(row);
        row.setState(value, valueFormatted, value === this.selectedValue);
        return row;
    };
    RichSelectCellEditor.prototype.onMouseMove = function (mouseEvent) {
        var rect = this.virtualList.getGui().getBoundingClientRect();
        var scrollTop = this.virtualList.getScrollTop();
        var mouseY = mouseEvent.clientY - rect.top + scrollTop;
        var row = Math.floor(mouseY / this.virtualList.getRowHeight());
        var value = this.params.values[row];
        // not using utils.exist() as want empty string test to pass
        if (value !== undefined) {
            this.setSelectedValue(value);
        }
    };
    RichSelectCellEditor.prototype.onClick = function () {
        this.confirmSelection();
        this.params.stopEditing();
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    RichSelectCellEditor.prototype.afterGuiAttached = function () {
        var selectedIndex = this.params.values.indexOf(this.selectedValue);
        // we have to call this here to get the list to have the right height, ie
        // otherwise it would not have scrolls yet and ensureIndexVisible would do nothing
        this.virtualList.refresh();
        if (selectedIndex >= 0) {
            this.virtualList.ensureIndexVisible(selectedIndex);
        }
        // we call refresh again, as the list could of moved, and we need to render the new rows
        this.virtualList.refresh();
        if (this.focusAfterAttached) {
            var indexToSelect = selectedIndex !== -1 ? selectedIndex : 0;
            if (this.params.values.length) {
                this.virtualList.focusRow(indexToSelect);
            }
            else {
                this.getGui().focus();
            }
        }
    };
    RichSelectCellEditor.prototype.getValue = function () {
        // NOTE: we don't use valueParser for Set Filter. The user should provide values that are to be
        // set into the data. valueParser only really makese sense when the user is typing in text (not picking
        // form a set).
        return this.selectionConfirmed ? this.selectedValue : this.originalSelectedValue;
    };
    // tab index is needed so we can focus, which is needed for keyboard events
    RichSelectCellEditor.TEMPLATE = "<div class=\"ag-rich-select\" tabindex=\"-1\">\n            <div ref=\"eValue\" class=\"ag-rich-select-value\"></div>\n            <div ref=\"eList\" class=\"ag-rich-select-list\"></div>\n        </div>";
    __decorate([
        core.Autowired('userComponentFactory')
    ], RichSelectCellEditor.prototype, "userComponentFactory", void 0);
    __decorate([
        core.RefSelector('eValue')
    ], RichSelectCellEditor.prototype, "eValue", void 0);
    __decorate([
        core.RefSelector('eList')
    ], RichSelectCellEditor.prototype, "eList", void 0);
    return RichSelectCellEditor;
}(core.PopupComponent));

var RichSelectModule = {
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
