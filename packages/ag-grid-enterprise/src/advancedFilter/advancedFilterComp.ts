import type {
    BeanCollection,
    ElementParams,
    FilterAction,
    FilterButtonComp,
    FilterManager,
    ITooltipCtrl,
    Registry,
    TooltipFeature,
} from 'ag-grid-community';
import {
    AgFilterButtonSelector,
    Component,
    RefPlaceholder,
    _createIconNoSpan,
    _makeNull,
    _setDisabled,
    _setDisplayed,
} from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import type { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AdvancedFilterService } from './advancedFilterService';
import type {
    AgAutocomplete,
    AutocompleteOptionSelectedEvent,
    AutocompleteValidChangedEvent,
    AutocompleteValueChangedEvent,
    AutocompleteValueConfirmedEvent,
} from './autocomplete/agAutocomplete';
import { AgAutocompleteSelector } from './autocomplete/agAutocomplete';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import type { FilterExpressionParser } from './filterExpressionParser';
import type { AutocompleteUpdate } from './filterExpressionUtils';

const DEFAULT_ADVANCED_FILTER_PARAMS: { buttons: FilterAction[]; suppressBuilderButton: boolean } = {
    buttons: ['apply'],
    suppressBuilderButton: false,
};

const ButtonLocaleMap: Record<FilterAction, keyof typeof ADVANCED_FILTER_LOCALE_TEXT> = {
    apply: 'advancedFilterApply',
    clear: 'advancedFilterClear',
    cancel: 'advancedFilterCancel',
    reset: 'advancedFilterReset',
};

const AdvancedFilterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-advanced-filter',
    role: 'presentation',
    attrs: { tabindex: '-1' },
    children: [
        { tag: 'ag-autocomplete', ref: 'eAutocomplete' },
        {
            tag: 'ag-filter-button',
            ref: 'eButtons',
            cls: 'ag-advanced-filter-buttons',
        },
        {
            tag: 'button',
            ref: 'eBuilderFilterButton',
            cls: 'ag-button ag-advanced-filter-builder-button',
            children: [
                { tag: 'span', ref: 'eBuilderFilterButtonIcon', attrs: { 'aria-hidden': 'true' } },
                { tag: 'span', ref: 'eBuilderFilterButtonLabel', cls: 'ag-advanced-filter-builder-button-label' },
            ],
        },
    ],
};
export class AdvancedFilterComp extends Component {
    private advancedFilter: AdvancedFilterService;
    private advFilterExpSvc: AdvancedFilterExpressionService;
    private filterManager?: FilterManager;
    private registry: Registry;

    public wireBeans(beans: BeanCollection): void {
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
        this.advancedFilter = beans.advancedFilter as AdvancedFilterService;
        this.filterManager = beans.filterManager;
        this.registry = beans.registry;
    }

    private readonly eAutocomplete: AgAutocomplete = RefPlaceholder;
    private readonly eButtons: FilterButtonComp = RefPlaceholder;
    private readonly eBuilderFilterButton: HTMLElement = RefPlaceholder;
    private readonly eBuilderFilterButtonIcon: HTMLElement = RefPlaceholder;
    private readonly eBuilderFilterButtonLabel: HTMLElement = RefPlaceholder;

    private expressionParser: FilterExpressionParser | null = null;
    private isApplyDisabled = true;
    private builderOpen = false;
    private tooltipFeature?: TooltipFeature;

    constructor() {
        super(AdvancedFilterElement, [AgAutocompleteSelector, AgFilterButtonSelector]);
    }

    public postConstruct(): void {
        this.tooltipFeature = this.createOptionalManagedBean(
            this.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, {
                getGui: () => this.getGui(),
                getTooltipShowDelayOverride: () => 1000,
                getLocation: () => 'advancedFilter',
            } as ITooltipCtrl)
        );
        this.eAutocomplete
            .setListGenerator((_value, position) => this.generateAutocompleteListParams(position))
            .setValidator(() => this.validateValue())
            .setForceLastSelection((lastSelection, searchString) =>
                this.forceLastSelection(lastSelection, searchString)
            )
            .setInputAriaLabel(this.advFilterExpSvc.translate('ariaAdvancedFilterInput'))
            .setListAriaLabel(this.advFilterExpSvc.translate('ariaLabelAdvancedFilterAutocomplete'));

        this.refresh();

        this.addManagedListeners(this.eAutocomplete, {
            eventValueChanged: ({ value }: AutocompleteValueChangedEvent) => this.onValueChanged(value),
            eventValueConfirmed: ({ isValid }: AutocompleteValueConfirmedEvent) => this.onValueConfirmed(isValid),
            eventOptionSelected: ({ position, updateEntry, autocompleteType }: AutocompleteOptionSelectedEvent) =>
                this.onOptionSelected(position, updateEntry, autocompleteType),
            eventValidChanged: ({ isValid, validationMessage }: AutocompleteValidChangedEvent) =>
                this.onValidChanged(isValid, validationMessage),
        });

        const { buttons, suppressBuilderButton } = {
            ...DEFAULT_ADVANCED_FILTER_PARAMS,
            ...this.gos.get('advancedFilterParams'),
        };

        this.setupButtons(buttons);
        this.setupBuilderButton(suppressBuilderButton);

        this.beans.gos.addManagedPropertyListener('advancedFilterParams', (event) => {
            const currentValue = { ...DEFAULT_ADVANCED_FILTER_PARAMS, ...event.currentValue };
            const previousValue = { ...DEFAULT_ADVANCED_FILTER_PARAMS, ...event.previousValue };

            if (currentValue.buttons !== previousValue.buttons) {
                const buttons = currentValue.buttons.map((type) => ({
                    type,
                    label: this.advFilterExpSvc.translate(ButtonLocaleMap[type]),
                }));

                this.eButtons.updateButtons(buttons);
            }

            if (currentValue.suppressBuilderButton !== previousValue.suppressBuilderButton) {
                _setDisplayed(this.eBuilderFilterButton, !currentValue.suppressBuilderButton);
            }
        });
    }

    public refresh(): void {
        const expression = this.advancedFilter.getExpressionDisplayValue();
        this.eAutocomplete.setValue({
            value: expression ?? '',
            position: expression?.length,
            updateListOnlyIfOpen: true,
        });
    }

    public setInputDisabled(disabled: boolean): void {
        this.eAutocomplete.setInputDisabled(disabled);

        this.eButtons.updateValidity(
            !disabled && !this.isApplyDisabled && !this.advancedFilter.isCurrentExpressionApplied()
        );
    }

    private setupButtons(actions: FilterAction[]): void {
        const buttons = actions.map((type) => ({
            type,
            label: this.advFilterExpSvc.translate(ButtonLocaleMap[type]),
        }));

        const getListener = (action: FilterAction) => () => {
            this.updateModel(action);
        };
        this.eButtons.addManagedListeners(this.eButtons, {
            apply: getListener('apply'),
            clear: getListener('clear'),
            reset: getListener('reset'),
            cancel: getListener('cancel'),
        });

        this.eButtons.updateButtons(buttons);
    }

    private updateModel(action: FilterAction): void {
        switch (action) {
            case 'apply':
                this.onValueConfirmed(this.eAutocomplete.isValid());
                break;
            case 'reset':
                this.advancedFilter.setModel(null);
                this.filterManager?.onFilterChanged({ source: 'advancedFilter' });
                break;
            case 'cancel':
                this.advancedFilter.setModel(this.advancedFilter.getModel());
                this.filterManager?.onFilterChanged({ source: 'advancedFilter' });
                break;
            case 'clear':
                this.eAutocomplete.setValue({
                    value: '',
                    restoreFocus: true,
                });
                break;
        }
    }

    private setupBuilderButton(suppressed: boolean): void {
        this.eBuilderFilterButtonIcon.appendChild(_createIconNoSpan('advancedFilterBuilder', this.beans)!);
        this.eBuilderFilterButtonLabel.textContent = this.advFilterExpSvc.translate('advancedFilterBuilder');
        this.activateTabIndex([this.eBuilderFilterButton]);
        this.addManagedElementListeners(this.eBuilderFilterButton, { click: () => this.openBuilder() });
        this.addManagedListeners(this.advancedFilter.getCtrl(), {
            advancedFilterBuilderClosed: () => this.closeBuilder(),
        });

        _setDisplayed(this.eBuilderFilterButton, !suppressed);
    }

    private onValueChanged(value: string | null): void {
        value = _makeNull(value);
        this.advancedFilter.setExpressionDisplayValue(value);
        this.expressionParser = this.advancedFilter.createExpressionParser(value);
        const updatedExpression = this.expressionParser?.parseExpression();
        if (updatedExpression && updatedExpression !== value) {
            this.eAutocomplete.setValue({ value: updatedExpression, silent: true, restoreFocus: true });
        }
    }

    private onValueConfirmed(isValid: boolean): void {
        if (!isValid || this.isApplyDisabled) {
            return;
        }
        this.eButtons?.updateValidity(false);
        this.advancedFilter.applyExpression();
        this.filterManager?.onFilterChanged({ source: 'advancedFilter' });
    }

    private onOptionSelected(position: number, updateEntry: AutocompleteEntry, type?: string): void {
        const { updatedValue, updatedPosition, hideAutocomplete } = this.updateExpression(position, updateEntry, type);
        this.eAutocomplete.setValue({
            value: updatedValue,
            position: updatedPosition,
            updateListOnlyIfOpen: hideAutocomplete,
            restoreFocus: true,
        });
    }

    private validateValue(): string | null {
        return this.expressionParser?.isValid() ? null : this.expressionParser?.getValidationMessage() ?? null;
    }

    private onValidChanged(isValid: boolean, validationMessage: string | null): void {
        this.isApplyDisabled = !isValid || this.advancedFilter.isCurrentExpressionApplied();
        this.eButtons.updateValidity(!this.isApplyDisabled);
        this.tooltipFeature?.setTooltipAndRefresh(validationMessage);
    }

    private generateAutocompleteListParams(position: number): AutocompleteListParams {
        return this.expressionParser
            ? this.expressionParser.getAutocompleteListParams(position)
            : this.advFilterExpSvc.getDefaultAutocompleteListParams('');
    }

    private updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate {
        this.advFilterExpSvc.updateAutocompleteCache(updateEntry, type);
        return (
            this.expressionParser?.updateExpression(position, updateEntry, type) ??
            this.advancedFilter.getDefaultExpression(updateEntry)
        );
    }

    private forceLastSelection({ key, displayValue }: AutocompleteEntry, searchString: string): boolean {
        return !!searchString.toLocaleLowerCase().match(`^${(displayValue ?? key).toLocaleLowerCase()}\\s*$`);
    }

    private openBuilder(): void {
        if (this.builderOpen) {
            return;
        }
        this.builderOpen = true;
        _setDisabled(this.eBuilderFilterButton, true);
        this.advancedFilter.getCtrl().toggleFilterBuilder({ source: 'ui', eventSource: this.eBuilderFilterButton });
    }

    private closeBuilder(): void {
        if (!this.builderOpen) {
            return;
        }
        this.builderOpen = false;
        _setDisabled(this.eBuilderFilterButton, false);
        this.eBuilderFilterButton.focus();
    }
}
