/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var RenderedHeaderElement = (function () {
    function RenderedHeaderElement(gridOptionsWrapper) {
        this.gridOptionsWrapper = gridOptionsWrapper;
    }
    // methods implemented by the base classes
    RenderedHeaderElement.prototype.destroy = function () { };
    RenderedHeaderElement.prototype.refreshFilterIcon = function () { };
    RenderedHeaderElement.prototype.refreshSortIcon = function () { };
    RenderedHeaderElement.prototype.onIndividualColumnResized = function (column) { };
    RenderedHeaderElement.prototype.getGui = function () { return null; };
    RenderedHeaderElement.prototype.getGridOptionsWrapper = function () {
        return this.gridOptionsWrapper;
    };
    RenderedHeaderElement.prototype.addHeaderClassesFromCollDef = function (abstractColDef, eHeaderCell) {
        if (abstractColDef && abstractColDef.headerClass) {
            var classToUse;
            if (typeof abstractColDef.headerClass === 'function') {
                var params = {
                    // bad naming, as colDef here can be a group or a column,
                    // however most people won't appreciate the difference,
                    // so keeping it as colDef to avoid confusion.
                    colDef: abstractColDef,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                var headerClassFunc = abstractColDef.headerClass;
                classToUse = headerClassFunc(params);
            }
            else {
                classToUse = abstractColDef.headerClass;
            }
            if (typeof classToUse === 'string') {
                utils_1.default.addCssClass(eHeaderCell, classToUse);
            }
            else if (Array.isArray(classToUse)) {
                classToUse.forEach(function (cssClassItem) {
                    utils_1.default.addCssClass(eHeaderCell, cssClassItem);
                });
            }
        }
    };
    return RenderedHeaderElement;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RenderedHeaderElement;
