/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var CssClassApplier = (function () {
    function CssClassApplier() {
    }
    CssClassApplier.addHeaderClassesFromCollDef = function (abstractColDef, eHeaderCell, gridOptionsWrapper, column, columnGroup) {
        if (abstractColDef && abstractColDef.headerClass) {
            var classToUse;
            if (typeof abstractColDef.headerClass === 'function') {
                var params = {
                    // bad naming, as colDef here can be a group or a column,
                    // however most people won't appreciate the difference,
                    // so keeping it as colDef to avoid confusion.
                    colDef: abstractColDef,
                    column: column,
                    columnGroup: columnGroup,
                    context: gridOptionsWrapper.getContext(),
                    api: gridOptionsWrapper.getApi()
                };
                var headerClassFunc = abstractColDef.headerClass;
                classToUse = headerClassFunc(params);
            }
            else {
                classToUse = abstractColDef.headerClass;
            }
            if (typeof classToUse === 'string') {
                utils_1.Utils.addCssClass(eHeaderCell, classToUse);
            }
            else if (Array.isArray(classToUse)) {
                classToUse.forEach(function (cssClassItem) {
                    utils_1.Utils.addCssClass(eHeaderCell, cssClassItem);
                });
            }
        }
    };
    return CssClassApplier;
})();
exports.CssClassApplier = CssClassApplier;
