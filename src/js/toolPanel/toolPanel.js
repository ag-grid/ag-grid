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
    columnSelectionPanel.getGui().style.height = '50%';

    var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController);
    eGui.appendChild(groupSelectionPanel.getGui());
    groupSelectionPanel.getGui().style.height = '50%';

    groupSelectionPanel.getColumnList().addDragSource(columnSelectionPanel.getColumnList().getUniqueId());

    eGui.style.border = '1px solid darkgrey';
    eGui.style.padding = '4px';
};

module.exports = ToolPanel;
