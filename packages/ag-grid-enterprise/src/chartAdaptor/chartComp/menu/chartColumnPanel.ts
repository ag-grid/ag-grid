import {
    Autowired,
    AgCheckbox,
    AgRadioButton,
    Component,
    GridOptionsWrapper,
    PostConstruct,
    RefSelector,
    _
} from "ag-grid-community";
import { ChartController } from "../chartController";
import { ColState } from "../chartModel";

export class ChartColumnPanel extends Component {

    public static TEMPLATE = `<div class="ag-chart-data-wrapper"></div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private columnComps: { [key: string]: ChartPanelRadioComp | ChartPanelCheckboxComp } = {};
    private dimensionComps: ChartPanelRadioComp[] = [];
    private chartController: ChartController;

    constructor(chartModel: ChartController) {
        super(ChartColumnPanel.TEMPLATE);
        this.chartController = chartModel;
    }

    public init(): void {
        const {dimensionCols, valueCols} = this.chartController.getColStateForMenu();
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const eGui = this.getGui();

        [dimensionCols, valueCols].forEach((group, idx) => {
            const isCategory = idx === 0;
            const currentEl = document.createElement('div');
            const currentLabel = document.createElement('div');

            _.addCssClass(currentEl, 'ag-chart-data-group');            
            _.addCssClass(currentLabel, 'ag-chart-data-group-label');
            if (isCategory) {
                currentLabel.innerHTML = localeTextFunc('chartCategories', 'Categories');
            } else {
                currentLabel.innerHTML = localeTextFunc('chartValues', 'Values');
            }

            currentEl.appendChild(currentLabel);
            eGui.appendChild(currentEl);

            group.forEach(this.getColumnStateMapper(isCategory, currentEl));
        });
    }

    private getColumnStateMapper(dimension: boolean, container: HTMLElement) {

        const checkboxChanged = (updatedColState: ColState) => this.chartController.updateForMenuChange(updatedColState);

        const radioButtonChanged = (radioComp: ChartPanelRadioComp, updatedColState: ColState) => {
            this.dimensionComps.forEach(comp => comp.select(false));
            this.chartController.updateForMenuChange(updatedColState);
            radioComp.select(true);
        };

        return (colState: ColState) => {
            const comp = dimension
                ? new ChartPanelRadioComp(colState, radioButtonChanged)
                : new ChartPanelCheckboxComp(colState, checkboxChanged);

            this.getContext().wireBean(comp);
            container.appendChild(comp.getGui());
            this.columnComps[colState.colId] = comp;

            if (dimension) {
                this.dimensionComps.push(comp as ChartPanelRadioComp);
            }
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

class ChartPanelRadioComp extends Component {

    //TODO refactor class to be chart menu specific
    private static TEMPLATE =
        `<div class="ag-chart-data-item">
            <ag-radio-button ref="rbSelect"></ag-radio-button>
            <span class="ag-chart-data-item-label" ref="eLabel"></span>
        </div>`;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('rbSelect') private rbSelect: AgRadioButton;

    private readonly colState: ColState;
    private readonly selectionChanged: (radioComp: ChartPanelRadioComp, updatedColState: ColState) => void;

    constructor(colState: ColState, selectionChanged: (radioComp: ChartPanelRadioComp, updatedColState: ColState) => void) {
        super();
        this.colState = colState;
        this.selectionChanged = selectionChanged;
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(ChartPanelRadioComp.TEMPLATE);

        this.setLabelName();

        this.rbSelect.setSelected(this.colState.selected);

        this.addDestroyableEventListener(this.rbSelect, 'change', this.onRadioButtonChanged.bind(this));
        this.addDestroyableEventListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
    }

    public select(selected: boolean) {
        this.rbSelect.select(selected);
    }

    private setLabelName() {
        this.eLabel.innerHTML = _.escape(this.colState.displayName) as string;
    }

    private onLabelClicked(): void {
        this.rbSelect.setSelected(!this.rbSelect.isSelected());
    }

    private onRadioButtonChanged(): void {
        this.colState.selected = this.rbSelect.isSelected();
        this.selectionChanged(this, this.colState);
    }
}

class ChartPanelCheckboxComp extends Component {

    //TODO refactor class to be chart menu specific
    private static TEMPLATE =
        `<div class="ag-chart-data-item">
            <ag-checkbox ref="cbSelect"></ag-checkbox>
            <span class="ag-chart-data-item-label" ref="eLabel"></span>
        </div>`;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('cbSelect') private cbSelect: AgCheckbox;

    private readonly colState: ColState;
    private readonly selectionChanged: (updatedColState: ColState) => void;

    constructor(colState: ColState, selectionChanged: (updatedColState: ColState) => void) {
        super();
        this.colState = colState;
        this.selectionChanged = selectionChanged;
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(ChartPanelCheckboxComp.TEMPLATE);

        this.setLabelName();

        this.cbSelect.setSelected(this.colState.selected);

        this.addDestroyableEventListener(this.cbSelect, 'change', this.onCheckboxChanged.bind(this));
        this.addDestroyableEventListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
    }

    private setLabelName() {
        this.eLabel.innerHTML = _.escape(this.colState.displayName) as string;
    }

    private onLabelClicked(): void {
        this.cbSelect.setSelected(!this.cbSelect.isSelected());
    }

    private onCheckboxChanged(): void {
        this.colState.selected = this.cbSelect.isSelected();
        this.selectionChanged(this.colState);
    }
}