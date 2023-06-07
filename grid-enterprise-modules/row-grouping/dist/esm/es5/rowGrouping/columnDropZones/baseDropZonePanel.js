var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Autowired, Component, DragSourceType, Events, KeyCode, ManagedFocusFeature, PositionableFeature, _ } from "@ag-grid-community/core";
import { DropZoneColumnComp } from "./dropZoneColumnComp";
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
        _.setAriaRole(_this.eColumnDropList, 'listbox');
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
        _.clearElement(this.getGui());
        _.clearElement(this.eColumnDropList);
    };
    BaseDropZonePanel.prototype.init = function (params) {
        this.params = params;
        this.createManagedBean(new ManagedFocusFeature(this.getFocusableElement(), {
            handleKeyDown: this.handleKeyDown.bind(this)
        }));
        this.addManagedListener(this.beans.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.refreshGui.bind(this));
        this.addManagedPropertyListener('functionsReadOnly', this.refreshGui.bind(this));
        this.setupDropTarget();
        this.positionableFeature = new PositionableFeature(this.getGui(), { minHeight: 100 });
        this.createManagedBean(this.positionableFeature);
        // we don't know if this bean will be initialised before columnModel.
        // if columnModel first, then below will work
        // if columnModel second, then below will put blank in, and then above event gets first when columnModel is set up
        this.refreshGui();
        _.setAriaLabel(this.eColumnDropList, this.getAriaLabel());
    };
    BaseDropZonePanel.prototype.handleKeyDown = function (e) {
        var isVertical = !this.horizontal;
        var isNext = e.key === KeyCode.DOWN;
        var isPrevious = e.key === KeyCode.UP;
        if (!isVertical) {
            var isRtl = this.gridOptionsService.is('enableRtl');
            isNext = (!isRtl && e.key === KeyCode.RIGHT) || (isRtl && e.key === KeyCode.LEFT);
            isPrevious = (!isRtl && e.key === KeyCode.LEFT) || (isRtl && e.key === KeyCode.RIGHT);
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
        return type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel;
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
        return _.existsAndNotEmpty(this.potentialDndColumns);
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
        var newColumnList = this.getExistingColumns().filter(function (col) { return !_.includes(columnsToRemove, col); });
        this.updateColumns(newColumnList);
    };
    BaseDropZonePanel.prototype.addColumns = function (columnsToAdd) {
        if (!columnsToAdd) {
            return;
        }
        var newColumnList = this.getExistingColumns().slice();
        var colsToAddNoDuplicates = columnsToAdd.filter(function (col) { return newColumnList.indexOf(col) < 0; });
        _.insertArrayIntoArray(newColumnList, colsToAddNoDuplicates, this.insertIndex);
        this.updateColumns(newColumnList);
    };
    BaseDropZonePanel.prototype.rearrangeColumns = function (columnsToAdd) {
        var newColumnList = this.getNonGhostColumns().slice();
        _.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        if (_.areEqual(newColumnList, this.getExistingColumns())) {
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
        // focus should only be restored when keyboard mode
        // otherwise mouse clicks will cause containers to scroll
        // without no apparent reason.
        if (this.focusService.isKeyboardMode()) {
            this.restoreFocus(focusedIndex, alternateElement);
        }
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
            return existingColumns.filter(function (column) { return !_.includes(_this.potentialDndColumns, column); });
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
                itemsToAddToGui.push.apply(itemsToAddToGui, __spreadArray([], __read(dndColumns)));
            }
            else {
                itemsToAddToGui.splice.apply(itemsToAddToGui, __spreadArray([this.insertIndex, 0], __read(dndColumns)));
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
            _.setAriaPosInSet(eGui, idx + 1);
            _.setAriaSetSize(eGui, _this.childColumnComponents.length);
        });
    };
    BaseDropZonePanel.prototype.createColumnComponent = function (column, ghost) {
        var _this = this;
        var columnComponent = new DropZoneColumnComp(column, this.dropTarget, ghost, this.dropZonePurpose, this.horizontal);
        columnComponent.addEventListener(DropZoneColumnComp.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
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
        _.setAriaHidden(eTitleBar, true);
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
            var icon = _.createIconNoSpan(enableRtl ? 'smallLeft' : 'smallRight', this.beans.gridOptionsService);
            this.addElementClasses(icon, 'cell-separator');
            eParent.appendChild(icon);
        }
    };
    BaseDropZonePanel.STATE_NOT_DRAGGING = 'notDragging';
    BaseDropZonePanel.STATE_NEW_COLUMNS_IN = 'newColumnsIn';
    BaseDropZonePanel.STATE_REARRANGE_COLUMNS = 'rearrangeColumns';
    __decorate([
        Autowired('columnModel')
    ], BaseDropZonePanel.prototype, "colModel", void 0);
    __decorate([
        Autowired('focusService')
    ], BaseDropZonePanel.prototype, "focusService", void 0);
    return BaseDropZonePanel;
}(Component));
export { BaseDropZonePanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZURyb3Bab25lUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcm93R3JvdXBpbmcvY29sdW1uRHJvcFpvbmVzL2Jhc2VEcm9wWm9uZVBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBSVQsU0FBUyxFQUlULGNBQWMsRUFFZCxNQUFNLEVBSU4sT0FBTyxFQUVQLG1CQUFtQixFQUNuQixtQkFBbUIsRUFFbkIsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFtQjFEO0lBQWdELHFDQUFTO0lBeUNyRCwyQkFBb0IsVUFBbUIsRUFBVSxlQUEwQjtRQUEzRSxZQUNJLGtCQUFNLFVBQVUsQ0FBQyw2REFBeUQsQ0FBQyxTQUs5RTtRQU5tQixnQkFBVSxHQUFWLFVBQVUsQ0FBUztRQUFVLHFCQUFlLEdBQWYsZUFBZSxDQUFXO1FBakNuRSxXQUFLLEdBQUcsaUJBQWlCLENBQUMsa0JBQWtCLENBQUM7UUFRN0MseUJBQW1CLEdBQW1CLEVBQUUsQ0FBQztRQUt6QywyQkFBcUIsR0FBeUIsRUFBRSxDQUFDO1FBVWpELG1CQUFhLEdBQVksS0FBSyxDQUFDO1FBWW5DLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN0QyxLQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckQsS0FBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFJLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDOztJQUNuRCxDQUFDO0lB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