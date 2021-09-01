import {
    _,
    AbstractColDef,
    Autowired,
    ColGroupDef,
    Column,
    ColumnApi,
    ColumnModel,
    ColumnEventType,
    Component,
    Events,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    ToolPanelColumnCompParams,
    VirtualList,
    VirtualListModel,
    PreDestroy,
    DropTarget,
    DragAndDropService,
    DragSourceType,
    DraggingEvent,
    AutoScrollService,
    ColumnGroup
} from "@ag-grid-community/core";
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp";
import { ToolPanelColumnComp } from "./toolPanelColumnComp";
import { ToolPanelColDefService } from "@ag-grid-enterprise/side-bar";
import { ExpandState } from "./primaryColsHeaderPanel";
import { ColumnModelItem } from "./columnModelItem";
import { ModelItemUtils } from "./modelItemUtils";

class UIColumnModel implements VirtualListModel {

    private readonly items: ColumnModelItem[];

    constructor(items: ColumnModelItem[]) {
        this.items = items;
    }

    public getRowCount(): number {
        return this.items.length;
    }

    public getRow(index: number): ColumnModelItem {
        return this.items[index];
    }
}

const PRIMARY_COLS_LIST_PANEL_CLASS = 'ag-column-select-list';
const PRIMARY_COLS_LIST_ITEM_HOVERED = 'ag-column-list-item-hovered';
type DragColumnItem = {
    rowIndex: number,
    position: 'top' | 'bottom',
    component: ToolPanelColumnGroupComp | ToolPanelColumnComp
};

export class PrimaryColsListPanel extends Component {

    public static TEMPLATE = /* html */ `<div class="${PRIMARY_COLS_LIST_PANEL_CLASS}" role="tree"></div>`;

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('toolPanelColDefService') private colDefService: ToolPanelColDefService;
    @Autowired('modelItemUtils') private modelItemUtils: ModelItemUtils;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    private autoScrollService: AutoScrollService;
    private allowDragging: boolean;
    private filterText: string | null;
    private expandGroupsByDefault: boolean;
    private params: ToolPanelColumnCompParams;
    private eventType: ColumnEventType;

    private groupsExist: boolean;

    private virtualList: VirtualList;

    private allColsTree: ColumnModelItem[];
    private displayedColsList: ColumnModelItem[];
    private destroyColumnItemFuncs: (() => void)[] = [];

    private currentDragColumn: Column | ColumnGroup | null = null;
    private lastHoveredColumnItem: DragColumnItem | null = null;

    constructor() {
        super(PrimaryColsListPanel.TEMPLATE);
    }

    @PreDestroy
    private destroyColumnTree(): void {
        this.allColsTree = [];
        this.destroyColumnItemFuncs.forEach(f => f());
        this.destroyColumnItemFuncs = [];
    }

    public init(
        params: ToolPanelColumnCompParams,
        allowDragging: boolean,
        eventType: ColumnEventType): void {
        this.params = params;
        this.allowDragging = allowDragging;
        this.eventType = eventType;

        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START, this.columnPanelItemDragStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END, this.columnPanelItemDragEnd.bind(this));

        const eventsImpactingCheckedState: string[] = [
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

        this.virtualList = this.createManagedBean(new VirtualList('column-select', 'tree'));
        const virtualListGui = this.virtualList.getGui();
        this.appendChild(virtualListGui);

        this.autoScrollService = new AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: () => virtualListGui.scrollTop,
            setVerticalPosition: (position) => virtualListGui.scrollTop = position
        });

        this.virtualList.setComponentCreator(
            (item: ColumnModelItem, listItemElement: HTMLElement) => this.createComponentFromItem(item, listItemElement)
        );

        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }

        this.createDropTarget();
    }

    private createDropTarget(): void {
        const dropTarget: DropTarget = {
            isInterestedIn: (type: DragSourceType) => type === DragSourceType.ToolPanel,
            getIconName:() => DragAndDropService.ICON_MOVE,
            getContainer: () => this.getGui(),
            onDragging: (e) => this.onDragging(e),
            onDragStop: (e) => this.onDragStop(e),
            onDragLeave: (e) => this.onDragLeave(e)
        };

        this.dragAndDropService.addDropTarget(dropTarget);
    }

    private columnPanelItemDragStart({ column }: { column: Column | ColumnGroup }): void {
        this.currentDragColumn = column;
    }

    private columnPanelItemDragEnd(): void {
        window.setTimeout(() => this.currentDragColumn = null, 10);
    }

    private onDragging(e: DraggingEvent) {
        if (!this.currentDragColumn) { return; }

        const hoveredColumnItem = this.getDragColumnItem(e);
        const comp = this.virtualList.getComponentAt(hoveredColumnItem.rowIndex);

        if (!comp) { return; }

        const el = comp!.getGui().parentElement as HTMLElement

        if (
            this.lastHoveredColumnItem &&
            this.lastHoveredColumnItem.rowIndex === hoveredColumnItem.rowIndex &&
            this.lastHoveredColumnItem.position === hoveredColumnItem.position
            ) { return; }

        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredColumnItem = hoveredColumnItem;

        _.radioCssClass(el, `${PRIMARY_COLS_LIST_ITEM_HOVERED}`);
        _.radioCssClass(el, `ag-item-highlight-${hoveredColumnItem.position}`);
    }

    private getDragColumnItem(e: DraggingEvent): DragColumnItem {
        const virtualListGui = this.virtualList.getGui();
        const paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop as string);
        const rowHeight = this.virtualList.getRowHeight();
        const scrollTop = this.virtualList.getScrollTop();
        const rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        const maxLen = this.displayedColsList.length - 1;
        const normalizedRowIndex = Math.trunc(Math.min(maxLen, rowIndex));

        return {
            rowIndex: normalizedRowIndex,
            position: (Math.round(rowIndex) > rowIndex || rowIndex > maxLen) ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex) as ToolPanelColumnGroupComp | ToolPanelColumnComp
        };
    }

    private onDragStop(e: DraggingEvent) {
        const targetIndex: number | null = this.getTargetIndex();
        const columnsToMove: Column[] = this.getColumnsToMove();

        if (targetIndex != null) { 
            this.columnModel.moveColumns(columnsToMove, targetIndex);
        }

        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }

    private getTargetIndex(): number | null {
        if (!this.lastHoveredColumnItem) { return null; }
        const columnItemComponent = this.lastHoveredColumnItem.component;
        let isBefore = this.lastHoveredColumnItem.position === 'top';

        let targetColumn: Column;

        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            const columns = columnItemComponent.getColumns();
            targetColumn =  columns[0];
            isBefore = true;
        } else {
            targetColumn = columnItemComponent.getColumn();
        }

        const targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);

        return isBefore ? Math.max(0, targetColumnIndex) : targetColumnIndex + 1;
    }

    private getColumnsToMove(): Column[] {
        if (this.currentDragColumn instanceof ColumnGroup) {
            return this.currentDragColumn.getLeafColumns();
        }

        return [this.currentDragColumn!];
    }

    private onDragLeave(e: DraggingEvent) {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }

    private clearHoveredItems(): void {
        const virtualListGui = this.virtualList.getGui();
        virtualListGui.querySelectorAll(`.${PRIMARY_COLS_LIST_ITEM_HOVERED}`).forEach(el => {
            [
                PRIMARY_COLS_LIST_ITEM_HOVERED,
                'ag-item-highlight-top',
                'ag-item-highlight-bottom'
            ].forEach(cls => {
                _.removeCssClass((el as HTMLElement), cls);
            });
        });
        this.lastHoveredColumnItem = null;
    }

    private createComponentFromItem(item: ColumnModelItem, listItemElement: HTMLElement): Component {
        if (item.isGroup()) {
            const renderedGroup = new ToolPanelColumnGroupComp(item, this.allowDragging, this.eventType, listItemElement);
            this.getContext().createBean(renderedGroup);

            return renderedGroup;
        }

        const columnComp = new ToolPanelColumnComp(item.getColumn(), item.getDept(), this.allowDragging, this.groupsExist, listItemElement);
        this.getContext().createBean(columnComp);

        return columnComp;
    }

    public onColumnsChanged(): void {
        const expandedStates = this.getExpandedStates();

        const pivotModeActive = this.columnModel.isPivotMode();
        const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;

        if (shouldSyncColumnLayoutWithGrid) {
            this.buildTreeFromWhatGridIsDisplaying();
        } else {
            this.buildTreeFromProvidedColumnDefs();
        }

        this.setExpandedStates(expandedStates);

        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }

    private getExpandedStates(): {[key:string]:boolean} {
        if (!this.allColsTree) { return {}; }

        const res: {[id:string]:boolean} = {};
        this.forEachItem(item => {
            if (!item.isGroup()) { return; }
            const colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                res[colGroup.getId()] = item.isExpanded();
            }
        });

        return res;
    }

    private setExpandedStates(states: {[key:string]:boolean}): void {
        if (!this.allColsTree) { return; }

        this.forEachItem(item => {
            if (!item.isGroup()) { return; }
            const colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                const expanded = states[colGroup.getId()];
                const groupExistedLastTime = expanded != null;
                if (groupExistedLastTime) {
                    item.setExpanded(expanded);
                }
            }
        });
    }

    private buildTreeFromWhatGridIsDisplaying(): void {
        this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
    }

    public setColumnLayout(colDefs: AbstractColDef[]): void {
        const columnTree = this.colDefService.createColumnTree(colDefs);
        this.buildListModel(columnTree);

        // using col defs to check if groups exist as it could be a custom layout
        this.groupsExist = colDefs.some(colDef => {
            return colDef && typeof (colDef as ColGroupDef).children !== 'undefined';
        });

        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }

    private buildTreeFromProvidedColumnDefs(): void {
        // add column / group comps to tool panel
        this.buildListModel(this.columnModel.getPrimaryColumnTree());
        this.groupsExist = this.columnModel.isPrimaryColumnGroupsPresent();
    }

    private buildListModel(columnTree: OriginalColumnGroupChild[]): void {
        const columnExpandedListener = this.onColumnExpanded.bind(this);
        const addListeners = (item: ColumnModelItem) => {
            item.addEventListener(ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            const removeFunc = item.removeEventListener.bind(item, ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            this.destroyColumnItemFuncs.push(removeFunc);
        };

        const recursivelyBuild = (tree: OriginalColumnGroupChild[], dept: number, parentList: ColumnModelItem[]): void => {
            tree.forEach(child => {
                if (child instanceof OriginalColumnGroup) {
                    createGroupItem(child, dept, parentList);
                } else {
                    createColumnItem(child as Column, dept, parentList);
                }
            });
        };

        const createGroupItem = (columnGroup: OriginalColumnGroup, dept: number, parentList: ColumnModelItem[]): void => {
            const columnGroupDef = columnGroup.getColGroupDef();
            const skipThisGroup = columnGroupDef && columnGroupDef.suppressColumnsToolPanel;
            if (skipThisGroup) { return; }

            if (columnGroup.isPadding()) {
                recursivelyBuild(columnGroup.getChildren(), dept, parentList);
                return;
            }

            const displayName = this.columnModel.getDisplayNameForOriginalColumnGroup(null, columnGroup, this.eventType);
            const item: ColumnModelItem = new ColumnModelItem(displayName, columnGroup, dept, true, this.expandGroupsByDefault);

            parentList.push(item);
            addListeners(item);

            recursivelyBuild(columnGroup.getChildren(), dept + 1, item.getChildren());
        };

        const createColumnItem = (column: Column, dept: number, parentList: ColumnModelItem[]): void => {
            const skipThisColumn = column.getColDef() && column.getColDef().suppressColumnsToolPanel;

            if (skipThisColumn) { return; }

            const displayName = this.columnModel.getDisplayNameForColumn(column, 'columnToolPanel');

            parentList.push(new ColumnModelItem(displayName, column, dept));
        };

        this.destroyColumnTree();
        recursivelyBuild(columnTree, 0, this.allColsTree);
    }

    private onColumnExpanded(): void {
        this.flattenAndFilterModel();
    }

    private flattenAndFilterModel(): void {
        this.displayedColsList = [];

        const recursiveFunc = (item: ColumnModelItem) => {
            if (!item.isPassesFilter()) { return; }
            this.displayedColsList.push(item);
            if (item.isGroup() && item.isExpanded()) {
                item.getChildren().forEach(recursiveFunc);
            }
        };

        this.allColsTree.forEach(recursiveFunc);
        this.virtualList.setModel(new UIColumnModel(this.displayedColsList));

        const focusedRow = this.virtualList.getLastFocusedRow();
        this.virtualList.refresh();

        if (focusedRow != null) {
            this.focusRowIfAlive(focusedRow);
        }

        this.notifyListeners();
    }

    private focusRowIfAlive(rowIndex: number): void {
        window.setTimeout(() => {
            if (this.isAlive()) {
                this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    }

    private forEachItem(callback: (item: ColumnModelItem) => void): void {
        const recursiveFunc = (items: ColumnModelItem[]) => {
            items.forEach(item => {
                callback(item);
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
            });
        };
        recursiveFunc(this.allColsTree);
    }

    public doSetExpandedAll(value: boolean): void {
        this.forEachItem(item => {
            if (item.isGroup()) {
                item.setExpanded(value);
            }
        });
    }

    public setGroupsExpanded(expand: boolean, groupIds?: string[]): void {
        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }

        const expandedGroupIds: string[] = [];

        this.forEachItem(item => {
            if (!item.isGroup()) { return; }

            const groupId = item.getColumnGroup().getId();
            if (groupIds.indexOf(groupId) >= 0) {
                item.setExpanded(expand);
                expandedGroupIds.push(groupId);
            }
        });

        const unrecognisedGroupIds = groupIds.filter(groupId => !_.includes(expandedGroupIds, groupId));
        if (unrecognisedGroupIds.length > 0) {
            console.warn('AG Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
        }
    }

    private getExpandState(): ExpandState {
        let expandedCount = 0;
        let notExpandedCount = 0;

        this.forEachItem(item => {
            if (!item.isGroup()) { return; }
            if (item.isExpanded()) {
                expandedCount++;
            } else {
                notExpandedCount++;
            }
        });

        if (expandedCount > 0 && notExpandedCount > 0) {
            return ExpandState.INDETERMINATE;
        }

        if (notExpandedCount > 0) {
            return ExpandState.COLLAPSED;
        }

        return ExpandState.EXPANDED;
    }

    public doSetSelectedAll(selectAllChecked: boolean): void {
        this.modelItemUtils.selectAllChildren(this.allColsTree, selectAllChecked, this.eventType);
    }

    private getSelectionState(): boolean | undefined {

        let checkedCount = 0;
        let uncheckedCount = 0;

        const pivotMode = this.columnModel.isPivotMode();

        this.forEachItem(item => {
            if (item.isGroup()) { return; }
            if (!item.isPassesFilter()) { return; }

            const column = item.getColumn();
            const colDef = column.getColDef();

            let checked: boolean;

            if (pivotMode) {
                const noPivotModeOptionsAllowed = !column.isAllowPivot() && !column.isAllowRowGroup() && !column.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = column.isValueActive() || column.isPivotActive() || column.isRowGroupActive();
            } else {
                if (colDef.lockVisible) { return; }

                checked = column.isVisible();
            }

            checked ? checkedCount++ : uncheckedCount++;

        });

        if (checkedCount > 0 && uncheckedCount > 0) { return undefined; }

        return !(checkedCount === 0 || uncheckedCount > 0);
    }

    public setFilterText(filterText: string) {
        this.filterText = _.exists(filterText) ? filterText.toLowerCase() : null;
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }

    private markFilteredColumns(): void {

        const passesFilter = (item: ColumnModelItem) => {
            if (!_.exists(this.filterText)) { return true; }

            const displayName = item.getDisplayName();

            return displayName == null || displayName.toLowerCase().indexOf(this.filterText) !== -1;
        };

        const recursivelyCheckFilter = (item: ColumnModelItem, parentPasses: boolean): boolean => {
            let atLeastOneChildPassed = false;
            if (item.isGroup()) {
                const groupPasses = passesFilter(item);
                item.getChildren().forEach(child => {
                    const childPasses = recursivelyCheckFilter(child, groupPasses || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                });
            }

            const filterPasses = (parentPasses || atLeastOneChildPassed) ? true : passesFilter(item);
            item.setPassesFilter(filterPasses);
            return filterPasses;
        };

        this.allColsTree.forEach(item => recursivelyCheckFilter(item, false));
    }

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

}
