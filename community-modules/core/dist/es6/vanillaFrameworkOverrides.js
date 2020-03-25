/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
var VanillaFrameworkOverrides = /** @class */ (function () {
    function VanillaFrameworkOverrides() {
    }
    // for Vanilla JS, we use simple timeout
    VanillaFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
        window.setTimeout(action, timeout);
    };
    // for Vanilla JS, we just add the event to the element
    VanillaFrameworkOverrides.prototype.addEventListenerOutsideAngular = function (element, type, listener, useCapture) {
        element.addEventListener(type, listener, useCapture);
    };
    return VanillaFrameworkOverrides;
}());
export { VanillaFrameworkOverrides };
