var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcmtsaW5lQ2VsbFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NwYXJrbGluZUNlbGxSZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsU0FBUyxFQUdULFdBQVcsR0FFZCxNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxXQUFXLEVBQTJCLE1BQU0seUJBQXlCLENBQUM7QUFHL0U7SUFBMkMseUNBQVM7SUFZaEQ7ZUFDSSxrQkFBTSxxQkFBcUIsQ0FBQyxRQUFRLENBQUM7SUFDekMsQ0FBQztJQUVNLG9DQUFJLEdBQVgsVUFBWSxNQUFvQztRQUFoRCxpQkFrQ0M7UUFqQ0csSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQU0sZUFBZSxHQUFHO1lBQ2QsSUFBQSxLQUFnQyxLQUFJLENBQUMsTUFBTSxFQUFFLEVBQTNDLFdBQVcsaUJBQUEsRUFBRSxZQUFZLGtCQUFrQixDQUFDO1lBQ3BELElBQUksV0FBVyxLQUFLLENBQUMsSUFBSSxZQUFZLEtBQUssQ0FBQyxFQUFFO2dCQUN6QyxPQUFPO2FBQ1Y7WUFFRCxJQUFJLFdBQVcsRUFBRTtnQkFDYixJQUFNLE9BQU8sY0FDVCxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFDbEIsS0FBSyxFQUFFLFdBQVcsRUFDbEIsTUFBTSxFQUFFLFlBQVksRUFDcEIsT0FBTyxFQUFFO3dCQUNMLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtxQkFDcEIsSUFDRSxNQUFNLENBQUMsZ0JBQWdCLENBQzdCLENBQUM7Z0JBRUYsbUNBQW1DO2dCQUNuQyxLQUFJLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUksQ0FBQyx5QkFBeUIsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7Z0JBRW5HLG1EQUFtRDtnQkFDbkQsS0FBSSxDQUFDLFVBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFFM0QsV0FBVyxHQUFHLEtBQUssQ0FBQzthQUN2QjtpQkFBTTtnQkFDSCxLQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7Z0JBQ25DLEtBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQzthQUN4QztRQUNMLENBQUMsQ0FBQztRQUVGLElBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDdkcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFNLE9BQUEscUJBQXFCLEVBQUUsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFTSx1Q0FBTyxHQUFkLFVBQWUsTUFBb0M7UUFDL0MsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSx1Q0FBTyxHQUFkO1FBQ0ksSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDNUI7UUFDRCxpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNwQixDQUFDO0lBaEVjLDhCQUFRLENBQUMsVUFBVSxHQUFHLG9HQUUxQixDQUFDO0lBRWU7UUFBMUIsV0FBVyxDQUFDLFlBQVksQ0FBQzs2REFBa0M7SUFFeEI7UUFBbkMsU0FBUyxDQUFDLHVCQUF1QixDQUFDO3dFQUF1RDtJQUNsRDtRQUF2QyxTQUFTLENBQUMsMkJBQTJCLENBQUM7NEVBQStEO0lBMEQxRyw0QkFBQztDQUFBLEFBbEVELENBQTJDLFNBQVMsR0FrRW5EO1NBbEVZLHFCQUFxQiJ9