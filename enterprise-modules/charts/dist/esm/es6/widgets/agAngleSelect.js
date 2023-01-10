var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgAbstractField, Autowired, AgAbstractLabel, RefSelector, _ } from "@ag-grid-community/core";
export class AgAngleSelect extends AgAbstractLabel {
    constructor(config) {
        super(config, AgAngleSelect.TEMPLATE);
        this.radius = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    postConstruct() {
        super.postConstruct();
        this.dragListener = {
            eElement: this.eParentCircle,
            dragStartPixels: 0,
            onDragStart: (e) => {
                this.parentCircleRect = this.eParentCircle.getBoundingClientRect();
            },
            onDragging: (e) => this.calculateAngleDrag(e),
            onDragStop: () => { }
        };
        this.dragService.addDragSource(this.dragListener);
        this.eAngleValue
            .setLabel('')
            .setLabelWidth(5)
            .setInputWidth(45)
            .setMin(0)
            .setMax(360)
            .setValue(`${this.degrees}`)
            .onValueChange((value) => {
            if (value == null || value === '') {
                value = '0';
            }
            value = this.eAngleValue.normalizeValue(value);
            let floatValue = parseFloat(value);
            if (floatValue > 180) {
                floatValue = floatValue - 360;
            }
            this.setValue(floatValue);
        });
        this.updateNumberInput();
        if (_.exists(this.getValue())) {
            this.eAngleValue.setValue(this.normalizeNegativeValue(this.getValue()).toString());
        }
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, () => {
            const eDocument = this.gridOptionsService.getDocument();
            if (this.eAngleValue.getInputElement().contains(eDocument.activeElement)) {
                return;
            }
            this.updateNumberInput();
        });
    }
    updateNumberInput() {
        const normalizedValue = this.normalizeNegativeValue(this.getValue());
        this.eAngleValue.setValue(normalizedValue.toString());
    }
    positionChildCircle(radians) {
        const rect = this.parentCircleRect || { width: 24, height: 24 };
        const eChildCircle = this.eChildCircle;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        eChildCircle.style.left = `${centerX + Math.cos(radians) * 8}px`;
        eChildCircle.style.top = `${centerY + Math.sin(radians) * 8}px`;
    }
    calculatePolar() {
        const x = this.offsetX;
        const y = this.offsetY;
        const radians = Math.atan2(y, x);
        this.degrees = this.toDegrees(radians);
        this.radius = Math.sqrt((x * x) + (y * y));
        this.positionChildCircle(radians);
    }
    calculateCartesian() {
        const radians = this.toRadians(this.getValue());
        const radius = this.getRadius();
        this
            .setOffsetX(Math.cos(radians) * radius)
            .setOffsetY(Math.sin(radians) * radius);
    }
    setOffsetX(offset) {
        if (this.offsetX !== offset) {
            this.offsetX = offset;
            this.calculatePolar();
        }
        return this;
    }
    setOffsetY(offset) {
        if (this.offsetY !== offset) {
            this.offsetY = offset;
            this.calculatePolar();
        }
        return this;
    }
    calculateAngleDrag(e) {
        const rect = this.parentCircleRect;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - centerX;
        const dy = y - centerY;
        const radians = Math.atan2(dy, dx);
        this.setValue(radians, true);
    }
    toDegrees(radians) {
        return radians / Math.PI * 180;
    }
    toRadians(degrees) {
        return degrees / 180 * Math.PI;
    }
    normalizeNegativeValue(degrees) {
        return degrees < 0 ? 360 + degrees : degrees;
    }
    normalizeAngle180(radians) {
        radians %= Math.PI * 2;
        if (radians < -Math.PI) {
            radians += Math.PI * 2;
        }
        else if (radians >= Math.PI) {
            radians -= Math.PI * 2;
        }
        return radians;
    }
    getRadius() {
        return this.radius;
    }
    setRadius(r) {
        if (this.radius === r) {
            return this;
        }
        this.radius = r;
        this.calculateCartesian();
        return this;
    }
    onValueChange(callbackFn) {
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, () => {
            callbackFn(this.degrees);
        });
        return this;
    }
    getValue(radians) {
        return radians ? this.toRadians(this.degrees) : this.degrees;
    }
    setValue(degrees, radians) {
        let radiansValue;
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
    }
    setWidth(width) {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }
    setDisabled(disabled) {
        super.setDisabled(disabled);
        this.eAngleValue.setDisabled(disabled);
        return this;
    }
    destroy() {
        this.dragService.removeDragSource(this.dragListener);
        super.destroy();
    }
}
AgAngleSelect.TEMPLATE = `<div class="ag-angle-select">
            <div ref="eLabel"></div>
            <div class="ag-wrapper ag-angle-select-wrapper">
                <div ref="eAngleSelectField" class="ag-angle-select-field">
                    <div ref="eParentCircle" class="ag-angle-select-parent-circle">
                        <div ref="eChildCircle" class="ag-angle-select-child-circle"></div>
                    </div>
                </div>
                <ag-input-number-field ref="eAngleValue"></ag-input-number-field>
            </div>
        </div>`;
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
