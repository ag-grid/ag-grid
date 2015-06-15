var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');
var GroupSelectionPanel = require('./groupSelectionPanel');

function ToolPanel() {
}

ToolPanel.prototype.init = function(eToolPanelContainer, columnController, inMemoryRowController) {
    var eGui = document.createElement('div');
    eGui.style.height = '100%';
    eToolPanelContainer.appendChild(eGui);

    var columnSelectionPanel = new ColumnSelectionPanel(columnController);
    eGui.appendChild(columnSelectionPanel.getGui());

    var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController);
    eGui.appendChild(groupSelectionPanel.getGui());

    groupSelectionPanel.getColumnList().addDragSource(columnSelectionPanel.getColumnList());
};

module.exports = ToolPanel;
