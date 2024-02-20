var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, _ } from "@ag-grid-community/core";
let MenuUtils = class MenuUtils extends BeanStub {
    restoreFocusOnClose(restoreFocusParams, eComp, e, restoreIfMouseEvent) {
        const { eventSource } = restoreFocusParams;
        const isKeyboardEvent = e instanceof KeyboardEvent;
        if ((!restoreIfMouseEvent && !isKeyboardEvent) || !eventSource) {
            return;
        }
        const eDocument = this.gridOptionsService.getDocument();
        if (!eComp.contains(eDocument.activeElement) && eDocument.activeElement !== eDocument.body) {
            // something else has focus, so don't return focus to the header
            return;
        }
        this.focusHeaderCell(restoreFocusParams);
    }
    closePopupAndRestoreFocusOnSelect(hidePopupFunc, restoreFocusParams, event) {
        let keyboardEvent;
        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }
        hidePopupFunc(keyboardEvent && { keyboardEvent });
        // this method only gets called when the menu was closed by selecting an option
        // in this case we focus the cell that was previously focused, otherwise the header
        const focusedCell = this.focusService.getFocusedCell();
        const eDocument = this.gridOptionsService.getDocument();
        if (eDocument.activeElement === eDocument.body) {
            if (focusedCell) {
                const { rowIndex, rowPinned, column } = focusedCell;
                this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
            }
            else {
                this.focusHeaderCell(restoreFocusParams);
            }
        }
    }
    onContextMenu(mouseEvent, touchEvent, showMenuCallback) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsService.get('allowContextMenuWithControlKey')) {
            // then do the check
            if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
                return;
            }
        }
        // need to do this regardless of context menu showing or not, so doing
        // before the isSuppressContextMenu() check
        if (mouseEvent) {
            this.blockMiddleClickScrollsIfNeeded(mouseEvent);
        }
        if (this.gridOptionsService.get('suppressContextMenu')) {
            return;
        }
        const eventOrTouch = mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : touchEvent.touches[0];
        if (showMenuCallback(eventOrTouch)) {
            const event = mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : touchEvent;
            event.preventDefault();
        }
    }
    focusHeaderCell(restoreFocusParams) {
        const { column, columnIndex, headerPosition, eventSource } = restoreFocusParams;
        const isColumnStillVisible = this.columnModel.getAllDisplayedColumns().some(col => col === column);
        if (isColumnStillVisible && eventSource && _.isVisible(eventSource)) {
            const focusableEl = this.focusService.findTabbableParent(eventSource);
            if (focusableEl) {
                if (column) {
                    this.headerNavigationService.scrollToColumn(column);
                }
                focusableEl.focus();
            }
        }
        // if the focusEl is no longer in the DOM, we try to focus
        // the header that is closest to the previous header position
        else if (headerPosition && columnIndex !== -1) {
            const allColumns = this.columnModel.getAllDisplayedColumns();
            const columnToFocus = allColumns[columnIndex] || _.last(allColumns);
            if (columnToFocus) {
                this.focusService.focusHeaderPosition({
                    headerPosition: {
                        headerRowIndex: headerPosition.headerRowIndex,
                        column: columnToFocus
                    }
                });
            }
        }
    }
    blockMiddleClickScrollsIfNeeded(mouseEvent) {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        const { gridOptionsService } = this;
        const { which } = mouseEvent;
        if (gridOptionsService.get('suppressMiddleClickScrolls') && which === 2) {
            mouseEvent.preventDefault();
        }
    }
};
__decorate([
    Autowired('focusService')
], MenuUtils.prototype, "focusService", void 0);
__decorate([
    Autowired('headerNavigationService')
], MenuUtils.prototype, "headerNavigationService", void 0);
__decorate([
    Autowired('columnModel')
], MenuUtils.prototype, "columnModel", void 0);
MenuUtils = __decorate([
    Bean('menuUtils')
], MenuUtils);
export { MenuUtils };
