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
var component_1 = require("../widgets/component");
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var DndSourceComp = /** @class */ (function (_super) {
    __extends(DndSourceComp, _super);
    function DndSourceComp(rowNode, column, cellValue, beans, eCell) {
        var _this = _super.call(this, "<div class=\"ag-row-drag\" draggable=\"true\"></div>") || this;
        _this.rowNode = rowNode;
        _this.column = column;
        _this.cellValue = cellValue;
        _this.beans = beans;
        _this.eCell = eCell;
        return _this;
    }
    DndSourceComp.prototype.postConstruct = function () {
        var eGui = this.getGui();
        eGui.appendChild(utils_1._.createIconNoSpan('rowDrag', this.beans.gridOptionsWrapper, null));
        this.addDragSource();
        this.checkVisibility();
    };
    DndSourceComp.prototype.addDragSource = function () {
        this.addGuiEventListener('dragstart', this.onDragStart.bind(this));
    };
    DndSourceComp.prototype.onDragStart = function (dragEvent) {
        var _this = this;
        var providedOnRowDrag = this.column.getColDef().dndSourceOnRowDrag;
        dragEvent.dataTransfer.setDragImage(this.eCell, 0, 0);
        // default behaviour is to convert data to json and set into drag component
        var defaultOnRowDrag = function () {
            try {
                var jsonData = JSON.stringify(_this.rowNode.data);
                dragEvent.dataTransfer.setData('application/json', jsonData);
                dragEvent.dataTransfer.setData('text/plain', jsonData);
            }
            catch (e) {
                // if we cannot convert the data to json, then we do not set the type
            }
        };
        if (providedOnRowDrag) {
            providedOnRowDrag({ rowNode: this.rowNode, dragEvent: dragEvent });
        }
        else {
            defaultOnRowDrag();
        }
    };
    DndSourceComp.prototype.checkVisibility = function () {
        var visible = this.column.isDndSource(this.rowNode);
        this.setVisible(visible, null);
    };
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DndSourceComp.prototype, "postConstruct", null);
    return DndSourceComp;
}(component_1.Component));
exports.DndSourceComp = DndSourceComp;
