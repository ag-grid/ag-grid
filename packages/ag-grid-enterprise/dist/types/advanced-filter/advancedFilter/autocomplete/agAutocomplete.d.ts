import type { AgEvent, BeanCollection, ComponentSelector } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { AutocompleteEntry, AutocompleteListParams } from './autocompleteParams';
interface AutoCompleteEvent<T extends AgAutocompleteEvent> extends AgEvent<T> {
    value: string | null;
}
export interface AutocompleteValueChangedEvent extends AutoCompleteEvent<'eventValueChanged'> {
}
export interface AutocompleteValueConfirmedEvent extends AutoCompleteEvent<'eventValueConfirmed'> {
    isValid: boolean;
}
export interface AutocompleteOptionSelectedEvent extends AutoCompleteEvent<'eventOptionSelected'> {
    position: number;
    updateEntry: AutocompleteEntry;
    autocompleteType?: string;
}
export interface AutocompleteValidChangedEvent extends AgEvent<'eventValidChanged'> {
    isValid: boolean;
    validationMessage: string | null;
}
export type AgAutocompleteEvent = 'eventValueChanged' | 'eventValueConfirmed' | 'eventOptionSelected' | 'eventValidChanged';
export declare class AgAutocomplete extends Component<AgAutocompleteEvent> {
    private popupService;
    wireBeans(beans: BeanCollection): void;
    private eAutocompleteInput;
    private isListOpen;
    private autocompleteList;
    private hidePopup;
    private autocompleteListParams;
    private lastPosition;
    private valid;
    private validationMessage;
    private listAriaLabel;
    private listGenerator?;
    private validator?;
    private forceLastSelection?;
    constructor();
    postConstruct(): void;
    private onValueChanged;
    private updateValue;
    private updateAutocompleteList;
    private onKeyDown;
    private confirmSelection;
    private onTabKeyDown;
    private onEnterKeyDown;
    private onUpDownKeyDown;
    private onEscapeKeyDown;
    private onFocusOut;
    private updatePositionAndList;
    private setCaret;
    private forceOpenList;
    private updateLastPosition;
    private validate;
    private openList;
    private closeList;
    private onCompleted;
    getValue(): string | null;
    setInputPlaceholder(placeholder: string): this;
    setInputAriaLabel(label?: string | null): this;
    setListAriaLabel(label: string): this;
    setListGenerator(listGenerator?: (value: string | null, position: number) => AutocompleteListParams): this;
    setValidator(validator?: (value: string | null) => string | null): this;
    isValid(): boolean;
    setValue(params: {
        value: string;
        position?: number;
        silent?: boolean;
        updateListOnlyIfOpen?: boolean;
        restoreFocus?: boolean;
    }): void;
    setForceLastSelection(forceLastSelection?: (lastSelection: AutocompleteEntry, searchString: string) => boolean): this;
    setInputDisabled(disabled: boolean): this;
}
export declare const AgAutocompleteSelector: ComponentSelector;
export {};
