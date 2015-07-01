var template = require('./agList.html');
var utils = require('../utils');
var dragAndDropService = require('../dragAndDrop/dragAndDropService');

var NOT_DROP_TARGET = 0;
var DROP_TARGET_ABOVE = 1;
var DROP_TARGET_BELOW = -11;

function AgList() {
    this.setupComponents();
    this.uniqueId = 'CheckboxSelection-' + Math.random();
    this.modelChangedListeners = [];
    this.itemSelectedListeners = [];
    this.beforeDropListeners = [];
    this.dragSources = [];
    this.setupAsDropTarget();
}

AgList.prototype.setEmptyMessage = function(emptyMessage) {
    return this.emptyMessage = emptyMessage;
    this.refreshView();
};

AgList.prototype.getUniqueId = function() {
    return this.uniqueId;
};

AgList.prototype.addStyles = function(styles) {
    utils.addStylesToElement(this.eGui, styles);
};

AgList.prototype.addCssClass = function(cssClass) {
    utils.addCssClass(this.eGui, cssClass);
};

AgList.prototype.addDragSource = function(dragSource) {
    this.dragSources.push(dragSource);
};

AgList.prototype.addModelChangedListener = function(listener) {
    this.modelChangedListeners.push(listener);
};

AgList.prototype.addItemSelectedListener = function(listener) {
    this.itemSelectedListeners.push(listener);
};

AgList.prototype.addBeforeDropListener = function(listener) {
    this.beforeDropListeners.push(listener);
};

AgList.prototype.fireModelChanged = function() {
    for (var i = 0; i<this.modelChangedListeners.length; i++) {
        this.modelChangedListeners[i]();
    }
};

AgList.prototype.fireItemSelected = function(item) {
    for (var i = 0; i<this.itemSelectedListeners.length; i++) {
        this.itemSelectedListeners[i](item);
    }
};

//col: {
//   id: '',
//   aggFunc: '',
//   visible: '',
//   width: ''
//};
//
//groupedCols: ['a','b','c'];

AgList.prototype.fireBeforeDrop = function(item) {
    for (var i = 0; i<this.beforeDropListeners.length; i++) {
        this.beforeDropListeners[i](item);
    }
};

AgList.prototype.setupComponents = function() {

    this.eGui = utils.loadTemplate(template);
    this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");

    this.eListParent = this.eFilterValueTemplate.parentNode;
    utils.removeAllChildren(this.eListParent);
};

AgList.prototype.setModel = function(model) {
    this.model = model;
    this.refreshView();
};

AgList.prototype.getModel = function() {
    return this.model;
};

AgList.prototype.setCellRenderer = function(cellRenderer) {
    this.cellRenderer = cellRenderer;
};

AgList.prototype.refreshView = function() {
    utils.removeAllChildren(this.eListParent);

    if (this.model && this.model.length > 0) {
        this.insertRows();
    } else {
        this.insertBlankMessage();
    }
};

AgList.prototype.insertRows = function() {
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

        eListItem.addEventListener('click', this.fireItemSelected.bind(this, item));

        this.addDragAndDropToListItem(eListItem, item);
        this.eListParent.appendChild(eListItem);
    }
};

AgList.prototype.insertBlankMessage = function() {
    if (this.emptyMessage) {
        var eMessage = document.createElement('div');
        eMessage.style.color = 'grey';
        eMessage.style.padding = '4px';
        eMessage.style.textAlign = 'center';
        eMessage.innerHTML = this.emptyMessage;
        this.eListParent.appendChild(eMessage);
    }
};

AgList.prototype.setupAsDropTarget = function() {
    dragAndDropService.addDropTarget(this.eGui, {
        acceptDrag: this.externalAcceptDrag.bind(this),
        drop: this.externalDrop.bind(this),
        noDrop: this.externalNoDrop.bind(this)
    });
};

AgList.prototype.externalAcceptDrag = function(dragEvent) {
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

AgList.prototype.externalDrop = function(dragEvent) {
    var newListItem = dragEvent.data;
    this.fireBeforeDrop(newListItem);
    this.addItemToList(newListItem);
    this.eGui.style.backgroundColor = '';
};

AgList.prototype.externalNoDrop = function() {
    this.eGui.style.backgroundColor = '';
};

AgList.prototype.addItemToList = function(newItem) {
    this.model.push(newItem);
    this.refreshView();
    this.fireModelChanged();
};

AgList.prototype.addDragAndDropToListItem = function(eListItem, item) {
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

AgList.prototype.internalAcceptDrag = function(targetColumn, dragItem, eListItem) {
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

AgList.prototype.internalDrop = function(targetColumn, draggedColumn) {
    var oldIndex = this.model.indexOf(draggedColumn);
    var newIndex = this.model.indexOf(targetColumn);

    this.model.splice(oldIndex, 1);
    this.model.splice(newIndex, 0, draggedColumn);

    this.refreshView();
    this.fireModelChanged();
};

AgList.prototype.internalNoDrop = function(eListItem) {
    this.setDropCssClasses(eListItem, NOT_DROP_TARGET);
};

AgList.prototype.dragAfterThisItem = function(targetColumn, draggedColumn) {
    return this.model.indexOf(targetColumn) < this.model.indexOf(draggedColumn);
};

AgList.prototype.setDropCssClasses = function(eListItem, state) {
    utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === NOT_DROP_TARGET);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DROP_TARGET_ABOVE);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DROP_TARGET_BELOW);
};

AgList.prototype.getGui = function() {
    return this.eGui;
};

module.exports = AgList;
