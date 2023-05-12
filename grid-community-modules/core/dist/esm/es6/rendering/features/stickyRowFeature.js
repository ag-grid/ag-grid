/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
        this.isClientSide = this.rowModel.getType() === 'clientSide';
        this.ctrlsService.whenReady(params => {
            this.gridBodyCtrl = params.gridBodyCtrl;
        });
    }
    getStickyRowCtrls() {
        return this.stickyRowCtrls;
    }
    checkStickyRows() {
        let height = 0;
        if (!this.gridOptionsService.is('groupRowsSticky')) {
            this.refreshNodesAndContainerHeight([], height);
            return;
        }
        const stickyRows = [];
        const firstPixel = this.rowRenderer.getFirstVisibleVerticalPixel();
        const addStickyRow = (stickyRow) => {
            var _a, _b, _c;
            stickyRows.push(stickyRow);
            let lastChildBottom;
            if (this.isClientSide) {
                let lastAncestor = stickyRow;
                while (lastAncestor.expanded) {
                    if (lastAncestor.master) {
                        lastAncestor = lastAncestor.detailNode;
                    }
                    else if (lastAncestor.childrenAfterSort) {
                        // Tree Data will have `childrenAfterSort` without any nodes, but
                        // the current node will still be marked as expansible.
                        if (lastAncestor.childrenAfterSort.length === 0) {
                            break;
                        }
                        lastAncestor = last(lastAncestor.childrenAfterSort);
                    }
                }
                lastChildBottom = lastAncestor.rowTop + lastAncestor.rowHeight;
            }
            // if the rowModel is `serverSide` as only `clientSide` and `serverSide` create this feature.
            else {
                const storeBounds = (_a = stickyRow.childStore) === null || _a === void 0 ? void 0 : _a.getStoreBounds();
                lastChildBottom = ((_b = storeBounds === null || storeBounds === void 0 ? void 0 : storeBounds.heightPx) !== null && _b !== void 0 ? _b : 0) + ((_c = storeBounds === null || storeBounds === void 0 ? void 0 : storeBounds.topPx) !== null && _c !== void 0 ? _c : 0);
            }
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
            if (firstRow.isExpandable() && firstRow.expanded && firstRow.rowTop < firstPixelAfterStickyRows) {
                addStickyRow(firstRow);
                continue;
            }
            break;
        }
        this.refreshNodesAndContainerHeight(stickyRows, height);
    }
    refreshStickyNode(stickRowNode) {
        const allStickyNodes = [];
        for (let i = 0; i < this.stickyRowCtrls.length; i++) {
            const currentNode = this.stickyRowCtrls[i].getRowNode();
            if (currentNode !== stickRowNode) {
                allStickyNodes.push(currentNode);
            }
        }
        this.refreshNodesAndContainerHeight(allStickyNodes, this.containerHeight);
        this.checkStickyRows();
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
