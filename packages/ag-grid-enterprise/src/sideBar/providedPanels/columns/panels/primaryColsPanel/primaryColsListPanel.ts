import {
    _,
    Autowired,
    Column,
    ColumnController,
    Component,
    Events,
    EventService,
    GridOptionsWrapper,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    ColDef,
    ColGroupDef,
    AbstractColDef,
} from "ag-grid-community";
import {ToolPanelColumnGroupComp} from "./toolPanelColumnGroupComp";
import {ToolPanelColumnComp} from "./toolPanelColumnComp";
import {BaseColumnItem} from "./primaryColsPanel";
import {SELECTED_STATE} from "./primaryColsHeaderPanel";
import {ToolPanelColumnCompParams} from "../../columnToolPanel";
import {ColumnApi} from "ag-grid-community";

export type ColumnItem = BaseColumnItem & Component;

export class PrimaryColsListPanel extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private globalEventService: EventService;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private allowDragging: boolean;
    private params: ToolPanelColumnCompParams;

    private columnTree: OriginalColumnGroupChild[];
    private columnComps: { [key: string]: ColumnItem };

    private filterText: string | null;

    private expandGroupsByDefault: boolean;

    public static TEMPLATE = `<div class="ag-primary-cols-list-panel"></div>`;

    constructor() {
        super(PrimaryColsListPanel.TEMPLATE);
    }

    public init(params: ToolPanelColumnCompParams, allowDragging: boolean): void {
        this.params = params;
        this.allowDragging = allowDragging;

        if (this.params.syncColumnsSectionWithGrid) {
            this.addDestroyableEventListener(this.globalEventService, Events.EVENT_COLUMN_MOVED, this.syncColumnsSectionWithGrid.bind(this));
        }

        this.addDestroyableEventListener(this.globalEventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));

        this.expandGroupsByDefault = !this.params.contractColumnSelection;
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.destroyColumnComps();
        this.columnTree = this.columnController.getPrimaryColumnTree();
        const groupsExist = this.columnController.isPrimaryColumnGroupsPresent();
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.updateVisibilityOfRows();
    }

    public setColumnLayout(colDefs: AbstractColDef[]): void {
        this.destroyColumnComps();
        this.columnTree = this.createDummyColumnTree(colDefs);
        const groupsExist = colDefs.filter(this.isColGroupDef).length > 0;
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.updateVisibilityOfRows();
    }

    private syncColumnsSectionWithGrid(): void {
        const inPivotMode = this.columnController.isPivotMode();
        const pivotActive = this.columnController.isPivotActive();

        // don't update columns when grid is just showing secondary columns
        if (inPivotMode && pivotActive) return;

        // extract ordered list of leaf path trees (column group hierarchy for each individual leaf column)
        const leafPathTrees: AbstractColDef[] = this.getLeafPathTrees();

        // merge leaf path tree taking split column groups into account
        const mergedColumnTrees = this.mergeLeafPathTrees(leafPathTrees);

        // update column layout
        this.setColumnLayout(mergedColumnTrees);
    }

    private createDummyColumnTree(colDefs: AbstractColDef[]): OriginalColumnGroupChild[] {
        const createDummyColGroup = (abstractColDef: AbstractColDef, depth: number): OriginalColumnGroupChild => {
            if (this.isColGroupDef(abstractColDef)) {

                // creating 'dummy' group which is not associated with grid column group
                const groupDef = abstractColDef as ColGroupDef;
                const groupId = (typeof groupDef.groupId !== 'undefined') ? groupDef.groupId : groupDef.headerName;
                const group = new OriginalColumnGroup(groupDef, groupId as string, false, depth);
                const children: OriginalColumnGroupChild[] = [];
                groupDef.children.forEach(def => {
                    const child = createDummyColGroup(def, depth + 1);
                    // check column exists in case invalid colDef is supplied for primary column
                    if (child) {
                        children.push(child);
                    }
                });
                group.setChildren(children);

                return group;
            } else {
                const colDef = abstractColDef as ColDef;
                const key = colDef.colId ? colDef.colId : colDef.field as string;
                return this.columnController.getPrimaryColumn(key) as OriginalColumnGroupChild;
            }
        };

        return colDefs.map(colDef => createDummyColGroup(colDef, 0));
    }

    private getLeafPathTrees(): AbstractColDef[] {

        // leaf tree paths are obtained by walking up the tree starting at a column until we reach the top level group.
        const getLeafPathTree = (node: Column | OriginalColumnGroup, childDef: AbstractColDef): AbstractColDef => {
            let leafPathTree: AbstractColDef;

            // build up tree in reverse order
            if (node instanceof OriginalColumnGroup) {
                if (node.isPadding()) {
                    // skip over padding groups
                    leafPathTree = childDef;
                } else {
                    const groupDef = _.assign({}, node.getColGroupDef());
                    // ensure group contains groupId
                    groupDef.groupId = node.getGroupId();
                    groupDef.children = [childDef];
                    leafPathTree = groupDef;
                }
            } else {
                const colDef = _.assign({}, node.getColDef());
                // ensure col contains colId
                colDef.colId = node.getColId();
                leafPathTree = colDef;
            }

            // walk tree
            const parent = node.getOriginalParent();
            if (parent) {
                // keep walking up the tree until we reach the root
                return getLeafPathTree(parent, leafPathTree);
            } else {
                // we have reached the root - exit with resulting leaf path tree
                return leafPathTree;
            }
        };

        // obtain a sorted list of all grid columns
        const allGridColumns = this.columnController.getAllGridColumns();

        // only primary columns and non row group columns should appear in the tool panel
        const allPrimaryGridColumns = allGridColumns.filter(column => {
            const colDef = column.getColDef();
            const rowGroupColumn = colDef.rowGroup || colDef.rowGroupIndex || colDef.showRowGroup;
            return column.isPrimary() && !rowGroupColumn;
        });

        // construct a leaf path tree for each column
        return allPrimaryGridColumns.map(col => getLeafPathTree(col, col.getColDef()));
    }

    private mergeLeafPathTrees(leafPathTrees: AbstractColDef[]) {

        const getId = (colDef: AbstractColDef) =>
            this.isColGroupDef(colDef) ? (colDef as ColGroupDef).groupId : (colDef as ColDef).colId;

        const getLeafPathString = (leafPath: ColDef | ColGroupDef): string => {
            const group = leafPath as ColGroupDef;
            return group.children ? group.groupId + getLeafPathString(group.children[0]) : '';
        };

        const matchingRootGroupIds = (pathA: AbstractColDef, pathB: AbstractColDef) => {
            const bothPathsAreGroups = this.isColGroupDef(pathA) && this.isColGroupDef(pathB);
            return bothPathsAreGroups && getId(pathA) === getId(pathB);
        };

        const subGroupIsSplit = (currentGroup: ColGroupDef, groupToAdd: ColGroupDef) => {
            const existingChildIds = currentGroup.children.map(getId);
            const childGroupAlreadyExists = _.includes(existingChildIds, getId(groupToAdd));
            const lastChild = _.last(currentGroup.children);
            const lastChildIsDifferent = lastChild && getId(lastChild) !== getId(groupToAdd);
            return childGroupAlreadyExists && lastChildIsDifferent;
        };


        const addChildrenToGroup = (tree: AbstractColDef, groupId: string, colDef: AbstractColDef): boolean => {
            if (!this.isColGroupDef(tree)) return true;

            const currentGroup = tree as ColGroupDef;
            const groupToAdd = colDef as ColGroupDef;

            if (subGroupIsSplit(currentGroup, groupToAdd)) {
                currentGroup.children.push(groupToAdd);
                return true;
            }

            if (currentGroup.groupId === groupId) {
                // add children that don't already exist to group
                const existingChildIds = currentGroup.children.map(getId);
                const colDefAlreadyPresent = _.includes(existingChildIds, getId(groupToAdd));
                if (!colDefAlreadyPresent) {
                    currentGroup.children.push(groupToAdd);
                    return true;
                }
            }

            // recurse until correct group is found to add children
            currentGroup.children.forEach(subGroup => addChildrenToGroup(subGroup, groupId, colDef));
            return false;
        };

        const mergeTrees = (treeA: AbstractColDef, treeB: AbstractColDef): AbstractColDef => {
            if (!this.isColGroupDef(treeB)) return treeA;

            const mergeResult = treeA as AbstractColDef;
            const groupToMerge = treeB as ColGroupDef;

            if (groupToMerge.children && groupToMerge.groupId) {
                const added = addChildrenToGroup(mergeResult, groupToMerge.groupId, groupToMerge.children[0]);
                if (added) return mergeResult;
            }

            groupToMerge.children.forEach(child => mergeTrees(mergeResult, child));

            return mergeResult;
        };

        // we can't just merge the leaf path trees as groups can be split apart so the code below
        // only merges if groups containing the same root group id are contiguous.
        const mergeColDefs: AbstractColDef[] = [];
        for (let i = 1; i <= leafPathTrees.length; i++) {
            const first = leafPathTrees[i-1], second = leafPathTrees[i];
            if (matchingRootGroupIds(first, second)) {
                leafPathTrees[i] = mergeTrees(first, second);
            } else {
                mergeColDefs.push(first);
            }
        }

        return mergeColDefs;
    }

    private isColGroupDef(colDef: AbstractColDef) {
        return colDef && typeof (colDef as ColGroupDef).children !== 'undefined';
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

        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressToolPanel) {
            return;
        }

        if (!columnGroup.isPadding()) {
            const renderedGroup = new ToolPanelColumnGroupComp(columnGroup, dept, this.onGroupExpanded.bind(this),
                this.allowDragging, this.expandGroupsByDefault);
            this.getContext().wireBean(renderedGroup);
            this.getGui().appendChild(renderedGroup.getGui());
            // we want to indent on the gui for the children
            newDept = dept + 1;

            this.columnComps[columnGroup.getId()] = renderedGroup;
        } else {
            // no children, so no indent
            newDept = dept;
        }

        this.recursivelyAddComps(columnGroup.getChildren(), newDept, groupsExist);
    }

    private addColumnComps(column: Column, dept: number, groupsExist: boolean): void {
        if (column.getColDef() && column.getColDef().suppressToolPanel) {
            return;
        }

        const columnComp = new ToolPanelColumnComp(column, dept, this.allowDragging, groupsExist);
        this.getContext().wireBean(columnComp);
        this.getGui().appendChild(columnComp.getGui());

        this.columnComps[column.getId()] = columnComp;
    }

    public onGroupExpanded(): void {
        this.updateVisibilityOfRows();
        this.fireExpandedEvent();
    }

    private fireExpandedEvent(): void {
        let expandedCount = 0;
        let notExpandedCount = 0;

        const recursiveFunc = (items: OriginalColumnGroupChild[]) => {
            items.forEach(item => {
                // only interested in groups
                if (item instanceof OriginalColumnGroup) {
                    const comp = this.columnComps[item.getId()] as ToolPanelColumnGroupComp;

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

        let state: SELECTED_STATE;
        if (expandedCount > 0 && notExpandedCount > 0) {
            state = SELECTED_STATE.INDETERMINATE;
        } else if (notExpandedCount > 0) {
            state = SELECTED_STATE.UNCHECKED;
        } else {
            state = SELECTED_STATE.CHECKED;
        }

        this.dispatchEvent({type: 'groupExpanded', state: state});
    }

    public doSetExpandedAll(value: boolean): void {
        _.iterateObject(this.columnComps, (key, renderedItem) => {
            if (renderedItem.isExpandable()) {
                renderedItem.setExpanded(value);
            }
        });
    }

    public setGroupsExpanded(expand: boolean, groupIds?: string[]): void {
        const expandedGroupIds: string[] = [];

        if (!groupIds) {
            this.doSetExpandedAll(expand);
        } else {
            _.iterateObject(this.columnComps, (key, renderedItem) => {
                const shouldSetGroupExpanded = renderedItem.isExpandable() && groupIds.indexOf(key) > -1;
                if (shouldSetGroupExpanded) {
                    renderedItem.setExpanded(expand);
                    expandedGroupIds.push(key);
                }
            });
        }

        if (groupIds) {
            const unrecognisedGroupIds = groupIds.filter(groupId => expandedGroupIds.indexOf(groupId) < 0);
            if (unrecognisedGroupIds.length > 0) {
                console.warn('ag-Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
            }
        }
    }

    public doSetSelectedAll(checked: boolean): void {
        if (this.columnApi.isPivotMode()) {
            // if pivot mode is on, then selecting columns has special meaning (eg group, aggregate, pivot etc),
            // so there is no bulk operation we can do.
            _.iterateObject(this.columnComps, (key, column) => {
                column.onSelectAllChanged(checked);
            });
        } else {
            // however if pivot mode is off, then it's all about column visibility so we can do a bulk
            // operation directly with the column controller. we could column.onSelectAllChanged(checked)
            // as above, however this would work on each column independently and take longer.
            const primaryCols = this.columnApi.getPrimaryColumns();
            this.columnApi.setColumnsVisible(primaryCols, checked);
        }
    }

    public setFilterText(filterText: string) {
        this.filterText = _.exists(filterText) ? filterText.toLowerCase() : null;
        this.updateVisibilityOfRows();
    }

    private updateVisibilityOfRows(): void {
        // we have to create the filter results first as that requires dept first search, then setting
        // the visibility requires breadth first search. this is because a group passes filter if CHILDREN
        // pass filter, a column passes group open/closed visibility if a PARENT is open. so we need to do
        // two recursions. we pass the result of the first recursion to the second.
        const filterResults: { [id: string]: boolean } | null = _.exists(this.filterText) ? this.createFilterResults() : null;
        this.recursivelySetVisibility(this.columnTree, true, filterResults);
    }

    private createFilterResults(): { [id: string]: boolean } {
        const filterResults: { [id: string]: boolean } = {};

        // we recurse dept first - as the item should show if any of the children are showing

        const recursivelyCheckFilter = (items: OriginalColumnGroupChild[]): boolean => {
            let atLeastOneThisLevelPassed = false;

            items.forEach(item => {
                let atLeastOneChildPassed = false;

                if (item instanceof OriginalColumnGroup) {
                    const groupChildren = item.getChildren();
                    atLeastOneChildPassed = recursivelyCheckFilter(groupChildren);
                }

                let filterPasses: boolean;
                if (atLeastOneChildPassed) {
                    filterPasses = true;
                } else {
                    const comp = this.columnComps[item.getId()];
                    if (comp && this.filterText) {
                        const displayName = comp.getDisplayName();
                        filterPasses = displayName !== null ? displayName.toLowerCase().indexOf(this.filterText) >= 0 : true;
                    } else {
                        // if this is a dummy column group, we should return false here
                        filterPasses = !!(item instanceof OriginalColumnGroup && item.getOriginalParent());
                    }
                }

                filterResults[item.getId()] = filterPasses;

                if (filterPasses) {
                    atLeastOneThisLevelPassed = true;
                }
            });

            return atLeastOneThisLevelPassed;
        };

        recursivelyCheckFilter(this.columnTree);

        return filterResults;
    }

    private recursivelySetVisibility(columnTree: any[], parentGroupsOpen: boolean,
                                     filterResults: { [id: string]: boolean } | null): void {

        columnTree.forEach(child => {
            const comp: ColumnItem = this.columnComps[child.getId()];
            if (comp) {
                const passesFilter = filterResults ? filterResults[child.getId()] : true;
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
                this.recursivelySetVisibility(children, childrenOpen, filterResults);
            }
        });
    }

    private destroyColumnComps(): void {
        _.clearElement(this.getGui());
        if (this.columnComps) {
            _.iterateObject(this.columnComps, (key: string, renderedItem: Component) => renderedItem.destroy());
        }
        this.columnComps = {};
    }

    public destroy(): void {
        super.destroy();
        this.destroyColumnComps();
    }
}
