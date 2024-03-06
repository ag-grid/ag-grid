import {
    AgCheckbox,
    AgGroupComponent,
    AgToggleButton,
    AutoScrollService,
    Autowired,
    DragAndDropService,
    DropTarget,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { AgPillSelect } from "../../../../widgets/agPillSelect";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartTranslationService } from "../../services/chartTranslationService";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { DragDataPanel } from "./dragDataPanel";

export class SeriesDataPanel extends DragDataPanel {
    private static TEMPLATE = /* html */`<div id="seriesGroup"></div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    private seriesGroupComp: AgGroupComponent;
    private seriesSelect?: AgPillSelect<ColState>;

    constructor(
        chartController: ChartController,
        autoScrollService: AutoScrollService,
        private readonly chartOptionsService: ChartOptionsService,
        private valueCols: ColState[],
        private isOpen?: boolean
    ) {
        super(chartController, autoScrollService, SeriesDataPanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.seriesGroupComp = this.createBean(new AgGroupComponent({
            title: this.getSeriesGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data',
            expanded: this.isOpen
        }));
        if (this.chartController.isActiveXYChart()) {
            const pairedModeToggle = this.seriesGroupComp.createManagedBean(new AgToggleButton({
                label: this.chartTranslationService.translate('paired'),
                labelAlignment: 'left',
                labelWidth: 'flex',
                inputWidth: 'flex',
                value: this.chartOptionsService.getPairedMode(),
                onValueChange: newValue => {
                    this.chartOptionsService.setPairedMode(!!newValue);
                    this.chartController.updateForGridChange();
                }
            }));
            this.seriesGroupComp.addItem(pairedModeToggle);
        }
        if (this.gridOptionsService.get('legacyChartsMenu')) {
            this.createLegacySeriesGroup(this.valueCols);
        } else {
            this.createSeriesGroup(this.valueCols);
        }
        this.getGui().appendChild(this.seriesGroupComp.getGui());
    }

    public refresh(valueCols: ColState[]): void {
        if (this.gridOptionsService.get('legacyChartsMenu')) {
            const canRefresh = this.refreshColumnComps(valueCols);
            if (canRefresh) {
                if (this.chartController.isActiveXYChart()) {
                    const getSeriesLabel = this.generateGetSeriesLabel();
        
                    valueCols.forEach(col => {
                        this.columnComps.get(col.colId)!.setLabel(getSeriesLabel(col));
                    });
                }
            } else {
                this.recreate(valueCols);
            }
        } else {
            this.seriesSelect?.setValueFormatter(this.generateGetSeriesLabel());
            this.seriesSelect?.setValues(valueCols, valueCols.filter(col => col.selected));
        }
    }

    private recreate(valueCols: ColState[]): void {
        this.isOpen = this.seriesGroupComp.isExpanded();
        _.clearElement(this.getGui());
        this.destroyBean(this.seriesGroupComp);
        this.valueCols = valueCols;
        this.init();
    }

    private createSeriesGroup(columns: ColState[]): void {
        const getSeriesLabel = this.generateGetSeriesLabel();

        const selectedValueList = columns.filter(col => col.selected);
        this.seriesSelect = this.seriesGroupComp.createManagedBean(new AgPillSelect<ColState>({
            valueList: columns,
            selectedValueList,
            valueFormatter: getSeriesLabel,
            selectPlaceholder: this.chartTranslationService.translate('seriesAdd'),
            dragSourceId: 'seriesSelect',
            onValuesChange: params => this.onValueChange(params)
        }));
        this.seriesGroupComp.addItem(this.seriesSelect);
    }

    private createLegacySeriesGroup(columns: ColState[]): void {
        const getSeriesLabel = this.generateGetSeriesLabel();

        columns.forEach(col => {
            const label = getSeriesLabel(col);
            const comp = this.seriesGroupComp.createManagedBean(new AgCheckbox({
                label,
                value: col.selected
            }));
            comp.addCssClass('ag-data-select-checkbox');

            this.addChangeListener(comp, col);
            this.seriesGroupComp.addItem(comp);
            this.columnComps.set(col.colId, comp);

            this.addDragHandle(comp, col);
        });

        const seriesGroupGui = this.seriesGroupComp.getGui();

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

    private generateGetSeriesLabel(): (col: ColState) => string {
        if (!this.chartController.isActiveXYChart()) {
            return col => _.escapeString(col.displayName)!;
        }

        const isBubble = this.chartController.getChartType() === 'bubble';
        const isInPairedMode = this.chartOptionsService.getPairedMode();
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

    private getSeriesGroupTitle() {
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    }

    protected destroy(): void {
        this.seriesGroupComp = this.destroyBean(this.seriesGroupComp)!;
        this.seriesSelect = undefined;
        super.destroy();
    }
}
