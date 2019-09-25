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
    OriginalColumnGroup,
    OriginalColumnGroupChild,
} from "ag-grid-community";

import {ToolPanelFilterComp} from "./toolPanelFilterComp";
import {ToolPanelFiltersCompParams} from "./filtersToolPanel";

export class FiltersToolPanelListPanel extends Component {

    private static TEMPLATE = `<div class="ag-filter-list-panel"></div>`;

    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;

    private initialised = false;
    private allFilterComps: (ToolPanelFilterComp | AgGroupComponent)[] = [];

    private params: ToolPanelFiltersCompParams;

    constructor() {
        super(FiltersToolPanelListPanel.TEMPLATE);
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
                this.recursivelyAddFilterGroupComps(child as OriginalColumnGroup, groupComp);
            } else {
                this.addFilterComp(child as Column, groupComp);
            }
        });
    }

    private recursivelyAddFilterGroupComps(columnGroup: OriginalColumnGroup, groupComp?: AgGroupComponent): void {
        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressToolPanel) return;

        let currentGroupComp = groupComp;

        if (!columnGroup.isPadding()) {
            const groupName = this.getGroupDisplayName(columnGroup);
            if (groupComp) {
                const subComp = this.createGroupComp(groupName as string);
                groupComp.addItem(subComp);
                currentGroupComp = subComp;
            } else {
                currentGroupComp = this.createGroupComp(groupName as string);
            }
        }

        this.recursivelyAddComps(columnGroup.getChildren(), currentGroupComp);
    }

    private createGroupComp(groupName: string): AgGroupComponent {
        const groupComp = new AgGroupComponent({
            title: groupName,
            enabled: true,
            suppressEnabledCheckbox: true,
            suppressOpenCloseIcons: false,
            alignItems: 'stretch'
        });

        this.getContext().wireBean(groupComp);
        this.appendChild(groupComp);
        this.allFilterComps.push(groupComp);
        return groupComp;
    }

    private addFilterComp(column: Column, groupComp?: AgGroupComponent): void {
        if (!column.isFilterAllowed()) return;

        //TODO: this would be breaking change???
        //if (column.getColDef() && column.getColDef().suppressToolPanel) return;

        const createFilterComp = (container: AgGroupComponent, hideHeader = false): ToolPanelFilterComp => {
            const toolPanelFilterComp = new ToolPanelFilterComp(hideHeader);
            this.getContext().wireBean(toolPanelFilterComp);

            toolPanelFilterComp.setColumn(column);
            this.allFilterComps.push(toolPanelFilterComp);
            container.addItem(toolPanelFilterComp);
            return toolPanelFilterComp;
        };

        if (groupComp) {
            // create filter comp and add it to existing group comp
            createFilterComp(groupComp);
        } else {
            // create a new group comp and add filter comp to it without a header
            const groupName = this.getColumnDisplayName(column);
            const columnGroupComp = this.createGroupComp(groupName);
            const columnFilterGroup: ToolPanelFilterComp = createFilterComp(columnGroupComp, true);
            columnGroupComp.toggleGroupExpand(false);

            this.addDestroyableEventListener(columnGroupComp, 'expanded', () => columnFilterGroup.doExpand());
            this.addDestroyableEventListener(columnGroupComp, 'collapsed', () => columnFilterGroup.doCollapse());
        }
    }

    // we don't support refreshing, but must implement because it's on the tool panel interface
    public refresh(): void {}

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
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
        for (let i = this.allFilterComps.length - 1; i >= 0; i--) {
            const filterComp = this.allFilterComps[i] as ToolPanelFilterComp;

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

    public syncLayoutWithGrid(): void {
        //TODO
    }
    public setFilterLayout(colDefs: ColDef[]): void {
        //TODO
    }

    private getGroupDisplayName(columnGroup: OriginalColumnGroup): string {
        return this.columnController.getDisplayNameForOriginalColumnGroup(null, columnGroup, 'toolPanel') as string;
    }

    private getColumnDisplayName(column: Column): string {
        return this.columnController.getDisplayNameForColumn(column, 'header', false) as string;
    }

    private destroyFilters() {
        this.allFilterComps.forEach(filterComp => filterComp.destroy());
        this.allFilterComps.length = 0;
        _.clearElement(this.getGui());
    }

    public destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
