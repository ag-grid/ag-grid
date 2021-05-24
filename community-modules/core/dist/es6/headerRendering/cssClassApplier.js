/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { missing } from "../utils/generic";
import { addCssClass } from "../utils/dom";
var CssClassApplier = /** @class */ (function () {
    function CssClassApplier() {
    }
    CssClassApplier.addHeaderClassesFromColDef = function (abstractColDef, eHeaderCell, gridOptionsWrapper, column, columnGroup) {
        if (missing(abstractColDef)) {
            return;
        }
        this.addColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, eHeaderCell, gridOptionsWrapper, column, columnGroup);
    };
    CssClassApplier.addToolPanelClassesFromColDef = function (abstractColDef, eHeaderCell, gridOptionsWrapper, column, columnGroup) {
        if (missing(abstractColDef)) {
            return;
        }
        this.addColumnClassesFromCollDef(abstractColDef.toolPanelClass, abstractColDef, eHeaderCell, gridOptionsWrapper, column, columnGroup);
    };
    CssClassApplier.addColumnClassesFromCollDef = function (classesOrFunc, abstractColDef, eHeaderCell, gridOptionsWrapper, column, columnGroup) {
        if (missing(classesOrFunc)) {
            return;
        }
        var classToUse;
        if (typeof classesOrFunc === 'function') {
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
            var headerClassFunc = classesOrFunc;
            classToUse = headerClassFunc(params);
        }
        else {
            classToUse = classesOrFunc;
        }
        if (typeof classToUse === 'string') {
            addCssClass(eHeaderCell, classToUse);
        }
        else if (Array.isArray(classToUse)) {
            classToUse.forEach(function (cssClassItem) {
                addCssClass(eHeaderCell, cssClassItem);
            });
        }
    };
    return CssClassApplier;
}());
export { CssClassApplier };
