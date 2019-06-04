import {
    Autowired,
    AgGroupComponent,
    Component,
    GridOptionsWrapper,
    PostConstruct,
    _,
    AgRadioButton,
    AgCheckbox
} from "ag-grid-community";
import { ChartController } from "../chartController";
import { ColState } from "../chartModel";

export class ChartDataPanel extends Component {

    public static TEMPLATE = `<div class="ag-chart-data-wrapper"></div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private columnComps: { [key: string]: AgRadioButton | AgCheckbox } = {};
    private dimensionComps: AgRadioButton[] = [];

    private readonly chartController: ChartController;

    constructor(chartModel: ChartController) {
        super(ChartDataPanel.TEMPLATE);
        this.chartController = chartModel;
    }

    @PostConstruct
    private init() {
        this.createDataGroupElements();
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.createDataGroupElements.bind(this));
    }

    private createDataGroupElements() {
        this.destroyColumnComps();

        const eGui = this.getGui();

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const {dimensionCols, valueCols} = this.chartController.getColStateForMenu();

        [dimensionCols, valueCols].forEach((group, idx) => {
            const isCategory = idx === 0;
            const groupComp = new AgGroupComponent({
                label: isCategory
                        ? localeTextFunc('chartCategories', 'Categories')
                        : localeTextFunc('chartSeries', 'Series')
            });
            this.getContext().wireBean(groupComp);
            
            group.forEach(this.getColumnStateMapper(isCategory, groupComp));
            eGui.appendChild(groupComp.getGui());
        });
    }

    private getColumnStateMapper(dimension: boolean, container: AgGroupComponent) {

        const checkboxChanged = (updatedColState: ColState) => this.chartController.updateForMenuChange(updatedColState);

        const radioButtonChanged = (radioComp: AgRadioButton, updatedColState: ColState) => {
            this.dimensionComps.forEach(comp => comp.select(false));
            this.chartController.updateForMenuChange(updatedColState);
            radioComp.select(true);
        };

        return (colState: ColState) => {
            const comp = dimension
                ? new AgRadioButton()
                : new AgCheckbox();
            
            this.getContext().wireBean(comp);
            comp.setLabel(_.escape(colState.displayName) as string);
            comp.setSelected(colState.selected);

            this.columnComps[colState.colId] = comp;

            if (dimension) {
                this.dimensionComps.push(comp as AgRadioButton);
            }

            this.addDestroyableEventListener(comp, 'change', () => {
                colState.selected = comp.isSelected();
                if (dimension) {
                    radioButtonChanged(comp as AgRadioButton, colState);
                } else {
                    checkboxChanged(colState);
                }
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