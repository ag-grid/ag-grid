var __extends = (this && this.__extends) || (function () {
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from '@ag-grid-community/core';
var SetFilterListItem = /** @class */ (function (_super) {
    __extends(SetFilterListItem, _super);
    function SetFilterListItem(value, params, translate, isSelected) {
        var _this = _super.call(this, SetFilterListItem.TEMPLATE) || this;
        _this.value = value;
        _this.params = params;
        _this.translate = translate;
        _this.isSelected = isSelected;
        return _this;
    }
    SetFilterListItem.prototype.init = function () {
        var _this = this;
        this.render();
        this.eCheckbox.setValue(this.isSelected, true);
        this.eCheckbox.setDisabled(!!this.params.readOnly);
        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }
        this.eCheckbox.onValueChange(function (value) {
            var parsedValue = value || false;
            _this.isSelected = parsedValue;
            var event = {
                type: SetFilterListItem.EVENT_SELECTION_CHANGED,
                isSelected: parsedValue,
            };
            _this.dispatchEvent(event);
        });
    };
    SetFilterListItem.prototype.toggleSelected = function () {
        if (!!this.params.readOnly) {
            return;
        }
        this.isSelected = !this.isSelected;
        this.eCheckbox.setValue(this.isSelected);
    };
    SetFilterListItem.prototype.render = function () {
        var column = this.params.column;
        var value = this.value;
        var formattedValue = null;
        if (typeof value === 'function') {
            value = value();
        }
        else {
            formattedValue = this.getFormattedValue(this.params, column, value);
        }
        if (this.params.showTooltips) {
            var tooltipValue = formattedValue != null ? formattedValue : value;
            this.setTooltip(tooltipValue);
        }
        var params = {
            value: value,
            valueFormatted: formattedValue,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            colDef: this.params.colDef,
            column: this.params.column,
        };
        this.renderCell(params);
    };
    SetFilterListItem.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        return res;
    };
    SetFilterListItem.prototype.getFormattedValue = function (filterParams, column, value) {
        var formatter = filterParams && filterParams.valueFormatter;
        return this.valueFormatterService.formatValue(column, null, value, formatter, false);
    };
    SetFilterListItem.prototype.renderCell = function (params) {
        var _this = this;
        var compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, params);
        var cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise == null) {
            var valueToRender = params.valueFormatted == null ? params.value : params.valueFormatted;
            this.eCheckbox.setLabel(valueToRender == null ? this.translate('blanks') : valueToRender);
            return;
        }
        cellRendererPromise.then(function (component) {
            if (component) {
                _this.eCheckbox.setLabel(component.getGui());
                _this.addDestroyFunc(function () { return _this.destroyBean(component); });
            }
        });
    };
    SetFilterListItem.prototype.getComponentHolder = function () {
        return this.params.column.getColDef();
    };
    SetFilterListItem.EVENT_SELECTION_CHANGED = 'selectionChanged';
    SetFilterListItem.TEMPLATE = "\n        <div class=\"ag-set-filter-item\">\n            <ag-checkbox ref=\"eCheckbox\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox>\n        </div>";
    __decorate([
        Autowired('valueFormatterService')
    ], SetFilterListItem.prototype, "valueFormatterService", void 0);
    __decorate([
        Autowired('userComponentFactory')
    ], SetFilterListItem.prototype, "userComponentFactory", void 0);
    __decorate([
        RefSelector('eCheckbox')
    ], SetFilterListItem.prototype, "eCheckbox", void 0);
    __decorate([
        PostConstruct
    ], SetFilterListItem.prototype, "init", null);
    return SetFilterListItem;
}(Component));
export { SetFilterListItem };
