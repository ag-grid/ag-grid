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
import { Autowired, Component, PostConstruct, PreDestroy, _, KeyCode } from "@ag-grid-community/core";
import { SideBarButtonComp } from "./sideBarButtonComp";
var SideBarButtonsComp = /** @class */ (function (_super) {
    __extends(SideBarButtonsComp, _super);
    function SideBarButtonsComp() {
        var _this = _super.call(this, SideBarButtonsComp.TEMPLATE) || this;
        _this.buttonComps = [];
        return _this;
    }
    SideBarButtonsComp.prototype.postConstruct = function () {
        this.addManagedListener(this.getFocusableElement(), 'keydown', this.handleKeyDown.bind(this));
    };
    SideBarButtonsComp.prototype.handleKeyDown = function (e) {
        if (e.key !== KeyCode.TAB || !e.shiftKey) {
            return;
        }
        var lastColumn = _.last(this.columnModel.getAllDisplayedColumns());
        if (this.focusService.focusGridView(lastColumn, true)) {
            e.preventDefault();
        }
    };
    SideBarButtonsComp.prototype.setActiveButton = function (id) {
        this.buttonComps.forEach(function (comp) {
            comp.setSelected(id === comp.getToolPanelId());
        });
    };
    SideBarButtonsComp.prototype.addButtonComp = function (def) {
        var _this = this;
        var buttonComp = this.createBean(new SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        this.appendChild(buttonComp);
        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, function () {
            _this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
        return buttonComp;
    };
    SideBarButtonsComp.prototype.clearButtons = function () {
        this.buttonComps = this.destroyBeans(this.buttonComps);
        _.clearElement(this.getGui());
    };
    SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
    SideBarButtonsComp.TEMPLATE = "<div class=\"ag-side-buttons\" role=\"tablist\"></div>";
    __decorate([
        Autowired('focusService')
    ], SideBarButtonsComp.prototype, "focusService", void 0);
    __decorate([
        Autowired('columnModel')
    ], SideBarButtonsComp.prototype, "columnModel", void 0);
    __decorate([
        PostConstruct
    ], SideBarButtonsComp.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], SideBarButtonsComp.prototype, "clearButtons", null);
    return SideBarButtonsComp;
}(Component));
export { SideBarButtonsComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJhckJ1dHRvbnNDb21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NpZGVCYXIvc2lkZUJhckJ1dHRvbnNDb21wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBRVQsU0FBUyxFQUNULGFBQWEsRUFFYixVQUFVLEVBRVYsQ0FBQyxFQUNELE9BQU8sRUFFVixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBTXhEO0lBQXdDLHNDQUFTO0lBUzdDO1FBQUEsWUFDSSxrQkFBTSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsU0FDckM7UUFQTyxpQkFBVyxHQUF3QixFQUFFLENBQUM7O0lBTzlDLENBQUM7SUFHTywwQ0FBYSxHQUFyQjtRQUNJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRU8sMENBQWEsR0FBckIsVUFBc0IsQ0FBZ0I7UUFDbEMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRXJELElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7UUFFckUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDbkQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3RCO0lBQ0wsQ0FBQztJQUVNLDRDQUFlLEdBQXRCLFVBQXVCLEVBQXNCO1FBQ3pDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtZQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSwwQ0FBYSxHQUFwQixVQUFxQixHQUFpQjtRQUF0QyxpQkFhQztRQVpHLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFN0IsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLDJCQUEyQixFQUFFO1lBQ3ZFLEtBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2YsSUFBSSxFQUFFLGtCQUFrQixDQUFDLDZCQUE2QjtnQkFDdEQsV0FBVyxFQUFFLEdBQUcsQ0FBQyxFQUFFO2FBQ3RCLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUdNLHlDQUFZLEdBQW5CO1FBQ0ksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFuRGEsZ0RBQTZCLEdBQUcsc0JBQXNCLENBQUM7SUFDN0MsMkJBQVEsR0FBc0Isd0RBQW9ELENBQUM7SUFHaEY7UUFBMUIsU0FBUyxDQUFDLGNBQWMsQ0FBQzs0REFBb0M7SUFDcEM7UUFBekIsU0FBUyxDQUFDLGFBQWEsQ0FBQzsyREFBa0M7SUFPM0Q7UUFEQyxhQUFhOzJEQUdiO0lBa0NEO1FBREMsVUFBVTswREFJVjtJQUVMLHlCQUFDO0NBQUEsQUF2REQsQ0FBd0MsU0FBUyxHQXVEaEQ7U0F2RFksa0JBQWtCIn0=