import {
    _,
    Autowired,
    Column,
    ColumnController,
    Component,
    EventService,
    IToolPanelComp,
    ColDef, Events
} from "ag-grid-community";

import { ToolPanelFilterComp } from "./toolPanelFilterComp";

export interface IFiltersToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
}

export class FiltersToolPanel extends Component implements IFiltersToolPanel, IToolPanelComp {

    private static TEMPLATE =
        `<div class="ag-filter-panel" ref="ePanelContainer" />`;

    @Autowired("eventService") private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;

    private initialised = false;
    private filterComps: ToolPanelFilterComp[] = [];

    constructor() {
        super(FiltersToolPanel.TEMPLATE);
    }

    public init(): void {
        this.initialised = true;

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => this.onColumnsMoved());
        this.addDestroyableEventListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());

        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.destroyFilters();
        const primaryCols: Column[] | null = this.columnController.getAllPrimaryColumns();
        if (!primaryCols) { return; }
        const primaryColsWithFilter = primaryCols.filter(col => col.isFilterAllowed());
        primaryColsWithFilter.forEach(col => this.addFilterComps(col));
    }

    public onColumnsMoved(): void {
        const orderedGridColumns = this.columnController.getAllGridColumns();

        const orderedColumnsWithFilters = orderedGridColumns.filter(col => col.isFilterAllowed());
        const newFilterLayout = orderedColumnsWithFilters.map(col => col.getColDef());

        // update filters tool panel with new column order
        this.setFilterLayout(newFilterLayout);
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

    public setFilterLayout(colDefs: ColDef[]): void {
        if (!colDefs) return;

        this.destroyFilters();

        colDefs.forEach(colDef => {
            const key = colDef.colId ? colDef.colId : colDef.field as string;
            const column = this.columnController.getPrimaryColumn(key);
            if (column) {
                this.addFilterComps(column);
            } else {
                console.warn('ag-Grid: unable to find column for the Filters Tool Panel using ' +
                    'supplied colDef:', colDef);
            }
        });
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
        for (let i = this.filterComps.length - 1; i >= 0; i--) {
            const filterComp = this.filterComps[i] as ToolPanelFilterComp;

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

    private addFilterComps(column: Column): void {
        const toolPanelFilterComp = new ToolPanelFilterComp();
        this.getContext().wireBean(toolPanelFilterComp);
        toolPanelFilterComp.setColumn(column);
        this.appendChild(toolPanelFilterComp);
        this.filterComps.push(toolPanelFilterComp);
    }

    private destroyFilters() {
        this.filterComps.forEach(filterComp => filterComp.destroy());
        this.filterComps.length = 0;
        _.clearElement(this.getGui());
    }

    public destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
