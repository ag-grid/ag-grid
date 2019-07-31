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
var dragService_1 = require("../../dragAndDrop/dragService");
var context_1 = require("../../context/context");
function Movable(target) {
    var MixinClass = /** @class */ (function (_super) {
        __extends(MixinClass, _super);
        function MixinClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.movable = false;
            _this.isMoving = false;
            return _this;
        }
        MixinClass.prototype.postConstruct = function () {
            _super.prototype.postConstruct.call(this);
            var movable = this.config.movable;
            if (movable) {
                this.setMovable(movable);
            }
        };
        MixinClass.prototype.onMoveStart = function (e) {
            this.isMoving = true;
            this.updateDragStartPosition(e.clientX, e.clientY);
        };
        MixinClass.prototype.onMove = function (e) {
            if (!this.isMoving) {
                return;
            }
            var _a = this.position, x = _a.x, y = _a.y;
            var _b = this.calculateMouseMovement({
                e: e,
                isTop: true,
                anywhereWithin: true,
                topBuffer: this.getHeight() - this.getBodyHeight()
            }), movementX = _b.movementX, movementY = _b.movementY;
            this.offsetElement(x + movementX, y + movementY);
            this.updateDragStartPosition(e.clientX, e.clientY);
        };
        MixinClass.prototype.onMoveEnd = function () {
            this.isMoving = false;
        };
        MixinClass.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.setMovable(false);
        };
        MixinClass.prototype.setMovable = function (movable) {
            if (movable !== this.movable) {
                this.movable = movable;
                var params = this.moveElementDragListener || {
                    eElement: this.moveElement,
                    onDragStart: this.onMoveStart.bind(this),
                    onDragging: this.onMove.bind(this),
                    onDragStop: this.onMoveEnd.bind(this)
                };
                if (movable) {
                    this.dragService.addDragSource(params);
                    this.moveElementDragListener = params;
                }
                else {
                    this.dragService.removeDragSource(params);
                    this.moveElementDragListener = undefined;
                }
            }
        };
        __decorate([
            context_1.Autowired('dragService'),
            __metadata("design:type", dragService_1.DragService)
        ], MixinClass.prototype, "dragService", void 0);
        return MixinClass;
    }(target));
    return MixinClass;
}
exports.Movable = Movable;
