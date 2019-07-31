/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var context_1 = require("../context/context");
var popupService_1 = require("./popupService");
var maximizable_1 = require("../rendering/mixins/maximizable");
var resizable_1 = require("../rendering/mixins/resizable");
var movable_1 = require("../rendering/mixins/movable");
var agPanel_1 = require("./agPanel");
var utils_1 = require("../utils");
var AgDialog = /** @class */ (function (_super) {
    __extends(AgDialog, _super);
    function AgDialog(config) {
        return _super.call(this, config) || this;
    }
    AgDialog.prototype.postConstruct = function () {
        var _this = this;
        var eGui = this.getGui();
        utils_1._.addCssClass(eGui, 'ag-dialog');
        this.moveElement = this.eTitleBar;
        _super.prototype.postConstruct.call(this);
        this.addDestroyableEventListener(eGui, 'focusin', function (e) {
            if (eGui.contains(e.relatedTarget)) {
                return;
            }
            _this.popupService.bringPopupToFront(eGui);
        });
    };
    //  used by the Positionable Mixin
    AgDialog.prototype.renderComponent = function () {
        var eGui = this.getGui();
        var _a = this.config, alwaysOnTop = _a.alwaysOnTop, modal = _a.modal;
        this.close = this.popupService.addPopup(modal, eGui, true, this.destroy.bind(this), undefined, alwaysOnTop);
        eGui.focus();
    };
    __decorate([
        context_1.Autowired('popupService'),
        __metadata("design:type", popupService_1.PopupService)
    ], AgDialog.prototype, "popupService", void 0);
    return AgDialog;
}(resizable_1.Resizable(maximizable_1.Maximizable(movable_1.Movable(agPanel_1.AgPanel)))));
exports.AgDialog = AgDialog;
