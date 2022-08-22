/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PostConstruct } from '../context/context';
import { RefSelector } from './componentAnnotations';
import { getAriaPosInSet, setAriaSetSize, setAriaPosInSet, setAriaSelected, setAriaChecked, setAriaRole, setAriaLabel } from '../utils/aria';
import { KeyCode } from '../constants/keyCode';
import { waitUntil } from '../utils/function';
import { TabGuardComp } from './tabGuardComp';
export class VirtualList extends TabGuardComp {
    constructor(cssIdentifier = 'default', ariaRole = 'listbox', listName) {
        super(VirtualList.getTemplate(cssIdentifier));
        this.cssIdentifier = cssIdentifier;
        this.ariaRole = ariaRole;
        this.listName = listName;
        this.renderedRows = new Map();
        this.rowHeight = 20;
        this.isDestroyed = false;
    }
    postConstruct() {
        this.addScrollListener();
        this.rowHeight = this.getItemHeight();
        this.addResizeObserver();
        this.initialiseTabGuard({
            onFocusIn: (e) => this.onFocusIn(e),
            onFocusOut: (e) => this.onFocusOut(e),
            focusInnerElement: (fromBottom) => this.focusInnerElement(fromBottom),
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e)
        });
        this.setAriaProperties();
    }
    setAriaProperties() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const listName = translate('ariaDefaultListName', this.listName || 'List');
        const ariaEl = this.eContainer;
        setAriaRole(ariaEl, this.ariaRole);
        setAriaLabel(ariaEl, listName);
    }
    addResizeObserver() {
        const listener = this.drawVirtualRows.bind(this);
        const destroyObserver = this.resizeObserverService.observeResize(this.getGui(), listener);
        this.addDestroyFunc(destroyObserver);
    }
    focusInnerElement(fromBottom) {
        this.focusRow(fromBottom ? this.model.getRowCount() - 1 : 0);
    }
    onFocusIn(e) {
        const target = e.target;
        if (target.classList.contains('ag-virtual-list-item')) {
            this.lastFocusedRowIndex = getAriaPosInSet(target) - 1;
        }
        return false;
    }
    onFocusOut(e) {
        if (!this.getFocusableElement().contains(e.relatedTarget)) {
            this.lastFocusedRowIndex = null;
        }
        return false;
    }
    handleKeyDown(e) {
        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                if (this.navigate(e.key === KeyCode.UP)) {
                    e.preventDefault();
                }
                break;
        }
    }
    onTabKeyDown(e) {
        if (this.navigate(e.shiftKey)) {
            e.preventDefault();
        }
        else {
            // focus on the first or last focusable element to ensure that any other handlers start from there
            this.focusService.focusInto(this.getGui(), !e.shiftKey);
        }
    }
    navigate(up) {
        if (this.lastFocusedRowIndex == null) {
            return false;
        }
        const nextRow = this.lastFocusedRowIndex + (up ? -1 : 1);
        if (nextRow < 0 || nextRow >= this.model.getRowCount()) {
            return false;
        }
        this.focusRow(nextRow);
        return true;
    }
    getLastFocusedRow() {
        return this.lastFocusedRowIndex;
    }
    focusRow(rowNumber) {
        this.ensureIndexVisible(rowNumber);
        window.setTimeout(() => {
            const renderedRow = this.renderedRows.get(rowNumber);
            if (renderedRow) {
                renderedRow.eDiv.focus();
            }
        }, 10);
    }
    getComponentAt(rowIndex) {
        const comp = this.renderedRows.get(rowIndex);
        return comp && comp.rowComponent;
    }
    forEachRenderedRow(func) {
        this.renderedRows.forEach((value, key) => func(value.rowComponent, key));
    }
    static getTemplate(cssIdentifier) {
        return /* html */ `
            <div class="ag-virtual-list-viewport ag-${cssIdentifier}-virtual-list-viewport" role="presentation">
                <div class="ag-virtual-list-container ag-${cssIdentifier}-virtual-list-container" ref="eContainer"></div>
            </div>`;
    }
    getItemHeight() {
        return this.gridOptionsWrapper.getListItemHeight();
    }
    ensureIndexVisible(index) {
        const lastRow = this.model.getRowCount();
        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
            console.warn('AG Grid: invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        const rowTopPixel = index * this.rowHeight;
        const rowBottomPixel = rowTopPixel + this.rowHeight;
        const eGui = this.getGui();
        const viewportTopPixel = eGui.scrollTop;
        const viewportHeight = eGui.offsetHeight;
        const viewportBottomPixel = viewportTopPixel + viewportHeight;
        const viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
        const viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;
        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eGui.scrollTop = rowTopPixel;
        }
        else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            const newScrollPosition = rowBottomPixel - viewportHeight;
            eGui.scrollTop = newScrollPosition;
        }
    }
    setComponentCreator(componentCreator) {
        this.componentCreator = componentCreator;
    }
    getRowHeight() {
        return this.rowHeight;
    }
    getScrollTop() {
        return this.getGui().scrollTop;
    }
    setRowHeight(rowHeight) {
        this.rowHeight = rowHeight;
        this.refresh();
    }
    refresh() {
        if (this.model == null || this.isDestroyed) {
            return;
        }
        const rowCount = this.model.getRowCount();
        this.eContainer.style.height = `${rowCount * this.rowHeight}px`;
        // ensure height is applied before attempting to redraw rows
        waitUntil(() => this.eContainer.clientHeight >= rowCount * this.rowHeight, () => {
            if (this.isDestroyed) {
                return;
            }
            this.clearVirtualRows();
            this.drawVirtualRows();
        });
    }
    clearVirtualRows() {
        this.renderedRows.forEach((_, rowIndex) => this.removeRow(rowIndex));
    }
    drawVirtualRows() {
        if (!this.isAlive()) {
            return;
        }
        const gui = this.getGui();
        const topPixel = gui.scrollTop;
        const bottomPixel = topPixel + gui.offsetHeight;
        const firstRow = Math.floor(topPixel / this.rowHeight);
        const lastRow = Math.floor(bottomPixel / this.rowHeight);
        this.ensureRowsRendered(firstRow, lastRow);
    }
    ensureRowsRendered(start, finish) {
        // remove any rows that are no longer required
        this.renderedRows.forEach((_, rowIndex) => {
            if ((rowIndex < start || rowIndex > finish) && rowIndex !== this.lastFocusedRowIndex) {
                this.removeRow(rowIndex);
            }
        });
        // insert any required new rows
        for (let rowIndex = start; rowIndex <= finish; rowIndex++) {
            if (this.renderedRows.has(rowIndex)) {
                continue;
            }
            // check this row actually exists (in case overflow buffer window exceeds real data)
            if (rowIndex < this.model.getRowCount()) {
                this.insertRow(rowIndex);
            }
        }
    }
    insertRow(rowIndex) {
        const value = this.model.getRow(rowIndex);
        const eDiv = document.createElement('div');
        eDiv.classList.add('ag-virtual-list-item', `ag-${this.cssIdentifier}-virtual-list-item`);
        setAriaRole(eDiv, this.ariaRole === 'tree' ? 'treeitem' : 'option');
        setAriaSetSize(eDiv, this.model.getRowCount());
        setAriaPosInSet(eDiv, rowIndex + 1);
        eDiv.setAttribute('tabindex', '-1');
        if (typeof this.model.isRowSelected === 'function') {
            const isSelected = this.model.isRowSelected(rowIndex);
            setAriaSelected(eDiv, !!isSelected);
            setAriaChecked(eDiv, isSelected);
        }
        eDiv.style.height = `${this.rowHeight}px`;
        eDiv.style.top = `${this.rowHeight * rowIndex}px`;
        const rowComponent = this.componentCreator(value, eDiv);
        rowComponent.addGuiEventListener('focusin', () => this.lastFocusedRowIndex = rowIndex);
        eDiv.appendChild(rowComponent.getGui());
        // keep the DOM order consistent with the order of the rows
        if (this.renderedRows.has(rowIndex - 1)) {
            this.renderedRows.get(rowIndex - 1).eDiv.insertAdjacentElement('afterend', eDiv);
        }
        else if (this.renderedRows.has(rowIndex + 1)) {
            this.renderedRows.get(rowIndex + 1).eDiv.insertAdjacentElement('beforebegin', eDiv);
        }
        else {
            this.eContainer.appendChild(eDiv);
        }
        this.renderedRows.set(rowIndex, { rowComponent, eDiv });
    }
    removeRow(rowIndex) {
        const component = this.renderedRows.get(rowIndex);
        this.eContainer.removeChild(component.eDiv);
        this.destroyBean(component.rowComponent);
        this.renderedRows.delete(rowIndex);
    }
    addScrollListener() {
        this.addGuiEventListener('scroll', () => this.drawVirtualRows());
    }
    setModel(model) {
        this.model = model;
    }
    destroy() {
        if (this.isDestroyed) {
            return;
        }
        this.clearVirtualRows();
        this.isDestroyed = true;
        super.destroy();
    }
}
__decorate([
    Autowired('resizeObserverService')
], VirtualList.prototype, "resizeObserverService", void 0);
__decorate([
    Autowired('focusService')
], VirtualList.prototype, "focusService", void 0);
__decorate([
    RefSelector('eContainer')
], VirtualList.prototype, "eContainer", void 0);
__decorate([
    PostConstruct
], VirtualList.prototype, "postConstruct", null);
