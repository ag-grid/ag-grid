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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
var DefaultDataPanelDef = {
    groups: [
        { type: 'categories', isOpen: true },
        { type: 'series', isOpen: true },
        { type: 'seriesChartType', isOpen: true }
    ]
};
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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.updatePanels.bind(this));
        this.createAutoScrollService();
    };
    ChartDataPanel.prototype.destroy = function () {
        this.clearComponents();
        _super.prototype.destroy.call(this);
    };
    ChartDataPanel.prototype.updatePanels = function () {
        var _this = this;
        var _a, _b;
        var currentChartType = this.chartType;
        var _c = this.chartController.getColStateForMenu(), dimensionCols = _c.dimensionCols, valueCols = _c.valueCols;
        var colIds = dimensionCols.map(function (c) { return c.colId; }).concat(valueCols.map(function (c) { return c.colId; }));
        this.chartType = this.chartController.getChartType();
        var groupExpandedState = this.getGroupExpandedState();
        if (_.areEqual(_.keys(this.columnComps), colIds) && this.chartType === currentChartType) {
            // if possible, we just update existing components
            __spreadArray(__spreadArray([], __read(dimensionCols)), __read(valueCols)).forEach(function (col) {
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
            var seriesChartTypeIndex = (_a = this.getDataPanelDef().groups) === null || _a === void 0 ? void 0 : _a.reduce(function (prevVal, _a, index) {
                var type = _a.type;
                if (type === 'seriesChartType') {
                    return index;
                }
                return prevVal;
            }, -1);
            if (seriesChartTypeIndex !== -1) {
                this.createSeriesChartTypeGroup(valueCols, seriesChartTypeIndex);
            }
        }
        else {
            // otherwise, we re-create everything
            this.clearComponents();
            (_b = this.getDataPanelDef().groups) === null || _b === void 0 ? void 0 : _b.forEach(function (_a) {
                var type = _a.type;
                if (type === 'categories') {
                    _this.createCategoriesGroup(dimensionCols);
                }
                else if (type === 'series') {
                    _this.createSeriesGroup(valueCols);
                }
                else if (type === 'seriesChartType') {
                    _this.createSeriesChartTypeGroup(valueCols);
                }
                else {
                    console.warn("AG Grid: invalid charts data panel group name supplied: '" + type + "'");
                }
            });
        }
        this.restoreGroupExpandedState(groupExpandedState);
    };
    ChartDataPanel.prototype.getGroupExpandedState = function () {
        var _this = this;
        var groups = [
            { groupType: 'categories', comp: this.categoriesGroupComp },
            { groupType: 'series', comp: this.seriesGroupComp },
            { groupType: 'seriesChartType', comp: this.seriesChartTypeGroupComp }
        ];
        return groups.map(function (_a) {
            var _b, _c;
            var groupType = _a.groupType, comp = _a.comp;
            var defaultExpanded = Boolean((_c = (_b = _this.getDataPanelDef().groups) === null || _b === void 0 ? void 0 : _b.find(function (_a) {
                var type = _a.type;
                return type === groupType;
            })) === null || _c === void 0 ? void 0 : _c.isOpen);
            return !comp ? defaultExpanded : comp.isExpanded();
        });
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
    ChartDataPanel.prototype.createComponent = function (component, id) {
        var eDiv = document.createElement('div');
        eDiv.id = id;
        eDiv.className = 'ag-chart-data-section';
        eDiv.appendChild(component.getGui());
        return eDiv;
    };
    ChartDataPanel.prototype.addComponent = function (parent, component, id) {
        var eDiv = this.createComponent(component, id);
        parent.appendChild(eDiv);
    };
    ChartDataPanel.prototype.addComponentAtIndex = function (parent, component, id, index) {
        var eDiv = this.createComponent(component, id);
        parent.insertBefore(eDiv, parent.children[index]);
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
        var eGui = this.getGui();
        var seriesGroupGui = this.seriesGroupComp.getGui();
        this.addComponent(eGui, this.seriesGroupComp, 'seriesGroup');
        var dropTarget = {
            getIconName: function () { return DragAndDropService.ICON_MOVE; },
            getContainer: function () { return seriesGroupGui; },
            onDragging: function (params) { return _this.onDragging(params); },
            onDragLeave: function () { return _this.onDragLeave(); },
            isInterestedIn: this.isInterestedIn.bind(this),
            targetContainsSource: true
        };
        this.dragAndDropService.addDropTarget(dropTarget);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDropTarget(dropTarget); });
    };
    ChartDataPanel.prototype.createSeriesChartTypeGroup = function (columns, index) {
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
        if (index === undefined) {
            this.addComponent(this.getGui(), this.seriesChartTypeGroupComp, 'seriesChartTypeGroup');
        }
        else {
            this.addComponentAtIndex(this.getGui(), this.seriesChartTypeGroupComp, 'seriesChartTypeGroup', index);
        }
    };
    ChartDataPanel.prototype.addDragHandle = function (comp, col) {
        var _this = this;
        var eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsService);
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
    ChartDataPanel.prototype.getDataPanelDef = function () {
        var _a;
        var userProvidedDataPanelDef = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.dataPanel;
        return userProvidedDataPanelDef ? userProvidedDataPanelDef : DefaultDataPanelDef;
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
            var draggedColumnState = __spreadArray(__spreadArray([], __read(dimensionCols)), __read(valueCols)).find(function (state) { return state.column === _this.lastDraggedColumn; });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnREYXRhUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2RhdGEvY2hhcnREYXRhUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELGVBQWUsRUFDZixVQUFVLEVBQ1YsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixRQUFRLEVBQ1IsY0FBYyxFQUNkLGlCQUFpQixFQUNqQixTQUFTLEVBS1QsU0FBUyxFQUNULGtCQUFrQixFQUdsQixjQUFjLEVBRWQsYUFBYSxFQUVoQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUt4RCxJQUFNLG1CQUFtQixHQUF1QjtJQUM1QyxNQUFNLEVBQUU7UUFDSixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtRQUNwQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtRQUNoQyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0tBQzVDO0NBQ0osQ0FBQztBQUVGO0lBQW9DLGtDQUFTO0lBZXpDLHdCQUNxQixlQUFnQyxFQUNoQyxtQkFBd0M7UUFGN0QsWUFHSSxrQkFBTSxjQUFjLENBQUMsUUFBUSxDQUFDLFNBQ2pDO1FBSG9CLHFCQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyx5QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBUHJELGlCQUFXLEdBQTRDLElBQUksR0FBRyxFQUFzQyxDQUFDOztJQVM3RyxDQUFDO0lBR00sNkJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJ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