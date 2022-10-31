/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { last } from "../../utils/array";
export class StickyRowFeature extends BeanStub {
    constructor(createRowCon, destroyRowCtrls) {
        super();
        this.createRowCon = createRowCon;
        this.destroyRowCtrls = destroyRowCtrls;
        this.stickyRowCtrls = [];
        this.containerHeight = 0;
    }
    postConstruct() {
        this.ctrlsService.whenReady(params => {
            this.gridBodyCtrl = params.gridBodyCtrl;
        });
    }
    getStickyRowCtrls() {
        return this.stickyRowCtrls;
    }
    checkStickyRows() {
        let height = 0;
        if (!this.gridOptionsWrapper.isGroupRowsSticky()) {
            this.refreshNodesAndContainerHeight([], height);
            return;
        }
        const stickyRows = [];
        const firstPixel = this.rowRenderer.getFirstVisibleVerticalPixel();
        const addStickyRow = (stickyRow) => {
            stickyRows.push(stickyRow);
            let lastAncester = stickyRow;
            while (lastAncester.expanded) {
                lastAncester = last(lastAncester.childrenAfterSort);
            }
            const lastChildBottom = lastAncester.rowTop + lastAncester.rowHeight;
            const stickRowBottom = firstPixel + height + stickyRow.rowHeight;
            if (lastChildBottom < stickRowBottom) {
                stickyRow.stickyRowTop = height + (lastChildBottom - stickRowBottom);
            }
            else {
                stickyRow.stickyRowTop = height;
            }
            height = 0;
            stickyRows.forEach(rowNode => {
                const thisRowLastPx = rowNode.stickyRowTop + rowNode.rowHeight;
                if (height < thisRowLastPx) {
                    height = thisRowLastPx;
                }
            });
        };
        while (true) {
            const firstPixelAfterStickyRows = firstPixel + height;
            const firstIndex = this.rowModel.getRowIndexAtPixel(firstPixelAfterStickyRows);
            const firstRow = this.rowModel.getRow(firstIndex);
            if (firstRow == null) {
                break;
            }
            // only happens when pivoting, and we are showing root node
            if (firstRow.level < 0) {
                break;
            }
            const parents = [];
            let p = firstRow.parent;
            while (p.level >= 0) {
                parents.push(p);
                p = p.parent;
            }
            const firstMissingParent = parents.reverse().find(parent => stickyRows.indexOf(parent) < 0 && parent.displayed);
            if (firstMissingParent) {
                addStickyRow(firstMissingParent);
                continue;
            }
            // if first row is an open group, and practically shown, it needs
            // to be stuck
            if (firstRow.group && firstRow.expanded && !firstRow.footer && firstRow.rowTop < firstPixelAfterStickyRows) {
                addStickyRow(firstRow);
                continue;
            }
            break;
        }
        this.refreshNodesAndContainerHeight(stickyRows, height);
    }
    refreshNodesAndContainerHeight(allStickyNodes, height) {
        const removedCtrls = this.stickyRowCtrls.filter(ctrl => allStickyNodes.indexOf(ctrl.getRowNode()) === -1);
        const addedNodes = allStickyNodes.filter(rowNode => this.stickyRowCtrls.findIndex(ctrl => ctrl.getRowNode() === rowNode) === -1);
        const ctrlsToDestroy = {};
        removedCtrls.forEach(removedCtrl => {
            ctrlsToDestroy[removedCtrl.getRowNode().id] = removedCtrl;
            this.stickyRowCtrls = this.stickyRowCtrls.filter(ctrl => ctrl !== removedCtrl);
        });
        for (const ctrl of Object.values(ctrlsToDestroy)) {
            ctrl.getRowNode().sticky = false;
        }
        this.destroyRowCtrls(ctrlsToDestroy, false);
        const newCtrls = addedNodes.map(rowNode => {
            rowNode.sticky = true;
            return this.createRowCon(rowNode, false, false);
        });
        this.stickyRowCtrls.push(...newCtrls);
        this.stickyRowCtrls.forEach(ctrl => ctrl.setRowTop(ctrl.getRowNode().stickyRowTop));
        this.stickyRowCtrls.sort((a, b) => b.getRowNode().rowIndex - a.getRowNode().rowIndex);
        if (this.containerHeight !== height) {
            this.containerHeight = height;
            this.gridBodyCtrl.setStickyTopHeight(height);
        }
    }
}
__decorate([
    Autowired("rowModel")
], StickyRowFeature.prototype, "rowModel", void 0);
__decorate([
    Autowired("rowRenderer")
], StickyRowFeature.prototype, "rowRenderer", void 0);
__decorate([
    Autowired("ctrlsService")
], StickyRowFeature.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], StickyRowFeature.prototype, "postConstruct", null);
