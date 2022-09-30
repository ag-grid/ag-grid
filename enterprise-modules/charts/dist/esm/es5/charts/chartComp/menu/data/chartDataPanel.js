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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { _, AgAbstractField, AgCheckbox, AgGroupComponent, AgRadioButton, AgSelect, AgToggleButton, AutoScrollService, Autowired, Component, DragAndDropService, DragSourceType, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
var ChartDataPanel = /** @class */ (function (_super) {
    __extends(ChartDataPanel, _super);
    function ChartDataPanel(chartController, chartOptionsService) {
        var _this = _super.call(this, ChartDataPanel.TEMPLATE) || this;
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.columnComps = new Map();
        return _this;
    }
    ChartDataPanel.prototype.init = function () {
        this.updatePanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, this.updatePanels.bind(this));
        this.createAutoScrollService();
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
        var groupExpandedState = this.getGroupExpandedState();
        if (_.areEqual(_.keys(this.columnComps), colIds) && this.chartType === currentChartType) {
            // if possible, we just update existing components
            __spread(dimensionCols, valueCols).forEach(function (col) {
                _this.columnComps.get(col.colId).setValue(col.selected, true);
            });
            if (this.chartController.isActiveXYChart()) {
                var getSeriesLabel_1 = this.generateGetSeriesLabel();
                valueCols.forEach(function (col) {
                    _this.columnComps.get(col.colId).setLabel(getSeriesLabel_1(col));
                });
            }
            // recreate series chart type group if it exists as series may be added or removed via series group panel
            _.removeFromParent(this.getGui().querySelector('#seriesChartTypeGroup'));
            this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
            this.createSeriesChartTypeGroup(valueCols);
        }
        else {
            // otherwise, we re-create everything
            this.clearComponents();
            this.createCategoriesGroup(dimensionCols);
            this.createSeriesGroup(valueCols);
            this.createSeriesChartTypeGroup(valueCols);
        }
        this.restoreGroupExpandedState(groupExpandedState);
    };
    ChartDataPanel.prototype.getGroupExpandedState = function () {
        return [
            this.categoriesGroupComp,
            this.seriesGroupComp,
            this.seriesChartTypeGroupComp
        ].map(function (group) { return !group ? true : group.isExpanded(); });
    };
    ChartDataPanel.prototype.restoreGroupExpandedState = function (groupExpandedState) {
        [
            this.categoriesGroupComp,
            this.seriesGroupComp,
            this.seriesChartTypeGroupComp
        ].forEach(function (group, idx) {
            if (!group) {
                return;
            }
            group.toggleGroupExpand(groupExpandedState[idx]);
        });
    };
    ChartDataPanel.prototype.createAutoScrollService = function () {
        var eGui = this.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: eGui,
            scrollAxis: 'y',
            getVerticalPosition: function () { return eGui.scrollTop; },
            setVerticalPosition: function (position) { return eGui.scrollTop = position; }
        });
    };
    ChartDataPanel.prototype.addComponent = function (parent, component, id) {
        var eDiv = document.createElement('div');
        eDiv.id = id;
        eDiv.className = 'ag-chart-data-section';
        eDiv.appendChild(component.getGui());
        parent.appendChild(eDiv);
    };
    ChartDataPanel.prototype.addChangeListener = function (component, columnState) {
        var _this = this;
        this.addManagedListener(component, AgAbstractField.EVENT_CHANGED, function () {
            columnState.selected = component.getValue();
            _this.chartController.updateForPanelChange(columnState);
        });
    };
    ChartDataPanel.prototype.createCategoriesGroup = function (columns) {
        var _this = this;
        this.categoriesGroupComp = this.createBean(new AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        var inputName = "chartDimension" + this.getCompId();
        columns.forEach(function (col) {
            var comp = _this.categoriesGroupComp.createManagedBean(new AgRadioButton());
            comp.setLabel(_.escapeString(col.displayName));
            comp.setValue(col.selected);
            comp.setInputName(inputName);
            _this.addChangeListener(comp, col);
            _this.categoriesGroupComp.addItem(comp);
            _this.columnComps.set(col.colId, comp);
        });
        this.addComponent(this.getGui(), this.categoriesGroupComp, 'categoriesGroup');
    };
    ChartDataPanel.prototype.createSeriesGroup = function (columns) {
        var _this = this;
        this.seriesGroupComp = this.createManagedBean(new AgGroupComponent({
            title: this.getSeriesGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        if (this.chartController.isActiveXYChart()) {
            var pairedModeToggle = this.seriesGroupComp.createManagedBean(new AgToggleButton());
            pairedModeToggle
                .setLabel(this.chartTranslationService.translate('paired'))
                .setLabelAlignment('left')
                .setLabelWidth('flex')
                .setInputWidth(45)
                .setValue(this.chartOptionsService.getPairedMode())
                .onValueChange(function (newValue) {
                _this.chartOptionsService.setPairedMode(!!newValue);
                _this.chartController.updateForGridChange();
            });
            this.seriesGroupComp.addItem(pairedModeToggle);
        }
        var getSeriesLabel = this.generateGetSeriesLabel();
        columns.forEach(function (col) {
            var comp = _this.seriesGroupComp.createManagedBean(new AgCheckbox());
            comp.addCssClass('ag-data-select-checkbox');
            var label = getSeriesLabel(col);
            comp.setLabel(label);
            comp.setValue(col.selected);
            _this.addChangeListener(comp, col);
            _this.seriesGroupComp.addItem(comp);
            _this.columnComps.set(col.colId, comp);
            _this.addDragHandle(comp, col);
        });
        this.addComponent(this.getGui(), this.seriesGroupComp, 'seriesGroup');
        var dropTarget = {
            getIconName: function () { return DragAndDropService.ICON_MOVE; },
            getContainer: function () { return _this.seriesGroupComp.getGui(); },
            onDragging: function (params) { return _this.onDragging(params); },
            onDragLeave: function () { return _this.onDragLeave(); },
            isInterestedIn: this.isInterestedIn.bind(this),
            targetContainsSource: true
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    };
    ChartDataPanel.prototype.createSeriesChartTypeGroup = function (columns) {
        var _this = this;
        if (!this.chartController.isComboChart()) {
            return;
        }
        this.seriesChartTypeGroupComp = this.createManagedBean(new AgGroupComponent({
            title: this.chartTranslationService.translate('seriesChartType'),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        var seriesChartTypes = this.chartController.getSeriesChartTypes();
        columns.forEach(function (col) {
            if (!col.selected) {
                return;
            }
            var seriesChartType = seriesChartTypes.filter(function (s) { return s.colId === col.colId; })[0];
            if (!seriesChartType) {
                return;
            }
            var seriesItemGroup = _this.seriesChartTypeGroupComp.createManagedBean(new AgGroupComponent({
                title: col.displayName,
                enabled: true,
                suppressEnabledCheckbox: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-format-sub-level'
            }));
            var secondaryAxisComp = _this.seriesChartTypeGroupComp
                .createManagedBean(new AgCheckbox())
                .setLabel(_this.chartTranslationService.translate('secondaryAxis'))
                .setLabelWidth("flex")
                .setDisabled(['groupedColumn', 'stackedColumn', 'stackedArea'].includes(seriesChartType.chartType))
                .setValue(!!seriesChartType.secondaryAxis)
                .onValueChange(function (enabled) { return _this.chartController.updateSeriesChartType(col.colId, undefined, enabled); });
            seriesItemGroup.addItem(secondaryAxisComp);
            var translate = function (key, defaultText) {
                return _this.chartTranslationService.translate(key, defaultText);
            };
            var availableChartTypes = [
                { value: 'line', text: translate('line', 'Line') },
                { value: 'area', text: translate('area', 'Area') },
                { value: 'stackedArea', text: translate('stackedArea', 'StackedArea') },
                { value: 'groupedColumn', text: translate('groupedColumn', 'Grouped Column') },
                { value: 'stackedColumn', text: translate('stackedColumn', 'Stacked Column') },
            ];
            var chartTypeComp = seriesItemGroup.createManagedBean(new AgSelect());
            chartTypeComp
                .setLabelAlignment('left')
                .setLabelWidth("flex")
                .addOptions(availableChartTypes)
                .setValue(seriesChartType.chartType)
                .onValueChange(function (chartType) { return _this.chartController.updateSeriesChartType(col.colId, chartType); });
            seriesItemGroup.addItem(chartTypeComp);
            _this.seriesChartTypeGroupComp.addItem(seriesItemGroup);
        });
        this.addComponent(this.getGui(), this.seriesChartTypeGroupComp, 'seriesChartTypeGroup');
    };
    ChartDataPanel.prototype.addDragHandle = function (comp, col) {
        var _this = this;
        var eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        eDragHandle.classList.add('ag-drag-handle', 'ag-chart-data-column-drag-handle');
        comp.getGui().insertAdjacentElement('beforeend', eDragHandle);
        var dragSource = {
            type: DragSourceType.ChartPanel,
            eElement: eDragHandle,
            dragItemName: col.displayName,
            getDragItem: function () { return ({ columns: [col.column] }); },
            onDragStopped: function () { return _this.onDragStop(); }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    ChartDataPanel.prototype.generateGetSeriesLabel = function () {
        if (!this.chartController.isActiveXYChart()) {
            return function (col) { return _.escapeString(col.displayName); };
        }
        var isBubble = this.chartType === 'bubble';
        var isInPairedMode = this.isInPairedMode();
        var selectedValuesCount = 0;
        var indexToAxisLabel = new Map();
        indexToAxisLabel.set(0, 'X');
        indexToAxisLabel.set(1, 'Y');
        indexToAxisLabel.set(2, 'size');
        return function (col) {
            var escapedLabel = _.escapeString(col.displayName);
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
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    };
    ChartDataPanel.prototype.getSeriesGroupTitle = function () {
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    };
    ChartDataPanel.prototype.isInPairedMode = function () {
        return this.chartController.isActiveXYChart() && this.chartOptionsService.getSeriesOption('paired', 'scatter');
    };
    ChartDataPanel.prototype.clearComponents = function () {
        _.clearElement(this.getGui());
        this.categoriesGroupComp = this.destroyBean(this.categoriesGroupComp);
        this.seriesGroupComp = this.destroyBean(this.seriesGroupComp);
        this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
        this.columnComps.clear();
    };
    ChartDataPanel.prototype.onDragging = function (draggingEvent) {
        var itemHovered = this.checkHoveredItem(draggingEvent);
        if (!itemHovered) {
            return;
        }
        this.lastDraggedColumn = draggingEvent.dragItem.columns[0];
        var comp = itemHovered.comp, position = itemHovered.position;
        var _a = this.lastHoveredItem || {}, lastHoveredComp = _a.comp, lastHoveredPosition = _a.position;
        if (comp === lastHoveredComp && position === lastHoveredPosition) {
            return;
        }
        this.autoScrollService.check(draggingEvent.event);
        this.clearHoveredItems();
        this.lastHoveredItem = { comp: comp, position: position };
        var eGui = comp.getGui();
        eGui.classList.add('ag-list-item-hovered', "ag-item-highlight-" + position);
    };
    ChartDataPanel.prototype.checkHoveredItem = function (draggingEvent) {
        var e_1, _a;
        if (_.missing(draggingEvent.vDirection)) {
            return null;
        }
        var mouseEvent = draggingEvent.event;
        try {
            for (var _b = __values(this.columnComps.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var comp = _c.value;
                var eGui = comp.getGui();
                if (!eGui.querySelector('.ag-chart-data-column-drag-handle')) {
                    continue;
                }
                var rect = eGui.getBoundingClientRect();
                var isOverComp = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;
                if (isOverComp) {
                    var height = eGui.clientHeight;
                    var position = mouseEvent.clientY > rect.top + (height / 2) ? 'bottom' : 'top';
                    return { comp: comp, position: position };
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    };
    ChartDataPanel.prototype.onDragLeave = function () {
        this.clearHoveredItems();
    };
    ChartDataPanel.prototype.onDragStop = function () {
        var _this = this;
        if (this.lastHoveredItem) {
            var _a = this.chartController.getColStateForMenu(), dimensionCols = _a.dimensionCols, valueCols = _a.valueCols;
            var draggedColumnState = __spread(dimensionCols, valueCols).find(function (state) { return state.column === _this.lastDraggedColumn; });
            if (draggedColumnState) {
                var targetIndex = Array.from(this.columnComps.values()).indexOf(this.lastHoveredItem.comp);
                if (this.lastHoveredItem.position === 'bottom') {
                    targetIndex++;
                }
                draggedColumnState.order = targetIndex;
                this.chartController.updateForPanelChange(draggedColumnState);
            }
        }
        this.clearHoveredItems();
        this.lastDraggedColumn = undefined;
        this.autoScrollService.ensureCleared();
    };
    ChartDataPanel.prototype.clearHoveredItems = function () {
        this.columnComps.forEach(function (columnComp) {
            columnComp.getGui().classList.remove('ag-list-item-hovered', 'ag-item-highlight-top', 'ag-item-highlight-bottom');
        });
        this.lastHoveredItem = undefined;
    };
    ChartDataPanel.prototype.isInterestedIn = function (type) {
        return type === DragSourceType.ChartPanel;
    };
    ChartDataPanel.TEMPLATE = "<div class=\"ag-chart-data-wrapper ag-scrollable-container\"></div>";
    __decorate([
        Autowired('dragAndDropService')
    ], ChartDataPanel.prototype, "dragAndDropService", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], ChartDataPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], ChartDataPanel.prototype, "init", null);
    return ChartDataPanel;
}(Component));
export { ChartDataPanel };
