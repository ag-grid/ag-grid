/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupEditorWrapper = void 0;
var popupComponent_1 = require("../../widgets/popupComponent");
var keyboard_1 = require("../../utils/keyboard");
var context_1 = require("../../context/context");
var PopupEditorWrapper = /** @class */ (function (_super) {
    __extends(PopupEditorWrapper, _super);
    function PopupEditorWrapper(params) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-popup-editor\" tabindex=\"-1\"/>") || this;
        _this.params = params;
        return _this;
    }
    PopupEditorWrapper.prototype.postConstruct = function () {
        this.gridOptionsService.setDomData(this.getGui(), PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER, true);
        this.addKeyDownListener();
    };
    PopupEditorWrapper.prototype.addKeyDownListener = function () {
        var _this = this;
        var eGui = this.getGui();
        var params = this.params;
        var listener = function (event) {
            if (!keyboard_1.isUserSuppressingKeyboardEvent(_this.gridOptionsService, event, params.node, params.column, true)) {
                params.onKeyDown(event);
            }
        };
        this.addManagedListener(eGui, 'keydown', listener);
    };
    PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER = 'popupEditorWrapper';
    __decorate([
        context_1.PostConstruct
    ], PopupEditorWrapper.prototype, "postConstruct", null);
    return PopupEditorWrapper;
}(popupComponent_1.PopupComponent));
exports.PopupEditorWrapper = PopupEditorWrapper;
