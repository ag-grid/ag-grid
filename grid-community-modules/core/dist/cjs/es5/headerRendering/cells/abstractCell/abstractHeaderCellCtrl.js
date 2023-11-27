"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractHeaderCellCtrl = void 0;
var beanStub_1 = require("../../../context/beanStub");
var context_1 = require("../../../context/context");
var keyboard_1 = require("../../../utils/keyboard");
var keyCode_1 = require("../.././../constants/keyCode");
var direction_1 = require("../../../constants/direction");
var cssClassApplier_1 = require("../cssClassApplier");
var aria_1 = require("../../../utils/aria");
var eventKeys_1 = require("../../../eventKeys");
var instanceIdSequence = 0;
var AbstractHeaderCellCtrl = /** @class */ (function (_super) {
    __extends(AbstractHeaderCellCtrl, _super);
    function AbstractHeaderCellCtrl(columnGroupChild, parentRowCtrl) {
        var _this = _super.call(this) || this;
        _this.resizeToggleTimeout = 0;
        _this.resizeMultiplier = 1;
        _this.resizeFeature = null;
        _this.lastFocusEvent = null;
        _this.dragSource = null;
        _this.columnGroupChild = columnGroupChild;
        _this.parentRowCtrl = parentRowCtrl;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        _this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
        return _this;
    }
    AbstractHeaderCellCtrl.prototype.shouldStopEventPropagation = function (e) {
        var _a = this.focusService.getFocusedHeader(), headerRowIndex = _a.headerRowIndex, column = _a.column;
        return (0, keyboard_1.isUserSuppressingHeaderKeyboardEvent)(this.gridOptionsService, e, headerRowIndex, column);
    };
    AbstractHeaderCellCtrl.prototype.getWrapperHasFocus = function () {
        var eDocument = this.gridOptionsService.getDocument();
        var activeEl = eDocument.activeElement;
        return activeEl === this.eGui;
    };
    AbstractHeaderCellCtrl.prototype.setGui = function (eGui) {
        this.eGui = eGui;
        this.addDomData();
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.onDisplayedColumnsChanged();
    };
    AbstractHeaderCellCtrl.prototype.onDisplayedColumnsChanged = function () {
        if (!this.comp || !this.column) {
            return;
        }
        this.refreshFirstAndLastStyles();
        this.refreshAriaColIndex();
    };
    AbstractHeaderCellCtrl.prototype.refreshFirstAndLastStyles = function () {
        var _a = this, comp = _a.comp, column = _a.column, beans = _a.beans;
        cssClassApplier_1.CssClassApplier.refreshFirstAndLastStyles(comp, column, beans.columnModel);
    };
    AbstractHeaderCellCtrl.prototype.refreshAriaColIndex = function () {
        var _a = this, beans = _a.beans, column = _a.column;
        var colIdx = beans.columnModel.getAriaColumnIndex(column);
        (0, aria_1.setAriaColIndex)(this.eGui, colIdx); // for react, we don't use JSX, as it slowed down column moving
    };
    AbstractHeaderCellCtrl.prototype.addResizeAndMoveKeyboardListeners = function () {
        if (!this.resizeFeature) {
            return;
        }
        this.addManagedListener(this.eGui, 'keydown', this.onGuiKeyDown.bind(this));
        this.addManagedListener(this.eGui, 'keyup', this.onGuiKeyUp.bind(this));
    };
    AbstractHeaderCellCtrl.prototype.onGuiKeyDown = function (e) {
        var _a;
        var eDocument = this.gridOptionsService.getDocument();
        var activeEl = eDocument.activeElement;
        var isLeftOrRight = e.key === keyCode_1.KeyCode.LEFT || e.key === keyCode_1.KeyCode.RIGHT;
        if (this.isResizing) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
        if (
        // if elements within the header are focused, we don't process the event
        activeEl !== this.eGui ||
            // if shiftKey and altKey are not pressed, it's cell navigation so we don't process the event
            (!e.shiftKey && !e.altKey)) {
            return;
        }
        if (this.isResizing || isLeftOrRight) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
        if (!isLeftOrRight) {
            return;
        }
        var isLeft = (e.key === keyCode_1.KeyCode.LEFT) !== this.gridOptionsService.get('enableRtl');
        var direction = direction_1.HorizontalDirection[isLeft ? 'Left' : 'Right'];
        if (e.altKey) {
            this.isResizing = true;
            this.resizeMultiplier += 1;
            this.resizeHeader(direction, e.shiftKey);
            (_a = this.resizeFeature) === null || _a === void 0 ? void 0 : _a.toggleColumnResizing(true);
        }
        else {
            this.moveHeader(direction);
        }
    };
    AbstractHeaderCellCtrl.prototype.onGuiKeyUp = function () {
        var _this = this;
        if (!this.isResizing) {
            return;
        }
        if (this.resizeToggleTimeout) {
            window.clearTimeout(this.resizeToggleTimeout);
            this.resizeToggleTimeout = 0;
        }
        this.isResizing = false;
        this.resizeMultiplier = 1;
        this.resizeToggleTimeout = setTimeout(function () {
            var _a;
            (_a = _this.resizeFeature) === null || _a === void 0 ? void 0 : _a.toggleColumnResizing(false);
        }, 150);
    };
    AbstractHeaderCellCtrl.prototype.handleKeyDown = function (e) {
        var wrapperHasFocus = this.getWrapperHasFocus();
        switch (e.key) {
            case keyCode_1.KeyCode.PAGE_DOWN:
            case keyCode_1.KeyCode.PAGE_UP:
            case keyCode_1.KeyCode.PAGE_HOME:
            case keyCode_1.KeyCode.PAGE_END:
                if (wrapperHasFocus) {
                    e.preventDefault();
                }
        }
    };
    AbstractHeaderCellCtrl.prototype.addDomData = function () {
        var _this = this;
        var key = AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL;
        this.gridOptionsService.setDomData(this.eGui, key, this);
        this.addDestroyFunc(function () { return _this.gridOptionsService.setDomData(_this.eGui, key, null); });
    };
    AbstractHeaderCellCtrl.prototype.getGui = function () {
        return this.eGui;
    };
    AbstractHeaderCellCtrl.prototype.focus = function (event) {
        if (!this.eGui) {
            return false;
        }
        this.lastFocusEvent = event || null;
        this.eGui.focus();
        return true;
    };
    AbstractHeaderCellCtrl.prototype.getRowIndex = function () {
        return this.parentRowCtrl.getRowIndex();
    };
    AbstractHeaderCellCtrl.prototype.getParentRowCtrl = function () {
        return this.parentRowCtrl;
    };
    AbstractHeaderCellCtrl.prototype.getPinned = function () {
        return this.parentRowCtrl.getPinned();
    };
    AbstractHeaderCellCtrl.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    AbstractHeaderCellCtrl.prototype.getColumnGroupChild = function () {
        return this.columnGroupChild;
    };
    AbstractHeaderCellCtrl.prototype.removeDragSource = function () {
        if (this.dragSource) {
            this.dragAndDropService.removeDragSource(this.dragSource);
            this.dragSource = null;
        }
    };
    AbstractHeaderCellCtrl.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.removeDragSource();
        this.comp = null;
        this.column = null;
        this.resizeFeature = null;
        this.lastFocusEvent = null;
        this.columnGroupChild = null;
        this.parentRowCtrl = null;
        this.eGui = null;
    };
    AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL = 'headerCtrl';
    __decorate([
        (0, context_1.Autowired)('focusService')
    ], AbstractHeaderCellCtrl.prototype, "focusService", void 0);
    __decorate([
        (0, context_1.Autowired)('beans')
    ], AbstractHeaderCellCtrl.prototype, "beans", void 0);
    __decorate([
        (0, context_1.Autowired)('userComponentFactory')
    ], AbstractHeaderCellCtrl.prototype, "userComponentFactory", void 0);
    __decorate([
        (0, context_1.Autowired)('ctrlsService')
    ], AbstractHeaderCellCtrl.prototype, "ctrlsService", void 0);
    __decorate([
        (0, context_1.Autowired)('dragAndDropService')
    ], AbstractHeaderCellCtrl.prototype, "dragAndDropService", void 0);
    return AbstractHeaderCellCtrl;
}(beanStub_1.BeanStub));
exports.AbstractHeaderCellCtrl = AbstractHeaderCellCtrl;
