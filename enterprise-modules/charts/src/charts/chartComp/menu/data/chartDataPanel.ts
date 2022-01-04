import {
    _,
    AgAbstractField,
    AgCheckbox,
    AgGroupComponent,
    AgRadioButton,
    AgSelect,
    AgToggleButton,
    Autowired,
    ChartType,
    Component,
    DragAndDropService,
    DraggingEvent,
    DragSource,
    DragSourceType,
    DropTarget,
    PostConstruct,
    SeriesChartType,
    VerticalDirection
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ColState } from "../../chartDataModel";
import { ChartTranslationService } from "../../services/chartTranslationService";
import { ChartOptionsService } from "../../services/chartOptionsService";

export class ChartDataPanel extends Component {
    public static TEMPLATE = /* html */ `<div class="ag-chart-data-wrapper"></div>`;

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('chartTranslationService') private chartTranslator: ChartTranslationService;

    private categoriesGroupComp?: AgGroupComponent;
    private seriesGroupComp?: AgGroupComponent;
    private seriesChartTypeGroupComp?: AgGroupComponent;
    private columnComps: Map<string, AgRadioButton | AgCheckbox> = new Map<string, AgRadioButton | AgCheckbox>();
    private chartType?: ChartType;
    private insertIndex?: number;

    constructor(
        private readonly chartController: ChartController,
        private readonly chartOptionsService: ChartOptionsService) {
        super(ChartDataPanel.TEMPLATE);
    }

    @PostConstruct
    public init() {
        this.updatePanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.updatePanels.bind(this));
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

            // TODO: improve - changing categories or series will expand group
            // recreate series chart type group if it exists as series may be added or removed via series group panel
            _.removeFromParent(this.getGui().querySelector('#seriesChartTypeGroup'));
            this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
            this.createSeriesChartTypeGroup(valueCols);

        } else {
            // otherwise we re-create everything
            this.clearComponents();

            this.createCategoriesGroup(dimensionCols);
            this.createSeriesGroup(valueCols);
            this.createSeriesChartTypeGroup(valueCols);
        }
    }

    private addComponent(parent: HTMLElement, component: AgGroupComponent, id: string): void {
        const eDiv = document.createElement('div');
        eDiv.id = id;
        eDiv.className = 'ag-chart-data-section';
        eDiv.appendChild(component.getGui());
        parent.appendChild(eDiv);
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
                .setLabel(this.chartTranslator.translate('paired'))
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

        this.addComponent(this.getGui(), this.seriesGroupComp, 'seriesGroup');

        const dropTarget: DropTarget = {
            getContainer: this.getGui.bind(this),
            onDragging: this.onDragging.bind(this),
            isInterestedIn: this.isInterestedIn.bind(this),
        };

        this.dragAndDropService.addDropTarget(dropTarget);
    }

    private createSeriesChartTypeGroup(columns: ColState[]): void {
        if (!this.chartController.isComboChart()) { return; }

        this.seriesChartTypeGroupComp = this.createManagedBean(new AgGroupComponent({
            title: 'Series Chart Type', //TODO
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data'
        }));

        const seriesChartTypes = this.chartController.getSeriesChartTypes();

        columns.forEach(col => {
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
                .setLabel('Secondary Axis') //TODO
                .setLabelWidth("flex")
                .setValue(!!seriesChartType.secondaryAxis);

            seriesItemGroup.addItem(secondaryAxisComp);

            const availableChartTypes = [
                {value: 'groupedColumn', text: 'Grouped Column'},
                {value: 'stackedColumn', text: 'Stacked Column'},
                {value: 'normalizedColumn', text: 'Normalized Column'},
                // {value: 'groupedBar', text: 'Grouped Bar'},
                // {value: 'stackedBar', text: 'Stacked Bar'},
                // {value: 'normalizedBar', text: 'Normalized Bar'},
                {value: 'line', text: 'Line'},
                {value: 'area', text: 'Area'},
                {value: 'stackedArea', text: 'Stacked Area'},
                {value: 'normalizedArea', text: 'Normalized Area'},
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

        this.addComponent(this.getGui(), this.seriesChartTypeGroupComp, 'seriesChartTypeGroup');
    }

    private addDragHandle(comp: AgCheckbox, col: ColState): void {
        const eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsWrapper)!;

        eDragHandle.classList.add('ag-drag-handle', 'ag-chart-data-column-drag-handle');

        comp.getGui().insertAdjacentElement('beforeend', eDragHandle);

        const dragSource: DragSource = {
            type: DragSourceType.ChartPanel,
            eElement: eDragHandle,
            dragItemName: col.displayName,
            defaultIconName: DragAndDropService.ICON_MOVE,
            getDragItem: () => ({ columns: [col.column!] }),
            onDragStopped: () => { this.insertIndex = undefined; }
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
        return this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    }

    private getSeriesGroupTitle() {
        return this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    }

    private isInPairedMode() {
        return this.chartController.isActiveXYChart() && this.chartOptionsService.getSeriesOption('paired');
    }

    private clearComponents() {
        _.clearElement(this.getGui());
        this.categoriesGroupComp = this.destroyBean(this.categoriesGroupComp);
        this.seriesGroupComp = this.destroyBean(this.seriesGroupComp);
        this.seriesChartTypeGroupComp = this.destroyBean(this.seriesChartTypeGroupComp);
        this.columnComps.clear();
    }

    private onDragging(draggingEvent: DraggingEvent): void {
        if (this.checkInsertIndex(draggingEvent)) {
            const column = draggingEvent.dragItem.columns![0];
            const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
            [...dimensionCols, ...valueCols]
                .filter(state => state.column === column)
                .forEach(state => {
                    state.order = this.insertIndex!;
                    this.chartController.updateForPanelChange(state);
                });
        }
    }

    private checkInsertIndex(draggingEvent: DraggingEvent): boolean {
        if (_.missing(draggingEvent.vDirection)) {
            return false;
        }

        let newIndex = 0;
        const mouseEvent = draggingEvent.event;

        this.columnComps.forEach(comp => {
            const rect = comp.getGui().getBoundingClientRect();
            const verticalFit = mouseEvent.clientY >= (draggingEvent.vDirection === VerticalDirection.Down ? rect.top : rect.bottom);

            if (verticalFit) {
                newIndex++;
            }
        });

        const changed = this.insertIndex !== undefined && newIndex !== this.insertIndex;

        this.insertIndex = newIndex;

        return changed;
    }

    private isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.ChartPanel;
    }
}
