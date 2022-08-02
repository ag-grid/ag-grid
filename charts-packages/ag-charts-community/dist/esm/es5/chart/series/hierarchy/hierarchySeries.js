var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Series, SeriesNodePickMode } from '../series';
var HierarchySeries = /** @class */ (function (_super) {
    __extends(HierarchySeries, _super);
    function HierarchySeries() {
        return _super.call(this, { pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] }) || this;
    }
    HierarchySeries.prototype.getLabelData = function () {
        return [];
    };
    return HierarchySeries;
}(Series));
export { HierarchySeries };
