import { Component } from "./component";
import { AutocompleteEntry, AutocompleteListParams } from "./autocompleteParams";
import { AgEvent } from "../events";
export interface AutocompleteValueChangedEvent extends AgEvent {
    value: string | null;
}
export interface AutocompleteValueConfirmedEvent extends AutocompleteValueChangedEvent {
    isValid: boolean;
}
export interface AutocompleteOptionSelectedEvent extends AutocompleteValueChangedEvent {
    position: number;
    updateEntry: AutocompleteEntry;
    autocompleteType?: string;
}
export interface AutocompleteValidChangedEvent extends AgEvent {
    isValid: boolean;
    validationMessage: string | null;
}
export declare class AgAutocomplete extends Component {
    static EVENT_VALUE_CHANGED: string;
    static EVENT_VALUE_CONFIRMED: string;
    static EVENT_OPTION_SELECTED: string;
    static EVENT_VALID_CHANGED: string;
    private popupService;
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
    private postConstruct;
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
