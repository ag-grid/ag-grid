/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v20.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("./component");
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var popupService_1 = require("./popupService");
var PopupWindow = /** @class */ (function (_super) {
    __extends(PopupWindow, _super);
    function PopupWindow() {
        return _super.call(this, PopupWindow.TEMPLATE) || this;
    }
    PopupWindow.prototype.postConstruct = function () {
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        this.closePopup = this.popupService.addPopup(false, this.getGui(), false, this.destroy.bind(this));
        this.addDestroyableEventListener(this.eClose, 'click', this.onBtClose.bind(this));
    };
    PopupWindow.prototype.setBody = function (eBody) {
        this.eContentWrapper.appendChild(eBody);
    };
    PopupWindow.prototype.setTitle = function (title) {
        this.eTitle.innerText = title;
    };
    // called when user hits the 'x' in the top right
    PopupWindow.prototype.onBtClose = function () {
        this.closePopup();
    };
    PopupWindow.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.dispatchEvent({ type: PopupWindow.DESTROY_EVENT });
    };
    // NOTE - in time, the styles here will need to go to CSS files
    PopupWindow.TEMPLATE = "<div class=\"ag-popup-window\" style=\"top: 40px; left: 40px; border: 1px solid black; position: fixed; background-color: white;\">\n            <div class=\"ag-popup-window-title-bar\" style=\"background: #00e5ff; border-bottom: 1px solid black;\">\n                <span ref=\"eClose\" class=\"ag-popup-window-close\" style=\"margin: 2px; border: 1px solid grey; border-radius: 2px;\">X</span>\n                <span ref=\"eTitle\" class=\"ag-popup-window-title\" style=\"padding: 2px;\">New Chart</span>\n            </div>\n            <div ref=\"eContentWrapper\" class=\"ag-popup-window-content-wrapper\"></div>\n        </div>";
    PopupWindow.DESTROY_EVENT = 'destroy';
    __decorate([
        context_1.Autowired('popupService'),
        __metadata("design:type", popupService_1.PopupService)
    ], PopupWindow.prototype, "popupService", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContentWrapper'),
        __metadata("design:type", HTMLElement)
    ], PopupWindow.prototype, "eContentWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTitle'),
        __metadata("design:type", HTMLElement)
    ], PopupWindow.prototype, "eTitle", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eClose'),
        __metadata("design:type", HTMLElement)
    ], PopupWindow.prototype, "eClose", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PopupWindow.prototype, "postConstruct", null);
    return PopupWindow;
}(component_1.Component));
exports.PopupWindow = PopupWindow;
