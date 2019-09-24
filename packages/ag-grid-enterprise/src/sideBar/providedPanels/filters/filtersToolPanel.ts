import {
    _,
    AgGroupComponent,
    Autowired,
    ColDef,
    Column,
    ColumnController,
    Component,
    Events,
    EventService,
    GridApi,
    IToolPanelComp,
    IToolPanelParams, OriginalColumnGroup, OriginalColumnGroupChild
} from "ag-grid-community";

import {ToolPanelFilterComp} from "./toolPanelFilterComp";

export interface ToolPanelFiltersCompParams extends IToolPanelParams {
    syncLayoutWithGrid: boolean;
}

export interface IFiltersToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    syncLayoutWithGrid(): void;
}

export class FiltersToolPanel extends Component implements IFiltersToolPanel, IToolPanelComp {

    private static TEMPLATE =
        `<div class="ag-filter-panel" ref="ePanelContainer" />`;

    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;

    private initialised = false;
    private filterComps: ToolPanelFilterComp[] = [];

    private params: ToolPanelFiltersCompParams;

    constructor() {
        super(FiltersToolPanel.TEMPLATE);
    }

    public init(params: ToolPanelFiltersCompParams): void {
        this.initialised = true;

        const defaultParams: ToolPanelFiltersCompParams = {
            syncLayoutWithGrid: false,
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;

        if (this.params.syncLayoutWithGrid) {
            this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => this.syncLayoutWithGrid());
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());

        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.destroyFilters();
        const columnTree = this.columnController.getPrimaryColumnTree();
        this.recursivelyAddComps(columnTree);
    }

    private recursivelyAddComps(tree: OriginalColumnGroupChild[], groupComp?: AgGroupComponent): void {
        tree.forEach(child => {
            if (child instanceof OriginalColumnGroup) {
                this.recursivelyAddGroupComps(child as OriginalColumnGroup, groupComp);
            } else {
                this.addColumnComps(child as Column, groupComp);
            }
        });
    }

    private recursivelyAddGroupComps(columnGroup: OriginalColumnGroup, groupComp?: AgGroupComponent): void {
        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressToolPanel) return;

        if (columnGroup.isPadding()) {
            // skip padding groups
        } else {
            if (!groupComp) {
                const groupName = this.columnController.getDisplayNameForOriginalColumnGroup(null, columnGroup, 'toolPanel');
                groupComp = this.createGroupComp(groupName as string); //TODO handle destroy
            } else {
                const groupName = this.columnController.getDisplayNameForOriginalColumnGroup(null, columnGroup, 'toolPanel');
                groupComp.addItem(this.createGroupComp(groupName as string)); //TODO handle destroy
            }
        }

        this.recursivelyAddComps(columnGroup.getChildren(), groupComp);
    }

    private addColumnComps(column: Column, groupComp?: AgGroupComponent): void {
        if (!column.isFilterAllowed()) return;
        if (column.getColDef() && column.getColDef().suppressToolPanel) return;

        let hideHeader = false;

        if (!groupComp) {
            const groupName = this.columnController.getDisplayNameForColumn(column, 'header', false) as string;
            groupComp = this.createGroupComp(groupName); //TODO handle destroy
            hideHeader = true;
        }

        this.addFilterComp(column, groupComp, hideHeader);
    }

    private createGroupComp(title: string): AgGroupComponent {
        const groupComp = new AgGroupComponent({
            title,
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            alignItems: 'stretch',

        });
        this.getContext().wireBean(groupComp);
        this.appendChild(groupComp);
        return groupComp;
    }

    public syncLayoutWithGrid(): void {
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
            this.init(this.params);
        }
    }

    public setFilterLayout(colDefs: ColDef[]): void {
        if (!colDefs) return;

        this.destroyFilters();

        const groupComp = new AgGroupComponent({
            title: 'Fred',
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false
        });

        colDefs.forEach(colDef => {
            const key = colDef.colId ? colDef.colId : colDef.field as string;
            const column = this.columnController.getPrimaryColumn(key);
            if (column) {
                this.addFilterComp(column, groupComp);
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

    private addFilterComp(column: Column, container: AgGroupComponent | null, hideHeader = false): void {
        const toolPanelFilterComp = new ToolPanelFilterComp(hideHeader);
        this.getContext().wireBean(toolPanelFilterComp);
        toolPanelFilterComp.setColumn(column);
        this.filterComps.push(toolPanelFilterComp);

        if (container) {
            container.addItem(toolPanelFilterComp);
            if (hideHeader) {
                container.toggleGroupExpand();
            }
            this.addDestroyableEventListener(toolPanelFilterComp, Column.EVENT_FILTER_CHANGED, () => this.refreshFilter(container));
        } else {
            this.appendChild(toolPanelFilterComp);
        }
    }

    private refreshFilter(container: AgGroupComponent) {
        const hasFilters = this.filterComps.some(comp => comp.isFilterActive());

        _.addOrRemoveCssClass(container.getGui(), 'ag-has-filter', hasFilters);
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
