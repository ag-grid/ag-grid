var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');
var GroupSelectionPanel = require('./groupSelectionPanel');
var ValuesSelectionPanel = require('./valuesSelectionPanel');
var VerticalStack = require('../layout/verticalStack');

function ToolPanel() {
    this.layout = new VerticalStack();
}

ToolPanel.prototype.init = function(columnController, inMemoryRowController, gridOptionsWrapper, api) {

    var suppressPivotAndValues = gridOptionsWrapper.isToolPanelSuppressPivot();
    var suppressValues = gridOptionsWrapper.isToolPanelSuppressValues();

    var showPivot = !suppressPivotAndValues;
    var showValues = !suppressPivotAndValues && !suppressValues;

    // top list, column reorder and visibility
    var columnSelectionPanel = new ColumnSelectionPanel(columnController, gridOptionsWrapper);
    var heightColumnSelection = suppressPivotAndValues ? '100%' : '50%';
    this.layout.addPanel(columnSelectionPanel.layout, heightColumnSelection);
    var dragSource = columnSelectionPanel.getDragSource();

    if (showValues) {
        var valuesSelectionPanel = new ValuesSelectionPanel(columnController, gridOptionsWrapper, api);
        this.layout.addPanel(valuesSelectionPanel.layout, '25%');
        valuesSelectionPanel.addDragSource(dragSource);
    }

    if (showPivot) {
        var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper);
        var heightPivotSelection = showValues ? '25%' : '50%';
        this.layout.addPanel(groupSelectionPanel.layout, heightPivotSelection);
        groupSelectionPanel.addDragSource(dragSource);
    }

    var eGui = this.layout.getGui();

    utils.addCssClass(eGui, 'ag-tool-panel-container');
};

module.exports = ToolPanel;
