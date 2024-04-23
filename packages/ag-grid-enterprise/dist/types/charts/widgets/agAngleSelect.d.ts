import { DragService, AgAbstractLabel, AgLabelParams } from "ag-grid-community";
export interface AgAngleSelectParams extends AgLabelParams {
    value?: number;
    onValueChange?: (value: number) => void;
}
export declare class AgAngleSelect extends AgAbstractLabel<AgAngleSelectParams> {
    private static TEMPLATE;
    protected readonly eLabel: HTMLElement;
    private readonly eParentCircle;
    private readonly eChildCircle;
    private readonly eAngleValue;
    protected readonly dragService: DragService;
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
    protected destroy(): void;
}
