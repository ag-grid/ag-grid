var template = require('./toolPanel.html');
var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');

function ToolPanel() {
}

ToolPanel.prototype.init = function(eToolPanelContainer, columnController) {
    var eGui = this.createGui();
    eToolPanelContainer.appendChild(eGui);

    var columnSelectionPanel = new ColumnSelectionPanel(columnController);
    eGui.appendChild(columnSelectionPanel.getGui());
};

ToolPanel.prototype.createGui = function() {
    return utils.loadTemplate(template);
};

module.exports = ToolPanel;
