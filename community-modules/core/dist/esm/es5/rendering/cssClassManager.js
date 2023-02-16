/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var CssClassManager = /** @class */ (function () {
    function CssClassManager(getGui) {
        // to minimise DOM hits, we only apply CSS classes if they have changed. as adding a CSS class that is already
        // there, or removing one that wasn't present, all takes CPU.
        this.cssClassStates = {};
        this.getGui = getGui;
    }
    CssClassManager.prototype.addCssClass = function (className) {
        var _this = this;
        var list = (className || '').split(' ');
        if (list.length > 1) {
            list.forEach(function (cls) { return _this.addCssClass(cls); });
            return;
        }
        var updateNeeded = this.cssClassStates[className] !== true;
        if (updateNeeded && className.length) {
            var eGui = this.getGui();
            if (eGui) {
                eGui.classList.add(className);
            }
            this.cssClassStates[className] = true;
        }
    };
    CssClassManager.prototype.removeCssClass = function (className) {
        var _this = this;
        var list = (className || '').split(' ');
        if (list.length > 1) {
            list.forEach(function (cls) { return _this.removeCssClass(cls); });
            return;
        }
        var updateNeeded = this.cssClassStates[className] !== false;
        if (updateNeeded && className.length) {
            var eGui = this.getGui();
            if (eGui) {
                eGui.classList.remove(className);
            }
            this.cssClassStates[className] = false;
        }
    };
    CssClassManager.prototype.containsCssClass = function (className) {
        var eGui = this.getGui();
        if (!eGui) {
            return false;
        }
        return eGui.classList.contains(className);
    };
    CssClassManager.prototype.addOrRemoveCssClass = function (className, addOrRemove) {
        var _this = this;
        if (!className) {
            return;
        }
        // we check for spaces before doing the split, as doing the split
        // created a performance problem (on windows only, see AG-6765)
        if (className.indexOf(' ') >= 0) {
            var list = (className || '').split(' ');
            if (list.length > 1) {
                list.forEach(function (cls) { return _this.addOrRemoveCssClass(cls, addOrRemove); });
                return;
            }
        }
        var updateNeeded = this.cssClassStates[className] !== addOrRemove;
        if (updateNeeded && className.length) {
            var eGui = this.getGui();
            if (eGui) {
                eGui.classList.toggle(className, addOrRemove);
            }
            this.cssClassStates[className] = addOrRemove;
        }
    };
    return CssClassManager;
}());
export { CssClassManager };
