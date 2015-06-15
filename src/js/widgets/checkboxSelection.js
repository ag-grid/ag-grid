var template = require('./checkboxSelection.html');
var utils = require('../utils');
var dragAndDropService = require('../dragAndDrop/dragAndDropService');

var NOT_DROP_TARGET = 0;
var DROP_TARGET_ABOVE = 1;
var DROP_TARGET_BELOW = -11;

function CheckboxSelection() {
    this.setupComponents();
    this.uniqueId = 'CheckboxSelection-' + Math.random();
    this.modelChangedListeners = [];
    this.dragSources = [];
    this.setupAsDropTarget();
}

CheckboxSelection.prototype.getUniqueId = function() {
    return this.uniqueId;
};

CheckboxSelection.prototype.addDragSource = function(dragSource) {
    this.dragSources.push(dragSource);
};

CheckboxSelection.prototype.addModelChangedListener = function(listener) {
    this.modelChangedListeners.push(listener);
};

CheckboxSelection.prototype.fireModelChanged = function() {
    for (var i = 0; i<this.modelChangedListeners.length; i++) {
        this.modelChangedListeners[i]();
    }
};

CheckboxSelection.prototype.setupComponents = function() {

    this.eGui = utils.loadTemplate(template);
    this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");

    this.eListParent = this.eFilterValueTemplate.parentNode;
    utils.removeAllChildren(this.eListParent);
};

CheckboxSelection.prototype.setModel = function(model) {
    this.model = model;
    this.refreshView();
};

CheckboxSelection.prototype.getModel = function() {
    return this.model;
};

CheckboxSelection.prototype.setCellRenderer = function(cellRenderer) {
    this.cellRenderer = cellRenderer;
};

CheckboxSelection.prototype.refreshView = function() {
    utils.removeAllChildren(this.eListParent);

    if (!this.model) {
        return;
    }

    for (var i = 0; i<this.model.length; i++) {
        var item = this.model[i];
        //var text = this.getText(item);
        //var selected = this.isSelected(item);
        var eListItem = this.eFilterValueTemplate.cloneNode(true);

        if (this.cellRenderer) {
            var params = {value: item};
            utils.useRenderer(eListItem, this.cellRenderer, params);
        } else {
            eListItem.innerHTML = item;
        }

        this.addDragAndDropToListItem(eListItem, item);
        this.eListParent.appendChild(eListItem);
    }
};

CheckboxSelection.prototype.getDragItem = function() {
    return this.dragItem;
};

CheckboxSelection.prototype.setupAsDropTarget = function() {

    dragAndDropService.addDropTarget(this.eGui, {
        acceptDrag: this.externalAcceptDrag.bind(this),
        drop: this.externalDrop.bind(this),
        noDrop: this.externalNoDrop.bind(this)
    });

    //var that = this;
    //this.eGui.addEventListener('dragover', function() {
    //    var dragItem = that.getDragItemFromSource();
    //    if (dragItem) {
    //        that.eGui.style.backgroundColor = 'lightgreen';
    //    }
    //    event.preventDefault();
    //});
    //
    //this.eGui.addEventListener('drop', function(event) {
    //    var dragItem = that.getDragItemFromSource();
    //    if (dragItem) {
    //        that.addItemToList(dragItem);
    //    }
    //    that.eGui.style.backgroundColor = '';
    //    event.preventDefault();
    //});
    //
    //this.eGui.addEventListener('dragleave', function(event) {
    //    that.eGui.style.backgroundColor = '';
    //    event.preventDefault();
    //});
};

CheckboxSelection.prototype.externalAcceptDrag = function(dragEvent) {
    console.log('externalAcceptDrag');
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

CheckboxSelection.prototype.externalDrop = function(dragEvent) {
    console.log('externalDrop');
    this.addItemToList(dragEvent.data);
    this.eGui.style.backgroundColor = '';
};

CheckboxSelection.prototype.externalNoDrop = function() {
    console.log('externalNoDrop');
    this.eGui.style.backgroundColor = '';
};

CheckboxSelection.prototype.addItemToList = function(newItem) {
    this.model.push(newItem);
    this.refreshView();
    this.fireModelChanged();
};

CheckboxSelection.prototype.addDragAndDropToListItem = function(eListItem, item) {
    var that = this;
    dragAndDropService.addDragSource(eListItem, {
        getData: function() { return item; },
        getContainerId: function() { return that.uniqueId; }
    });
    dragAndDropService.addDropTarget(eListItem, {
        acceptDrag: function (dragItem) { return that.internalAcceptDrag(item, dragItem, eListItem); },
        drop: function (dragItem) { that.internalDrop(item, dragItem.data); },
        noDrop: function () { that.internalNoDrop(eListItem); }
    });
};

CheckboxSelection.prototype.internalAcceptDrag = function(targetColumn, dragItem, eListItem) {
    var result = dragItem.data !== targetColumn && dragItem.containerId === this.uniqueId;
    if (result) {
        if (this.dragAfterThisItem(targetColumn, dragItem.data)) {
            this.setDropCssClasses(eListItem, DROP_TARGET_ABOVE);
        } else {
            this.setDropCssClasses(eListItem, DROP_TARGET_BELOW);
        }
    }
    return result;
};

CheckboxSelection.prototype.internalDrop = function(targetColumn, draggedColumn) {
    var oldIndex = this.model.indexOf(draggedColumn);
    var newIndex = this.model.indexOf(targetColumn);

    this.model.splice(oldIndex, 1);
    this.model.splice(newIndex, 0, draggedColumn);

    this.refreshView();
    this.fireModelChanged();
};

CheckboxSelection.prototype.internalNoDrop = function(eListItem) {
    this.setDropCssClasses(eListItem, NOT_DROP_TARGET);
};

CheckboxSelection.prototype.dragAfterThisItem = function(targetColumn, draggedColumn) {
    return this.model.indexOf(targetColumn) < this.model.indexOf(draggedColumn);
};

CheckboxSelection.prototype.setDropCssClasses = function(eListItem, state) {
    utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === NOT_DROP_TARGET);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DROP_TARGET_ABOVE);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DROP_TARGET_BELOW);
};

CheckboxSelection.prototype.getGui = function() {
    return this.eGui;
};

module.exports = CheckboxSelection;
