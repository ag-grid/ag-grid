import type { BeanCollection, FocusableContainer, ResizableStructure } from 'ag-grid-community';
import type { PanelOptions } from './agPanel';
import { AgPanel } from './agPanel';
export type ResizableSides = 'topLeft' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left';
export interface DialogOptions extends PanelOptions {
    eWrapper?: HTMLElement;
    modal?: boolean;
    movable?: boolean;
    alwaysOnTop?: boolean;
    maximizable?: boolean;
    afterGuiAttached?: () => void;
    closedCallback?: (event?: MouseEvent | TouchEvent | KeyboardEvent) => void;
}
export declare class AgDialog extends AgPanel<DialogOptions> implements FocusableContainer {
    private popupService;
    private focusService;
    wireBeans(beans: BeanCollection): void;
    private tabGuardFeature;
    private isMaximizable;
    private isMaximized;
    private maximizeListeners;
    private maximizeButtonComp;
    private maximizeIcon;
    private minimizeIcon;
    private resizeListenerDestroy;
    private lastPosition;
    constructor(config: DialogOptions);
    postConstruct(): void;
    setAllowFocus(allowFocus: boolean): void;
    protected renderComponent(): void;
    private onClosed;
    private toggleMaximize;
    private refreshMaximizeIcon;
    private clearMaximizebleListeners;
    destroy(): void;
    setResizable(resizable: boolean | ResizableStructure): void;
    setMovable(movable: boolean): void;
    setMaximizable(maximizable: boolean): void;
    private buildMaximizeAndMinimizeElements;
}
