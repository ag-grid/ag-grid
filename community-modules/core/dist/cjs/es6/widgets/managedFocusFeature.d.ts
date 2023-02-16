// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from '../context/beanStub';
export interface ManagedFocusCallbacks {
    shouldStopEventPropagation?: (e: KeyboardEvent) => boolean;
    onTabKeyDown?: (e: KeyboardEvent) => void;
    handleKeyDown?: (e: KeyboardEvent) => void;
    onFocusIn?: (e: FocusEvent) => void;
    onFocusOut?: (e: FocusEvent) => void;
}
export declare class ManagedFocusFeature extends BeanStub {
    private readonly eFocusableElement;
    private callbacks;
    static FOCUS_MANAGED_CLASS: string;
    private readonly focusService;
    constructor(eFocusableElement: HTMLElement, callbacks?: ManagedFocusCallbacks);
    protected postConstruct(): void;
    private addKeyDownListeners;
}
