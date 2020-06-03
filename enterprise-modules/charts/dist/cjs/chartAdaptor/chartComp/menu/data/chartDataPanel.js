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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var chartController_1 = require("../../chartController");
var ChartDataPanel = /** @class */ (function (_super) {
    __extends(ChartDataPanel, _super);
    function ChartDataPanel(chartController) {
        var _this = _super.call(this, ChartDataPanel.TEMPLATE) || this;
        _this.columnComps = new Map();
        _this.chartController = chartController;
        return _this;
    }
    ChartDataPanel.prototype.init = function () {
        this.updatePanels();
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, this.updatePanels.bind(this));
    };
    ChartDataPanel.prototype.destroy = function () {
        this.clearComponents();
        _super.prototype.destroy.call(this);
    };
    ChartDataPanel.prototype.updatePanels = function () {
        var _this = this;
        var currentChartType = this.chartType;
        var _a = this.chartController.getColStateForMenu(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
        var colIds = dimensionCols.map(function (c) { return c.colId; }).concat(valueCols.map(function (c) { return c.colId; }));
        this.chartType = this.chartController.getChartType();
        if (core_1._.areEqual(core_1._.keys(this.columnComps), colIds) && this.chartType === currentChartType) {
            // if possible, we just update existing components
            __spreadArrays(dimensionCols, valueCols).forEach(function (col) {
                _this.columnComps.get(col.colId).setValue(col.selected, true);
            });
            if (this.chartController.isActiveXYChart()) {
                var getSeriesLabel_1 = this.generateGetSeriesLabel();
                valueCols.forEach(function (col) {
                    _this.columnComps.get(col.colId).setLabel(getSeriesLabel_1(col));
                });
            }
        }
        else {
            // otherwise we re-create everything
            this.clearComponents();
            this.createCategoriesGroupComponent(dimensionCols);
            this.createSeriesGroupComponent(valueCols);
        }
    };
    ChartDataPanel.prototype.addComponent = function (parent, component) {
        var eDiv = document.createElement('div');
        eDiv.className = 'ag-chart-data-section';
        eDiv.appendChild(component.getGui());
        parent.appendChild(eDiv);
    };
    ChartDataPanel.prototype.addChangeListener = function (component, columnState) {
        var _this = this;
        this.addManagedListener(component, core_1.AgAbstractField.EVENT_CHANGED, function () {
            columnState.selected = component.getValue();
            _this.chartController.updateForPanelChange(columnState);
        });
    };
    ChartDataPanel.prototype.createCategoriesGroupComponent = function (columns) {
        var _this = this;
        this.categoriesGroupComp = this.createBean(new core_1.AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        var inputName = "chartDimension" + this.getCompId();
        columns.forEach(function (col) {
            var comp = _this.categoriesGroupComp.createManagedBean(new core_1.AgRadioButton());
            comp.setLabel(core_1._.escape(col.displayName));
            comp.setValue(col.selected);
            comp.setInputName(inputName);
            _this.addChangeListener(comp, col);
            _this.categoriesGroupComp.addItem(comp);
            _this.columnComps.set(col.colId, comp);
        });
        this.addComponent(this.getGui(), this.categoriesGroupComp);
    };
    ChartDataPanel.prototype.createSeriesGroupComponent = function (columns) {
        var _this = this;
        this.seriesGroupComp = this.createManagedBean(new core_1.AgGroupComponent({
            title: this.getSeriesGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        if (this.chartController.isActiveXYChart()) {
            var pairedModeToggle = this.seriesGroupComp.createManagedBean(new core_1.AgToggleButton());
            var chartProxy_1 = this.chartController.getChartProxy();
            pairedModeToggle
                .setLabel(this.chartTranslator.translate('paired'))
                .setLabelAlignment('left')
                .setLabelWidth('flex')
                .setInputWidth(45)
                .setValue(chartProxy_1.getSeriesOption('paired') || false)
                .onValueChange(function (newValue) {
                chartProxy_1.setSeriesOption('paired', newValue);
                _this.chartController.updateForGridChange();
            });
            this.seriesGroupComp.addItem(pairedModeToggle);
        }
        var getSeriesLabel = this.generateGetSeriesLabel();
        columns.forEach(function (col) {
            var comp = _this.seriesGroupComp.createManagedBean(new core_1.AgCheckbox());
            comp.addCssClass('ag-data-select-checkbox');
            var label = getSeriesLabel(col);
            comp.setLabel(label);
            comp.setValue(col.selected);
            _this.addChangeListener(comp, col);
            _this.seriesGroupComp.addItem(comp);
            _this.columnComps.set(col.colId, comp);
            _this.addDragHandle(comp, col);
        });
        this.addComponent(this.getGui(), this.seriesGroupComp);
        var dropTarget = {
            getContainer: this.getGui.bind(this),
            onDragging: this.onDragging.bind(this),
            isInterestedIn: this.isInterestedIn.bind(this),
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    };
    ChartDataPanel.prototype.addDragHandle = function (comp, col) {
        var _this = this;
        var eDragHandle = core_1._.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        core_1._.addCssClass(eDragHandle, 'ag-drag-handle');
        core_1._.addCssClass(eDragHandle, 'ag-chart-data-column-drag-handle');
        comp.getGui().insertAdjacentElement('beforeend', eDragHandle);
        var dragSource = {
            type: core_1.DragSourceType.ChartPanel,
            eElement: eDragHandle,
            dragItemName: col.displayName,
            defaultIconName: core_1.DragAndDropService.ICON_MOVE,
            getDragItem: function () { return ({ columns: [col.column] }); },
            onDragStopped: function () { _this.insertIndex = undefined; }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    ChartDataPanel.prototype.generateGetSeriesLabel = function () {
        if (!this.chartController.isActiveXYChart()) {
            return function (col) { return core_1._.escape(col.displayName); };
        }
        var isBubble = this.chartType === core_1.ChartType.Bubble;
        var isInPairedMode = this.isInPairedMode();
        var selectedValuesCount = 0;
        var indexToAxisLabel = new Map();
        indexToAxisLabel.set(0, 'X');
        indexToAxisLabel.set(1, 'Y');
        indexToAxisLabel.set(2, 'size');
        return function (col) {
            var escapedLabel = core_1._.escape(col.displayName);
            if (!col.selected) {
                return escapedLabel;
            }
            var axisLabel;
            if (isInPairedMode) {
                axisLabel = indexToAxisLabel.get(selectedValuesCount % (isBubble ? 3 : 2));
            }
            else {
                if (selectedValuesCount === 0) {
                    axisLabel = 'X';
                }
                else {
                    axisLabel = isBubble && selectedValuesCount % 2 === 0 ? 'size' : 'Y';
                }
            }
            selectedValuesCount++;
            return escapedLabel + " (" + axisLabel + ")";
        };
    };
    ChartDataPanel.prototype.getCategoryGroupTitle = function () {
        return this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    };
    ChartDataPanel.prototype.getSeriesGroupTitle = function () {
        return this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    };
    ChartDataPanel.prototype.isInPairedMode = function () {
        return this.chartController.isActiveXYChart() && this.chartController.getChartProxy().getSeriesOption('paired');
    };
    ChartDataPanel.prototype.clearComponents = function () {
        core_1._.clearElement(this.getGui());
        this.categoriesGroupComp = this.destroyBean(this.categoriesGroupComp);
        this.seriesGroupComp = this.destroyBean(this.seriesGroupComp);
        this.columnComps.clear();
    };
    ChartDataPanel.prototype.onDragging = function (draggingEvent) {
        var _this = this;
        if (this.checkInsertIndex(draggingEvent)) {
            var column_1 = draggingEvent.dragItem.columns[0];
            var _a = this.chartController.getColStateForMenu(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
            __spreadArrays(dimensionCols, valueCols).filter(function (state) { return state.column === column_1; })
                .forEach(function (state) {
                state.order = _this.insertIndex;
                _this.chartController.updateForPanelChange(state);
            });
        }
    };
    ChartDataPanel.prototype.checkInsertIndex = function (draggingEvent) {
        if (core_1._.missing(draggingEvent.vDirection)) {
            return false;
        }
        var newIndex = 0;
        var mouseEvent = draggingEvent.event;
        this.columnComps.forEach(function (comp) {
            var rect = comp.getGui().getBoundingClientRect();
            var verticalFit = mouseEvent.clientY >= (draggingEvent.vDirection === core_1.VerticalDirection.Down ? rect.top : rect.bottom);
            if (verticalFit) {
                newIndex++;
            }
        });
        var changed = this.insertIndex !== undefined && newIndex !== this.insertIndex;
        this.insertIndex = newIndex;
        return changed;
    };
    ChartDataPanel.prototype.isInterestedIn = function (type) {
        return type === core_1.DragSourceType.ChartPanel;
    };
    ChartDataPanel.TEMPLATE = "<div class=\"ag-chart-data-wrapper\"></div>";
    __decorate([
        core_1.Autowired('dragAndDropService')
    ], ChartDataPanel.prototype, "dragAndDropService", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], ChartDataPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('chartTranslator')
    ], ChartDataPanel.prototype, "chartTranslator", void 0);
    __decorate([
        core_1.PostConstruct
    ], ChartDataPanel.prototype, "init", null);
    return ChartDataPanel;
}(core_1.Component));
exports.ChartDataPanel = ChartDataPanel;
//# sourceMappingURL=chartDataPanel.js.map