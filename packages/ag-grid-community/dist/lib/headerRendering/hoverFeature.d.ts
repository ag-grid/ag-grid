// Type definitions for ag-grid-community v20.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class HoverFeature extends BeanStub {
    private columnHoverService;
    private readonly columns;
    constructor(columns: Column[], element: HTMLElement);
    private addMouseHoverListeners;
    private onMouseOut;
    private onMouseOver;
}
