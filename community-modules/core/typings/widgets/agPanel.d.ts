import { Component } from "./component";
import { PopupService } from "./popupService";
export interface PanelOptions {
    component?: Component | null;
    hideTitleBar?: boolean | null;
    closable?: boolean | null;
    title?: string | null;
    minWidth?: number | null;
    width?: number | string | null;
    minHeight?: number | null;
    height?: number | string | null;
    centered?: boolean | null;
    cssIdentifier?: string | null;
    x?: number | null;
    y?: number | null;
}
export declare class AgPanel extends Component {
    protected static CLOSE_BTN_TEMPLATE: string;
    protected readonly popupService: PopupService;
    protected closable: boolean;
    protected config: PanelOptions | undefined;
    protected closeButtonComp: Component | undefined;
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
    protected readonly eContentWrapper: HTMLElement;
    protected readonly eTitleBar: HTMLElement;
    protected readonly eTitleBarButtons: HTMLElement;
    protected readonly eTitle: HTMLElement;
    constructor(config?: PanelOptions);
    private static getTemplate;
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
    getHeight(): number | undefined;
    setHeight(height: number | string): void;
    getWidth(): number | undefined;
    setWidth(width: number | string): void;
    center(): void;
    setClosable(closable: boolean): void;
    setBodyComponent(bodyComponent: Component): void;
    addTitleBarButton(button: Component, position?: number): void;
    getBodyHeight(): number;
    getBodyWidth(): number;
    setTitle(title: string): void;
    private onBtClose;
    protected destroy(): void;
}
