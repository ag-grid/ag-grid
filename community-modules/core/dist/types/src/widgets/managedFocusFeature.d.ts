import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
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
    private focusService;
    wireBeans(beans: BeanCollection): void;
    static FOCUS_MANAGED_CLASS: string;
    constructor(eFocusableElement: HTMLElement, callbacks?: ManagedFocusCallbacks);
    postConstruct(): void;
    private addKeyDownListeners;
}
