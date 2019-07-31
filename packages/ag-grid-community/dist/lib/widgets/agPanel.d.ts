// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
export interface PanelOptions {
    component?: Component;
    hideTitleBar?: boolean;
    closable?: boolean;
    title?: string;
    minWidth?: number;
    width?: number | string;
    minHeight?: number;
    height?: number | string;
}
declare const AgPanel_base: {
    new (...args: any[]): {
        [x: string]: any;
        popupService: import("./popupService").PopupService;
        gridOptionsWrapper: import("../gridOptionsWrapper").GridOptionsWrapper;
        renderComponent?(): void;
        config: any;
        popupParent: HTMLElement;
        minWidth: number;
        minHeight?: number;
        positioned: boolean;
        dragStartPosition: {
            x: number;
            y: number;
        };
        position: {
            x: number;
            y: number;
        };
        size: {
            width: number;
            height: number;
        };
        postConstruct(): void;
        updateDragStartPosition(x: number, y: number): void;
        calculateMouseMovement(params: {
            e: MouseEvent;
            topBuffer?: number;
            anywhereWithin?: boolean;
            isLeft?: boolean;
            isTop?: boolean;
        }): {
            movementX: number;
            movementY: number;
        };
        refreshSize(): void;
        offsetElement(x?: number, y?: number): void;
        getHeight(): number;
        setHeight(height: string | number): void;
        getWidth(): number;
        setWidth(width: string | number): void;
        center(): void;
    };
} & typeof Component;
export declare class AgPanel extends AgPanel_base {
    private static TEMPLATE;
    protected static CLOSE_BTN_TEMPLATE: string;
    protected closable: boolean;
    config: PanelOptions | undefined;
    protected eContentWrapper: HTMLElement;
    protected eTitleBar: HTMLElement;
    protected eTitleBarButtons: HTMLElement;
    protected eTitle: HTMLElement;
    private closeButtonComp;
    close: () => void;
    constructor(config?: PanelOptions);
    postConstruct(): void;
    renderComponent(): void;
    setClosable(closable: boolean): void;
    setBodyComponent(bodyComponent: Component): void;
    addTitleBarButton(button: Component, position?: number): void;
    getBodyHeight(): number;
    getBodyWidth(): number;
    setTitle(title: string): void;
    private onBtClose;
    destroy(): void;
}
export {};
