/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Events } from "../events";
import { EventService } from "../eventService";
import { debounce } from "../utils/function";
import { exists, missing, missingOrEmpty } from "../utils/generic";
import { getAllKeysInObjects } from "../utils/object";
var RowNode = /** @class */ (function () {
    function RowNode(beans) {
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
    /**
     * Replaces the data on the `rowNode`. When this method is called, the grid will refresh the entire rendered row if it is displayed.
     */
    RowNode.prototype.setData = function (data) {
        this.setDataCommon(data, false);
    };
    // similar to setRowData, however it is expected that the data is the same data item. this
    // is intended to be used with Redux type stores, where the whole data can be changed. we are
    // guaranteed that the data is the same entity (so grid doesn't need to worry about the id of the
    // underlying data changing, hence doesn't need to worry about selection). the grid, upon receiving
    // dataChanged event, will refresh the cells rather than rip them all out (so user can show transitions).
    /**
     * Updates the data on the `rowNode`. When this method is called, the grid will refresh the entire rendered row if it is displayed.
     */
    RowNode.prototype.updateData = function (data) {
        this.setDataCommon(data, true);
    };
    RowNode.prototype.setDataCommon = function (data, update) {
        var oldData = this.data;
        this.data = data;
        this.beans.valueCache.onDataChanged();
        this.updateDataOnDetailNode();
        this.checkRowSelectable();
        this.resetQuickFilterAggregateText();
        var event = this.createDataChangedEvent(data, oldData, update);
        this.dispatchLocalEvent(event);
    };
    // when we are doing master / detail, the detail node is lazy created, but then kept around.
    // so if we show / hide the detail, the same detail rowNode is used. so we need to keep the data
    // in sync, otherwise expand/collapse of the detail would still show the old values.
    RowNode.prototype.updateDataOnDetailNode = function () {
        if (this.detailNode) {
            this.detailNode.data = this.data;
        }
    };
    RowNode.prototype.createDataChangedEvent = function (newData, oldData, update) {
        return {
            type: RowNode.EVENT_DATA_CHANGED,
            node: this,
            oldData: oldData,
            newData: newData,
            update: update
        };
    };
    RowNode.prototype.createLocalRowEvent = function (type) {
        return {
            type: type,
            node: this
        };
    };
    RowNode.prototype.getRowIndexString = function () {
        if (this.rowPinned === 'top') {
            return 't-' + this.rowIndex;
        }
        if (this.rowPinned === 'bottom') {
            return 'b-' + this.rowIndex;
        }
        return this.rowIndex.toString();
    };
    RowNode.prototype.createDaemonNode = function () {
        var oldNode = new RowNode(this.beans);
        // just copy the id and data, this is enough for the node to be used
        // in the selection controller (the selection controller is the only
        // place where daemon nodes can live).
        oldNode.id = this.id;
        oldNode.data = this.data;
        oldNode.__daemon = true;
        oldNode.selected = this.selected;
        oldNode.level = this.level;
        return oldNode;
    };
    RowNode.prototype.setDataAndId = function (data, id) {
        var oldNode = exists(this.id) ? this.createDaemonNode() : null;
        var oldData = this.data;
        this.data = data;
        this.updateDataOnDetailNode();
        this.setId(id);
        this.beans.selectionService.syncInRowNode(this, oldNode);
        this.checkRowSelectable();
        var event = this.createDataChangedEvent(data, oldData, false);
        this.dispatchLocalEvent(event);
    };
    RowNode.prototype.checkRowSelectable = function () {
        var isRowSelectableFunc = this.beans.gridOptionsService.get('isRowSelectable');
        this.setRowSelectable(isRowSelectableFunc ? isRowSelectableFunc(this) : true);
    };
    RowNode.prototype.setRowSelectable = function (newVal) {
        if (this.selectable !== newVal) {
            this.selectable = newVal;
            if (this.eventService) {
                this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_SELECTABLE_CHANGED));
            }
            var isGroupSelectsChildren = this.beans.gridOptionsService.is('groupSelectsChildren');
            if (isGroupSelectsChildren) {
                var selected = this.calculateSelectedFromChildren();
                this.setSelectedParams({ newValue: selected !== null && selected !== void 0 ? selected : false, source: 'selectableChanged' });
            }
        }
    };
    RowNode.prototype.setId = function (id) {
        // see if user is providing the id's
        var getRowIdFunc = this.beans.gridOptionsService.getRowIdFunc();
        if (getRowIdFunc) {
            // if user is providing the id's, then we set the id only after the data has been set.
            // this is important for virtual pagination and viewport, where empty rows exist.
            if (this.data) {
                // we pass 'true' as we skip this level when generating keys,
                // as we don't always have the key for this level (eg when updating
                // data via transaction on SSRM, we are getting key to look up the
                // RowNode, don't have the RowNode yet, thus no way to get the current key)
                var parentKeys = this.getGroupKeys(true);
                this.id = getRowIdFunc({
                    data: this.data,
                    parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                    level: this.level
                });
                // make sure id provided doesn't start with 'row-group-' as this is reserved. also check that
                // it has 'startsWith' in case the user provided a number.
                if (this.id !== null && typeof this.id === 'string' && this.id.startsWith(RowNode.ID_PREFIX_ROW_GROUP)) {
                    console.error("AG Grid: Row IDs cannot start with " + RowNode.ID_PREFIX_ROW_GROUP + ", this is a reserved prefix for AG Grid's row grouping feature.");
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
    };
    RowNode.prototype.getGroupKeys = function (excludeSelf) {
        if (excludeSelf === void 0) { excludeSelf = false; }
        var keys = [];
        var pointer = this;
        if (excludeSelf) {
            pointer = pointer.parent;
        }
        while (pointer && pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }
        keys.reverse();
        return keys;
    };
    RowNode.prototype.isPixelInRange = function (pixel) {
        if (!exists(this.rowTop) || !exists(this.rowHeight)) {
            return false;
        }
        return pixel >= this.rowTop && pixel < (this.rowTop + this.rowHeight);
    };
    RowNode.prototype.setFirstChild = function (firstChild) {
        if (this.firstChild === firstChild) {
            return;
        }
        this.firstChild = firstChild;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_FIRST_CHILD_CHANGED));
        }
    };
    RowNode.prototype.setLastChild = function (lastChild) {
        if (this.lastChild === lastChild) {
            return;
        }
        this.lastChild = lastChild;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_LAST_CHILD_CHANGED));
        }
    };
    RowNode.prototype.setChildIndex = function (childIndex) {
        if (this.childIndex === childIndex) {
            return;
        }
        this.childIndex = childIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_CHILD_INDEX_CHANGED));
        }
    };
    RowNode.prototype.setRowTop = function (rowTop) {
        this.oldRowTop = this.rowTop;
        if (this.rowTop === rowTop) {
            return;
        }
        this.rowTop = rowTop;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_TOP_CHANGED));
        }
        this.setDisplayed(rowTop !== null);
    };
    RowNode.prototype.clearRowTopAndRowIndex = function () {
        this.oldRowTop = null;
        this.setRowTop(null);
        this.setRowIndex(null);
    };
    RowNode.prototype.setDisplayed = function (displayed) {
        if (this.displayed === displayed) {
            return;
        }
        this.displayed = displayed;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_DISPLAYED_CHANGED));
        }
    };
    RowNode.prototype.setDragging = function (dragging) {
        if (this.dragging === dragging) {
            return;
        }
        this.dragging = dragging;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_DRAGGING_CHANGED));
        }
    };
    RowNode.prototype.setHighlighted = function (highlighted) {
        if (highlighted === this.highlighted) {
            return;
        }
        this.highlighted = highlighted;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_HIGHLIGHT_CHANGED));
        }
    };
    RowNode.prototype.setAllChildrenCount = function (allChildrenCount) {
        if (this.allChildrenCount === allChildrenCount) {
            return;
        }
        this.allChildrenCount = allChildrenCount;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED));
        }
    };
    RowNode.prototype.setMaster = function (master) {
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
    };
    RowNode.prototype.setGroup = function (group) {
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
    };
    /**
     * Sets the row height.
     * Call if you want to change the height initially assigned to the row.
     * After calling, you must call `api.onRowHeightChanged()` so the grid knows it needs to work out the placement of the rows. */
    RowNode.prototype.setRowHeight = function (rowHeight, estimated) {
        if (estimated === void 0) { estimated = false; }
        this.rowHeight = rowHeight;
        this.rowHeightEstimated = estimated;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_HEIGHT_CHANGED));
        }
    };
    RowNode.prototype.setRowAutoHeight = function (cellHeight, column) {
        if (!this.__autoHeights) {
            this.__autoHeights = {};
        }
        var autoHeights = this.__autoHeights;
        autoHeights[column.getId()] = cellHeight;
        if (cellHeight != null) {
            if (this.checkAutoHeightsDebounced == null) {
                this.checkAutoHeightsDebounced = debounce(this.checkAutoHeights.bind(this), 1);
            }
            this.checkAutoHeightsDebounced();
        }
    };
    RowNode.prototype.checkAutoHeights = function () {
        var notAllPresent = false;
        var nonePresent = true;
        var newRowHeight = 0;
        var autoHeights = this.__autoHeights;
        if (autoHeights == null) {
            return;
        }
        var displayedAutoHeightCols = this.beans.columnModel.getAllDisplayedAutoHeightCols();
        displayedAutoHeightCols.forEach(function (col) {
            var cellHeight = autoHeights[col.getId()];
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
        var rowModel = this.beans.rowModel;
        if (rowModel.onRowHeightChangedDebounced) {
            rowModel.onRowHeightChangedDebounced();
        }
    };
    RowNode.prototype.setRowIndex = function (rowIndex) {
        if (this.rowIndex === rowIndex) {
            return;
        }
        this.rowIndex = rowIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_ROW_INDEX_CHANGED));
        }
    };
    RowNode.prototype.setUiLevel = function (uiLevel) {
        if (this.uiLevel === uiLevel) {
            return;
        }
        this.uiLevel = uiLevel;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_UI_LEVEL_CHANGED));
        }
    };
    /**
     * Set the expanded state of this rowNode. Pass `true` to expand and `false` to collapse.
     */
    RowNode.prototype.setExpanded = function (expanded, e) {
        if (this.expanded === expanded) {
            return;
        }
        this.expanded = expanded;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_EXPANDED_CHANGED));
        }
        var event = Object.assign({}, this.createGlobalRowEvent(Events.EVENT_ROW_GROUP_OPENED), {
            expanded: expanded,
            event: e || null
        });
        this.beans.rowNodeEventThrottle.dispatchExpanded(event);
        // when using footers we need to refresh the group row, as the aggregation
        // values jump between group and footer
        if (this.beans.gridOptionsService.is('groupIncludeFooter')) {
            this.beans.rowRenderer.refreshCells({ rowNodes: [this] });
        }
    };
    RowNode.prototype.createGlobalRowEvent = function (type) {
        return {
            type: type,
            node: this,
            data: this.data,
            rowIndex: this.rowIndex,
            rowPinned: this.rowPinned,
            context: this.beans.gridOptionsService.context,
            api: this.beans.gridOptionsService.api,
            columnApi: this.beans.gridOptionsService.columnApi
        };
    };
    RowNode.prototype.dispatchLocalEvent = function (event) {
        if (this.eventService) {
            this.eventService.dispatchEvent(event);
        }
    };
    /**
     * Replaces the value on the `rowNode` for the specified column. When complete,
     * the grid will refresh the rendered cell on the required row only.
     * **Note**: This method on fires `onCellEditRequest` when the Grid is on **Read Only** mode.
     *
     * @param colKey The column where the value should be updated
     * @param newValue The new value
     * @param eventSource The source of the event
     * @returns `True` if the value was changed, otherwise `False`.
     */
    RowNode.prototype.setDataValue = function (colKey, newValue, eventSource) {
        // When it is done via the editors, no 'cell changed' event gets fired, as it's assumed that
        // the cell knows about the change given it's in charge of the editing.
        // this method is for the client to call, so the cell listens for the change
        // event, and also flashes the cell when the change occurs.
        var column = this.beans.columnModel.getPrimaryColumn(colKey);
        var oldValue = this.beans.valueService.getValue(column, this);
        if (this.beans.gridOptionsService.is('readOnlyEdit')) {
            this.dispatchEventForSaveValueReadOnly(column, oldValue, newValue, eventSource);
            return false;
        }
        var valueChanged = this.beans.valueService.setValue(this, column, newValue, eventSource);
        this.dispatchCellChangedEvent(column, newValue, oldValue);
        this.checkRowSelectable();
        return valueChanged;
    };
    RowNode.prototype.dispatchEventForSaveValueReadOnly = function (column, oldValue, newValue, eventSource) {
        var event = {
            type: Events.EVENT_CELL_EDIT_REQUEST,
            event: null,
            rowIndex: this.rowIndex,
            rowPinned: this.rowPinned,
            column: column,
            colDef: column.getColDef(),
            context: this.beans.gridOptionsService.context,
            api: this.beans.gridOptionsService.api,
            columnApi: this.beans.gridOptionsService.columnApi,
            data: this.data,
            node: this,
            oldValue: oldValue,
            newValue: newValue,
            value: newValue,
            source: eventSource
        };
        this.beans.eventService.dispatchEvent(event);
    };
    RowNode.prototype.setGroupValue = function (colKey, newValue) {
        var column = this.beans.columnModel.getGridColumn(colKey);
        if (missing(this.groupData)) {
            this.groupData = {};
        }
        var columnId = column.getColId();
        var oldValue = this.groupData[columnId];
        if (oldValue === newValue) {
            return;
        }
        this.groupData[columnId] = newValue;
        this.dispatchCellChangedEvent(column, newValue, oldValue);
    };
    // sets the data for an aggregation
    RowNode.prototype.setAggData = function (newAggData) {
        var _this = this;
        // find out all keys that could potentially change
        var colIds = getAllKeysInObjects([this.aggData, newAggData]);
        var oldAggData = this.aggData;
        this.aggData = newAggData;
        // if no event service, nobody has registered for events, so no need fire event
        if (this.eventService) {
            colIds.forEach(function (colId) {
                var column = _this.beans.columnModel.getGridColumn(colId);
                var value = _this.aggData ? _this.aggData[colId] : undefined;
                var oldValue = oldAggData ? oldAggData[colId] : undefined;
                _this.dispatchCellChangedEvent(column, value, oldValue);
            });
        }
    };
    RowNode.prototype.updateHasChildren = function () {
        // in CSRM, the group property will be set before the childrenAfterGroup property, check both to prevent flickering
        var newValue = (this.group && !this.footer) || (this.childrenAfterGroup && this.childrenAfterGroup.length > 0);
        var isSsrm = this.beans.gridOptionsService.isRowModelType('serverSide');
        if (isSsrm) {
            var isTreeData = this.beans.gridOptionsService.isTreeData();
            var isGroupFunc = this.beans.gridOptionsService.get('isServerSideGroup');
            // stubs and footers can never have children, as they're grid rows. if tree data the presence of children
            // is determined by the isServerSideGroup callback, if not tree data then the rows group property will be set.
            newValue = !this.stub && !this.footer && (isTreeData ? !!isGroupFunc && isGroupFunc(this.data) : !!this.group);
        }
        if (newValue !== this.__hasChildren) {
            this.__hasChildren = !!newValue;
            if (this.eventService) {
                this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_HAS_CHILDREN_CHANGED));
            }
        }
    };
    RowNode.prototype.hasChildren = function () {
        if (this.__hasChildren == null) {
            this.updateHasChildren();
        }
        return this.__hasChildren;
    };
    RowNode.prototype.isEmptyRowGroupNode = function () {
        return this.group && missingOrEmpty(this.childrenAfterGroup);
    };
    RowNode.prototype.dispatchCellChangedEvent = function (column, newValue, oldValue) {
        var cellChangedEvent = {
            type: RowNode.EVENT_CELL_CHANGED,
            node: this,
            column: column,
            newValue: newValue,
            oldValue: oldValue
        };
        this.dispatchLocalEvent(cellChangedEvent);
    };
    /**
     * The first time `quickFilter` runs, the grid creates a one-off string representation of the row.
     * This string is then used for the quick filter instead of hitting each column separately.
     * When you edit, using grid editing, this string gets cleared down.
     * However if you edit without using grid editing, you will need to clear this string down for the row to be updated with the new values.
     * Otherwise new values will not work with the `quickFilter`. */
    RowNode.prototype.resetQuickFilterAggregateText = function () {
        this.quickFilterAggregateText = null;
    };
    /** Returns:
    * - `true` if the node can be expanded, i.e it is a group or master row.
    * - `false` if the node cannot be expanded
    */
    RowNode.prototype.isExpandable = function () {
        return (this.hasChildren() && !this.footer) || this.master ? true : false;
    };
    /** Returns:
     * - `true` if node is selected,
     * - `false` if the node isn't selected
     * - `undefined` if it's partially selected (group where not all children are selected). */
    RowNode.prototype.isSelected = function () {
        // for footers, we just return what our sibling selected state is, as cannot select a footer
        if (this.footer) {
            return this.sibling.isSelected();
        }
        return this.selected;
    };
    /** Perform a depth-first search of this node and its children. */
    RowNode.prototype.depthFirstSearch = function (callback) {
        if (this.childrenAfterGroup) {
            this.childrenAfterGroup.forEach(function (child) { return child.depthFirstSearch(callback); });
        }
        callback(this);
    };
    // + selectionController.calculatedSelectedForAllGroupNodes()
    RowNode.prototype.calculateSelectedFromChildren = function () {
        var _a;
        var atLeastOneSelected = false;
        var atLeastOneDeSelected = false;
        var atLeastOneMixed = false;
        if (!((_a = this.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length)) {
            return this.selectable ? this.selected : null;
        }
        for (var i = 0; i < this.childrenAfterGroup.length; i++) {
            var child = this.childrenAfterGroup[i];
            var childState = child.isSelected();
            // non-selectable nodes must be calculated from their children, or ignored if no value results.
            if (!child.selectable) {
                var selectable = child.calculateSelectedFromChildren();
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
    };
    RowNode.prototype.setSelectedInitialValue = function (selected) {
        this.selected = selected;
    };
    RowNode.prototype.selectThisNode = function (newValue, e, source) {
        if (source === void 0) { source = 'api'; }
        // we only check selectable when newValue=true (ie selecting) to allow unselecting values,
        // as selectable is dynamic, need a way to unselect rows when selectable becomes false.
        var selectionNotAllowed = !this.selectable && newValue;
        var selectionNotChanged = this.selected === newValue;
        if (selectionNotAllowed || selectionNotChanged) {
            return false;
        }
        this.selected = newValue;
        if (this.eventService) {
            this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_ROW_SELECTED));
        }
        var event = __assign(__assign({}, this.createGlobalRowEvent(Events.EVENT_ROW_SELECTED)), { event: e || null, source: source });
        this.beans.eventService.dispatchEvent(event);
        return true;
    };
    /**
     * Select (or deselect) the node.
     * @param newValue -`true` for selection, `false` for deselection.
     * @param clearSelection - If selecting, then passing `true` will select the node exclusively (i.e. NOT do multi select). If doing deselection, `clearSelection` has no impact.
     * @param suppressFinishActions - Pass `true` to prevent the `selectionChanged` from being fired. Note that the `rowSelected` event will still be fired.
     * @param source - Source property that will appear in the `selectionChanged` event.
     */
    RowNode.prototype.setSelected = function (newValue, clearSelection, suppressFinishActions, source) {
        if (clearSelection === void 0) { clearSelection = false; }
        if (suppressFinishActions === void 0) { suppressFinishActions = false; }
        if (source === void 0) { source = 'api'; }
        this.setSelectedParams({
            newValue: newValue,
            clearSelection: clearSelection,
            suppressFinishActions: suppressFinishActions,
            rangeSelect: false,
            source: source
        });
    };
    // to make calling code more readable, this is the same method as setSelected except it takes names parameters
    RowNode.prototype.setSelectedParams = function (params) {
        if (this.rowPinned) {
            console.warn('AG Grid: cannot select pinned rows');
            return 0;
        }
        if (this.id === undefined) {
            console.warn('AG Grid: cannot select node until id for node is known');
            return 0;
        }
        return this.beans.selectionService.setNodeSelected(__assign(__assign({}, params), { node: this.footer ? this.sibling : this }));
    };
    /**
     * Returns:
     * - `true` if node is either pinned to the `top` or `bottom`
     * - `false` if the node isn't pinned
     */
    RowNode.prototype.isRowPinned = function () {
        return this.rowPinned === 'top' || this.rowPinned === 'bottom';
    };
    RowNode.prototype.isParentOfNode = function (potentialParent) {
        var parentNode = this.parent;
        while (parentNode) {
            if (parentNode === potentialParent) {
                return true;
            }
            parentNode = parentNode.parent;
        }
        return false;
    };
    /** Add an event listener. */
    RowNode.prototype.addEventListener = function (eventType, listener) {
        if (!this.eventService) {
            this.eventService = new EventService();
        }
        this.eventService.addEventListener(eventType, listener);
    };
    /** Remove event listener. */
    RowNode.prototype.removeEventListener = function (eventType, listener) {
        if (!this.eventService) {
            return;
        }
        this.eventService.removeEventListener(eventType, listener);
        if (this.eventService.noRegisteredListenersExist()) {
            this.eventService = null;
        }
    };
    RowNode.prototype.onMouseEnter = function () {
        this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_MOUSE_ENTER));
    };
    RowNode.prototype.onMouseLeave = function () {
        this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_MOUSE_LEAVE));
    };
    RowNode.prototype.getFirstChildOfFirstChild = function (rowGroupColumn) {
        var currentRowNode = this;
        var isCandidate = true;
        var foundFirstChildPath = false;
        var nodeToSwapIn = null;
        // if we are hiding groups, then if we are the first child, of the first child,
        // all the way up to the column we are interested in, then we show the group cell.
        while (isCandidate && !foundFirstChildPath) {
            var parentRowNode = currentRowNode.parent;
            var firstChild = exists(parentRowNode) && currentRowNode.firstChild;
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
    };
    /**
     * Returns:
     * - `true` if the node is a full width cell
     * - `false` if the node is not a full width cell
     */
    RowNode.prototype.isFullWidthCell = function () {
        var isFullWidthCellFunc = this.getIsFullWidthCellFunc();
        return isFullWidthCellFunc ? isFullWidthCellFunc({ rowNode: this }) : false;
    };
    RowNode.prototype.getIsFullWidthCellFunc = function () {
        var isFullWidthRow = this.beans.gridOptionsService.getCallback('isFullWidthRow');
        if (isFullWidthRow) {
            return isFullWidthRow;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        var isFullWidthCell = this.beans.gridOptionsService.get('isFullWidthCell');
        if (isFullWidthCell) {
            return function (params) { return isFullWidthCell(params.rowNode); };
        }
    };
    /**
     * Returns the route of the row node. If the Row Node is a group, it returns the route to that Row Node.
     * If the Row Node is not a group, it returns `undefined`.
     */
    RowNode.prototype.getRoute = function () {
        if (this.key == null) {
            return;
        }
        var res = [];
        var pointer = this;
        while (pointer.key != null) {
            res.push(pointer.key);
            pointer = pointer.parent;
        }
        return res.reverse();
    };
    RowNode.prototype.createFooter = function () {
        var _this = this;
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (this.sibling) {
            return;
        }
        var footerNode = new RowNode(this.beans);
        Object.keys(this).forEach(function (key) {
            footerNode[key] = _this[key];
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
    };
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
    return RowNode;
}());
export { RowNode };
