var template = require('./checkboxSelection.html');
var utils = require('../utils');

var NOT_DROP_TARGET = 0;
var DROP_TARGET_ABOVE = 1;
var DROP_TARGET_BELOW = -11;

function CheckboxSelection() {
    this.setupComponents();
    this.uniqueId = 'CheckboxSelection-' + Math.random();
    this.modelChangedListeners = [];
    this.dragSources = [];
    this.addDragAndDrop();
}

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

CheckboxSelection.prototype.setItemProxy = function(itemProxy) {
    this.itemProxy = itemProxy;
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

CheckboxSelection.prototype.getModel = function(model) {
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

CheckboxSelection.prototype.dragAfterThisItem = function(item) {
    var itemAfter = this.model.indexOf(item) < this.model.indexOf(this.dragItem);
    return itemAfter;
};

CheckboxSelection.prototype.setDropCssClasses = function(eListItem, state) {
    utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === NOT_DROP_TARGET);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DROP_TARGET_ABOVE);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DROP_TARGET_BELOW);
};

CheckboxSelection.prototype.setDragCssClasses = function(eListItem, dragging) {
    utils.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
    utils.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
};

CheckboxSelection.prototype.getDragItem = function() {
    return this.dragItem;
};

CheckboxSelection.prototype.addDragAndDrop = function() {
    var that = this;
    this.eGui.addEventListener('dragover', function() {
        var dragItem = that.getDragItemFromSource();
        if (dragItem) {
            that.eGui.style.backgroundColor = 'lightgreen';
        }
        event.preventDefault();
    });

    this.eGui.addEventListener('drop', function(event) {
        var dragItem = that.getDragItemFromSource();
        if (dragItem) {
            that.addItemToList(dragItem);
        }
        that.eGui.style.backgroundColor = '';
        event.preventDefault();
    });

    this.eGui.addEventListener('dragleave', function(event) {
        that.eGui.style.backgroundColor = '';
        event.preventDefault();
    });
};

CheckboxSelection.prototype.addItemToList = function(newItem) {
    this.model.push(newItem);
    this.refreshView();
    this.fireModelChanged();
};

CheckboxSelection.prototype.getDragItemFromSource = function() {
    for (var i = 0; i < this.dragSources.length; i++) {
        var dragItem = this.dragSources[i].getDragItem();
        if (dragItem && this.model.indexOf(dragItem)<0) {
            return dragItem;
        }
    }
    return null;
};

CheckboxSelection.prototype.addDragAndDropToListItem = function(eListItem, item) {

    this.setDropCssClasses(eListItem, NOT_DROP_TARGET);

    var that = this;
    eListItem.addEventListener('drop', function(event) {
        if (that.dragItem && that.dragItem!==item) {
            that.onItemDropped(item, that.dragItem);
            that.setDropCssClasses(eListItem, NOT_DROP_TARGET);
        }
        event.preventDefault();
    });

    eListItem.addEventListener('dragover', function() {
        if (that.dragItem && that.dragItem!==item) {
            if (that.dragAfterThisItem(item)) {
                that.setDropCssClasses(eListItem, DROP_TARGET_ABOVE);
            } else {
                that.setDropCssClasses(eListItem, DROP_TARGET_BELOW);
            }
        }
        event.preventDefault();
    });

    eListItem.addEventListener('dragleave', function(event) {
        that.setDropCssClasses(eListItem, NOT_DROP_TARGET);
        event.preventDefault();
    });

    eListItem.addEventListener('dragstart', function() {
        that.setDragCssClasses(eListItem, true);
        that.dragItem = item;
    });

    eListItem.addEventListener('dragend', function() {
        that.setDragCssClasses(eListItem, false);
        that.dragItem = null;
    });
};

CheckboxSelection.prototype.onItemDropped = function(targetColumn, draggedColumn) {
    var oldIndex = this.model.indexOf(draggedColumn);
    var newIndex = this.model.indexOf(targetColumn);

    this.model.splice(oldIndex, 1);
    this.model.splice(newIndex, 0, draggedColumn);

    this.refreshView();
    this.fireModelChanged();
};

CheckboxSelection.prototype.getGui = function() {
    return this.eGui;
};

module.exports = CheckboxSelection;
