var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');

function ToolPanel() {
}

ToolPanel.prototype.init = function(eToolPanelContainer, columnController) {
    var eGui = document.createElement('div');
    eGui.style.height = '100%';
    eToolPanelContainer.appendChild(eGui);

    var columnSelectionPanel = new ColumnSelectionPanel(columnController);
    eGui.appendChild(columnSelectionPanel.getGui());
};

module.exports = ToolPanel;
