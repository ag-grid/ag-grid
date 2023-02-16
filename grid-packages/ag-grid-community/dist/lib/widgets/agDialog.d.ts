import { PanelOptions, AgPanel } from "./agPanel";
import { ResizableStructure } from "../rendering/features/positionableFeature";
export declare type ResizableSides = 'topLeft' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left';
export interface DialogOptions extends PanelOptions {
    eWrapper?: HTMLElement;
    modal?: boolean;
    movable?: boolean;
    alwaysOnTop?: boolean;
    maximizable?: boolean;
}
export declare class AgDialog extends AgPanel {
    private popupService;
    private isMaximizable;
    private isMaximized;
    private maximizeListeners;
    private maximizeButtonComp;
    private maximizeIcon;
    private minimizeIcon;
    private resizeListenerDestroy;
    private lastPosition;
    protected config: DialogOptions | undefined;
    constructor(config: DialogOptions);
    protected postConstruct(): void;
    protected renderComponent(): void;
    private toggleMaximize;
    private refreshMaximizeIcon;
    private clearMaximizebleListeners;
    protected destroy(): void;
    setResizable(resizable: boolean | ResizableStructure): void;
    setMovable(movable: boolean): void;
    setMaximizable(maximizable: boolean): void;
}
