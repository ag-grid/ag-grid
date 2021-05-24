/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
var SetHeightFeature = /** @class */ (function (_super) {
    __extends(SetHeightFeature, _super);
    function SetHeightFeature(eContainer, eWrapper) {
        var _this = _super.call(this) || this;
        _this.eContainer = eContainer;
        _this.eWrapper = eWrapper;
        return _this;
    }
    SetHeightFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED, this.onHeightChanged.bind(this));
    };
    SetHeightFeature.prototype.onHeightChanged = function () {
        var height = this.maxDivHeightScaler.getUiContainerHeight();
        var heightString = height != null ? height + "px" : "";
        this.eContainer.style.height = heightString;
        if (this.eWrapper) {
            this.eWrapper.style.height = heightString;
        }
    };
    __decorate([
        Autowired("rowContainerHeightService")
    ], SetHeightFeature.prototype, "maxDivHeightScaler", void 0);
    __decorate([
        PostConstruct
    ], SetHeightFeature.prototype, "postConstruct", null);
    return SetHeightFeature;
}(BeanStub));
export { SetHeightFeature };
