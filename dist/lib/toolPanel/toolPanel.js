/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var verticalStack_1 = require("../layout/verticalStack");
var columnSelectionPanel_1 = require("./columnSelectionPanel");
var valuesSelectionPanel_1 = require("./valuesSelectionPanel");
var groupSelectionPanel_1 = require("./groupSelectionPanel");
var ToolPanel = (function () {
    function ToolPanel() {
        this.layout = new verticalStack_1.default();
    }
    ToolPanel.prototype.init = function (columnController, inMemoryRowController, gridOptionsWrapper, popupService, eventService, dragAndDropService) {
        var suppressGroupAndValues = gridOptionsWrapper.isToolPanelSuppressGroups();
        var suppressValues = gridOptionsWrapper.isToolPanelSuppressValues();
        var showGroups = !suppressGroupAndValues;
        var showValues = !suppressGroupAndValues && !suppressValues;
        // top list, column reorder and visibility
        var columnSelectionPanel = new columnSelectionPanel_1.default(columnController, gridOptionsWrapper, eventService, dragAndDropService);
        var heightColumnSelection = suppressGroupAndValues ? '100%' : '50%';
        this.layout.addPanel(columnSelectionPanel.layout, heightColumnSelection);
        var dragSource = columnSelectionPanel.getDragSource();
        if (showValues) {
            var valuesSelectionPanel = new valuesSelectionPanel_1.default(columnController, gridOptionsWrapper, popupService, eventService, dragAndDropService);
            this.layout.addPanel(valuesSelectionPanel.getLayout(), '25%');
            valuesSelectionPanel.addDragSource(dragSource);
        }
        if (showGroups) {
            var groupSelectionPanel = new groupSelectionPanel_1.default(columnController, inMemoryRowController, gridOptionsWrapper, eventService, dragAndDropService);
            var heightGroupSelection = showValues ? '25%' : '50%';
            this.layout.addPanel(groupSelectionPanel.layout, heightGroupSelection);
            groupSelectionPanel.addDragSource(dragSource);
        }
        var eGui = this.layout.getGui();
        utils_1.default.addCssClass(eGui, 'ag-tool-panel-container');
    };
    return ToolPanel;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ToolPanel;
