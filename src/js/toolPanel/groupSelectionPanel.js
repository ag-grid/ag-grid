var CheckboxSelection = require("../widgets/checkboxSelection");

function GroupSelectionPanel(columnController) {
    this.eGui = document.createElement('div');
    this.setupComponents();
    this.columnController = columnController;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

GroupSelectionPanel.prototype.columnsChanged = function(newColumns, newGroupedColumns) {
    this.cColumnList.setModel(newGroupedColumns);
};

GroupSelectionPanel.prototype.setupComponents = function() {
    this.cColumnList = new CheckboxSelection();
    this.eGui.appendChild(this.cColumnList.getGui());

    var columnItemProxy = this.createColumnItemProxy();
    this.cColumnList.setItemProxy(columnItemProxy);

    //var that = this;
    //this.cColumnList.addItemMovedListener( function() {
    //    that.columnController.onColumnStateChanged();
    //});
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