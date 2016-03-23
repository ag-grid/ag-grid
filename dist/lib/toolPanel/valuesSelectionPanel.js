/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var svgFactory_1 = require("../svgFactory");
var utils_1 = require('../utils');
var events_1 = require("../events");
var agDropdownList_1 = require("../widgets/agDropdownList");
var column_1 = require("../entities/column");
var agList_1 = require("../widgets/agList");
var borderLayout_1 = require("../layout/borderLayout");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var ValuesSelectionPanel = (function () {
    function ValuesSelectionPanel(columnController, gridOptionsWrapper, popupService, eventService, oldToolPanelDragAndDropService) {
        this.oldToolPanelDragAndDropService = oldToolPanelDragAndDropService;
        this.popupService = popupService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.setupComponents();
        this.columnController = columnController;
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGE, this.columnsChanged.bind(this));
    }
    ValuesSelectionPanel.prototype.getLayout = function () {
        return this.layout;
    };
    ValuesSelectionPanel.prototype.columnsChanged = function () {
        this.cColumnList.setModel(this.columnController.getValueColumns());
    };
    ValuesSelectionPanel.prototype.addDragSource = function (dragSource) {
        this.cColumnList.addDragSource(dragSource);
    };
    ValuesSelectionPanel.prototype.cellRenderer = function (params) {
        var column = params.value;
        var colDisplayName = this.columnController.getDisplayNameForCol(column);
        var eResult = document.createElement('span');
        var eRemove = utils_1.Utils.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
        utils_1.Utils.addCssClass(eRemove, 'ag-visible-icons');
        eResult.appendChild(eRemove);
        var that = this;
        eRemove.addEventListener('click', function () {
            that.columnController.removeValueColumn(column);
        });
        var agValueType = new agDropdownList_1.AgDropdownList(this.popupService, this.oldToolPanelDragAndDropService);
        agValueType.setModel([column_1.Column.AGG_SUM, column_1.Column.AGG_MIN, column_1.Column.AGG_MAX]);
        agValueType.setSelected(column.aggFunc);
        agValueType.setWidth(45);
        agValueType.addItemSelectedListener(function (item) {
            that.columnController.setColumnAggFunction(column, item);
        });
        eResult.appendChild(agValueType.getGui());
        var eValue = document.createElement('span');
        eValue.innerHTML = colDisplayName;
        eValue.style.paddingLeft = '2px';
        eResult.appendChild(eValue);
        return eResult;
    };
    ValuesSelectionPanel.prototype.setupComponents = function () {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnsLocalText = localeTextFunc('valueColumns', 'Aggregations');
        var emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag columns from above to aggregate values');
        this.cColumnList = new agList_1.AgList(this.oldToolPanelDragAndDropService);
        this.cColumnList.setCellRenderer(this.cellRenderer.bind(this));
        this.cColumnList.setEmptyMessage(emptyMessage);
        this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
        this.cColumnList.addBeforeDropListener(this.beforeDropListener.bind(this));
        this.cColumnList.setReadOnly(true);
        var eNorthPanel = document.createElement('div');
        eNorthPanel.style.paddingTop = '10px';
        eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
        this.layout = new borderLayout_1.BorderLayout({
            center: this.cColumnList.getGui(),
            north: eNorthPanel
        });
    };
    ValuesSelectionPanel.prototype.beforeDropListener = function (newItem) {
        this.columnController.addValueColumn(newItem);
    };
    return ValuesSelectionPanel;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ValuesSelectionPanel;
