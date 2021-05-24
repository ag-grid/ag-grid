/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var agAbstractLabel_1 = require("./agAbstractLabel");
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var agAbstractField_1 = require("./agAbstractField");
var generic_1 = require("../utils/generic");
var dom_1 = require("../utils/dom");
var AgAngleSelect = /** @class */ (function (_super) {
    __extends(AgAngleSelect, _super);
    function AgAngleSelect(config) {
        var _this = _super.call(this, config, AgAngleSelect.TEMPLATE) || this;
        _this.radius = 0;
        _this.offsetX = 0;
        _this.offsetY = 0;
        return _this;
    }
    AgAngleSelect.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.dragListener = {
            eElement: this.eParentCircle,
            dragStartPixels: 0,
            onDragStart: function (e) {
                _this.parentCircleRect = _this.eParentCircle.getBoundingClientRect();
            },
            onDragging: function (e) { return _this.calculateAngleDrag(e); },
            onDragStop: function () { }
        };
        this.dragService.addDragSource(this.dragListener);
        this.eAngleValue
            .setLabel('')
            .setLabelWidth(5)
            .setInputWidth(45)
            .setMin(0)
            .setMax(360)
            .setValue("" + this.degrees)
            .onValueChange(function (value) {
            if (value == null || value === '') {
                value = '0';
            }
            value = _this.eAngleValue.normalizeValue(value);
            var floatValue = parseFloat(value);
            if (floatValue > 180) {
                floatValue = floatValue - 360;
            }
            _this.setValue(floatValue);
        });
        this.updateNumberInput();
        if (generic_1.exists(this.getValue())) {
            this.eAngleValue.setValue(this.normalizeNegativeValue(this.getValue()).toString());
        }
        this.addManagedListener(this, agAbstractField_1.AgAbstractField.EVENT_CHANGED, function () {
            if (_this.eAngleValue.getInputElement().contains(document.activeElement)) {
                return;
            }
            _this.updateNumberInput();
        });
    };
    AgAngleSelect.prototype.updateNumberInput = function () {
        var normalizedValue = this.normalizeNegativeValue(this.getValue());
        this.eAngleValue.setValue(normalizedValue.toString());
    };
    AgAngleSelect.prototype.positionChildCircle = function (radians) {
        var rect = this.parentCircleRect || { width: 24, height: 24 };
        var eChildCircle = this.eChildCircle;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        eChildCircle.style.left = centerX + Math.cos(radians) * 8 + "px";
        eChildCircle.style.top = centerY + Math.sin(radians) * 8 + "px";
    };
    AgAngleSelect.prototype.calculatePolar = function () {
        var x = this.offsetX;
        var y = this.offsetY;
        var radians = Math.atan2(y, x);
        this.degrees = this.toDegrees(radians);
        this.radius = Math.sqrt((x * x) + (y * y));
        this.positionChildCircle(radians);
    };
    AgAngleSelect.prototype.calculateCartesian = function () {
        var radians = this.toRadians(this.getValue());
        var radius = this.getRadius();
        this
            .setOffsetX(Math.cos(radians) * radius)
            .setOffsetY(Math.sin(radians) * radius);
    };
    AgAngleSelect.prototype.setOffsetX = function (offset) {
        if (this.offsetX !== offset) {
            this.offsetX = offset;
            this.calculatePolar();
        }
        return this;
    };
    AgAngleSelect.prototype.setOffsetY = function (offset) {
        if (this.offsetY !== offset) {
            this.offsetY = offset;
            this.calculatePolar();
        }
        return this;
    };
    AgAngleSelect.prototype.calculateAngleDrag = function (e) {
        var rect = this.parentCircleRect;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var dx = x - centerX;
        var dy = y - centerY;
        var radians = Math.atan2(dy, dx);
        this.setValue(radians, true);
    };
    AgAngleSelect.prototype.toDegrees = function (radians) {
        return radians / Math.PI * 180;
    };
    AgAngleSelect.prototype.toRadians = function (degrees) {
        return degrees / 180 * Math.PI;
    };
    AgAngleSelect.prototype.normalizeNegativeValue = function (degrees) {
        return degrees < 0 ? 360 + degrees : degrees;
    };
    AgAngleSelect.prototype.normalizeAngle180 = function (radians) {
        radians %= Math.PI * 2;
        if (radians < -Math.PI) {
            radians += Math.PI * 2;
        }
        else if (radians >= Math.PI) {
            radians -= Math.PI * 2;
        }
        return radians;
    };
    AgAngleSelect.prototype.getRadius = function () {
        return this.radius;
    };
    AgAngleSelect.prototype.setRadius = function (r) {
        if (this.radius === r) {
            return this;
        }
        this.radius = r;
        this.calculateCartesian();
        return this;
    };
    AgAngleSelect.prototype.onValueChange = function (callbackFn) {
        var _this = this;
        this.addManagedListener(this, agAbstractField_1.AgAbstractField.EVENT_CHANGED, function () {
            callbackFn(_this.degrees);
        });
        return this;
    };
    AgAngleSelect.prototype.getValue = function (radians) {
        return radians ? this.toRadians(this.degrees) : this.degrees;
    };
    AgAngleSelect.prototype.setValue = function (degrees, radians) {
        var radiansValue;
        if (!radians) {
            radiansValue = this.normalizeAngle180(this.toRadians(degrees));
        }
        else {
            radiansValue = degrees;
        }
        degrees = this.toDegrees(radiansValue);
        if (this.degrees !== degrees) {
            this.degrees = Math.floor(degrees);
            this.calculateCartesian();
            this.positionChildCircle(radiansValue);
            this.dispatchEvent({ type: agAbstractField_1.AgAbstractField.EVENT_CHANGED });
        }
        return this;
    };
    AgAngleSelect.prototype.setWidth = function (width) {
        dom_1.setFixedWidth(this.getGui(), width);
        return this;
    };
    AgAngleSelect.prototype.destroy = function () {
        this.dragService.removeDragSource(this.dragListener);
        _super.prototype.destroy.call(this);
    };
    AgAngleSelect.TEMPLATE = "<div class=\"ag-angle-select\">\n            <div ref=\"eLabel\"></div>\n            <div class=\"ag-wrapper ag-angle-select-wrapper\">\n                <div ref=\"eAngleSelectField\" class=\"ag-angle-select-field\">\n                    <div ref=\"eParentCircle\" class=\"ag-angle-select-parent-circle\">\n                        <div ref=\"eChildCircle\" class=\"ag-angle-select-child-circle\"></div>\n                    </div>\n                </div>\n                <ag-input-number-field ref=\"eAngleValue\"></ag-input-number-field>\n            </div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('eLabel')
    ], AgAngleSelect.prototype, "eLabel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eParentCircle')
    ], AgAngleSelect.prototype, "eParentCircle", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eChildCircle')
    ], AgAngleSelect.prototype, "eChildCircle", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eAngleValue')
    ], AgAngleSelect.prototype, "eAngleValue", void 0);
    __decorate([
        context_1.Autowired('dragService')
    ], AgAngleSelect.prototype, "dragService", void 0);
    return AgAngleSelect;
}(agAbstractLabel_1.AgAbstractLabel));
exports.AgAngleSelect = AgAngleSelect;

//# sourceMappingURL=agAngleSelect.js.map
