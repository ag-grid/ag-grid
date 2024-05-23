import type { AgComponentSelector, FilterManager, ITooltipParams, WithoutGridCommon } from '@ag-grid-community/core';
import {
    Autowired,
    Component,
    RefPlaceholder,
    _createIconNoSpan,
    _makeNull,
    _setDisabled,
} from '@ag-grid-community/core';

import { AdvancedFilterCtrl } from './advancedFilterCtrl';
import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import type { AdvancedFilterService } from './advancedFilterService';
import type {
    AutocompleteOptionSelectedEvent,
    AutocompleteValidChangedEvent,
    AutocompleteValueChangedEvent,
    AutocompleteValueConfirmedEvent,
} from './autocomplete/agAutocomplete';
import { AgAutocomplete } from './autocomplete/agAutocomplete';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import type { FilterExpressionParser } from './filterExpressionParser';
import type { AutocompleteUpdate } from './filterExpressionUtils';

export class AdvancedFilterComp extends Component {
    static readonly selector: AgComponentSelector = 'AG-ADVANCED-FILTER';

    private readonly eAutocomplete: AgAutocomplete = RefPlaceholder;
    private readonly eApplyFilterButton: HTMLElement = RefPlaceholder;
    private readonly eBuilderFilterButton: HTMLElement = RefPlaceholder;
    private readonly eBuilderFilterButtonIcon: HTMLElement = RefPlaceholder;
    private readonly eBuilderFilterButtonLabel: HTMLElement = RefPlaceholder;
    @Autowired('advancedFilterService') private advancedFilterService: AdvancedFilterService;
    @Autowired('advancedFilterExpressionService')
    private advancedFilterExpressionService: AdvancedFilterExpressionService;
    @Autowired('filterManager') private filterManager: FilterManager;

    private expressionParser: FilterExpressionParser | null = null;
    private isApplyDisabled = true;
    private builderOpen = false;

    constructor() {
        super(
            /* html */ `
            <div class="ag-advanced-filter" role="presentation" tabindex="-1">
                <ag-autocomplete data-ref="eAutocomplete"></ag-autocomplete>
                <button class="ag-button ag-standard-button ag-advanced-filter-apply-button" data-ref="eApplyFilterButton"></button>
                <button class="ag-advanced-filter-builder-button" data-ref="eBuilderFilterButton">
                    <span data-ref="eBuilderFilterButtonIcon" aria-hidden="true"></span>
                    <span class="ag-advanced-filter-builder-button-label" data-ref="eBuilderFilterButtonLabel"></span>
                </button>
            </div>`,
            [AgAutocomplete]
        );
    }

    public postConstruct(): void {
        this.eAutocomplete
            .setListGenerator((_value, position) => this.generateAutocompleteListParams(position))
            .setValidator(() => this.validateValue())
            .setForceLastSelection((lastSelection, searchString) =>
                this.forceLastSelection(lastSelection, searchString)
            )
            .setInputAriaLabel(this.advancedFilterExpressionService.translate('ariaAdvancedFilterInput'))
            .setListAriaLabel(this.advancedFilterExpressionService.translate('ariaLabelAdvancedFilterAutocomplete'));

        this.refresh();

        this.addManagedListener(
            this.eAutocomplete,
            AgAutocomplete.EVENT_VALUE_CHANGED,
            ({ value }: AutocompleteValueChangedEvent) => this.onValueChanged(value)
        );
        this.addManagedListener(
            this.eAutocomplete,
            AgAutocomplete.EVENT_VALUE_CONFIRMED,
            ({ isValid }: AutocompleteValueConfirmedEvent) => this.onValueConfirmed(isValid)
        );
        this.addManagedListener(
            this.eAutocomplete,
            AgAutocomplete.EVENT_OPTION_SELECTED,
            ({ position, updateEntry, autocompleteType }: AutocompleteOptionSelectedEvent) =>
                this.onOptionSelected(position, updateEntry, autocompleteType)
        );
        this.addManagedListener(
            this.eAutocomplete,
            AgAutocomplete.EVENT_VALID_CHANGED,
            ({ isValid, validationMessage }: AutocompleteValidChangedEvent) =>
                this.onValidChanged(isValid, validationMessage)
        );

        this.setupApplyButton();
        this.setupBuilderButton();
    }

    public refresh(): void {
        const expression = this.advancedFilterService.getExpressionDisplayValue();
        this.eAutocomplete.setValue({
            value: expression ?? '',
            position: expression?.length,
            updateListOnlyIfOpen: true,
        });
    }

    public setInputDisabled(disabled: boolean): void {
        this.eAutocomplete.setInputDisabled(disabled);
        _setDisabled(this.eApplyFilterButton, disabled || this.isApplyDisabled);
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'advancedFilter';
        return res;
    }

    private setupApplyButton(): void {
        this.eApplyFilterButton.innerText = this.advancedFilterExpressionService.translate('advancedFilterApply');
        this.activateTabIndex([this.eApplyFilterButton]);
        this.addManagedListener(this.eApplyFilterButton, 'click', () =>
            this.onValueConfirmed(this.eAutocomplete.isValid())
        );
        _setDisabled(this.eApplyFilterButton, this.isApplyDisabled);
    }

    private setupBuilderButton(): void {
        this.eBuilderFilterButtonIcon.appendChild(_createIconNoSpan('advancedFilterBuilder', this.gos)!);
        this.eBuilderFilterButtonLabel.innerText =
            this.advancedFilterExpressionService.translate('advancedFilterBuilder');
        this.activateTabIndex([this.eBuilderFilterButton]);
        this.addManagedListener(this.eBuilderFilterButton, 'click', () => this.openBuilder());
        this.addManagedListener(this.advancedFilterService.getCtrl(), AdvancedFilterCtrl.EVENT_BUILDER_CLOSED, () =>
            this.closeBuilder()
        );
    }

    private onValueChanged(value: string | null): void {
        value = _makeNull(value);
        this.advancedFilterService.setExpressionDisplayValue(value);
        this.expressionParser = this.advancedFilterService.createExpressionParser(value);
        const updatedExpression = this.expressionParser?.parseExpression();
        if (updatedExpression && updatedExpression !== value) {
            this.eAutocomplete.setValue({ value: updatedExpression, silent: true, restoreFocus: true });
        }
    }

    private onValueConfirmed(isValid: boolean): void {
        if (!isValid || this.isApplyDisabled) {
            return;
        }
        _setDisabled(this.eApplyFilterButton, true);
        this.advancedFilterService.applyExpression();
        this.filterManager.onFilterChanged({ source: 'advancedFilter' });
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
        this.isApplyDisabled = !isValid || this.advancedFilterService.isCurrentExpressionApplied();
        _setDisabled(this.eApplyFilterButton, this.isApplyDisabled);
        this.setTooltip({
            newTooltipText: validationMessage,
            showDelayOverride: 1000,
        });
    }

    private generateAutocompleteListParams(position: number): AutocompleteListParams {
        return this.expressionParser
            ? this.expressionParser.getAutocompleteListParams(position)
            : this.advancedFilterExpressionService.getDefaultAutocompleteListParams('');
    }

    private updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate {
        this.advancedFilterExpressionService.updateAutocompleteCache(updateEntry, type);
        return (
            this.expressionParser?.updateExpression(position, updateEntry, type) ??
            this.advancedFilterService.getDefaultExpression(updateEntry)
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
        this.advancedFilterService.getCtrl().toggleFilterBuilder('ui');
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
