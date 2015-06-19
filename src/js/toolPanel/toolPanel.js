var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');
var GroupSelectionPanel = require('./groupSelectionPanel');
var VerticalStack = require('../layout/verticalStack');

function ToolPanel() {
    this.layout = new VerticalStack();
}

ToolPanel.prototype.init = function(columnController, inMemoryRowController) {

    var columnSelectionPanel = new ColumnSelectionPanel(columnController);
    this.layout.addPanel(columnSelectionPanel.layout, '50%');
    var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController);
    this.layout.addPanel(groupSelectionPanel.layout, '50%');

    groupSelectionPanel.getColumnList().addDragSource(columnSelectionPanel.getColumnList().getUniqueId());

    var eGui = this.layout.getGui();
    eGui.style.border = '1px solid darkgrey';
    eGui.style.padding = '4px';

    utils.addCssClass(eGui, 'ag-tool-panel-container');
};

module.exports = ToolPanel;
