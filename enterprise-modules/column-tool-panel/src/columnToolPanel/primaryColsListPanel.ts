import {
    _,
    AbstractColDef,
    Autowired,
    ColGroupDef,
    Column,
    ColumnApi,
    ColumnController,
    Component,
    Events,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    ToolPanelColumnCompParams,
    ManagedFocusComponent,
    KeyCode,
    ColumnEventType
} from "@ag-grid-community/core";
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp";
import { ToolPanelColumnComp } from "./toolPanelColumnComp";
import { BaseColumnItem } from "./primaryColsPanel";
import { ToolPanelColDefService } from "@ag-grid-enterprise/side-bar";
import { ExpandState } from "./primaryColsHeaderPanel";

export type ColumnItem = BaseColumnItem & Component;
export type ColumnFilterResults = { [id: string]: boolean; };

export class PrimaryColsListPanel extends ManagedFocusComponent {

    public static TEMPLATE = /* html */ `<div class="ag-column-select-list" role="tree"></div>`;

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('toolPanelColDefService') private colDefService: ToolPanelColDefService;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private columnTree: OriginalColumnGroupChild[];

    private allowDragging: boolean;
    private selectAllChecked = true;
    private filterText: string | null;
    private filterResults: ColumnFilterResults;
    private expandGroupsByDefault: boolean;
    private params: ToolPanelColumnCompParams;
    private columnComps: Map<string, ColumnItem> = new Map();
    private eventType: ColumnEventType;

    constructor() {
        super(PrimaryColsListPanel.TEMPLATE);
    }

    public init(
        params: ToolPanelColumnCompParams,
        allowDragging: boolean,
        eventType: ColumnEventType): void
    {
        this.params = params;
        this.allowDragging = allowDragging;
        this.eventType = eventType;

        console.log("this.eventType: ", this.eventType);

        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));

        const eventsImpactingCheckedState: string[] = [
            Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            Events.EVENT_COLUMN_PIVOT_CHANGED,
            Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            Events.EVENT_COLUMN_VISIBLE,
            Events.EVENT_NEW_COLUMNS_LOADED
        ];

        eventsImpactingCheckedState.forEach(event => {
            // update header select all checkbox with current selection state
            this.addManagedListener(this.eventService, event, this.fireSelectionChangedEvent.bind(this));
        });

        this.expandGroupsByDefault = !this.params.contractColumnSelection;

        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        switch (e.keyCode) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                e.preventDefault();
                this.navigateToNextItem(e.keyCode === KeyCode.UP);
                break;
        }

    }

    private navigateToNextItem(up: boolean): void {
        const nextEl = this.focusController.findNextFocusableElement(this.getFocusableElement(), true, up);

        if (nextEl) {
            nextEl.focus();
        }
    }

    public onColumnsChanged(): void {
        const pivotModeActive = this.columnController.isPivotMode();
        const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        shouldSyncColumnLayoutWithGrid ? this.syncColumnLayout() : this.buildTreeFromProvidedColumnDefs();

        this.setFilterText(this.filterText);
    }

    public syncColumnLayout(): void {
        this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
    }

    public setColumnLayout(colDefs: AbstractColDef[]): void {
        this.destroyColumnComps();

        // create column tree using supplied colDef's
        this.columnTree = this.colDefService.createColumnTree(colDefs);

        // using col defs to check if groups exist as it could be a custom layout
        const groupsExist = colDefs.some(colDef => {
            return colDef && typeof (colDef as ColGroupDef).children !== 'undefined';
        });

        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.recursivelySetVisibility(this.columnTree, true);

        // notify header
        this.notifyListeners();
    }

    private buildTreeFromProvidedColumnDefs(): void {
        this.destroyColumnComps();

        // add column / group comps to tool panel
        this.columnTree = this.columnController.getPrimaryColumnTree();
        const groupsExist = this.columnController.isPrimaryColumnGroupsPresent();
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.recursivelySetVisibility(this.columnTree, true);

        // notify header
        this.notifyListeners();
    }

    private recursivelyAddComps(tree: OriginalColumnGroupChild[], dept: number, groupsExist: boolean): void {
        tree.forEach(child => {
            if (child instanceof OriginalColumnGroup) {
                this.recursivelyAddGroupComps(child as OriginalColumnGroup, dept, groupsExist);
            } else {
                this.addColumnComps(child as Column, dept, groupsExist);
            }
        });
    }

    private recursivelyAddGroupComps(columnGroup: OriginalColumnGroup, dept: number, groupsExist: boolean): void {
        // only render group if user provided the definition
        let newDept: number;

        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressColumnsToolPanel) {
            return;
        }

        if (!columnGroup.isPadding()) {
            const renderedGroup = new ToolPanelColumnGroupComp(columnGroup, dept, this.allowDragging, this.expandGroupsByDefault,
                this.onGroupExpanded.bind(this), () => this.filterResults, this.eventType);

            this.getContext().createBean(renderedGroup);
            const renderedGroupGui = renderedGroup.getGui();
            this.appendChild(renderedGroupGui);

            // we want to indent on the gui for the children
            newDept = dept + 1;

            // group comps are stored using a custom key (groupId + child colIds concatenated) as we need
            // to distinguish individual column groups after they have been split by user
            const key = this.getColumnCompId(columnGroup);
            this.columnComps.set(key, renderedGroup);
        } else {
            // no children, so no indent
            newDept = dept;
        }

        this.recursivelyAddComps(columnGroup.getChildren(), newDept, groupsExist);
    }

    private addColumnComps(column: Column, dept: number, groupsExist: boolean): void {
        if (column.getColDef() && column.getColDef().suppressColumnsToolPanel) {
            return;
        }

        const columnComp = new ToolPanelColumnComp(column, dept, this.allowDragging, groupsExist);
        this.getContext().createBean(columnComp);

        const columnCompGui = columnComp.getGui();
        this.appendChild(columnCompGui);

        this.columnComps.set(column.getId(), columnComp);
    }

    public onGroupExpanded(): void {
        this.recursivelySetVisibility(this.columnTree, true);
        this.fireGroupExpandedEvent();
    }

    public doSetExpandedAll(value: boolean): void {
        this.columnComps.forEach(renderedItem => {
            if (renderedItem.isExpandable()) {
                renderedItem.setExpanded(value);
            }
        });
    }

    public setGroupsExpanded(expand: boolean, groupIds?: string[]): void {
        const expandedGroupIds: string[] = [];

        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }

        groupIds.forEach(suppliedGroupId => {
            // we need to search through all comps to handle the case when groups are split
            this.columnComps.forEach((comp, key) => {
                // check if group comp starts with supplied group id as the tool panel keys contain
                // groupId + childIds concatenated
                const foundMatchingGroupComp = key.indexOf(suppliedGroupId) === 0;
                if (foundMatchingGroupComp) {
                    comp.setExpanded(expand);
                    expandedGroupIds.push(suppliedGroupId);
                }
            });
        });

        const unrecognisedGroupIds = groupIds.filter(groupId => !_.includes(expandedGroupIds, groupId));
        if (unrecognisedGroupIds.length > 0) {
            console.warn('ag-Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
        }
    }

    private getExpandState(): ExpandState {
        let expandedCount = 0;
        let notExpandedCount = 0;

        const recursiveFunc = (items: OriginalColumnGroupChild[]) => {
            items.forEach(item => {

                // only interested in groups
                if (item instanceof OriginalColumnGroup) {
                    const compId = this.getColumnCompId(item);
                    const comp = this.columnComps.get(compId) as ToolPanelColumnGroupComp;

                    if (comp) {
                        if (comp.isExpanded()) {
                            expandedCount++;
                        } else {
                            notExpandedCount++;
                        }
                    }

                    const columnGroup = item as OriginalColumnGroup;
                    const groupChildren = columnGroup.getChildren();

                    recursiveFunc(groupChildren);
                }
            });
        };

        recursiveFunc(this.columnTree);

        if (expandedCount > 0 && notExpandedCount > 0) {
            return ExpandState.INDETERMINATE;
        }

        if (notExpandedCount > 0) {
            return ExpandState.COLLAPSED;
        }

        return ExpandState.EXPANDED;
    }

    public doSetSelectedAll(selectAllChecked: boolean): void {
        this.selectAllChecked = selectAllChecked;
        this.updateSelections();
    }

    public updateSelections(): void {
        if (this.columnApi.isPivotMode()) {
            // if pivot mode is on, then selecting columns has special meaning (eg group, aggregate, pivot etc),
            // so there is no bulk operation we can do.
            this.columnComps.forEach(column => column.onSelectAllChanged(this.selectAllChecked));
        } else {
            // we don't want to change visibility on lock visible columns
            const primaryCols = this.columnApi.getPrimaryColumns();

            const filterColsToChange = (col: Column) =>
                !col.getColDef().lockVisible && !col.getColDef().suppressColumnsToolPanel;

            const colsToChange = primaryCols.filter(filterColsToChange);

            // however if pivot mode is off, then it's all about column visibility so we can do a bulk
            // operation directly with the column controller. we could column.onSelectAllChanged(checked)
            // as above, however this would work on each column independently and take longer.
            if (!_.exists(this.filterText)) {
                this.columnController.setColumnsVisible(colsToChange, this.selectAllChecked, this.eventType);
                return;
            }

            // obtain list of columns currently filtered
            const filteredCols: string[] = [];
            _.iterateObject(this.filterResults, (key, passesFilter) => {
                if (passesFilter) filteredCols.push(key);
            });

            if (filteredCols.length > 0) {
                const filteredColsToChange = colsToChange.filter(col => _.includes(filteredCols, col.getColId()));

                // update visibility of columns currently filtered
                this.columnController.setColumnsVisible(filteredColsToChange, this.selectAllChecked, this.eventType);

                // update select all header with new state
                this.dispatchEvent({ type: 'selectionChanged', state: this.selectAllChecked });
            }
        }
    }

    private getSelectionState(): boolean | undefined {
        const allPrimaryColumns = this.columnController.getAllPrimaryColumns();
        let columns: Column[] = [];
        if (allPrimaryColumns !== null) {
            columns = allPrimaryColumns.filter(col => !col.getColDef().lockVisible);
        }
        const pivotMode = this.columnController.isPivotMode();

        let checkedCount = 0;
        let uncheckedCount = 0;

        columns.forEach(col => {
            // ignore lock visible columns
            if (col.getColDef().lockVisible) {
                return;
            }

            // not not count columns not in tool panel
            const colDef = col.getColDef();
            if (colDef && colDef.suppressColumnsToolPanel) {
                return;
            }

            // ignore columns that have been removed from panel by filter
            if (this.filterResults && !this.filterResults[col.getColId()]) return;

            let checked: boolean;
            if (pivotMode) {
                const noPivotModeOptionsAllowed = !col.isAllowPivot() && !col.isAllowRowGroup() && !col.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = col.isValueActive() || col.isPivotActive() || col.isRowGroupActive();
            } else {
                checked = col.isVisible();
            }

            checked ? checkedCount++ : uncheckedCount++;
        });

        if (checkedCount > 0 && uncheckedCount > 0) return undefined;

        return !(checkedCount === 0 || uncheckedCount > 0);
    }

    public setFilterText(filterText: string) {
        this.filterText = _.exists(filterText) ? filterText.toLowerCase() : null;
        this.filterColumns();
        this.recursivelySetVisibility(this.columnTree, true);

        // groups selection state may need to be updated when filter is present
        this.columnComps.forEach(columnComp => {
            if (columnComp instanceof ToolPanelColumnGroupComp) {
                columnComp.onColumnStateChanged();
            }
        });

        // update header panel with current selection and expanded state
        this.fireSelectionChangedEvent();
        this.fireGroupExpandedEvent();
    }

    private filterColumns(): void {
        const filterResults: { [id: string]: boolean; } = {};

        const passesFilter = (item: OriginalColumnGroupChild) => {
            if (!_.exists(this.filterText)) return true;

            const columnCompId = this.getColumnCompId(item);
            const comp = this.columnComps.get(columnCompId);
            if (!comp) return false;

            const isPaddingGroup = item instanceof OriginalColumnGroup && item.isPadding();
            if (isPaddingGroup) return false;

            const displayName = comp.getDisplayName();
            return displayName !== null ? displayName.toLowerCase().indexOf(this.filterText as string) >= 0 : true;
        };

        const recursivelyCheckFilter = (item: OriginalColumnGroupChild, parentPasses: boolean): boolean => {
            let atLeastOneChildPassed = false;
            if (item instanceof OriginalColumnGroup) {
                let groupPasses = passesFilter(item);
                item.getChildren().forEach(child => {
                    const childPasses = recursivelyCheckFilter(child, groupPasses || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                });
            }

            const filterPasses = (parentPasses || atLeastOneChildPassed) ? true : passesFilter(item);
            const columnCompId = this.getColumnCompId(item);
            filterResults[columnCompId] = filterPasses;
            return filterPasses;
        };

        this.columnTree.forEach(item => recursivelyCheckFilter(item, false));
        this.filterResults = filterResults;
    }

    private recursivelySetVisibility(columnTree: any[], parentGroupsOpen: boolean): void {
        columnTree.forEach(child => {
            const compId = this.getColumnCompId(child);
            let comp: ColumnItem = this.columnComps.get(compId);
            if (comp) {
                const filterResultExists = this.filterResults && _.exists(this.filterResults[compId]);
                const passesFilter = filterResultExists ? this.filterResults[compId] : true;
                comp.setDisplayed(parentGroupsOpen && passesFilter);
            }

            if (child instanceof OriginalColumnGroup) {
                const columnGroup = child;

                let childrenOpen: boolean;
                if (comp) {
                    const expanded = (comp as ToolPanelColumnGroupComp).isExpanded();
                    childrenOpen = parentGroupsOpen ? expanded : false;
                } else {
                    childrenOpen = parentGroupsOpen;
                }

                const children = columnGroup.getChildren();
                this.recursivelySetVisibility(children, childrenOpen);
            }
        });
    }

    private getColumnCompId = (columnGroupChild: OriginalColumnGroupChild) => {
        if (columnGroupChild instanceof OriginalColumnGroup) {
            // group comps are stored using a custom key (groupId + child colIds concatenated) as we need
            // to distinguish individual column groups after they have been split by user
            const childIds = columnGroupChild.getLeafColumns().map(child => child.getId()).join('-');
            return columnGroupChild.getId() + '-' + childIds;
        }

        return columnGroupChild.getId();
    };

    private notifyListeners(): void {
        this.fireGroupExpandedEvent();
        this.fireSelectionChangedEvent();
    }

    private fireGroupExpandedEvent(): void {
        const expandState = this.getExpandState();
        this.dispatchEvent({ type: 'groupExpanded', state: expandState });
    }

    private fireSelectionChangedEvent(): void {
        const selectionState = this.getSelectionState();
        this.dispatchEvent({ type: 'selectionChanged', state: selectionState });
    }

    private destroyColumnComps(): void {
        const eGui = this.getGui();
        if (this.columnComps) {
            this.columnComps.forEach(renderedItem => {
                eGui.removeChild(renderedItem.getGui());
                this.destroyBean(renderedItem);
            });
        }
        this.columnComps = new Map();
    }

    protected destroy(): void {
        this.destroyColumnComps();
        super.destroy();
    }
}
