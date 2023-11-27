"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetHeightFeature = void 0;
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var eventKeys_1 = require("../../eventKeys");
var SetHeightFeature = /** @class */ (function (_super) {
    __extends(SetHeightFeature, _super);
    function SetHeightFeature(eContainer, eViewport) {
        var _this = _super.call(this) || this;
        _this.eContainer = eContainer;
        _this.eViewport = eViewport;
        return _this;
    }
    SetHeightFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED, this.onHeightChanged.bind(this));
    };
    SetHeightFeature.prototype.onHeightChanged = function () {
        var height = this.maxDivHeightScaler.getUiContainerHeight();
        var heightString = height != null ? "".concat(height, "px") : "";
        this.eContainer.style.height = heightString;
        if (this.eViewport) {
            this.eViewport.style.height = heightString;
        }
    };
    __decorate([
        (0, context_1.Autowired)("rowContainerHeightService")
    ], SetHeightFeature.prototype, "maxDivHeightScaler", void 0);
    __decorate([
        context_1.PostConstruct
    ], SetHeightFeature.prototype, "postConstruct", null);
    return SetHeightFeature;
}(beanStub_1.BeanStub));
exports.SetHeightFeature = SetHeightFeature;
