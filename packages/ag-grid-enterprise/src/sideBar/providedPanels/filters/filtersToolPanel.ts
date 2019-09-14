import {
    _,
    Autowired,
    Column,
    ColumnController,
    Component,
    EventService,
    IToolPanelComp,
} from "ag-grid-community";

import { ToolPanelFilterComp } from "./toolPanelFilterComp";

export interface IFiltersToolPanel {
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
}

export class FiltersToolPanel extends Component implements IFiltersToolPanel, IToolPanelComp {

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
        _.clearElement(this.getGui());
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

    public expandFilters(colIds?: string[]): void {
        this.executeOnFilterComps(filterComp => filterComp.doExpand(), colIds);
    }

    public collapseFilters(colIds?: string[]): void {
        this.executeOnFilterComps(filterComp => filterComp.doCollapse(), colIds);
    }

    private executeOnFilterComps(callbackFunc: (filterComp: ToolPanelFilterComp) => void, colIds?: string[]): void {
        const executedColIds: string[] = [];

        // done in reverse order to ensure top scroll position
        const filterComps = this.getChildComponents();
        for (let i = filterComps.length - 1; i >= 0; i--) {
            const filterComp = filterComps[i] as ToolPanelFilterComp;

            if (!colIds) {
                // execute for all comps when no colIds are supplied
                callbackFunc(filterComp);
            } else {
                const colId = filterComp.getColumn().getColId();
                const shouldExecute = colIds.indexOf(colId) > -1;
                if (shouldExecute) {
                    callbackFunc(filterComp);
                    executedColIds.push(colId);
                }
            }
        }

        if (colIds) {
            const unrecognisedColIds = colIds.filter(colId => executedColIds.indexOf(colId) < 0);
            if (unrecognisedColIds.length > 0) {
                console.warn('ag-Grid: unable to find filters for colIds:', unrecognisedColIds);
            }
        }
    }

    private addColumnComps(column: Column): void {
        const toolPanelFilterComp = new ToolPanelFilterComp();
        this.getContext().wireBean(toolPanelFilterComp);
        toolPanelFilterComp.setColumn(column);
        this.appendChild(toolPanelFilterComp);
    }
}
