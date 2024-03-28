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
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { DragDataPanel } from "./dragDataPanel";
import { ChartMenuService } from "../../services/chartMenuService";

export class SeriesDataPanel extends DragDataPanel {
    private static TEMPLATE = /* html */`<div id="seriesGroup"></div>`;

    @Autowired('chartMenuService') private readonly chartMenuService: ChartMenuService;

    constructor(
        chartController: ChartController,
        autoScrollService: AutoScrollService,
        private readonly chartOptionsService: ChartOptionsService,
        private readonly title: string,
        allowMultipleSelect: boolean,
        maxSelection: number | undefined,
        private valueCols: ColState[],
        private isOpen?: boolean
    ) {
        const skipAnimations = false;
        super(chartController, autoScrollService, allowMultipleSelect, maxSelection, skipAnimations, SeriesDataPanel.TEMPLATE);
    }

    @PostConstruct
    private init() {
        this.groupComp = this.createBean(new AgGroupComponent({
            title: this.title,
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            cssIdentifier: 'charts-data',
            expanded: this.isOpen
        }));
        if (this.chartController.isActiveXYChart()) {
            const pairedModeToggle = this.groupComp.createManagedBean(new AgToggleButton({
                label: this.chartTranslationService.translate('paired'),
                labelAlignment: 'left',
                labelWidth: 'flex',
                inputWidth: 'flex',
                value: this.chartOptionsService.getPairedMode(),
                onValueChange: newValue => {
                    this.chartOptionsService.setPairedMode(!!newValue);
                    this.chartController.updateForGridChange({ maintainColState: true });
                }
            }));
            this.groupComp.addItem(pairedModeToggle);
        }
        if (this.chartMenuService.isLegacyFormat()) {
            this.createLegacySeriesGroup(this.valueCols);
        } else {
            this.createSeriesGroup(this.valueCols);
        }
        this.getGui().appendChild(this.groupComp.getGui());
    }

    public refresh(valueCols: ColState[]): void {
        if (this.chartMenuService.isLegacyFormat()) {
            const canRefresh = this.refreshColumnComps(valueCols);
            if (canRefresh) {
                if (this.chartController.isActiveXYChart()) {
                    const getSeriesLabel = this.generateGetSeriesLabel(valueCols);
        
                    valueCols.forEach(col => {
                        this.columnComps.get(col.colId)!.setLabel(getSeriesLabel(col));
                    });
                }
            } else {
                this.recreate(valueCols);
            }
        } else {
            this.valuePillSelect?.setValueFormatter(this.generateGetSeriesLabel(valueCols));
            this.valuePillSelect?.setValues(valueCols, valueCols.filter(col => col.selected));
            this.refreshValueSelect(valueCols);
        }
    }

    private recreate(valueCols: ColState[]): void {
        this.isOpen = this.groupComp.isExpanded();
        _.clearElement(this.getGui());
        this.destroyBean(this.groupComp);
        this.valueCols = valueCols;
        this.init();
    }

    private createSeriesGroup(columns: ColState[]): void {
        this.createGroup(columns, this.generateGetSeriesLabel(columns), 'seriesAdd', 'seriesSelect');
    }

    private createLegacySeriesGroup(columns: ColState[]): void {
        const getSeriesLabel = this.generateGetSeriesLabel(columns);

        columns.forEach(col => {
            const label = getSeriesLabel(col);
            const comp = this.groupComp.createManagedBean(new AgCheckbox({
                label,
                value: col.selected
            }));
            comp.addCssClass('ag-data-select-checkbox');

            this.addChangeListener(comp, col);
            this.groupComp.addItem(comp);
            this.columnComps.set(col.colId, comp);

            this.addDragHandle(comp, col);
        });

        const seriesGroupGui = this.groupComp.getGui();

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

    private generateGetSeriesLabel(valueCols: ColState[]): (col: ColState) => string {
        if (!this.chartController.isActiveXYChart()) {
            return col => _.escapeString(col.displayName)!;
        }

        const selectedCols = valueCols.filter(col => col.selected);

        const isBubble = this.chartController.getChartType() === 'bubble';
        const isInPairedMode = this.chartOptionsService.getPairedMode();

        const indexToAxisLabel = new Map<number, string>();
        indexToAxisLabel.set(0, 'X');
        indexToAxisLabel.set(1, 'Y');
        indexToAxisLabel.set(2, 'size');

        return (col: ColState): string => {
            const escapedLabel = _.escapeString(col.displayName)!;

            if (!col.selected) {
                return escapedLabel;
            }

            const index = selectedCols.indexOf(col);

            if (index === -1) { return escapedLabel; }

            let axisLabel;

            if (isInPairedMode) {
                axisLabel = indexToAxisLabel.get(index % (isBubble ? 3 : 2));
            } else {
                if (index === 0) {
                    axisLabel = 'X';
                } else {
                    axisLabel = isBubble && index % 2 === 0 ? 'size' : 'Y';
                }
            }

            return `${escapedLabel} (${axisLabel})`;
        };
    }

    protected destroy(): void {
        this.groupComp = this.destroyBean(this.groupComp)!;
        super.destroy();
    }
}
