var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgAbstractField, AgCheckbox, AgGroupComponent, AgRadioButton, AgToggleButton, Autowired, Component, DragAndDropService, DragSourceType, PostConstruct, AutoScrollService } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
export class ChartDataPanel extends Component {
    constructor(chartController, chartOptionsService) {
        super(ChartDataPanel.TEMPLATE);
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.columnComps = new Map();
    }
    init() {
        this.updatePanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.updatePanels.bind(this));
        this.createAutoScrollService();
    }
    destroy() {
        this.clearComponents();
        super.destroy();
    }
    updatePanels() {
        const currentChartType = this.chartType;
        const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
        const colIds = dimensionCols.map(c => c.colId).concat(valueCols.map(c => c.colId));
        this.chartType = this.chartController.getChartType();
        const groupExpandedState = this.getGroupExpandedState();
        if (_.areEqual(_.keys(this.columnComps), colIds) && this.chartType === currentChartType) {
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
        }
        else {
            // otherwise we re-create everything
            this.clearComponents();
            this.createCategoriesGroup(dimensionCols);
            this.createSeriesGroup(valueCols);
        }
        this.restoreGroupExpandedState(groupExpandedState);
    }
    getGroupExpandedState() {
        return [
            this.categoriesGroupComp,
            this.seriesGroupComp,
            this.seriesChartTypeGroupComp
        ].map(group => !group ? true : group.isExpanded());
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
        this.autoScrollService = new AutoScrollService({
            scrollContainer: eGui,
            scrollAxis: 'y',
            getVerticalPosition: () => eGui.scrollTop,
            setVerticalPosition: (position) => eGui.scrollTop = position
        });
    }
    addComponent(parent, component, id) {
        const eDiv = document.createElement('div');
        eDiv.id = id;
        eDiv.className = 'ag-chart-data-section';
        eDiv.appendChild(component.getGui());
        parent.appendChild(eDiv);
    }
    addChangeListener(component, columnState) {
        this.addManagedListener(component, AgAbstractField.EVENT_CHANGED, () => {
            columnState.selected = component.getValue();
            this.chartController.updateForPanelChange(columnState);
        });
    }
    createCategoriesGroup(columns) {
        this.categoriesGroupComp = this.createBean(new AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        const inputName = `chartDimension${this.getCompId()}`;
        columns.forEach(col => {
            const comp = this.categoriesGroupComp.createManagedBean(new AgRadioButton());
            comp.setLabel(_.escapeString(col.displayName));
            comp.setValue(col.selected);
            comp.setInputName(inputName);
            this.addChangeListener(comp, col);
            this.categoriesGroupComp.addItem(comp);
            this.columnComps.set(col.colId, comp);
        });
        this.addComponent(this.getGui(), this.categoriesGroupComp, 'categoriesGroup');
    }
    createSeriesGroup(columns) {
        this.seriesGroupComp = this.createManagedBean(new AgGroupComponent({
            title: this.getSeriesGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));
        if (this.chartController.isActiveXYChart()) {
            const pairedModeToggle = this.seriesGroupComp.createManagedBean(new AgToggleButton());
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
            const comp = this.seriesGroupComp.createManagedBean(new AgCheckbox());
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
            getIconName: () => DragAndDropService.ICON_MOVE,
            getContainer: () => this.seriesGroupComp.getGui(),
            onDragging: (params) => this.onDragging(params),
            onDragLeave: () => this.onDragLeave(),
            isInterestedIn: this.isInterestedIn.bind(this),
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    }
    addDragHandle(comp, col) {
        const eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        eDragHandle.classList.add('ag-drag-handle', 'ag-chart-data-column-drag-handle');
        comp.getGui().insertAdjacentElement('beforeend', eDragHandle);
        const dragSource = {
            type: DragSourceType.ChartPanel,
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
            return col => _.escapeString(col.displayName);
        }
        const isBubble = this.chartType === 'bubble';
        const isInPairedMode = this.isInPairedMode();
        let selectedValuesCount = 0;
        const indexToAxisLabel = new Map();
        indexToAxisLabel.set(0, 'X');
        indexToAxisLabel.set(1, 'Y');
        indexToAxisLabel.set(2, 'size');
        return (col) => {
            const escapedLabel = _.escapeString(col.displayName);
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
    isInPairedMode() {
        return this.chartController.isActiveXYChart() && this.chartOptionsService.getSeriesOption('paired', 'scatter');
    }
    clearComponents() {
        _.clearElement(this.getGui());
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
        if (_.missing(draggingEvent.vDirection)) {
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
        return type === DragSourceType.ChartPanel;
    }
}
ChartDataPanel.TEMPLATE = `<div class="ag-chart-data-wrapper ag-scrollable-container"></div>`;
__decorate([
    Autowired('dragAndDropService')
], ChartDataPanel.prototype, "dragAndDropService", void 0);
__decorate([
    Autowired('chartTranslationService')
], ChartDataPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], ChartDataPanel.prototype, "init", null);
//# sourceMappingURL=chartDataPanel.js.map