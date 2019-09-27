// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
import { PopupService } from "./popupService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
export interface PanelOptions {
    component?: Component;
    hideTitleBar?: boolean;
    closable?: boolean;
    title?: string;
    minWidth?: number;
    width?: number | string;
    minHeight?: number;
    height?: number | string;
    centered?: boolean;
    x?: number;
    y?: number;
}
export declare class AgPanel extends Component {
    private static TEMPLATE;
    protected static CLOSE_BTN_TEMPLATE: string;
    protected popupService: PopupService;
    protected gridOptionsWrapper: GridOptionsWrapper;
    protected closable: boolean;
    protected config: PanelOptions | undefined;
    protected closeButtonComp: Component;
    protected popupParent: HTMLElement;
    protected minWidth: number;
    protected minHeight?: number;
    protected positioned: boolean;
    protected dragStartPosition: {
        x: number;
        y: number;
    };
    protected position: {
        x: number;
        y: number;
    };
    protected size: {
        width: number | undefined;
        height: number | undefined;
    };
    close: () => void;
    protected eContentWrapper: HTMLElement;
    protected eTitleBar: HTMLElement;
    protected eTitleBarButtons: HTMLElement;
    protected eTitle: HTMLElement;
    constructor(config?: PanelOptions);
    protected postConstruct(): void;
    protected renderComponent(): void;
    protected updateDragStartPosition(x: number, y: number): void;
    protected calculateMouseMovement(params: {
        e: MouseEvent;
        topBuffer?: number;
        anywhereWithin?: boolean;
        isLeft?: boolean;
        isTop?: boolean;
    }): {
        movementX: number;
        movementY: number;
    };
    private refreshSize;
    protected offsetElement(x?: number, y?: number): void;
    getHeight(): number;
    setHeight(height: number | string): void;
    getWidth(): number;
    setWidth(width: number | string): void;
    center(): void;
    setClosable(closable: boolean): void;
    setBodyComponent(bodyComponent: Component): void;
    addTitleBarButton(button: Component, position?: number): void;
    getBodyHeight(): number;
    getBodyWidth(): number;
    setTitle(title: string): void;
    private onBtClose;
    destroy(): void;
}
