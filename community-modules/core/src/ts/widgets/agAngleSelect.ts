import { AgAbstractLabel } from "./agAbstractLabel";
import { RefSelector } from "./componentAnnotations";
import { Autowired } from "../context/context";
import { DragService, DragListenerParams } from "../dragAndDrop/dragService";
import { AgInputNumberField } from "./agInputNumberField";
import { AgAbstractField } from "./agAbstractField";
import { _ } from "../utils";

export class AgAngleSelect extends AgAbstractLabel {

    private static TEMPLATE =
        `<div class="ag-angle-select">
            <label ref="eLabel"></label>
            <div class="ag-wrapper">
                <div ref="eAngleSelectField" class="ag-angle-select-field">
                    <div ref="eParentCircle" class="ag-parent-circle">
                        <div ref="eChildCircle" class="ag-child-circle"></div>
                    </div>
                </div>
                <ag-input-number-field ref="eAngleValue"></ag-input-number-field>
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eParentCircle') private eParentCircle: HTMLElement;
    @RefSelector('eChildCircle') private eChildCircle: HTMLElement;
    @RefSelector('eAngleValue') private eAngleValue: AgInputNumberField;

    @Autowired("dragService") protected dragService: DragService;

    private parentCircleRect: ClientRect | DOMRect;
    private degrees: number;
    private radius: number = 0;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private dragListener: DragListenerParams;

    constructor() {
        super(AgAngleSelect.TEMPLATE);
    }

    postConstruct() {
        super.postConstruct();

        this.dragListener = {
            eElement: this.eParentCircle,
            dragStartPixels: 0,
            onDragStart: (e: MouseEvent | Touch) => {
                this.parentCircleRect = this.eParentCircle.getBoundingClientRect();
            },
            onDragging: (e: MouseEvent | Touch) => this.calculateAngleDrag(e),
            onDragStop: () => {}
        };

        this.dragService.addDragSource(this.dragListener);

        this.eAngleValue
            .setLabel('')
            .setLabelWidth(5)
            .setInputWidth(45)
            .setMin(0)
            .setMax(360)
            .setValue(`${this.degrees}`)
            .onValueChange((value: string) => {
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

        this.addDestroyableEventListener(this, AgAbstractField.EVENT_CHANGED, () => {
            if (this.eAngleValue.getInputElement().contains(document.activeElement)) {
                return;
            }
            this.updateNumberInput();
        });
    }

    private updateNumberInput(): void {
        const normalizedValue = this.normalizeNegativeValue(this.getValue());
        this.eAngleValue.setValue(normalizedValue.toString());
    }

    private positionChildCircle(radians: number) {
        const rect = this.parentCircleRect || { width: 24, height: 24 };
        const eChildCircle = this.eChildCircle;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        eChildCircle.style.left = `${centerX + Math.cos(radians) * 8}px`;
        eChildCircle.style.top = `${centerY + Math.sin(radians) * 8}px`;
    }

    private calculatePolar() {
        const x = this.offsetX;
        const y = this.offsetY;

        const radians = Math.atan2(y, x);
        this.degrees = this.toDegrees(radians);
        this.radius = Math.sqrt((x * x) + (y * y));

        this.positionChildCircle(radians);
    }

    private calculateCartesian() {
        const radians = this.toRadians(this.getValue());
        const radius = this.getRadius();

        this
            .setOffsetX(Math.cos(radians) * radius)
            .setOffsetY(Math.sin(radians) * radius);
    }

    private setOffsetX(offset: number): this {
        if (this.offsetX !== offset) {
            this.offsetX = offset;
            this.calculatePolar();
        }

        return this;
    }

    private setOffsetY(offset: number): this {
        if (this.offsetY !== offset) {
            this.offsetY = offset;
            this.calculatePolar();
        }
        return this;
    }

    private calculateAngleDrag(e: MouseEvent | Touch) {
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

    private toDegrees(radians: number): number {
        return radians / Math.PI * 180;
    }

    private toRadians(degrees: number): number {
        return degrees / 180 * Math.PI;
    }

    private normalizeNegativeValue(degrees: number): number {
        return degrees < 0 ? 360 + degrees : degrees;
    }

    private normalizeAngle180(radians: number): number {
        radians %= Math.PI * 2;

        if (radians < -Math.PI) {
            radians += Math.PI * 2;
        } else if (radians >= Math.PI) {
            radians -= Math.PI * 2;
        }

        return radians;
    }

    public getRadius(): number {
        return this.radius;
    }

    public setRadius(r: number): this {
        if (this.radius === r) { return this; }
        this.radius = r;
        this.calculateCartesian();

        return this;
    }

    public onValueChange(callbackFn: (newValue: number) => void): this {
        this.addDestroyableEventListener(this, AgAbstractField.EVENT_CHANGED, () => {
            callbackFn(this.degrees);
        });
        return this;
    }

    public getValue(radians?: boolean): number {
        return radians ? this.toRadians(this.degrees) : this.degrees;
    }

    public setValue(degrees: number, radians?: boolean): this {
        let radiansValue: number;
        if (!radians) {
            radiansValue = this.normalizeAngle180(this.toRadians(degrees));
        } else {
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

    public setWidth(width: number): this {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }

    destroy() {
        super.destroy();
        this.dragService.removeDragSource(this.dragListener);
    }
}