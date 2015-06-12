var template = require('./checkboxSelection.html');
var utils = require('../utils');

var NOT_DROP_TARGET = 0;
var DROP_TARGET_ABOVE = 1;
var DROP_TARGET_BELOW = -11;

function CheckboxSelection() {
    this.setupComponents();
    this.uniqueId = 'CheckboxSelection-' + Math.random();
    this.itemMovedListeners = [];
}

CheckboxSelection.prototype.addItemMovedListener = function(listener) {
    this.itemMovedListeners.push(listener);
};

CheckboxSelection.prototype.fireItemMoved = function() {
    for (var i = 0; i<this.itemMovedListeners.length; i++) {
        this.itemMovedListeners[i]();
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
    this.drawListItems();
};

CheckboxSelection.prototype.drawListItems = function() {
    utils.removeAllChildren(this.eListParent);

    if (!this.model) {
        return;
    }

    for (var i = 0; i<this.model.length; i++) {
        var item = this.model[i];
        var text = this.getText(item);
        var selected = this.isSelected(item);
        var eListItem = this.eFilterValueTemplate.cloneNode(true);

        var eCheckbox = eListItem.querySelector('.ag-checkbox-selection-checkbox');
        this.styleListItemSelected(eListItem, eCheckbox, selected);

        var eValue = eListItem.querySelector(".ag-checkbox-selection-value");
        eValue.innerHTML = text;

        this.addChangeListener(eListItem, eCheckbox, item);
        this.addDragAndDrop(eListItem, item);

        this.eListParent.appendChild(eListItem);
    }
};

CheckboxSelection.prototype.styleListItemSelected = function(eListItem, eCheckbox, selected) {
    utils.addOrRemoveCssClass(eCheckbox, 'fa-eye', selected);
    utils.addOrRemoveCssClass(eCheckbox, 'fa-eye-slash', !selected);

    utils.addOrRemoveCssClass(eListItem, 'ag-list-item-selected', !selected);
    utils.addOrRemoveCssClass(eListItem, 'ag-list-item-not-selected', !selected);
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

CheckboxSelection.prototype.addDragAndDrop = function(eListItem, item) {

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

    this.drawListItems();
    this.fireItemMoved();
};

CheckboxSelection.prototype.addChangeListener = function(eListItem, eCheckbox, item) {
    var that = this;
    eListItem.addEventListener('click', function() {
        var selected = !that.isSelected(item);
        that.styleListItemSelected(eListItem, eCheckbox, selected);
        that.itemProxy.setSelected(item, selected);
    });
};

CheckboxSelection.prototype.setSelected = function(item, selected) {
    return this.itemProxy.setSelected(item, selected);
};

CheckboxSelection.prototype.isSelected = function(item) {
    return this.itemProxy.isSelected(item);
};

CheckboxSelection.prototype.getText = function(item) {
    return this.itemProxy.getText(item);
};

CheckboxSelection.prototype.getGui = function() {
    return this.eGui;
};

module.exports = CheckboxSelection;
