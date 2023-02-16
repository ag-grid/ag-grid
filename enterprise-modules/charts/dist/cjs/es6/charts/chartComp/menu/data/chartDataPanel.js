"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartDataPanel = void 0;
const core_1 = require("@ag-grid-community/core");
const chartController_1 = require("../../chartController");
const DefaultDataPanelDef = {
    groups: [
        { type: 'categories', isOpen: true },
        { type: 'series', isOpen: true },
        { type: 'seriesChartType', isOpen: true }
    ]
};
class ChartDataPanel extends core_1.Component {
    constructor(chartController, chartOptionsService) {
        super(ChartDataPanel.TEMPLATE);
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.columnComps = new Map();
    }
    init() {
        this.updatePanels();
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_MODEL_UPDATE, this.updatePanels.bind(this));
        this.createAutoScrollService();
    }
    destroy() {
        this.clearComponents();
        super.destroy();
    }
    updatePanels() {
        var _a, _b;
        const currentChartType = this.chartType;
        const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
        const colIds = dimensionCols.map(c => c.colId).concat(valueCols.map(c => c.colId));
        this.chartType = this.chartController.getChartType();
        const groupExpandedState = this.getGroupExpandedState();
        if (core_1._.areEqual(core_1._.keys(this.columnComps), colIds) && this.chartType === currentChartType) {
            // if possible, we just update existing components
            [...dimensionCols, ...valueCols].forEach(col => {
                this.columnComps.get(col.colId).setValue(col.selected, true);
            });
            if (this.chartController.isActiveXYChart()) {
                const getSeriesLabel = this.generateGetSeriesLabel();
                valueCols.forEach(col => {
                    this.columnComps.get(col.colId).setLabel(getSeriesLabel(col));
                });
            }
            // recreate series chart type group if it exists as series may be added or removed via series group panel
            core_1._.removeFromParent(this.getGui().querySelector('#seriesChartTypeGroup'));
            this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
            const seriesChartTypeIndex = (_a = this.getDataPanelDef().groups) === null || _a === void 0 ? void 0 : _a.reduce((prevVal, { type }, index) => {
                if (type === 'seriesChartType') {
                    return index;
                }
                ;
                return prevVal;
            }, -1);
            if (seriesChartTypeIndex !== -1) {
                this.createSeriesChartTypeGroup(valueCols, seriesChartTypeIndex);
            }
        }
        else {
            // otherwise, we re-create everything
            this.clearComponents();
            (_b = this.getDataPanelDef().groups) === null || _b === void 0 ? void 0 : _b.forEach(({ type }) => {
                if (type === 'categories') {
                    this.createCategoriesGroup(dimensionCols);
                }
                else if (type === 'series') {
                    this.createSeriesGroup(valueCols);
                }
                else if (type === 'seriesChartType') {
                    this.createSeriesChartTypeGroup(valueCols);
                }
                else {
                    console.warn(`AG Grid: invalid charts data panel group name supplied: '${type}'`);
                }
            });
        }
        this.restoreGroupExpandedState(groupExpandedState);
    }
    getGroupExpandedState() {
        const groups = [
            { groupType: 'categories', comp: this.categoriesGroupComp },
            { groupType: 'series', comp: this.seriesGroupComp },
            { groupType: 'seriesChartType', comp: this.seriesChartTypeGroupComp }
        ];
        return groups.map(({ groupType, comp }) => {
            var _a, _b;
            const defaultExpanded = Boolean((_b = (_a = this.getDataPanelDef().groups) === null || _a === void 0 ? void 0 : _a.find(({ type }) => type === groupType)) === null || _b === void 0 ? void 0 : _b.isOpen);
            return !comp ? defaultExpanded : comp.isExpanded();
        });
    }
    restoreGroupExpandedState(groupExpandedState) {
        [
            this.categoriesGroupComp,
            this.seriesGroupComp,
            this.seriesChartTypeGroupComp
        ].forEach((group, idx) => {
            if (!group) {
                return;
            }
            group.toggleGroupExpand(groupExpandedState[idx]);
        });
    }
    createAutoScrollService() {
        const eGui = this.getGui();
        this.autoScrollService = new core_1.AutoScrollService({
            scrollContainer: eGui,
            scrollAxis: 'y',
            getVerticalPosition: () => eGui.scrollTop,
            setVerticalPosition: (position) => eGui.scrollTop = position
        });
    }
    createComponent(component, id) {
        const eDiv = document.createElement('div');
        eDiv.id = id;
        eDiv.className = 'ag-chart-data-section';
        eDiv.appendChild(component.getGui());
        return eDiv;
    }
    addComponent(parent, component, id) {
        const eDiv = this.createComponent(component, id);
        parent.appendChild(eDiv);
    }
    addComponentAtIndex(parent, component, id, index) {
        const eDiv = this.createComponent(component, id);
        parent.insertBefore(eDiv, parent.children[index]);
    }
    addChangeListener(component, columnState) {
        this.addManagedListener(component, core_1.AgAbstractField.EVENT_CHANGED, () => {
            columnState.selected = component.getValue();
            this.chartController.updateForPanelChange(columnState);
        });
    }
    createCategoriesGroup(columns) {
        this.categoriesGroupComp = this.createBean(new core_1.AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        const inputName = `chartDimension${this.getCompId()}`;
        columns.forEach(col => {
            const comp = this.categoriesGroupComp.createManagedBean(new core_1.AgRadioButton());
            comp.setLabel(core_1._.escapeString(col.displayName));
            comp.setValue(col.selected);
            comp.setInputName(inputName);
            this.addChangeListener(comp, col);
            this.categoriesGroupComp.addItem(comp);
            this.columnComps.set(col.colId, comp);
        });
        this.addComponent(this.getGui(), this.categoriesGroupComp, 'categoriesGroup');
    }
    createSeriesGroup(columns) {
        this.seriesGroupComp = this.createManagedBean(new core_1.AgGroupComponent({
            title: this.getSeriesGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        if (this.chartController.isActiveXYChart()) {
            const pairedModeToggle = this.seriesGroupComp.createManagedBean(new core_1.AgToggleButton());
            pairedModeToggle
                .setLabel(this.chartTranslationService.translate('paired'))
                .setLabelAlignment('left')
                .setLabelWidth('flex')
                .setInputWidth(45)
                .setValue(this.chartOptionsService.getPairedMode())
                .onValueChange(newValue => {
                this.chartOptionsService.setPairedMode(!!newValue);
                this.chartController.updateForGridChange();
            });
            this.seriesGroupComp.addItem(pairedModeToggle);
        }
        const getSeriesLabel = this.generateGetSeriesLabel();
        columns.forEach(col => {
            const comp = this.seriesGroupComp.createManagedBean(new core_1.AgCheckbox());
            comp.addCssClass('ag-data-select-checkbox');
            const label = getSeriesLabel(col);
            comp.setLabel(label);
            comp.setValue(col.selected);
            this.addChangeListener(comp, col);
            this.seriesGroupComp.addItem(comp);
            this.columnComps.set(col.colId, comp);
            this.addDragHandle(comp, col);
        });
        this.addComponent(this.getGui(), this.seriesGroupComp, 'seriesGroup');
        const dropTarget = {
            getIconName: () => core_1.DragAndDropService.ICON_MOVE,
            getContainer: () => this.seriesGroupComp.getGui(),
            onDragging: (params) => this.onDragging(params),
            onDragLeave: () => this.onDragLeave(),
            isInterestedIn: this.isInterestedIn.bind(this),
            targetContainsSource: true
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    }
    createSeriesChartTypeGroup(columns, index) {
        if (!this.chartController.isComboChart()) {
            return;
        }
        this.seriesChartTypeGroupComp = this.createManagedBean(new core_1.AgGroupComponent({
            title: this.chartTranslationService.translate('seriesChartType'),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        const seriesChartTypes = this.chartController.getSeriesChartTypes();
        columns.forEach(col => {
            if (!col.selected) {
                return;
            }
            const seriesChartType = seriesChartTypes.filter(s => s.colId === col.colId)[0];
            if (!seriesChartType) {
                return;
            }
            const seriesItemGroup = this.seriesChartTypeGroupComp.createManagedBean(new core_1.AgGroupComponent({
                title: col.displayName,
                enabled: true,
                suppressEnabledCheckbox: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-format-sub-level'
            }));
            const secondaryAxisComp = this.seriesChartTypeGroupComp
                .createManagedBean(new core_1.AgCheckbox())
                .setLabel(this.chartTranslationService.translate('secondaryAxis'))
                .setLabelWidth("flex")
                .setDisabled(['groupedColumn', 'stackedColumn', 'stackedArea'].includes(seriesChartType.chartType))
                .setValue(!!seriesChartType.secondaryAxis)
                .onValueChange((enabled) => this.chartController.updateSeriesChartType(col.colId, undefined, enabled));
            seriesItemGroup.addItem(secondaryAxisComp);
            const translate = (key, defaultText) => {
                return this.chartTranslationService.translate(key, defaultText);
            };
            const availableChartTypes = [
                { value: 'line', text: translate('line', 'Line') },
                { value: 'area', text: translate('area', 'Area') },
                { value: 'stackedArea', text: translate('stackedArea', 'StackedArea') },
                { value: 'groupedColumn', text: translate('groupedColumn', 'Grouped Column') },
                { value: 'stackedColumn', text: translate('stackedColumn', 'Stacked Column') },
            ];
            const chartTypeComp = seriesItemGroup.createManagedBean(new core_1.AgSelect());
            chartTypeComp
                .setLabelAlignment('left')
                .setLabelWidth("flex")
                .addOptions(availableChartTypes)
                .setValue(seriesChartType.chartType)
                .onValueChange((chartType) => this.chartController.updateSeriesChartType(col.colId, chartType));
            seriesItemGroup.addItem(chartTypeComp);
            this.seriesChartTypeGroupComp.addItem(seriesItemGroup);
        });
        if (index === undefined) {
            this.addComponent(this.getGui(), this.seriesChartTypeGroupComp, 'seriesChartTypeGroup');
        }
        else {
            this.addComponentAtIndex(this.getGui(), this.seriesChartTypeGroupComp, 'seriesChartTypeGroup', index);
        }
    }
    addDragHandle(comp, col) {
        const eDragHandle = core_1._.createIconNoSpan('columnDrag', this.gridOptionsService);
        eDragHandle.classList.add('ag-drag-handle', 'ag-chart-data-column-drag-handle');
        comp.getGui().insertAdjacentElement('beforeend', eDragHandle);
        const dragSource = {
            type: core_1.DragSourceType.ChartPanel,
            eElement: eDragHandle,
            dragItemName: col.displayName,
            getDragItem: () => ({ columns: [col.column] }),
            onDragStopped: () => this.onDragStop()
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }
    generateGetSeriesLabel() {
        if (!this.chartController.isActiveXYChart()) {
            return col => core_1._.escapeString(col.displayName);
        }
        const isBubble = this.chartType === 'bubble';
        const isInPairedMode = this.isInPairedMode();
        let selectedValuesCount = 0;
        const indexToAxisLabel = new Map();
        indexToAxisLabel.set(0, 'X');
        indexToAxisLabel.set(1, 'Y');
        indexToAxisLabel.set(2, 'size');
        return (col) => {
            const escapedLabel = core_1._.escapeString(col.displayName);
            if (!col.selected) {
                return escapedLabel;
            }
            let axisLabel;
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
            return `${escapedLabel} (${axisLabel})`;
        };
    }
    getCategoryGroupTitle() {
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    }
    getSeriesGroupTitle() {
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    }
    getDataPanelDef() {
        var _a;
        const userProvidedDataPanelDef = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.dataPanel;
        return userProvidedDataPanelDef ? userProvidedDataPanelDef : DefaultDataPanelDef;
    }
    isInPairedMode() {
        return this.chartController.isActiveXYChart() && this.chartOptionsService.getSeriesOption('paired', 'scatter');
    }
    clearComponents() {
        core_1._.clearElement(this.getGui());
        this.categoriesGroupComp = this.destroyBean(this.categoriesGroupComp);
        this.seriesGroupComp = this.destroyBean(this.seriesGroupComp);
        this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
        this.columnComps.clear();
    }
    onDragging(draggingEvent) {
        const itemHovered = this.checkHoveredItem(draggingEvent);
        if (!itemHovered) {
            return;
        }
        this.lastDraggedColumn = draggingEvent.dragItem.columns[0];
        const { comp, position } = itemHovered;
        const { comp: lastHoveredComp, position: lastHoveredPosition } = this.lastHoveredItem || {};
        if (comp === lastHoveredComp && position === lastHoveredPosition) {
            return;
        }
        this.autoScrollService.check(draggingEvent.event);
        this.clearHoveredItems();
        this.lastHoveredItem = { comp, position };
        const eGui = comp.getGui();
        eGui.classList.add('ag-list-item-hovered', `ag-item-highlight-${position}`);
    }
    checkHoveredItem(draggingEvent) {
        if (core_1._.missing(draggingEvent.vDirection)) {
            return null;
        }
        const mouseEvent = draggingEvent.event;
        for (const comp of this.columnComps.values()) {
            const eGui = comp.getGui();
            if (!eGui.querySelector('.ag-chart-data-column-drag-handle')) {
                continue;
            }
            const rect = eGui.getBoundingClientRect();
            const isOverComp = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;
            if (isOverComp) {
                const height = eGui.clientHeight;
                const position = mouseEvent.clientY > rect.top + (height / 2) ? 'bottom' : 'top';
                return { comp, position };
            }
        }
        return null;
    }
    onDragLeave() {
        this.clearHoveredItems();
    }
    onDragStop() {
        if (this.lastHoveredItem) {
            const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
            const draggedColumnState = [...dimensionCols, ...valueCols]
                .find(state => state.column === this.lastDraggedColumn);
            if (draggedColumnState) {
                let targetIndex = Array.from(this.columnComps.values()).indexOf(this.lastHoveredItem.comp);
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
    }
    clearHoveredItems() {
        this.columnComps.forEach(columnComp => {
            columnComp.getGui().classList.remove('ag-list-item-hovered', 'ag-item-highlight-top', 'ag-item-highlight-bottom');
        });
        this.lastHoveredItem = undefined;
    }
    isInterestedIn(type) {
        return type === core_1.DragSourceType.ChartPanel;
    }
}
ChartDataPanel.TEMPLATE = `<div class="ag-chart-data-wrapper ag-scrollable-container"></div>`;
__decorate([
    core_1.Autowired('dragAndDropService')
], ChartDataPanel.prototype, "dragAndDropService", void 0);
__decorate([
    core_1.Autowired('chartTranslationService')
], ChartDataPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], ChartDataPanel.prototype, "init", null);
exports.ChartDataPanel = ChartDataPanel;
