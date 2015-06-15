var CheckboxSelection = require("../widgets/checkboxSelection");
var utils = require('./../utils');

function ColumnSelectionPanel(columnController) {
    this.eGui = document.createElement('div');
    this.setupComponents();
    this.columnController = columnController;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

ColumnSelectionPanel.prototype.columnsChanged = function(newColumns) {
    this.cColumnList.setModel(newColumns);
};

ColumnSelectionPanel.prototype.getColumnList = function() {
    return this.cColumnList;
};

ColumnSelectionPanel.prototype.columnCellRenderer = function(params) {
    var column = params.value;
    var colDisplayName = this.columnController.getDisplayNameForCol(column);

    var eResult = document.createElement('span');

    var eVisible = document.createElement('i');
    utils.addCssClass(eVisible, 'fa');
    eVisible.style.paddingLeft = '2px';
    eVisible.style.paddingRight = '2px';
    if (column.visible) {
        utils.addCssClass(eVisible, 'fa-eye');
    } else {
        utils.addCssClass(eVisible, 'fa-eye-slash');
    }
    eResult.appendChild(eVisible);

    var that = this;
    eVisible.addEventListener('click', function () {
        column.visible = !column.visible;
        that.cColumnList.refreshView();
        that.columnController.onColumnStateChanged();
    });

    var eValue = document.createElement('span');
    eValue.innerHTML = colDisplayName;
    eResult.appendChild(eValue);

    if (!column.visible) {
        utils.addCssClass(eResult, 'ag-column-not-visible');
    }

    return eResult;
};

ColumnSelectionPanel.prototype.setupComponents = function() {
    this.cColumnList = new CheckboxSelection();
    this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
    this.eGui.appendChild(this.cColumnList.getGui());

    var that = this;
    this.cColumnList.addModelChangedListener( function() {
        that.columnController.onColumnStateChanged();
    });
};

ColumnSelectionPanel.prototype.setSelected = function(column, selected) {
    column.visible = selected;
    this.columnController.onColumnStateChanged();
};

ColumnSelectionPanel.prototype.getGui = function() {
    return this.eGui;
};

module.exports = ColumnSelectionPanel;
