import { _exists, _setAriaLabel, _setAriaLevel } from 'ag-stack';

import type {
    AbstractColDef,
    AgColumn,
    AgProvidedColumnGroup,
    BeanCollection,
    ColGroupDef,
    ColumnEventType,
    ColumnModel,
    ColumnPanelItemDragEndEvent,
    ColumnPanelItemDragStartEvent,
    ColumnToolPanelState,
    ComponentSelector,
} from 'ag-grid-community';
import { Component, DragSourceType, _clamp, isProvidedColumnGroup } from 'ag-grid-community';

import type { VirtualListModel } from '../agStack/iVirtualList';
import type { VirtualListDragItem } from '../agStack/iVirtualListDragFeature';
import { VirtualListDragFeature } from '../features/virtualListDragFeature';
import {
    syncLayoutWithColumns,
    syncLayoutWithGrid,
    toolPanelCreateColumnTree,
} from '../sideBar/common/toolPanelColDefService';
import { VirtualList } from '../widgets/virtualList';
import { ExpandState } from './agPrimaryColsHeader';
import { ColumnModelItem } from './columnModelItem';
import { getCurrentColumnsBeingMoved, getCurrentDragValue, isMoveBlocked, moveItem } from './columnMoveUtils';
import type { ToolPanelColumnCompParams } from './columnToolPanel';
import { selectAllChildren } from './modelItemUtils';
import { ToolPanelColumnComp } from './toolPanelColumnComp';
import { ToolPanelColumnGroupComp } from './toolPanelColumnGroupComp';
import { isDeferredMode } from './toolPanelDeferredUiUtils';

class UIColumnModel implements VirtualListModel {
    constructor(private readonly items: ColumnModelItem[]) {}

    public getRowCount(): number {
        return this.items.length;
    }

    public getRow(index: number): ColumnModelItem {
        return this.items[index];
    }
}

const PRIMARY_COLS_LIST_PANEL_CLASS = 'ag-column-select-list';

type AgPrimaryColsListEvent = 'groupExpanded' | 'selectionChanged';
export class AgPrimaryColsList extends Component<AgPrimaryColsListEvent> {
    private colModel: ColumnModel;

    public wireBeans(beans: BeanCollection) {
        this.colModel = beans.colModel;
    }

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
    private hasLoadedInitialState: boolean = false;
    private isInitialState: boolean = false;
    private skipRefocus: boolean = false;
    private customColumnLayout: AbstractColDef[] | null = null;

    constructor() {
        super({ tag: 'div', cls: PRIMARY_COLS_LIST_PANEL_CLASS, role: 'presentation' });
    }

    public override destroy(): void {
        this.destroyColumnTree();
        super.destroy();
    }

    private destroyColumnTree(): void {
        this.allColsTree = [];
        for (const f of this.destroyColumnItemFuncs) {
            f();
        }
        this.destroyColumnItemFuncs = [];
    }

    public init(params: ToolPanelColumnCompParams, allowDragging: boolean, eventType: ColumnEventType): void {
        this.params = params;
        const { suppressSyncLayoutWithGrid, contractColumnSelection, suppressColumnMove } = params;
        // Drag drives drag-to-zone/hide only (in-panel reorder is blocked via `isPreventMove`), so
        // `suppressColumnMove` must not disable it; only deferred mode's decoupled layout suppresses it.
        this.allowDragging = allowDragging && !(suppressSyncLayoutWithGrid && isDeferredMode(params));
        this.eventType = eventType;

        if (!suppressSyncLayoutWithGrid) {
            this.addManagedEventListeners({ columnMoved: this.onColumnsChanged.bind(this) });
        }

        this.addManagedEventListeners({
            newColumnsLoaded: this.onColumnsChanged.bind(this),
        });

        const listener = this.fireSelectionChangedEvent.bind(this);
        this.addManagedEventListeners({
            columnPivotChanged: listener,
            columnPivotModeChanged: listener,
            columnRowGroupChanged: listener,
            columnValueChanged: listener,
            columnVisible: listener,
            newColumnsLoaded: listener,
        });

        this.expandGroupsByDefault = !contractColumnSelection;

        const isPreventMove = suppressColumnMove || suppressSyncLayoutWithGrid;

        const virtualList = this.createManagedBean(
            new VirtualList<ToolPanelColumnGroupComp | ToolPanelColumnComp, ColumnModelItem>({
                cssIdentifier: 'column-select',
                ariaRole: 'tree',
                moveItemCallback: (item, isUp) => {
                    if (isPreventMove) {
                        return;
                    }

                    this.moveItems(item, isUp);
                },
            })
        );
        this.virtualList = virtualList;

        this.appendChild(virtualList.getGui());

        virtualList.setComponentCreator((item: ColumnModelItem, listItemElement: HTMLElement) => {
            _setAriaLevel(listItemElement, item.depth + 1);
            return this.createComponentFromItem(item, listItemElement);
        });

        if (this.colModel.ready) {
            this.onColumnsChanged();
        }

        if (isPreventMove) {
            return;
        }

        this.createItemDragFeature();
    }

    private createItemDragFeature(): void {
        const { gos, beans, virtualList } = this;
        this.createManagedBean(
            new VirtualListDragFeature<
                AgPrimaryColsList,
                ToolPanelColumnGroupComp | ToolPanelColumnComp,
                AgColumn | AgProvidedColumnGroup,
                ColumnPanelItemDragStartEvent,
                ColumnPanelItemDragEndEvent
            >(this, virtualList, {
                dragSourceType: DragSourceType.ToolPanel,
                addListeners: (parent, listItemDragStart, listItemDragEnd) => {
                    parent.addManagedEventListeners({
                        columnPanelItemDragStart: listItemDragStart,
                        columnPanelItemDragEnd: listItemDragEnd,
                    });
                },
                getCurrentDragValue: (listItemDragStartEvent: ColumnPanelItemDragStartEvent) =>
                    getCurrentDragValue(listItemDragStartEvent),
                isMoveBlocked: (currentDragValue: AgColumn | AgProvidedColumnGroup | null) =>
                    isMoveBlocked(gos, beans, getCurrentColumnsBeingMoved(currentDragValue), this.params),
                getNumRows: (comp: AgPrimaryColsList) => comp.getDisplayedColsList().length,
                moveItem: (
                    currentDragValue: AgColumn | AgProvidedColumnGroup | null,
                    lastHoveredListItem: VirtualListDragItem<ToolPanelColumnGroupComp | ToolPanelColumnComp> | null
                ) => moveItem(beans, getCurrentColumnsBeingMoved(currentDragValue), lastHoveredListItem, this.params),
            })
        );
    }

    private moveItems(item: ToolPanelColumnComp | ToolPanelColumnGroupComp, isUp: boolean): void {
        const { gos, beans } = this;
        const { modelItem } = item;
        const { group, columnGroup, column, expanded } = modelItem;
        const currentColumns = getCurrentColumnsBeingMoved(group ? columnGroup : column);

        if (isMoveBlocked(gos, beans, currentColumns, this.params)) {
            return;
        }

        const currentIndex = this.displayedColsList.indexOf(modelItem);
        const diff = isUp ? -1 : 1;
        let movePadding = 0;

        if (isUp) {
            const children = item.columnDepth > 0 ? column.parent?.children : null;
            if (children?.length && column === children[0]) {
                movePadding = -1;
            }
        } else if (group) {
            movePadding = expanded ? modelItem.children.length : 0;
        }

        const nextItem = _clamp(currentIndex + movePadding + diff, 0, this.displayedColsList.length - 1);

        this.skipRefocus = true;
        moveItem(
            beans,
            currentColumns,
            {
                rowIndex: nextItem,
                position: isUp ? 'top' : 'bottom',
                component: this.virtualList.getComponentAt(nextItem) as ToolPanelColumnComp | ToolPanelColumnGroupComp,
            },
            this.params
        );

        this.focusRowIfAlive(nextItem - movePadding).then(() => {
            this.skipRefocus = false;
        });
    }

    private createComponentFromItem(
        item: ColumnModelItem,
        listItemElement: HTMLElement
    ): ToolPanelColumnGroupComp | ToolPanelColumnComp {
        const allowDragging = this.allowDragging;
        if (item.group) {
            const renderedGroup = new ToolPanelColumnGroupComp(
                item,
                allowDragging,
                this.eventType,
                listItemElement,
                this.params
            );
            this.createBean(renderedGroup);

            return renderedGroup;
        }

        const columnComp = new ToolPanelColumnComp(item, allowDragging, this.groupsExist, listItemElement, this.params);
        this.createBean(columnComp);

        return columnComp;
    }

    public onColumnsChanged(): void {
        const params = this.params;
        if (!this.hasLoadedInitialState) {
            this.hasLoadedInitialState = true;
            this.isInitialState = !!params.initialState;
        }

        const expandedStates = this.getExpandedStates();

        const pivotModeActive = this.colModel.pivotMode;
        const deferApply = isDeferredMode(params);
        const hasDeferredColumnOrder =
            deferApply && this.beans.columnStateUpdateStrategy.hasDeferredColumnOrder(deferApply);
        const shouldSyncColumnLayoutWithGrid =
            ((!params.suppressSyncLayoutWithGrid || deferApply) && !pivotModeActive) || hasDeferredColumnOrder;

        if (shouldSyncColumnLayoutWithGrid) {
            this.buildTreeFromWhatGridIsDisplaying();
        } else if (this.customColumnLayout && !pivotModeActive) {
            // A custom layout set via setColumnLayout owns the panel: grid column changes leave it untouched
            // until the app calls setColumnLayout again to pick up added/removed columns.
            this.isInitialState = false;
            return;
        } else {
            this.buildTreeFromProvidedColumnDefs();
        }

        this.setExpandedStates(expandedStates);

        this.markFilteredColumns();
        this.flattenAndFilterModel();

        this.isInitialState = false;
    }

    public getDisplayedColsList(): ColumnModelItem[] {
        return this.displayedColsList;
    }

    private getExpandedStates(): { [key: string]: boolean } {
        const res: { [id: string]: boolean } = {};

        if (this.isInitialState) {
            const { expandedGroupIds } = this.params.initialState as ColumnToolPanelState;
            for (const id of expandedGroupIds) {
                res[id] = true;
            }
            return res;
        }

        if (!this.allColsTree) {
            return {};
        }

        this.forEachItem((item) => {
            if (!item.group) {
                return;
            }
            const colGroup = item.columnGroup;
            if (colGroup) {
                // group should always exist, this is defensive
                res[colGroup.groupId] = item.expanded;
            }
        });

        return res;
    }

    private setExpandedStates(states: { [key: string]: boolean }): void {
        if (!this.allColsTree) {
            return;
        }

        const { isInitialState } = this;
        this.forEachItem((item) => {
            if (!item.group) {
                return;
            }
            const colGroup = item.columnGroup;
            if (colGroup) {
                // group should always exist, this is defensive
                const expanded = states[colGroup.groupId];
                const groupExistedLastTime = expanded != null;
                if (groupExistedLastTime || isInitialState) {
                    item.expanded = !!expanded;
                }
            }
        });
    }

    private buildTreeFromWhatGridIsDisplaying(): void {
        const deferApply = isDeferredMode(this.params);
        if (deferApply && this.beans.columnStateUpdateStrategy.hasDeferredColumnOrder(deferApply)) {
            const columnOrder = this.beans.columnStateUpdateStrategy.getPrimaryColumns(deferApply);
            if (columnOrder.length > 0) {
                syncLayoutWithColumns(columnOrder, this.applyColumnLayout.bind(this));
                return;
            }
        }
        if (this.params.suppressSyncLayoutWithGrid) {
            this.buildTreeFromProvidedColumnDefs();
            return;
        }
        syncLayoutWithGrid(this.colModel, this.applyColumnLayout.bind(this));
    }

    public setColumnLayout(colDefs: AbstractColDef[]): void {
        // Marks the panel as owned by a custom layout so later grid column changes leave it frozen.
        this.customColumnLayout = colDefs;
        this.applyColumnLayout(colDefs);
    }

    private applyColumnLayout(colDefs: AbstractColDef[]): void {
        const columnTree = toolPanelCreateColumnTree(this.beans, colDefs);
        this.buildListModel(columnTree);

        // using col defs to check if groups exist as it could be a custom layout
        this.groupsExist = colDefs.some((colDef) => {
            return colDef && typeof (colDef as ColGroupDef).children !== 'undefined';
        });

        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }

    private buildTreeFromProvidedColumnDefs(): void {
        const colModel = this.colModel;
        // add column / group comps to tool panel
        this.buildListModel(colModel.colDefTree);
        this.groupsExist = !!colModel.colDefTreeDepth;
    }

    private buildListModel(columnTree: (AgColumn | AgProvidedColumnGroup)[]): void {
        const columnExpandedListener = this.onColumnExpanded.bind(this);
        const addListeners = (item: ColumnModelItem) => {
            item.addEventListener('expandedChanged', columnExpandedListener);
            const removeFunc = item.removeEventListener.bind(item, 'expandedChanged', columnExpandedListener);
            this.destroyColumnItemFuncs.push(removeFunc);
        };
        const colNames = this.beans.colNames;

        const recursivelyBuild = (
            tree: (AgColumn | AgProvidedColumnGroup)[],
            depth: number,
            parentList: ColumnModelItem[]
        ): void => {
            for (const child of tree) {
                if (isProvidedColumnGroup(child)) {
                    createGroupItem(child, depth, parentList);
                } else {
                    createColumnItem(child, depth, parentList);
                }
            }
        };

        const createGroupItem = (
            columnGroup: AgProvidedColumnGroup,
            depth: number,
            parentList: ColumnModelItem[]
        ): void => {
            const columnGroupDef = columnGroup.getColGroupDef();
            const skipThisGroup = columnGroupDef?.suppressColumnsToolPanel;
            if (skipThisGroup) {
                return;
            }

            if (columnGroup.padding) {
                recursivelyBuild(columnGroup.children, depth, parentList);
                return;
            }

            const displayName = colNames.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'columnToolPanel');
            const item: ColumnModelItem = new ColumnModelItem(
                displayName,
                columnGroup,
                depth,
                true,
                this.expandGroupsByDefault
            );

            parentList.push(item);
            addListeners(item);

            recursivelyBuild(columnGroup.children, depth + 1, item.children);
        };

        const createColumnItem = (column: AgColumn, depth: number, parentList: ColumnModelItem[]): void => {
            const skipThisColumn = column.colDef?.suppressColumnsToolPanel;

            if (skipThisColumn) {
                return;
            }

            const displayName = colNames.getDisplayNameForColumn(column, 'columnToolPanel');

            parentList.push(new ColumnModelItem(displayName, column, depth));
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
            if (!item.passesFilter) {
                return;
            }
            this.displayedColsList.push(item);
            if (item.group && item.expanded) {
                const children = item.children;
                for (let i = 0, len = children.length; i < len; ++i) {
                    recursiveFunc(children[i]);
                }
            }
        };

        const virtualList = this.virtualList;
        const allColsTree = this.allColsTree;
        for (let i = 0, len = allColsTree.length; i < len; ++i) {
            recursiveFunc(allColsTree[i]);
        }
        virtualList.setModel(new UIColumnModel(this.displayedColsList));
        let focusedRow: number | null = null;

        if (!this.skipRefocus) {
            focusedRow = virtualList.getLastFocusedRow();
        }
        virtualList.refresh();

        if (focusedRow != null) {
            this.focusRowIfAlive(focusedRow);
        }

        this.notifyListeners();
        this.refreshAriaLabel();
    }

    private refreshAriaLabel(): void {
        const translate = this.getLocaleTextFunc();
        const columnListName = translate('ariaColumnPanelList', 'Column List');
        const localeColumns = translate('columns', 'Columns');
        const items = this.displayedColsList.length;

        _setAriaLabel(this.virtualList.getAriaElement(), `${columnListName} ${items} ${localeColumns}`);
    }

    private focusRowIfAlive(rowIndex: number): Promise<void> {
        if (rowIndex === -1) {
            return Promise.resolve();
        }

        return new Promise((res) => {
            window.setTimeout(() => {
                if (this.isAlive()) {
                    this.virtualList.focusRow(rowIndex);
                }
                res();
            }, 0);
        });
    }

    private forEachItem(callback: (item: ColumnModelItem) => void): void {
        const recursiveFunc = (items: ColumnModelItem[]) => {
            for (const item of items) {
                callback(item);
                if (item.group) {
                    recursiveFunc(item.children);
                }
            }
        };

        const allColsTree = this.allColsTree;
        if (!allColsTree) {
            return;
        }

        recursiveFunc(allColsTree);
    }

    public doSetExpandedAll(value: boolean): void {
        this.forEachItem((item) => {
            if (item.group) {
                item.expanded = value;
            }
        });
    }

    public setGroupsExpanded(expand: boolean, groupIds?: string[]): void {
        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }

        const targetGroupIds = new Set(groupIds);
        const expandedGroupIds = new Set<string>();

        this.forEachItem((item) => {
            if (!item.group) {
                return;
            }

            const groupId = item.columnGroup.groupId;
            if (targetGroupIds.has(groupId)) {
                item.expanded = expand;
                expandedGroupIds.add(groupId);
            }
        });

        const unrecognisedGroupIds = groupIds.filter((groupId) => !expandedGroupIds.has(groupId));
        if (unrecognisedGroupIds.length > 0) {
            this.beans.log.warn(157, { unrecognisedGroupIds });
        }
    }

    private getExpandState(): ExpandState {
        let expandedCount = 0;
        let notExpandedCount = 0;

        this.forEachItem((item) => {
            if (!item.group) {
                return;
            }
            if (item.expanded) {
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
        selectAllChildren(this.beans, this.allColsTree, selectAllChecked, this.eventType, this.params);
        this.syncVisibleSelectionState();
        this.fireSelectionChangedEvent();
    }

    private syncVisibleSelectionState(): void {
        for (let i = 0; i < this.displayedColsList.length; i++) {
            const comp = this.virtualList.getComponentAt(i) as any;
            comp?.onColumnStateChanged?.();
        }
    }

    private getSelectionState(): boolean | undefined {
        let checkedCount = 0;
        let uncheckedCount = 0;

        const updateStrategy = this.beans.columnStateUpdateStrategy;
        const pivotMode = updateStrategy.getPivotMode(isDeferredMode(this.params));

        this.forEachItem((item) => {
            if (item.group) {
                return;
            }
            if (!item.passesFilter) {
                return;
            }

            const column = item.column;
            const colDef = column.colDef;

            let checked: boolean;

            if (pivotMode) {
                const noPivotModeOptionsAllowed =
                    !column.isAllowPivot() && !column.isAllowRowGroup() && !column.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked =
                    updateStrategy.isColumnSelectedInPivotModeToolPanel(isDeferredMode(this.params), column) ?? false;
            } else {
                if (colDef.lockVisible) {
                    return;
                }

                checked = updateStrategy.isColumnVisibleInToolPanel(isDeferredMode(this.params), column) ?? false;
            }

            if (checked) {
                checkedCount++;
            } else {
                uncheckedCount++;
            }
        });

        if (checkedCount > 0 && uncheckedCount > 0) {
            return undefined;
        }

        return !(checkedCount === 0 || uncheckedCount > 0);
    }

    public setFilterText(filterText: string) {
        this.filterText = _exists(filterText) ? filterText.toLowerCase() : null;
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }

    private markFilteredColumns(): void {
        const passesFilter = (item: ColumnModelItem) => {
            if (!_exists(this.filterText)) {
                return true;
            }

            const displayName = item.displayName;

            return displayName?.toLowerCase().indexOf(this.filterText) !== -1;
        };

        const recursivelyCheckFilter = (item: ColumnModelItem, parentPasses: boolean): boolean => {
            let atLeastOneChildPassed = false;
            if (item.group) {
                const groupPasses = passesFilter(item);
                for (const child of item.children) {
                    const childPasses = recursivelyCheckFilter(child, groupPasses || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                }
            }

            const filterPasses = parentPasses || atLeastOneChildPassed ? true : passesFilter(item);
            item.passesFilter = filterPasses;
            return filterPasses;
        };

        for (const item of this.allColsTree) {
            recursivelyCheckFilter(item, false);
        }
    }

    private notifyListeners(): void {
        this.fireGroupExpandedEvent();
        this.fireSelectionChangedEvent();
    }

    private fireGroupExpandedEvent(): void {
        const expandState = this.getExpandState();
        this.dispatchLocalEvent({ type: 'groupExpanded', state: expandState });
    }

    private fireSelectionChangedEvent(): void {
        if (!this.allColsTree) {
            return;
        }
        const selectionState = this.getSelectionState();
        this.dispatchLocalEvent({ type: 'selectionChanged', state: selectionState });
    }

    public getExpandedGroups(): string[] {
        const expandedGroupIds: string[] = [];

        if (!this.allColsTree) {
            return expandedGroupIds;
        }

        this.forEachItem((item) => {
            if (item.group && item.expanded) {
                expandedGroupIds.push(item.columnGroup.groupId);
            }
        });

        return expandedGroupIds;
    }
}

export const AgPrimaryColsListSelector: ComponentSelector = {
    selector: 'AG-PRIMARY-COLS-LIST',
    component: AgPrimaryColsList,
};
