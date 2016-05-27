/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.2.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var component_1 = require("../../widgets/component");
var context_1 = require("../../context/context");
var popupService_1 = require("../../widgets/popupService");
var utils_1 = require('../../utils');
var DateCellEditor = (function (_super) {
    __extends(DateCellEditor, _super);
    function DateCellEditor() {
        _super.call(this, DateCellEditor.TEMPLATE);
        this.eText = this.queryForHtmlInputElement('input');
        this.eButton = this.queryForHtmlElement('button');
        this.eButton.addEventListener('click', this.onBtPush.bind(this));
    }
    DateCellEditor.prototype.getValue = function () {
        return this.eText.value;
    };
    DateCellEditor.prototype.onBtPush = function () {
        var ePopup = utils_1.Utils.loadTemplate('<div style="position: absolute; border: 1px solid darkgreen; background: lightcyan">' +
            '<div>This is the popup</div>' +
            '<div><input/></div>' +
            '<div>Under the input</div>' +
            '</div>');
        this.popupService.addAsModalPopup(ePopup, true, function () {
            console.log('popup was closed');
        });
        this.popupService.positionPopupUnderComponent({
            eventSource: this.getGui(),
            ePopup: ePopup
        });
        var eText = ePopup.querySelector('input');
        eText.focus();
    };
    DateCellEditor.prototype.afterGuiAttached = function () {
        this.eText.focus();
    };
    DateCellEditor.TEMPLATE = '<span>' +
        '<input type="text" style="width: 80%"/>' +
        '<button style="width: 20%">+</button>' +
        '</span>';
    __decorate([
        context_1.Autowired('popupService'), 
        __metadata('design:type', popupService_1.PopupService)
    ], DateCellEditor.prototype, "popupService", void 0);
    return DateCellEditor;
})(component_1.Component);
exports.DateCellEditor = DateCellEditor;
