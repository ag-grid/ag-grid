/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.0.0
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
import { AgDialog } from "./agDialog";
import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
var MessageBox = /** @class */ (function (_super) {
    __extends(MessageBox, _super);
    function MessageBox(config) {
        var _this = _super.call(this, config) || this;
        _this.message = config.message;
        return _this;
    }
    MessageBox.prototype.postConstruct = function () {
        var _this = this;
        var messageBodyComp = new MessageBody();
        this.wireDependentBean(messageBodyComp);
        messageBodyComp.setMessage(this.message);
        this.setBodyComponent(messageBodyComp);
        _super.prototype.postConstruct.call(this);
        this.addDestroyableEventListener(messageBodyComp, 'onBtOk', function () { return _this.close(); });
    };
    return MessageBox;
}(AgDialog));
export { MessageBox };
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
    MessageBody.TEMPLATE = "<div class=\"ag-message-box\">\n            <div ref=\"eCenter\" class=\"ag-message-box-content\"></div>\n            <div ref=\"eButtons\" class=\"ag-message-box-button-bar\">\n                <button ref=\"eOk\">OK</button>\n            </div>\n        </div>";
    __decorate([
        RefSelector('eCenter')
    ], MessageBody.prototype, "eCenter", void 0);
    __decorate([
        RefSelector('eOk')
    ], MessageBody.prototype, "eOk", void 0);
    __decorate([
        PostConstruct
    ], MessageBody.prototype, "postConstruct", null);
    return MessageBody;
}(Component));
