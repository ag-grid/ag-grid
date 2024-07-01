import type { AgLabelParams, BeanCollection, DragService } from 'ag-grid-community';
import { AgAbstractLabel } from 'ag-grid-community';
export interface AgAngleSelectParams extends AgLabelParams {
    value?: number;
    onValueChange?: (value: number) => void;
}
export type AgAngleSelectEvent = 'fieldValueChanged';
export declare class AgAngleSelect extends AgAbstractLabel<AgAngleSelectParams, AgAngleSelectEvent> {
    protected dragService: DragService;
    wireBeans(beans: BeanCollection): void;
    protected readonly eLabel: HTMLElement;
    private readonly eParentCircle;
    private readonly eChildCircle;
    private readonly eAngleValue;
    private parentCircleRect;
    private degrees;
    private radius;
    private offsetX;
    private offsetY;
    private dragListener;
    constructor(config?: AgAngleSelectParams);
    postConstruct(): void;
    private updateNumberInput;
    private positionChildCircle;
    private calculatePolar;
    private calculateCartesian;
    private setOffsetX;
    private setOffsetY;
    private calculateAngleDrag;
    private toDegrees;
    private toRadians;
    private normalizeNegativeValue;
    private normalizeAngle180;
    getRadius(): number;
    setRadius(r: number): this;
    onValueChange(callbackFn: (newValue: number) => void): this;
    getValue(radians?: boolean): number;
    setValue(degrees: number, radians?: boolean, silent?: boolean): this;
    setWidth(width: number): this;
    setDisabled(disabled: boolean): this;
    destroy(): void;
}
