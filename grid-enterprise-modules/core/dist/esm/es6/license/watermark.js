var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from '@ag-grid-community/core';
export class WatermarkComp extends Component {
    constructor() {
        super(`<div class="ag-watermark">
                    <div ref="eLicenseTextRef" class="ag-watermark-text"></div>
               </div>`);
    }
    postConstruct() {
        const show = this.shouldDisplayWatermark();
        this.setDisplayed(show);
        if (show) {
            this.eLicenseTextRef.innerText = this.licenseManager.getWatermarkMessage();
            window.setTimeout(() => this.addCssClass('ag-opacity-zero'), 0);
            window.setTimeout(() => this.setDisplayed(false), 5000);
        }
    }
    shouldDisplayWatermark() {
        const win = this.gridOptionsService.getWindow();
        const loc = win.location;
        const { pathname } = loc;
        const isDisplayWatermark = this.licenseManager.isDisplayWatermark();
        const isForceWatermark = pathname ? pathname.indexOf('forceWatermark') !== -1 : false;
        return isForceWatermark || isDisplayWatermark;
    }
}
__decorate([
    Autowired('licenseManager')
], WatermarkComp.prototype, "licenseManager", void 0);
__decorate([
    RefSelector('eLicenseTextRef')
], WatermarkComp.prototype, "eLicenseTextRef", void 0);
__decorate([
    PostConstruct
], WatermarkComp.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0ZXJtYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpY2Vuc2Uvd2F0ZXJtYXJrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUczRixNQUFNLE9BQU8sYUFBYyxTQUFRLFNBQVM7SUFLeEM7UUFDSSxLQUFLLENBQUM7O3NCQUVRLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBR08sYUFBYTtRQUNqQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLElBQUksSUFBSSxFQUFFO1lBQ04sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRTNFLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMzRDtJQUNMLENBQUM7SUFFTyxzQkFBc0I7UUFDMUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hELE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDekIsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUV6QixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVwRSxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFdEYsT0FBTyxnQkFBZ0IsSUFBSSxrQkFBa0IsQ0FBQztJQUNsRCxDQUFDO0NBQ0o7QUFqQ2dDO0lBQTVCLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztxREFBZ0M7QUFDNUI7SUFBL0IsV0FBVyxDQUFDLGlCQUFpQixDQUFDO3NEQUFzQztBQVNyRTtJQURDLGFBQWE7a0RBV2IifQ==