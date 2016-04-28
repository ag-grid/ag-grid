// ag-grid-enterprise v4.1.4
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
var main_1 = require("ag-grid/main");
var RichSelectRow = (function (_super) {
    __extends(RichSelectRow, _super);
    function RichSelectRow(cellRenderer) {
        _super.call(this, '<div class="ag-rich-select-row"></div>');
        this.cellRenderer = cellRenderer;
    }
    RichSelectRow.prototype.setState = function (value, selected) {
        var childComponent = this.cellRendererService.useCellRenderer(this.cellRenderer, this.getGui(), { value: value });
        if (childComponent && childComponent.destroy) {
            this.addDestroyFunc(childComponent.destroy.bind(childComponent));
        }
        main_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-rich-select-row-selected', selected);
    };
    __decorate([
        main_1.Autowired('cellRendererService'), 
        __metadata('design:type', main_1.CellRendererService)
    ], RichSelectRow.prototype, "cellRendererService", void 0);
    return RichSelectRow;
})(main_1.Component);
exports.RichSelectRow = RichSelectRow;
