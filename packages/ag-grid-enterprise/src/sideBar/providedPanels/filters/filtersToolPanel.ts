import {
    Autowired,
    Column,
    ColumnController,
    Component,
    EventService,
    IToolPanelComp,
    _
} from "ag-grid-community";

import { ToolPanelFilterComp } from "./toolPanelFilterComp";

export class FiltersToolPanel extends Component implements IToolPanelComp {

    private static TEMPLATE =
        `<div class="ag-filter-panel" ref="ePanelContainer" />`;

    @Autowired("eventService") private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;

    private initialised = false;

    constructor() {
        super(FiltersToolPanel.TEMPLATE);
    }

    public init(): void {
        this.initialised = true;
        this.eventService.addEventListener('newColumnsLoaded', () => this.onColumnsChanged());
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        const eGui = this.getGui();
        _.clearElement(eGui);
        const primaryCols = this.columnController.getAllPrimaryColumns();
        if (!primaryCols) { return; }
        const primaryColsWithFilter = primaryCols.filter(col => col.isFilterAllowed());
        primaryColsWithFilter.forEach(col => this.addColumnComps(col));
    }

    // we don't support refreshing, but must implement because it's on the tool panel interface
    public refresh(): void {
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init();
        }
    }

    private addColumnComps(column: Column): void {
        const toolPanelFilterComp = new ToolPanelFilterComp();
        this.getContext().wireBean(toolPanelFilterComp);
        toolPanelFilterComp.setColumn(column);
        this.appendChild(toolPanelFilterComp);
    }
}
