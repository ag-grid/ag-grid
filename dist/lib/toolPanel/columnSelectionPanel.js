/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var svgFactory_1 = require("../svgFactory");
var events_1 = require("../events");
var agList_1 = require("../widgets/agList");
var borderLayout_1 = require("../layout/borderLayout");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var ColumnSelectionPanel = (function () {
    function ColumnSelectionPanel(columnController, gridOptionsWrapper, eventService, oldToolPanelDragAndDropService) {
        this.oldToolPanelDragAndDropService = oldToolPanelDragAndDropService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.columnController = columnController;
        this.setupComponents();
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.columnsChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.columnsChanged.bind(this));
    }
    ColumnSelectionPanel.prototype.columnsChanged = function () {
        this.cColumnList.setModel(this.columnController.getAllColumns());
    };
    ColumnSelectionPanel.prototype.getDragSource = function () {
        return this.cColumnList.getUniqueId();
    };
    ColumnSelectionPanel.prototype.columnCellRenderer = function (params) {
        var column = params.value;
        var colDisplayName = this.columnController.getDisplayNameForCol(column);
        var eResult = document.createElement('span');
        var eVisibleIcons = document.createElement('span');
        utils_1.Utils.addCssClass(eVisibleIcons, 'ag-visible-icons');
        var eShowing = utils_1.Utils.createIcon('columnVisible', this.gridOptionsWrapper, column, svgFactory.createColumnVisibleIcon);
        var eHidden = utils_1.Utils.createIcon('columnHidden', this.gridOptionsWrapper, column, svgFactory.createColumnHiddenIcon);
        eVisibleIcons.appendChild(eShowing);
        eVisibleIcons.appendChild(eHidden);
        eShowing.style.display = column.visible ? '' : 'none';
        eHidden.style.display = column.visible ? 'none' : '';
        eResult.appendChild(eVisibleIcons);
        var eValue = document.createElement('span');
        eValue.innerHTML = colDisplayName;
        eResult.appendChild(eValue);
        if (!column.visible) {
            utils_1.Utils.addCssClass(eResult, 'ag-column-not-visible');
        }
        // change visible if use clicks the visible icon, or if row is double clicked
        eVisibleIcons.addEventListener('click', showEventListener);
        var that = this;
        function showEventListener() {
            that.columnController.setColumnVisible(column, !column.visible);
        }
        return eResult;
    };
    ColumnSelectionPanel.prototype.setupComponents = function () {
        this.cColumnList = new agList_1.AgList(this.oldToolPanelDragAndDropService);
        this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
        this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
        this.cColumnList.addItemMovedListener(this.onItemMoved.bind(this));
        this.cColumnList.setReadOnly(true);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnsLocalText = localeTextFunc('columns', 'Columns');
        var eNorthPanel = document.createElement('div');
        eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
        this.layout = new borderLayout_1.BorderLayout({
            center: this.cColumnList.getGui(),
            north: eNorthPanel
        });
    };
    ColumnSelectionPanel.prototype.onItemMoved = function (fromIndex, toIndex) {
        this.columnController.moveColumnByIndex(fromIndex, toIndex);
    };
    ColumnSelectionPanel.prototype.getGui = function () {
        return this.eRootPanel.getGui();
    };
    return ColumnSelectionPanel;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ColumnSelectionPanel;
