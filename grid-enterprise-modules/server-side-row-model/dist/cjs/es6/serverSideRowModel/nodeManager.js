"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeManager = void 0;
const core_1 = require("@ag-grid-community/core");
let NodeManager = class NodeManager {
    constructor() {
        this.rowNodes = {};
    }
    addRowNode(rowNode) {
        const id = rowNode.id;
        if (this.rowNodes[id]) {
            console.warn(`AG Grid: Duplicate node id ${rowNode.id}. Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values.`);
            console.warn('first instance', this.rowNodes[id].data);
            console.warn('second instance', rowNode.data);
        }
        this.rowNodes[id] = rowNode;
    }
    removeNode(rowNode) {
        const id = rowNode.id;
        if (this.rowNodes[id]) {
            this.rowNodes[id] = undefined;
        }
    }
    clear() {
        this.rowNodes = {};
    }
};
__decorate([
    core_1.PreDestroy
], NodeManager.prototype, "clear", null);
NodeManager = __decorate([
    core_1.Bean('ssrmNodeManager')
], NodeManager);
exports.NodeManager = NodeManager;
