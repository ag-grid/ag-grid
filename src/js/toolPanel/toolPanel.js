var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');
var GroupSelectionPanel = require('./groupSelectionPanel');
var VerticalStack = require('../layout/verticalStack');

function ToolPanel() {
    this.layout = new VerticalStack();
}

ToolPanel.prototype.init = function(columnController, inMemoryRowController, gridOptionsWrapper) {

    var columnSelectionPanel = new ColumnSelectionPanel(columnController, gridOptionsWrapper);
    this.layout.addPanel(columnSelectionPanel.layout, '50%');
    var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper);
    this.layout.addPanel(groupSelectionPanel.layout, '50%');

    groupSelectionPanel.getColumnList().addDragSource(columnSelectionPanel.getColumnList().getUniqueId());

    var eGui = this.layout.getGui();

    utils.addCssClass(eGui, 'ag-tool-panel-container');
};

module.exports = ToolPanel;
