var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgAbstractField, AgCheckbox, AgGroupComponent, AgRadioButton, AgSelect, AgToggleButton, AutoScrollService, Autowired, Component, DragAndDropService, DragSourceType, PostConstruct } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
const DefaultDataPanelDef = {
    groups: [
        { type: 'categories', isOpen: true },
        { type: 'series', isOpen: true },
        { type: 'seriesChartType', isOpen: true }
    ]
};
export class ChartDataPanel extends Component {
    constructor(chartController, chartOptionsService) {
        super(ChartDataPanel.TEMPLATE);
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.columnComps = new Map();
    }
    init() {
        this.updatePanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, this.updatePanels.bind(this));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.updatePanels.bind(this));
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
            // recreate series chart type group if it exists as series may be added or removed via series group panel
            _.removeFromParent(this.getGui().querySelector('#seriesChartTypeGroup'));
            this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
            const seriesChartTypeIndex = (_a = this.getDataPanelDef().groups) === null || _a === void 0 ? void 0 : _a.reduce((prevVal, { type }, index) => {
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
        this.autoScrollService = new AutoScrollService({
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
        const eGui = this.getGui();
        const seriesGroupGui = this.seriesGroupComp.getGui();
        this.addComponent(eGui, this.seriesGroupComp, 'seriesGroup');
        const dropTarget = {
            getIconName: () => DragAndDropService.ICON_MOVE,
            getContainer: () => seriesGroupGui,
            onDragging: (params) => this.onDragging(params),
            onDragLeave: () => this.onDragLeave(),
            isInterestedIn: this.isInterestedIn.bind(this),
            targetContainsSource: true
        };
        this.dragAndDropService.addDropTarget(dropTarget);
        this.addDestroyFunc(() => this.dragAndDropService.removeDropTarget(dropTarget));
    }
    createSeriesChartTypeGroup(columns, index) {
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
        const seriesChartTypes = this.chartController.getSeriesChartTypes();
        columns.forEach(col => {
            if (!col.selected) {
                return;
            }
            const seriesChartType = seriesChartTypes.filter(s => s.colId === col.colId)[0];
            if (!seriesChartType) {
                return;
            }
            const seriesItemGroup = this.seriesChartTypeGroupComp.createManagedBean(new AgGroupComponent({
                title: col.displayName,
                enabled: true,
                suppressEnabledCheckbox: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-format-sub-level'
            }));
            const secondaryAxisComp = this.seriesChartTypeGroupComp
                .createManagedBean(new AgCheckbox())
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
            const chartTypeComp = seriesItemGroup.createManagedBean(new AgSelect());
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
        const eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsService);
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
    getDataPanelDef() {
        var _a;
        const userProvidedDataPanelDef = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.dataPanel;
        return userProvidedDataPanelDef ? userProvidedDataPanelDef : DefaultDataPanelDef;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnREYXRhUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2RhdGEvY2hhcnREYXRhUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxlQUFlLEVBQ2YsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixhQUFhLEVBQ2IsUUFBUSxFQUNSLGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsU0FBUyxFQUtULFNBQVMsRUFDVCxrQkFBa0IsRUFHbEIsY0FBYyxFQUVkLGFBQWEsRUFFaEIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFLeEQsTUFBTSxtQkFBbUIsR0FBdUI7SUFDNUMsTUFBTSxFQUFFO1FBQ0osRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7UUFDcEMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7UUFDaEMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtLQUM1QztDQUNKLENBQUM7QUFFRixNQUFNLE9BQU8sY0FBZSxTQUFRLFNBQVM7SUFlekMsWUFDcUIsZUFBZ0MsRUFDaEMsbUJBQXdDO1FBQ3pELEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFGZCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQVByRCxnQkFBVyxHQUE0QyxJQUFJLEdBQUcsRUFBc0MsQ0FBQztJQVM3RyxDQUFDO0lBR00sSUFBSTtRQUNQLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLENB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