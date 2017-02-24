/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v8.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var utils_1 = require("../../utils");
var column_1 = require("../../entities/column");
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var columnAnimationService_1 = require("../columnAnimationService");
var SetLeftFeature = (function (_super) {
    __extends(SetLeftFeature, _super);
    function SetLeftFeature(columnOrGroup, eCell) {
        var _this = _super.call(this) || this;
        _this.columnOrGroup = columnOrGroup;
        _this.eCell = eCell;
        return _this;
    }
    SetLeftFeature.prototype.init = function () {
        this.addDestroyableEventListener(this.columnOrGroup, column_1.Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.setLeftFirstTime();
    };
    SetLeftFeature.prototype.setLeftFirstTime = function () {
        var suppressMoveAnimation = this.gridOptionsWrapper.isSuppressColumnMoveAnimation();
        var oldLeftExists = utils_1.Utils.exists(this.columnOrGroup.getOldLeft());
        var animateColumnMove = this.columnAnimationService.isActive() && oldLeftExists && !suppressMoveAnimation;
        if (animateColumnMove) {
            this.animateInLeft();
        }
        else {
            this.onLeftChanged();
        }
    };
    SetLeftFeature.prototype.animateInLeft = function () {
        var _this = this;
        var left = this.columnOrGroup.getLeft();
        var oldLeft = this.columnOrGroup.getOldLeft();
        this.setLeft(oldLeft);
        this.columnAnimationService.executeNextVMTurn(function () {
            _this.setLeft(left);
        });
    };
    SetLeftFeature.prototype.onLeftChanged = function () {
        this.setLeft(this.columnOrGroup.getLeft());
    };
    SetLeftFeature.prototype.setLeft = function (value) {
        // if the value is null, then that means the column is no longer
        // displayed. there is logic in the rendering to fade these columns
        // out, so we don't try and change their left positions.
        if (utils_1.Utils.exists(value)) {
            this.eCell.style.left = value + 'px';
        }
    };
    return SetLeftFeature;
}(beanStub_1.BeanStub));
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], SetLeftFeature.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('columnAnimationService'),
    __metadata("design:type", columnAnimationService_1.ColumnAnimationService)
], SetLeftFeature.prototype, "columnAnimationService", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SetLeftFeature.prototype, "init", null);
exports.SetLeftFeature = SetLeftFeature;
