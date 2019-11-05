import {
    _,
    AgAbstractField,
    AgCheckbox,
    AgGroupComponent,
    AgRadioButton,
    Autowired,
    Component,
    PostConstruct,
    ChartType
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ColState } from "../../chartModel";
import { ChartTranslator } from "../../chartTranslator";

export class ChartDataPanel extends Component {
    public static TEMPLATE = `<div class="ag-chart-data-wrapper"></div>`;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private categoriesGroupComp?: AgGroupComponent;
    private seriesGroupComp?: AgGroupComponent;
    private columnComps: Map<string, AgRadioButton | AgCheckbox> = new Map<string, AgRadioButton | AgCheckbox>();
    private chartType?: ChartType;

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super(ChartDataPanel.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    public init() {
        this.addPanels();
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.addPanels.bind(this));
    }

    public destroy(): void {
        this.clearComponents();
        super.destroy();
    }

    private addPanels() {
        const currentChartType = this.chartType;
        const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
        const colIds = dimensionCols.map(c => c.colId).concat(valueCols.map(c => c.colId));

        this.chartType = this.chartController.getChartType();

        if (_.areEqual(_.keys(this.columnComps), colIds) && this.chartType === currentChartType) {
            // if possible, we just update existing components
            [ ...dimensionCols, ...valueCols ].forEach(col => {
                this.columnComps.get(col.colId)!.setValue(col.selected, true);
            });

            if (this.chartController.isActiveXYChart()) {
                const getSeriesLabel = this.generateGetSeriesLabel();
                
                valueCols.forEach(col => {
                    this.columnComps.get(col.colId)!.setLabel(getSeriesLabel(col));
                });
            }
        } else {
            // otherwise we re-create everything
            this.clearComponents();
            this.createCategoriesGroupComponent(dimensionCols);
            this.createSeriesGroupComponent(valueCols);
        }
    }

    private addComponent(parent: HTMLElement, component: AgGroupComponent): void {
        const eDiv = document.createElement('div');
        eDiv.appendChild(component.getGui());
        parent.appendChild(eDiv);
    }

    private addChangeListener(component: AgRadioButton | AgCheckbox, columnState: ColState) {
        this.addDestroyableEventListener(component, AgAbstractField.EVENT_CHANGED, () => {
            columnState.selected = component.getValue();
            this.chartController.updateForMenuChange(columnState);
        });
    }

    private createCategoriesGroupComponent(columns: ColState[]): void {
        this.categoriesGroupComp = this.wireBean(new AgGroupComponent({
            title: this.getCategoryGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false
        }));

        const inputName = `chartDimension${this.getCompId()}`;

        columns.forEach(col => {
            const comp = this.categoriesGroupComp!.wireDependentBean(new AgRadioButton());
            
            comp.setLabel(_.escape(col.displayName)!);
            comp.setValue(col.selected);
            comp.setInputName(inputName);

            this.addChangeListener(comp, col);
            this.categoriesGroupComp!.addItem(comp);
            this.columnComps.set(col.colId, comp);
        });

        this.addComponent(this.getGui(), this.categoriesGroupComp);
    }

    private createSeriesGroupComponent(columns: ColState[]): void {
        this.seriesGroupComp = this.wireDependentBean(new AgGroupComponent({
            title: this.getSeriesGroupTitle(),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false
        }));

        const getSeriesLabel = this.generateGetSeriesLabel();

        columns.forEach(col => {
            const comp = this.seriesGroupComp!.wireDependentBean(new AgCheckbox());
            
            comp.setLabel(getSeriesLabel(col));
            comp.setValue(col.selected);

            this.addChangeListener(comp, col);
            this.seriesGroupComp!.addItem(comp);
            this.columnComps.set(col.colId, comp);
        });

        this.addComponent(this.getGui(), this.seriesGroupComp);
    }

    private generateGetSeriesLabel(): (col: ColState) => string {
        if (!this.chartController.isActiveXYChart()) {
            return col => _.escape(col.displayName)!;
        }

        const isBubble = this.chartType === ChartType.Bubble;
        let activeSeriesCount = 0;

        return (col: ColState): string => {
            const escapedLabel = _.escape(col.displayName)!;

            if (!col.selected) {
                return escapedLabel;
            }

            activeSeriesCount++;
            
            let axisLabel;

            if (activeSeriesCount === 1) {
                axisLabel = "X";
            } else if (isBubble) {
                axisLabel = (activeSeriesCount - 1) % 2 === 1 ? "Y" : "size";
            } else {
                axisLabel = "Y";
            }

            return `${escapedLabel} (${axisLabel})`;
        };
    }

    private getCategoryGroupTitle() {
        return this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    }

    private getSeriesGroupTitle() {
        return this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    }

    private clearComponents() {
        _.clearElement(this.getGui());

        this.columnComps.clear();

        if (this.categoriesGroupComp) {
            this.categoriesGroupComp.destroy();
            this.categoriesGroupComp = undefined;
        }

        if (this.seriesGroupComp) {
            this.seriesGroupComp.destroy();
            this.seriesGroupComp = undefined;
        }
    }
}
