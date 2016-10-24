/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
var BaseFrameworkFactory = (function () {
    function BaseFrameworkFactory() {
    }
    BaseFrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        return colDef.floatingCellRenderer;
    };
    BaseFrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        return colDef.cellRenderer;
    };
    BaseFrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        return colDef.cellEditor;
    };
    BaseFrameworkFactory.prototype.colDefFilter = function (colDef) {
        return colDef.filter;
    };
    BaseFrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        return gridOptions.fullWidthCellRenderer;
    };
    BaseFrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        return gridOptions.groupRowRenderer;
    };
    BaseFrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        return gridOptions.groupRowInnerRenderer;
    };
    return BaseFrameworkFactory;
})();
exports.BaseFrameworkFactory = BaseFrameworkFactory;
