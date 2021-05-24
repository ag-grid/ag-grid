/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var popupComponent_1 = require("../../widgets/popupComponent");
var keyboard_1 = require("../../utils/keyboard");
var PopupEditorWrapper = /** @class */ (function (_super) {
    __extends(PopupEditorWrapper, _super);
    function PopupEditorWrapper(cellEditor) {
        var _this = _super.call(this, "<div class=\"ag-popup-editor\" tabindex=\"-1\"/>") || this;
        _this.getGuiCalledOnChild = false;
        _this.cellEditor = cellEditor;
        return _this;
    }
    PopupEditorWrapper.prototype.onKeyDown = function (event) {
        if (!keyboard_1.isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, event, this.params.node, this.params.column, true)) {
            this.params.onKeyDown(event);
        }
    };
    PopupEditorWrapper.prototype.getGui = function () {
        // we call getGui() on child here (rather than in the constructor)
        // as we should wait for 'init' to be called on child first.
        if (!this.getGuiCalledOnChild) {
            this.appendChild(this.cellEditor.getGui());
            this.getGuiCalledOnChild = true;
        }
        return _super.prototype.getGui.call(this);
    };
    PopupEditorWrapper.prototype.init = function (params) {
        var _this = this;
        this.params = params;
        this.gridOptionsWrapper.setDomData(this.getGui(), PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER, true);
        this.addDestroyFunc(function () { return _this.destroyBean(_this.cellEditor); });
        this.addManagedListener(
        // this needs to be 'super' and not 'this' as if we call 'this',
        // it ends up called 'getGui()' on the child before 'init' was called,
        // which is not good
        _super.prototype.getGui.call(this), 'keydown', this.onKeyDown.bind(this));
    };
    PopupEditorWrapper.prototype.afterGuiAttached = function () {
        if (this.cellEditor.afterGuiAttached) {
            this.cellEditor.afterGuiAttached();
        }
    };
    PopupEditorWrapper.prototype.getValue = function () {
        return this.cellEditor.getValue();
    };
    PopupEditorWrapper.prototype.isCancelBeforeStart = function () {
        if (this.cellEditor.isCancelBeforeStart) {
            return this.cellEditor.isCancelBeforeStart();
        }
        return false;
    };
    PopupEditorWrapper.prototype.isCancelAfterEnd = function () {
        if (this.cellEditor.isCancelAfterEnd) {
            return this.cellEditor.isCancelAfterEnd();
        }
        return false;
    };
    PopupEditorWrapper.prototype.getPopupPosition = function () {
        if (this.cellEditor.getPopupPosition) {
            return this.cellEditor.getPopupPosition();
        }
    };
    PopupEditorWrapper.prototype.focusIn = function () {
        if (this.cellEditor.focusIn) {
            this.cellEditor.focusIn();
        }
    };
    PopupEditorWrapper.prototype.focusOut = function () {
        if (this.cellEditor.focusOut) {
            this.cellEditor.focusOut();
        }
    };
    PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER = 'popupEditorWrapper';
    return PopupEditorWrapper;
}(popupComponent_1.PopupComponent));
exports.PopupEditorWrapper = PopupEditorWrapper;

//# sourceMappingURL=popupEditorWrapper.js.map
