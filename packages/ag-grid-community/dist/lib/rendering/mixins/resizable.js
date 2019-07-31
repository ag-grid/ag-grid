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
var context_1 = require("../../context/context");
var dragService_1 = require("../../dragAndDrop/dragService");
function Resizable(target) {
    var MixinClass = /** @class */ (function (_super) {
        __extends(MixinClass, _super);
        function MixinClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.RESIZE_TEMPLATE = "\n            <div class=\"ag-resizer-wrapper\">\n                <div ref=\"eTopLeftResizer\" class=\"ag-resizer ag-resizer-topLeft\"></div>\n                <div ref=\"eTopResizer\" class=\"ag-resizer ag-resizer-top\"></div>\n                <div ref=\"eTopRightResizer\" class=\"ag-resizer ag-resizer-topRight\"></div>\n                <div ref=\"eRightResizer\" class=\"ag-resizer ag-resizer-right\"></div>\n                <div ref=\"eBottomRightResizer\" class=\"ag-resizer ag-resizer-bottomRight\"></div>\n                <div ref=\"eBottomResizer\" class=\"ag-resizer ag-resizer-bottom\"></div>\n                <div ref=\"eBottomLeftResizer\" class=\"ag-resizer ag-resizer-bottomLeft\"></div>\n                <div ref=\"eLeftResizer\" class=\"ag-resizer ag-resizer-left\"></div>\n            </div>\n        ";
            _this.resizable = {};
            _this.isResizable = false;
            _this.isResizing = false;
            _this.lastPosition = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            return _this;
        }
        MixinClass.prototype.postConstruct = function () {
            _super.prototype.postConstruct.call(this);
            var resizable = this.config.resizable;
            this.addResizers();
            if (resizable) {
                this.setResizable(resizable);
            }
        };
        MixinClass.prototype.addResizers = function () {
            var eGui = this.getGui();
            if (!eGui) {
                return;
            }
            var parser = new DOMParser();
            var resizers = parser.parseFromString(this.RESIZE_TEMPLATE, 'text/html').body;
            eGui.appendChild(resizers.firstChild);
            this.createMap();
        };
        MixinClass.prototype.createMap = function () {
            var eGui = this.getGui();
            this.resizerMap = {
                topLeft: { element: eGui.querySelector('[ref=eTopLeftResizer]') },
                top: { element: eGui.querySelector('[ref=eTopResizer]') },
                topRight: { element: eGui.querySelector('[ref=eTopRightResizer]') },
                right: { element: eGui.querySelector('[ref=eRightResizer]') },
                bottomRight: { element: eGui.querySelector('[ref=eBottomRightResizer]') },
                bottom: { element: eGui.querySelector('[ref=eBottomResizer]') },
                bottomLeft: { element: eGui.querySelector('[ref=eBottomLeftResizer]') },
                left: { element: eGui.querySelector('[ref=eLeftResizer]') }
            };
        };
        MixinClass.prototype.getResizerElement = function (side) {
            return this.resizerMap[side].element;
        };
        MixinClass.prototype.onResizeStart = function (e) {
            this.isResizing = true;
            this.updateDragStartPosition(e.clientX, e.clientY);
        };
        MixinClass.prototype.onResize = function (e, side) {
            if (!this.isResizing) {
                return;
            }
            var isLeft = !!side.match(/left/i);
            var isRight = !!side.match(/right/i);
            var isTop = !!side.match(/top/i);
            var isBottom = !!side.match(/bottom/i);
            var isHorizontal = isLeft || isRight;
            var isVertical = isTop || isBottom;
            var _a = this.calculateMouseMovement({ e: e, isLeft: isLeft, isTop: isTop }), movementX = _a.movementX, movementY = _a.movementY;
            var offsetLeft = 0;
            var offsetTop = 0;
            if (isHorizontal && movementX) {
                var direction = isLeft ? -1 : 1;
                var oldWidth = this.getWidth();
                var newWidth = oldWidth + (movementX * direction);
                var skipWidth = false;
                if (isLeft) {
                    offsetLeft = oldWidth - newWidth;
                    if (this.position.x + offsetLeft <= 0 || newWidth <= this.minWidth) {
                        skipWidth = true;
                        offsetLeft = 0;
                    }
                }
                if (!skipWidth) {
                    this.setWidth(newWidth);
                }
            }
            if (isVertical && movementY) {
                var direction = isTop ? -1 : 1;
                var oldHeight = this.getHeight();
                var newHeight = oldHeight + (movementY * direction);
                var skipHeight = false;
                if (isTop) {
                    offsetTop = oldHeight - newHeight;
                    if (this.position.y + offsetTop <= 0 || newHeight <= this.minHeight) {
                        skipHeight = true;
                        offsetTop = 0;
                    }
                }
                if (!skipHeight) {
                    this.setHeight(newHeight);
                }
            }
            this.updateDragStartPosition(e.clientX, e.clientY);
            if (offsetLeft || offsetTop) {
                this.offsetElement(this.position.x + offsetLeft, this.position.y + offsetTop);
            }
        };
        MixinClass.prototype.onResizeEnd = function () {
            this.isResizing = false;
            var params = {
                type: 'resize',
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi()
            };
            if (this.localEventService) {
                this.localEventService.dispatchEvent(params);
            }
        };
        MixinClass.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.setResizable(false);
        };
        MixinClass.prototype.setResizable = function (resizable) {
            var _this = this;
            var isResizable = false;
            if (typeof resizable === 'boolean') {
                resizable = {
                    topLeft: resizable,
                    top: resizable,
                    topRight: resizable,
                    right: resizable,
                    bottomRight: resizable,
                    bottom: resizable,
                    bottomLeft: resizable,
                    left: resizable
                };
            }
            Object.keys(resizable).forEach(function (side) {
                var r = resizable;
                var s = side;
                var val = !!r[s];
                var el = _this.getResizerElement(s);
                var params = _this.resizerMap[s].dragSource || {
                    eElement: el,
                    onDragStart: _this.onResizeStart.bind(_this),
                    onDragging: function (e) { return _this.onResize(e, s); },
                    onDragStop: _this.onResizeEnd.bind(_this),
                };
                if (!!_this.resizable[s] !== val || (!_this.isAlive() && !val)) {
                    if (val) {
                        _this.dragService.addDragSource(params);
                        el.style.pointerEvents = 'all';
                        isResizable = true;
                    }
                    else {
                        _this.dragService.removeDragSource(params);
                        el.style.pointerEvents = 'none';
                    }
                    _this.resizerMap[s].dragSource = val ? params : undefined;
                }
            });
            this.isResizable = isResizable;
        };
        __decorate([
            context_1.Autowired('dragService'),
            __metadata("design:type", dragService_1.DragService)
        ], MixinClass.prototype, "dragService", void 0);
        return MixinClass;
    }(target));
    return MixinClass;
}
exports.Resizable = Resizable;
