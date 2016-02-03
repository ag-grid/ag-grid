/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.0-alpha.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var RenderedHeaderElement = (function () {
    function RenderedHeaderElement(eRoot, gridOptionsWrapper) {
        this.eRoot = eRoot;
        this.gridOptionsWrapper = gridOptionsWrapper;
    }
    // methods implemented by the base classes
    RenderedHeaderElement.prototype.destroy = function () { };
    RenderedHeaderElement.prototype.refreshFilterIcon = function () { };
    RenderedHeaderElement.prototype.refreshSortIcon = function () { };
    RenderedHeaderElement.prototype.onDragStart = function () { };
    RenderedHeaderElement.prototype.onDragging = function (dragChange, finished) { };
    RenderedHeaderElement.prototype.onIndividualColumnResized = function (column) { };
    RenderedHeaderElement.prototype.getGui = function () { return null; };
    RenderedHeaderElement.prototype.getGridOptionsWrapper = function () {
        return this.gridOptionsWrapper;
    };
    RenderedHeaderElement.prototype.addDragHandler = function (eDraggableElement) {
        var that = this;
        eDraggableElement.addEventListener('mousedown', function (downEvent) {
            that.onDragStart();
            that.eRoot.style.cursor = "col-resize";
            that.dragStartX = downEvent.clientX;
            var listenersToRemove = {};
            var lastDelta = 0;
            listenersToRemove.mousemove = function (moveEvent) {
                var newX = moveEvent.clientX;
                lastDelta = newX - that.dragStartX;
                that.onDragging(lastDelta, false);
            };
            listenersToRemove.mouseup = function () {
                that.stopDragging(listenersToRemove, lastDelta);
            };
            listenersToRemove.mouseleave = function () {
                that.stopDragging(listenersToRemove, lastDelta);
            };
            that.eRoot.addEventListener('mousemove', listenersToRemove.mousemove);
            that.eRoot.addEventListener('mouseup', listenersToRemove.mouseup);
            that.eRoot.addEventListener('mouseleave', listenersToRemove.mouseleave);
        });
    };
    RenderedHeaderElement.prototype.stopDragging = function (listenersToRemove, dragChange) {
        this.eRoot.style.cursor = "";
        var that = this;
        utils_1.default.iterateObject(listenersToRemove, function (key, listener) {
            that.eRoot.removeEventListener(key, listener);
        });
        that.onDragging(dragChange, true);
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
