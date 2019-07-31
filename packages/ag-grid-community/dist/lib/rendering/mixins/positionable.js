/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var popupService_1 = require("../../widgets/popupService");
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var utils_1 = require("../../utils");
function Positionable(target) {
    var MixinClass = /** @class */ (function (_super) {
        __extends(MixinClass, _super);
        function MixinClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.positioned = false;
            _this.dragStartPosition = {
                x: 0,
                y: 0
            };
            _this.position = {
                x: 0,
                y: 0
            };
            _this.size = {
                width: undefined,
                height: undefined
            };
            return _this;
        }
        MixinClass.prototype.postConstruct = function () {
            if (this.positioned) {
                return;
            }
            var _a = this.config, minWidth = _a.minWidth, width = _a.width, minHeight = _a.minHeight, height = _a.height, centered = _a.centered, x = _a.x, y = _a.y;
            this.minHeight = minHeight != null ? minHeight : 250;
            this.minWidth = minWidth != null ? minWidth : 250;
            this.popupParent = this.popupService.getPopupParent();
            if (width) {
                this.setWidth(width);
            }
            if (height) {
                this.setHeight(height);
            }
            if (this.renderComponent) {
                this.renderComponent();
            }
            if (!width || !height) {
                this.refreshSize();
            }
            if (centered) {
                this.center();
            }
            else if (x || y) {
                this.offsetElement(x, y);
            }
            this.positioned = true;
        };
        MixinClass.prototype.updateDragStartPosition = function (x, y) {
            this.dragStartPosition = { x: x, y: y };
        };
        MixinClass.prototype.calculateMouseMovement = function (params) {
            var parentRect = this.popupParent.getBoundingClientRect();
            var e = params.e, isLeft = params.isLeft, isTop = params.isTop, anywhereWithin = params.anywhereWithin, topBuffer = params.topBuffer;
            var movementX = e.clientX - this.dragStartPosition.x;
            var movementY = e.clientY - this.dragStartPosition.y;
            var width = this.getWidth();
            var height = this.getHeight();
            // skip if cursor is outside of popupParent horizontally
            var skipX = (parentRect.left >= e.clientX && this.position.x <= 0 ||
                parentRect.right <= e.clientX && parentRect.right <= this.position.x + parentRect.left + width);
            if (!skipX) {
                if (isLeft) {
                    skipX = (
                    // skip if we are moving to the left and the cursor
                    // is positioned to the right of the left side anchor
                    (movementX < 0 && e.clientX > this.position.x + parentRect.left) ||
                        // skip if we are moving to the right and the cursor
                        // is positioned to the left of the dialog
                        (movementX > 0 && e.clientX < this.position.x + parentRect.left));
                }
                else {
                    if (anywhereWithin) {
                        // if anywhereWithin is true, we allow to move
                        // as long as the cursor is within the dialog
                        skipX = ((movementX < 0 && e.clientX > this.position.x + parentRect.left + width) ||
                            (movementX > 0 && e.clientX < this.position.x + parentRect.left));
                    }
                    else {
                        skipX = (
                        // if the movement is bound to the right side of the dialog
                        // we skip if we are moving to the left and the cursor
                        // is to the right of the dialog
                        (movementX < 0 && e.clientX > this.position.x + parentRect.left + width) ||
                            // or skip if we are moving to the right and the cursor
                            // is to the left of the right side anchor
                            (movementX > 0 && e.clientX < this.position.x + parentRect.left + width));
                    }
                }
            }
            movementX = skipX ? 0 : movementX;
            var skipY = (
            // skip if cursor is outside of popupParent vertically
            parentRect.top >= e.clientY && this.position.y <= 0 ||
                parentRect.bottom <= e.clientY && parentRect.bottom <= this.position.y + parentRect.top + height ||
                isTop && (
                // skip if we are moving to towards top and the cursor is
                // below the top anchor + topBuffer
                // note: topBuffer is used when moving the dialog using the title bar
                (movementY < 0 && e.clientY > this.position.y + parentRect.top + (topBuffer || 0)) ||
                    // skip if we are moving to the bottom and the cursor is
                    // above the top anchor
                    (movementY > 0 && e.clientY < this.position.y + parentRect.top)) ||
                // we are anchored to the bottom of the dialog
                !isTop && (
                // skip if we are moving towards the top and the cursor
                // is below the bottom anchor
                (movementY < 0 && e.clientY > this.position.y + parentRect.top + height) ||
                    // skip if we are moving towards the bottom and the cursor
                    // is above the bottom anchor
                    (movementY > 0 && e.clientY < this.position.y + parentRect.top + height)));
            movementY = skipY ? 0 : movementY;
            return { movementX: movementX, movementY: movementY };
        };
        MixinClass.prototype.refreshSize = function () {
            var _a = this.size, width = _a.width, height = _a.height;
            if (!width) {
                this.setWidth(this.getGui().offsetWidth);
            }
            if (!height) {
                this.setHeight(this.getGui().offsetHeight);
            }
        };
        MixinClass.prototype.offsetElement = function (x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            var ePopup = this.getGui();
            this.popupService.positionPopup({
                ePopup: ePopup,
                x: x,
                y: y,
                minWidth: this.minWidth,
                minHeight: this.minHeight,
                keepWithinBounds: true
            });
            this.position.x = parseInt(ePopup.style.left, 10);
            this.position.y = parseInt(ePopup.style.top, 10);
        };
        MixinClass.prototype.getHeight = function () {
            return this.size.height;
        };
        MixinClass.prototype.setHeight = function (height) {
            var eGui = this.getGui();
            var isPercent = false;
            if (typeof height === 'string' && height.indexOf('%') !== -1) {
                utils_1._.setFixedHeight(eGui, height);
                height = utils_1._.getAbsoluteHeight(eGui);
                isPercent = true;
            }
            else {
                height = Math.max(this.minHeight, height);
                var offsetParent = eGui.offsetParent;
                if (offsetParent && offsetParent.clientHeight && (height + this.position.y > offsetParent.clientHeight)) {
                    height = offsetParent.clientHeight - this.position.y;
                }
            }
            if (this.size.height === height) {
                return;
            }
            this.size.height = height;
            if (!isPercent) {
                utils_1._.setFixedHeight(eGui, height);
            }
        };
        MixinClass.prototype.getWidth = function () {
            return this.size.width;
        };
        MixinClass.prototype.setWidth = function (width) {
            var eGui = this.getGui();
            var isPercent = false;
            if (typeof width === 'string' && width.indexOf('%') !== -1) {
                utils_1._.setFixedWidth(eGui, width);
                width = utils_1._.getAbsoluteWidth(eGui);
                isPercent = true;
            }
            else {
                width = Math.max(this.minWidth, width);
                var offsetParent = eGui.offsetParent;
                if (offsetParent && offsetParent.clientWidth && (width + this.position.x > offsetParent.clientWidth)) {
                    width = offsetParent.clientWidth - this.position.x;
                }
            }
            if (this.size.width === width) {
                return;
            }
            this.size.width = width;
            if (!isPercent) {
                utils_1._.setFixedWidth(eGui, width);
            }
        };
        MixinClass.prototype.center = function () {
            var eGui = this.getGui();
            var x = (eGui.offsetParent.clientWidth / 2) - (this.getWidth() / 2);
            var y = (eGui.offsetParent.clientHeight / 2) - (this.getHeight() / 2);
            this.offsetElement(x, y);
        };
        __decorate([
            context_1.Autowired('popupService'),
            __metadata("design:type", popupService_1.PopupService)
        ], MixinClass.prototype, "popupService", void 0);
        __decorate([
            context_1.Autowired('gridOptionsWrapper'),
            __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
        ], MixinClass.prototype, "gridOptionsWrapper", void 0);
        return MixinClass;
    }(target));
    return MixinClass;
}
exports.Positionable = Positionable;
