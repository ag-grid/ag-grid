// ag-grid-enterprise v21.0.1
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
var chartController_1 = require("../chartController");
var ChartDataPanel = /** @class */ (function (_super) {
    __extends(ChartDataPanel, _super);
    function ChartDataPanel(chartModel) {
        var _this = _super.call(this, ChartDataPanel.TEMPLATE) || this;
        _this.columnComps = {};
        _this.dimensionComps = [];
        _this.chartController = chartModel;
        return _this;
    }
    ChartDataPanel.prototype.init = function () {
        this.createDataGroupElements();
        this.addDestroyableEventListener(this.chartController, chartController_1.ChartController.EVENT_CHART_MODEL_UPDATED, this.createDataGroupElements.bind(this));
    };
    ChartDataPanel.prototype.createDataGroupElements = function () {
        var _this = this;
        this.destroyColumnComps();
        var eGui = this.getGui();
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var _a = this.chartController.getColStateForMenu(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
        [dimensionCols, valueCols].forEach(function (group, idx) {
            var isCategory = idx === 0;
            var groupComp = new ag_grid_community_1.AgGroupComponent({
                label: isCategory
                    ? localeTextFunc('chartCategories', 'Categories')
                    : localeTextFunc('chartSeries', 'Series')
            });
            _this.getContext().wireBean(groupComp);
            group.forEach(_this.getColumnStateMapper(isCategory, groupComp));
            eGui.appendChild(groupComp.getGui());
        });
    };
    ChartDataPanel.prototype.getColumnStateMapper = function (dimension, container) {
        var _this = this;
        var checkboxChanged = function (updatedColState) { return _this.chartController.updateForMenuChange(updatedColState); };
        var radioButtonChanged = function (radioComp, updatedColState) {
            _this.dimensionComps.forEach(function (comp) { return comp.select(false); });
            _this.chartController.updateForMenuChange(updatedColState);
            radioComp.select(true);
        };
        return function (colState) {
            var comp = dimension
                ? new ag_grid_community_1.AgRadioButton()
                : new ag_grid_community_1.AgCheckbox();
            _this.getContext().wireBean(comp);
            comp.setLabel(ag_grid_community_1._.escape(colState.displayName));
            comp.setSelected(colState.selected);
            _this.columnComps[colState.colId] = comp;
            if (dimension) {
                _this.dimensionComps.push(comp);
            }
            _this.addDestroyableEventListener(comp, 'change', function () {
                colState.selected = comp.isSelected();
                if (dimension) {
                    radioButtonChanged(comp, colState);
                }
                else {
                    checkboxChanged(colState);
                }
            });
            container.addItem(comp);
        };
    };
    ChartDataPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.destroyColumnComps();
    };
    ChartDataPanel.prototype.destroyColumnComps = function () {
        ag_grid_community_1._.clearElement(this.getGui());
        if (this.columnComps) {
            ag_grid_community_1._.iterateObject(this.columnComps, function (key, renderedItem) { return renderedItem.destroy(); });
        }
        this.columnComps = {};
    };
    ChartDataPanel.TEMPLATE = "<div class=\"ag-chart-data-wrapper\"></div>";
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ChartDataPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartDataPanel.prototype, "init", null);
    return ChartDataPanel;
}(ag_grid_community_1.Component));
exports.ChartDataPanel = ChartDataPanel;
