/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vElement_1 = require("./vElement");
var VWrapperElement = (function (_super) {
    __extends(VWrapperElement, _super);
    function VWrapperElement(wrappedElement) {
        _super.call(this);
        this.wrappedElement = wrappedElement;
    }
    VWrapperElement.prototype.toHtmlString = function () {
        return '<span v_element_id="' + this.getId() + '"></span>';
    };
    VWrapperElement.prototype.elementAttached = function (element) {
        var parent = element.parentNode;
        parent.insertBefore(this.wrappedElement, element);
        parent.removeChild(element);
    };
    return VWrapperElement;
})(vElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VWrapperElement;
