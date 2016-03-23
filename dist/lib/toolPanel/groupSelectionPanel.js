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
var GroupSelectionPanel = (function () {
    function GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper, eventService, dragAndDropService) {
        this.oldToolPanelDragAndDropService = dragAndDropService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.setupComponents();
        this.columnController = columnController;
        this.inMemoryRowController = inMemoryRowController;
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.columnsChanged.bind(this));
    }
    GroupSelectionPanel.prototype.columnsChanged = function () {
        this.cColumnList.setModel(this.columnController.getRowGroupColumns());
    };
    GroupSelectionPanel.prototype.addDragSource = function (dragSource) {
        this.cColumnList.addDragSource(dragSource);
    };
    GroupSelectionPanel.prototype.columnCellRenderer = function (params) {
        var column = params.value;
        var colDisplayName = this.columnController.getDisplayNameForCol(column);
        var eResult = document.createElement('span');
        var eRemove = utils_1.Utils.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
        utils_1.Utils.addCssClass(eRemove, 'ag-visible-icons');
        eResult.appendChild(eRemove);
        var that = this;
        eRemove.addEventListener('click', function () {
            that.columnController.removeRowGroupColumn(column);
        });
        var eValue = document.createElement('span');
        eValue.innerHTML = colDisplayName;
        eResult.appendChild(eValue);
        return eResult;
    };
    GroupSelectionPanel.prototype.setupComponents = function () {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnsLocalText = localeTextFunc('rowGroupColumns', 'Row Groupings');
        var rowGroupColumnsEmptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag columns from above to group rows');
        this.cColumnList = new agList_1.AgList(this.oldToolPanelDragAndDropService);
        this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
        this.cColumnList.addBeforeDropListener(this.onBeforeDrop.bind(this));
        this.cColumnList.addItemMovedListener(this.onItemMoved.bind(this));
        this.cColumnList.setEmptyMessage(rowGroupColumnsEmptyMessage);
        this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
        this.cColumnList.setReadOnly(true);
        var eNorthPanel = document.createElement('div');
        eNorthPanel.style.paddingTop = '10px';
        eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
        this.layout = new borderLayout_1.BorderLayout({
            center: this.cColumnList.getGui(),
            north: eNorthPanel
        });
    };
    GroupSelectionPanel.prototype.onBeforeDrop = function (newItem) {
        this.columnController.addRowGroupColumn(newItem);
    };
    GroupSelectionPanel.prototype.onItemMoved = function (fromIndex, toIndex) {
        this.columnController.moveRowGroupColumn(fromIndex, toIndex);
    };
    return GroupSelectionPanel;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GroupSelectionPanel;
