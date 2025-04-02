import type { AgColumn } from '../entities/agColumn';
import type { FilterDestroyedEvent } from '../events';
import { _getDocument } from '../gridOptionsUtils';
import type { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import type { FilterWrapperParams, IFilterComp } from '../interfaces/iFilter';
import type { PopupEventParams } from '../interfaces/iPopup';
import { _clearElement, _removeFromParent } from '../utils/dom';
import { _exists, _jsonEquals } from '../utils/generic';
import { AgPromise } from '../utils/promise';
import { _warn } from '../validation/logging';
import { Component } from '../widgets/component';
import type {
    FilterActionEvent,
    FilterDisplayWrapper,
    FilterParamsChangedEvent,
    FilterStateChangedEvent,
} from './columnFilterService';
import type { FilterButtonEvent } from './filterButtonComp';
import { FilterButtonComp } from './filterButtonComp';
import type { FilterRequestSource } from './iColumnFilter';

export class FilterWrapperComp extends Component {
    private filterWrapper: AgPromise<FilterDisplayWrapper> | null = null;

    private eWrapper?: HTMLElement;
    private eButtonsPanel?: FilterButtonComp;
    private params?: FilterWrapperParams;
    private hidePopup: ((params: PopupEventParams) => void) | null | undefined = null;

    constructor(
        private readonly column: AgColumn,
        private readonly source: FilterRequestSource
    ) {
        super(/* html */ `<div class="ag-filter"></div>`);
    }

    public postConstruct(): void {
        this.createFilter(true);

        this.addManagedEventListeners({ filterDestroyed: this.onFilterDestroyed.bind(this) });
    }

    public hasFilter(): boolean {
        return this.filterWrapper != null;
    }

    public getFilter(): AgPromise<IFilterComp> | null {
        return this.filterWrapper?.then((wrapper) => wrapper!.comp as any) ?? null;
    }

    public afterInit(): AgPromise<void> {
        return this.filterWrapper?.then(() => {}) ?? AgPromise.resolve();
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (params) {
            this.hidePopup = params.hidePopup;
        }
        this.filterWrapper?.then((wrapper) => {
            wrapper?.comp?.afterGuiAttached?.(params);
        });
    }

    public afterGuiDetached(): void {
        this.filterWrapper?.then((wrapper) => {
            wrapper?.comp?.afterGuiDetached?.();
        });
    }

    private createFilter(init?: boolean): void {
        const { column, source } = this;
        const filterPromise = this.beans.colFilter?.getFilterUiForDisplay(column) ?? null;
        this.filterWrapper = filterPromise;
        filterPromise?.then((wrapper) => {
            if (!wrapper) {
                return;
            }
            const { isEvaluator, comp } = wrapper;
            let filterGui: HTMLElement;
            if (isEvaluator) {
                filterGui = this.createEvaluatorWrapper(wrapper);
            } else {
                filterGui = comp.getGui();

                if (!_exists(filterGui)) {
                    _warn(69, { guiFromFilter: filterGui });
                }
            }
            this.appendChild(filterGui);
            if (init) {
                this.eventSvc.dispatchEvent({
                    type: 'filterOpened',
                    column,
                    source,
                    eGui: this.getGui(),
                });
            }
        });
    }

    private createEvaluatorWrapper(wrapper: FilterDisplayWrapper): HTMLElement {
        const beans = this.beans;
        const { comp, params: originalParams } = wrapper;
        const params = originalParams as FilterWrapperParams;
        const useForm = params.useForm;
        const tag = useForm ? 'form' : 'div';
        const eDocument = _getDocument(beans);
        const eWrapper = eDocument.createElement(tag);
        eWrapper.className = 'ag-filter-wrapper';
        if (useForm) {
            this.addManagedElementListeners(eWrapper, { submit: (e) => e?.preventDefault() });
        }
        eWrapper.appendChild(comp.getGui());
        this.eWrapper = eWrapper;
        this.params = params;
        this.resetButtonsPanel(params);
        this.addManagedListeners(beans.colFilter!, {
            filterParamsChanged: (event: FilterParamsChangedEvent) => {
                const { column, params: eventParams } = event;
                if (column === this.column) {
                    this.resetButtonsPanel(eventParams as FilterWrapperParams, this.params);
                }
            },
            filterStateChanged: (event: FilterStateChangedEvent) => {
                const { column, state } = event;
                if (column === this.column) {
                    this.eButtonsPanel?.updateValidity(state.valid);
                }
            },
            filterAction: (event: FilterActionEvent) => {
                const { column, action, event: keyboardEvent, additionalEventAttributes } = event;
                if (column === this.column) {
                    this.eButtonsPanel?.performAction(action, keyboardEvent, additionalEventAttributes);
                }
            },
        });
        return eWrapper;
    }

    private resetButtonsPanel(newParams: FilterWrapperParams, oldParams?: FilterWrapperParams): void {
        const { buttons: oldButtons, readOnly: oldReadOnly } = oldParams ?? {};
        const { buttons, readOnly } = newParams;
        if (oldReadOnly === readOnly && _jsonEquals(oldButtons, buttons)) {
            return;
        }

        const hasButtons = buttons && buttons.length > 0 && !newParams.readOnly;

        let eButtonsPanel = this.eButtonsPanel;
        if (hasButtons) {
            if (!eButtonsPanel) {
                eButtonsPanel = this.createBean(new FilterButtonComp());
                this.eWrapper!.appendChild(eButtonsPanel.getGui());
                const colFilter = this.beans.colFilter;
                const column = this.column;
                eButtonsPanel?.addManagedListeners(eButtonsPanel, {
                    apply: ({ event, applyActive, additionalEventAttributes }: FilterButtonEvent) => {
                        // Prevent form submission
                        event?.preventDefault();
                        colFilter?.updateModel(column, 'apply', additionalEventAttributes);
                        if (this.params?.closeOnApply && applyActive) {
                            this.close(event);
                        }
                    },
                    clear: ({ additionalEventAttributes }) =>
                        colFilter?.updateModel(column, 'clear', additionalEventAttributes),
                    reset: ({ applyActive, additionalEventAttributes }: FilterButtonEvent) => {
                        colFilter?.updateModel(column, 'reset', additionalEventAttributes);
                        if (this.params?.closeOnApply && applyActive) {
                            this.close();
                        }
                    },
                    cancel: ({ event, additionalEventAttributes }: FilterButtonEvent) => {
                        colFilter?.updateModel(column, 'cancel', additionalEventAttributes);
                        if (this.params?.closeOnApply) {
                            this.close(event);
                        }
                    },
                });
                this.eButtonsPanel = eButtonsPanel;
            }
            eButtonsPanel.updateButtons(buttons);
        } else {
            if (eButtonsPanel) {
                _removeFromParent(eButtonsPanel.getGui());
                this.eButtonsPanel = this.destroyBean(eButtonsPanel);
            }
        }
    }

    private onFilterDestroyed(event: FilterDestroyedEvent): void {
        if (
            (event.source === 'api' || event.source === 'paramsUpdated') &&
            event.column.getId() === this.column.getId() &&
            this.beans.colModel.getColDefCol(this.column)
        ) {
            // filter has been destroyed by the API or params changing. If the column still exists, need to recreate UI component
            _clearElement(this.getGui());
            this.createFilter();
        }
    }

    private close(e?: Event): void {
        if (!this.hidePopup) {
            return;
        }

        const keyboardEvent = e as KeyboardEvent;
        const key = keyboardEvent && keyboardEvent.key;
        let params: PopupEventParams;

        if (key === 'Enter' || key === 'Space') {
            params = { keyboardEvent };
        }

        this.hidePopup(params!);
        this.hidePopup = null;
    }

    public override destroy(): void {
        this.filterWrapper = null;
        this.hidePopup = null;
        super.destroy();
    }
}
