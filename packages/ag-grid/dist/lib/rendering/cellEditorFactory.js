/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
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
var popupEditorWrapper_1 = require("./cellEditors/popupEditorWrapper");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var componentResolver_1 = require("../components/framework/componentResolver");
var CellEditorFactory = (function () {
    function CellEditorFactory() {
    }
    CellEditorFactory.prototype.init = function () {
    };
    CellEditorFactory.prototype.addCellEditor = function (key, cellEditor) {
        console.warn("ag-grid: since v13.3.1 this method is not supported anymore. If you want to register your own editor check the docs: https://www.ag-grid.com/javascript-grid-cell-editor/");
    };
    // private registerEditorsFromGridOptions(): void {
    //     let userProvidedCellEditors = this.gridOptionsWrapper.getCellEditors();
    //     _.iterateObject(userProvidedCellEditors, (key: string, cellEditor: {new(): ICellEditor})=> {
    //         this.addCellEditor(key, cellEditor);
    //     });
    // }
    CellEditorFactory.prototype.createCellEditor = function (column, params) {
        var _this = this;
        var cellEditorPromise = this.componentResolver.createAgGridComponent(column, params, 'cellEditor', {
            api: params.api,
            columnApi: params.columnApi,
            node: params.node,
            data: params.node.data,
            rowIndex: params.rowIndex,
            column: params.column,
            colDef: params.column.getColDef()
        }, 'agCellEditor');
        return cellEditorPromise.map(function (cellEditor) {
            var isPopup = cellEditor.isPopup && cellEditor.isPopup();
            if (!isPopup) {
                return cellEditor;
            }
            if (_this.gridOptionsWrapper.isFullRowEdit()) {
                console.warn('ag-Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                    '- either turn off fullRowEdit, or stop using popup editors.');
            }
            // if a popup, then we wrap in a popup editor and return the popup
            var popupEditorWrapper = new popupEditorWrapper_1.PopupEditorWrapper(cellEditor);
            _this.context.wireBean(popupEditorWrapper);
            popupEditorWrapper.init(params);
            return popupEditorWrapper;
        });
    };
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], CellEditorFactory.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('componentResolver'),
        __metadata("design:type", componentResolver_1.ComponentResolver)
    ], CellEditorFactory.prototype, "componentResolver", void 0);
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
    CellEditorFactory = __decorate([
        context_1.Bean('cellEditorFactory')
    ], CellEditorFactory);
    return CellEditorFactory;
}());
exports.CellEditorFactory = CellEditorFactory;
