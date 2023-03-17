"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDropZonePanel = void 0;
var core_1 = require("@ag-grid-community/core");
var dropZoneColumnComp_1 = require("./dropZoneColumnComp");
var BaseDropZonePanel = /** @class */ (function (_super) {
    __extends(BaseDropZonePanel, _super);
    function BaseDropZonePanel(horizontal, dropZonePurpose) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-unselectable\" role=\"presentation\"></div>") || this;
        _this.horizontal = horizontal;
        _this.dropZonePurpose = dropZonePurpose;
        _this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
        _this.guiDestroyFunctions = [];
        _this.childColumnComponents = [];
        _this.resizeEnabled = false;
        _this.addElementClasses(_this.getGui());
        _this.eColumnDropList = document.createElement('div');
        _this.addElementClasses(_this.eColumnDropList, 'list');
        core_1._.setAriaRole(_this.eColumnDropList, 'listbox');
        return _this;
    }
    BaseDropZonePanel.prototype.isHorizontal = function () {
        return this.horizontal;
    };
    BaseDropZonePanel.prototype.toggleResizable = function (resizable) {
        this.positionableFeature.setResizable(resizable ? { bottom: true } : false);
        this.resizeEnabled = resizable;
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
        core_1._.clearElement(this.getGui());
        core_1._.clearElement(this.eColumnDropList);
    };
    BaseDropZonePanel.prototype.init = function (params) {
        this.params = params;
        this.createManagedBean(new core_1.ManagedFocusFeature(this.getFocusableElement(), {
            handleKeyDown: this.handleKeyDown.bind(this)
        }));
        this.addManagedListener(this.beans.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, this.refreshGui.bind(this));
        this.addManagedPropertyListener('functionsReadOnly', this.refreshGui.bind(this));
        this.setupDropTarget();
        this.positionableFeature = new core_1.PositionableFeature(this.getGui(), { minHeight: 100 });
        this.createManagedBean(this.positionableFeature);
        // we don't know if this bean will be initialised before columnModel.
        // if columnModel first, then below will work
        // if columnModel second, then below will put blank in, and then above event gets first when columnModel is set up
        this.refreshGui();
        core_1._.setAriaLabel(this.eColumnDropList, this.getAriaLabel());
    };
    BaseDropZonePanel.prototype.handleKeyDown = function (e) {
        var isVertical = !this.horizontal;
        var isNext = e.key === core_1.KeyCode.DOWN;
        var isPrevious = e.key === core_1.KeyCode.UP;
        if (!isVertical) {
            var isRtl = this.gridOptionsService.is('enableRtl');
            isNext = (!isRtl && e.key === core_1.KeyCode.RIGHT) || (isRtl && e.key === core_1.KeyCode.LEFT);
            isPrevious = (!isRtl && e.key === core_1.KeyCode.LEFT) || (isRtl && e.key === core_1.KeyCode.RIGHT);
        }
        if (!isNext && !isPrevious) {
            return;
        }
        var el = this.focusService.findNextFocusableElement(this.getFocusableElement(), false, isPrevious);
        if (el) {
            e.preventDefault();
            el.focus();
        }
    };
    BaseDropZonePanel.prototype.addElementClasses = function (el, suffix) {
        suffix = suffix ? "-" + suffix : '';
        var direction = this.horizontal ? 'horizontal' : 'vertical';
        el.classList.add("ag-column-drop" + suffix, "ag-column-drop-" + direction + suffix);
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
        return type === core_1.DragSourceType.HeaderCell || type === core_1.DragSourceType.ToolPanel;
    };
    BaseDropZonePanel.prototype.checkInsertIndex = function (draggingEvent) {
        var newIndex = this.getNewInsertIndex(draggingEvent);
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
    BaseDropZonePanel.prototype.getNewInsertIndex = function (draggingEvent) {
        var _this = this;
        var mouseEvent = draggingEvent.event;
        var mouseLocation = this.horizontal ? mouseEvent.clientX : mouseEvent.clientY;
        var boundsList = this.childColumnComponents.map(function (col) { return (col.getGui().getBoundingClientRect()); });
        // find the non-ghost component we're hovering
        var hoveredIndex = boundsList.findIndex(function (rect) { return (_this.horizontal ? (rect.right > mouseLocation && rect.left < mouseLocation) : (rect.top < mouseLocation && rect.bottom > mouseLocation)); });
        // not hovering a non-ghost component
        if (hoveredIndex === -1) {
            var enableRtl = this.beans.gridOptionsService.is('enableRtl');
            // if mouse is below or right of all components then new index should be placed last
            var isLast = boundsList.every(function (rect) { return (mouseLocation > (_this.horizontal ? rect.right : rect.bottom)); });
            if (isLast) {
                return enableRtl && this.horizontal ? 0 : this.childColumnComponents.length;
            }
            // if mouse is above or left of all components, new index is first
            var isFirst = boundsList.every(function (rect) { return (mouseLocation < (_this.horizontal ? rect.left : rect.top)); });
            if (isFirst) {
                return enableRtl && this.horizontal ? this.childColumnComponents.length : 0;
            }
            // must be hovering a ghost, don't change the index
            return this.insertIndex;
        }
        // if the old index is equal to or less than the index of our new target
        // we need to shift right, to insert after rather than before
        if (this.insertIndex <= hoveredIndex) {
            return hoveredIndex + 1;
        }
        return hoveredIndex;
    };
    BaseDropZonePanel.prototype.checkDragStartedBySelf = function (draggingEvent) {
        if (this.state !== BaseDropZonePanel.STATE_NOT_DRAGGING) {
            return;
        }
        this.state = BaseDropZonePanel.STATE_REARRANGE_COLUMNS;
        this.potentialDndColumns = draggingEvent.dragSource.getDragItem().columns || [];
        this.refreshGui();
        this.checkInsertIndex(draggingEvent);
        this.refreshGui();
    };
    BaseDropZonePanel.prototype.onDragging = function (draggingEvent) {
        this.checkDragStartedBySelf(draggingEvent);
        if (this.checkInsertIndex(draggingEvent)) {
            this.refreshGui();
        }
    };
    BaseDropZonePanel.prototype.onDragEnter = function (draggingEvent) {
        // this will contain all columns that are potential drops
        var dragColumns = draggingEvent.dragSource.getDragItem().columns || [];
        this.state = BaseDropZonePanel.STATE_NEW_COLUMNS_IN;
        // take out columns that are not droppable
        var goodDragColumns = dragColumns.filter(this.isColumnDroppable.bind(this));
        if (goodDragColumns.length > 0) {
            var hideColumnOnExit = this.isRowGroupPanel() && !this.gridOptionsService.is('suppressRowGroupHidesColumns') && !draggingEvent.fromNudge;
            if (hideColumnOnExit) {
                var dragItem = draggingEvent.dragSource.getDragItem();
                var columns = dragItem.columns;
                this.setColumnsVisible(columns, false, "uiColumnDragged");
            }
            this.potentialDndColumns = goodDragColumns;
            this.checkInsertIndex(draggingEvent);
            this.refreshGui();
        }
    };
    BaseDropZonePanel.prototype.setColumnsVisible = function (columns, visible, source) {
        if (source === void 0) { source = "api"; }
        if (columns) {
            var allowedCols = columns.filter(function (c) { return !c.getColDef().lockVisible; });
            this.colModel.setColumnsVisible(allowedCols, visible, source);
        }
    };
    BaseDropZonePanel.prototype.isPotentialDndColumns = function () {
        return core_1._.existsAndNotEmpty(this.potentialDndColumns);
    };
    BaseDropZonePanel.prototype.isRowGroupPanel = function () {
        return this.dropZonePurpose === 'rowGroup';
    };
    BaseDropZonePanel.prototype.onDragLeave = function (draggingEvent) {
        // if the dragging started from us, we remove the group, however if it started
        // some place else, then we don't, as it was only 'asking'
        if (this.state === BaseDropZonePanel.STATE_REARRANGE_COLUMNS) {
            var columns = draggingEvent.dragSource.getDragItem().columns || [];
            this.removeColumns(columns);
        }
        if (this.isPotentialDndColumns()) {
            var showColumnOnExit = this.isRowGroupPanel() && !this.gridOptionsService.is('suppressMakeColumnVisibleAfterUnGroup') && !draggingEvent.fromNudge;
            if (showColumnOnExit) {
                var dragItem = draggingEvent.dragSource.getDragItem();
                this.setColumnsVisible(dragItem.columns, true, "uiColumnDragged");
            }
            this.potentialDndColumns = [];
            this.refreshGui();
        }
        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    };
    BaseDropZonePanel.prototype.onDragStop = function () {
        if (this.isPotentialDndColumns()) {
            var success = false;
            if (this.state === BaseDropZonePanel.STATE_NEW_COLUMNS_IN) {
                this.addColumns(this.potentialDndColumns);
                success = true;
            }
            else {
                success = this.rearrangeColumns(this.potentialDndColumns);
            }
            this.potentialDndColumns = [];
            // If the function is passive, then we don't refresh, as we assume the client application
            // is going to call setRowGroups / setPivots / setValues at a later point which will then
            // cause a refresh. This gives a nice GUI where the ghost stays until the app has caught
            // up with the changes. However, if there was no change in the order, then we do need to
            // refresh to reset the columns
            if (!this.beans.gridOptionsService.is('functionsPassive') || !success) {
                this.refreshGui();
            }
        }
        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    };
    BaseDropZonePanel.prototype.removeColumns = function (columnsToRemove) {
        var newColumnList = this.getExistingColumns().filter(function (col) { return !core_1._.includes(columnsToRemove, col); });
        this.updateColumns(newColumnList);
    };
    BaseDropZonePanel.prototype.addColumns = function (columnsToAdd) {
        if (!columnsToAdd) {
            return;
        }
        var newColumnList = this.getExistingColumns().slice();
        var colsToAddNoDuplicates = columnsToAdd.filter(function (col) { return newColumnList.indexOf(col) < 0; });
        core_1._.insertArrayIntoArray(newColumnList, colsToAddNoDuplicates, this.insertIndex);
        this.updateColumns(newColumnList);
    };
    BaseDropZonePanel.prototype.rearrangeColumns = function (columnsToAdd) {
        var newColumnList = this.getNonGhostColumns().slice();
        core_1._.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        if (core_1._.areEqual(newColumnList, this.getExistingColumns())) {
            return false;
        }
        this.updateColumns(newColumnList);
        return true;
    };
    BaseDropZonePanel.prototype.refreshGui = function () {
        // we reset the scroll position after the refresh.
        // if we don't do this, then the list will always scroll to the top
        // each time we refresh it. this is because part of the refresh empties
        // out the list which sets scroll to zero. so the user could be just
        // reordering the list - we want to prevent the resetting of the scroll.
        // this is relevant for vertical display only (as horizontal has no scroll)
        var scrollTop = this.eColumnDropList.scrollTop;
        var resizeEnabled = this.resizeEnabled;
        var focusedIndex = this.getFocusedItem();
        var alternateElement = this.focusService.findNextFocusableElement();
        if (!alternateElement) {
            alternateElement = this.focusService.findNextFocusableElement(undefined, false, true);
        }
        this.toggleResizable(false);
        this.destroyGui();
        this.addIconAndTitleToGui();
        this.addEmptyMessageToGui();
        this.addColumnsToGui();
        if (!this.isHorizontal()) {
            this.eColumnDropList.scrollTop = scrollTop;
        }
        if (resizeEnabled) {
            this.toggleResizable(resizeEnabled);
        }
        this.restoreFocus(focusedIndex, alternateElement);
    };
    BaseDropZonePanel.prototype.getFocusedItem = function () {
        var eGui = this.getGui();
        var activeElement = this.gridOptionsService.getDocument().activeElement;
        if (!eGui.contains(activeElement)) {
            return -1;
        }
        var items = Array.from(eGui.querySelectorAll('.ag-column-drop-cell'));
        return items.indexOf(activeElement);
    };
    BaseDropZonePanel.prototype.restoreFocus = function (index, alternateElement) {
        var eGui = this.getGui();
        var items = Array.from(eGui.querySelectorAll('.ag-column-drop-cell'));
        if (index === -1) {
            return;
        }
        if (items.length === 0) {
            alternateElement.focus();
        }
        var indexToFocus = Math.min(items.length - 1, index);
        var el = items[indexToFocus];
        if (el) {
            el.focus();
        }
    };
    BaseDropZonePanel.prototype.getNonGhostColumns = function () {
        var _this = this;
        var existingColumns = this.getExistingColumns();
        if (this.isPotentialDndColumns()) {
            return existingColumns.filter(function (column) { return !core_1._.includes(_this.potentialDndColumns, column); });
        }
        return existingColumns;
    };
    BaseDropZonePanel.prototype.addColumnsToGui = function () {
        var _this = this;
        var nonGhostColumns = this.getNonGhostColumns();
        var itemsToAddToGui = nonGhostColumns.map(function (column) { return (_this.createColumnComponent(column, false)); });
        if (this.isPotentialDndColumns()) {
            var dndColumns = this.potentialDndColumns.map(function (column) { return (_this.createColumnComponent(column, true)); });
            if (this.insertIndex >= itemsToAddToGui.length) {
                itemsToAddToGui.push.apply(itemsToAddToGui, __spread(dndColumns));
            }
            else {
                itemsToAddToGui.splice.apply(itemsToAddToGui, __spread([this.insertIndex, 0], dndColumns));
            }
        }
        this.appendChild(this.eColumnDropList);
        itemsToAddToGui.forEach(function (columnComponent, index) {
            if (index > 0) {
                _this.addArrow(_this.eColumnDropList);
            }
            _this.eColumnDropList.appendChild(columnComponent.getGui());
        });
        this.addAriaLabelsToComponents();
    };
    BaseDropZonePanel.prototype.addAriaLabelsToComponents = function () {
        var _this = this;
        this.childColumnComponents.forEach(function (comp, idx) {
            var eGui = comp.getGui();
            core_1._.setAriaPosInSet(eGui, idx + 1);
            core_1._.setAriaSetSize(eGui, _this.childColumnComponents.length);
        });
    };
    BaseDropZonePanel.prototype.createColumnComponent = function (column, ghost) {
        var _this = this;
        var columnComponent = new dropZoneColumnComp_1.DropZoneColumnComp(column, this.dropTarget, ghost, this.dropZonePurpose, this.horizontal);
        columnComponent.addEventListener(dropZoneColumnComp_1.DropZoneColumnComp.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
        this.beans.context.createBean(columnComponent);
        this.guiDestroyFunctions.push(function () { return _this.destroyBean(columnComponent); });
        if (!ghost) {
            this.childColumnComponents.push(columnComponent);
        }
        return columnComponent;
    };
    BaseDropZonePanel.prototype.addIconAndTitleToGui = function () {
        var eGroupIcon = this.params.icon;
        var eTitleBar = document.createElement('div');
        core_1._.setAriaHidden(eTitleBar, true);
        this.addElementClasses(eTitleBar, 'title-bar');
        this.addElementClasses(eGroupIcon, 'icon');
        this.addOrRemoveCssClass('ag-column-drop-empty', this.isExistingColumnsEmpty());
        eTitleBar.appendChild(eGroupIcon);
        if (!this.horizontal) {
            var eTitle = document.createElement('span');
            this.addElementClasses(eTitle, 'title');
            eTitle.innerHTML = this.params.title;
            eTitleBar.appendChild(eTitle);
        }
        this.appendChild(eTitleBar);
    };
    BaseDropZonePanel.prototype.isExistingColumnsEmpty = function () {
        return this.getExistingColumns().length === 0;
    };
    BaseDropZonePanel.prototype.addEmptyMessageToGui = function () {
        if (!this.isExistingColumnsEmpty() || this.isPotentialDndColumns()) {
            return;
        }
        var eMessage = document.createElement('span');
        eMessage.innerHTML = this.params.emptyMessage;
        this.addElementClasses(eMessage, 'empty-message');
        this.eColumnDropList.appendChild(eMessage);
    };
    BaseDropZonePanel.prototype.addArrow = function (eParent) {
        // only add the arrows if the layout is horizontal
        if (this.horizontal) {
            // for RTL it's a left arrow, otherwise it's a right arrow
            var enableRtl = this.beans.gridOptionsService.is('enableRtl');
            var icon = core_1._.createIconNoSpan(enableRtl ? 'smallLeft' : 'smallRight', this.beans.gridOptionsService);
            this.addElementClasses(icon, 'cell-separator');
            eParent.appendChild(icon);
        }
    };
    BaseDropZonePanel.STATE_NOT_DRAGGING = 'notDragging';
    BaseDropZonePanel.STATE_NEW_COLUMNS_IN = 'newColumnsIn';
    BaseDropZonePanel.STATE_REARRANGE_COLUMNS = 'rearrangeColumns';
    __decorate([
        core_1.Autowired('columnModel')
    ], BaseDropZonePanel.prototype, "colModel", void 0);
    __decorate([
        core_1.Autowired('focusService')
    ], BaseDropZonePanel.prototype, "focusService", void 0);
    return BaseDropZonePanel;
}(core_1.Component));
exports.BaseDropZonePanel = BaseDropZonePanel;
