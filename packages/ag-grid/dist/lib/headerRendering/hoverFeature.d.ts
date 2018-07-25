// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class HoverFeature extends BeanStub {
    private columnHoverService;
    private columns;
    constructor(columns: Column[], element: HTMLElement);
    private addMouseHoverListeners(element);
    private onMouseOut();
    private onMouseOver();
}
