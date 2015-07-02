var AgList = require('../widgets/agList');
var constants = require('../constants');
var utils = require('../utils');
var BorderLayout = require('../layout/borderLayout');
var SvgFactory = require('../svgFactory');
var AgDropdownList = require('../widgets/agDropdownList');

var svgFactory = new SvgFactory();

function ValuesSelectionPanel(columnController, gridOptionsWrapper, api) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.setupComponents();
    this.columnController = columnController;
    this.api = api;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

ValuesSelectionPanel.prototype.columnsChanged = function(newColumns, newGroupedColumns, newValuesColumns) {
    this.cColumnList.setModel(newValuesColumns);
};

ValuesSelectionPanel.prototype.addDragSource = function(dragSource) {
    this.cColumnList.addDragSource(dragSource);
};

ValuesSelectionPanel.prototype.cellRenderer = function(params) {
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

    var agValueType = new AgDropdownList();
    agValueType.setModel([constants.SUM, constants.MIN, constants.MAX]);
    agValueType.setSelected(column.aggFunc);
    agValueType.setWidth(45);

    agValueType.addItemSelectedListener( function(item) {
        column.aggFunc = item;
        that.onValuesChanged();
    });

    eResult.appendChild(agValueType.getGui());

    var eValue = document.createElement('span');
    eValue.innerHTML = colDisplayName;
    eValue.style.paddingLeft = '2px';
    eResult.appendChild(eValue);

    return eResult;
};

ValuesSelectionPanel.prototype.setupComponents = function() {
    var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
    var columnsLocalText = localeTextFunc('valueColumns', 'Value Columns');
    var emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag columns from above to create values');

    this.cColumnList = new AgList();
    this.cColumnList.setCellRenderer(this.cellRenderer.bind(this));
    this.cColumnList.addModelChangedListener(this.onValuesChanged.bind(this));
    this.cColumnList.setEmptyMessage(emptyMessage);
    this.cColumnList.addStyles({height: '100%', overflow: 'auto'});
    this.cColumnList.addBeforeDropListener(this.beforeDropListener.bind(this));

    var eNorthPanel = document.createElement('div');
    eNorthPanel.style.paddingTop = '10px';
    eNorthPanel.innerHTML = '<div style="text-align: center;">'+columnsLocalText+'</div>';

    this.layout = new BorderLayout({
        center: this.cColumnList.getGui(),
        north: eNorthPanel
    });
};

ValuesSelectionPanel.prototype.beforeDropListener = function(newItem) {
    if (!newItem.aggFunc) {
        newItem.aggFunc = constants.SUM;
    }
};

ValuesSelectionPanel.prototype.onValuesChanged = function() {
    this.api.recomputeAggregates();
};

module.exports = ValuesSelectionPanel;