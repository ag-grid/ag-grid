import { KeyCode } from '../constants/keyCode';
import { AgBeanStub } from '../core/agBeanStub';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _findNextFocusableElement } from '../utils/focus';

export interface ManagedFocusCallbacks {
    shouldStopEventPropagation?: (e: KeyboardEvent) => boolean;
    onTabKeyDown?: (e: KeyboardEvent) => void;
    handleKeyDown?: (e: KeyboardEvent) => void;
    onFocusIn?: (e: FocusEvent) => void;
    onFocusOut?: (e: FocusEvent) => void;
}

export const FOCUS_MANAGED_CLASS = 'ag-focus-managed';

export interface StopPropagationCallbacks {
    isStopPropagation: (e: Event) => boolean;
    stopPropagation: (e: Event) => void;
}

export class AgManagedFocusFeature<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
> extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
    constructor(
        private readonly eFocusable: HTMLElement,
        private readonly stopPropagationCallbacks: StopPropagationCallbacks = {
            isStopPropagation: () => false,
            stopPropagation: () => {},
        },
        private readonly callbacks: ManagedFocusCallbacks = {}
    ) {
        super();
        this.callbacks = {
            shouldStopEventPropagation: () => false,
            onTabKeyDown: (e: KeyboardEvent) => {
                if (e.defaultPrevented) {
                    return;
                }

                const nextRoot = _findNextFocusableElement(this.beans, this.eFocusable, false, e.shiftKey);

                if (!nextRoot) {
                    return;
                }

                nextRoot.focus();
                e.preventDefault();
            },
            ...callbacks,
        };
    }

    public postConstruct(): void {
        const {
            eFocusable,
            callbacks: { onFocusIn, onFocusOut },
        } = this;
        eFocusable.classList.add(FOCUS_MANAGED_CLASS);

        this.addKeyDownListeners(eFocusable);

        if (onFocusIn) {
            this.addManagedElementListeners(eFocusable, { focusin: onFocusIn });
        }

        if (onFocusOut) {
            this.addManagedElementListeners(eFocusable, { focusout: onFocusOut });
        }
    }

    private addKeyDownListeners(eGui: HTMLElement): void {
        this.addManagedElementListeners(eGui, {
            keydown: (e: KeyboardEvent) => {
                if (e.defaultPrevented || this.stopPropagationCallbacks.isStopPropagation(e)) {
                    return;
                }

                const { callbacks } = this;

                if (callbacks.shouldStopEventPropagation!(e)) {
                    this.stopPropagationCallbacks.stopPropagation(e);
                    return;
                }

                if (e.key === KeyCode.TAB) {
                    callbacks.onTabKeyDown!(e);
                } else if (callbacks.handleKeyDown) {
                    callbacks.handleKeyDown(e);
                }
            },
        });
    }
}
