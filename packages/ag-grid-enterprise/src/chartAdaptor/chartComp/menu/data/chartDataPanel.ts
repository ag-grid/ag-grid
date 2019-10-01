import {
    _,
    AgAbstractField,
    AgCheckbox,
    AgGroupComponent,
    AgRadioButton,
    Autowired,
    Component,
    PostConstruct
} from "ag-grid-community";
import { ChartController } from "../../chartController";
import { ColState } from "../../chartModel";
import { ChartTranslator } from "../../chartTranslator";

export class ChartDataPanel extends Component {
    public static TEMPLATE = `<div class="ag-chart-data-wrapper"></div>`;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private categoriesGroupComp?: AgGroupComponent;
    private seriesGroupComp?: AgGroupComponent;
    private columnComps: Map<string, AgRadioButton | AgCheckbox> = new Map<string, AgRadioButton | AgCheckbox>();

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
        const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
        const colIds = dimensionCols.map(c => c.colId).concat(valueCols.map(c => c.colId));

        if (_.areEqual(_.keys(this.columnComps), colIds)) {
            // columns haven't changed, so just update values
            [ ...dimensionCols, ...valueCols ].forEach(col => {
                this.columnComps.get(col.colId)!.setValue(col.selected, true);
            });
        } else {
            // re-render everything
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
            title: this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories'),
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
            title: this.chartTranslator.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series'),
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false
        }));

        columns.forEach(col => {
            const comp = this.seriesGroupComp!.wireDependentBean(new AgCheckbox());
            
            comp.setLabel(_.escape(col.displayName)!);
            comp.setValue(col.selected);

            this.addChangeListener(comp, col);
            this.seriesGroupComp!.addItem(comp);
            this.columnComps.set(col.colId, comp);
        });

        this.addComponent(this.getGui(), this.seriesGroupComp);
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
