var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { Autowired, Bean, BeanStub, _ } from "@ag-grid-community/core";
var MenuUtils = /** @class */ (function (_super) {
    __extends(MenuUtils, _super);
    function MenuUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuUtils.prototype.restoreFocusOnClose = function (restoreFocusParams, eComp, e, restoreIfMouseEvent) {
        var eventSource = restoreFocusParams.eventSource;
        var isKeyboardEvent = e instanceof KeyboardEvent;
        if ((!restoreIfMouseEvent && !isKeyboardEvent) || !eventSource) {
            return;
        }
        var eDocument = this.gridOptionsService.getDocument();
        if (!eComp.contains(eDocument.activeElement) && eDocument.activeElement !== eDocument.body) {
            // something else has focus, so don't return focus to the header
            return;
        }
        this.focusHeaderCell(restoreFocusParams);
    };
    MenuUtils.prototype.closePopupAndRestoreFocusOnSelect = function (hidePopupFunc, restoreFocusParams, event) {
        var keyboardEvent;
        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }
        hidePopupFunc(keyboardEvent && { keyboardEvent: keyboardEvent });
        // this method only gets called when the menu was closed by selecting an option
        // in this case we focus the cell that was previously focused, otherwise the header
        var focusedCell = this.focusService.getFocusedCell();
        var eDocument = this.gridOptionsService.getDocument();
        if (eDocument.activeElement === eDocument.body) {
            if (focusedCell) {
                var rowIndex = focusedCell.rowIndex, rowPinned = focusedCell.rowPinned, column = focusedCell.column;
                this.focusService.setFocusedCell({ rowIndex: rowIndex, column: column, rowPinned: rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
            }
            else {
                this.focusHeaderCell(restoreFocusParams);
            }
        }
    };
    MenuUtils.prototype.onContextMenu = function (mouseEvent, touchEvent, showMenuCallback) {
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
        var eventOrTouch = mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : touchEvent.touches[0];
        if (showMenuCallback(eventOrTouch)) {
            var event_1 = mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : touchEvent;
            event_1.preventDefault();
        }
    };
    MenuUtils.prototype.focusHeaderCell = function (restoreFocusParams) {
        var column = restoreFocusParams.column, columnIndex = restoreFocusParams.columnIndex, headerPosition = restoreFocusParams.headerPosition, eventSource = restoreFocusParams.eventSource;
        var isColumnStillVisible = this.columnModel.getAllDisplayedColumns().some(function (col) { return col === column; });
        if (isColumnStillVisible && eventSource && _.isVisible(eventSource)) {
            var focusableEl = this.focusService.findTabbableParent(eventSource);
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
            var allColumns = this.columnModel.getAllDisplayedColumns();
            var columnToFocus = allColumns[columnIndex] || _.last(allColumns);
            if (columnToFocus) {
                this.focusService.focusHeaderPosition({
                    headerPosition: {
                        headerRowIndex: headerPosition.headerRowIndex,
                        column: columnToFocus
                    }
                });
            }
        }
    };
    MenuUtils.prototype.blockMiddleClickScrollsIfNeeded = function (mouseEvent) {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        var gridOptionsService = this.gridOptionsService;
        var which = mouseEvent.which;
        if (gridOptionsService.get('suppressMiddleClickScrolls') && which === 2) {
            mouseEvent.preventDefault();
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
    return MenuUtils;
}(BeanStub));
export { MenuUtils };
