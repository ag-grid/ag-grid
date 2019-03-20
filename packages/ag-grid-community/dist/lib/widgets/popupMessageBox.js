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
var popupWindow_1 = require("./popupWindow");
var context_1 = require("../context/context");
var component_1 = require("./component");
var componentAnnotations_1 = require("./componentAnnotations");
var PopupMessageBox = /** @class */ (function (_super) {
    __extends(PopupMessageBox, _super);
    function PopupMessageBox(title, message) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.message = message;
        return _this;
    }
    PopupMessageBox.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.setTitle(this.title);
        var messageBodyComp = new MessageBody();
        this.addFeature(this.getContext(), messageBodyComp);
        messageBodyComp.setMessage(this.message);
        this.setBody(messageBodyComp.getGui());
        this.addDestroyableEventListener(messageBodyComp, 'onBtOk', function () { return _this.closePopup(); });
    };
    return PopupMessageBox;
}(popupWindow_1.PopupWindow));
exports.PopupMessageBox = PopupMessageBox;
var MessageBody = /** @class */ (function (_super) {
    __extends(MessageBody, _super);
    function MessageBody() {
        return _super.call(this, MessageBody.TEMPLATE) || this;
    }
    MessageBody.prototype.setMessage = function (message) {
        this.eCenter.innerText = message;
    };
    MessageBody.prototype.postConstruct = function () {
        this.addDestroyableEventListener(this.eOk, 'click', this.onBtOk.bind(this));
    };
    MessageBody.prototype.onBtOk = function () {
        this.dispatchEvent({ type: 'onBtOk' });
    };
    MessageBody.TEMPLATE = "<div>\n            <div ref=\"eCenter\"></div>\n            <div ref=\"eButtons\">\n                <button ref=\"eOk\">OK</button>\n            </div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('eCenter'),
        __metadata("design:type", HTMLElement)
    ], MessageBody.prototype, "eCenter", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eOk'),
        __metadata("design:type", HTMLElement)
    ], MessageBody.prototype, "eOk", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MessageBody.prototype, "postConstruct", null);
    return MessageBody;
}(component_1.Component));
