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
import { Autowired, Component, PostConstruct, Events } from "@ag-grid-community/core";
var HorizontalResizeComp = /** @class */ (function (_super) {
    __extends(HorizontalResizeComp, _super);
    function HorizontalResizeComp() {
        var _this = _super.call(this, /* html */ "<div class=\"ag-tool-panel-horizontal-resize\"></div>") || this;
        _this.minWidth = 100;
        _this.maxWidth = null;
        return _this;
    }
    HorizontalResizeComp.prototype.setElementToResize = function (elementToResize) {
        this.elementToResize = elementToResize;
    };
    HorizontalResizeComp.prototype.postConstruct = function () {
        var finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.getGui(),
            dragStartPixels: 1,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this),
            onResizeEnd: this.onResizeEnd.bind(this)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        this.setInverted(this.gridOptionsService.is('enableRtl'));
    };
    HorizontalResizeComp.prototype.dispatchResizeEvent = function (start, end, width) {
        var event = {
            type: Events.EVENT_TOOL_PANEL_SIZE_CHANGED,
            width: width,
            started: start,
            ended: end,
        };
        this.eventService.dispatchEvent(event);
    };
    HorizontalResizeComp.prototype.onResizeStart = function () {
        this.startingWidth = this.elementToResize.offsetWidth;
        this.dispatchResizeEvent(true, false, this.startingWidth);
    };
    HorizontalResizeComp.prototype.onResizeEnd = function (delta) {
        return this.onResizing(delta, true);
    };
    HorizontalResizeComp.prototype.onResizing = function (delta, isEnd) {
        if (isEnd === void 0) { isEnd = false; }
        var direction = this.inverted ? -1 : 1;
        var newWidth = Math.max(this.minWidth, Math.floor(this.startingWidth - (delta * direction)));
        if (this.maxWidth != null) {
            newWidth = Math.min(this.maxWidth, newWidth);
        }
        this.elementToResize.style.width = newWidth + "px";
        this.dispatchResizeEvent(false, isEnd, newWidth);
    };
    HorizontalResizeComp.prototype.setInverted = function (inverted) {
        this.inverted = inverted;
    };
    HorizontalResizeComp.prototype.setMaxWidth = function (value) {
        this.maxWidth = value;
    };
    HorizontalResizeComp.prototype.setMinWidth = function (value) {
        if (value != null) {
            this.minWidth = value;
        }
        else {
            this.minWidth = 100;
        }
    };
    __decorate([
        Autowired('horizontalResizeService')
    ], HorizontalResizeComp.prototype, "horizontalResizeService", void 0);
    __decorate([
        PostConstruct
    ], HorizontalResizeComp.prototype, "postConstruct", null);
    return HorizontalResizeComp;
}(Component));
export { HorizontalResizeComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9yaXpvbnRhbFJlc2l6ZUNvbXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2lkZUJhci9ob3Jpem9udGFsUmVzaXplQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULFNBQVMsRUFFVCxhQUFhLEVBR2IsTUFBTSxFQUNULE1BQU0seUJBQXlCLENBQUM7QUFFakM7SUFBMEMsd0NBQVM7SUFVL0M7UUFBQSxZQUNJLGtCQUFNLFVBQVUsQ0FBQyx1REFBcUQsQ0FBQyxTQUMxRTtRQUxPLGNBQVEsR0FBVyxHQUFHLENBQUM7UUFDdkIsY0FBUSxHQUFrQixJQUFJLENBQUM7O0lBSXZDLENBQUM7SUFFTSxpREFBa0IsR0FBekIsVUFBMEIsZUFBNEI7UUFDbEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDM0MsQ0FBQztJQUdPLDRDQUFhLEdBQXJCO1FBQ0ksSUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDO1lBQ3JFLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3pCLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDNUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN0QyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQzNDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sa0RBQW1CLEdBQTNCLFVBQTRCLEtBQWMsRUFBRSxHQUFZLEVBQUUsS0FBYTtRQUNuRSxJQUFNLEtBQUssR0FBaUQ7WUFDeEQsSUFBSSxFQUFFLE1BQU0sQ0FBQyw2QkFBNkI7WUFDMUMsS0FBSyxFQUFFLEtBQUs7WUFDWixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxHQUFHO1NBQ2IsQ0FBQztRQUNGLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFFTyw0Q0FBYSxHQUFyQjtRQUNJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUM7UUFDdEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFTywwQ0FBVyxHQUFuQixVQUFvQixLQUFhO1FBQzdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVPLHlDQUFVLEdBQWxCLFVBQW1CLEtBQWEsRUFBRSxLQUFzQjtRQUF0QixzQkFBQSxFQUFBLGFBQXNCO1FBQ3BELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFN0YsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtZQUN2QixRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFNLFFBQVEsT0FBSSxDQUFDO1FBQ25ELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFTSwwQ0FBVyxHQUFsQixVQUFtQixRQUFpQjtRQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRU0sMENBQVcsR0FBbEIsVUFBbUIsS0FBb0I7UUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVNLDBDQUFXLEdBQWxCLFVBQW1CLEtBQW9CO1FBQ25DLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtZQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1NBQ3pCO2FBQU07WUFDSCxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztTQUN2QjtJQUNMLENBQUM7SUExRXFDO1FBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQzt5RUFBMEQ7SUFpQi9GO1FBREMsYUFBYTs2REFZYjtJQStDTCwyQkFBQztDQUFBLEFBN0VELENBQTBDLFNBQVMsR0E2RWxEO1NBN0VZLG9CQUFvQiJ9