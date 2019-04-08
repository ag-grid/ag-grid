import { 
    AgCheckbox,
    Component,
    PostConstruct,
    RefSelector,
    _ 
} from "ag-grid-community";
import { ChartModel, ColState } from "../chartModel";

export class ChartColumnPanel extends Component {

    //TODO refactor class to be chart menu specific
    public static TEMPLATE = `<div class="ag-primary-cols-list-panel"></div>`;

    private columnComps: { [key: string]: ChartPanelColumnComp } = {};
    private chartModel: ChartModel;

    constructor(chartModel: ChartModel) {
        super(ChartColumnPanel.TEMPLATE);
        this.chartModel = chartModel;
    }

    public init(): void {
        const colStateForMenu = this.chartModel.getColStateForMenu();

        colStateForMenu.forEach(colState => {
            const colStateChanged = () => this.chartModel.update(colStateForMenu);
            const columnComp = new ChartPanelColumnComp(colState, colStateChanged);
            this.getContext().wireBean(columnComp);
            this.getGui().appendChild(columnComp.getGui());
            this.columnComps[colState.colId] = columnComp;
        });
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

class ChartPanelColumnComp extends Component {

    //TODO refactor class to be chart menu specific
    private static TEMPLATE =
        `<div class="ag-column-tool-panel-column">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-drag" ref="eDragHandle"></span>
            <span class="ag-column-tool-panel-column-label" ref="eLabel"></span>
        </div>`;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('cbSelect') private cbSelect: AgCheckbox;

    private readonly colState: ColState;
    private readonly colStateChanged: () => void;

    constructor(colState: ColState, colStateChanged: () => void) {
        super();
        this.colState = colState;
        this.colStateChanged = colStateChanged;
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(ChartPanelColumnComp.TEMPLATE);

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
        this.colStateChanged();
    }
}