import {
    _,
    Autowired,
    Component,
    ColumnController,
    AgCheckbox,
    Column,
    PostConstruct,
    RefSelector
} from "ag-grid-community/main";
import {IGridChartComp} from "../gridChartComp";

export class ChartColumnPanel extends Component {

    @Autowired('columnController') private columnController: ColumnController;

    private columnComps: { [key: string]: ChartPanelColumnComp } = {};

    public static TEMPLATE = `<div class="ag-primary-cols-list-panel"></div>`;
    private chart: IGridChartComp;
    private selectedColIds: string[];

    constructor(chart: IGridChartComp) {
        super(ChartColumnPanel.TEMPLATE);
        this.chart = chart;
    }

    public init(): void {
        const allValueColsInRange = this.chart.getFields();
        this.selectedColIds = allValueColsInRange;

        const updateSelections = (colId: string, selected: boolean) => {
            if (selected) {
                this.selectedColIds.push(colId);
            } else {
                const includeColId = (selectedId: string) => selectedId !== colId;
                this.selectedColIds = this.selectedColIds.filter(includeColId);
            }
            this.chart.updateChart(this.selectedColIds);
        };

        const allDisplayedColumns = this.columnController.getAllDisplayedColumns();

        const includeColumn = (col: Column) => allValueColsInRange.indexOf(col.getColId()) > -1;
        const allValueColumnsInRange = allDisplayedColumns.filter(includeColumn);

        allValueColumnsInRange.forEach(col => {
            const selected = this.selectedColIds.indexOf(col.getColId()) > -1;
            const columnComp = new ChartPanelColumnComp(col, selected, updateSelections);
            this.getContext().wireBean(columnComp);
            this.getGui().appendChild(columnComp.getGui());
            this.columnComps[col.getId()] = columnComp;
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

    private static TEMPLATE =
        `<div class="ag-column-tool-panel-column">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-drag" ref="eDragHandle"></span>
            <span class="ag-column-tool-panel-column-label" ref="eLabel"></span>
        </div>`;

    @Autowired('columnController') private columnController: ColumnController;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('cbSelect') private cbSelect: AgCheckbox;

    private displayName: string;

    private readonly column: Column;
    private readonly initialSelection: boolean;
    private readonly updateSelections: (colId: string, selected: boolean) => void;

    constructor(column: Column, initialSelection: boolean, updateSelections: (colId: string, selected: boolean) => void) {
        super();
        this.column = column;
        this.initialSelection = initialSelection;
        this.updateSelections = updateSelections;
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(ChartPanelColumnComp.TEMPLATE);

        this.setLabelName();

        this.cbSelect.setSelected(this.initialSelection);

        this.addDestroyableEventListener(this.cbSelect, 'change', this.onCheckboxChanged.bind(this));
        this.addDestroyableEventListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
    }

    private setLabelName() {
        const displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
        this.displayName = displayName ? displayName : '';
        this.eLabel.innerHTML = _.escape(displayName) as string;
    }

    private onLabelClicked(): void {
        this.cbSelect.setSelected(!this.cbSelect.isSelected());
    }

    private onCheckboxChanged(): void {
        this.updateSelections(this.column.getColId(), this.cbSelect.isSelected());
    }
}