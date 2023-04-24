var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub, PostConstruct, PreDestroy } from '@ag-grid-community/core';
import { SparklineTooltip } from '../sparkline/tooltip/sparklineTooltip';
/**
 * This 'bean' creates a single sparkline tooltip that is bound to the grid lifecycle.
 */
var SparklineTooltipSingleton = /** @class */ (function (_super) {
    __extends(SparklineTooltipSingleton, _super);
    function SparklineTooltipSingleton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SparklineTooltipSingleton.prototype.postConstruct = function () {
        this.tooltip = new SparklineTooltip();
    };
    SparklineTooltipSingleton.prototype.getSparklineTooltip = function () {
        return this.tooltip;
    };
    SparklineTooltipSingleton.prototype.destroyTooltip = function () {
        if (this.tooltip) {
            this.tooltip.destroy();
        }
    };
    __decorate([
        PostConstruct
    ], SparklineTooltipSingleton.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], SparklineTooltipSingleton.prototype, "destroyTooltip", null);
    SparklineTooltipSingleton = __decorate([
        Bean('sparklineTooltipSingleton')
    ], SparklineTooltipSingleton);
    return SparklineTooltipSingleton;
}(BeanStub));
export { SparklineTooltipSingleton };
