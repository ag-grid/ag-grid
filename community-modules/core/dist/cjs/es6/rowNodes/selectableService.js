/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const generic_1 = require("../utils/generic");
let SelectableService = class SelectableService extends beanStub_1.BeanStub {
    init() {
        this.groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        this.isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
    }
    updateSelectableAfterGrouping(rowNode) {
        if (this.isRowSelectableFunc) {
            const nextChildrenFunc = (node) => node.childrenAfterGroup;
            this.recurseDown(rowNode.childrenAfterGroup, nextChildrenFunc);
        }
    }
    recurseDown(children, nextChildrenFunc) {
        if (!children) {
            return;
        }
        children.forEach((child) => {
            if (!child.group) {
                return;
            } // only interested in groups
            if (child.hasChildren()) {
                this.recurseDown(nextChildrenFunc(child), nextChildrenFunc);
            }
            let rowSelectable;
            if (this.groupSelectsChildren) {
                // have this group selectable if at least one direct child is selectable
                const firstSelectable = (nextChildrenFunc(child) || []).find(rowNode => rowNode.selectable === true);
                rowSelectable = generic_1.exists(firstSelectable);
            }
            else {
                // directly retrieve selectable value from user callback
                rowSelectable = this.isRowSelectableFunc ? this.isRowSelectableFunc(child) : false;
            }
            child.setRowSelectable(rowSelectable);
        });
    }
};
__decorate([
    context_1.PostConstruct
], SelectableService.prototype, "init", null);
SelectableService = __decorate([
    context_1.Bean('selectableService')
], SelectableService);
exports.SelectableService = SelectableService;
