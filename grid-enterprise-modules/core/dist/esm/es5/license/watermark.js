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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from '@ag-grid-community/core';
var WatermarkComp = /** @class */ (function (_super) {
    __extends(WatermarkComp, _super);
    function WatermarkComp() {
        return _super.call(this, "<div class=\"ag-watermark\">\n                    <div ref=\"eLicenseTextRef\" class=\"ag-watermark-text\"></div>\n               </div>") || this;
    }
    WatermarkComp.prototype.postConstruct = function () {
        var _this = this;
        var show = this.shouldDisplayWatermark();
        this.setDisplayed(show);
        if (show) {
            this.eLicenseTextRef.innerText = this.licenseManager.getWatermarkMessage();
            window.setTimeout(function () { return _this.addCssClass('ag-opacity-zero'); }, 0);
            window.setTimeout(function () { return _this.setDisplayed(false); }, 5000);
        }
    };
    WatermarkComp.prototype.shouldDisplayWatermark = function () {
        var win = this.gridOptionsService.getWindow();
        var loc = win.location;
        var pathname = loc.pathname;
        var isDisplayWatermark = this.licenseManager.isDisplayWatermark();
        var isForceWatermark = pathname ? pathname.indexOf('forceWatermark') !== -1 : false;
        return isForceWatermark || isDisplayWatermark;
    };
    __decorate([
        Autowired('licenseManager')
    ], WatermarkComp.prototype, "licenseManager", void 0);
    __decorate([
        RefSelector('eLicenseTextRef')
    ], WatermarkComp.prototype, "eLicenseTextRef", void 0);
    __decorate([
        PostConstruct
    ], WatermarkComp.prototype, "postConstruct", null);
    return WatermarkComp;
}(Component));
export { WatermarkComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0ZXJtYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpY2Vuc2Uvd2F0ZXJtYXJrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUczRjtJQUFtQyxpQ0FBUztJQUt4QztlQUNJLGtCQUFNLDBJQUVRLENBQUM7SUFDbkIsQ0FBQztJQUdPLHFDQUFhLEdBQXJCO1FBREEsaUJBV0M7UUFURyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLElBQUksSUFBSSxFQUFFO1lBQ04sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRTNFLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsRUFBbkMsQ0FBbUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsVUFBVSxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUF4QixDQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNEO0lBQ0wsQ0FBQztJQUVPLDhDQUFzQixHQUE5QjtRQUNJLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoRCxJQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ2pCLElBQUEsUUFBUSxHQUFLLEdBQUcsU0FBUixDQUFTO1FBRXpCLElBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRXBFLElBQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUV0RixPQUFPLGdCQUFnQixJQUFJLGtCQUFrQixDQUFDO0lBQ2xELENBQUM7SUFoQzRCO1FBQTVCLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQzt5REFBZ0M7SUFDNUI7UUFBL0IsV0FBVyxDQUFDLGlCQUFpQixDQUFDOzBEQUFzQztJQVNyRTtRQURDLGFBQWE7c0RBV2I7SUFhTCxvQkFBQztDQUFBLEFBbkNELENBQW1DLFNBQVMsR0FtQzNDO1NBbkNZLGFBQWEifQ==