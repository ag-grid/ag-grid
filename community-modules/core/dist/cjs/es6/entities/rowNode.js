/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowNode = void 0;
const events_1 = require("../events");
const eventService_1 = require("../eventService");
const function_1 = require("../utils/function");
const generic_1 = require("../utils/generic");
const object_1 = require("../utils/object");
class RowNode {
    constructor(beans) {
        /** The current row index. If the row is filtered out or in a collapsed group, this value will be `null`. */
        this.rowIndex = null;
        /** The key for the group eg Ireland, UK, USA */
        this.key = null;
        /** Children mapped by the pivot columns. */
        this.childrenMapped = {};
        /**
         * This will be `true` if it has a rowIndex assigned, otherwise `false`.
         */
        this.displayed = false;
        /** The row top position in pixels. */
        this.rowTop = null;
        /** The top pixel for this row last time, makes sense if data set was ordered or filtered,
         * it is used so new rows can animate in from their old position. */
        this.oldRowTop = null;
        /** `true` by default - can be overridden via gridOptions.isRowSelectable(rowNode) */
        this.selectable = true;
        /** Used by sorting service - to give deterministic sort to groups. Previously we
         * just id for this, however id is a string and had slower sorting compared to numbers. */
        this.__objectId = RowNode.OBJECT_ID_SEQUENCE++;
        /** When one or more Columns are using autoHeight, this keeps track of height of each autoHeight Cell,
         * indexed by the Column ID. */
        this.__autoHeights = {};
        /** `true` when nodes with the same id are being removed and added as part of the same batch transaction */
        this.alreadyRendered = false;
        this.highlighted = null;
        this.selected = false;
        this.beans = beans;
    }
    /** Replaces the data on the `rowNode`. When this method is called, the grid will refresh the entire rendered row if it is displayed. */
    setData(data) {
        this.setDataCommon(data, false);
    }
    // similar to setRowData, however it is expected that the data is the same data item. this
    // is intended to be used with Redux type stores, where the whole data can be changed. we are
    // guaranteed that the data is the same entity (so grid doesn't need to worry about the id of the
    // underlying data changing, hence doesn't need to worry about selection). the grid, upon receiving
    // dataChanged event, will refresh the cells rather than rip them all out (so user can show transitions).
    /** Updates the data on the `rowNode`. When this method is called, the grid will refresh the entire rendered row if it is displayed. */
    updateData(data) {
        this.setDataCommon(data, true);
    }
    setDataCommon(data, update) {
        const oldData = this.data;
        this.data = data;
        this.beans.valueCache.onDataChanged();
        this.updateDataOnDetailNode();
        this.checkRowSelectable();
        const event = this.createDataChangedEvent(data, oldData, update);
        this.dispatchLocalEvent(event);
    }
    // when we are doing master / detail, the detail node is lazy created, but then kept around.
    // so if we show / hide the detail, the same detail rowNode is used. so we need to keep the data
    // in sync, otherwise expand/collapse of the detail would still show the old values.
    updateDataOnDetailNode() {
        if (this.detailNode) {
            this.detailNode.data = this.data;
        }
    }
    createDataChangedEvent(newData, oldData, update) {
        return {
            type: RowNode.EVENT_DATA_CHANGED,
            node: this,
            oldData: oldData,
            newData: newData,
            update: update
        };
    }
    createLocalRowEvent(type) {
        return {
            type: type,
            node: this
        };
    }
    getRowIndexString() {
        if (this.rowPinned === 'top') {
            return 't-' + this.rowIndex;
        }
        if (this.rowPinned === 'bottom') {
            return 'b-' + this.rowIndex;
        }
        return this.rowIndex.toString();
    }
    createDaemonNode() {
        const oldNode = new RowNode(this.beans);
        // just copy the id and data, this is enough for the node to be used
        // in the selection controller (the selection controller is the only
        // place where daemon nodes can live).
        oldNode.id = this.id;
        oldNode.data = this.data;
        oldNode.__daemon = true;
        oldNode.selected = this.selected;
        oldNode.level = this.level;
        return oldNode;
    }
    setDataAndId(data, id) {
        const oldNode = generic_1.exists(this.id) ? this.createDaemonNode() : null;
        const oldData = this.data;
        this.data = data;
        this.updateDataOnDetailNode();
        this.setId(id);
        this.beans.selectionService.syncInRowNode(this, oldNode);
        this.checkRowSelectable();
        const event = this.createDataChangedEvent(data, oldData, false);
        this.dispatchLocalEvent(event);
    }
    checkRowSelectable() {
        const isRowSelectableFunc = this.beans.gridOptionsService.get('isRowSelectable');
        this.setRowSelectable(isRowSelectableFunc ? isRowSelectableFunc(this) : true);
    }
    setRowSelectable(newVal) {
        if (this.selectable !== newVal) {
            this.selectable = newVal;
            if (this.eventService) {
                this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_SELECTABLE_CHANGED));
            }
            const isGroupSelectsChildren = this.beans.gridOptionsService.is('groupSelectsChildren');
            if (isGroupSelectsChildren) {
                const selected = this.calculateSelectedFromChildren();
                this.setSelectedParams({ newValue: selected !== null && selected !== void 0 ? selected : false, source: 'selectableChanged' });
            }
        }
    }
    setId(id) {
        // see if user is providing the id's
        const getRowIdFunc = this.beans.gridOptionsService.getRowIdFunc();
        if (getRowIdFunc) {
            // if user is providing the id's, then we set the id only after the data has been set.
            // this is important for virtual pagination and viewport, where empty rows exist.
            if (this.data) {
                // we pass 'true' as we skip this level when generating keys,
                // as we don't always have the key for this level (eg when updating
                // data via transaction on SSRM, we are getting key to look up the
                // RowNode, don't have the RowNode yet, thus no way to get the current key)
                const parentKeys = this.getGroupKeys(true);
                this.id = getRowIdFunc({
                    data: this.data,
                    parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                    level: this.level
                });
                // make sure id provided doesn't start with 'row-group-' as this is reserved. also check that
                // it has 'startsWith' in case the user provided a number.
                if (this.id !== null && typeof this.id === 'string' && this.id.startsWith(RowNode.ID_PREFIX_ROW_GROUP)) {
                    console.error(`AG Grid: Row IDs cannot start with ${RowNode.ID_PREFIX_ROW_GROUP}, this is a reserved prefix for AG Grid's row grouping feature.`);
                }
                // force id to be a string
                if (this.id !== null && typeof this.id !== 'string') {
                    this.id = '' + this.id;
                }
            }
            else {
                // this can happen if user has set blank into the rowNode after the row previously
                // having data. this happens in virtual page row model, when data is delete and
                // the page is refreshed.
                this.id = undefined;
            }
        }
        else {
            this.id = id;
        }
    }
    getGroupKeys(excludeSelf = false) {
        const keys = [];
        let pointer = this;
        if (excludeSelf) {
            pointer = pointer.parent;
        }
        while (pointer && pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }
        keys.reverse();
        return keys;
    }
    isPixelInRange(pixel) {
        if (!generic_1.exists(this.rowTop) || !generic_1.exists(this.rowHeight)) {
            return false;
        }
        return pixel >= this.rowTop && pixel < (this.rowTop + this.rowHeight);
    }
    setFirstChild(firstChild) {
        if (this.firstChild === firstChild) {
            return;
        }
        this.firstChild = firstChild;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_FIRST_CHILD_CHANGED));
        }
    }
    setLastChild(lastChild) {
        if (this.lastChild === lastChild) {
            return;
        }
        this.lastChild = lastChild;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_LAST_CHILD_CHANGED));
        }
    }
    setChildIndex(childIndex) {
        if (this.childIndex === childIndex) {
            return;
        }
        this.childIndex = childIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_CHILD_INDEX_CHANGED));
        }
    }
    setRowTop(rowTop) {
        this.oldRowTop = this.rowTop;
        if (this.rowTop === rowTop) {
            return;
        }
        this.rowTop = rowTop;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_TOP_CHANGED));
        }
        this.setDisplayed(rowTop !== null);
    }
    clearRowTopAndRowIndex() {
        this.oldRowTop = null;
        this.setRowTop(null);
        this.setRowIndex(null);
    }
    setDisplayed(displayed) {
        if (this.displayed === displayed) {
            return;
        }
        this.displayed = displayed;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_DISPLAYED_CHANGED));
        }
    }
    setDragging(dragging) {
        if (this.dragging === dragging) {
            return;
        }
        this.dragging = dragging;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_DRAGGING_CHANGED));
        }
    }
    setHighlighted(highlighted) {
        if (highlighted === this.highlighted) {
            return;
        }
        this.highlighted = highlighted;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_HIGHLIGHT_CHANGED));
        }
    }
    setAllChildrenCount(allChildrenCount) {
        if (this.allChildrenCount === allChildrenCount) {
            return;
        }
        this.allChildrenCount = allChildrenCount;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED));
        }
    }
    setMaster(master) {
        if (this.master === master) {
            return;
        }
        // if changing AWAY from master, then unexpand, otherwise
        // next time it's shown it is expanded again
        if (this.master && !master) {
            this.expanded = false;
        }
        this.master = master;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_MASTER_CHANGED));
        }
    }
    setGroup(group) {
        if (this.group === group) {
            return;
        }
        // if we used to be a group, and no longer, then close the node
        if (this.group && !group) {
            this.expanded = false;
        }
        this.group = group;
        this.updateHasChildren();
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_GROUP_CHANGED));
        }
    }
    /**
     * Sets the row height.
     * Call if you want to change the height initially assigned to the row.
     * After calling, you must call `api.onRowHeightChanged()` so the grid knows it needs to work out the placement of the rows. */
    setRowHeight(rowHeight, estimated = false) {
        this.rowHeight = rowHeight;
        this.rowHeightEstimated = estimated;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_HEIGHT_CHANGED));
        }
    }
    setRowAutoHeight(cellHeight, column) {
        if (!this.__autoHeights) {
            this.__autoHeights = {};
        }
        const autoHeights = this.__autoHeights;
        autoHeights[column.getId()] = cellHeight;
        if (cellHeight != null) {
            if (this.checkAutoHeightsDebounced == null) {
                this.checkAutoHeightsDebounced = function_1.debounce(this.checkAutoHeights.bind(this), 1);
            }
            this.checkAutoHeightsDebounced();
        }
    }
    checkAutoHeights() {
        let notAllPresent = false;
        let nonePresent = true;
        let newRowHeight = 0;
        const autoHeights = this.__autoHeights;
        if (autoHeights == null) {
            return;
        }
        const displayedAutoHeightCols = this.beans.columnModel.getAllDisplayedAutoHeightCols();
        displayedAutoHeightCols.forEach(col => {
            const cellHeight = autoHeights[col.getId()];
            if (cellHeight == null) {
                notAllPresent = true;
                return;
            }
            nonePresent = false;
            if (cellHeight > newRowHeight) {
                newRowHeight = cellHeight;
            }
        });
        if (notAllPresent) {
            return;
        }
        // we take min of 10, so we don't adjust for empty rows. if <10, we put to default.
        // this prevents the row starting very small when waiting for async components,
        // which would then mean the grid squashes in far to many rows (as small heights
        // means more rows fit in) which looks crap. so best ignore small values and assume
        // we are still waiting for values to render.
        if (nonePresent || newRowHeight < 10) {
            newRowHeight = this.beans.gridOptionsService.getRowHeightForNode(this).height;
        }
        if (newRowHeight == this.rowHeight) {
            return;
        }
        this.setRowHeight(newRowHeight);
        const rowModel = this.beans.rowModel;
        if (rowModel.onRowHeightChangedDebounced) {
            rowModel.onRowHeightChangedDebounced();
        }
    }
    setRowIndex(rowIndex) {
        if (this.rowIndex === rowIndex) {
            return;
        }
        this.rowIndex = rowIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_ROW_INDEX_CHANGED));
        }
    }
    setUiLevel(uiLevel) {
        if (this.uiLevel === uiLevel) {
            return;
        }
        this.uiLevel = uiLevel;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_UI_LEVEL_CHANGED));
        }
    }
    /**
     * Set the expanded state of this rowNode. Pass `true` to expand and `false` to collapse.
     */
    setExpanded(expanded, e) {
        if (this.expanded === expanded) {
            return;
        }
        this.expanded = expanded;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_EXPANDED_CHANGED));
        }
        const event = Object.assign({}, this.createGlobalRowEvent(events_1.Events.EVENT_ROW_GROUP_OPENED), {
            expanded,
            event: e || null
        });
        this.beans.rowNodeEventThrottle.dispatchExpanded(event);
        // when using footers we need to refresh the group row, as the aggregation
        // values jump between group and footer
        if (this.beans.gridOptionsService.is('groupIncludeFooter')) {
            this.beans.rowRenderer.refreshCells({ rowNodes: [this] });
        }
    }
    createGlobalRowEvent(type) {
        return {
            type: type,
            node: this,
            data: this.data,
            rowIndex: this.rowIndex,
            rowPinned: this.rowPinned,
            context: this.beans.gridOptionsService.get('context'),
            api: this.beans.gridOptionsService.get('api'),
            columnApi: this.beans.gridOptionsService.get('columnApi')
        };
    }
    dispatchLocalEvent(event) {
        if (this.eventService) {
            this.eventService.dispatchEvent(event);
        }
    }
    /**
     * Replaces the value on the `rowNode` for the specified column. When complete,
     * the grid will refresh the rendered cell on the required row only.
     *
     * @param colKey The column where the value should be updated
     * @param newValue The new value
     * @param eventSource The source of the event
     * @returns `True` if the value was changed, otherwise `False`.
     */
    setDataValue(colKey, newValue, eventSource) {
        // When it is done via the editors, no 'cell changed' event gets fired, as it's assumed that
        // the cell knows about the change given it's in charge of the editing.
        // this method is for the client to call, so the cell listens for the change
        // event, and also flashes the cell when the change occurs.
        const column = this.beans.columnModel.getPrimaryColumn(colKey);
        const oldValue = this.beans.valueService.getValue(column, this);
        const valueChanged = this.beans.valueService.setValue(this, column, newValue, eventSource);
        this.dispatchCellChangedEvent(column, newValue, oldValue);
        this.checkRowSelectable();
        return valueChanged;
    }
    setGroupValue(colKey, newValue) {
        const column = this.beans.columnModel.getGridColumn(colKey);
        if (generic_1.missing(this.groupData)) {
            this.groupData = {};
        }
        const columnId = column.getColId();
        const oldValue = this.groupData[columnId];
        if (oldValue === newValue) {
            return;
        }
        this.groupData[columnId] = newValue;
        this.dispatchCellChangedEvent(column, newValue, oldValue);
    }
    // sets the data for an aggregation
    setAggData(newAggData) {
        // find out all keys that could potentially change
        const colIds = object_1.getAllKeysInObjects([this.aggData, newAggData]);
        const oldAggData = this.aggData;
        this.aggData = newAggData;
        // if no event service, nobody has registered for events, so no need fire event
        if (this.eventService) {
            colIds.forEach(colId => {
                const column = this.beans.columnModel.getGridColumn(colId);
                const value = this.aggData ? this.aggData[colId] : undefined;
                const oldValue = oldAggData ? oldAggData[colId] : undefined;
                this.dispatchCellChangedEvent(column, value, oldValue);
            });
        }
    }
    updateHasChildren() {
        // we need to return true when this.group=true, as this is used by server side row model
        // (as children are lazy loaded and stored in a cache anyway). otherwise we return true
        // if children exist.
        const newValue = (this.group && !this.footer) || (this.childrenAfterGroup && this.childrenAfterGroup.length > 0);
        if (newValue !== this.__hasChildren) {
            this.__hasChildren = !!newValue;
            if (this.eventService) {
                this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_HAS_CHILDREN_CHANGED));
            }
        }
    }
    hasChildren() {
        if (this.__hasChildren == null) {
            this.updateHasChildren();
        }
        return this.__hasChildren;
    }
    isEmptyRowGroupNode() {
        return this.group && generic_1.missingOrEmpty(this.childrenAfterGroup);
    }
    dispatchCellChangedEvent(column, newValue, oldValue) {
        const cellChangedEvent = {
            type: RowNode.EVENT_CELL_CHANGED,
            node: this,
            column: column,
            newValue: newValue,
            oldValue: oldValue
        };
        this.dispatchLocalEvent(cellChangedEvent);
    }
    /**
     * The first time `quickFilter` runs, the grid creates a one-off string representation of the row.
     * This string is then used for the quick filter instead of hitting each column separately.
     * When you edit, using grid editing, this string gets cleared down.
     * However if you edit without using grid editing, you will need to clear this string down for the row to be updated with the new values.
     * Otherwise new values will not work with the `quickFilter`. */
    resetQuickFilterAggregateText() {
        this.quickFilterAggregateText = null;
    }
    /** Returns:
    * - `true` if the node can be expanded, i.e it is a group or master row.
    * - `false` if the node cannot be expanded
    */
    isExpandable() {
        return (this.hasChildren() && !this.footer) || this.master ? true : false;
    }
    /** Returns:
     * - `true` if node is selected,
     * - `false` if the node isn't selected
     * - `undefined` if it's partially selected (group where not all children are selected). */
    isSelected() {
        // for footers, we just return what our sibling selected state is, as cannot select a footer
        if (this.footer) {
            return this.sibling.isSelected();
        }
        return this.selected;
    }
    /** Perform a depth-first search of this node and its children. */
    depthFirstSearch(callback) {
        if (this.childrenAfterGroup) {
            this.childrenAfterGroup.forEach(child => child.depthFirstSearch(callback));
        }
        callback(this);
    }
    // + selectionController.calculatedSelectedForAllGroupNodes()
    calculateSelectedFromChildren() {
        var _a;
        let atLeastOneSelected = false;
        let atLeastOneDeSelected = false;
        let atLeastOneMixed = false;
        if (!((_a = this.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length)) {
            return this.selectable ? this.selected : null;
        }
        for (let i = 0; i < this.childrenAfterGroup.length; i++) {
            const child = this.childrenAfterGroup[i];
            let childState = child.isSelected();
            // non-selectable nodes must be calculated from their children, or ignored if no value results.
            if (!child.selectable) {
                const selectable = child.calculateSelectedFromChildren();
                if (selectable === null) {
                    continue;
                }
                childState = selectable;
            }
            switch (childState) {
                case true:
                    atLeastOneSelected = true;
                    break;
                case false:
                    atLeastOneDeSelected = true;
                    break;
                default:
                    atLeastOneMixed = true;
                    break;
            }
        }
        if (atLeastOneMixed || (atLeastOneSelected && atLeastOneDeSelected)) {
            return undefined;
        }
        else if (atLeastOneSelected) {
            return true;
        }
        else if (atLeastOneDeSelected) {
            return false;
        }
        else if (!this.selectable) {
            return null;
        }
        else {
            return this.selected;
        }
    }
    setSelectedInitialValue(selected) {
        this.selected = selected;
    }
    /**
     * Select (or deselect) the node.
     * @param newValue -`true` for selection, `false` for deselection.
     * @param clearSelection - If selecting, then passing `true` will select the node exclusively (i.e. NOT do multi select). If doing deselection, `clearSelection` has no impact.
     * @param suppressFinishActions - Pass `true` to prevent the `selectionChanged` from being fired. Note that the `rowSelected` event will still be fired.
     * @param source - Source property that will appear in the `selectionChanged` event.
     */
    setSelected(newValue, clearSelection = false, suppressFinishActions = false, source = 'api') {
        this.setSelectedParams({
            newValue,
            clearSelection,
            suppressFinishActions,
            rangeSelect: false,
            source
        });
    }
    /**
     * Returns:
     * - `true` if node is either pinned to the `top` or `bottom`
     * - `false` if the node isn't pinned
     */
    isRowPinned() {
        return this.rowPinned === 'top' || this.rowPinned === 'bottom';
    }
    // to make calling code more readable, this is the same method as setSelected except it takes names parameters
    setSelectedParams(params) {
        var _a, _b;
        const groupSelectsChildren = this.beans.gridOptionsService.is('groupSelectsChildren');
        const newValue = params.newValue === true;
        const clearSelection = params.clearSelection === true;
        const suppressFinishActions = params.suppressFinishActions === true;
        const rangeSelect = params.rangeSelect === true;
        // groupSelectsFiltered only makes sense when group selects children
        const groupSelectsFiltered = groupSelectsChildren && (params.groupSelectsFiltered === true);
        const source = (_a = params.source) !== null && _a !== void 0 ? _a : 'api';
        if (this.id === undefined) {
            console.warn('AG Grid: cannot select node until id for node is known');
            return 0;
        }
        if (this.rowPinned) {
            console.warn('AG Grid: cannot select pinned rows');
            return 0;
        }
        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (this.footer) {
            return this.sibling.setSelectedParams(params);
        }
        if (rangeSelect && this.beans.selectionService.getLastSelectedNode()) {
            const newRowClicked = this.beans.selectionService.getLastSelectedNode() !== this;
            const allowMultiSelect = this.beans.gridOptionsService.get('rowSelection') === 'multiple';
            if (newRowClicked && allowMultiSelect) {
                const nodesChanged = this.doRowRangeSelection(params.newValue, source);
                this.beans.selectionService.setLastSelectedNode(this);
                return nodesChanged;
            }
        }
        let updatedCount = 0;
        // when groupSelectsFiltered, then this node may end up intermediate despite
        // trying to set it to true / false. this group will be calculated further on
        // down when we call calculatedSelectedForAllGroupNodes(). we need to skip it
        // here, otherwise the updatedCount would include it.
        const skipThisNode = groupSelectsFiltered && this.group;
        if (!skipThisNode) {
            const thisNodeWasSelected = this.selectThisNode(newValue, params.event, source);
            if (thisNodeWasSelected) {
                updatedCount++;
            }
        }
        if (groupSelectsChildren && ((_b = this.childrenAfterGroup) === null || _b === void 0 ? void 0 : _b.length)) {
            updatedCount += this.selectChildNodes(newValue, groupSelectsFiltered, source);
        }
        // clear other nodes if not doing multi select
        if (!suppressFinishActions) {
            const clearOtherNodes = newValue && (clearSelection || this.beans.gridOptionsService.get('rowSelection') !== 'multiple');
            if (clearOtherNodes) {
                updatedCount += this.beans.selectionService.clearOtherNodes(this, source);
            }
            // only if we selected something, then update groups and fire events
            if (updatedCount > 0) {
                this.beans.selectionService.updateGroupsFromChildrenSelections(source);
                // this is the very end of the 'action node', so we are finished all the updates,
                // include any parent / child changes that this method caused
                const event = {
                    type: events_1.Events.EVENT_SELECTION_CHANGED,
                    source
                };
                this.beans.eventService.dispatchEvent(event);
            }
            // so if user next does shift-select, we know where to start the selection from
            if (newValue) {
                this.beans.selectionService.setLastSelectedNode(this);
            }
        }
        return updatedCount;
    }
    // selects all rows between this node and the last selected node (or the top if this is the first selection).
    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    doRowRangeSelection(value = true, source) {
        const groupsSelectChildren = this.beans.gridOptionsService.is('groupSelectsChildren');
        const lastSelectedNode = this.beans.selectionService.getLastSelectedNode();
        const nodesToSelect = this.beans.rowModel.getNodesInRangeForSelection(this, lastSelectedNode);
        let updatedCount = 0;
        nodesToSelect.forEach(rowNode => {
            if (rowNode.group && groupsSelectChildren || (value === false && this === rowNode)) {
                return;
            }
            const nodeWasSelected = rowNode.selectThisNode(value, undefined, source);
            if (nodeWasSelected) {
                updatedCount++;
            }
        });
        this.beans.selectionService.updateGroupsFromChildrenSelections(source);
        const event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            source
        };
        this.beans.eventService.dispatchEvent(event);
        return updatedCount;
    }
    isParentOfNode(potentialParent) {
        let parentNode = this.parent;
        while (parentNode) {
            if (parentNode === potentialParent) {
                return true;
            }
            parentNode = parentNode.parent;
        }
        return false;
    }
    selectThisNode(newValue, e, source = 'api') {
        // we only check selectable when newValue=true (ie selecting) to allow unselecting values,
        // as selectable is dynamic, need a way to unselect rows when selectable becomes false.
        const selectionNotAllowed = !this.selectable && newValue;
        const selectionNotChanged = this.selected === newValue;
        if (selectionNotAllowed || selectionNotChanged) {
            return false;
        }
        this.selected = newValue;
        if (this.eventService) {
            this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_ROW_SELECTED));
        }
        const event = Object.assign(Object.assign({}, this.createGlobalRowEvent(events_1.Events.EVENT_ROW_SELECTED)), { event: e || null, source });
        this.beans.eventService.dispatchEvent(event);
        return true;
    }
    selectChildNodes(newValue, groupSelectsFiltered, source) {
        const children = groupSelectsFiltered ? this.childrenAfterAggFilter : this.childrenAfterGroup;
        if (generic_1.missing(children)) {
            return 0;
        }
        let updatedCount = 0;
        for (let i = 0; i < children.length; i++) {
            updatedCount += children[i].setSelectedParams({
                newValue: newValue,
                clearSelection: false,
                suppressFinishActions: true,
                groupSelectsFiltered,
                source
            });
        }
        return updatedCount;
    }
    /** Add an event listener. */
    addEventListener(eventType, listener) {
        if (!this.eventService) {
            this.eventService = new eventService_1.EventService();
        }
        this.eventService.addEventListener(eventType, listener);
    }
    /** Remove event listener. */
    removeEventListener(eventType, listener) {
        if (!this.eventService) {
            return;
        }
        this.eventService.removeEventListener(eventType, listener);
        if (this.eventService.noRegisteredListenersExist()) {
            this.eventService = null;
        }
    }
    onMouseEnter() {
        this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_MOUSE_ENTER));
    }
    onMouseLeave() {
        this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_MOUSE_LEAVE));
    }
    getFirstChildOfFirstChild(rowGroupColumn) {
        let currentRowNode = this;
        let isCandidate = true;
        let foundFirstChildPath = false;
        let nodeToSwapIn = null;
        // if we are hiding groups, then if we are the first child, of the first child,
        // all the way up to the column we are interested in, then we show the group cell.
        while (isCandidate && !foundFirstChildPath) {
            const parentRowNode = currentRowNode.parent;
            const firstChild = generic_1.exists(parentRowNode) && currentRowNode.firstChild;
            if (firstChild) {
                if (parentRowNode.rowGroupColumn === rowGroupColumn) {
                    foundFirstChildPath = true;
                    nodeToSwapIn = parentRowNode;
                }
            }
            else {
                isCandidate = false;
            }
            currentRowNode = parentRowNode;
        }
        return foundFirstChildPath ? nodeToSwapIn : null;
    }
    /**
     * Returns:
     * - `true` if the node is a full width cell
     * - `false` if the node is not a full width cell
     */
    isFullWidthCell() {
        const isFullWidthCellFunc = this.getIsFullWidthCellFunc();
        return isFullWidthCellFunc ? isFullWidthCellFunc({ rowNode: this }) : false;
    }
    getIsFullWidthCellFunc() {
        const isFullWidthRow = this.beans.gridOptionsService.getCallback('isFullWidthRow');
        if (isFullWidthRow) {
            return isFullWidthRow;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        const isFullWidthCell = this.beans.gridOptionsService.get('isFullWidthCell');
        if (isFullWidthCell) {
            return (params) => isFullWidthCell(params.rowNode);
        }
    }
    /**
     * Returns the route of the row node. If the Row Node is a group, it returns the route to that Row Node.
     * If the Row Node is not a group, it returns `undefined`.
     */
    getRoute() {
        if (this.key == null) {
            return;
        }
        const res = [];
        let pointer = this;
        while (pointer.key != null) {
            res.push(pointer.key);
            pointer = pointer.parent;
        }
        return res.reverse();
    }
    createFooter() {
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (this.sibling) {
            return;
        }
        const footerNode = new RowNode(this.beans);
        Object.keys(this).forEach(key => {
            footerNode[key] = this[key];
        });
        footerNode.footer = true;
        footerNode.setRowTop(null);
        footerNode.setRowIndex(null);
        // manually set oldRowTop to null so we discard any
        // previous information about its position.
        footerNode.oldRowTop = null;
        footerNode.id = 'rowGroupFooter_' + this.id;
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = this;
        this.sibling = footerNode;
    }
}
exports.RowNode = RowNode;
RowNode.ID_PREFIX_ROW_GROUP = 'row-group-';
RowNode.ID_PREFIX_TOP_PINNED = 't-';
RowNode.ID_PREFIX_BOTTOM_PINNED = 'b-';
RowNode.OBJECT_ID_SEQUENCE = 0;
RowNode.EVENT_ROW_SELECTED = 'rowSelected';
RowNode.EVENT_DATA_CHANGED = 'dataChanged';
RowNode.EVENT_CELL_CHANGED = 'cellChanged';
RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED = 'allChildrenCountChanged';
RowNode.EVENT_MASTER_CHANGED = 'masterChanged';
RowNode.EVENT_GROUP_CHANGED = 'groupChanged';
RowNode.EVENT_MOUSE_ENTER = 'mouseEnter';
RowNode.EVENT_MOUSE_LEAVE = 'mouseLeave';
RowNode.EVENT_HEIGHT_CHANGED = 'heightChanged';
RowNode.EVENT_TOP_CHANGED = 'topChanged';
RowNode.EVENT_DISPLAYED_CHANGED = 'displayedChanged';
RowNode.EVENT_FIRST_CHILD_CHANGED = 'firstChildChanged';
RowNode.EVENT_LAST_CHILD_CHANGED = 'lastChildChanged';
RowNode.EVENT_CHILD_INDEX_CHANGED = 'childIndexChanged';
RowNode.EVENT_ROW_INDEX_CHANGED = 'rowIndexChanged';
RowNode.EVENT_EXPANDED_CHANGED = 'expandedChanged';
RowNode.EVENT_HAS_CHILDREN_CHANGED = 'hasChildrenChanged';
RowNode.EVENT_SELECTABLE_CHANGED = 'selectableChanged';
RowNode.EVENT_UI_LEVEL_CHANGED = 'uiLevelChanged';
RowNode.EVENT_HIGHLIGHT_CHANGED = 'rowHighlightChanged';
RowNode.EVENT_DRAGGING_CHANGED = 'draggingChanged';
