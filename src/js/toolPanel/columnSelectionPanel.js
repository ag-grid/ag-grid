var CheckboxSelection = require("../widgets/checkboxSelection");
var utils = require('./../utils');
var BorderLayout = require('../layout/BorderLayout');
var SvgFactory = require('../svgFactory');

var svgFactory = new SvgFactory();

function ColumnSelectionPanel(columnController, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.setupComponents();
    this.columnController = columnController;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

ColumnSelectionPanel.prototype.columnsChanged = function(newColumns) {
    this.cColumnList.setModel(newColumns);
};

ColumnSelectionPanel.prototype.getColumnList = function() {
    return this.cColumnList;
};

ColumnSelectionPanel.prototype.columnCellRenderer = function(params) {
    var column = params.value;
    var colDisplayName = this.columnController.getDisplayNameForCol(column);

    var eResult = document.createElement('span');

    var eVisibleIcons = document.createElement('span');
    utils.addCssClass(eVisibleIcons, 'ag-visible-icons');
    var eShowing = utils.createIcon('columnVisible', this.gridOptionsWrapper, column, svgFactory.createColumnShowingSvg);
    var eHidden = utils.createIcon('columnHidden', this.gridOptionsWrapper, column, svgFactory.createColumnHiddenSvg);
    eVisibleIcons.appendChild(eShowing);
    eVisibleIcons.appendChild(eHidden);
    eShowing.style.display = column.visible ? '' : 'none';
    eHidden.style.display = column.visible ? 'none' : '';
    eResult.appendChild(eVisibleIcons);

    var eValue = document.createElement('span');
    eValue.innerHTML = colDisplayName;
    eResult.appendChild(eValue);

    if (!column.visible) {
        utils.addCssClass(eResult, 'ag-column-not-visible');
    }

    // change visible if use clicks the visible icon, or if row is double clicked
    eVisibleIcons.addEventListener('click', showEventListener);

    var that = this;
    function showEventListener() {
        column.visible = !column.visible;
        that.cColumnList.refreshView();
        that.columnController.onColumnStateChanged();
    }

    return eResult;
};

ColumnSelectionPanel.prototype.setupComponents = function() {

    this.cColumnList = new CheckboxSelection();
    this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));

    var that = this;
    this.cColumnList.addModelChangedListener( function() {
        that.columnController.onColumnStateChanged();
    });

    var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
    var columnsLocalText = localeTextFunc('columns', 'Columns');

    var eNorthPanel = document.createElement('div');
    eNorthPanel.innerHTML = '<div style="text-align: center;">'+columnsLocalText+'</div>';

    this.layout = new BorderLayout({
        center: this.cColumnList.getGui(),
        north: eNorthPanel
    });
};

// not sure if this is called anywhere
ColumnSelectionPanel.prototype.setSelected = function(column, selected) {
    column.visible = selected;
    this.columnController.onColumnStateChanged();
};

ColumnSelectionPanel.prototype.getGui = function() {
    return this.eRootPanel.getGui();
};

module.exports = ColumnSelectionPanel;
