import { AgLabel } from "./agLabel";
import { RefSelector } from "./componentAnnotations";
import { Autowired } from "../context/context";
import { DragService, DragListenerParams } from "../dragAndDrop/dragService";
import { _ } from "../utils";

export class AgAngleSelect extends AgLabel {

    private static TEMPLATE =
        `<div class="ag-angle-select">
            <label ref="eLabel"></label>
            <div class="ag-wrapper">
                <div ref="eAngleSelectField" class="ag-angle-select-field">
                    <div ref="eParentCircle" class="ag-parent-circle">
                        <div ref="eChildCircle" class="ag-child-circle"></div>
                    </div>
                </div>
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eParentCircle') private eParentCircle: HTMLElement;
    @RefSelector('eChildCircle') private eChildCircle: HTMLElement;

    @Autowired("dragService") protected dragService: DragService;

    private parentCircleRect: ClientRect | DOMRect;
    private degrees: number = 0;
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
            onDragStart: (e: MouseEvent | Touch) => {
                this.parentCircleRect = this.eParentCircle.getBoundingClientRect();
                this.calculateAngleDrag(e);
            },
            onDragging: (e: MouseEvent | Touch) => this.calculateAngleDrag(e),
            onDragStop: () => {}
        };

        this.dragService.addDragSource(this.dragListener);
    }

    private positionChildCircle(radians: number) {
        const rect = this.parentCircleRect;
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
        this.degrees = this.toDegrees(radians);

        this.dispatchEvent({ type: 'valueChange'});

        this.calculateCartesian();
        this.positionChildCircle(radians);
    }

    private toDegrees(radians: number): number {
        return radians / Math.PI * 180;
    }

    private toRadians(degrees: number): number {
        return degrees / 180 * Math.PI;
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

    public onAngleChange(callbackFn: (newValue: number) => void): this {
        this.addDestroyableEventListener(this, 'valueChange', () => {
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
            this.degrees = degrees;
            this.calculateCartesian();
            this.positionChildCircle(radiansValue);
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