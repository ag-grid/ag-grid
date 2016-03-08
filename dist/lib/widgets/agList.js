/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var template = '<div class="ag-list-selection">' +
    '<div>' +
    '<div ag-repeat class="ag-list-item">' +
    '</div>' +
    '</div>' +
    '</div>';
var DropTargetLocation;
(function (DropTargetLocation) {
    DropTargetLocation[DropTargetLocation["NOT_DROP_TARGET"] = 0] = "NOT_DROP_TARGET";
    DropTargetLocation[DropTargetLocation["DROP_TARGET_ABOVE"] = 1] = "DROP_TARGET_ABOVE";
    DropTargetLocation[DropTargetLocation["DROP_TARGET_BELOW"] = 2] = "DROP_TARGET_BELOW";
})(DropTargetLocation || (DropTargetLocation = {}));
;
var AgList = (function () {
    function AgList(dragAndDropService) {
        this.readOnly = false;
        this.dragAndDropService = dragAndDropService;
        this.setupComponents();
        this.uniqueId = 'CheckboxSelection-' + Math.random();
        this.modelChangedListeners = [];
        this.itemSelectedListeners = [];
        this.itemMovedListeners = [];
        this.beforeDropListeners = [];
        this.dragSources = [];
        this.setupAsDropTarget();
    }
    AgList.prototype.setReadOnly = function (readOnly) {
        this.readOnly = readOnly;
    };
    AgList.prototype.setEmptyMessage = function (emptyMessage) {
        this.emptyMessage = emptyMessage;
        this.refreshView();
    };
    AgList.prototype.getUniqueId = function () {
        return this.uniqueId;
    };
    AgList.prototype.addStyles = function (styles) {
        utils_1.Utils.addStylesToElement(this.eGui, styles);
    };
    AgList.prototype.addCssClass = function (cssClass) {
        utils_1.Utils.addCssClass(this.eGui, cssClass);
    };
    AgList.prototype.addDragSource = function (dragSource) {
        this.dragSources.push(dragSource);
    };
    AgList.prototype.addModelChangedListener = function (listener) {
        this.modelChangedListeners.push(listener);
    };
    AgList.prototype.addItemSelectedListener = function (listener) {
        this.itemSelectedListeners.push(listener);
    };
    AgList.prototype.addItemMovedListener = function (listener) {
        this.itemMovedListeners.push(listener);
    };
    AgList.prototype.addBeforeDropListener = function (listener) {
        this.beforeDropListeners.push(listener);
    };
    AgList.prototype.fireItemMoved = function (fromIndex, toIndex) {
        for (var i = 0; i < this.itemMovedListeners.length; i++) {
            this.itemMovedListeners[i](fromIndex, toIndex);
        }
    };
    AgList.prototype.fireModelChanged = function () {
        for (var i = 0; i < this.modelChangedListeners.length; i++) {
            this.modelChangedListeners[i](this.model);
        }
    };
    AgList.prototype.fireItemSelected = function (item) {
        for (var i = 0; i < this.itemSelectedListeners.length; i++) {
            this.itemSelectedListeners[i](item);
        }
    };
    AgList.prototype.fireBeforeDrop = function (item) {
        for (var i = 0; i < this.beforeDropListeners.length; i++) {
            this.beforeDropListeners[i](item);
        }
    };
    AgList.prototype.setupComponents = function () {
        this.eGui = utils_1.Utils.loadTemplate(template);
        this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");
        this.eListParent = this.eFilterValueTemplate.parentNode;
        utils_1.Utils.removeAllChildren(this.eListParent);
    };
    AgList.prototype.setModel = function (model) {
        this.model = model;
        this.refreshView();
    };
    AgList.prototype.getModel = function () {
        return this.model;
    };
    AgList.prototype.setCellRenderer = function (cellRenderer) {
        this.cellRenderer = cellRenderer;
    };
    AgList.prototype.refreshView = function () {
        utils_1.Utils.removeAllChildren(this.eListParent);
        if (this.model && this.model.length > 0) {
            this.insertRows();
        }
        else {
            this.insertBlankMessage();
        }
    };
    AgList.prototype.insertRows = function () {
        for (var i = 0; i < this.model.length; i++) {
            var item = this.model[i];
            //var text = this.getText(item);
            //var selected = this.isSelected(item);
            var eListItem = this.eFilterValueTemplate.cloneNode(true);
            if (this.cellRenderer) {
                var params = { value: item };
                utils_1.Utils.useRenderer(eListItem, this.cellRenderer, params);
            }
            else {
                eListItem.innerHTML = item;
            }
            eListItem.addEventListener('click', this.fireItemSelected.bind(this, item));
            this.addDragAndDropToListItem(eListItem, item);
            this.eListParent.appendChild(eListItem);
        }
    };
    AgList.prototype.insertBlankMessage = function () {
        if (this.emptyMessage) {
            var eMessage = document.createElement('div');
            eMessage.style.color = 'grey';
            eMessage.style.padding = '4px';
            eMessage.style.textAlign = 'center';
            eMessage.innerHTML = this.emptyMessage;
            this.eListParent.appendChild(eMessage);
        }
    };
    AgList.prototype.setupAsDropTarget = function () {
        this.dragAndDropService.addDropTarget(this.eGui, {
            acceptDrag: this.externalAcceptDrag.bind(this),
            drop: this.externalDrop.bind(this),
            noDrop: this.externalNoDrop.bind(this)
        });
    };
    AgList.prototype.externalAcceptDrag = function (dragEvent) {
        var allowedSource = this.dragSources.indexOf(dragEvent.containerId) >= 0;
        if (!allowedSource) {
            return false;
        }
        var alreadyHaveCol = this.model.indexOf(dragEvent.data) >= 0;
        if (alreadyHaveCol) {
            return false;
        }
        this.eGui.style.backgroundColor = 'lightgreen';
        return true;
    };
    AgList.prototype.externalDrop = function (dragEvent) {
        var newListItem = dragEvent.data;
        this.fireBeforeDrop(newListItem);
        if (!this.readOnly) {
            this.addItemToList(newListItem);
        }
        this.eGui.style.backgroundColor = '';
    };
    AgList.prototype.externalNoDrop = function () {
        this.eGui.style.backgroundColor = '';
    };
    AgList.prototype.addItemToList = function (newItem) {
        this.model.push(newItem);
        this.refreshView();
        this.fireModelChanged();
    };
    AgList.prototype.addDragAndDropToListItem = function (eListItem, item) {
        var that = this;
        this.dragAndDropService.addDragSource(eListItem, {
            getData: function () {
                return item;
            },
            getContainerId: function () {
                return that.uniqueId;
            }
        });
        this.dragAndDropService.addDropTarget(eListItem, {
            acceptDrag: function (dragItem) {
                return that.internalAcceptDrag(item, dragItem, eListItem);
            },
            drop: function (dragItem) {
                that.internalDrop(item, dragItem.data);
            },
            noDrop: function () {
                that.internalNoDrop(eListItem);
            }
        });
    };
    AgList.prototype.internalAcceptDrag = function (targetColumn, dragItem, eListItem) {
        var result = dragItem.data !== targetColumn && dragItem.containerId === this.uniqueId;
        if (result) {
            if (this.dragAfterThisItem(targetColumn, dragItem.data)) {
                this.setDropCssClasses(eListItem, DropTargetLocation.DROP_TARGET_ABOVE);
            }
            else {
                this.setDropCssClasses(eListItem, DropTargetLocation.DROP_TARGET_BELOW);
            }
        }
        return result;
    };
    AgList.prototype.internalDrop = function (targetColumn, draggedColumn) {
        var oldIndex = this.model.indexOf(draggedColumn);
        var newIndex = this.model.indexOf(targetColumn);
        if (this.readOnly) {
            this.fireItemMoved(oldIndex, newIndex);
        }
        else {
            this.model.splice(oldIndex, 1);
            this.model.splice(newIndex, 0, draggedColumn);
            this.refreshView();
            this.fireModelChanged();
        }
    };
    AgList.prototype.internalNoDrop = function (eListItem) {
        this.setDropCssClasses(eListItem, DropTargetLocation.NOT_DROP_TARGET);
    };
    AgList.prototype.dragAfterThisItem = function (targetColumn, draggedColumn) {
        return this.model.indexOf(targetColumn) < this.model.indexOf(draggedColumn);
    };
    AgList.prototype.setDropCssClasses = function (eListItem, state) {
        utils_1.Utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === DropTargetLocation.NOT_DROP_TARGET);
        utils_1.Utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DropTargetLocation.DROP_TARGET_ABOVE);
        utils_1.Utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DropTargetLocation.DROP_TARGET_BELOW);
    };
    AgList.prototype.getGui = function () {
        return this.eGui;
    };
    return AgList;
})();
exports.AgList = AgList;
