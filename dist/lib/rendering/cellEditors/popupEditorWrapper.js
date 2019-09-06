/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var popupComponent_1 = require("../../widgets/popupComponent");
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var utils_1 = require("../../utils");
var PopupEditorWrapper = /** @class */ (function (_super) {
    __extends(PopupEditorWrapper, _super);
    function PopupEditorWrapper(cellEditor) {
        var _this = _super.call(this, "<div class=\"ag-popup-editor\" tabindex=\"-1\"/>") || this;
        _this.getGuiCalledOnChild = false;
        _this.cellEditor = cellEditor;
        return _this;
    }
    PopupEditorWrapper.prototype.onKeyDown = function (event) {
        if (!utils_1._.isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, event, this.params.node, this.params.column, true)) {
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
        this.addDestroyFunc(function () {
            if (_this.cellEditor.destroy) {
                _this.cellEditor.destroy();
            }
        });
        this.addDestroyableEventListener(
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
    };
    PopupEditorWrapper.prototype.isCancelAfterEnd = function () {
        if (this.cellEditor.isCancelAfterEnd) {
            return this.cellEditor.isCancelAfterEnd();
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
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], PopupEditorWrapper.prototype, "gridOptionsWrapper", void 0);
    return PopupEditorWrapper;
}(popupComponent_1.PopupComponent));
exports.PopupEditorWrapper = PopupEditorWrapper;
