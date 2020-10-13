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
import { Autowired, Component, PostConstruct, RefSelector, TooltipFeature, _ } from '@ag-grid-community/core';
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
        this.eCheckbox.onValueChange(function (value) {
            _this.isSelected = value;
            var event = {
                type: SetFilterListItem.EVENT_SELECTION_CHANGED,
                isSelected: value,
            };
            _this.dispatchEvent(event);
        });
    };
    SetFilterListItem.prototype.toggleSelected = function () {
        this.isSelected = !this.isSelected;
        this.eCheckbox.setValue(this.isSelected);
    };
    SetFilterListItem.prototype.render = function () {
        var _a = this.params, column = _a.column, colDef = _a.colDef;
        var value = this.value;
        var formattedValue = null;
        if (typeof value === 'function') {
            value = value();
        }
        else {
            formattedValue = this.getFormattedValue(this.params, column, value);
        }
        if (this.params.showTooltips) {
            this.tooltipText = _.escapeString(formattedValue != null ? formattedValue : value);
            if (_.exists(this.tooltipText)) {
                if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
                    this.getGui().setAttribute('title', this.tooltipText);
                }
                else {
                    this.createManagedBean(new TooltipFeature(this));
                }
            }
        }
        var params = {
            value: value,
            valueFormatted: formattedValue,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        };
        this.renderCell(colDef, params);
    };
    SetFilterListItem.prototype.getTooltipParams = function () {
        return {
            location: 'setFilterValue',
            colDef: this.getComponentHolder(),
            value: this.tooltipText
        };
    };
    SetFilterListItem.prototype.getFormattedValue = function (filterParams, column, value) {
        var formatter = filterParams == null ? null : filterParams.valueFormatter;
        return this.valueFormatterService.formatValue(column, null, null, value, formatter, false);
    };
    SetFilterListItem.prototype.renderCell = function (target, params) {
        var _this = this;
        var filterParams = target.filterParams;
        var cellRendererPromise = this.userComponentFactory.newSetFilterCellRenderer(filterParams, params);
        if (cellRendererPromise == null) {
            var valueToRender = params.valueFormatted == null ? params.value : params.valueFormatted;
            this.eCheckbox.setLabel(valueToRender == null ? this.translate('blanks') : valueToRender);
            return;
        }
        cellRendererPromise.then(function (component) {
            _this.eCheckbox.setLabel(component.getGui());
            _this.addDestroyFunc(function () { return _this.destroyBean(component); });
        });
    };
    SetFilterListItem.prototype.getComponentHolder = function () {
        return this.params.column.getColDef();
    };
    SetFilterListItem.EVENT_SELECTION_CHANGED = 'selectionChanged';
    SetFilterListItem.TEMPLATE = "\n        <div class=\"ag-set-filter-item\">\n            <ag-checkbox ref=\"eCheckbox\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox>\n        </div>";
    __decorate([
        Autowired('gridOptionsWrapper')
    ], SetFilterListItem.prototype, "gridOptionsWrapper", void 0);
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
