var CheckboxSelection = require("../widgets/checkboxSelection");
var constants = require('./../constants');
var utils = require('./../utils');

function GroupSelectionPanel(columnController, inMemoryRowController) {
    this.eGui = document.createElement('div');
    this.setupComponents();
    this.columnController = columnController;
    this.inMemoryRowController = inMemoryRowController;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

GroupSelectionPanel.prototype.columnsChanged = function(newColumns, newGroupedColumns) {
    this.cColumnList.setModel(newGroupedColumns);
};

GroupSelectionPanel.prototype.getColumnList = function() {
    return this.cColumnList;
};

GroupSelectionPanel.prototype.columnCellRenderer = function(params) {
    var column = params.value;
    var colDisplayName = this.columnController.getDisplayNameForCol(column);

    var eResult = document.createElement('span');

    var eRemove = document.createElement('i');
    utils.addCssClass(eRemove, 'fa');
    utils.addCssClass(eRemove, 'fa-remove');
    eRemove.style.paddingLeft = '2px';
    eRemove.style.paddingRight = '2px';
    eResult.appendChild(eRemove);

    var that = this;
    eRemove.addEventListener('click', function () {
        var model = that.cColumnList.getModel();
        model.splice(model.indexOf(column), 1);
        that.cColumnList.setModel(model);
        that.onGroupingChanged();
    });

    var eValue = document.createElement('span');
    eValue.innerHTML = colDisplayName;
    eResult.appendChild(eValue);

    return eResult;
};

GroupSelectionPanel.prototype.setupComponents = function() {
    this.cColumnList = new CheckboxSelection();
    this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
    this.eGui.appendChild(this.cColumnList.getGui());

    var columnItemProxy = this.createColumnItemProxy();
    this.cColumnList.setItemProxy(columnItemProxy);
    this.cColumnList.addModelChangedListener(this.onGroupingChanged.bind(this));
};

GroupSelectionPanel.prototype.onGroupingChanged = function() {
    this.inMemoryRowController.doGrouping();
    this.inMemoryRowController.updateModel(constants.STEP_EVERYTHING);
    this.columnController.onColumnStateChanged();
};

GroupSelectionPanel.prototype.createColumnItemProxy = function() {
    var that = this;
    return {
        getText: function(item) { return that.columnController.getDisplayNameForCol(item)},
        isSelected: function(item) { },
        setSelected: function(item, selected) {  }
    };
};

GroupSelectionPanel.prototype.getGui = function() {
    return this.eGui;
};

module.exports = GroupSelectionPanel;