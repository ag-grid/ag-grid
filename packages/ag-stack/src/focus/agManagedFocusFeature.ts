import { KeyCode } from '../constants/keyCode';
import { AgAbstractBean } from '../core/agAbstractBean';
import type { AgBeanCollection } from '../interfaces/agBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _addManagedElementListeners } from '../utils/event';
import { FOCUS_MANAGED_CLASS, _findNextFocusableElement } from '../utils/focus';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ManagedFocusCallbacks {
    shouldStopEventPropagation?: (e: KeyboardEvent) => boolean;
    onTabKeyDown?: (e: KeyboardEvent) => void;
    handleKeyDown?: (e: KeyboardEvent) => void;
    onFocusIn?: (e: FocusEvent) => void;
    onFocusOut?: (e: FocusEvent) => void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface StopPropagationCallbacks {
    isStopPropagation: (e: Event) => boolean;
    stopPropagation: (e: Event) => void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgManagedFocusFeature<
    TBeanCollection extends AgBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties>,
> extends AgAbstractBean<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
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

                const nextRoot = _findNextFocusableElement({
                    beans: this.beans,
                    rootNode: this.eFocusable,
                    backwards: e.shiftKey,
                });

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
            _addManagedElementListeners(this, eFocusable, { focusin: onFocusIn });
        }

        if (onFocusOut) {
            _addManagedElementListeners(this, eFocusable, { focusout: onFocusOut });
        }
    }

    private addKeyDownListeners(eGui: HTMLElement): void {
        _addManagedElementListeners(this, eGui, {
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
