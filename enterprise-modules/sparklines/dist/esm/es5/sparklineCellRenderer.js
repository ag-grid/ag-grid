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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, RefSelector, } from '@ag-grid-community/core';
import { AgSparkline } from './sparkline/agSparkline';
var SparklineCellRenderer = /** @class */ (function (_super) {
    __extends(SparklineCellRenderer, _super);
    function SparklineCellRenderer() {
        return _super.call(this, SparklineCellRenderer.TEMPLATE) || this;
    }
    SparklineCellRenderer.prototype.init = function (params) {
        var _this = this;
        var firstTimeIn = true;
        var updateSparkline = function () {
            var _a = _this.getGui(), clientWidth = _a.clientWidth, clientHeight = _a.clientHeight;
            if (clientWidth === 0 || clientHeight === 0) {
                return;
            }
            if (firstTimeIn) {
                var options = __assign({ data: params.value, width: clientWidth, height: clientHeight, context: {
                        data: params.data,
                    } }, params.sparklineOptions);
                // create new instance of sparkline
                _this.sparkline = AgSparkline.create(options, _this.sparklineTooltipSingleton.getSparklineTooltip());
                // append sparkline canvas to cell renderer element
                _this.eSparkline.appendChild(_this.sparkline.canvasElement);
                firstTimeIn = false;
            }
            else {
                _this.sparkline.width = clientWidth;
                _this.sparkline.height = clientHeight;
            }
        };
        var unsubscribeFromResize = this.resizeObserverService.observeResize(this.getGui(), updateSparkline);
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
    };
    SparklineCellRenderer.prototype.refresh = function (params) {
        if (this.sparkline) {
            this.sparkline.data = params.value;
            return true;
        }
        return false;
    };
    SparklineCellRenderer.prototype.destroy = function () {
        if (this.sparkline) {
            this.sparkline.destroy();
        }
        _super.prototype.destroy.call(this);
    };
    SparklineCellRenderer.TEMPLATE /* html */ = "<div class=\"ag-sparkline-wrapper\">\n            <span ref=\"eSparkline\"></span>\n        </div>";
    __decorate([
        RefSelector('eSparkline')
    ], SparklineCellRenderer.prototype, "eSparkline", void 0);
    __decorate([
        Autowired('resizeObserverService')
    ], SparklineCellRenderer.prototype, "resizeObserverService", void 0);
    __decorate([
        Autowired('sparklineTooltipSingleton')
    ], SparklineCellRenderer.prototype, "sparklineTooltipSingleton", void 0);
    return SparklineCellRenderer;
}(Component));
export { SparklineCellRenderer };
