var CheckboxSelection = require("../widgets/checkboxSelection");
var constants = require('../constants');
var utils = require('../utils');
var BorderLayout = require('../layout/borderLayout');
var SvgFactory = require('../svgFactory');

var svgFactory = new SvgFactory();

function GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.setupComponents();
    this.columnController = columnController;
    this.inMemoryRowController = inMemoryRowController;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

GroupSelectionPanel.prototype.columnsChanged = function(newColumns, newGroupedColumns) {
    this.cColumnList.setModel(newGroupedColumns);
};

GroupSelectionPanel.prototype.getColumnList = function() {
    return this.cColumnList;
};

GroupSelectionPanel.prototype.columnCellRenderer = function(params) {
    var column = params.value;
    var colDisplayName = this.columnController.getDisplayNameForCol(column);

    var eResult = document.createElement('span');

    var eRemove = utils.createIcon('columnRemoveFromGroupIcon', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
    utils.addCssClass(eRemove, 'ag-visible-icons');
    eResult.appendChild(eRemove);

    var that = this;
    eRemove.addEventListener('click', function () {
        var model = that.cColumnList.getModel();
        model.splice(model.indexOf(column), 1);
        that.cColumnList.setModel(model);
        that.onGroupingChanged();
    });

    var eValue = document.createElement('span');
    eValue.innerHTML = colDisplayName;
    eResult.appendChild(eValue);

    return eResult;
};

GroupSelectionPanel.prototype.setupComponents = function() {
    var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
    var columnsLocalText = localeTextFunc('pivotedColumns', 'Pivoted Columns');
    var pivotedColumnsEmptyMessage = localeTextFunc('pivotedColumnsEmptyMessage', 'Drag columns down from above to pivot by those columns');

    this.cColumnList = new CheckboxSelection();
    this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
    this.cColumnList.addModelChangedListener(this.onGroupingChanged.bind(this));
    this.cColumnList.setEmptyMessage(pivotedColumnsEmptyMessage);

    var eNorthPanel = document.createElement('div');
    eNorthPanel.style.paddingTop = '10px';
    eNorthPanel.innerHTML = '<div style="text-align: center;">'+columnsLocalText+'</div>';

    this.layout = new BorderLayout({
        center: this.cColumnList.getGui(),
        north: eNorthPanel
    });
};

GroupSelectionPanel.prototype.onGroupingChanged = function() {
    this.inMemoryRowController.doGrouping();
    this.inMemoryRowController.updateModel(constants.STEP_EVERYTHING);
    this.columnController.onColumnStateChanged();
};

GroupSelectionPanel.prototype.getGui = function() {
    return this.eRootPanel.getGui();
};

module.exports = GroupSelectionPanel;