// ag-grid-enterprise v21.2.2
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var SetFilterListItem = /** @class */ (function (_super) {
    __extends(SetFilterListItem, _super);
    function SetFilterListItem(value, column) {
        var _this = _super.call(this, SetFilterListItem.TEMPLATE) || this;
        _this.selected = true;
        _this.value = value;
        _this.column = column;
        return _this;
    }
    SetFilterListItem.prototype.useCellRenderer = function (target, eTarget, params) {
        var cellRendererPromise = this.userComponentFactory.newCellRenderer(target.filterParams, params);
        if (cellRendererPromise != null) {
            ag_grid_community_1._.bindCellRendererToHtmlElement(cellRendererPromise, eTarget);
        }
        else {
            if (params.valueFormatted == null && params.value == null) {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                eTarget.innerText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            }
            else {
                eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
            }
        }
        return cellRendererPromise;
    };
    SetFilterListItem.prototype.init = function () {
        var _this = this;
        this.eCheckedIcon = ag_grid_community_1._.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.column);
        this.eUncheckedIcon = ag_grid_community_1._.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.column);
        this.eCheckbox = this.queryForHtmlElement(".ag-filter-checkbox");
        this.eClickableArea = this.getGui();
        this.updateCheckboxIcon();
        this.render();
        var listener = function (mouseEvent) {
            mouseEvent.preventDefault();
            ag_grid_community_1._.addAgGridEventPath(mouseEvent);
            _this.selected = !_this.selected;
            _this.updateCheckboxIcon();
            var event = {
                type: SetFilterListItem.EVENT_SELECTED
            };
            return _this.dispatchEvent(event);
        };
        this.addDestroyableEventListener(this.eClickableArea, 'click', listener);
    };
    SetFilterListItem.prototype.isSelected = function () {
        return this.selected;
    };
    SetFilterListItem.prototype.setSelected = function (selected) {
        this.selected = selected;
        this.updateCheckboxIcon();
    };
    SetFilterListItem.prototype.updateCheckboxIcon = function () {
        ag_grid_community_1._.clearElement(this.eCheckbox);
        if (this.isSelected()) {
            this.eCheckbox.appendChild(this.eCheckedIcon);
        }
        else {
            this.eCheckbox.appendChild(this.eUncheckedIcon);
        }
    };
    SetFilterListItem.prototype.render = function () {
        var _this = this;
        var valueElement = this.queryForHtmlElement(".ag-filter-value");
        var valueFormatted = this.valueFormatterService.formatValue(this.column, null, null, this.value);
        var colDef = this.column.getColDef();
        var params = {
            value: this.value,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi()
        };
        var componentPromise = this.useCellRenderer(colDef, valueElement, params);
        if (!componentPromise) {
            return;
        }
        componentPromise.then(function (component) {
            if (component && component.destroy) {
                _this.addDestroyFunc(component.destroy.bind(component));
            }
        });
    };
    SetFilterListItem.EVENT_SELECTED = 'selected';
    SetFilterListItem.TEMPLATE = "<label class=\"ag-set-filter-item\">\n            <div class=\"ag-filter-checkbox\"></div>\n            <span class=\"ag-filter-value\"></span>\n        </label>";
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], SetFilterListItem.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueFormatterService'),
        __metadata("design:type", ag_grid_community_1.ValueFormatterService)
    ], SetFilterListItem.prototype, "valueFormatterService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('userComponentFactory'),
        __metadata("design:type", ag_grid_community_1.UserComponentFactory)
    ], SetFilterListItem.prototype, "userComponentFactory", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SetFilterListItem.prototype, "init", null);
    return SetFilterListItem;
}(ag_grid_community_1.Component));
exports.SetFilterListItem = SetFilterListItem;
