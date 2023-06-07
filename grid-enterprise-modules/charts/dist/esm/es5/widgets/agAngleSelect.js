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
import { AgAbstractField, Autowired, AgAbstractLabel, RefSelector, _ } from "@ag-grid-community/core";
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
        if (_.exists(this.getValue())) {
            this.eAngleValue.setValue(this.normalizeNegativeValue(this.getValue()).toString());
        }
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, function () {
            var eDocument = _this.gridOptionsService.getDocument();
            if (_this.eAngleValue.getInputElement().contains(eDocument.activeElement)) {
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
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, function () {
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
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }
        return this;
    };
    AgAngleSelect.prototype.setWidth = function (width) {
        _.setFixedWidth(this.getGui(), width);
        return this;
    };
    AgAngleSelect.prototype.setDisabled = function (disabled) {
        _super.prototype.setDisabled.call(this, disabled);
        this.eAngleValue.setDisabled(disabled);
        return this;
    };
    AgAngleSelect.prototype.destroy = function () {
        this.dragService.removeDragSource(this.dragListener);
        _super.prototype.destroy.call(this);
    };
    AgAngleSelect.TEMPLATE = "<div class=\"ag-angle-select\">\n            <div ref=\"eLabel\"></div>\n            <div class=\"ag-wrapper ag-angle-select-wrapper\">\n                <div ref=\"eAngleSelectField\" class=\"ag-angle-select-field\">\n                    <div ref=\"eParentCircle\" class=\"ag-angle-select-parent-circle\">\n                        <div ref=\"eChildCircle\" class=\"ag-angle-select-child-circle\"></div>\n                    </div>\n                </div>\n                <ag-input-number-field ref=\"eAngleValue\"></ag-input-number-field>\n            </div>\n        </div>";
    __decorate([
        RefSelector('eLabel')
    ], AgAngleSelect.prototype, "eLabel", void 0);
    __decorate([
        RefSelector('eParentCircle')
    ], AgAngleSelect.prototype, "eParentCircle", void 0);
    __decorate([
        RefSelector('eChildCircle')
    ], AgAngleSelect.prototype, "eChildCircle", void 0);
    __decorate([
        RefSelector('eAngleValue')
    ], AgAngleSelect.prototype, "eAngleValue", void 0);
    __decorate([
        Autowired('dragService')
    ], AgAngleSelect.prototype, "dragService", void 0);
    return AgAngleSelect;
}(AgAbstractLabel));
export { AgAngleSelect };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdBbmdsZVNlbGVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy93aWRnZXRzL2FnQW5nbGVTZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLGVBQWUsRUFBc0IsU0FBUyxFQUFlLGVBQWUsRUFBZ0MsV0FBVyxFQUFFLENBQUMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR3JLO0lBQW1DLGlDQUFlO0lBNkI5Qyx1QkFBWSxNQUFpQjtRQUE3QixZQUNJLGtCQUFNLE1BQU0sRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLFNBQ3hDO1FBUE8sWUFBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLGFBQU8sR0FBVyxDQUFDLENBQUM7O0lBSzVCLENBQUM7SUFFRCxxQ0FBYSxHQUFiO1FBQUEsaUJBK0NDO1FBOUNHLGlCQUFNLGFBQWEsV0FBRSxDQUFDO1FBRXRCLElBQUksQ0FBQyxZQUFZLEdBQUc7WUFDaEIsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQzVCLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLFdBQVcsRUFBRSxVQUFDLENBQXFCO2dCQUMvQixLQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3ZFLENBQUM7WUFDRCxVQUFVLEVBQUUsVUFBQyxDQUFxQixJQUFLLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQjtZQUNqRSxVQUFVLEVBQUUsY0FBUSxDQUFDO1NBQ3hCLENBQUM7UUFFRixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLFdBQVc7YUFDWCxRQUFRLENBQUMsRUFBRSxDQUFDO2FBQ1osYUFBYSxDQUFDLENBQUMsQ0FB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