import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class AgHorizontalResize extends Component {
    private horizontalResizeService;
    wireBeans(beans: BeanCollection): void;
    private startingWidth;
    private elementToResize;
    private inverted;
    private minWidth;
    private maxWidth;
    constructor();
    setElementToResize(elementToResize: HTMLElement): void;
    postConstruct(): void;
    private dispatchResizeEvent;
    private onResizeStart;
    private onResizeEnd;
    private onResizing;
    setInverted(inverted: boolean): void;
    setMaxWidth(value: number | null): void;
    setMinWidth(value: number | null): void;
}
