// ag-grid-enterprise v16.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var columnComponent_1 = require("./columnComponent");
var AbstractColumnDropPanel = (function (_super) {
    __extends(AbstractColumnDropPanel, _super);
    function AbstractColumnDropPanel(horizontal, valueColumn, name) {
        var _this = _super.call(this, "<div class=\"ag-column-drop ag-font-style ag-column-drop-" + (horizontal ? 'horizontal' : 'vertical') + " ag-column-drop-" + name + "\"></div>") || this;
        _this.state = AbstractColumnDropPanel.STATE_NOT_DRAGGING;
        _this.guiDestroyFunctions = [];
        _this.childColumnComponents = [];
        _this.horizontal = horizontal;
        _this.valueColumn = valueColumn;
        return _this;
    }
    AbstractColumnDropPanel.prototype.isHorizontal = function () {
        return this.horizontal;
    };
    AbstractColumnDropPanel.prototype.setBeans = function (beans) {
        this.beans = beans;
    };
    AbstractColumnDropPanel.prototype.destroy = function () {
        this.destroyGui();
        _super.prototype.destroy.call(this);
    };
    AbstractColumnDropPanel.prototype.destroyGui = function () {
        this.guiDestroyFunctions.forEach(function (func) { return func(); });
        this.guiDestroyFunctions.length = 0;
        this.childColumnComponents.length = 0;
        main_1.Utils.removeAllChildren(this.getGui());
    };
    AbstractColumnDropPanel.prototype.init = function (params) {
        this.params = params;
        this.logger = this.beans.loggerFactory.create('AbstractColumnDropPanel');
        this.beans.eventService.addEventListener(main_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshGui.bind(this));
        this.addDestroyableEventListener(this.beans.gridOptionsWrapper, 'functionsReadOnly', this.refreshGui.bind(this));
        this.setupDropTarget();
        // we don't know if this bean will be initialised before columnController.
        // if columnController first, then below will work
        // if columnController second, then below will put blank in, and then above event gets first when columnController is set up
        this.refreshGui();
    };
    AbstractColumnDropPanel.prototype.setupDropTarget = function () {
        this.dropTarget = {
            getContainer: this.getGui.bind(this),
            getIconName: this.getIconName.bind(this),
            onDragging: this.onDragging.bind(this),
            onDragEnter: this.onDragEnter.bind(this),
            onDragLeave: this.onDragLeave.bind(this),
            onDragStop: this.onDragStop.bind(this),
            isInterestedIn: this.isInterestedIn.bind(this)
        };
        this.beans.dragAndDropService.addDropTarget(this.dropTarget);
    };
    AbstractColumnDropPanel.prototype.isInterestedIn = function (type) {
        // not interested in row drags
        return type === main_1.DragSourceType.HeaderCell || type === main_1.DragSourceType.ToolPanel;
    };
    AbstractColumnDropPanel.prototype.checkInsertIndex = function (draggingEvent) {
        var newIndex;
        if (this.horizontal) {
            newIndex = this.getNewHorizontalInsertIndex(draggingEvent);
        }
        else {
            newIndex = this.getNewVerticalInsertIndex(draggingEvent);
        }
        // <0 happens when drag is no a direction we are interested in, eg drag is up/down but in horizontal panel
        if (newIndex < 0) {
            return false;
        }
        var changed = newIndex !== this.insertIndex;
        if (changed) {
            this.insertIndex = newIndex;
        }
        return changed;
    };
    AbstractColumnDropPanel.prototype.getNewHorizontalInsertIndex = function (draggingEvent) {
        if (main_1.Utils.missing(draggingEvent.hDirection)) {
            return -1;
        }
        var newIndex = 0;
        var mouseEvent = draggingEvent.event;
        var enableRtl = this.beans.gridOptionsWrapper.isEnableRtl();
        var goingLeft = draggingEvent.hDirection === main_1.HDirection.Left;
        var mouseX = mouseEvent.clientX;
        this.childColumnComponents.forEach(function (childColumn) {
            var rect = childColumn.getGui().getBoundingClientRect();
            var rectX = goingLeft ? rect.right : rect.left;
            var horizontalFit = enableRtl ? (mouseX <= rectX) : (mouseX >= rectX);
            if (horizontalFit) {
                newIndex++;
            }
        });
        return newIndex;
    };
    AbstractColumnDropPanel.prototype.getNewVerticalInsertIndex = function (draggingEvent) {
        if (main_1.Utils.missing(draggingEvent.vDirection)) {
            return -1;
        }
        var newIndex = 0;
        var mouseEvent = draggingEvent.event;
        this.childColumnComponents.forEach(function (childColumn) {
            var rect = childColumn.getGui().getBoundingClientRect();
            if (draggingEvent.vDirection === main_1.VDirection.Down) {
                var verticalFit = mouseEvent.clientY >= rect.top;
                if (verticalFit) {
                    newIndex++;
                }
            }
            else {
                var verticalFit = mouseEvent.clientY >= rect.bottom;
                if (verticalFit) {
                    newIndex++;
                }
            }
        });
        return newIndex;
    };
    AbstractColumnDropPanel.prototype.checkDragStartedBySelf = function (draggingEvent) {
        if (this.state !== AbstractColumnDropPanel.STATE_NOT_DRAGGING) {
            return;
        }
        this.state = AbstractColumnDropPanel.STATE_REARRANGE_COLUMNS;
        this.potentialDndColumns = draggingEvent.dragSource.dragItemCallback().columns;
        this.refreshGui();
        this.checkInsertIndex(draggingEvent);
        this.refreshGui();
    };
    AbstractColumnDropPanel.prototype.onDragging = function (draggingEvent) {
        this.checkDragStartedBySelf(draggingEvent);
        var positionChanged = this.checkInsertIndex(draggingEvent);
        if (positionChanged) {
            this.refreshGui();
        }
    };
    AbstractColumnDropPanel.prototype.onDragEnter = function (draggingEvent) {
        // this will contain all columns that are potential drops
        var dragColumns = draggingEvent.dragSource.dragItemCallback().columns;
        this.state = AbstractColumnDropPanel.STATE_NEW_COLUMNS_IN;
        // take out columns that are not groupable
        var goodDragColumns = main_1.Utils.filter(dragColumns, this.isColumnDroppable.bind(this));
        var weHaveColumnsToDrag = goodDragColumns.length > 0;
        if (weHaveColumnsToDrag) {
            this.potentialDndColumns = goodDragColumns;
            this.checkInsertIndex(draggingEvent);
            this.refreshGui();
        }
    };
    AbstractColumnDropPanel.prototype.isPotentialDndColumns = function () {
        return main_1.Utils.existsAndNotEmpty(this.potentialDndColumns);
    };
    AbstractColumnDropPanel.prototype.onDragLeave = function (draggingEvent) {
        // if the dragging started from us, we remove the group, however if it started
        // someplace else, then we don't, as it was only 'asking'
        if (this.state === AbstractColumnDropPanel.STATE_REARRANGE_COLUMNS) {
            var columns = draggingEvent.dragSource.dragItemCallback().columns;
            this.removeColumns(columns);
        }
        if (this.potentialDndColumns) {
            this.potentialDndColumns = null;
            this.refreshGui();
        }
        this.state = AbstractColumnDropPanel.STATE_NOT_DRAGGING;
    };
    AbstractColumnDropPanel.prototype.onDragStop = function () {
        if (this.potentialDndColumns) {
            var success = void 0;
            if (this.state === AbstractColumnDropPanel.STATE_NEW_COLUMNS_IN) {
                this.addColumns(this.potentialDndColumns);
                success = true;
            }
            else {
                success = this.rearrangeColumns(this.potentialDndColumns);
            }
            this.potentialDndColumns = null;
            // if the function is passive, then we don't refresh, as we assume the client application
            // is going to call setRowGroups / setPivots / setValues at a later point which will then
            // cause a refresh. this gives a nice gui where the ghost stays until the app has caught
            // up with the changes.
            if (this.beans.gridOptionsWrapper.isFunctionsPassive()) {
                // when functions are passive, we don't refresh,
                // unless there was no change in the order, then we
                // do need to refresh to reset the columns
                if (!success) {
                    this.refreshGui();
                }
            }
            else {
                this.refreshGui();
            }
        }
        this.state = AbstractColumnDropPanel.STATE_NOT_DRAGGING;
    };
    AbstractColumnDropPanel.prototype.removeColumns = function (columnsToRemove) {
        var newColumnList = this.getExistingColumns().slice();
        columnsToRemove.forEach(function (column) { return main_1.Utils.removeFromArray(newColumnList, column); });
        this.updateColumns(newColumnList);
    };
    AbstractColumnDropPanel.prototype.addColumns = function (columnsToAdd) {
        var newColumnList = this.getExistingColumns().slice();
        main_1.Utils.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        this.updateColumns(newColumnList);
    };
    AbstractColumnDropPanel.prototype.rearrangeColumns = function (columnsToAdd) {
        var newColumnList = this.getNonGhostColumns().slice();
        main_1.Utils.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        var noChangeDetected = main_1.Utils.shallowCompare(newColumnList, this.getExistingColumns());
        if (noChangeDetected) {
            return false;
        }
        else {
            this.updateColumns(newColumnList);
            return true;
        }
    };
    AbstractColumnDropPanel.prototype.refreshGui = function () {
        this.destroyGui();
        this.addIconAndTitleToGui();
        this.addEmptyMessageToGui();
        this.addColumnsToGui();
    };
    AbstractColumnDropPanel.prototype.getNonGhostColumns = function () {
        var _this = this;
        var existingColumns = this.getExistingColumns();
        var nonGhostColumns;
        if (main_1.Utils.exists(this.potentialDndColumns)) {
            nonGhostColumns = main_1.Utils.filter(existingColumns, function (column) { return _this.potentialDndColumns.indexOf(column) < 0; });
        }
        else {
            nonGhostColumns = existingColumns;
        }
        return nonGhostColumns;
    };
    AbstractColumnDropPanel.prototype.addColumnsToGui = function () {
        var _this = this;
        var nonGhostColumns = this.getNonGhostColumns();
        var itemsToAddToGui = [];
        var addingGhosts = main_1.Utils.exists(this.potentialDndColumns);
        nonGhostColumns.forEach(function (column, index) {
            if (addingGhosts && index >= _this.insertIndex) {
                return;
            }
            var columnComponent = _this.createColumnComponent(column, false);
            itemsToAddToGui.push(columnComponent);
        });
        if (this.potentialDndColumns) {
            this.potentialDndColumns.forEach(function (column) {
                var columnComponent = _this.createColumnComponent(column, true);
                itemsToAddToGui.push(columnComponent);
            });
            nonGhostColumns.forEach(function (column, index) {
                if (index < _this.insertIndex) {
                    return;
                }
                var columnComponent = _this.createColumnComponent(column, false);
                itemsToAddToGui.push(columnComponent);
            });
        }
        itemsToAddToGui.forEach(function (columnComponent, index) {
            var needSeparator = index !== 0;
            if (needSeparator) {
                _this.addArrowToGui();
            }
            _this.getGui().appendChild(columnComponent.getGui());
        });
    };
    AbstractColumnDropPanel.prototype.createColumnComponent = function (column, ghost) {
        var columnComponent = new columnComponent_1.ColumnComponent(column, this.dropTarget, ghost, this.valueColumn);
        columnComponent.addEventListener(columnComponent_1.ColumnComponent.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
        this.beans.context.wireBean(columnComponent);
        this.guiDestroyFunctions.push(function () { return columnComponent.destroy(); });
        if (!ghost) {
            this.childColumnComponents.push(columnComponent);
        }
        return columnComponent;
    };
    AbstractColumnDropPanel.prototype.addIconAndTitleToGui = function () {
        var iconFaded = this.horizontal && this.isExistingColumnsEmpty();
        var eGroupIcon = this.params.icon;
        main_1.Utils.addCssClass(eGroupIcon, 'ag-column-drop-icon');
        main_1.Utils.addOrRemoveCssClass(eGroupIcon, 'ag-faded', iconFaded);
        this.getGui().appendChild(eGroupIcon);
        if (!this.horizontal) {
            var eTitle = document.createElement('span');
            eTitle.innerHTML = this.params.title;
            main_1.Utils.addCssClass(eTitle, 'ag-column-drop-title');
            main_1.Utils.addOrRemoveCssClass(eTitle, 'ag-faded', iconFaded);
            this.getGui().appendChild(eTitle);
        }
    };
    AbstractColumnDropPanel.prototype.isExistingColumnsEmpty = function () {
        return this.getExistingColumns().length === 0;
    };
    AbstractColumnDropPanel.prototype.addEmptyMessageToGui = function () {
        var showEmptyMessage = this.isExistingColumnsEmpty() && !this.potentialDndColumns;
        if (!showEmptyMessage) {
            return;
        }
        var eMessage = document.createElement('span');
        eMessage.innerHTML = this.params.emptyMessage;
        main_1.Utils.addCssClass(eMessage, 'ag-column-drop-empty-message');
        this.getGui().appendChild(eMessage);
    };
    AbstractColumnDropPanel.prototype.addArrowToGui = function () {
        // only add the arrows if the layout is horizontal
        if (this.horizontal) {
            // for RTL it's a left arrow, otherwise it's a right arrow
            var enableRtl = this.beans.gridOptionsWrapper.isEnableRtl();
            var charCode = enableRtl ?
                AbstractColumnDropPanel.CHAR_LEFT_ARROW : AbstractColumnDropPanel.CHAR_RIGHT_ARROW;
            var spanClass = enableRtl ? 'ag-left-arrow' : 'ag-right-arrow';
            var eArrow = document.createElement('span');
            eArrow.className = spanClass;
            eArrow.innerHTML = charCode;
            this.getGui().appendChild(eArrow);
        }
    };
    AbstractColumnDropPanel.STATE_NOT_DRAGGING = 'notDragging';
    AbstractColumnDropPanel.STATE_NEW_COLUMNS_IN = 'newColumnsIn';
    AbstractColumnDropPanel.STATE_REARRANGE_COLUMNS = 'rearrangeColumns';
    AbstractColumnDropPanel.CHAR_LEFT_ARROW = '&#8592;';
    AbstractColumnDropPanel.CHAR_RIGHT_ARROW = '&#8594;';
    return AbstractColumnDropPanel;
}(main_1.Component));
exports.AbstractColumnDropPanel = AbstractColumnDropPanel;
