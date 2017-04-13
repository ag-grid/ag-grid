/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var utils_1 = require("../utils");
var textCellEditor_1 = require("./cellEditors/textCellEditor");
var selectCellEditor_1 = require("./cellEditors/selectCellEditor");
var popupEditorWrapper_1 = require("./cellEditors/popupEditorWrapper");
var popupTextCellEditor_1 = require("./cellEditors/popupTextCellEditor");
var popupSelectCellEditor_1 = require("./cellEditors/popupSelectCellEditor");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var largeTextCellEditor_1 = require("./cellEditors/largeTextCellEditor");
var CellEditorFactory = CellEditorFactory_1 = (function () {
    function CellEditorFactory() {
        this.cellEditorMap = {};
    }
    CellEditorFactory.prototype.init = function () {
        this.cellEditorMap[CellEditorFactory_1.TEXT] = textCellEditor_1.TextCellEditor;
        this.cellEditorMap[CellEditorFactory_1.SELECT] = selectCellEditor_1.SelectCellEditor;
        this.cellEditorMap[CellEditorFactory_1.POPUP_TEXT] = popupTextCellEditor_1.PopupTextCellEditor;
        this.cellEditorMap[CellEditorFactory_1.POPUP_SELECT] = popupSelectCellEditor_1.PopupSelectCellEditor;
        this.cellEditorMap[CellEditorFactory_1.LARGE_TEXT] = largeTextCellEditor_1.LargeTextCellEditor;
    };
    CellEditorFactory.prototype.addCellEditor = function (key, cellEditor) {
        this.cellEditorMap[key] = cellEditor;
    };
    // private registerEditorsFromGridOptions(): void {
    //     var userProvidedCellEditors = this.gridOptionsWrapper.getCellEditors();
    //     _.iterateObject(userProvidedCellEditors, (key: string, cellEditor: {new(): ICellEditor})=> {
    //         this.addCellEditor(key, cellEditor);
    //     });
    // }
    CellEditorFactory.prototype.createCellEditor = function (key, params) {
        var CellEditorClass;
        if (utils_1.Utils.missing(key)) {
            CellEditorClass = this.cellEditorMap[CellEditorFactory_1.TEXT];
        }
        else if (typeof key === 'string') {
            CellEditorClass = this.cellEditorMap[key];
            if (utils_1.Utils.missing(CellEditorClass)) {
                console.warn('ag-Grid: unable to find cellEditor for key ' + key);
                CellEditorClass = this.cellEditorMap[CellEditorFactory_1.TEXT];
            }
        }
        else {
            CellEditorClass = key;
        }
        var cellEditor = new CellEditorClass();
        this.context.wireBean(cellEditor);
        // we have to call init first, otherwise when using the frameworks, the wrapper
        // classes won't be set up
        if (cellEditor.init) {
            cellEditor.init(params);
        }
        if (cellEditor.isPopup && cellEditor.isPopup()) {
            if (this.gridOptionsWrapper.isFullRowEdit()) {
                console.warn('ag-Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                    '- either turn off fullRowEdit, or stop using popup editors.');
            }
            cellEditor = new popupEditorWrapper_1.PopupEditorWrapper(cellEditor);
            cellEditor.init(params);
        }
        return cellEditor;
    };
    return CellEditorFactory;
}());
CellEditorFactory.TEXT = 'text';
CellEditorFactory.SELECT = 'select';
CellEditorFactory.POPUP_TEXT = 'popupText';
CellEditorFactory.POPUP_SELECT = 'popupSelect';
CellEditorFactory.LARGE_TEXT = 'largeText';
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], CellEditorFactory.prototype, "context", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], CellEditorFactory.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CellEditorFactory.prototype, "init", null);
CellEditorFactory = CellEditorFactory_1 = __decorate([
    context_1.Bean('cellEditorFactory')
], CellEditorFactory);
exports.CellEditorFactory = CellEditorFactory;
var CellEditorFactory_1;
