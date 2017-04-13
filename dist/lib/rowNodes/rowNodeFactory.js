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
var rowNode_1 = require("../entities/rowNode");
var inMemoryNodeManager_1 = require("../rowModels/inMemory/inMemoryNodeManager");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var eventService_1 = require("../eventService");
var context_1 = require("../context/context");
var RowNodeFactory = (function () {
    function RowNodeFactory() {
    }
    RowNodeFactory.prototype.create = function (data) {
        var rootNode = new rowNode_1.RowNode();
        var nodeManager = new inMemoryNodeManager_1.InMemoryNodeManager(rootNode, this.gridOptionsWrapper, this.context, this.eventService);
        this.context.wireBean(rootNode);
        nodeManager.setRowData(data);
        return rootNode;
    };
    return RowNodeFactory;
}());
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], RowNodeFactory.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], RowNodeFactory.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], RowNodeFactory.prototype, "context", void 0);
RowNodeFactory = __decorate([
    context_1.Bean("rowNodeFactory")
], RowNodeFactory);
exports.RowNodeFactory = RowNodeFactory;
