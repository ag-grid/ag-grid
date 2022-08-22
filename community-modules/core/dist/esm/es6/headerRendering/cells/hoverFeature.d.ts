// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
export declare class HoverFeature extends BeanStub {
    private columnHoverService;
    private readonly columns;
    private element;
    constructor(columns: Column[], element: HTMLElement);
    private postConstruct;
    private addMouseHoverListeners;
    private onMouseOut;
    private onMouseOver;
}
