import {
    _,
    AgAbstractField,
    AgCheckbox,
    AgGroupComponent,
    AgRadioButton,
    AgSelect,
    AgToggleButton,
    AutoScrollService,
    Autowired,
    ChartType,
    ChartDataPanel as ChartDataPanelType,
    Column,
    Component,
    DragAndDropService,
    DraggingEvent,
    DragSource,
    DragSourceType,
    DropTarget,
    PostConstruct,
    SeriesChartType,
    ChartDataPanelGroup
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ColState } from "../../chartDataModel";
import { ChartTranslationService } from "../../services/chartTranslationService";
import { ChartOptionsService } from "../../services/chartOptionsService";

const DefaultDataPanelDef: ChartDataPanelType = {
    groups: [
        { type: 'categories', isOpen: true },
        { type: 'series', isOpen: true },
        { type: 'seriesChartType', isOpen: true }
    ]
};

export class ChartDataPanel extends Component {
    public static TEMPLATE = /* html */ `<div class="ag-chart-data-wrapper ag-scrollable-container"></div>`;

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private autoScrollService: AutoScrollService;
    private categoriesGroupComp?: AgGroupComponent;
    private seriesGroupComp?: AgGroupComponent;
    private seriesChartTypeGroupComp?: AgGroupComponent;
    private columnComps: Map<string, AgRadioButton | AgCheckbox> = new Map<string, AgRadioButton | AgCheckbox>();
    private chartType?: ChartType;
    private lastHoveredItem?: { comp: AgCheckbox, position: 'top' | 'bottom' };
    private lastDraggedColumn?: Column;

    constructor(
        private readonly chartController: ChartController,
        private readonly chartOptionsService: ChartOptionsService) {
        super(ChartDataPanel.TEMPLATE);
    }

    @PostConstruct
    public init() {
        this.updatePanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, this.updatePanels.bind(this));
        this.createAutoScrollService();
    }

    protected destroy(): void {
        this.clearComponents();
        super.destroy();
    }

    private updatePanels() {
        const currentChartType = this.chartType;
        const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
        const colIds = dimensionCols.map(c => c.colId).concat(valueCols.map(c => c.colId));

        this.chartType = this.chartController.getChartType();

        const groupExpandedState = this.getGroupExpandedState();

        if (_.areEqual(_.keys(this.columnComps), colIds) && this.chartType === currentChartType) {
            // if possible, we just update existing components
            [...dimensionCols, ...valueCols].forEach(col => {
                this.columnComps.get(col.colId)!.setValue(col.selected, true);
            });

            if (this.chartController.isActiveXYChart()) {
                const getSeriesLabel = this.generateGetSeriesLabel();

                valueCols.forEach(col => {
                    this.columnComps.get(col.colId)!.setLabel(getSeriesLabel(col));
                });
            }

            // recreate series chart type group if it exists as series may be added or removed via series group panel
            _.removeFromParent(this.getGui().querySelector('#seriesChartTypeGroup'));
            this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);

            const seriesChartTypeIndex = this.getDataPanelDef().groups?.reduce((prevVal, { type }, index) => {
                if (type === 'seriesChartType') {
                    return index;
                };

                return prevVal;
            }, -1);
            if (seriesChartTypeIndex !== -1) {
                this.createSeriesChartTypeGroup(valueCols, seriesChartTypeIndex);
            }
        } else {
            // otherwise, we re-create everything
            this.clearComponents();

            this.getDataPanelDef().groups?.forEach(({ type }) => {
                if (type === 'categories') {
                    this.createCategoriesGroup(dimensionCols);
    
                } else if (type === 'series') {
                    this.createSeriesGroup(valueCols);
    
                } else if (type === 'seriesChartType') {
                    this.createSeriesChartTypeGroup(valueCols);
    
                } else {
                    console.warn(`AG Grid: invalid charts data panel group name supplied: '${type}'`);
                }
            })
        }

        this.restoreGroupExpandedState(groupExpandedState);
    }

    private getGroupExpandedState(): boolean[] {
        const groups: {
            groupType: ChartDataPanelGroup,
            comp?: AgGroupComponent
        }[] = [
            { groupType: 'categories', comp: this.categoriesGroupComp },
            { groupType: 'series', comp: this.seriesGroupComp },
            { groupType: 'seriesChartType', comp: this.seriesChartTypeGroupComp }
        ];

        return groups.map(({ groupType, comp }) => {
            const defaultExpanded = Boolean(this.getDataPanelDef().groups?.find(({ type }) => type === groupType)?.isOpen);
            return !comp ? defaultExpanded : comp.isExpanded()
        });
    }

    private restoreGroupExpandedState(groupExpandedState: boolean[]): void {
        [
            this.categoriesGroupComp,
            this.seriesGroupComp,
            this.seriesChartTypeGroupComp
        ].forEach((group: AgGroupComponent, idx: number) => {
            if (!group) { return; }
            group.toggleGroupExpand(groupExpandedState[idx]);
        });
    }

    private createAutoScrollService(): void {
        const eGui = this.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: eGui,
            scrollAxis: 'y',
            getVerticalPosition: () => eGui.scrollTop,
            setVerticalPosition: (position) => eGui.scrollTop = position
        });
    }

    private createComponent(component: AgGroupComponent, id: string) {
        const eDiv = document.createElement('div');
        eDiv.id = id;
        eDiv.className = 'ag-chart-data-section';
        eDiv.appendChild(component.getGui());

        return eDiv;
    }

    private addComponent(parent: HTMLElement, component: AgGroupComponent, id: string): void {
        const eDiv = this.createComponent(component, id);
        parent.appendChild(eDiv);
    }

    private addComponentAtIndex(parent: HTMLElement, component: AgGroupComponent, id: string, index: number): void {
        const eDiv = this.createComponent(component, id);
        parent.insertBefore(eDiv, parent.children[index]);
    }

    private addChangeListener(component: AgRadioButton | AgCheckbox, columnState: ColState) {
        this.addManagedListener(component, AgAbstractField.EVENT_CHANGED, () => {
            columnState.selected = component.getValue();
            this.chartController.updateForPanelChange(columnState);
        });
    }

    private createCategoriesGroup(columns: ColState[]): void {
        this.categoriesGroupComp = this.createBean(new AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));

        const inputName = `chartDimension${this.getCompId()}`;

        columns.forEach(col => {
            const comp = this.categoriesGroupComp!.createManagedBean(new AgRadioButton());

            comp.setLabel(_.escapeString(col.displayName)!);
            comp.setValue(col.selected);
            comp.setInputName(inputName);

            this.addChangeListener(comp, col);
            this.categoriesGroupComp!.addItem(comp);
            this.columnComps.set(col.colId, comp);
        });

        this.addComponent(this.getGui(), this.categoriesGroupComp, 'categoriesGroup');
    }

    private createSeriesGroup(columns: ColState[]): void {
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
            const comp = this.seriesGroupComp!.createManagedBean(new AgCheckbox());
            comp.addCssClass('ag-data-select-checkbox');

            const label = getSeriesLabel(col);

            comp.setLabel(label);
            comp.setValue(col.selected);

            this.addChangeListener(comp, col);
            this.seriesGroupComp!.addItem(comp);
            this.columnComps.set(col.colId, comp);

            this.addDragHandle(comp, col);
        });

        const eGui = this.getGui();
        const seriesGroupGui = this.seriesGroupComp.getGui();

        this.addComponent(eGui, this.seriesGroupComp, 'seriesGroup');

        const dropTarget: DropTarget = {
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

    private createSeriesChartTypeGroup(columns: ColState[], index?: number): void {
        if (!this.chartController.isComboChart()) { return; }

        this.seriesChartTypeGroupComp = this.createManagedBean(new AgGroupComponent({
            title: this.chartTranslationService.translate('seriesChartType'),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));

        const seriesChartTypes = this.chartController.getSeriesChartTypes();

        columns.forEach(col => {
            if (!col.selected) { return; }

            const seriesChartType: SeriesChartType = seriesChartTypes.filter(s => s.colId === col.colId)[0];
            if (!seriesChartType) { return; }

            const seriesItemGroup = this.seriesChartTypeGroupComp!.createManagedBean(new AgGroupComponent({
                title: col.displayName!,
                enabled: true,
                suppressEnabledCheckbox: true,
                suppressOpenCloseIcons: true,
                cssIdentifier: 'charts-format-sub-level'
            }));

            const secondaryAxisComp = this.seriesChartTypeGroupComp!
                .createManagedBean(new AgCheckbox())
                .setLabel(this.chartTranslationService.translate('secondaryAxis'))
                .setLabelWidth("flex")
                .setDisabled(['groupedColumn', 'stackedColumn', 'stackedArea'].includes(seriesChartType.chartType))
                .setValue(!!seriesChartType.secondaryAxis)
                .onValueChange((enabled: boolean) => this.chartController.updateSeriesChartType(col.colId, undefined, enabled));

            seriesItemGroup.addItem(secondaryAxisComp);

            const translate = (key: string, defaultText: string) => {
                return this.chartTranslationService.translate(key, defaultText);
            }

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
                .onValueChange((chartType: ChartType) => this.chartController.updateSeriesChartType(col.colId, chartType));

            seriesItemGroup.addItem(chartTypeComp);

            this.seriesChartTypeGroupComp!.addItem(seriesItemGroup);
        });

        if (index === undefined) {
            this.addComponent(this.getGui(), this.seriesChartTypeGroupComp, 'seriesChartTypeGroup');
        } else {
            this.addComponentAtIndex(this.getGui(), this.seriesChartTypeGroupComp, 'seriesChartTypeGroup', index);
        }
    }

    private addDragHandle(comp: AgCheckbox, col: ColState): void {
        const eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsService)!;

        eDragHandle.classList.add('ag-drag-handle', 'ag-chart-data-column-drag-handle');

        comp.getGui().insertAdjacentElement('beforeend', eDragHandle);

        const dragSource: DragSource = {
            type: DragSourceType.ChartPanel,
            eElement: eDragHandle,
            dragItemName: col.displayName,
            getDragItem: () => ({ columns: [col.column!] }),
            onDragStopped: () => this.onDragStop()
        };

        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }

    private generateGetSeriesLabel(): (col: ColState) => string {
        if (!this.chartController.isActiveXYChart()) {
            return col => _.escapeString(col.displayName)!;
        }

        const isBubble = this.chartType === 'bubble';
        const isInPairedMode = this.isInPairedMode();
        let selectedValuesCount = 0;

        const indexToAxisLabel = new Map<number, string>();
        indexToAxisLabel.set(0, 'X');
        indexToAxisLabel.set(1, 'Y');
        indexToAxisLabel.set(2, 'size');

        return (col: ColState): string => {
            const escapedLabel = _.escapeString(col.displayName)!;

            if (!col.selected) {
                return escapedLabel;
            }

            let axisLabel;

            if (isInPairedMode) {
                axisLabel = indexToAxisLabel.get(selectedValuesCount % (isBubble ? 3 : 2));
            } else {
                if (selectedValuesCount === 0) {
                    axisLabel = 'X';
                } else {
                    axisLabel = isBubble && selectedValuesCount % 2 === 0 ? 'size' : 'Y';
                }
            }

            selectedValuesCount++;

            return `${escapedLabel} (${axisLabel})`;
        };
    }

    private getCategoryGroupTitle() {
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    }

    private getSeriesGroupTitle() {
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    }

    private getDataPanelDef() {
        const userProvidedDataPanelDef = this.gridOptionsService.get('chartToolPanelsDef')?.dataPanel;
        return userProvidedDataPanelDef ? userProvidedDataPanelDef : DefaultDataPanelDef;
    }

    private isInPairedMode() {
        return this.chartController.isActiveXYChart() && this.chartOptionsService.getSeriesOption('paired', 'scatter');
    }

    private clearComponents() {
        _.clearElement(this.getGui());
        this.categoriesGroupComp = this.destroyBean(this.categoriesGroupComp);
        this.seriesGroupComp = this.destroyBean(this.seriesGroupComp);
        this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
        this.columnComps.clear();
    }

    private onDragging(draggingEvent: DraggingEvent): void {
        const itemHovered = this.checkHoveredItem(draggingEvent);

        if (!itemHovered) { return; }

        this.lastDraggedColumn = draggingEvent.dragItem.columns![0];

        const { comp, position } = itemHovered;
        const { comp: lastHoveredComp, position: lastHoveredPosition } = this.lastHoveredItem || {};

        if (comp === lastHoveredComp && position === lastHoveredPosition) { return; }

        this.autoScrollService.check(draggingEvent.event);
        this.clearHoveredItems();
        this.lastHoveredItem = { comp, position };

        const eGui = comp.getGui();

        eGui.classList.add('ag-list-item-hovered', `ag-item-highlight-${position}`);
    }

    private checkHoveredItem(draggingEvent: DraggingEvent): { comp: AgCheckbox, position: 'top' | 'bottom' } | null {
        if (_.missing(draggingEvent.vDirection)) { return null; }

        const mouseEvent = draggingEvent.event;

        for (const comp of this.columnComps.values()) {
            const eGui = comp.getGui();

            if (!eGui.querySelector('.ag-chart-data-column-drag-handle')) { continue; }

            const rect = eGui.getBoundingClientRect();
            const isOverComp = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;

            if (isOverComp) {
                const height = eGui.clientHeight;
                const position = mouseEvent.clientY > rect.top + (height / 2) ? 'bottom': 'top';
                return { comp, position };
            }
        }

        return null;
    }

    private onDragLeave(): void {
        this.clearHoveredItems();
    }

    private onDragStop(): void {
        if (this.lastHoveredItem) {
            const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
            const draggedColumnState = [...dimensionCols, ...valueCols]
                .find(state => state.column === this.lastDraggedColumn);
            if (draggedColumnState) {
                let targetIndex = Array.from(this.columnComps.values()).indexOf(this.lastHoveredItem.comp);
                if (this.lastHoveredItem.position === 'bottom') { targetIndex++; }

                draggedColumnState.order = targetIndex;
                this.chartController.updateForPanelChange(draggedColumnState);
            }
        }
        this.clearHoveredItems();
        this.lastDraggedColumn = undefined;
        this.autoScrollService.ensureCleared();
    }

    private clearHoveredItems(): void {
        this.columnComps.forEach(columnComp => {
            columnComp.getGui().classList.remove(
                'ag-list-item-hovered',
                'ag-item-highlight-top', 
                'ag-item-highlight-bottom'
            );
        });
        this.lastHoveredItem = undefined;
    }

    private isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.ChartPanel;
    }
}
