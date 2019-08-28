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
import {ChartController} from "../../chartController";
import {ColState} from "../../chartModel";
import {ChartTranslator} from "../../chartTranslator";

export class ChartDataPanel extends Component {

    public static TEMPLATE = `<div class="ag-chart-data-wrapper"></div>`;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private columnComps: { [key: string]: AgRadioButton | AgCheckbox } = {};
    private dimensionComps: AgRadioButton[] = [];

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super(ChartDataPanel.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.createDataGroupElements();
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.createDataGroupElements.bind(this));
    }

    private createDataGroupElements() {
        this.destroyColumnComps();

        const eGui = this.getGui();

        const {dimensionCols, valueCols} = this.chartController.getColStateForMenu();

        [dimensionCols, valueCols].forEach((group, idx) => {
            const isCategory = idx === 0;

            const dataGroupKey = isCategory ? 'categories' : this.chartController.isActiveXYChart() ? 'xyValues' : 'series';

            const groupComp = new AgGroupComponent({
                title: this.chartTranslator.translate(dataGroupKey),
                enabled: true,
                suppressEnabledCheckbox: true,
                suppressOpenCloseIcons: false
            });
            this.getContext().wireBean(groupComp);
            
            group.forEach(this.getColumnStateMapper(isCategory, groupComp));
            const eDiv = document.createElement('div');
            eDiv.appendChild(groupComp.getGui());
            eGui.appendChild(eDiv);
        });
    }

    private getColumnStateMapper(dimension: boolean, container: AgGroupComponent) {

        return (colState: ColState) => {
            const comp = dimension
                ? new AgRadioButton()
                : new AgCheckbox();
            
            this.getContext().wireBean(comp);
            comp.setLabel(_.escape(colState.displayName) as string);
            comp.setValue(colState.selected);

            this.columnComps[colState.colId] = comp;

            if (dimension) {
                comp.setInputName('chartDimension' + this.getCompId());
                this.dimensionComps.push(comp as AgRadioButton);
            }

            this.addDestroyableEventListener(comp, AgAbstractField.EVENT_CHANGED, () => {
                colState.selected = comp.getValue();
                this.chartController.updateForMenuChange(colState);
            });

            container.addItem(comp);
        };
    }

    public destroy(): void {
        super.destroy();
        this.destroyColumnComps();
    }

    private destroyColumnComps(): void {
        _.clearElement(this.getGui());
        if (this.columnComps) {
            _.iterateObject(this.columnComps, (key: string, renderedItem: Component) => renderedItem.destroy());
        }
        this.columnComps = {};
    }
}
