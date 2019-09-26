// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid-community/main");
var dropZoneColumnComp_1 = require("./dropZoneColumnComp");
var BaseDropZonePanel = /** @class */ (function (_super) {
    __extends(BaseDropZonePanel, _super);
    function BaseDropZonePanel(horizontal, valueColumn, name) {
        var _this = _super.call(this, "<div class=\"ag-column-drop ag-unselectable ag-column-drop-" + (horizontal ? 'horizontal' : 'vertical') + " ag-column-drop-" + name + "\"></div>") || this;
        _this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
        _this.guiDestroyFunctions = [];
        _this.childColumnComponents = [];
        _this.horizontal = horizontal;
        _this.valueColumn = valueColumn;
        _this.eColumnDropList = main_1._.loadTemplate('<div class="ag-column-drop-list"></div>');
        return _this;
    }
    BaseDropZonePanel.prototype.isHorizontal = function () {
        return this.horizontal;
    };
    BaseDropZonePanel.prototype.setBeans = function (beans) {
        this.beans = beans;
    };
    BaseDropZonePanel.prototype.destroy = function () {
        this.destroyGui();
        _super.prototype.destroy.call(this);
    };
    BaseDropZonePanel.prototype.destroyGui = function () {
        this.guiDestroyFunctions.forEach(function (func) { return func(); });
        this.guiDestroyFunctions.length = 0;
        this.childColumnComponents.length = 0;
        main_1._.clearElement(this.getGui());
        main_1._.clearElement(this.eColumnDropList);
    };
    BaseDropZonePanel.prototype.init = function (params) {
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
    BaseDropZonePanel.prototype.setupDropTarget = function () {
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
    BaseDropZonePanel.prototype.isInterestedIn = function (type) {
        // not interested in row drags
        return type === main_1.DragSourceType.HeaderCell || type === main_1.DragSourceType.ToolPanel;
    };
    BaseDropZonePanel.prototype.checkInsertIndex = function (draggingEvent) {
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
    BaseDropZonePanel.prototype.getNewHorizontalInsertIndex = function (draggingEvent) {
        if (main_1._.missing(draggingEvent.hDirection)) {
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
    BaseDropZonePanel.prototype.getNewVerticalInsertIndex = function (draggingEvent) {
        if (main_1._.missing(draggingEvent.vDirection)) {
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
    BaseDropZonePanel.prototype.checkDragStartedBySelf = function (draggingEvent) {
        if (this.state !== BaseDropZonePanel.STATE_NOT_DRAGGING) {
            return;
        }
        this.state = BaseDropZonePanel.STATE_REARRANGE_COLUMNS;
        this.potentialDndColumns = draggingEvent.dragSource.dragItemCallback().columns || [];
        this.refreshGui();
        this.checkInsertIndex(draggingEvent);
        this.refreshGui();
    };
    BaseDropZonePanel.prototype.onDragging = function (draggingEvent) {
        this.checkDragStartedBySelf(draggingEvent);
        var positionChanged = this.checkInsertIndex(draggingEvent);
        if (positionChanged) {
            this.refreshGui();
        }
    };
    BaseDropZonePanel.prototype.onDragEnter = function (draggingEvent) {
        // this will contain all columns that are potential drops
        var dragColumns = draggingEvent.dragSource.dragItemCallback().columns || [];
        this.state = BaseDropZonePanel.STATE_NEW_COLUMNS_IN;
        // take out columns that are not groupable
        var goodDragColumns = main_1._.filter(dragColumns, this.isColumnDroppable.bind(this));
        var weHaveColumnsToDrag = goodDragColumns.length > 0;
        if (weHaveColumnsToDrag) {
            this.potentialDndColumns = goodDragColumns;
            this.checkInsertIndex(draggingEvent);
            this.refreshGui();
        }
    };
    BaseDropZonePanel.prototype.isPotentialDndColumns = function () {
        return main_1._.existsAndNotEmpty(this.potentialDndColumns);
    };
    BaseDropZonePanel.prototype.onDragLeave = function (draggingEvent) {
        // if the dragging started from us, we remove the group, however if it started
        // someplace else, then we don't, as it was only 'asking'
        if (this.state === BaseDropZonePanel.STATE_REARRANGE_COLUMNS) {
            var columns = draggingEvent.dragSource.dragItemCallback().columns || [];
            this.removeColumns(columns);
        }
        if (this.isPotentialDndColumns()) {
            this.potentialDndColumns = [];
            this.refreshGui();
        }
        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    };
    BaseDropZonePanel.prototype.onDragStop = function () {
        if (this.isPotentialDndColumns()) {
            var success = void 0;
            if (this.state === BaseDropZonePanel.STATE_NEW_COLUMNS_IN) {
                this.addColumns(this.potentialDndColumns);
                success = true;
            }
            else {
                success = this.rearrangeColumns(this.potentialDndColumns);
            }
            this.potentialDndColumns = [];
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
        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    };
    BaseDropZonePanel.prototype.removeColumns = function (columnsToRemove) {
        var newColumnList = this.getExistingColumns().slice();
        columnsToRemove.forEach(function (column) { return main_1._.removeFromArray(newColumnList, column); });
        this.updateColumns(newColumnList);
    };
    BaseDropZonePanel.prototype.addColumns = function (columnsToAdd) {
        var newColumnList = this.getExistingColumns().slice();
        main_1._.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        this.updateColumns(newColumnList);
    };
    BaseDropZonePanel.prototype.rearrangeColumns = function (columnsToAdd) {
        var newColumnList = this.getNonGhostColumns().slice();
        main_1._.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        var noChangeDetected = main_1._.shallowCompare(newColumnList, this.getExistingColumns());
        if (noChangeDetected) {
            return false;
        }
        else {
            this.updateColumns(newColumnList);
            return true;
        }
    };
    BaseDropZonePanel.prototype.refreshGui = function () {
        // we reset the scroll position after the refresh.
        // if we don't do this, then the list will always scroll to the top
        // each time we refresh it. this is because part of the refresh empties
        // out the list which sets scroll to zero. so the user could be just
        // reordering the list - we want to prevent the resetting of the scroll.
        // this is relevant for vertical display only (as horizontal has no scroll)
        var scrollTop = this.eColumnDropList.scrollTop;
        this.destroyGui();
        this.addIconAndTitleToGui();
        this.addEmptyMessageToGui();
        this.addColumnsToGui();
        if (!this.isHorizontal()) {
            this.eColumnDropList.scrollTop = scrollTop;
        }
    };
    BaseDropZonePanel.prototype.getNonGhostColumns = function () {
        var _this = this;
        var existingColumns = this.getExistingColumns();
        var nonGhostColumns;
        if (this.isPotentialDndColumns()) {
            nonGhostColumns = main_1._.filter(existingColumns, function (column) { return _this.potentialDndColumns.indexOf(column) < 0; });
        }
        else {
            nonGhostColumns = existingColumns;
        }
        return nonGhostColumns;
    };
    BaseDropZonePanel.prototype.addColumnsToGui = function () {
        var _this = this;
        var nonGhostColumns = this.getNonGhostColumns();
        var itemsToAddToGui = [];
        var addingGhosts = this.isPotentialDndColumns();
        nonGhostColumns.forEach(function (column, index) {
            if (addingGhosts && index >= _this.insertIndex) {
                return;
            }
            var columnComponent = _this.createColumnComponent(column, false);
            itemsToAddToGui.push(columnComponent);
        });
        if (this.isPotentialDndColumns()) {
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
        this.getGui().appendChild(this.eColumnDropList);
        itemsToAddToGui.forEach(function (columnComponent, index) {
            var needSeparator = index !== 0;
            if (needSeparator) {
                _this.addArrow(_this.eColumnDropList);
            }
            _this.eColumnDropList.appendChild(columnComponent.getGui());
        });
    };
    BaseDropZonePanel.prototype.createColumnComponent = function (column, ghost) {
        var columnComponent = new dropZoneColumnComp_1.DropZoneColumnComp(column, this.dropTarget, ghost, this.valueColumn);
        columnComponent.addEventListener(dropZoneColumnComp_1.DropZoneColumnComp.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
        this.beans.context.wireBean(columnComponent);
        this.guiDestroyFunctions.push(function () { return columnComponent.destroy(); });
        if (!ghost) {
            this.childColumnComponents.push(columnComponent);
        }
        return columnComponent;
    };
    BaseDropZonePanel.prototype.addIconAndTitleToGui = function () {
        var iconFaded = this.horizontal && this.isExistingColumnsEmpty();
        var eGroupIcon = this.params.icon;
        var eContainer = document.createElement('div');
        main_1._.addCssClass(eGroupIcon, 'ag-column-drop-icon');
        main_1._.addOrRemoveCssClass(eGroupIcon, 'ag-faded', iconFaded);
        eContainer.appendChild(eGroupIcon);
        if (!this.horizontal) {
            var eTitle = document.createElement('span');
            eTitle.innerHTML = this.params.title;
            main_1._.addCssClass(eTitle, 'ag-column-drop-title');
            main_1._.addOrRemoveCssClass(eTitle, 'ag-faded', iconFaded);
            eContainer.appendChild(eTitle);
        }
        this.getGui().appendChild(eContainer);
    };
    BaseDropZonePanel.prototype.isExistingColumnsEmpty = function () {
        return this.getExistingColumns().length === 0;
    };
    BaseDropZonePanel.prototype.addEmptyMessageToGui = function () {
        var showEmptyMessage = this.isExistingColumnsEmpty() && !this.isPotentialDndColumns();
        if (!showEmptyMessage) {
            return;
        }
        var eMessage = document.createElement('span');
        eMessage.innerHTML = this.params.emptyMessage;
        main_1._.addCssClass(eMessage, 'ag-column-drop-empty-message');
        this.getGui().appendChild(eMessage);
    };
    BaseDropZonePanel.prototype.addArrow = function (eParent) {
        // only add the arrows if the layout is horizontal
        if (this.horizontal) {
            // for RTL it's a left arrow, otherwise it's a right arrow
            var enableRtl = this.beans.gridOptionsWrapper.isEnableRtl();
            eParent.appendChild(main_1._.createIconNoSpan(enableRtl ? 'smallLeft' : 'smallRight', this.beans.gridOptionsWrapper));
        }
    };
    BaseDropZonePanel.STATE_NOT_DRAGGING = 'notDragging';
    BaseDropZonePanel.STATE_NEW_COLUMNS_IN = 'newColumnsIn';
    BaseDropZonePanel.STATE_REARRANGE_COLUMNS = 'rearrangeColumns';
    BaseDropZonePanel.CHAR_LEFT_ARROW = '&#8592;';
    BaseDropZonePanel.CHAR_RIGHT_ARROW = '&#8594;';
    return BaseDropZonePanel;
}(main_1.Component));
exports.BaseDropZonePanel = BaseDropZonePanel;
