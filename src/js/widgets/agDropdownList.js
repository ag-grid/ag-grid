var AgList = require('./agList');
var utils = require('../utils');

function AgDropdownList() {
    this.setupComponents();
}

AgDropdownList.prototype.setupComponents = function() {
    this.eGui = document.createElement('span');
    this.eValue = document.createElement('span');
    this.eGui.appendChild(this.eValue);
    this.agList = new AgList();

    this.eValue.addEventListener('click', this.onClick.bind(this));
    this.agList.addItemSelectedListener(this.itemSelected.bind(this));

    this.agList.addStyles({display: 'inline-block', position: 'absolute'});
};

AgDropdownList.prototype.itemSelected = function(item) {
    this.setSelected(item);
    if (this.hidePopupCallback) {
        this.hidePopupCallback();
    }
};

AgDropdownList.prototype.onClick = function() {
    this.hidePopupCallback = utils.addAsModalPopupNew(this.eGui, this.agList.getGui());
};

AgDropdownList.prototype.getGui = function() {
    return this.eGui;
};

AgDropdownList.prototype.setSelected = function(item) {
    this.selectedItem = item;
    this.refreshView();
};

AgDropdownList.prototype.setCellRenderer = function(cellRenderer) {
    this.agList.setCellRenderer(cellRenderer);
    this.cellRenderer = cellRenderer;
};

AgDropdownList.prototype.refreshView = function() {
    utils.removeAllChildren(this.eValue);

    if (this.selectedItem === null || this.selectedItem === undefined) {
        return;
    }

    if (this.cellRenderer) {
        var params = {value: this.selectedItem};
        utils.useRenderer(this.eValue, this.cellRenderer, params);
    } else {
        this.eValue.innerHTML = this.selectedItem;
    }
};

AgDropdownList.prototype.setModel = function(model) {
    this.agList.setModel(model);
};

module.exports = AgDropdownList;