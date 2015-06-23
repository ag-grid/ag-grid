var AgList = require('../widgets/agList');
var constants = require('../constants');
var utils = require('../utils');
var BorderLayout = require('../layout/borderLayout');
var SvgFactory = require('../svgFactory');
var AgDropdownList = require('../widgets/agDropdownList');

var svgFactory = new SvgFactory();

function ValuesSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.setupComponents();
    this.columnController = columnController;
    this.inMemoryRowController = inMemoryRowController;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

ValuesSelectionPanel.prototype.columnsChanged = function(newColumns, newGroupedColumns) {
    this.cColumnList.setModel(newGroupedColumns);
};

ValuesSelectionPanel.prototype.getColumnList = function() {
    return this.cColumnList;
};

ValuesSelectionPanel.prototype.columnCellRenderer = function(params) {
    var column = params.value;
    var colDisplayName = this.columnController.getDisplayNameForCol(column);

    var eResult = document.createElement('span');

    var eRemove = utils.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
    utils.addCssClass(eRemove, 'ag-visible-icons');
    eResult.appendChild(eRemove);

    var that = this;
    eRemove.addEventListener('click', function () {
        var model = that.cColumnList.getModel();
        model.splice(model.indexOf(column), 1);
        that.cColumnList.setModel(model);
        that.onValuesChanged();
    });

    var eValue = document.createElement('span');
    eValue.innerHTML = colDisplayName;
    eResult.appendChild(eValue);

    var agValueType = new AgDropdownList();
    agValueType.setModel(['Sum','Avg','Min','Max']);
    agValueType.setSelected('Sum');
    eResult.appendChild(agValueType.getGui());

    return eResult;
};

ValuesSelectionPanel.prototype.setupComponents = function() {
    var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
    var columnsLocalText = localeTextFunc('valueColumns', 'Value Columns');
    var pivotedColumnsEmptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag columns down from above to create values');

    this.cColumnList = new AgList();
    this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
    this.cColumnList.addModelChangedListener(this.onValuesChanged.bind(this));
    this.cColumnList.setEmptyMessage(pivotedColumnsEmptyMessage);
    this.cColumnList.addStyles({height: '100%', overflow: 'auto'});

    var eNorthPanel = document.createElement('div');
    eNorthPanel.style.paddingTop = '10px';
    eNorthPanel.innerHTML = '<div style="text-align: center;">'+columnsLocalText+'</div>';

    this.layout = new BorderLayout({
        center: this.cColumnList.getGui(),
        north: eNorthPanel
    });
};

ValuesSelectionPanel.prototype.onValuesChanged = function() {
    //this.inMemoryRowController.doGrouping();
    //this.inMemoryRowController.updateModel(constants.STEP_EVERYTHING);
    //this.columnController.onColumnStateChanged();
};

ValuesSelectionPanel.prototype.getGui = function() {
    return this.eRootPanel.getGui();
};

module.exports = ValuesSelectionPanel;