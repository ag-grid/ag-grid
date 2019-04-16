import {
    AgCheckbox,
    AgRadioButton,
    Component,
    PostConstruct,
    RefSelector,
    _
} from "ag-grid-community";
import { ChartController } from "../chartController";
import { ColState } from "../chartModel";

export class ChartColumnPanel extends Component {

    //TODO refactor class to be chart menu specific
    public static TEMPLATE = `<div class="ag-primary-cols-list-panel"></div>`;

    private columnComps: { [key: string]: ChartPanelRadioComp | ChartPanelCheckboxComp } = {};
    private dimensionComps: ChartPanelRadioComp[] = [];
    private chartController: ChartController;

    constructor(chartModel: ChartController) {
        super(ChartColumnPanel.TEMPLATE);
        this.chartController = chartModel;
    }

    public init(): void {
        const {dimensionCols, valueCols} = this.chartController.getColStateForMenu();

        // create ChartPanelRadioComps for dimensions and ChartPanelCheckboxComp for value cols
        dimensionCols.forEach(this.getColumnStateMapper(true));
        valueCols.forEach(this.getColumnStateMapper(false));
    }

    private getColumnStateMapper(dimension: boolean) {

        const checkboxChanged = (updatedColState: ColState) => this.chartController.updateForColumnSelection(updatedColState);

        const radioButtonChanged = (radioComp: ChartPanelRadioComp, updatedColState: ColState) => {
            this.dimensionComps.forEach(comp => comp.select(false));
            this.chartController.updateForColumnSelection(updatedColState);
            radioComp.select(true);
        };

        return (colState: ColState) => {
            const comp = dimension ?
                new ChartPanelRadioComp(colState, radioButtonChanged) :
                new ChartPanelCheckboxComp(colState, checkboxChanged);

            this.getContext().wireBean(comp);
            this.getGui().appendChild(comp.getGui());
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
        `<div class="ag-column-tool-panel-column">
            <ag-radio-button ref="rbSelect" class="ag-column-select-checkbox"></ag-radio-button>
            <span class="ag-column-tool-panel-column-label" ref="eLabel"></span>
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
        `<div class="ag-column-tool-panel-column">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-tool-panel-column-label" ref="eLabel"></span>
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