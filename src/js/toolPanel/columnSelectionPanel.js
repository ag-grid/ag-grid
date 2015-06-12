var CheckboxSelection = require("../widgets/checkboxSelection");

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

ColumnSelectionPanel.prototype.setupComponents = function() {
    this.cColumnList = new CheckboxSelection();
    this.eGui.appendChild(this.cColumnList.getGui());

    var columnItemProxy = this.createColumnItemProxy();
    this.cColumnList.setItemProxy(columnItemProxy);

    var that = this;
    this.cColumnList.addItemMovedListener( function() {
        that.columnController.onColumnStateChanged();
    });
};

ColumnSelectionPanel.prototype.createColumnItemProxy = function() {
    var that = this;
    return {
        getText: function(item) { return that.columnController.getDisplayNameForCol(item)},
        isSelected: function(item) { return item.visible},
        setSelected: function(item, selected) { that.setSelected(item, selected); }
    };
};

ColumnSelectionPanel.prototype.setSelected = function(column, selected) {
    column.visible = selected;
    this.columnController.onColumnStateChanged();
};

ColumnSelectionPanel.prototype.getGui = function() {
    return this.eGui;
};

module.exports = ColumnSelectionPanel;
