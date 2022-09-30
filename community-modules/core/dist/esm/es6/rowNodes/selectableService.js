/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { exists } from "../utils/generic";
let SelectableService = class SelectableService extends BeanStub {
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
                rowSelectable = exists(firstSelectable);
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
    PostConstruct
], SelectableService.prototype, "init", null);
SelectableService = __decorate([
    Bean('selectableService')
], SelectableService);
export { SelectableService };
