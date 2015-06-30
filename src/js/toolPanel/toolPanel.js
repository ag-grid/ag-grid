var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');
var GroupSelectionPanel = require('./groupSelectionPanel');
var ValuesSelectionPanel = require('./valuesSelectionPanel');
var VerticalStack = require('../layout/verticalStack');

function ToolPanel() {
    this.layout = new VerticalStack();
}

ToolPanel.prototype.init = function(columnController, inMemoryRowController, gridOptionsWrapper, api) {

    var columnSelectionPanel = new ColumnSelectionPanel(columnController, gridOptionsWrapper);
    this.layout.addPanel(columnSelectionPanel.layout, '50%');
    var valuesSelectionPanel = new ValuesSelectionPanel(columnController, gridOptionsWrapper, api);
    this.layout.addPanel(valuesSelectionPanel.layout, '25%');
    var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper);
    this.layout.addPanel(groupSelectionPanel.layout, '25%');

    var dragSource = columnSelectionPanel.getDragSource();
    valuesSelectionPanel.addDragSource(dragSource);
    groupSelectionPanel.addDragSource(dragSource);

    var eGui = this.layout.getGui();

    utils.addCssClass(eGui, 'ag-tool-panel-container');
};

module.exports = ToolPanel;
