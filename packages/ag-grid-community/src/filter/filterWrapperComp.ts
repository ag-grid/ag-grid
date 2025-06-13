import { KeyCode } from '../constants/keyCode';
import type { AgColumn } from '../entities/agColumn';
import type { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import type { IEventEmitter } from '../interfaces/iEventEmitter';
import type { FilterAction, FilterWrapperParams } from '../interfaces/iFilter';
import type { PopupEventParams } from '../interfaces/iPopup';
import { _removeFromParent } from '../utils/dom';
import { _jsonEquals } from '../utils/generic';
import { Component } from '../widgets/component';
import type {
    FilterActionEvent,
    FilterDisplayWrapper,
    FilterGlobalButtonsEvent,
    FilterParamsChangedEvent,
    FilterStateChangedEvent,
} from './columnFilterService';
import type { FilterButtonEvent } from './filterButtonComp';
import { FilterButtonComp } from './filterButtonComp';
import { isUseApplyButton } from './floating/provided/providedFilterUtils';

/** Used with filter handlers. This adds filter buttons. */
export class FilterWrapperComp extends Component {
    private eButtons?: FilterButtonComp;
    private params?: FilterWrapperParams;
    private hidePopup: ((params: PopupEventParams) => void) | null | undefined = null;
    private applyActive: boolean = false;

    constructor(
        private readonly column: AgColumn,
        private readonly wrapper: FilterDisplayWrapper,
        private readonly eventParent: IEventEmitter<
            'filterParamsChanged' | 'filterStateChanged' | 'filterAction' | 'filterGlobalButtons'
        >,
        private readonly updateModel: (column: AgColumn, action: FilterAction) => void,
        private isGlobalButtons: boolean,
        private readonly enableGlobalButtonCheck?: boolean
    ) {
        super();
    }

    public postConstruct(): void {
        const { comp, params: originalParams } = this.wrapper;
        const params = originalParams as FilterWrapperParams;
        const useForm = params.useForm;
        const tag = useForm ? 'form' : 'div';
        this.setTemplate({
            tag,
            cls: 'ag-filter-wrapper',
        });
        if (useForm) {
            this.addManagedElementListeners(this.getGui(), {
                submit: (e) => {
                    e?.preventDefault();
                },
                keydown: this.handleKeyDown.bind(this),
            });
        }
        this.appendChild(comp.getGui());
        this.params = params;
        this.resetButtonsPanel(params);
        this.addManagedListeners(this.eventParent, {
            filterParamsChanged: ({ column, params: eventParams }: FilterParamsChangedEvent) => {
                if (column === this.column) {
                    this.resetButtonsPanel(eventParams as FilterWrapperParams, this.params);
                }
            },
            filterStateChanged: ({ column, state }: FilterStateChangedEvent) => {
                if (column === this.column) {
                    this.eButtons?.updateValidity(state.valid);
                }
            },
            filterAction: ({ column, action, event: keyboardEvent }: FilterActionEvent) => {
                if (column === this.column) {
                    this.afterAction(action, keyboardEvent);
                }
            },
            ...(this.enableGlobalButtonCheck
                ? {
                      filterGlobalButtons: ({ isGlobal }: FilterGlobalButtonsEvent) => {
                          if (isGlobal !== this.isGlobalButtons) {
                              this.isGlobalButtons = isGlobal;
                              const currentParams = this.params;
                              this.resetButtonsPanel(currentParams!, currentParams, true);
                          }
                      },
                  }
                : undefined),
        });
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (params) {
            this.hidePopup = params.hidePopup;
        }
    }

    private resetButtonsPanel(
        newParams: FilterWrapperParams,
        oldParams?: FilterWrapperParams,
        forceUpdate?: boolean
    ): void {
        const { buttons: oldButtons, readOnly: oldReadOnly } = oldParams ?? {};
        const { buttons, readOnly, useForm } = newParams;
        if (!forceUpdate && oldReadOnly === readOnly && _jsonEquals(oldButtons, buttons)) {
            return;
        }

        const hasButtons = buttons && buttons.length > 0 && !newParams.readOnly && !this.isGlobalButtons;

        let eButtonsPanel = this.eButtons;
        if (hasButtons) {
            this.applyActive = isUseApplyButton(this.params!);
            if (!eButtonsPanel) {
                eButtonsPanel = this.createBean(new FilterButtonComp());
                this.appendChild(eButtonsPanel.getGui());
                const column = this.column;
                const getListener =
                    (action: FilterAction) =>
                    ({ event }: FilterButtonEvent) => {
                        this.updateModel(column, action);
                        this.afterAction(action, event);
                    };
                eButtonsPanel?.addManagedListeners(eButtonsPanel, {
                    apply: getListener('apply'),
                    clear: getListener('clear'),
                    reset: getListener('reset'),
                    cancel: getListener('cancel'),
                });
                this.eButtons = eButtonsPanel;
            }
            eButtonsPanel.updateButtons(buttons, useForm);
        } else {
            this.applyActive = false;
            if (eButtonsPanel) {
                _removeFromParent(eButtonsPanel.getGui());
                this.eButtons = this.destroyBean(eButtonsPanel);
            }
        }
    }

    private close(e?: Event): void {
        const hidePopup = this.hidePopup;
        if (!hidePopup) {
            return;
        }

        const keyboardEvent = e as KeyboardEvent;
        const key = keyboardEvent && keyboardEvent.key;
        let params: PopupEventParams;

        if (key === KeyCode.ENTER || key === KeyCode.SPACE) {
            params = { keyboardEvent };
        }

        hidePopup(params!);
        this.hidePopup = null;
    }

    private afterAction(action: FilterAction, event?: Event): void {
        const { params, applyActive } = this;
        const closeOnApply = params?.closeOnApply;
        switch (action) {
            case 'apply': {
                // Prevent form submission
                event?.preventDefault();
                if (closeOnApply && applyActive) {
                    this.close(event);
                }
                break;
            }
            case 'reset': {
                if (closeOnApply && applyActive) {
                    this.close();
                }
                break;
            }
            case 'cancel': {
                if (closeOnApply) {
                    this.close(event);
                }
                break;
            }
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!event.defaultPrevented && event.key === KeyCode.ENTER && this.applyActive) {
            // trigger apply. Can't do this via form submit as it will use click event, which prevents restoring focus on close
            this.updateModel(this.column, 'apply');
            this.afterAction('apply', event);
        }
    }

    public override destroy(): void {
        this.hidePopup = null;
        this.eButtons = this.destroyBean(this.eButtons);
    }
}
