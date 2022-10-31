/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
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
let AutoWidthCalculator = class AutoWidthCalculator extends beanStub_1.BeanStub {
    postConstruct() {
        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCtrl = p.centerRowContainerCtrl;
        });
    }
    // this is the trick: we create a dummy container and clone all the cells
    // into the dummy, then check the dummy's width. then destroy the dummy
    // as we don't need it any more.
    // drawback: only the cells visible on the screen are considered
    getPreferredWidthForColumn(column, skipHeader) {
        const eHeaderCell = this.getHeaderCellForColumn(column);
        // cell isn't visible
        if (!eHeaderCell) {
            return -1;
        }
        const elements = this.rowRenderer.getAllCellsForColumn(column);
        if (!skipHeader) {
            // we only consider the lowest level cell, not the group cell. in 99% of the time, this
            // will be enough. if we consider groups, then it gets too complicated for what it's worth,
            // as the groups can span columns and this class only considers one column at a time.
            elements.push(eHeaderCell);
        }
        return this.addElementsToContainerAndGetWidth(elements);
    }
    getPreferredWidthForColumnGroup(columnGroup) {
        const eHeaderCell = this.getHeaderCellForColumn(columnGroup);
        if (!eHeaderCell) {
            return -1;
        }
        return this.addElementsToContainerAndGetWidth([eHeaderCell]);
    }
    addElementsToContainerAndGetWidth(elements) {
        // this element has to be a form, otherwise form elements within a cell
        // will be validated while being cloned. This can cause issues such as 
        // radio buttons being reset and losing their values.
        const eDummyContainer = document.createElement('form');
        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';
        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        const eBodyContainer = this.centerRowContainerCtrl.getContainerElement();
        eBodyContainer.appendChild(eDummyContainer);
        elements.forEach(el => this.cloneItemIntoDummy(el, eDummyContainer));
        // at this point, all the clones are lined up vertically with natural widths. the dummy
        // container will have a width wide enough just to fit the largest.
        const dummyContainerWidth = eDummyContainer.offsetWidth;
        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(eDummyContainer);
        // we add padding as I found sometimes the gui still put '...' after some of the texts. so the
        // user can configure the grid to add a few more pixels after the calculated width
        const autoSizePadding = this.gridOptionsWrapper.getAutoSizePadding();
        return dummyContainerWidth + autoSizePadding;
    }
    getHeaderCellForColumn(column) {
        /* tslint:enable */
        let element = null;
        this.ctrlsService.getHeaderRowContainerCtrls().forEach(container => {
            const res = container.getHtmlElementForColumnHeader(column);
            if (res != null) {
                element = res;
            }
        });
        return element;
    }
    cloneItemIntoDummy(eCell, eDummyContainer) {
        // make a deep clone of the cell
        const eCellClone = eCell.cloneNode(true);
        // the original has a fixed width, we remove this to allow the natural width based on content
        eCellClone.style.width = '';
        // the original has position = absolute, we need to remove this so it's positioned normally
        eCellClone.style.position = 'static';
        eCellClone.style.left = '';
        // we put the cell into a containing div, as otherwise the cells would just line up
        // on the same line, standard flow layout, by putting them into divs, they are laid
        // out one per line
        const eCloneParent = document.createElement('div');
        const eCloneParentClassList = eCloneParent.classList;
        const isHeader = ['ag-header-cell', 'ag-header-group-cell'].some(cls => eCellClone.classList.contains(cls));
        if (isHeader) {
            eCloneParentClassList.add('ag-header', 'ag-header-row');
            eCloneParent.style.position = 'static';
        }
        else {
            eCloneParentClassList.add('ag-row');
        }
        // find parent using classes (headers have ag-header-cell, rows have ag-row), and copy classes from it.
        // if we didn't do this, things like ag-row-level-2 would be missing if present, which sets indents
        // onto group items.
        let pointer = eCell.parentElement;
        while (pointer) {
            const isRow = ['ag-header-row', 'ag-row'].some(cls => pointer.classList.contains(cls));
            if (isRow) {
                for (let i = 0; i < pointer.classList.length; i++) {
                    const item = pointer.classList[i];
                    // we skip ag-row-position-absolute, as this has structural CSS applied that stops the
                    // element from fitting into it's parent, and we need the element to stretch the parent
                    // as we are measuring the parents width
                    if (item != 'ag-row-position-absolute') {
                        eCloneParentClassList.add(item);
                    }
                }
                break;
            }
            pointer = pointer.parentElement;
        }
        // the twig on the branch, the branch on the tree, the tree in the hole,
        // the hole in the bog, the bog in the clone, the clone in the parent,
        // the parent in the dummy, and the dummy down in the vall-e-ooo, OOOOOOOOO! Oh row the rattling bog....
        eCloneParent.appendChild(eCellClone);
        eDummyContainer.appendChild(eCloneParent);
    }
};
__decorate([
    context_1.Autowired('rowRenderer')
], AutoWidthCalculator.prototype, "rowRenderer", void 0);
__decorate([
    context_1.Autowired('ctrlsService')
], AutoWidthCalculator.prototype, "ctrlsService", void 0);
__decorate([
    context_1.Autowired('rowCssClassCalculator')
], AutoWidthCalculator.prototype, "rowCssClassCalculator", void 0);
__decorate([
    context_1.PostConstruct
], AutoWidthCalculator.prototype, "postConstruct", null);
AutoWidthCalculator = __decorate([
    context_1.Bean('autoWidthCalculator')
], AutoWidthCalculator);
exports.AutoWidthCalculator = AutoWidthCalculator;
