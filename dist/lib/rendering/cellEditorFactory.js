/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var context_1 = require("../context/context");
var utils_1 = require('../utils');
var textCellEditor_1 = require("./cellEditors/textCellEditor");
var selectCellEditor_1 = require("./cellEditors/selectCellEditor");
var popupEditorWrapper_1 = require("./cellEditors/popupEditorWrapper");
var popupTextCellEditor_1 = require("./cellEditors/popupTextCellEditor");
var popupSelectCellEditor_1 = require("./cellEditors/popupSelectCellEditor");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var CellEditorFactory = (function () {
    function CellEditorFactory() {
        this.cellEditorMap = {};
    }
    CellEditorFactory.prototype.init = function () {
        this.cellEditorMap[CellEditorFactory.TEXT] = textCellEditor_1.TextCellEditor;
        this.cellEditorMap[CellEditorFactory.SELECT] = selectCellEditor_1.SelectCellEditor;
        this.cellEditorMap[CellEditorFactory.POPUP_TEXT] = popupTextCellEditor_1.PopupTextCellEditor;
        this.cellEditorMap[CellEditorFactory.POPUP_SELECT] = popupSelectCellEditor_1.PopupSelectCellEditor;
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
    CellEditorFactory.prototype.createCellEditor = function (key) {
        var CellEditorClass;
        if (utils_1.Utils.missing(key)) {
            CellEditorClass = this.cellEditorMap[CellEditorFactory.TEXT];
        }
        else if (typeof key === 'string') {
            CellEditorClass = this.cellEditorMap[key];
            if (utils_1.Utils.missing(CellEditorClass)) {
                console.warn('ag-Grid: unable to find cellEditor for key ' + key);
                CellEditorClass = this.cellEditorMap[CellEditorFactory.TEXT];
            }
        }
        else {
            CellEditorClass = key;
        }
        var cellEditor = new CellEditorClass();
        this.context.wireBean(cellEditor);
        if (cellEditor.isPopup && cellEditor.isPopup()) {
            cellEditor = new popupEditorWrapper_1.PopupEditorWrapper(cellEditor);
        }
        return cellEditor;
    };
    CellEditorFactory.TEXT = 'text';
    CellEditorFactory.SELECT = 'select';
    CellEditorFactory.POPUP_TEXT = 'popupText';
    CellEditorFactory.POPUP_SELECT = 'popupSelect';
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], CellEditorFactory.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], CellEditorFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], CellEditorFactory.prototype, "init", null);
    CellEditorFactory = __decorate([
        context_1.Bean('cellEditorFactory'), 
        __metadata('design:paramtypes', [])
    ], CellEditorFactory);
    return CellEditorFactory;
})();
exports.CellEditorFactory = CellEditorFactory;
