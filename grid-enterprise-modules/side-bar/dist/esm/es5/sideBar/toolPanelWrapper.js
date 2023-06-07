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
import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { HorizontalResizeComp } from "./horizontalResizeComp";
var ToolPanelWrapper = /** @class */ (function (_super) {
    __extends(ToolPanelWrapper, _super);
    function ToolPanelWrapper() {
        return _super.call(this, ToolPanelWrapper.TEMPLATE) || this;
    }
    ToolPanelWrapper.prototype.setupResize = function () {
        var eGui = this.getGui();
        var resizeBar = this.resizeBar = this.createManagedBean(new HorizontalResizeComp());
        eGui.setAttribute('id', "ag-" + this.getCompId());
        resizeBar.setElementToResize(eGui);
        this.appendChild(resizeBar);
    };
    ToolPanelWrapper.prototype.getToolPanelId = function () {
        return this.toolPanelId;
    };
    ToolPanelWrapper.prototype.setToolPanelDef = function (toolPanelDef) {
        var id = toolPanelDef.id, minWidth = toolPanelDef.minWidth, maxWidth = toolPanelDef.maxWidth, width = toolPanelDef.width;
        this.toolPanelId = id;
        this.width = width;
        var params = {};
        var compDetails = this.userComponentFactory.getToolPanelCompDetails(toolPanelDef, params);
        var componentPromise = compDetails.newAgStackInstance();
        if (componentPromise == null) {
            console.warn("AG Grid: error processing tool panel component " + id + ". You need to specify 'toolPanel'");
            return;
        }
        componentPromise.then(this.setToolPanelComponent.bind(this));
        if (minWidth != null) {
            this.resizeBar.setMinWidth(minWidth);
        }
        if (maxWidth != null) {
            this.resizeBar.setMaxWidth(maxWidth);
        }
    };
    ToolPanelWrapper.prototype.setToolPanelComponent = function (compInstance) {
        var _this = this;
        this.toolPanelCompInstance = compInstance;
        this.appendChild(compInstance.getGui());
        this.addDestroyFunc(function () {
            _this.destroyBean(compInstance);
        });
        if (this.width) {
            this.getGui().style.width = this.width + "px";
        }
    };
    ToolPanelWrapper.prototype.getToolPanelInstance = function () {
        return this.toolPanelCompInstance;
    };
    ToolPanelWrapper.prototype.setResizerSizerSide = function (side) {
        var isRtl = this.gridOptionsService.is('enableRtl');
        var isLeft = side === 'left';
        var inverted = isRtl ? isLeft : !isLeft;
        this.resizeBar.setInverted(inverted);
    };
    ToolPanelWrapper.prototype.refresh = function () {
        this.toolPanelCompInstance.refresh();
    };
    ToolPanelWrapper.TEMPLATE = "<div class=\"ag-tool-panel-wrapper\" role=\"tabpanel\"/>";
    __decorate([
        Autowired("userComponentFactory")
    ], ToolPanelWrapper.prototype, "userComponentFactory", void 0);
    __decorate([
        PostConstruct
    ], ToolPanelWrapper.prototype, "setupResize", null);
    return ToolPanelWrapper;
}(Component));
export { ToolPanelWrapper };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsV3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zaWRlQmFyL3Rvb2xQYW5lbFdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxTQUFTLEVBS1QsYUFBYSxFQUVoQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRTlEO0lBQXNDLG9DQUFTO0lBWTNDO2VBQ0ksa0JBQU0sZ0JBQWdCLENBQUMsUUFBUSxDQUFDO0lBQ3BDLENBQUM7SUFHTyxzQ0FBVyxHQUFuQjtRQUNJLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLG9CQUFvQixFQUFFLENBQUMsQ0FBQztRQUV0RixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFNLElBQUksQ0FBQyxTQUFTLEVBQUksQ0FBQyxDQUFDO1FBRWxELFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFTSx5Q0FBYyxHQUFyQjtRQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBRU0sMENBQWUsR0FBdEIsVUFBdUIsWUFBMEI7UUFDckMsSUFBQSxFQUFFLEdBQWdDLFlBQVksR0FBNUMsRUFBRSxRQUFRLEdBQXNCLFlBQVksU0FBbEMsRUFBRSxRQUFRLEdBQVksWUFBWSxTQUF4QixFQUFFLEtBQUssR0FBSyxZQUFZLE1BQWpCLENBQWtCO1FBRXZELElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQU0sTUFBTSxHQUF3QyxFQUFFLENBQUM7UUFFdkQsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1RixJQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFELElBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO1lBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0RBQWtELEVBQUUsc0NBQW1DLENBQUMsQ0FBQztZQUN0RyxPQUFPO1NBQ1Y7UUFDRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTdELElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtZQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtZQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7SUFFTyxnREFBcUIsR0FBN0IsVUFBOEIsWUFBNEI7UUFBMUQsaUJBV0M7UUFWRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsWUFBWSxDQUFDO1FBRTFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNoQixLQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1osSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQU0sSUFBSSxDQUFDLEtBQUssT0FBSSxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQztJQUVNLCtDQUFvQixHQUEzQjtRQUNJLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDO0lBQ3RDLENBQUM7SUFFTSw4Q0FBbUIsR0FBMUIsVUFBMkIsSUFBc0I7UUFDN0MsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0RCxJQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssTUFBTSxDQUFDO1FBQy9CLElBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUUxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sa0NBQU8sR0FBZDtRQUNJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBaEZjLHlCQUFRLEdBQ25CLDBEQUFzRCxDQUFDO0lBSHhCO1FBQWxDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQztrRUFBb0Q7SUFldEY7UUFEQyxhQUFhO3VEQVNiO0lBNkRMLHVCQUFDO0NBQUEsQUF0RkQsQ0FBc0MsU0FBUyxHQXNGOUM7U0F0RlksZ0JBQWdCIn0=