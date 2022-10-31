/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { Autowired, PostConstruct } from '../context/context';
import { RefSelector } from './componentAnnotations';
import { getAriaPosInSet, setAriaSetSize, setAriaPosInSet, setAriaSelected, setAriaChecked, setAriaRole, setAriaLabel } from '../utils/aria';
import { KeyCode } from '../constants/keyCode';
import { waitUntil } from '../utils/function';
import { TabGuardComp } from './tabGuardComp';
var VirtualList = /** @class */ (function (_super) {
    __extends(VirtualList, _super);
    function VirtualList(cssIdentifier, ariaRole, listName) {
        if (cssIdentifier === void 0) { cssIdentifier = 'default'; }
        if (ariaRole === void 0) { ariaRole = 'listbox'; }
        var _this = _super.call(this, VirtualList.getTemplate(cssIdentifier)) || this;
        _this.cssIdentifier = cssIdentifier;
        _this.ariaRole = ariaRole;
        _this.listName = listName;
        _this.renderedRows = new Map();
        _this.rowHeight = 20;
        _this.isDestroyed = false;
        return _this;
    }
    VirtualList.prototype.postConstruct = function () {
        var _this = this;
        this.addScrollListener();
        this.rowHeight = this.getItemHeight();
        this.addResizeObserver();
        this.initialiseTabGuard({
            onFocusIn: function (e) { return _this.onFocusIn(e); },
            onFocusOut: function (e) { return _this.onFocusOut(e); },
            focusInnerElement: function (fromBottom) { return _this.focusInnerElement(fromBottom); },
            onTabKeyDown: function (e) { return _this.onTabKeyDown(e); },
            handleKeyDown: function (e) { return _this.handleKeyDown(e); }
        });
        this.setAriaProperties();
    };
    VirtualList.prototype.setAriaProperties = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var listName = translate('ariaDefaultListName', this.listName || 'List');
        var ariaEl = this.eContainer;
        setAriaRole(ariaEl, this.ariaRole);
        setAriaLabel(ariaEl, listName);
    };
    VirtualList.prototype.addResizeObserver = function () {
        var listener = this.drawVirtualRows.bind(this);
        var destroyObserver = this.resizeObserverService.observeResize(this.getGui(), listener);
        this.addDestroyFunc(destroyObserver);
    };
    VirtualList.prototype.focusInnerElement = function (fromBottom) {
        this.focusRow(fromBottom ? this.model.getRowCount() - 1 : 0);
    };
    VirtualList.prototype.onFocusIn = function (e) {
        var target = e.target;
        if (target.classList.contains('ag-virtual-list-item')) {
            this.lastFocusedRowIndex = getAriaPosInSet(target) - 1;
        }
        return false;
    };
    VirtualList.prototype.onFocusOut = function (e) {
        if (!this.getFocusableElement().contains(e.relatedTarget)) {
            this.lastFocusedRowIndex = null;
        }
        return false;
    };
    VirtualList.prototype.handleKeyDown = function (e) {
        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                if (this.navigate(e.key === KeyCode.UP)) {
                    e.preventDefault();
                }
                break;
        }
    };
    VirtualList.prototype.onTabKeyDown = function (e) {
        if (this.navigate(e.shiftKey)) {
            e.preventDefault();
        }
        else {
            // focus on the first or last focusable element to ensure that any other handlers start from there
            this.focusService.focusInto(this.getGui(), !e.shiftKey);
        }
    };
    VirtualList.prototype.navigate = function (up) {
        if (this.lastFocusedRowIndex == null) {
            return false;
        }
        var nextRow = this.lastFocusedRowIndex + (up ? -1 : 1);
        if (nextRow < 0 || nextRow >= this.model.getRowCount()) {
            return false;
        }
        this.focusRow(nextRow);
        return true;
    };
    VirtualList.prototype.getLastFocusedRow = function () {
        return this.lastFocusedRowIndex;
    };
    VirtualList.prototype.focusRow = function (rowNumber) {
        var _this = this;
        this.ensureIndexVisible(rowNumber);
        window.setTimeout(function () {
            var renderedRow = _this.renderedRows.get(rowNumber);
            if (renderedRow) {
                renderedRow.eDiv.focus();
            }
        }, 10);
    };
    VirtualList.prototype.getComponentAt = function (rowIndex) {
        var comp = this.renderedRows.get(rowIndex);
        return comp && comp.rowComponent;
    };
    VirtualList.prototype.forEachRenderedRow = function (func) {
        this.renderedRows.forEach(function (value, key) { return func(value.rowComponent, key); });
    };
    VirtualList.getTemplate = function (cssIdentifier) {
        return /* html */ "\n            <div class=\"ag-virtual-list-viewport ag-" + cssIdentifier + "-virtual-list-viewport\" role=\"presentation\">\n                <div class=\"ag-virtual-list-container ag-" + cssIdentifier + "-virtual-list-container\" ref=\"eContainer\"></div>\n            </div>";
    };
    VirtualList.prototype.getItemHeight = function () {
        return this.gridOptionsWrapper.getListItemHeight();
    };
    VirtualList.prototype.ensureIndexVisible = function (index) {
        var lastRow = this.model.getRowCount();
        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
            console.warn('AG Grid: invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        var rowTopPixel = index * this.rowHeight;
        var rowBottomPixel = rowTopPixel + this.rowHeight;
        var eGui = this.getGui();
        var viewportTopPixel = eGui.scrollTop;
        var viewportHeight = eGui.offsetHeight;
        var viewportBottomPixel = viewportTopPixel + viewportHeight;
        var viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
        var viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;
        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eGui.scrollTop = rowTopPixel;
        }
        else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            var newScrollPosition = rowBottomPixel - viewportHeight;
            eGui.scrollTop = newScrollPosition;
        }
    };
    VirtualList.prototype.setComponentCreator = function (componentCreator) {
        this.componentCreator = componentCreator;
    };
    VirtualList.prototype.getRowHeight = function () {
        return this.rowHeight;
    };
    VirtualList.prototype.getScrollTop = function () {
        return this.getGui().scrollTop;
    };
    VirtualList.prototype.setRowHeight = function (rowHeight) {
        this.rowHeight = rowHeight;
        this.refresh();
    };
    VirtualList.prototype.refresh = function () {
        var _this = this;
        if (this.model == null || this.isDestroyed) {
            return;
        }
        var rowCount = this.model.getRowCount();
        this.eContainer.style.height = rowCount * this.rowHeight + "px";
        // ensure height is applied before attempting to redraw rows
        waitUntil(function () { return _this.eContainer.clientHeight >= rowCount * _this.rowHeight; }, function () {
            if (_this.isDestroyed) {
                return;
            }
            _this.clearVirtualRows();
            _this.drawVirtualRows();
        });
    };
    VirtualList.prototype.clearVirtualRows = function () {
        var _this = this;
        this.renderedRows.forEach(function (_, rowIndex) { return _this.removeRow(rowIndex); });
    };
    VirtualList.prototype.drawVirtualRows = function () {
        if (!this.isAlive()) {
            return;
        }
        var gui = this.getGui();
        var topPixel = gui.scrollTop;
        var bottomPixel = topPixel + gui.offsetHeight;
        var firstRow = Math.floor(topPixel / this.rowHeight);
        var lastRow = Math.floor(bottomPixel / this.rowHeight);
        this.ensureRowsRendered(firstRow, lastRow);
    };
    VirtualList.prototype.ensureRowsRendered = function (start, finish) {
        var _this = this;
        // remove any rows that are no longer required
        this.renderedRows.forEach(function (_, rowIndex) {
            if ((rowIndex < start || rowIndex > finish) && rowIndex !== _this.lastFocusedRowIndex) {
                _this.removeRow(rowIndex);
            }
        });
        // insert any required new rows
        for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
            if (this.renderedRows.has(rowIndex)) {
                continue;
            }
            // check this row actually exists (in case overflow buffer window exceeds real data)
            if (rowIndex < this.model.getRowCount()) {
                this.insertRow(rowIndex);
            }
        }
    };
    VirtualList.prototype.insertRow = function (rowIndex) {
        var _this = this;
        var value = this.model.getRow(rowIndex);
        var eDiv = document.createElement('div');
        eDiv.classList.add('ag-virtual-list-item', "ag-" + this.cssIdentifier + "-virtual-list-item");
        setAriaRole(eDiv, this.ariaRole === 'tree' ? 'treeitem' : 'option');
        setAriaSetSize(eDiv, this.model.getRowCount());
        setAriaPosInSet(eDiv, rowIndex + 1);
        eDiv.setAttribute('tabindex', '-1');
        if (typeof this.model.isRowSelected === 'function') {
            var isSelected = this.model.isRowSelected(rowIndex);
            setAriaSelected(eDiv, !!isSelected);
            setAriaChecked(eDiv, isSelected);
        }
        eDiv.style.height = this.rowHeight + "px";
        eDiv.style.top = this.rowHeight * rowIndex + "px";
        var rowComponent = this.componentCreator(value, eDiv);
        rowComponent.addGuiEventListener('focusin', function () { return _this.lastFocusedRowIndex = rowIndex; });
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
        this.renderedRows.set(rowIndex, { rowComponent: rowComponent, eDiv: eDiv });
    };
    VirtualList.prototype.removeRow = function (rowIndex) {
        var component = this.renderedRows.get(rowIndex);
        this.eContainer.removeChild(component.eDiv);
        this.destroyBean(component.rowComponent);
        this.renderedRows.delete(rowIndex);
    };
    VirtualList.prototype.addScrollListener = function () {
        var _this = this;
        this.addGuiEventListener('scroll', function () { return _this.drawVirtualRows(); });
    };
    VirtualList.prototype.setModel = function (model) {
        this.model = model;
    };
    VirtualList.prototype.destroy = function () {
        if (this.isDestroyed) {
            return;
        }
        this.clearVirtualRows();
        this.isDestroyed = true;
        _super.prototype.destroy.call(this);
    };
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
    return VirtualList;
}(TabGuardComp));
export { VirtualList };
